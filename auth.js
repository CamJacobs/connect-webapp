//Connects the app to our Firebase project using its settings.
firebase.initializeApp(firebaseConfig);
//Gets Firebase's login service and saves it as auth.
const auth = firebase.auth();

//Gets Firebase's database service and saves it as db.
const db = firebase.firestore();

//Reads a user's saved app data from the database, or null if they have none yet.
function loadUserData(uid) {
  return db.collection("users").doc(uid).get().then((snap) => (snap.exists ? snap.data() : null));
}

//Writes a user's app data to the database (JSON round-trip strips undefined values, which Firestore rejects).
function saveUserData(uid, data) {
  return db.collection("users").doc(uid).set(JSON.parse(JSON.stringify(data)));
}

//Shortcuts for Firestore references and values used by shared servers.
const serverDoc = (id) => db.collection("servers").doc(id);
const serverMessages = (id) => serverDoc(id).collection("messages");
const fieldValue = firebase.firestore.FieldValue;

//Looks up an invite code and returns { serverId, name }, or null if the code doesn't exist.
function getInvite(code) {
  return db.collection("invites").doc(code).get().then((snap) => (snap.exists ? snap.data() : null));
}

//Saves the invite code -> server link so other users can join with the code.
function setInvite(code, invite) {
  return db.collection("invites").doc(code).set(invite);
}

//Removes an invite code.
function deleteInvite(code) {
  return db.collection("invites").doc(code).delete();
}

//Creates a new shared server document (the creator is its host).
function createServerDoc(id, data) {
  return serverDoc(id).set(data);
}

//Reads a shared server document once (fails if the user isn't a member).
function getServerDoc(id) {
  return serverDoc(id).get();
}

//Changes fields on a shared server document. Dotted keys like "members.uid.role" update nested fields.
function updateServerDoc(id, fields) {
  return serverDoc(id).update(fields);
}

//Adds a user to a server as a regular member.
function joinServerDoc(id, uid, name, avatar) {
  return updateServerDoc(id, {
    ["members." + uid]: { name, avatar: avatar || "", role: "member" },
    memberUids: fieldValue.arrayUnion(uid),
  });
}

//Removes a user from a server (used for leaving and for kicking).
function removeServerMember(id, uid) {
  return updateServerDoc(id, {
    ["members." + uid]: fieldValue.delete(),
    memberUids: fieldValue.arrayRemove(uid),
  });
}

//Runs the callback whenever the server's name, channels, or members change.
function watchServer(id, onChange, onError) {
  return serverDoc(id).onSnapshot(onChange, onError);
}

//Runs the callback whenever messages in the server change (newest 300, oldest first).
function watchServerMessages(id, onChange, onError) {
  return serverMessages(id).orderBy("ts").limitToLast(300).onSnapshot(onChange, onError);
}

//Message helpers shared by servers (collection "servers") and direct messages (collection "dms").
const messagesOf = (collection, id) => db.collection(collection).doc(id).collection("messages");

//Posts a message.
function addMessage(collection, id, message) {
  return messagesOf(collection, id).add(message);
}

//Changes fields on one message (text edits, pins, thread replies).
function updateMessage(collection, id, messageId, fields) {
  return messagesOf(collection, id).doc(messageId).update(fields);
}

//Adds (add = true) or removes the user's emoji reaction on a message.
function toggleMessageReaction(collection, id, messageId, emoji, uid, add) {
  return messagesOf(collection, id).doc(messageId).update(
    new firebase.firestore.FieldPath("reactions", emoji),
    add ? fieldValue.arrayUnion(uid) : fieldValue.arrayRemove(uid),
  );
}

//Deletes one message.
function deleteMessage(collection, id, messageId) {
  return messagesOf(collection, id).doc(messageId).delete();
}

//Usernames: one document per username (stored in lowercase), so no two users can share one.
const usernameDoc = (name) => db.collection("usernames").doc(name.toLowerCase());

//Claims a username for the user. Resolves true if they own it now, false if someone else has it.
function claimUsername(uid, name) {
  const ref = usernameDoc(name);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) return snap.data().uid === uid;
    tx.set(ref, { uid });
    return true;
  });
}

//Gives up a username so someone else can use it.
function releaseUsername(name) {
  return usernameDoc(name).delete();
}

