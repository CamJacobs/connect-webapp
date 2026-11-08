const $ = (id) => document.getElementById(id);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function svgIcon(markup) {
  const template = document.createElement("template");
  template.innerHTML = markup.trim();
  return template.content.firstChild;
}

/* ---------- Elements ---------- */

const intro = $("intro");
const login = $("login");
const loginForm = $("login-form");
const loginView = $("login-view");
const signupView = $("signup-view");
const signupForm = $("signup-form");
const loggedInView = $("logged-in-view");
const loginError = $("login-error");
const signupError = $("signup-error");
const loginSubmit = $("login-submit");
const signupSubmit = $("signup-submit");
const logoutButton = $("logout-button");
const showSignupLink = $("show-signup");
const showLoginLink = $("show-login");
const forgotLink = $("forgot-link");

const railServers = $("rail-servers");
const dmButton = $("dm-button");
const dmBadge = $("dm-badge");
const addServerButton = $("add-server-button");
const dmPanel = $("dm-panel");
const serverPanel = $("server-panel");
const dmSearch = $("dm-search");
const dmSearchResults = $("dm-search-results");
const friendsShortcut = $("friends-shortcut");
const friendsPill = $("friends-pill");
const friendButton = $("friend-button");
const newDmButton = $("new-dm-button");
const dmList = $("dm-list");
const serverMenuTrigger = $("server-menu-trigger");
const serverNameText = $("server-name-text");
const inviteButton = $("invite-button");
const categoryToggle = $("category-toggle");
const createChannelButton = $("create-channel-button");
const channelItems = $("channel-items");
const serverMenu = $("server-menu");
const renameServerOption = $("rename-server-option");
const iconServerOption = $("icon-server-option");
const serverMenuSep = $("server-menu-sep");
const leaveServerOption = $("leave-server-option");
const userAvatar = $("user-avatar");
const userName = $("user-name");
const userStatus = $("user-status");
const settingsButton = $("settings-button");

const chatHeaderSymbol = $("chat-header-symbol");
const activeChannelName = $("active-channel-name");
const threadsButton = $("threads-button");
const muteButton = $("mute-button");
const pinnedButton = $("pinned-button");
const chatSearch = $("chat-search");
const threadsPopover = $("threads-popover");
const pinnedPopover = $("pinned-popover");
const emojiPopover = $("emoji-popover");
const gifPopover = $("gif-popover");
const gifForm = $("gif-form");
const gifInput = $("gif-input");
const emojiButton = $("emoji-button");
const gifButton = $("gif-button");
const messagesList = $("messages-list");
const messageForm = $("message-form");
const navToggle = $("nav-toggle");
const navBadge = $("nav-badge");
const navBackdrop = $("nav-backdrop");
const membersToggle = $("members-toggle");
const tabServers = $("tab-servers");
const tabMessages = $("tab-messages");
const tabFriends = $("tab-friends");
const tabMessagesBadge = $("tab-messages-badge");
const tabFriendsBadge = $("tab-friends-badge");
const messageInput = $("message-input");
const uploadImageButton = $("upload-image-button");
const imageUploadInput = $("image-upload-input");
const attachmentPreview = $("attachment-preview");
const attachmentPreviewImage = $("attachment-preview-image");
const attachmentRemove = $("attachment-remove");

const threadPanel = $("thread-panel");
const threadClose = $("thread-close");
const threadBody = $("thread-body");
const threadForm = $("thread-form");
const threadInput = $("thread-input");
const memberCategory = $("member-category");
const memberItems = $("member-items");

const dialogModal = $("dialog-modal");
const dialogTitle = $("dialog-title");
const dialogSubtitle = $("dialog-subtitle");
const dialogError = $("dialog-error");
const dialogForm = $("dialog-form");
const dialogFields = $("dialog-fields");
const dialogExtra = $("dialog-extra");
const dialogCancel = $("dialog-cancel");
const dialogSubmit = $("dialog-submit");
const addServerModal = $("add-server-modal");
const addServerCancel = $("add-server-cancel");
const chooseCreateButton = $("choose-create");
const chooseJoinButton = $("choose-join");
const joinServerModal = $("join-server-modal");
const joinServerForm = $("join-server-form");
const joinServerInput = $("join-server-input");
const joinServerError = $("join-server-error");
const joinServerBack = $("join-server-back");
const createServerModal = $("create-server-modal");
const createServerForm = $("create-server-form");
const createServerInput = $("create-server-input");
const createServerCancel = $("create-server-cancel");
const toastBox = $("toast");

intro.addEventListener("animationend", (e) => {
  if (e.target === intro) {
    intro.hidden = true;
    login.hidden = false;
  }
});

/* ---------- Staying on the same page after a refresh ---------- */

const SESSION_KEY = "connect:session";
const VIEW_KEY = "connect:view";

function storageSet(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (err) {
    // storage blocked: the app still works, it just won't remember the page
  }
}

function storageGet(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (err) {
    return null;
  }
}

function forgetSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(VIEW_KEY);
  } catch (err) {
    // nothing to clear
  }
}

function rememberView() {
  storageSet(VIEW_KEY, JSON.stringify({ uid: currentUid, type: view.type, serverId: view.serverId, dmId: view.dmId }));
}

function readSavedView(uid) {
  try {
    const saved = JSON.parse(storageGet(VIEW_KEY));
    return saved && saved.uid === uid ? saved : null;
  } catch (err) {
    return null;
  }
}

// If this tab was logged in before the refresh, skip the intro and wait for the login to be restored.
if (storageGet(SESSION_KEY) === "1") {
  intro.hidden = true;
  login.hidden = false;
  loginView.hidden = true;
  // If the login can't be restored (offline, expired), stop loading and show the login form
  setTimeout(() => {
    if (state) return;
    document.documentElement.classList.remove("restoring");
    loginView.hidden = false;
  }, 15000);
}

// Ends the loading screen shown during a refresh.
function finishRestoring() {
  document.documentElement.classList.remove("restoring");
}

/* ---------- Login / sign up ---------- */

const AUTH_ERROR_MESSAGES = {
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/missing-email": "Enter your email address first.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/email-already-in-use": "An account with that email already exists.",
  "auth/weak-password": "Password should be at least 6 characters.",
};

function showError(box, message) {
  box.classList.remove("info");
  box.textContent = message;
  box.hidden = false;
}

function showInfo(box, message) {
  box.classList.add("info");
  box.textContent = message;
  box.hidden = false;
}

function clearError(box) {
  box.classList.remove("info");
  box.hidden = true;
  box.textContent = "";
}

/* ---------- Usernames ---------- */

const USERNAME_PATTERN = /^[A-Za-z0-9_.]{3,20}$/;

// Returns a message describing what's wrong with the username, or "" if it's allowed.
function validateUsername(name) {
  if (!USERNAME_PATTERN.test(name)) return "Usernames are 3-20 characters: letters, numbers, _ or .";
  if (name.startsWith("__")) return "That username isn't allowed.";
  if (name.replace(/[_.]/g, "").toLowerCase() === "connectteam") return "That username is reserved.";
  return "";
}

// Turns any text (like the start of an email address) into something that passes validateUsername.
function sanitizeUsername(base) {
  let name = String(base || "").replace(/[^A-Za-z0-9_.]/g, "_").replace(/^_+/, "").slice(0, 20);
  if (name.length < 3) name = (name + "user").slice(0, Math.max(4, name.length));
  return validateUsername(name) ? "user" : name;
}

// Makes sure the user owns a unique username, picking a numbered variant if theirs is taken.
async function ensureUsername(uid, wanted) {
  const base = sanitizeUsername(wanted);
  let candidate = base;
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      if (await claimUsername(uid, candidate)) return candidate;
    } catch (err) {
      console.error("Username check failed:", err);
      return wanted;
    }
    candidate = base.slice(0, 16) + String(Math.floor(1000 + Math.random() * 9000));
  }
  return wanted;
}

// Pushes the user's current name and picture to everything other people see it in.
function syncProfileEverywhere() {
  const { name, avatar = "" } = state.profile;
  saveDirectoryEntry(currentUid, name, avatar).catch((err) => {
    // Without this entry nobody can find the user in search, so don't fail silently
    console.error("Couldn't add you to the user directory:", err);
    toast(`Others can't find you in search yet (${err.code || "error"}).`);
  });
  state.servers.filter((server) => server.shared).forEach((server) => {
    updateServerDoc(server.id, {
      [`members.${currentUid}.name`]: name,
      [`members.${currentUid}.avatar`]: avatar,
    }).catch(() => {});
  });
  state.dms.filter((dm) => dm.real).forEach((dm) => {
    updateDmDoc(dm.id, { [`members.${currentUid}`]: { name, avatar } }).catch(() => {});
  });
  friendDocs.forEach((doc) => {
    updateFriendDoc(doc.id, { [`members.${currentUid}`]: { name, avatar } }).catch(() => {});
  });
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError(loginError);

  const email = loginForm.email.value;
  const password = loginForm.password.value;

  loginSubmit.disabled = true;
  loginSubmit.textContent = "Logging in…";

  try {
    await logIn(email, password);
    loginForm.reset();
  } catch (err) {
    showError(loginError, AUTH_ERROR_MESSAGES[err.code] || "Something went wrong. Please try again.");
  } finally {
    loginSubmit.disabled = false;
    loginSubmit.textContent = "Log in";
  }
});

forgotLink.addEventListener("click", async (e) => {
  e.preventDefault();
  clearError(loginError);

  const email = loginForm.email.value.trim();
  if (!email) {
    showError(loginError, "Enter your email above, then click \"Forgot password?\" again.");
    return;
  }

  try {
    await resetPassword(email);
    showInfo(loginError, "Password reset email sent. Check your inbox.");
  } catch (err) {
    showError(loginError, AUTH_ERROR_MESSAGES[err.code] || "Couldn't send the reset email. Please try again.");
  }
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError(signupError);

  const email = signupForm.email.value;
  const password = signupForm.password.value;
  const confirmPassword = signupForm.confirmPassword.value;

  if (password !== confirmPassword) {
    showError(signupError, "Passwords don't match.");
    return;
  }

  signupSubmit.disabled = true;
  signupSubmit.textContent = "Creating account…";

  try {
    // The new account's username is picked automatically from the email once they're signed in
    await signUp(email, password);
    signupForm.reset();
  } catch (err) {
    showError(signupError, AUTH_ERROR_MESSAGES[err.code] || "Something went wrong. Please try again.");
  } finally {
    signupSubmit.disabled = false;
    signupSubmit.textContent = "Sign up";
  }
});

showSignupLink.addEventListener("click", (e) => {
  e.preventDefault();
  clearError(loginError);
  loginForm.reset();
  loginView.hidden = true;
  signupView.hidden = false;
});

showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  clearError(signupError);
  signupForm.reset();
  signupView.hidden = true;
  loginView.hidden = false;
});

logoutButton.addEventListener("click", () => {
  logOut();
});

function setUpPasswordToggle(inputId, buttonId) {
  const input = $(inputId);
  const button = $(buttonId);
  const iconEye = button.querySelector(".icon-eye");
  const iconEyeOff = button.querySelector(".icon-eye-off");

  button.addEventListener("click", () => {
    const willShow = input.type === "password";
    input.type = willShow ? "text" : "password";
    iconEye.hidden = willShow;
    iconEyeOff.hidden = !willShow;
    button.setAttribute("aria-pressed", String(willShow));
    button.setAttribute("aria-label", willShow ? "Hide password" : "Show password");
  });
}

setUpPasswordToggle("password-input", "toggle-password");
setUpPasswordToggle("signup-password-input", "signup-toggle-password");
setUpPasswordToggle("signup-confirm-input", "signup-confirm-toggle");

/* ---------- App data ---------- */

const BOT_COLORS = ["var(--brand-purple)", "var(--brand-blue)", "var(--brand-pink)", "var(--brand-orange)"];
const DEMO_SERVERS = { CODERS: "Coders Club", GAMING: "Game Night" };
const STATUSES = { online: "Online", idle: "Idle", dnd: "Do Not Disturb", invisible: "Invisible" };
const CANNED_REPLIES = [
  "Haha, nice!",
  "Got it 👍",
  "Tell me more.",
  "Sounds good to me.",
  "I'll look into it.",
  "Interesting, go on!",
  "👀",
  "Thanks for the message!",
];
const EMOJIS = "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 😉 😍 🥰 😘 😎 🤩 🥳 😏 😌 🤔 🤨 😐 😴 😢 😭 😤 😡 🤯 😱 🥺 👍 👎 👏 🙌 🙏 💪 👀 🔥 ✨ 🎉 💯 ❤️ 💔 ⭐ ✅ ❌ 🚀".split(" ");

