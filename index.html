/**
 * index.js - HR BOT (single-file, ready-to-run)
 * - Keeps all original features (fight, target, nicklock, gclock, etc.)
 * - Auto reconnect + crash recovery
 * - Config & cookies auto-save/load (config.json)
 * - Web dashboard (socket.io) for logs & groups
 *
 * Usage:
 * - Put this file on your host (bothosting.net)
 * - Install dependencies: npm i express body-parser ws3-fca socket.io
 * - Run: node index.js
 * - (Optional) Use PM2: pm2 start index.js --name hrbot --watch
 */

const express = require('express');
const bodyParser = require('body-parser');
const login = require('ws3-fca');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- GLOBAL STATE ---
let botAPI = null;
let adminID = null;
let prefix = '/';
let botNickname = 'HR BOT';

let lockedGroups = {};
let lockedNicknames = {};
let lockedGroupPhoto = {};
let fightSessions = {};
let joinedGroups = new Set();
let targetSessions = {};
let nickLockEnabled = false;
let nickRemoveEnabled = false;
let gcAutoRemoveEnabled = false;
let currentCookies = null;
let reconnectAttempt = 0;
let cookieSaveInterval = null;
const signature = `\n  \n☠FUCKING BOT ENTER☠\n`;
const separator = `\n ⚜                                        ⚜`;

// --- UTILITY FUNCTIONS ---
function emitLog(message, isError = false) {
  const logMessage = `[${new Date().toISOString()}] ${isError ? '❌ ERROR: ' : '✅ INFO: '}${message}`;
  console.log(logMessage);
  try { io.emit('botlog', logMessage); } catch (e) { /* ignore socket errors */ }
}

function saveCookies() {
  if (!botAPI) {
    emitLog('❌ Cannot save cookies: Bot API not initialized.', true);
    return;
  }
  try {
    const newAppState = botAPI.getAppState();
    const configToSave = {
      botNickname: botNickname,
      cookies: newAppState
    };
    fs.writeFileSync('config.json', JSON.stringify(configToSave, null, 2));
    currentCookies = newAppState;
    emitLog('✅ AppState saved successfully.');
  } catch (e) {
    emitLog('❌ Failed to save AppState: ' + (e && e.message ? e.message : e), true);
  }
}

function startCookieSaver() {
  if (cookieSaveInterval) clearInterval(cookieSaveInterval);
  cookieSaveInterval = setInterval(saveCookies, 600000); // every 10 min
}

// --- BOT INITIALIZATION AND RECONNECTION LOGIC ---
function initializeBot(cookies, newPrefix, newAdminID) {
  emitLog('🚀 Initializing bot with ws3-fca...');
  currentCookies = cookies || currentCookies;
  prefix = newPrefix || prefix;
  adminID = newAdminID || adminID;
  reconnectAttempt = 0;

  login({ appState: currentCookies }, (err, api) => {
    if (err) {
      emitLog(`❌ Login error: ${err.message || err}. Retrying in 10 seconds.`, true);
      setTimeout(() => initializeBot(currentCookies, prefix, adminID), 10000);
      return;
    }

    emitLog('✅ Bot successfully logged in.');
    botAPI = api;
    try {
      botAPI.setOptions({
        selfListen: true,
        listenEvents: true,
        updatePresence: false
      });
    } catch (e) {
      emitLog('❌ Failed to set options on api: ' + e.message, true);
    }

    // Update state & start
    updateJoinedGroups(api)
      .catch(err => emitLog('❌ updateJoinedGroups error: ' + (err && err.message ? err.message : err), true));

    setTimeout(() => {
      setBotNicknamesInGroups();
      sendStartupMessage();
      startListening(api);
    }, 5000); // delay before start

    startCookieSaver();
  });
}