//User directory: lets people find each other by username.
const directory = () => db.collection("directory");

//Saves (or refreshes) the user's public name and picture.
function saveDirectoryEntry(uid, name, avatar) {
  return directory().doc(uid).set({ name, nameLower: name.toLowerCase(), avatar: avatar || "" });
}

//Finds users whose name starts with the text (case-insensitive).
async function searchDirectory(text, limit) {
  const start = text.toLowerCase();
  const snap = await directory().where("nameLower", ">=", start).where("nameLower", "<=", start + "").limit(limit).get();
  return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
}

//Friends: one document per pair of users. status is "pending" (waiting for the other person) or "accepted".
const friendDoc = (id) => db.collection("friends").doc(id);

//Runs the callback whenever a friend request or friendship involving the user changes.
function watchMyFriends(uid, onChange, onError) {
  return db.collection("friends").where("uids", "array-contains", uid).onSnapshot(onChange, onError);
}

//Sends a friend request (creates a pending friendship).
function createFriendRequest(id, data) {
  return friendDoc(id).set(data);
}

//Accepts a request someone sent to the user.
function acceptFriendRequest(id) {
  return friendDoc(id).update({ status: "accepted" });
}

//Declines or cancels a request, or ends a friendship.
function deleteFriendDoc(id) {
  return friendDoc(id).delete();
}

//Refreshes the names and pictures stored on a friendship.
function updateFriendDoc(id, fields) {
  return friendDoc(id).update(fields);
}

//Direct messages: one document per pair of users, with a messages subcollection.
const dmDoc = (id) => db.collection("dms").doc(id);

function dmIdFor(uidA, uidB) {
  return [uidA, uidB].sort().join("_");
}

//Creates the conversation if it doesn't exist yet, or refreshes the member names and pictures.
function ensureDmDoc(id, memberUids, members) {
  return dmDoc(id).set({ memberUids, members }, { merge: true });
}

//Updates conversation fields (last message time, member names and pictures).
function updateDmDoc(id, fields) {
  return dmDoc(id).update(fields);
}

//Runs the callback whenever any of the user's conversations change or a new one starts.
function watchMyDms(uid, onChange, onError) {
  return db.collection("dms").where("memberUids", "array-contains", uid).onSnapshot(onChange, onError);
}

//Runs the callback whenever messages in a conversation change (newest 300, oldest first).
function watchDmMessages(id, onChange, onError) {
  return messagesOf("dms", id).orderBy("ts").limitToLast(300).onSnapshot(onChange, onError);
}

//Deletes shared messages in batches. Pass a channelId to delete only that channel's messages.
async function deleteServerMessages(id, channelId) {
  const query = channelId ? serverMessages(id).where("channelId", "==", channelId) : serverMessages(id);
  const snap = await query.get();
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = db.batch();
    snap.docs.slice(i, i + 400).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

//Permanently deletes a shared server, its messages, and its invite code.
async function deleteServerCompletely(id, inviteCode) {
  await deleteInvite(inviteCode);
  await deleteServerMessages(id);
  await serverDoc(id).delete();
}

//Tells Firebase to keep the login for this browser tab, so a page refresh doesn't log the user out (closing the tab does).
const persistenceReady = auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

//Creates a function that logs a user in with an email and password.
function logIn(email, password) {
  //Waits for the "don't remember me" setting, then sends the email and password to Firebase.
  return persistenceReady.then(() => auth.signInWithEmailAndPassword(email, password));
}

//Creates a function that signs up a new user with an email and password.
function signUp(email, password) {
  //Waits for the "don't remember me" setting, then asks Firebase to create the account.
  return persistenceReady.then(() => auth.createUserWithEmailAndPassword(email, password));
}

//Creates a function that emails a password reset link to the given address.
function resetPassword(email) {
  //Asks Firebase to send the password reset email.
  return auth.sendPasswordResetEmail(email);
}

//Creates a function that logs the current user out.
function logOut() {
  //Tells Firebase to end the user's session.
  return auth.signOut();
}

//Creates a function that keeps track of whether a user is logged in.
function watchAuthState(callback) {
  //Runs the given code each time a user logs in or out, so the page can update.
  return auth.onAuthStateChanged(callback);
}