const ICONS = {
  pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5M9 3h6l-1 7 4 3H6l4-3-1-7Z"/></svg>',
  thread: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-4-1L3 20l1-5.5a8.38 8.38 0 0 1-1-4A8.5 8.5 0 0 1 11.5 3 8.38 8.38 0 0 1 21 11.5Z"/></svg>',
  edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  react: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg>',
};

let state = null;
let currentUid = null;
let currentEmail = "";
let view = { type: "dm", serverId: null, dmId: null };
let lastDmId = null;
let searchQuery = "";
let openThreadId = null;
let pendingImage = null;
let editingId = null;
let editDraft = "";
let toastTimer = null;

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function makeMsg(author, color, text, extra = {}) {
  return { id: uid(), author, color, text, ts: Date.now(), ...extra };
}

function makeChannel(name, messages) {
  return { id: uid(), name, messages, muted: false };
}

function makeServer(name, inviteCode, channelDefs) {
  const channels = channelDefs.map(([channelName, messages]) => makeChannel(channelName, messages));
  return { id: uid(), name, inviteCode, channels, activeChannelId: channels[0].id, collapsed: false };
}

function makeDm(name, color, messages = []) {
  return { id: uid(), name, color, messages, muted: false, unread: 0 };
}

function makeTeamServer() {
  return makeServer("Connect Team", "TEAM", [
    ["general", [
      makeMsg("TestBot 1", BOT_COLORS[0], "Hey! Welcome to Connect 👋"),
      makeMsg("TestBot 2", BOT_COLORS[1], "This is the general channel for anything."),
    ]],
    ["announcements", [
      makeMsg("TestBot 2", BOT_COLORS[1], "This is the channel for important announcements."),
    ]],
  ]);
}

function defaultState(email) {
  return {
    profile: { name: email.split("@")[0], status: "online" },
    hiddenDms: {},
    servers: [],
    dms: [
      {
        ...makeDm("Connect Team", BOT_COLORS[2], [
          makeMsg(
            "Connect Team",
            BOT_COLORS[2],
            "Welcome to Connect! Thank you for using our web app. Create a server or join one with an invite code to get started.",
          ),
        ]),
        system: true,
      },
    ],
  };
}

async function loadState(uid, email) {
  try {
    const parsed = await loadUserData(uid);
    if (parsed && parsed.profile && Array.isArray(parsed.servers) && Array.isArray(parsed.dms)) {
      parsed.hiddenDms = parsed.hiddenDms || {};
      return parsed;
    }
  } catch (err) {
    toast("Couldn't load your data from the database.");
  }
  return defaultState(email);
}

// Shared servers live in Firestore (servers/{id}); a user's own data only remembers which ones
// they joined plus personal view settings. Local demo servers are still saved in full.
function persistableState() {
  return {
    profile: state.profile,
    hiddenDms: state.hiddenDms,
    // Real conversations live in Firestore (dms/{id}); only personal settings are kept here
    dms: state.dms.map((dm) => {
      if (!dm.real) return dm;
      return { id: dm.id, real: true, peerUid: dm.peerUid, name: dm.name, muted: dm.muted, lastReadTs: dm.lastReadTs, clearedTs: dm.clearedTs };
    }),
    servers: state.servers.map((server) => {
      if (!server.shared) return server;
      return {
        id: server.id,
        shared: true,
        activeChannelId: server.activeChannelId,
        collapsed: server.collapsed,
        mutedChannels: server.ready ? server.channels.filter((c) => c.muted).map((c) => c.id) : server.mutedChannels,
        channelReads: server.channelReads,
        trackFrom: server.trackFrom,
      };
    }),
  };
}

let saveTimer = null;

function save() {
  if (!state || !currentUid) return;
  // Batch rapid changes into one write
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (!state || !currentUid) return;
    saveUserData(currentUid, persistableState()).catch(() => toast("Couldn't save to the database."));
  }, 400);
}

/* ---------- Shared servers (live from Firestore) ---------- */

const serverListeners = {};

function hydrateServer(id, prefs = {}) {
  return {
    id,
    shared: true,
    ready: false,
    openOnReady: false,
    leaving: false,
    name: "",
    icon: "",
    inviteCode: "",
    hostUid: "",
    members: {},
    channelDefs: [],
    allMessages: [],
    channels: [],
    activeChannelId: prefs.activeChannelId || null,
    collapsed: Boolean(prefs.collapsed),
    mutedChannels: prefs.mutedChannels || [],
    channelReads: prefs.channelReads || {},
    trackFrom: prefs.trackFrom || UNREAD_TRACKING_START,
    messagesLoaded: false,
  };
}

// Messages sent before this time never count as unread for servers joined before server unread badges existed.
const UNREAD_TRACKING_START = 1793642403028;

function rebuildChannels(server) {
  const previous = new Map(server.channels.map((channel) => [channel.id, channel]));
  server.channels = server.channelDefs.map((def) => ({
    id: def.id,
    name: def.name,
    muted: previous.has(def.id) ? previous.get(def.id).muted : server.mutedChannels.includes(def.id),
    messages: server.allMessages.filter((msg) => msg.channelId === def.id),
  }));
  if (!server.channels.some((channel) => channel.id === server.activeChannelId) && server.channels.length) {
    server.activeChannelId = server.channels[0].id;
  }
  recountServerUnread(server);
}

// Counts each channel's messages from other people that arrived after the user last had it open.
function recountServerUnread(server) {
  if (!server.shared || !server.ready || !server.messagesLoaded) return;
  const viewing = view.type === "server" && view.serverId === server.id;
  let changed = false;
  server.channels.forEach((channel) => {
    const latest = channel.messages.length ? channel.messages[channel.messages.length - 1].ts : 0;
    // A channel that was never opened counts messages from after the user joined (trackFrom).
    const readUpTo = server.channelReads[channel.id] ?? server.trackFrom;
    if (viewing && channel.id === server.activeChannelId && latest > readUpTo) {
      server.channelReads[channel.id] = latest;
      changed = true;
      channel.unread = 0;
      return;
    }
    channel.unread = channel.messages.filter((msg) => msg.authorUid !== currentUid && msg.ts > readUpTo).length;
  });
  if (changed) save();
}

function serverUnread(server) {
  if (!server.shared) return 0;
  return server.channels.reduce((sum, channel) => sum + (channel.muted ? 0 : channel.unread || 0), 0);
}

function sharedServerById(id) {
  return (state && state.servers.find((server) => server.id === id && server.shared)) || null;
}

function refreshServerViews(id) {
  if (!state) return;
  renderRail();
  if (view.type !== "server" || view.serverId !== id) return;
  const nearBottom = messagesList.scrollHeight - messagesList.scrollTop - messagesList.clientHeight < 80;
  renderSidebar();
  renderHeader();
  renderMembers();
  refreshChat({ keepScroll: !nearBottom });
}

function detachServer(id) {
  (serverListeners[id] || []).forEach((unsubscribe) => unsubscribe());
  delete serverListeners[id];
}

function detachAllServers() {
  Object.keys(serverListeners).forEach(detachServer);
}

// Removes a shared server from this user's app (left, kicked, or deleted by the host).
function dropServer(id, message) {
  detachServer(id);
  const server = state && state.servers.find((item) => item.id === id);
  if (!server || server.leaving) return;
  state.servers = state.servers.filter((item) => item.id !== id);
  save();
  if (view.type === "server" && view.serverId === id) openDmHome();
  else renderAll();
  if (message) toast(message);
}

function onServerSnapshot(id, snap) {
  const server = sharedServerById(id);
  if (!server) {
    detachServer(id);
    return;
  }
  const data = snap.exists ? snap.data() : null;
  if (!data || !(data.memberUids || []).includes(currentUid)) {
    dropServer(id, data ? "You were removed from that server." : "That server was deleted.");
    return;
  }

  server.name = data.name;
  server.icon = data.icon || "";
  server.inviteCode = data.inviteCode;
  server.hostUid = data.hostUid;
  server.members = data.members || {};
  server.channelDefs = data.channels || [];
  server.ready = true;
  rebuildChannels(server);

  if (server.openOnReady) {
    server.openOnReady = false;
    openServer(id);
    return;
  }
  refreshServerViews(id);
}

function onMessagesSnapshot(id, snap) {
  const server = sharedServerById(id);
  if (!server) {
    detachServer(id);
    return;
  }
  server.allMessages = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  server.messagesLoaded = true;
  rebuildChannels(server);
  if (server.ready) refreshServerViews(id);
}

function attachServer(server) {
  detachServer(server.id);
  serverListeners[server.id] = [
    watchServer(server.id, (snap) => onServerSnapshot(server.id, snap), () => dropServer(server.id, "You no longer have access to that server.")),
    watchServerMessages(server.id, (snap) => onMessagesSnapshot(server.id, snap), () => {}),
  ];
}

/* ---------- Real direct messages (live from Firestore) ---------- */

const dmListeners = {};
let inboxUnsubscribe = null;

function colorForUid(uid) {
  let hash = 0;
  for (const ch of uid) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return BOT_COLORS[hash % BOT_COLORS.length];
}

function hydrateDm(prefs) {
  return {
    id: prefs.id,
    real: true,
    peerUid: prefs.peerUid,
    name: prefs.name || "User",
    avatar: "",
    color: colorForUid(prefs.peerUid),
    muted: Boolean(prefs.muted),
    unread: 0,
    lastReadTs: prefs.lastReadTs || 0,
    clearedTs: prefs.clearedTs || 0,
    messages: [],
  };
}

function realDmById(id) {
  return (state && state.dms.find((dm) => dm.id === id && dm.real)) || null;
}

function markDmRead(dm) {
  const latest = dm.messages.length ? dm.messages[dm.messages.length - 1].ts : 0;
  if (latest > dm.lastReadTs) {
    dm.lastReadTs = latest;
    save();
  }
  dm.unread = 0;
}

// Messages from the other person that arrived after the last time this conversation was open.
function recountDmUnread(dm) {
  if (view.type === "dm" && view.dmId === dm.id) {
    markDmRead(dm);
    return;
  }
  dm.unread = dm.messages.filter((msg) => msg.authorUid !== currentUid && msg.ts > dm.lastReadTs).length;
}

function onDmMessages(id, snap) {
  const dm = realDmById(id);
  if (!dm) {
    detachDm(id);
    return;
  }
  dm.messages = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((msg) => msg.ts > dm.clearedTs);
  recountDmUnread(dm);

  renderRail();
  renderSidebar();
  if (view.type === "dm" && view.dmId === dm.id) {
    const nearBottom = messagesList.scrollHeight - messagesList.scrollTop - messagesList.clientHeight < 80;
    refreshChat({ keepScroll: !nearBottom });
  }
}

function attachDm(dm) {
  detachDm(dm.id);
  dmListeners[dm.id] = watchDmMessages(dm.id, (snap) => onDmMessages(dm.id, snap), () => {});
}

function detachDm(id) {
  if (dmListeners[id]) dmListeners[id]();
  delete dmListeners[id];
}

// Watches all of the user's conversations, so a chat started by someone else shows up on its own.
function onInbox(snap) {
  if (!state) return;
  snap.docChanges().forEach((change) => {
    if (change.type === "removed") return;
    const id = change.doc.id;
    const data = change.doc.data();
    const peerUid = (data.memberUids || []).find((uid) => uid !== currentUid);
    if (!peerUid) return;
    const peer = (data.members || {})[peerUid] || {};

    const existing = realDmById(id);
    if (existing) {
      existing.name = peer.name || existing.name;
      existing.avatar = peer.avatar || "";
      return;
    }

    // Conversations nobody has written in yet stay out of the list; deleted ones return only when there's something new
    const hiddenAt = state.hiddenDms[id] || 0;
    if (!data.lastMessageTs || data.lastMessageTs <= hiddenAt) return;

    const dm = hydrateDm({ id, peerUid, name: peer.name, clearedTs: hiddenAt });
    dm.avatar = peer.avatar || "";
    delete state.hiddenDms[id];
    state.dms.push(dm);
    attachDm(dm);
    save();
  });
  renderRail();
  renderSidebar();
}

