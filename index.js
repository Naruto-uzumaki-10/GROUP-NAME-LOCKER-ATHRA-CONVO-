const express = require('express');
const bodyParser = require('body-parser');
const login = require('ws3-fca');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ================= GLOBAL =================
let api = null;
let adminID = null;
let prefix = '/';
let botNickname = 'HR BOT';
let joinedGroups = new Set();
let lockedGroups = {};
let lockedNicknames = {};
let reconnectAttempts = 0;

const PORT = process.env.PORT || 20868;

// ================= LOGGER =================
function log(message, isError = false) {
  const msg = `[${new Date().toISOString()}] ${isError ? '❌' : '✅'} ${message}`;
  console.log(msg);
  io.emit('botlog', msg);
}

// ================= CONFIG =================
function loadConfig() {
  if (!fs.existsSync('config.json')) return null;
  return JSON.parse(fs.readFileSync('config.json'));
}

function saveConfig(data) {
  fs.writeFileSync('config.json', JSON.stringify(data, null, 2));
}

// ================= BOT START =================
function startBot(cookies, newPrefix, newAdminID) {
  prefix = newPrefix || prefix;
  adminID = newAdminID || adminID;

  login({ appState: cookies }, (err, botApi) => {
    if (err) {
      log('Login failed. Retrying...', true);
      return setTimeout(() => startBot(cookies, prefix, adminID), 10000);
    }

    api = botApi;
    api.setOptions({ listenEvents: true, selfListen: false });

    log('Bot logged in successfully');
    reconnectAttempts = 0;

    api.listenMqtt(async (err, event) => {
      if (err) {
        log('Listener crashed. Reconnecting...', true);
        reconnect();
        return;
      }

      if (event.type === 'message') {
        handleMessage(event);
      }

      if (event.logMessageType === 'log:thread-name') {
        if (lockedGroups[event.threadID]) {
          api.setTitle(lockedGroups[event.threadID], event.threadID);
        }
      }
    });
  });
}

function reconnect() {
  reconnectAttempts++;
  if (reconnectAttempts > 5) {
    log('Max reconnect reached. Restarting login...', true);
    const cfg = loadConfig();
    if (cfg) startBot(cfg.cookies, cfg.prefix, cfg.adminID);
  }
}

// ================= MESSAGE HANDLER =================
async function handleMessage(event) {
  const threadID = event.threadID;
  const senderID = event.senderID;
  const body = event.body;

  if (!body) return;

  // Auto reply simple
  if (body.toLowerCase() === 'bot') {
    return api.sendMessage("Hello 👋 I am active.", threadID);
  }

  if (!body.startsWith(prefix)) return;

  const args = body.slice(prefix.length).trim().split(" ");
  const command = args.shift().toLowerCase();
  const isAdmin = senderID === adminID;

  switch (command) {

    case 'help':
      return api.sendMessage(
        `Available Commands:
${prefix}help
${prefix}group on <name>
${prefix}group off
${prefix}nickname on <name>
${prefix}nickname off`,
        threadID
      );

    case 'group':
      if (!isAdmin) return api.sendMessage("Admin only command.", threadID);

      if (args[0] === 'on') {
        const name = args.slice(1).join(" ");
        if (!name) return api.sendMessage("Provide group name.", threadID);

        lockedGroups[threadID] = name;
        await api.setTitle(name, threadID);
        return api.sendMessage("Group name locked ✅", threadID);
      }

      if (args[0] === 'off') {
        delete lockedGroups[threadID];
        return api.sendMessage("Group unlock successful ✅", threadID);
      }

      break;

    case 'nickname':
      if (!isAdmin) return api.sendMessage("Admin only command.", threadID);

      if (args[0] === 'on') {
        const nick = args.slice(1).join(" ");
        if (!nick) return api.sendMessage("Provide nickname.", threadID);

        lockedNicknames[threadID] = nick;
        const info = await api.getThreadInfo(threadID);

        for (let id of info.participantIDs) {
          if (id !== adminID) {
            try {
              await api.changeNickname(nick, threadID, id);
            } catch {}
          }
        }

        return api.sendMessage("Nickname locked ✅", threadID);
      }

      if (args[0] === 'off') {
        delete lockedNicknames[threadID];
        return api.sendMessage("Nickname lock disabled ✅", threadID);
      }

      break;

    default:
      return api.sendMessage("Unknown command. Use /help", threadID);
  }
}

// ================= DASHBOARD =================
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/configure', (req, res) => {
  try {
    const cookies = JSON.parse(req.body.cookies);
    const cfg = {
      cookies,
      prefix: req.body.prefix || '/',
      adminID: req.body.adminID
    };

    saveConfig(cfg);
    startBot(cfg.cookies, cfg.prefix, cfg.adminID);

    res.send("Bot started successfully ✅");
  } catch {
    res.status(400).send("Invalid configuration");
  }
});

// ================= AUTO LOAD =================
const config = loadConfig();
if (config && config.cookies) {
  log("Auto loading config...");
  startBot(config.cookies, config.prefix, config.adminID);
} else {
  log("No config found. Use dashboard to configure.", true);
}

server.listen(PORT, () => {
  log(`Server running on port ${PORT}`);
});