function startListening(api) {
  if (!api || typeof api.listenMqtt !== 'function') {
    emitLog('❌ Cannot start listener: invalid api object.', true);
    return;
  }

  try {
    api.listenMqtt(async (err, event) => {
      if (err) {
        emitLog(`❌ Listener error: ${err.message || err}. Attempting to reconnect...`, true);
        reconnectAndListen();
        return;
      }

      try {
        // Standard message or reply
        if (event.type === 'message' || event.type === 'message_reply') {
          await handleMessage(api, event);
        } else if (event.logMessageType === 'log:thread-name') {
          await handleThreadNameChange(api, event);
        } else if (event.logMessageType === 'log:user-nickname') {
          await handleNicknameChange(api, event);
        } else if (event.logMessageType === 'log:thread-image') {
          await handleGroupImageChange(api, event);
        } else if (event.logMessageType === 'log:subscribe') {
          await handleBotAddedToGroup(api, event);
        }
      } catch (e) {
        emitLog(`❌ Handler crashed: ${e.message || e}. Event type: ${event.type}`, true);
      }
    });
    emitLog('✅ Listener started.');
  } catch (e) {
    emitLog('❌ startListening exception: ' + e.message, true);
    reconnectAndListen();
  }
}

function reconnectAndListen() {
  reconnectAttempt++;
  emitLog(`🔄 Reconnect attempt #${reconnectAttempt}...`);

  if (botAPI) {
    try {
      if (typeof botAPI.stopListening === 'function') {
        botAPI.stopListening();
      }
    } catch (e) {
      emitLog(`❌ Failed to stop listener: ${e.message || e}`, true);
    }
  }

  if (reconnectAttempt > 5) {
    emitLog('❌ Maximum reconnect attempts reached. Restarting login process.', true);
    initializeBot(currentCookies, prefix, adminID);
  } else {
    setTimeout(() => {
      if (botAPI) {
        startListening(botAPI);
      } else {
        initializeBot(currentCookies, prefix, adminID);
      }
    }, 5000);
  }
}