function startInbox() {
  if (inboxUnsubscribe) inboxUnsubscribe();
  inboxUnsubscribe = watchMyDms(currentUid, onInbox, () => {});
}

function detachAllDms() {
  Object.keys(dmListeners).forEach(detachDm);
  if (inboxUnsubscribe) inboxUnsubscribe();
  inboxUnsubscribe = null;
}

// Opens the conversation with a user found in the directory, creating it if needed.
async function openDirectChat(person) {
  if (person.uid === currentUid) {
    toast("That's you!");
    return;
  }
  const id = dmIdFor(currentUid, person.uid);
  let dm = realDmById(id);
  if (!dm) {
    try {
      await ensureDmDoc(id, [currentUid, person.uid].sort(), {
        [currentUid]: { name: state.profile.name, avatar: state.profile.avatar || "" },
        [person.uid]: { name: person.name, avatar: person.avatar || "" },
      });
    } catch (err) {
      console.error("Start chat failed:", err);
      toast("Couldn't start that conversation.");
      return;
    }
    if (!state) return;
    dm = realDmById(id);
    if (!dm) {
      dm = hydrateDm({ id, peerUid: person.uid, name: person.name, clearedTs: state.hiddenDms[id] || 0 });
      dm.avatar = person.avatar || "";
      delete state.hiddenDms[id];
      state.dms.push(dm);
      attachDm(dm);
      save();
    }
  }
  openDm(dm.id);
}

// Finds a user whose name matches exactly (ignoring capitals).
async function findUserByName(name) {
  const lower = name.trim().toLowerCase();
  const matches = await searchDirectory(lower, 8);
  return matches.find((person) => person.nameLower === lower && person.uid !== currentUid) || null;
}

function startChatWithName(name) {
  findUserByName(name)
    .then((person) => (person ? openDirectChat(person) : toast(`No user named "${name.trim()}".`)))
    .catch(() => toast("Couldn't look that user up."));
}

/* ---------- Friends & friend requests (live from Firestore) ---------- */

let friendDocs = [];
let friendsUnsubscribe = null;
let friendsLoaded = false;

// The other person in a friendship document.
function friendOf(doc) {
  const uid = doc.uids.find((id) => id !== currentUid);
  const info = (doc.members || {})[uid] || {};
  return { uid, name: info.name || "User", avatar: info.avatar || "" };
}

const acceptedFriends = () => friendDocs.filter((doc) => doc.status === "accepted");
const incomingRequests = () => friendDocs.filter((doc) => doc.status === "pending" && doc.requester !== currentUid);
const outgoingRequests = () => friendDocs.filter((doc) => doc.status === "pending" && doc.requester === currentUid);

function friendDocWith(uid) {
  return friendDocs.find((doc) => doc.id === dmIdFor(currentUid, uid)) || null;
}

// "friends", "incoming" (they asked you), "outgoing" (you asked them), or "none".
function friendStatusWith(uid) {
  const doc = friendDocWith(uid);
  if (!doc) return "none";
  if (doc.status === "accepted") return "friends";
  return doc.requester === currentUid ? "outgoing" : "incoming";
}

function refreshFriendViews() {
  if (!state) return;
  renderRail();
  renderSidebar();
  renderHeader();
  if (view.type === "friends") renderMessages();
}

function onFriendsSnapshot(snap) {
  if (!state) return;
  friendDocs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Tell the user when a new request arrives (not for the ones that were already waiting at login)
  if (friendsLoaded) {
    snap.docChanges().forEach((change) => {
      const doc = change.doc.data();
      if (change.type === "added" && doc.status === "pending" && doc.requester !== currentUid) {
        toast(`${friendOf({ ...doc, id: change.doc.id }).name} sent you a friend request.`);
      }
    });
  }
  friendsLoaded = true;
  refreshFriendViews();
}

function startFriends() {
  stopFriends();
  friendsUnsubscribe = watchMyFriends(currentUid, onFriendsSnapshot, () => {});
}

function stopFriends() {
  if (friendsUnsubscribe) friendsUnsubscribe();
  friendsUnsubscribe = null;
  friendDocs = [];
  friendsLoaded = false;
}

async function sendFriendRequest(person) {
  if (person.uid === currentUid) {
    toast("That's you!");
    return;
  }
  const existing = friendDocWith(person.uid);
  if (existing) {
    if (existing.status === "accepted") toast(`You're already friends with ${person.name}.`);
    else if (existing.requester === currentUid) toast(`You already sent ${person.name} a friend request.`);
    else acceptRequest(existing); // they already asked you, so this makes you friends
    return;
  }

  try {
    await createFriendRequest(dmIdFor(currentUid, person.uid), {
      uids: [currentUid, person.uid].sort(),
      requester: currentUid,
      status: "pending",
      createdAt: Date.now(),
      members: {
        [currentUid]: { name: state.profile.name, avatar: state.profile.avatar || "" },
        [person.uid]: { name: person.name, avatar: person.avatar || "" },
      },
    });
    toast(`Friend request sent to ${person.name}.`);
  } catch (err) {
    console.error("Friend request failed:", err);
    toast("Couldn't send the friend request.");
  }
}

function acceptRequest(doc) {
  acceptFriendRequest(doc.id)
    .then(() => toast(`You and ${friendOf(doc).name} are now friends.`))
    .catch(() => toast("Couldn't accept that request."));
}

function declineRequest(doc, message) {
  deleteFriendDoc(doc.id)
    .then(() => message && toast(message))
    .catch(() => toast("Couldn't update that request."));
}

function sendRequestToName(name) {
  findUserByName(name)
    .then((person) => (person ? sendFriendRequest(person) : toast(`No user named "${name.trim()}".`)))
    .catch(() => toast("Couldn't look that user up."));
}

function confirmRemoveFriend(doc) {
  const friend = friendOf(doc);
  confirmDialog({
    title: `Remove ${friend.name} as a friend?`,
    subtitle: "You'll stop being friends. Your direct messages stay as they are.",
    confirmLabel: "Remove",
    onConfirm: () => declineRequest(doc, `Removed ${friend.name} from your friends.`),
  });
}

/* ---------- Roles ---------- */

function myRole(server) {
  const member = server.members && server.members[currentUid];
  return member ? member.role : null;
}

// Local demo servers have no roles, so the user has full control of them.
function isHost(server) {
  return !server.shared || myRole(server) === "host";
}

function isStaff(server) {
  return !server.shared || myRole(server) === "host" || myRole(server) === "mod";
}

// Host can manage everyone except themselves; mods can only manage regular members.
function canManageMember(server, uid) {
  const target = server.members[uid];
  if (!target || uid === currentUid) return false;
  if (isHost(server)) return true;
  return myRole(server) === "mod" && target.role === "member";
}

function toast(message) {
  toastBox.textContent = message;
  toastBox.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastBox.hidden = true;
  }, 2600);
}

/* ---------- Helpers ---------- */

function initialsFor(name) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function avatarText(name) {
  const words = name.trim().split(/\s+/);
  const last = words[words.length - 1];
  if (words.length > 1 && /^\d+$/.test(last)) return (words[0][0] + last).toUpperCase().slice(0, 3);
  return initialsFor(name);
}

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function dayLabel(ts) {
  const day = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (day.toDateString() === today.toDateString()) return "Today";
  if (day.toDateString() === yesterday.toDateString()) return "Yesterday";
  return day.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
}

function snippet(msg) {
  const text = msg.text || "[image]";
  return text.length > 80 ? text.slice(0, 80) + "…" : text;
}

function isOwn(msg) {
  return Boolean(msg.own) || (Boolean(msg.authorUid) && msg.authorUid === currentUid);
}

function displayAuthor(msg) {
  return isOwn(msg) ? state.profile.name : msg.author;
}

// Profile pictures and server icons are small resized images stored as data URLs.
const SAFE_IMAGE = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/;

// The official "Connect Team" account always uses the Connect logo as its picture.
const TEAM_NAME = "Connect Team";
const TEAM_LOGO = "assets/logo-c.png";

function applyAvatar(node, src) {
  if (src === TEAM_LOGO) {
    node.style.backgroundColor = "#0a0710";
    node.style.backgroundImage = `url("${TEAM_LOGO}")`;
    node.style.backgroundSize = "68%";
    node.style.backgroundRepeat = "no-repeat";
    node.style.backgroundPosition = "center";
    node.textContent = "";
    return true;
  }
  if (!src || !SAFE_IMAGE.test(src)) return false;
  node.style.backgroundImage = `url("${src}")`;
  node.style.backgroundSize = "cover";
  node.style.backgroundPosition = "center";
  node.textContent = "";
  return true;
}

// Real users can't get the Connect logo: only the built-in (local) Connect Team chat uses it
function dmAvatar(dm) {
  if (dm.real) return dm.avatar || "";
  return dm.name === TEAM_NAME ? TEAM_LOGO : "";
}

function avatarFor(msg) {
  if (isOwn(msg)) return state.profile.avatar || "";
  const dm = view.type === "dm" ? currentDm() : null;
  if (dm) return dm.real ? dm.avatar || "" : msg.author === TEAM_NAME ? TEAM_LOGO : "";
  const server = view.type === "server" ? currentServer() : null;
  const member = server && server.shared && msg.authorUid ? server.members[msg.authorUid] : null;
  return (member && member.avatar) || "";
}

function currentServer() {
  return state.servers.find((server) => server.id === view.serverId) || null;
}

function currentDm() {
  return state.dms.find((dm) => dm.id === view.dmId) || null;
}

function currentConversation() {
  if (view.type === "server") {
    const server = currentServer();
    const channel = server && server.channels.find((c) => c.id === server.activeChannelId);
    return channel ? { kind: "channel", ref: channel, messages: channel.messages, label: `#${channel.name}` } : null;
  }
  if (view.type === "dm") {
    const dm = currentDm();
    return dm ? { kind: "dm", ref: dm, messages: dm.messages, label: `@${dm.name}` } : null;
  }
  return null;
}

function totalUnread() {
  return state.dms.reduce((sum, dm) => sum + (dm.muted ? 0 : dm.unread || 0), 0);
}

/* ---------- Rendering ---------- */

function renderAll() {
  if (!state) return;
  rememberView();
  renderRail();
  renderSidebar();
  renderHeader();
  renderMessages();
  renderMembers();
  renderUser();
  renderThread();
}

function renderRail() {
  railServers.replaceChildren();
  state.servers.filter((server) => !server.shared || server.ready).forEach((server) => {
    const button = el("button", "server-icon workspace");
    button.type = "button";
    button.dataset.tooltip = server.name;
    button.setAttribute("aria-label", server.name);
    if (view.type === "server" && view.serverId === server.id) button.classList.add("selected");
    button.append(el("span", "pill"));
    if (server.icon && SAFE_IMAGE.test(server.icon)) {
      const icon = el("img");
      icon.src = server.icon;
      icon.alt = "";
      button.append(icon);
    } else {
      button.append(document.createTextNode(initialsFor(server.name)));
    }
    const serverCount = serverUnread(server);
    if (serverCount) button.append(el("span", "badge", serverCount > 99 ? "99+" : String(serverCount)));
    button.addEventListener("click", () => openServer(server.id));
    railServers.append(button);
  });

  dmButton.classList.toggle("selected", view.type !== "server");
  // The badge counts unread DMs plus friend requests waiting for an answer
  const unread = totalUnread() + incomingRequests().length;
  dmBadge.hidden = unread === 0;
  dmBadge.textContent = unread > 99 ? "99+" : String(unread);
  const allUnread = unread + state.servers.reduce((sum, server) => sum + serverUnread(server), 0);
  document.title = allUnread ? `(${allUnread}) Connect` : "Connect";
  // On phones the rail is tucked away, so the menu button carries the total.
  navBadge.hidden = allUnread === 0;
  navBadge.textContent = allUnread > 99 ? "99+" : String(allUnread);

  // Bottom tabs on phones: highlight the section you're in and show the same counts
  const dmUnread = totalUnread();
  const requests = incomingRequests().length;
  tabMessagesBadge.hidden = dmUnread === 0;
  tabMessagesBadge.textContent = dmUnread > 99 ? "99+" : String(dmUnread);
  tabFriendsBadge.hidden = requests === 0;
  tabFriendsBadge.textContent = String(requests);
  tabServers.classList.toggle("selected", view.type === "server");
  tabMessages.classList.toggle("selected", view.type === "dm");
  tabFriends.classList.toggle("selected", view.type === "friends");
}

function renderSidebar() {
  const inServer = view.type === "server";
  dmPanel.hidden = inServer;
  serverPanel.hidden = !inServer;

  if (inServer) {
    const server = currentServer();
    if (!server) return;
    serverNameText.textContent = server.name;
    categoryToggle.setAttribute("aria-expanded", String(!server.collapsed));
    categoryToggle.classList.toggle("collapsed", server.collapsed);
    channelItems.hidden = server.collapsed;
    const staff = isStaff(server);
    inviteButton.hidden = !staff;
    createChannelButton.hidden = !staff;
    channelItems.replaceChildren();
    server.channels.forEach((channel) => {
      const item = el("button", "channel-item");
      item.type = "button";
      item.classList.toggle("active", channel.id === server.activeChannelId);
      item.classList.toggle("muted", channel.muted);
      item.append(el("span", "channel-hash", "#"), document.createTextNode(channel.name));
      if (channel.unread && !channel.muted) item.append(el("span", "unread-pill", String(channel.unread)));
      item.addEventListener("click", () => openChannel(channel.id));
      if (staff && server.channels.length > 1) {
        const remove = el("span", "channel-delete");
        remove.setAttribute("role", "button");
        remove.title = "Delete channel";
        remove.setAttribute("aria-label", `Delete #${channel.name}`);
        remove.append(svgIcon(ICONS.trash));
        remove.addEventListener("click", (e) => {
          e.stopPropagation();
          confirmDeleteChannel(channel);
        });
        item.append(remove);
      }
      channelItems.append(item);
    });
    return;
  }

  const query = dmSearch.value.trim().toLowerCase();
  const lastActivity = (dm) => (dm.messages.length ? dm.messages[dm.messages.length - 1].ts : 0);
  const matches = state.dms
    .filter((dm) => !query || dm.name.toLowerCase().includes(query))
    .sort((a, b) => lastActivity(b) - lastActivity(a));
  const waiting = incomingRequests().length;
  friendsPill.hidden = waiting === 0;
  friendsPill.textContent = String(waiting);
  dmList.replaceChildren();
  if (!matches.length) {
    dmList.append(el("p", "list-empty", query ? "No chats match. Pick someone from the results above." : "No conversations yet. Search for a username to start one."));
  }
  matches.forEach((dm) => {
    const item = el("button", "channel-item dm-item");
    item.type = "button";
    item.classList.toggle("active", view.type === "dm" && view.dmId === dm.id);
    item.classList.toggle("muted", dm.muted);

    const wrap = el("span", "dm-avatar-wrap");
    const avatar = el("span", "dm-avatar", avatarText(dm.name));
    avatar.style.background = dm.color;
    applyAvatar(avatar, dmAvatar(dm));
    wrap.append(avatar, el("span", "status-dot"));
    item.append(wrap, el("span", "dm-name", dm.name));

    if (dm.unread && !dm.muted) item.append(el("span", "unread-pill", String(dm.unread)));

    const remove = el("span", "channel-delete");
    remove.setAttribute("role", "button");
    remove.title = "Delete chat";
    remove.setAttribute("aria-label", `Delete chat with ${dm.name}`);
    remove.append(svgIcon(ICONS.trash));
    remove.addEventListener("click", (e) => {
      e.stopPropagation();
      confirmDeleteDm(dm);
    });
    item.append(remove);
    item.addEventListener("click", () => openDm(dm.id));
    dmList.append(item);
  });
}

function renderHeader() {
  const conv = currentConversation();
  const friends = view.type === "friends";
  loggedInView.classList.toggle("chat-idle", friends || !conv);
  const server = view.type === "server" ? currentServer() : null;
  loggedInView.classList.toggle("show-members", view.type !== "server" || Boolean(server && server.shared));

  if (friends) {
    chatHeaderSymbol.textContent = "";
    activeChannelName.textContent = "Friends";
  } else if (!conv) {
    chatHeaderSymbol.textContent = "@";
    activeChannelName.textContent = "Direct Messages";
  } else {
    chatHeaderSymbol.textContent = conv.kind === "dm" ? "@" : "#";
    activeChannelName.textContent = conv.ref.name;
    messageInput.placeholder = `Message ${conv.label}`;
  }

  // Friend button: only in chats with a real person you aren't friends with yet
  const peer = conv && conv.kind === "dm" && conv.ref.real ? conv.ref : null;
  const friendStatus = peer ? friendStatusWith(peer.peerUid) : "friends";
  friendButton.hidden = !peer || friendStatus === "friends";
  if (peer) {
    const labels = { none: "Add friend", outgoing: "Friend request sent", incoming: "Accept friend request" };
    friendButton.dataset.tooltip = labels[friendStatus];
    friendButton.setAttribute("aria-label", labels[friendStatus]);
    friendButton.disabled = friendStatus === "outgoing";
  }

  const muted = Boolean(conv && conv.ref.muted);
  muteButton.querySelector(".icon-bell").hidden = muted;
  muteButton.querySelector(".icon-bell-off").hidden = !muted;
  muteButton.classList.toggle("active", muted);
  muteButton.setAttribute("aria-pressed", String(muted));
  muteButton.dataset.tooltip = muted ? "Unmute notifications" : "Mute notifications";
  muteButton.setAttribute("aria-label", muteButton.dataset.tooltip);
}

function buildWelcome(conv) {
  const welcome = el("div", "chat-welcome");
  const icon = el("div", "chat-welcome-icon");
  const heading = el("h2");
  const sub = el("p");

  if (conv.kind === "dm") {
    icon.textContent = avatarText(conv.ref.name);
    applyAvatar(icon, dmAvatar(conv.ref));
    heading.textContent = conv.ref.name;
    sub.textContent = `This is the beginning of your direct message history with ${conv.ref.name}.`;
  } else {
    icon.textContent = "#";
    heading.textContent = `Welcome to #${conv.ref.name}`;
    sub.textContent = `This is the start of the #${conv.ref.name} channel.`;
  }

  welcome.append(icon, heading, sub);
  return welcome;
}

function toolbarButton(action, label, markup, danger) {
  const button = el("button", "toolbar-button" + (danger ? " danger" : ""));
  button.type = "button";
  button.dataset.action = action;
  button.title = label;
  button.setAttribute("aria-label", label);
  button.append(svgIcon(markup));
  return button;
}

function buildMessage(msg, { toolbar = true } = {}) {
  const row = el("div", "message");
  row.dataset.id = msg.id;

  const avatar = el("span", "message-avatar");
  avatar.style.background = msg.color;
  applyAvatar(avatar, avatarFor(msg));

  const body = el("div", "message-body");
  const meta = el("p", "message-meta");
  meta.append(el("span", "message-author", displayAuthor(msg)), el("span", "message-time", formatTime(msg.ts)));
  if (msg.edited) meta.append(el("span", "message-edited", "(edited)"));
  if (msg.pinned) meta.append(el("span", "message-pinned", "📌 Pinned"));
  body.append(meta);

  if (toolbar && editingId === msg.id) {
    body.append(buildEditForm());
  } else if (msg.text) {
    body.append(el("p", "message-text", msg.text));
  }

  if (msg.image) {
    const image = el("img", "message-image");
    image.src = msg.image;
    image.alt = "";
    image.addEventListener("error", () => {
      image.replaceWith(el("p", "message-text", "[image failed to load]"));
    });
    body.append(image);
  }

  const reactionEntries = Object.entries(msg.reactions || {}).filter(([, users]) => users && users.length);
  if (toolbar && reactionEntries.length) {
    const chips = el("div", "message-reactions");
    reactionEntries.forEach(([emoji, users]) => {
      const chip = el("button", "reaction-chip" + (users.includes(currentUid) ? " mine" : ""));
      chip.type = "button";
      chip.dataset.action = "react";
      chip.dataset.emoji = emoji;
      chip.title = users.includes(currentUid) ? "Remove your reaction" : "React";
      chip.append(el("span", "", emoji), el("span", "reaction-count", String(users.length)));
      chips.append(chip);
    });
    body.append(chips);
  }

  const replyCount = msg.replies ? msg.replies.length : 0;
  if (toolbar && replyCount) {
    const link = el("button", "message-replies", `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`);
    link.type = "button";
    link.dataset.action = "thread";
    body.append(link);
  }

  row.append(avatar, body);

  if (toolbar) {
    const bar = el("div", "message-toolbar");
    bar.append(
      toolbarButton("react-menu", "Add reaction", ICONS.react),
      toolbarButton("pin", msg.pinned ? "Unpin message" : "Pin message", ICONS.pin),
      toolbarButton("thread", "Start a thread", ICONS.thread),
    );
    const server = view.type === "server" ? currentServer() : null;
    const canModerate = Boolean(server && server.shared && isStaff(server));
    if (isOwn(msg) && msg.text) bar.append(toolbarButton("edit", "Edit message", ICONS.edit));
    if (isOwn(msg) || canModerate) bar.append(toolbarButton("delete", "Delete message", ICONS.trash, true));
    row.append(bar);
  }

  return row;
}

function renderMessages({ keepScroll = false } = {}) {
  const previousScroll = messagesList.scrollTop;
  messagesList.replaceChildren();

  if (view.type === "friends") {
    renderFriends();
    return;
  }

  const conv = currentConversation();
  if (!conv) {
    const empty = el("div", "chat-welcome");
    empty.append(
      el("div", "chat-welcome-icon", "@"),
      el("h2", "", "No conversations yet"),
      el("p", "", "Use the + next to Direct Messages, or type a name in the search box and press Enter."),
    );
    messagesList.append(empty);
    return;
  }

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    const hits = conv.messages.filter(
      (msg) => (msg.text || "").toLowerCase().includes(query) || displayAuthor(msg).toLowerCase().includes(query),
    );
    if (!hits.length) messagesList.append(el("p", "search-empty", `No messages match "${searchQuery.trim()}".`));
    hits.forEach((msg) => messagesList.append(buildMessage(msg)));
    return;
  }

  messagesList.append(buildWelcome(conv));

  let lastDay = null;
  conv.messages.forEach((msg) => {
    const label = dayLabel(msg.ts);
    if (label !== lastDay) {
      messagesList.append(el("div", "date-divider", label));
      lastDay = label;
    }
    messagesList.append(buildMessage(msg));
  });

  messagesList.scrollTop = keepScroll ? previousScroll : messagesList.scrollHeight;
}

function renderFriends() {
  const wrap = el("div", "friends-view");
  wrap.append(el("h2", "friends-title", "Friends"));

  const form = el("form", "friends-add");
  const input = el("input");
  input.type = "text";
  input.placeholder = "Send a friend request by username";
  input.maxLength = 20;
  input.autocomplete = "off";
  const addButton = el("button", "login-button friends-add-button", "Send Request");
  addButton.type = "submit";
  form.append(input, addButton);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) return;
    input.value = "";
    sendRequestToName(name);
  });
  wrap.append(form);

  // One row per person: avatar, name, a line of status text, and action buttons
  const addCard = (friend, status, buttons) => {
    const card = el("div", "friend-card");
    const avatar = el("span", "friend-avatar", avatarText(friend.name));
    avatar.style.background = colorForUid(friend.uid);
    applyAvatar(avatar, friend.avatar);
    const info = el("div", "friend-info");
    info.append(el("span", "friend-name", friend.name), el("span", "friend-status", status));
    card.append(avatar, info, ...buttons);
    wrap.append(card);
  };
  const actionButton = (label, className, onClick) => {
    const button = el("button", `friend-action ${className}`.trim(), label);
    button.type = "button";
    button.addEventListener("click", onClick);
    return button;
  };

  const incoming = incomingRequests();
  const outgoing = outgoingRequests();
  if (incoming.length || outgoing.length) {
    wrap.append(el("p", "friends-count", `Pending — ${incoming.length + outgoing.length}`));
    incoming.forEach((doc) => {
      addCard(friendOf(doc), "Wants to be friends", [
        actionButton("Accept", "primary", () => acceptRequest(doc)),
        actionButton("Decline", "danger", () => declineRequest(doc)),
      ]);
    });
    outgoing.forEach((doc) => {
      addCard(friendOf(doc), "Request sent", [actionButton("Cancel", "danger", () => declineRequest(doc, "Friend request canceled."))]);
    });
  }

  const friends = acceptedFriends();
  wrap.append(el("p", "friends-count", `All friends — ${friends.length}`));
  if (!friends.length) wrap.append(el("p", "list-empty", "No friends yet. Send a request above, or use the button at the top of a chat."));
  friends.forEach((doc) => {
    const friend = friendOf(doc);
    addCard(friend, "Friend", [
      actionButton("Message", "", () => openDirectChat(friend)),
      actionButton("Remove", "danger", () => confirmRemoveFriend(doc)),
    ]);
  });

  messagesList.append(wrap);
}