async function setBotNicknamesInGroups() {
  if (!botAPI) return;
  try {
    const threads = await botAPI.getThreadList(100, null, ['GROUP']);
    const botID = botAPI.getCurrentUserID();
    for (const thread of threads) {
      try {
        const threadInfo = await botAPI.getThreadInfo(thread.threadID);
        if (threadInfo && threadInfo.nicknames && threadInfo.nicknames[botID] !== botNickname) {
          await botAPI.changeNickname(botNickname, thread.threadID, botID);
          emitLog(`✅ Bot's nickname set in group: ${thread.threadID}`);
        }
      } catch (e) {
        emitLog(`❌ Error setting nickname in group ${thread.threadID}: ${e.message || e}`, true);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (e) {
    emitLog(`❌ Error getting thread list for nickname check: ${e.message || e}`, true);
  }
}

async function sendStartupMessage() {
  if (!botAPI) return;
  const startupMessage = `😈𝗔𝗟𝗟 𝗛𝗔𝗧𝗘𝗥 𝗞𝗜 𝗠𝗔𝗔 𝗖𝗛𝗢𝗗𝗡𝗘 𝗩𝗔𝗟𝗔 𝗗𝗔𝗥𝗜𝗡𝗗𝗔 𝗕𝗢𝗧 𝗛𝗘𝗥𝗘😈`;
  try {
    const threads = await botAPI.getThreadList(100, null, ['GROUP']);
    for (const thread of threads) {
      botAPI.sendMessage(startupMessage, thread.threadID).catch(e => emitLog(`❌ Error sending startup message to ${thread.threadID}: ${e.message || e}`, true));
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (e) {
    emitLog(`❌ Error getting thread list for startup message: ${e.message || e}`, true);
  }
}

async function updateJoinedGroups(api) {
  try {
    const threads = await api.getThreadList(100, null, ['GROUP']);
    joinedGroups = new Set(threads.map(t => t.threadID));
    emitGroups();
    emitLog('✅ Joined groups list updated successfully.');
  } catch (e) {
    emitLog('❌ Failed to update joined groups: ' + (e && e.message ? e.message : e), true);
  }
}

function emitGroups() {
  try { io.emit('groupsUpdate', Array.from(joinedGroups)); } catch (e) { /* ignore */ }
}

// --- WEB SERVER & DASHBOARD ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/configure', (req, res) => {
  try {
    const cookies = JSON.parse(req.body.cookies);
    prefix = req.body.prefix || '/';
    adminID = req.body.adminID;

    if (!Array.isArray(cookies) || cookies.length === 0) {
      return res.status(400).send('Error: Invalid cookies format. Please provide a valid JSON array of cookies.');
    }
    if (!adminID) {
      return res.status(400).send('Error: Admin ID is required.');
    }

    // Persist config immediately
    const cfg = { botNickname, cookies, prefix, adminID };
    fs.writeFileSync('config.json', JSON.stringify(cfg, null, 2));

    res.send('Bot configured successfully! Starting...');
    initializeBot(cookies, prefix, adminID);
  } catch (e) {
    res.status(400).send('Error: Invalid configuration. Please check your input.');
    emitLog('Configuration error: ' + (e && e.message ? e.message : e), true);
  }
});

// --- Auto-load config if exists ---
try {
  if (fs.existsSync('config.json')) {
    const loadedConfig = JSON.parse(fs.readFileSync('config.json'));
    if (loadedConfig.botNickname) {
      botNickname = loadedConfig.botNickname;
      emitLog('✅ Loaded bot nickname from config.json.');
    }
    if (loadedConfig.cookies && loadedConfig.cookies.length > 0) {
      // set prefix/adminID if present
      prefix = loadedConfig.prefix || prefix;
      adminID = loadedConfig.adminID || adminID;
      emitLog('✅ Cookies found in config.json. Initializing bot automatically...');
      initializeBot(loadedConfig.cookies, prefix, adminID);
    } else {
      emitLog('❌ No cookies found in config.json. Please configure the bot using the dashboard.');
    }
  } else {
    emitLog('❌ No config.json found. You will need to configure the bot via the dashboard.');
  }
} catch (e) {
  emitLog('❌ Error loading config file: ' + (e && e.message ? e.message : e), true);
}

const PORT = process.env.PORT || 20868;
server.listen(PORT, () => {
  emitLog(`✅ Server running on port ${PORT}`);
});

io.on('connection', (socket) => {
  emitLog('✅ Dashboard client connected');
  socket.emit('botlog', `Bot status: ${botAPI ? 'Started' : 'Not started'}`);
  socket.emit('groupsUpdate', Array.from(joinedGroups));
});

// --- Event handlers & command implementations ---
// Most of these are from your original code, with small fixes and safety checks.

async function handleBotAddedToGroup(api, event) {
  try {
    const botID = api.getCurrentUserID();
    const logData = event.logMessageData || {};
    const added = logData.addedParticipants || [];
    if (added.some(p => p.userFbId === botID || p.userFbId === botID.toString())) {
      const threadID = event.threadID;
      await api.changeNickname(botNickname, threadID, botID).catch(() => {});
      await api.sendMessage(`😈HATER KI MAA CHODNE 𝗩𝗔𝗟𝗔 𝗗𝗔𝗥𝗜𝗡𝗗𝗔 𝗕𝗢𝗧 𝗛𝗘𝗥𝗘😈`, threadID).catch(() => {});
      emitLog(`✅ Bot added to new group: ${threadID}. Sent welcome message and set nickname.`);
    }
  } catch (e) {
    emitLog('❌ Error in handleBotAddedToGroup: ' + (e && e.message ? e.message : e), true);
  }
}

async function formatMessage(api, event, mainMessage) {
  const { senderID } = event;
  let senderName = 'User';
  try {
    const userInfo = await api.getUserInfo(senderID);
    senderName = userInfo && userInfo[senderID] && userInfo[senderID].name ? userInfo[senderID].name : 'User';
  } catch (e) {
    emitLog('❌ Error fetching user info: ' + (e && e.message ? e.message : e), true);
  }

  const styledMentionBody = ` ⚜ ${senderName}⚜\n`;
  const fromIndex = styledMentionBody.indexOf(senderName);

  const mentionObject = {
    tag: senderName,
    id: senderID,
    fromIndex: fromIndex
  };

  const finalMessage = `${styledMentionBody}\n${mainMessage}${signature}${separator}`;

  return {
    body: finalMessage,
    mentions: [mentionObject]
  };
}

async function handleMessage(api, event) {
  try {
    // Support both message objects where body is event.body or event.message
    const threadID = event.threadID || event.threadId;
    const senderID = event.senderID || event.senderId || event.author;
    const body = event.body || event.message || '';
    const mentions = event.mentions || {};

    const isAdmin = senderID === adminID;

    // quick ignore if bot not initialized
    if (!api) return;

    // 1) admin mention quick reaction
    if (mentions && Object.keys(mentions).includes(adminID)) {
      const abuses = ["ALL HATERS FUCKED BY ME YOYR CMND HAS BEEN ACTIVED☠"];
      const randomAbuse = abuses[Math.floor(Math.random() * abuses.length)];
      const formattedAbuse = await formatMessage(api, event, randomAbuse);
      return api.sendMessage(formattedAbuse, threadID).catch(e => emitLog('❌ sendMessage error: ' + (e && e.message ? e.message : e), true));
    }

    // 2) triggers and small replies
    if (body) {
      const lowerCaseBody = body.toLowerCase();
      let replyMessage = '';
      let isReply = false;

      if (lowerCaseBody.includes('mkc')) {
        replyMessage = `😈𝗕𝗢𝗟 𝗕𝗢𝗫𝗗𝗜𝗞𝗘 𝗞𝗬𝗔 𝗞𝗔𝗔𝗠 𝗛𝗔𝗜😈`;
        isReply = true;
      } else if (lowerCaseBody.includes('teri maa chod dunga')) {
        replyMessage = `😜𝗧𝗘𝗥𝗘 𝗦𝗘 𝗖𝗛𝗜𝗡𝗧𝗶  𝗡𝗔𝗛𝗜 𝗖𝗛𝗨𝗗𝗧𝗜 𝗔𝗨𝗥 𝗧𝗨 𝗠𝗔𝗔 𝗖𝗛𝗢𝗗 𝗗𝗘𝗚𝗔😜`;
        isReply = true;
      } else if (lowerCaseBody.includes('chutiya')) {
        replyMessage = `😭𝗧𝗨 𝗖𝗛𝗨𝗧𝗜𝗬𝗔 𝗧𝗘𝗥𝗔 𝗕𝗔𝗔𝗣 𝗖𝗛𝗨𝗧𝗜𝗬𝗔 𝗧𝗘𝗥𝗔 𝗣𝗨𝗥𝗔 𝗞𝗛𝗔𝗡𝗗𝗔𝗡 𝗖𝗛𝗨𝗧𝗜𝗬𝗔 𝗡𝗜𝗞𝗔𝗟 𝗠𝗔𝗗𝗔𝗥𝗫𝗖𝗛𝗢𝗗😭`;
        isReply = true;
      } else if (lowerCaseBody.includes('boxdika')) {
        replyMessage = `🥺𝗟𝗢𝗛𝗘 𝗞𝗔 𝗟𝗨𝗡𝗗 𝗛𝗔𝗜 𝗠𝗘𝗥𝗔 𝗚𝗔𝗥𝗔𝗠 𝗞𝗔𝗥 𝗞𝗘 𝗚𝗔𝗔𝗡𝗗 𝗠𝗔𝗜 𝗗𝗘 𝗗𝗨𝗚𝗔 🥺`;
        isReply = true;
      } else if (lowerCaseBody.trim() === 'bot') {
        const botResponses = [
          `😎CHUP KAR BEY KUTYY😂`,
          `😈𝗔𝗕𝗘 𝗕𝗢𝗧 𝗕𝗢𝗧 𝗡𝗔 𝗞𝗔𝗥 𝗧𝗘𝗥𝗜 𝗚𝗔𝗔𝗡𝗗 𝗠𝗔𝗔𝗥 𝗟𝗨𝗚𝗔 𝗠𝗔𝗜😈`,
          `😜𝗕𝗢𝗟 𝗞𝗜𝗦𝗞𝗜 𝗠𝗔𝗔 𝗖𝗛𝗢𝗗𝗡𝗜 𝗛𝗔𝗜😜`,
          `🙈𝗝𝗔𝗬𝗔𝗗𝗔 𝗕𝗢𝗧 𝗕𝗢𝗧 𝗕𝗢𝗟𝗘𝗚𝗔 𝗧𝗢 𝗧𝗘𝗥𝗜 𝗚𝗔𝗔𝗡𝗗 𝗠𝗔𝗜 𝗣𝗘𝗧𝗥𝗢𝗟 𝗗𝗔𝗔𝗟 𝗞𝗘 𝗝𝗔𝗟𝗔 𝗗𝗨𝗚𝗔😬`,
          `😜𝗧𝗘𝗥𝗜 𝗠𝗞𝗖 𝗗𝗢𝗦𝗧😜`,
          `🙊BOT NI TERI BAJI KA YAR HUN DOST🙊`,
          `😈𝗔𝗕𝗘 𝗞𝗔𝗧𝗘 𝗟𝗨𝗡𝗗 𝗞𝗘 𝗞𝗬𝗔 𝗕𝗢𝗧 𝗕𝗢𝗧 𝗞𝗔𝗥 𝗥𝗔 𝗛𝗔𝗜😈`,
          `🥲𝗖𝗛𝗔𝗟 𝗔𝗣𝗡𝗜 𝗞𝗔𝗟𝗜 𝗚𝗔𝗔𝗡𝗗 𝗗𝗜𝗞𝗛𝗔🥲`
        ];
        replyMessage = botResponses[Math.floor(Math.random() * botResponses.length)];
        isReply = true;
      }

      if (isReply && replyMessage) {
        const formattedReply = await formatMessage(api, event, replyMessage);
        return api.sendMessage(formattedReply, threadID).catch(e => emitLog('❌ sendMessage error: ' + (e && e.message ? e.message : e), true));
      }
    }

    // 3) commands (prefix)
    if (!body || !body.startsWith(prefix)) return;

    const args = body.slice(prefix.length).trim().split(/ +/);
    const command = (args.shift() || '').toLowerCase();

    let commandReply = '';

    switch (command) {
      case 'group':
        await handleGroupCommand(api, event, args, isAdmin);
        return;
      case 'nickname':
        await handleNicknameCommand(api, event, args, isAdmin);
        return;
      case 'botnick':
        await handleBotNickCommand(api, event, args, isAdmin);
        return;
      case 'tid':
        commandReply = `Group ID: ${threadID}`;
        break;
      case 'uid':
        if (mentions && Object.keys(mentions).length > 0) {
          const mentionedID = Object.keys(mentions)[0];
          commandReply = `User ID: ${mentionedID}`;
        } else {
          commandReply = `Your ID: ${senderID}`;
        }
        break;
      case 'fyt':
        await handleFightCommand(api, event, args, isAdmin);
        return;
      case 'stop':
        await handleStopCommand(api, event, isAdmin);
        return;
      case 'target':
        await handleTargetCommand(api, event, args, isAdmin);
        return;
      case 'help':
        await handleHelpCommand(api, event);
        return;
      case 'photolock':
        await handlePhotoLockCommand(api, event, args, isAdmin);
        return;
      case 'gclock':
        await handleGCLock(api, event, args, isAdmin);
        return;
      case 'gcremove':
        await handleGCRemove(api, event, isAdmin);
        return;
      case 'nicklock':
        await handleNickLock(api, event, args, isAdmin);
        return;
      case 'nickremoveall':
        await handleNickRemoveAll(api, event, isAdmin);
        return;
      case 'nickremoveoff':
        await handleNickRemoveOff(api, event, isAdmin);
        return;
      case 'status':
        await handleStatusCommand(api, event, isAdmin);
        return;
      default:
        if (!isAdmin) {
          commandReply = `Teri ma ki ch.. tere baap ka nokar nahi hu randi ke!`;
        } else {
          commandReply = `Ye h mera prefix ${prefix} ko prefix ho use lgake bole ye h mera prefix or Chikna mera boss h ab bol mdrxhod kya kam h tujhe mujhse bsdike`;
        }
    }

    if (commandReply) {
      const formattedReply = await formatMessage(api, event, commandReply);
      await api.sendMessage(formattedReply, threadID).catch(e => emitLog('❌ sendMessage error: ' + (e && e.message ? e.message : e), true));
    }

  } catch (err) {
    emitLog('❌ Error in handleMessage: ' + (err && err.message ? err.message : err), true);
  }
}

async function handleGroupCommand(api, event, args, isAdmin) {
  try {
    const threadID = event.threadID || event.threadId;
    if (!isAdmin) {
      const reply = await formatMessage(api, event, "Permission denied, you are not the admin.");
      return await api.sendMessage(reply, threadID);
    }
    const subCommand = (args.shift() || '').toLowerCase();
    if (subCommand === 'on') {
      const groupName = args.join(' ').trim();
      if (!groupName) {
        const reply = await formatMessage(api, event, "Use correct  Format : /group on <group_name>");
        return await api.sendMessage(reply, threadID);
      }
      lockedGroups[threadID] = groupName;
      await api.setTitle(groupName, threadID).catch(e => emitLog('❌ setTitle error: ' + (e && e.message ? e.message : e), true));
      const reply = await formatMessage(api, event, `☠ GROUP NAME LOCK HO GAYA HAI GAND TAK ZOR LAGAO AB CHANGE NI HOGA 😂👍`);
      await api.sendMessage(reply, threadID);
    } else if (subCommand === 'off') {
      delete lockedGroups[threadID];
      const reply = await formatMessage(api, event, "Group name unlocked successfully.");
      await api.sendMessage(reply, threadID);
    } else {
      const reply = await formatMessage(api, event, "Use /group on <name> or /group off");
      await api.sendMessage(reply, threadID);
    }
  } catch (error) {
    emitLog('❌ Error in handleGroupCommand: ' + (error && error.message ? error.message : error), true);
    try { await api.sendMessage("An error occurred while locking the group name.", event.threadID); } catch(e){/*ignore*/ }
  }
}

async function handleNicknameCommand(api, event, args, isAdmin) {
  const threadID = event.threadID || event.threadId;
  if (!isAdmin) return api.sendMessage(await formatMessage(api, event, "Permission denied, you are not the admin."), threadID);
  const subCommand = (args.shift() || '').toLowerCase();
  if (subCommand === 'on') {
    const nickname = args.join(' ').trim();
    if (!nickname) return api.sendMessage(await formatMessage(api, event, "Use correct Format : /nickname on <nickname>"), threadID);

    if (!lockedNicknames[threadID]) lockedNicknames[threadID] = { default: null, users: {} };
    lockedNicknames[threadID].default = nickname;

    const threadInfo = await api.getThreadInfo(threadID);
    for (const pid of threadInfo.participantIDs) {
      if (pid !== adminID) {
        try { await api.changeNickname(nickname, threadID, pid); } catch (e) { emitLog('❌ changeNickname error: ' + (e && e.message ? e.message : e), true); }
      }
    }
    return api.sendMessage(await formatMessage(api, event, `😎 All nicknames locked to: ${nickname}`), threadID);
  } else if (subCommand === 'off') {
    delete lockedNicknames[threadID];
    return api.sendMessage(await formatMessage(a