function showMemberDialog(server, uid) {
  const person = server.members[uid];
  if (!person || !canManageMember(server, uid)) return;

  const actions = el("div", "member-actions");
  const addAction = (label, className, onClick) => {
    const button = el("button", className, label);
    button.type = "button";
    button.addEventListener("click", onClick);
    actions.append(button);
  };

  if (isHost(server)) {
    const makeMod = person.role !== "mod";
    addAction(makeMod ? "Make Mod" : "Remove Mod", "login-button", () => {
      closeAllServerModals();
      updateServerDoc(server.id, { [`members.${uid}.role`]: makeMod ? "mod" : "member" })
        .then(() => toast(makeMod ? `${person.name} is now a mod.` : `${person.name} is no longer a mod.`))
        .catch(() => toast("Couldn't change that role."));
    });
  }

  addAction("Remove from Server", "login-button member-remove", () => {
    confirmDialog({
      title: `Remove ${person.name}?`,
      subtitle: "They'll need the invite code to join again.",
      confirmLabel: "Remove",
      onConfirm: () => {
        removeServerMember(server.id, uid)
          .then(() => toast(`Removed ${person.name}.`))
          .catch(() => toast("Couldn't remove that member."));
      },
    });
  });

  const roleLabel = person.role === "mod" ? "Mod" : "Member";
  showDialog({
    title: person.name,
    subtitle: `${roleLabel} of ${server.name}`,
    extra: actions,
    hideSubmit: true,
    cancelLabel: "Close",
  });
}

function renderServerMembers(server) {
  const order = { host: 0, mod: 1, member: 2 };
  const people = Object.entries(server.members)
    .map(([uid, member]) => ({ uid, ...member }))
    .sort((a, b) => order[a.role] - order[b.role] || a.name.localeCompare(b.name));

  memberCategory.textContent = `Members — ${people.length}`;
  memberItems.replaceChildren();

  people.forEach((person) => {
    const manageable = canManageMember(server, person.uid);
    const row = el(manageable ? "button" : "div", "member");
    if (manageable) {
      row.type = "button";
      row.title = "Manage member";
      row.addEventListener("click", () => showMemberDialog(server, person.uid));
    }
    const avatar = el("span", "member-avatar", avatarText(person.name));
    applyAvatar(avatar, person.avatar);
    row.append(avatar, el("span", "member-name", person.name));
    if (person.role !== "member") row.append(el("span", `member-role role-${person.role}`, person.role === "host" ? "Host" : "Mod"));
    memberItems.append(row);
  });
}

function renderMembers() {
  const server = view.type === "server" ? currentServer() : null;
  if (server && server.shared) {
    renderServerMembers(server);
    return;
  }
  // The built-in Connect Team chat is a system sender, not a person, so it isn't listed here
  const people = state.dms.filter((dm) => dm.real || dm.name !== TEAM_NAME);
  memberCategory.textContent = `Online — ${people.length + 1}`;
  memberItems.replaceChildren();

  const you = el("div", "member");
  const youAvatar = el("span", "member-avatar", state.profile.name.charAt(0).toUpperCase());
  applyAvatar(youAvatar, state.profile.avatar);
  you.append(youAvatar, document.createTextNode(state.profile.name));
  memberItems.append(you);

  people.forEach((dm) => {
    const member = el("button", "member");
    member.type = "button";
    const avatar = el("span", "member-avatar", avatarText(dm.name));
    avatar.style.background = dm.color;
    applyAvatar(avatar, dmAvatar(dm));
    member.append(avatar, document.createTextNode(dm.name));
    member.addEventListener("click", () => openDm(dm.id));
    memberItems.append(member);
  });
}

function renderUser() {
  userAvatar.style.backgroundImage = "";
  userAvatar.textContent = state.profile.name.charAt(0).toUpperCase();
  applyAvatar(userAvatar, state.profile.avatar);
  userName.textContent = state.profile.name;
  userStatus.textContent = STATUSES[state.profile.status] || STATUSES.online;
  userStatus.className = `user-status status-${state.profile.status}`;
}

function renderThread() {
  loggedInView.classList.toggle("show-thread", Boolean(openThreadId));
  if (!openThreadId) return;

  const conv = currentConversation();
  const parent = conv && conv.messages.find((msg) => msg.id === openThreadId);
  if (!parent) {
    closeThread();
    return;
  }

  const replies = parent.replies || [];
  threadBody.replaceChildren(
    buildMessage(parent, { toolbar: false }),
    el("p", "thread-divider", replies.length ? `${replies.length} ${replies.length === 1 ? "reply" : "replies"}` : "No replies yet"),
    ...replies.map((reply) => buildMessage(reply, { toolbar: false })),
  );
  threadBody.scrollTop = threadBody.scrollHeight;
}

/* ---------- Navigation ---------- */

function resetTransient() {
  editingId = null;
  editDraft = "";
  searchQuery = "";
  chatSearch.value = "";
  closeThread();
  closePopovers();
  closeReactionPicker();
  serverMenu.hidden = true;
}

// When a phone's keyboard opens (or the browser scrolls the page to reveal an input), keep the app exactly
// as big as the visible area so the message box and tab bar don't slide off the bottom.
function fitToVisibleArea() {
  const vv = window.visualViewport;
  if (!vv) return;
  const root = document.documentElement;
  root.style.setProperty("--app-height", `${vv.height}px`);
  root.style.setProperty("--app-top", `${vv.offsetTop}px`);
  if (window.scrollY) window.scrollTo(0, 0);
}

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", fitToVisibleArea);
  window.visualViewport.addEventListener("scroll", fitToVisibleArea);
  fitToVisibleArea();
}

// On phones the server rail and channel list slide in over the chat; this opens and closes them.
function setNavOpen(open) {
  loggedInView.classList.toggle("nav-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  // Only one slide-over at a time: the member list closes whenever the menu opens or closes
  setMembersOpen(false);
}

function setMembersOpen(open) {
  loggedInView.classList.toggle("members-open", open);
  membersToggle.setAttribute("aria-expanded", String(open));
}

navToggle.addEventListener("click", () => setNavOpen(!loggedInView.classList.contains("nav-open")));
membersToggle.addEventListener("click", () => {
  const open = !loggedInView.classList.contains("members-open");
  loggedInView.classList.remove("nav-open");
  setMembersOpen(open);
});
navBackdrop.addEventListener("click", () => setNavOpen(false));

// Bottom tabs (phones): switch what the list shows while the menu stays open, like Discord's home screen.
tabServers.addEventListener("click", () => {
  if (view.type === "server") return;
  const first = state.servers.find((server) => !server.shared || server.ready);
  if (first) openServer(first.id);
  else toast("You're not in any servers yet. Tap + to add one.");
});
tabMessages.addEventListener("click", () => {
  if (view.type === "dm") return;
  view = { type: "dm", serverId: null, dmId: null };
  resetTransient();
  renderAll();
});
tabFriends.addEventListener("click", () => friendsShortcut.click());
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setNavOpen(false);
});

function openServer(id) {
  const target = state.servers.find((server) => server.id === id);
  if (!target) return;
  if (target.shared && !target.ready) {
    target.openOnReady = true;
    return;
  }
  view = { type: "server", serverId: id, dmId: null };
  recountServerUnread(target);
  resetTransient();
  renderAll();
}

function openChannel(id) {
  const server = currentServer();
  if (!server) return;
  server.activeChannelId = id;
  recountServerUnread(server);
  save();
  resetTransient();
  setNavOpen(false);
  renderAll();
}

function openDm(id) {
  const dm = state.dms.find((item) => item.id === id);
  if (!dm) return;
  dm.unread = 0;
  lastDmId = id;
  view = { type: "dm", serverId: null, dmId: id };
  if (dm.real) markDmRead(dm);
  clearPeopleSearch();
  save();
  resetTransient();
  setNavOpen(false);
  renderAll();
}

function openDmHome() {
  const dmId = state.dms.some((dm) => dm.id === lastDmId) ? lastDmId : (state.dms[0] ? state.dms[0].id : null);
  if (dmId) {
    openDm(dmId);
    return;
  }
  view = { type: "dm", serverId: null, dmId: null };
  resetTransient();
  renderAll();
}

dmButton.addEventListener("click", openDmHome);

friendButton.addEventListener("click", () => {
  const dm = currentDm();
  if (!dm || !dm.real) return;
  const status = friendStatusWith(dm.peerUid);
  if (status === "none") sendFriendRequest({ uid: dm.peerUid, name: dm.name, avatar: dm.avatar });
  else if (status === "incoming") acceptRequest(friendDocWith(dm.peerUid));
});

friendsShortcut.addEventListener("click", () => {
  view = { type: "friends", serverId: null, dmId: null };
  resetTransient();
  setNavOpen(false);
  renderAll();
});

/* ---------- Sending messages ---------- */

// Where a conversation's messages are stored in Firestore, or null when they're only kept locally.
function remoteStore(conv) {
  if (!conv) return null;
  if (conv.kind === "channel") {
    const server = currentServer();
    return server && server.shared ? { collection: "servers", id: server.id } : null;
  }
  return conv.ref.real ? { collection: "dms", id: conv.ref.id } : null;
}

// Spam limit: at most SPAM_MAX_MESSAGES within SPAM_WINDOW_MS, then sending is paused for SPAM_COOLDOWN_MS.
const SPAM_MAX_MESSAGES = 5;
const SPAM_WINDOW_MS = 5000;
const SPAM_COOLDOWN_MS = 5000;
let recentSends = [];
let sendBlockedUntil = 0;

// Returns true if this message may go out now; otherwise tells the user to slow down.
function allowSend() {
  const now = Date.now();
  if (now < sendBlockedUntil) {
    toast(`Slow down! You can send again in ${Math.ceil((sendBlockedUntil - now) / 1000)}s.`);
    return false;
  }
  recentSends = recentSends.filter((t) => now - t < SPAM_WINDOW_MS);
  if (recentSends.length >= SPAM_MAX_MESSAGES) {
    sendBlockedUntil = now + SPAM_COOLDOWN_MS;
    toast("You're sending messages too fast. Wait a few seconds.");
    return false;
  }
  recentSends.push(now);
  return true;
}

function sendMessage({ text = "", image = null }) {
  const conv = currentConversation();
  if (!conv || (!text && !image)) return false;
  if (!allowSend()) return false;

  const store = remoteStore(conv);
  if (store) {
    const ts = Date.now();
    const message = {
      author: state.profile.name,
      authorUid: currentUid,
      color: "var(--brand-pink)",
      text,
      image,
      ts,
      pinned: false,
      replies: [],
    };
    if (conv.kind === "channel") message.channelId = conv.ref.id;
    addMessage(store.collection, store.id, message).catch(() => toast("Couldn't send that message."));
    // Lets the other person's app notice the new message
    if (conv.kind === "dm") updateDmDoc(conv.ref.id, { lastMessageTs: ts, lastSenderUid: currentUid }).catch(() => {});
    return true;
  }

  conv.messages.push(makeMsg(state.profile.name, "var(--brand-pink)", text, { own: true, image }));
  save();
  renderMessages();
  if (conv.kind === "dm" && !conv.ref.system) scheduleBotReply(conv.ref.id);
  return true;
}

function scheduleBotReply(dmId) {
  setTimeout(() => {
    if (!state) return;
    const dm = state.dms.find((item) => item.id === dmId);
    if (!dm) return;

    const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
    dm.messages.push(makeMsg(dm.name, dm.color, reply));

    const viewing = view.type === "dm" && view.dmId === dm.id;
    if (!viewing) dm.unread = (dm.unread || 0) + 1;
    save();

    if (viewing) renderMessages();
    renderSidebar();
    renderRail();
  }, 900 + Math.random() * 900);
}

function clearPendingImage() {
  pendingImage = null;
  attachmentPreview.hidden = true;
  attachmentPreviewImage.removeAttribute("src");
  imageUploadInput.value = "";
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function prepareImage(file) {
  const raw = await fileToDataUrl(file);
  if (file.type === "image/gif" && file.size <= 600 * 1024) return raw;

  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = raw;
  });

  const scale = Math.min(1, 800 / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

uploadImageButton.addEventListener("click", () => {
  imageUploadInput.click();
});

imageUploadInput.addEventListener("change", async () => {
  const file = imageUploadInput.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    toast("Please choose an image file.");
    imageUploadInput.value = "";
    return;
  }

  try {
    pendingImage = await prepareImage(file);
    attachmentPreviewImage.src = pendingImage;
    attachmentPreview.hidden = false;
  } catch (err) {
    toast("Couldn't read that image.");
    imageUploadInput.value = "";
  }
});

attachmentRemove.addEventListener("click", clearPendingImage);

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text && !pendingImage) return;

  // When the spam limit blocks it, keep what they typed so nothing is lost.
  if (!sendMessage({ text, image: pendingImage })) return;
  messageInput.value = "";
  clearPendingImage();
});

/* ---------- Message actions, threads, pins ---------- */

function refreshChat({ keepScroll = false } = {}) {
  renderMessages({ keepScroll });
  renderThread();
  if (!threadsPopover.hidden) buildThreadsPopover();
  if (!pinnedPopover.hidden) buildPinnedPopover();
}

/* ---------- Editing messages ---------- */

function startEdit(msg) {
  editingId = msg.id;
  editDraft = msg.text || "";
  refreshChat({ keepScroll: true });
}

function cancelEdit() {
  if (!editingId) return;
  editingId = null;
  editDraft = "";
  refreshChat({ keepScroll: true });
}

// Saves the edited text (own messages only). Shared servers update Firestore; everything else updates local data.
function commitEdit() {
  const conv = currentConversation();
  const msg = conv && conv.messages.find((item) => item.id === editingId);
  const text = editDraft.trim();
  if (!msg || !isOwn(msg)) {
    cancelEdit();
    return;
  }
  if (!text) {
    toast("A message can't be empty. Delete it instead.");
    return;
  }
  if (text === msg.text) {
    cancelEdit();
    return;
  }

  const store = remoteStore(conv);
  editingId = null;
  editDraft = "";
  if (store) {
    updateMessage(store.collection, store.id, msg.id, { text, edited: true }).catch(() => toast("Couldn't edit that message."));
    refreshChat({ keepScroll: true });
    return;
  }
  msg.text = text;
  msg.edited = true;
  save();
  refreshChat({ keepScroll: true });
}

// The inline editor shown in place of a message's text. Enter saves, Escape cancels.
function buildEditForm() {
  const form = el("form", "message-edit");
  const input = el("input", "message-edit-input");
  input.type = "text";
  input.maxLength = 2000;
  input.autocomplete = "off";
  input.value = editDraft;
  input.addEventListener("input", () => {
    editDraft = input.value;
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      cancelEdit();
    }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    commitEdit();
  });

  const hint = el("p", "message-edit-hint");
  hint.append("escape to ");
  const cancel = el("button", "message-edit-link", "cancel");
  cancel.type = "button";
  cancel.addEventListener("click", cancelEdit);
  const save = el("button", "message-edit-link", "save");
  save.type = "submit";
  hint.append(cancel, " • enter to ", save);

  form.append(input, hint);
  // Rows are rebuilt on every update, so put the cursor back after each render
  setTimeout(() => {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, 0);
  return form;
}

/* ---------- Reactions ---------- */

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🎉", "🔥"];
const reactionPicker = el("div", "reaction-picker");
reactionPicker.hidden = true;
let reactionTargetId = null;

REACTION_EMOJIS.forEach((emoji) => {
  const option = el("button", "reaction-option", emoji);
  option.type = "button";
  option.setAttribute("aria-label", `React with ${emoji}`);
  option.addEventListener("click", () => {
    const id = reactionTargetId;
    closeReactionPicker();
    if (id) toggleReaction(id, emoji);
  });
  reactionPicker.append(option);
});
document.body.append(reactionPicker);

function closeReactionPicker() {
  reactionPicker.hidden = true;
  reactionTargetId = null;
}

function openReactionPicker(messageId, anchor) {
  if (!reactionPicker.hidden && reactionTargetId === messageId) {
    closeReactionPicker();
    return;
  }
  closePopovers();
  reactionTargetId = messageId;
  reactionPicker.hidden = false;

  // Place it under the button, kept inside the window
  const rect = anchor.getBoundingClientRect();
  const width = reactionPicker.offsetWidth;
  const height = reactionPicker.offsetHeight;
  const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
  const below = rect.bottom + 6;
  reactionPicker.style.left = `${left}px`;
  reactionPicker.style.top = `${below + height > window.innerHeight - 8 ? rect.top - height - 6 : below}px`;
}

// Adds or removes the current user's reaction on a message.
function toggleReaction(messageId, emoji) {
  const conv = currentConversation();
  const msg = conv && conv.messages.find((item) => item.id === messageId);
  if (!msg) return;

  const mine = ((msg.reactions || {})[emoji] || []).includes(currentUid);
  const store = remoteStore(conv);
  if (store) {
    toggleMessageReaction(store.collection, store.id, messageId, emoji, currentUid, !mine).catch(() => toast("Couldn't add that reaction."));
    return;
  }

  msg.reactions = msg.reactions || {};
  const users = (msg.reactions[emoji] || []).filter((uid) => uid !== currentUid);
  if (!mine) users.push(currentUid);
  if (users.length) msg.reactions[emoji] = users;
  else delete msg.reactions[emoji];
  save();
  refreshChat({ keepScroll: true });
}

messagesList.addEventListener("click", (e) => {
  // Touch screens have no hover, so tapping a message shows its action bar
  if (window.matchMedia("(max-width: 700px), (hover: none)").matches) {
    const tappedRow = e.target.closest(".message");
    messagesList.querySelectorAll(".message.tapped").forEach((row) => {
      if (row !== tappedRow) row.classList.remove("tapped");
    });
    if (tappedRow && !e.target.closest("[data-action], a, input, textarea, button")) tappedRow.classList.toggle("tapped");
  }

  const button = e.target.closest("[data-action]");
  if (!button) return;
  const row = button.closest(".message");
  const conv = currentConversation();
  if (!row || !conv) return;
  const msg = conv.messages.find((item) => item.id === row.dataset.id);
  if (!msg) return;

  const action = button.dataset.action;
  const store = remoteStore(conv);
  if (action === "edit") {
    if (isOwn(msg)) startEdit(msg);
  } else if (action === "react") {
    toggleReaction(msg.id, button.dataset.emoji);
  } else if (action === "react-menu") {
    openReactionPicker(msg.id, button);
  } else if (action === "pin") {
    if (store) {
      updateMessage(store.collection, store.id, msg.id, { pinned: !msg.pinned }).catch(() => toast("Couldn't pin that message."));
      toast(msg.pinned ? "Message unpinned." : "Message pinned.");
      return;
    }
    msg.pinned = !msg.pinned;
    save();
    refreshChat({ keepScroll: true });
    toast(msg.pinned ? "Message pinned." : "Message unpinned.");
  } else if (action === "thread") {
    openThread(msg.id);
  } else if (action === "delete") {
    if (openThreadId === msg.id) closeThread();
    if (store) {
      deleteMessage(store.collection, store.id, msg.id).catch(() => toast("Couldn't delete that message."));
      return;
    }
    conv.messages.splice(conv.messages.indexOf(msg), 1);
    save();
    refreshChat({ keepScroll: true });
  }
});

function openThread(id) {
  openThreadId = id;
  closePopovers();
  renderThread();
  threadInput.focus();
}

function closeThread() {
  openThreadId = null;
  loggedInView.classList.remove("show-thread");
  threadBody.replaceChildren();
}

threadClose.addEventListener("click", closeThread);

threadForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = threadInput.value.trim();
  const conv = currentConversation();
  const parent = conv && conv.messages.find((msg) => msg.id === openThreadId);
  if (!text || !parent) return;

  const store = remoteStore(conv);
  if (store) {
    const reply = { id: uid(), author: state.profile.name, authorUid: currentUid, color: "var(--brand-pink)", text, ts: Date.now() };
    updateMessage(store.collection, store.id, parent.id, { replies: fieldValue.arrayUnion(reply) }).catch(() => toast("Couldn't send that reply."));
    threadInput.value = "";
    return;
  }

  parent.replies = parent.replies || [];
  parent.replies.push(makeMsg(state.profile.name, "var(--brand-pink)", text, { own: true }));
  threadInput.value = "";
  save();
  refreshChat({ keepScroll: true });
});

function scrollToMessage(id) {
  if (searchQuery) {
    searchQuery = "";
    chatSearch.value = "";
    renderMessages();
  }
  const row = messagesList.querySelector(`.message[data-id="${id}"]`);
  if (!row) return;
  row.scrollIntoView({ block: "center" });
  row.classList.add("flash");
  setTimeout(() => row.classList.remove("flash"), 1600);
}

chatSearch.addEventListener("input", () => {
  searchQuery = chatSearch.value;
  renderMessages();
});

muteButton.addEventListener("click", () => {
  const conv = currentConversation();
  if (!conv) return;
  conv.ref.muted = !conv.ref.muted;
  if (conv.ref.muted && conv.kind === "dm") conv.ref.unread = 0;
  save();
  renderHeader();
  renderSidebar();
  renderRail();
  toast(conv.ref.muted ? `Muted notifications for ${conv.label}.` : `Unmuted ${conv.label}.`);
});

/* ---------- Popovers ---------- */

const popovers = [threadsPopover, pinnedPopover, emojiPopover, gifPopover];

function closePopovers(except) {
  popovers.forEach((popover) => {
    if (popover !== except) popover.hidden = true;
  });
}

function togglePopover(popover, build) {
  const opening = popover.hidden;
  closeReactionPicker();
  closePopovers(popover);
  if (opening && build) build();
  popover.hidden = !opening;
}

function buildThreadsPopover() {
  const conv = currentConversation();
  threadsPopover.replaceChildren(el("h3", "popover-title", "Threads"));
  const threads = conv ? conv.messages.filter((msg) => msg.replies && msg.replies.length) : [];
  if (!threads.length) {
    threadsPopover.append(el("p", "popover-empty", "No threads yet. Hover a message and click the thread icon to start one."));
  }
  threads.forEach((msg) => {
    const item = el("button", "popover-item");
    item.type = "button";
    item.append(
      el("span", "popover-item-title", snippet(msg)),
      el("span", "popover-item-meta", `${msg.replies.length} ${msg.replies.length === 1 ? "reply" : "replies"} · ${displayAuthor(msg)}`),
    );
    item.addEventListener("click", () => openThread(msg.id));
    threadsPopover.append(item);
  });
}

function buildPinnedPopover() {
  const conv = currentConversation();
  pinnedPopover.replaceChildren(el("h3", "popover-title", "Pinned messages"));
  const pinned = conv ? conv.messages.filter((msg) => msg.pinned) : [];
  if (!pinned.length) {
    pinnedPopover.append(el("p", "popover-empty", "Nothing pinned yet. Hover a message and click the pin icon."));
  }
  pinned.forEach((msg) => {
    const item = el("button", "popover-item");
    item.type = "button";
    item.append(el("span", "popover-item-title", snippet(msg)), el("span", "popover-item-meta", `${displayAuthor(msg)} · ${formatTime(msg.ts)}`));
    item.addEventListener("click", () => {
      closePopovers();
      scrollToMessage(msg.id);
    });
    pinnedPopover.append(item);
  });
}

EMOJIS.forEach((emoji) => {
  const option = el("button", "emoji-option", emoji);
  option.type = "button";
  option.addEventListener("click", () => {
    const start = messageInput.selectionStart ?? messageInput.value.length;
    const end = messageInput.selectionEnd ?? messageInput.value.length;
    messageInput.setRangeText(emoji, start, end, "end");
    messageInput.focus();
    closePopovers();
  });
  emojiPopover.append(option);
});

threadsButton.addEventListener("click", () => togglePopover(threadsPopover, buildThreadsPopover));
pinnedButton.addEventListener("click", () => togglePopover(pinnedPopover, buildPinnedPopover));
emojiButton.addEventListener("click", () => togglePopover(emojiPopover));
gifButton.addEventListener("click", () => {
  togglePopover(gifPopover);
  if (!gifPopover.hidden) gifInput.focus();
});

gifForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = gifInput.value.trim();
  let valid = false;
  try {
    valid = /^https?:$/.test(new URL(value).protocol);
  } catch (err) {
    valid = false;
  }
  if (!valid) {
    toast("Enter a full link starting with http:// or https://");
    return;
  }
  sendMessage({ image: value });
  gifInput.value = "";
  closePopovers();
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".popover") && !e.target.closest("[data-popover-trigger]")) closePopovers();
  if (!e.target.closest(".reaction-picker") && !e.target.closest('[data-action="react-menu"]')) closeReactionPicker();
  if (!e.target.closest(".server-menu") && !e.target.closest(".server-menu-trigger")) serverMenu.hidden = true;
});

/* ---------- Dialog helper ---------- */

let dialogSubmitHandler = null;

function closeAllServerModals() {
  dialogModal.hidden = true;
  addServerModal.hidden = true;
  joinServerModal.hidden = true;
  createServerModal.hidden = true;
}

function showDialog({ title, subtitle = "", fields = [], extra = null, submitLabel = "Save", cancelLabel = "Cancel", danger = false, hideSubmit = false, onSubmit = null }) {
  closeAllServerModals();
  serverMenu.hidden = true;
  dialogTitle.textContent = title;
  dialogSubtitle.textContent = subtitle;
  dialogSubtitle.hidden = !subtitle;
  clearError(dialogError);

  dialogFields.replaceChildren();
  fields.forEach((field) => {
    const label = el("label", "field");
    label.append(el("span", "", field.label));
    let control;
    if (field.type === "select") {
      control = document.createElement("select");
      field.options.forEach(([value, text]) => {
        const option = el("option", "", text);
        option.value = value;
        control.append(option);
      });
      control.value = field.value;
    } else {
      control = document.createElement("input");
      control.type = "text";
      control.value = field.value || "";
      control.maxLength = field.maxLength || 40;
      control.autocomplete = "off";
      if (field.placeholder) control.placeholder = field.placeholder;
    }
    control.name = field.name;
    control.required = Boolean(field.required);
    label.append(control);
    dialogFields.append(label);
  });

  dialogExtra.replaceChildren();
  if (extra) dialogExtra.append(extra);

  dialogSubmit.hidden = hideSubmit;
  dialogSubmit.textContent = submitLabel;
  dialogSubmit.classList.toggle("danger-button", danger);
  dialogCancel.textContent = cancelLabel;
  dialogSubmitHandler = onSubmit;
  dialogModal.hidden = false;

  const first = dialogFields.querySelector("input, select");
  if (first) {
    first.focus();
    if (typeof first.select === "function") first.select();
  }
}

dialogForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const handler = dialogSubmitHandler;
  if (!handler) {
    closeAllServerModals();
    return;
  }
  // Handlers may be async (e.g. checking whether a username is free); keep the button busy meanwhile
  dialogSubmit.disabled = true;
  try {
    const result = await handler(Object.fromEntries(new FormData(dialogForm)));
    if (result !== false) closeAllServerModals();
  } finally {
    dialogSubmit.disabled = false;
  }
});

dialogCancel.addEventListener("click", closeAllServerModals);

function confirmDialog({ title, subtitle, confirmLabel, onConfirm }) {
  showDialog({ title, subtitle, submitLabel: confirmLabel, danger: true, onSubmit: onConfirm });
}

/* ---------- Profile pictures & server icons ---------- */

// Crops an image file to a centered square and shrinks it so it can be stored in Firestore.
async function prepareSquareImage(file, size) {
  const raw = await fileToDataUrl(file);
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = raw;
  });

  const side = Math.min(img.width, img.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1a1a1f";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.85);
}

// A preview with Upload and Remove buttons. onChange gets the new data URL, or "" when removed.
function makeImagePicker({ initial = "", fallback = "", size, round, uploadLabel, onChange }) {
  let value = initial;
  const row = el("div", "image-picker");
  const preview = el("span", "image-picker-preview" + (round ? " round" : ""));
  const actions = el("div", "image-picker-actions");
  const upload = el("button", "login-button image-picker-button", uploadLabel);
  upload.type = "button";
  const remove = el("button", "image-picker-remove", "Remove");
  remove.type = "button";
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.hidden = true;

  function show() {
    preview.style.backgroundImage = "";
    preview.textContent = fallback;
    applyAvatar(preview, value);
    remove.hidden = !value;
  }

  upload.addEventListener("click", () => input.click());
  input.addEventListener("change", async () => {
    const file = input.files[0];
    input.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please choose an image file.");
      return;
    }
    try {
      value = await prepareSquareImage(file, size);
      show();
      onChange(value);
    } catch (err) {
      toast("Couldn't read that image.");
    }
  });
  remove.addEventListener("click", () => {
    value = "";
    show();
    onChange("");
  });

  actions.append(upload, remove);
  row.append(preview, actions, input);
  show();
  return row;
}

function showServerIconDialog() {
  const server = currentServer();
  if (!server || !isHost(server)) return;

  const picker = makeImagePicker({
    initial: server.icon,
    fallback: initialsFor(server.name),
    size: 128,
    round: false,
    uploadLabel: "Upload icon",
    onChange: (value) => {
      if (server.shared) {
        updateServerDoc(server.id, { icon: value }).catch(() => toast("Couldn't update the server icon."));
        return;
      }
      server.icon = value;
      save();
      renderAll();
    },
  });

  showDialog({
    title: "Server icon",
    subtitle: `Choose an image for ${server.name}.`,
    extra: picker,
    hideSubmit: true,
    cancelLabel: "Done",
  });
}

/* ---------- Direct messages & friends ---------- */

function showNewDmDialog() {
  showDialog({
    title: "Start a conversation",
    subtitle: "Enter the username of someone on Connect.",
    fields: [{ name: "name", label: "Username", maxLength: 24, required: true }],
    submitLabel: "Start",
    onSubmit: ({ name }) => {
      const trimmed = name.trim();
      if (!trimmed) {
        setDialogError("Enter a username.");
        return false;
      }
      startChatWithName(trimmed);
      return true;
    },
  });
}

/* ---------- Finding people ---------- */

let peopleResults = [];
let peopleSearchToken = 0;
let peopleSearchTimer = null;

function clearPeopleSearch() {
  clearTimeout(peopleSearchTimer);
  peopleSearchToken++;
  peopleResults = [];
  dmSearch.value = "";
  dmSearchResults.hidden = true;
  dmSearchResults.replaceChildren();
}

function renderPeopleResults(people) {
  dmSearchResults.replaceChildren(el("p", "dm-search-heading", "People"));
  if (people === null) {
    dmSearchResults.append(el("p", "dm-search-empty", "Couldn't search right now."));
  } else if (!people.length) {
    dmSearchResults.append(el("p", "dm-search-empty", "No users found."));
  }
  (people || []).forEach((person) => {
    const item = el("button", "dm-search-item");
    item.type = "button";
    const avatar = el("span", "dm-avatar", avatarText(person.name));
    avatar.style.background = colorForUid(person.uid);
    applyAvatar(avatar, person.avatar);
    item.append(avatar, el("span", "dm-name", person.name));
    item.addEventListener("click", () => openDirectChat(person));
    dmSearchResults.append(item);
  });
  dmSearchResults.hidden = false;
}

async function runPeopleSearch() {
  const text = dmSearch.value.trim();
  if (!text) {
    clearPeopleSearch();
    return;
  }
  const token = ++peopleSearchToken;
  let people;
  try {
    const lower = text.toLowerCase();
    people = (await searchDirectory(lower, 8))
      .filter((person) => person.uid !== currentUid)
      // an exact username match goes first
      .sort((a, b) => (b.nameLower === lower) - (a.nameLower === lower) || a.nameLower.localeCompare(b.nameLower));
  } catch (err) {
    console.error("User search failed:", err);
    people = null;
  }
  if (token !== peopleSearchToken) return;
  peopleResults = people || [];
  renderPeopleResults(people);
}

newDmButton.addEventListener("click", showNewDmDialog);

dmSearch.addEventListener("input", () => {
  renderSidebar();
  clearTimeout(peopleSearchTimer);
  if (!dmSearch.value.trim()) {
    clearPeopleSearch();
    return;
  }
  peopleSearchTimer = setTimeout(runPeopleSearch, 250);
});

dmSearch.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    clearPeopleSearch();
    renderSidebar();
    return;
  }
  if (e.key !== "Enter") return;
  e.preventDefault();
  const query = dmSearch.value.trim();
  if (!query) return;

  // Prefer a chat you already have, otherwise the top search result
  const lower = query.toLowerCase();
  const match = state.dms.find((dm) => dm.name.toLowerCase().includes(lower));
  if (match) {
    openDm(match.id);
  } else if (peopleResults.length) {
    openDirectChat(peopleResults[0]);
  } else {
    toast("No users found. Check the username and try again.");
  }
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".dm-search-wrap") && !dmSearchResults.hidden) {
    dmSearchResults.hidden = true;
  }
});

dmSearch.addEventListener("focus", () => {
  if (dmSearch.value.trim() && dmSearchResults.children.length) dmSearchResults.hidden = false;
});

function setDialogError(message) {
  showError(dialogError, message);
}

function removeDm(dm) {
  if (dm.real) {
    // Only removed from this user's screen; it comes back if the other person writes again
    state.hiddenDms[dm.id] = Date.now();
    detachDm(dm.id);
  }
  state.dms = state.dms.filter((item) => item.id !== dm.id);
  if (lastDmId === dm.id) lastDmId = state.dms[0] ? state.dms[0].id : null;
  if (view.type === "dm" && view.dmId === dm.id) view.dmId = lastDmId;
  save();
  renderAll();
}

function confirmDeleteDm(dm) {
  confirmDialog({
    title: `Delete chat with ${dm.name}?`,
    subtitle: "This removes the conversation and its messages from your screen.",
    confirmLabel: "Delete Chat",
    onConfirm: () => removeDm(dm),
  });
}

/* ---------- Servers & channels ---------- */

function showInviteDialog() {
  const server = currentServer();
  if (!server) return;

  // Makes sure the code is saved in the database, which repairs a server whose invite was never written.
  if (server.shared && isHost(server)) {
    setInvite(server.inviteCode, { serverId: server.id, name: server.name }).catch((err) => {
      console.error("Saving invite failed:", err);
      toast(`Couldn't save the invite code (${err.code || "error"}).`);
    });
  }

  const row = el("div", "invite-row");
  const input = el("input", "invite-code");
  input.type = "text";
  input.readOnly = true;
  input.value = server.inviteCode;
  const copy = el("button", "login-button invite-copy", "Copy");
  copy.type = "button";
  copy.addEventListener("click", () => {
    navigator.clipboard.writeText(server.inviteCode).then(
      () => toast("Invite code copied."),
      () => {
        input.select();
        toast("Press Ctrl+C to copy the code.");
      },
    );
  });
  row.append(input, copy);

  showDialog({
    title: `Invite people to ${server.name}`,
    subtitle: "Share this invite code. Anyone can join with it from Add a server → Join a Server.",
    extra: row,
    hideSubmit: true,
    cancelLabel: "Done",
  });
}

function showCreateChannelDialog() {
  const server = currentServer();
  if (!server) return;

  showDialog({
    title: "Create a channel",
    subtitle: `Add a text channel to ${server.name}.`,
    fields: [{ name: "name", label: "Channel name", maxLength: 30, required: true, placeholder: "new-channel" }],
    submitLabel: "Create",
    onSubmit: ({ name }) => {
      const cleaned = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (!cleaned) {
        setDialogError("Use letters or numbers in the channel name.");
        return false;
      }
      if (server.channels.some((channel) => channel.name === cleaned)) {
        setDialogError(`#${cleaned} already exists.`);
        return false;
      }
      server.collapsed = false;
      if (server.shared) {
        const id = uid();
        updateServerDoc(server.id, { channels: fieldValue.arrayUnion({ id, name: cleaned }) })
          .then(() => openChannel(id))
          .catch(() => toast("Couldn't create that channel."));
        return true;
      }
      const channel = makeChannel(cleaned, []);
      server.channels.push(channel);
      openChannel(channel.id);
      return true;
    },
  });
}

function confirmDeleteChannel(channel) {
  const server = currentServer();
  if (!server || !channel) return;
  if (server.channels.length <= 1) {
    toast("A server needs at least one channel.");
    return;
  }

  confirmDialog({
    title: `Delete #${channel.name}?`,
    subtitle: "All messages in this channel will be lost.",
    confirmLabel: "Delete Channel",
    onConfirm: () => {
      if (server.shared) {
        deleteServerMessages(server.id, channel.id)
          .then(() => updateServerDoc(server.id, { channels: fieldValue.arrayRemove({ id: channel.id, name: channel.name }) }))
          .catch(() => toast("Couldn't delete that channel."));
        return;
      }
      server.channels = server.channels.filter((item) => item.id !== channel.id);
      server.activeChannelId = server.channels[0].id;
      save();
      resetTransient();
      renderAll();
    },
  });
}

function showRenameServerDialog() {
  const server = currentServer();
  if (!server) return;

  showDialog({
    title: "Change server name",
    subtitle: `Rename ${server.name}.`,
    fields: [{ name: "name", label: "Server name", value: server.name, maxLength: 30, required: true }],
    submitLabel: "Save",
    onSubmit: ({ name }) => {
      const trimmed = name.trim();
      if (!trimmed) {
        setDialogError("Server name can't be empty.");
        return false;
      }
      if (server.shared) {
        updateServerDoc(server.id, { name: trimmed })
          .then(() => setInvite(server.inviteCode, { serverId: server.id, name: trimmed }))
          .catch(() => toast("Couldn't rename the server."));
        return true;
      }
      server.name = trimmed;
      save();
      renderAll();
      return true;
    },
  });
}

function leaveServerLocally(server) {
  detachServer(server.id);
  state.servers = state.servers.filter((item) => item.id !== server.id);
  save();
  openDmHome();
}

function confirmLeaveServer() {
  const server = currentServer();
  if (!server) return;

  const deleting = server.shared && isHost(server);
  confirmDialog({
    title: deleting ? `Delete ${server.name}?` : `Leave ${server.name}?`,
    subtitle: deleting ? "This permanently deletes the server and all its messages for everyone." : "You'll need an invite code to rejoin.",
    confirmLabel: deleting ? "Delete Server" : "Leave Server",
    onConfirm: () => {
      if (!server.shared) {
        leaveServerLocally(server);
        return;
      }
      server.leaving = true;
      const request = deleting ? deleteServerCompletely(server.id, server.inviteCode) : removeServerMember(server.id, currentUid);
      request.then(
        () => leaveServerLocally(server),
        () => {
          server.leaving = false;
          toast(deleting ? "Couldn't delete the server." : "Couldn't leave the server.");
        },
      );
    },
  });
}

serverMenuTrigger.addEventListener("click", () => {
  const server = currentServer();
  if (server) {
    renameServerOption.hidden = !isHost(server);
    iconServerOption.hidden = !isHost(server);
    serverMenuSep.hidden = !isHost(server);
    leaveServerOption.textContent = server.shared && isHost(server) ? "Delete Server" : "Leave Server";
  }
  serverMenu.hidden = !serverMenu.hidden;
});

inviteButton.addEventListener("click", showInviteDialog);
createChannelButton.addEventListener("click", showCreateChannelDialog);
renameServerOption.addEventListener("click", showRenameServerDialog);
iconServerOption.addEventListener("click", showServerIconDialog);
leaveServerOption.addEventListener("click", confirmLeaveServer);

categoryToggle.addEventListener("click", () => {
  const server = currentServer();
  if (!server) return;
  server.collapsed = !server.collapsed;
  save();
  renderSidebar();
});

function openAddServerModal() {
  closeAllServerModals();
  addServerModal.hidden = false;
}

function openCreateServerModal() {
  closeAllServerModals();
  createServerModal.hidden = false;
  createServerInput.value = "";
  createServerInput.focus();
}

function openJoinServerModal() {
  closeAllServerModals();
  clearError(joinServerError);
  joinServerModal.hidden = false;
  joinServerInput.value = "";
  joinServerInput.focus();
}

addServerButton.addEventListener("click", openAddServerModal);
chooseCreateButton.addEventListener("click", openCreateServerModal);
chooseJoinButton.addEventListener("click", openJoinServerModal);
addServerCancel.addEventListener("click", closeAllServerModals);
createServerCancel.addEventListener("click", openAddServerModal);
joinServerBack.addEventListener("click", openAddServerModal);

[dialogModal, addServerModal, createServerModal, joinServerModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAllServerModals();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  closeAllServerModals();
  closePopovers();
  closeReactionPicker();
  serverMenu.hidden = true;
});

// Picks an invite code nobody is using yet.
async function freshInviteCode() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode();
    if (!(await getInvite(code))) return code;
  }
  throw new Error("No free invite code");
}

createServerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = createServerInput.value.trim();
  if (!name) return;

  // The creator becomes the host of a shared server stored in Firestore.
  try {
    const id = uid();
    const channelId = uid();
    const code = await freshInviteCode();
    await createServerDoc(id, {
      name,
      inviteCode: code,
      hostUid: currentUid,
      memberUids: [currentUid],
      icon: "",
      members: { [currentUid]: { name: state.profile.name, avatar: state.profile.avatar || "", role: "host" } },
      channels: [{ id: channelId, name: "general" }],
    });
    await setInvite(code, { serverId: id, name });

    const server = hydrateServer(id, { activeChannelId: channelId, trackFrom: Date.now() });
    server.openOnReady = true;
    state.servers.push(server);
    attachServer(server);
    save();
    closeAllServerModals();
  } catch (err) {
    console.error("Create server failed:", err);
    toast(`Couldn't create the server (${err.code || "error"}).`);
  }
});

// Adds the user to a shared server; if they're already a member (e.g. after a data reset), just reconnects.
async function joinSharedServer(serverId) {
  try {
    await joinServerDoc(serverId, currentUid, state.profile.name, state.profile.avatar);
  } catch (err) {
    await getServerDoc(serverId);
  }
}

joinServerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError(joinServerError);

  const code = joinServerInput.value.trim().toUpperCase();
  if (!code) return;

  if (state.servers.some((server) => server.inviteCode === code)) {
    showError(joinServerError, "You've already joined that server.");
    return;
  }

  // Demo servers are local-only, with bots
  let local = null;
  if (code === "TEAM") {
    local = makeTeamServer();
  } else if (DEMO_SERVERS[code]) {
    const name = DEMO_SERVERS[code];
    local = makeServer(name, code, [["general", [makeMsg("TestBot 1", BOT_COLORS[0], `Welcome to ${name}! 🎉`)]]]);
  }
  if (local) {
    state.servers.push(local);
    save();
    closeAllServerModals();
    openServer(local.id);
    return;
  }

  let invite = null;
  try {
    invite = await getInvite(code);
  } catch (err) {
    // A failed lookup (rules, network) is different from a code that doesn't exist.
    console.error("Invite lookup failed:", err);
    showError(joinServerError, `Couldn't check that code (${err.code || "error"}). Try again in a moment.`);
    return;
  }
  if (!invite || !invite.serverId) {
    showError(joinServerError, "That invite code isn't valid.");
    return;
  }
  if (state.servers.some((server) => server.id === invite.serverId)) {
    showError(joinServerError, "You've already joined that server.");
    return;
  }

  try {
    await joinSharedServer(invite.serverId);
  } catch (err) {
    console.error("Join server failed:", err);
    showError(joinServerError, `Couldn't join that server (${err.code || "error"}).`);
    return;
  }

  const server = hydrateServer(invite.serverId, { trackFrom: Date.now() });
  server.openOnReady = true;
  state.servers.push(server);
  attachServer(server);
  save();
  closeAllServerModals();
});

/* ---------- Settings ---------- */

function showSettingsDialog() {
  const reset = el("button", "reset-button", "Reset all data");
  reset.type = "button";
  let armed = false;
  reset.addEventListener("click", () => {
    if (!armed) {
      armed = true;
      reset.textContent = "Click again to erase everything";
      reset.classList.add("armed");
      return;
    }
    // The username and picture belong to the account, so resetting keeps them
    const kept = state.profile;
    state = defaultState(currentEmail);
    state.profile.name = kept.name;
    state.profile.avatar = kept.avatar || "";
    save();
    view = { type: "dm", serverId: null, dmId: state.dms[0].id };
    lastDmId = view.dmId;
    closeAllServerModals();
    resetTransient();
    renderAll();
    toast("App data reset.");
  });

  // The picture is applied when Save is pressed
  let pendingAvatar = state.profile.avatar || "";
  const avatarPicker = makeImagePicker({
    initial: pendingAvatar,
    fallback: state.profile.name.charAt(0).toUpperCase(),
    size: 96,
    round: true,
    uploadLabel: "Upload photo",
    onChange: (value) => {
      pendingAvatar = value;
    },
  });
  const extra = el("div");
  extra.append(avatarPicker, reset);

  showDialog({
    title: "Settings",
    subtitle: "Update how you appear in Connect.",
    fields: [
      { name: "name", label: "Username", value: state.profile.name, maxLength: 20, required: true },
      { name: "status", label: "Status", type: "select", value: state.profile.status, options: Object.entries(STATUSES) },
    ],
    extra,
    submitLabel: "Save",
    onSubmit: async ({ name, status }) => {
      const trimmed = name.trim();
      const oldName = state.profile.name;

      // A new username has to be allowed and not already taken by someone else
      if (trimmed !== oldName) {
        const problem = validateUsername(trimmed);
        if (problem) {
          setDialogError(problem);
          return false;
        }
        try {
          if (!(await claimUsername(currentUid, trimmed))) {
            setDialogError("That username is taken. Try another one.");
            return false;
          }
        } catch (err) {
          console.error("Username claim failed:", err);
          setDialogError("Couldn't check that username. Try again.");
          return false;
        }
        if (trimmed.toLowerCase() !== oldName.toLowerCase()) releaseUsername(oldName).catch(() => {});
      }

      state.profile.name = trimmed;
      state.profile.status = status;
      state.profile.avatar = pendingAvatar;
      syncProfileEverywhere();
      save();
      renderAll();
      toast("Settings saved.");
      return true;
    },
  });
}

settingsButton.addEventListener("click", showSettingsDialog);

/* ---------- Auth state ---------- */

// Returns the user to the DM, friends page, or server they were on before the refresh.
function restoreView(saved) {
  if (!saved) return;
  if (saved.type === "friends") {
    view = { type: "friends", serverId: null, dmId: null };
    resetTransient();
    renderAll();
  } else if (saved.type === "dm" && state.dms.some((dm) => dm.id === saved.dmId)) {
    openDm(saved.dmId);
  } else if (saved.type === "server" && state.servers.some((server) => server.id === saved.serverId)) {
    // Shared servers open as soon as their data arrives
    openServer(saved.serverId);
  }
}

watchAuthState(async (user) => {
  if (user) {
    currentEmail = user.email;
    currentUid = user.uid;
    storageSet(SESSION_KEY, "1");
    // Read the page the user was on before a refresh; rendering below would overwrite it
    const savedView = readSavedView(user.uid);
    const loaded = await loadState(user.uid, user.email);
    // The user may have logged out while the data was loading
    if (currentUid !== user.uid) return;

    // Every account owns a unique username. New accounts start with the part of their email before the @
    // (with a number added if someone already has it); they can change it any time in Settings.
    const username = await ensureUsername(user.uid, loaded.profile.name);
    if (currentUid !== user.uid) return;
    const renamed = username !== loaded.profile.name;
    loaded.profile.name = username;

    loginView.hidden = true;
    signupView.hidden = true;
    loggedInView.hidden = false;

    state = loaded;
    detachAllServers();
    state.servers = state.servers.map((server) => (server.shared ? hydrateServer(server.id, server) : server));
    state.servers.filter((server) => server.shared).forEach(attachServer);

    // Real conversations: rebuild from saved settings, then listen for their messages
    detachAllDms();
    state.dms = state.dms.map((dm) => (dm.real ? hydrateDm(dm) : dm));
    state.dms.filter((dm) => dm.real).forEach(attachDm);
    startInbox();
    startFriends();
    // Makes this user findable by username in the "Find or start a conversation" search
    syncProfileEverywhere();
    if (renamed) {
      save();
      toast(`Your username is now ${username}.`);
    }

    lastDmId = state.dms[0] ? state.dms[0].id : null;
    view = { type: "dm", serverId: null, dmId: lastDmId };
    resetTransient();
    renderAll();
    restoreView(savedView);
    finishRestoring();
  } else {
    finishRestoring();
    forgetSession();
    loginView.hidden = false;
    signupView.hidden = true;
    loggedInView.hidden = true;
    closeAllServerModals();
    clearPendingImage();
    detachAllServers();
    detachAllDms();
    stopFriends();
    clearPeopleSearch();
    state = null;
    currentUid = null;
    document.title = "Connect";
  }
});
