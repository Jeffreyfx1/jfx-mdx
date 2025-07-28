// === [BOILERPLATE START] ===
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const l = console.log;
const fs = require('fs');
const P = require('pino');
const path = require('path');
const os = require('os');
const util = require('util');
const axios = require('axios');
const { File } = require('megajs');
const { fromBuffer } = require('file-type');
const FileType = require('file-type');
const ff = require('fluent-ffmpeg');
const bodyparser = require('body-parser');

const qrcode = require('qrcode-terminal');
const config = require('./config');
const { sms, downloadMediaMessage, AntiDelete } = require('./lib');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const {
  AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings,
  saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata,
  saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage
} = require('./data');

const prefix = config.PREFIX;
const ownerNumber = ['2349046157539']; // ✅ Jephter Tech’s number

const tempDir = path.join(os.tmpdir(), 'cache-temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
setInterval(() => {
  fs.readdir(tempDir, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(tempDir, file), err => {
        if (err) throw err;
      });
    }
  });
}, 5 * 60 * 1000);

// === SESSION SETUP ===
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
  if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
  const sessdata = config.SESSION_ID.replace("nexus~", '');
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
  filer.download((err, data) => {
    if (err) throw err;
    fs.writeFile(__dirname + '/sessions/creds.json', data, () => {
      console.log("Session downloaded ✅");
    });
  });
}

// === SERVER INIT ===
const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

// === MAIN CONNECT FUNCTION ===
async function connectToWA() {
  console.log("Connecting to WhatsApp ⏳️...");
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/');
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version
  });

  conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        connectToWA();
      }
    } else if (connection === 'open') {
      console.log('🧬 Installing Plugins');
      fs.readdirSync("./plugins/").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() == ".js") {
          require("./plugins/" + plugin);
        }
      });
      console.log('Plugins installed successful ✅');
      console.log('Bot connected to WhatsApp ✅');

      // ✅ Welcome banner customized
      const up = `*✨ Hello, JFX MD-X Legend! ✨*

╭─〔 *🤖 JFX MD-X BOT* 〕  
├─▸ *Speed. Simplicity. Stability by JEPHTER TECH*  
╰─➤ *Your Smart WhatsApp Sidekick is Online!*

*❤️ Thanks for choosing JFX MD-X!*

╭──〔 🔗 *Quick Links* 〕  
├─ 📢 *Official Channel:*  
│   Click [**Here**](${config.CHANNEL_LINK}) to join!  
╰─🛠️ *Prefix:* \`${prefix}\`

> _© Powered by Jephter Tech_`;

      conn.sendMessage(conn.user.id, {
        image: { url: `https://files.catbox.moe/o3mkn9.jpeg` },
        caption: up
      });
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // 📥 Anti-delete listener
  conn.ev.on('messages.update', async updates => {
    for (const update of updates) {
      if (update.update.message === null) {
        await AntiDelete(conn, updates);
      }
    }
  });

  // 🕵️‍♂️ Read and Status features
  conn.ev.on('messages.upsert', async (mek) => {
    mek = mek.messages[0];
    if (!mek.message) return;
    mek.message = (getContentType(mek.message) === 'ephemeralMessage')
      ? mek.message.ephemeralMessage.message
      : mek.message;

    if (config.READ_MESSAGE === 'true') {
      await conn.readMessages([mek.key]);
    }

    if (mek.key.remoteJid === 'status@broadcast') {
      if (config.AUTO_STATUS_SEEN === "true") {
        await conn.readMessages([mek.key]);
      }

      if (config.AUTO_STATUS_REACT === "true") {
        const emojis = ['💖', '🔥', '💫', '🌟', '❤️', '🤍', '👀'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        await conn.sendMessage(mek.key.remoteJid, {
          react: {
            text: randomEmoji,
            key: mek.key,
          }
        });
      }

      if (config.AUTO_STATUS_REPLY === "true") {
        const user = mek.key.participant;
        await conn.sendMessage(user, {
          text: config.AUTO_STATUS_MSG,
          react: { text: '💜', key: mek.key }
        }, { quoted: mek });
      }
    }

    await saveMessage(mek);

    const m = sms(conn, mek);
    const from = mek.key.remoteJid;
    const sender = mek.key.fromMe
      ? (conn.user.id.split(':')[0] + '@s.whatsapp.net')
      : (mek.key.participant || mek.key.remoteJid);
    const senderNumber = sender.split('@')[0];
    const botNumber = conn.user.id.split(':')[0];
    const pushname = mek.pushName || 'Unknown';
    const isCmd = m.text?.startsWith(prefix);
    const body = m.text;
    const command = isCmd ? body.slice(prefix.length).split(' ')[0] : '';
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(' ');
    const text = args.join(' ');
    const reply = (teks) => {
      conn.sendMessage(from, { text: teks }, { quoted: mek });
    };

    const isOwner = ['2349046157539'].includes(senderNumber); // ✅ Only you now
    const isCreator = isOwner;

    // 💻 Owner commands
    if (isCreator && body.startsWith('%')) {
      try {
        const res = eval(body.slice(1));
        reply(util.format(res));
      } catch (err) {
        reply(util.format(err));
      }
    }

    if (isCreator && body.startsWith('$')) {
      try {
        const result = await eval(`(async () => { ${body.slice(1)} })()`);
        reply(util.format(result));
      } catch (err) {
        reply(util.format(err));
      }
    }

    // 👑 Auto React for owner
    if (senderNumber === "2349046157539" && !m.message.reactionMessage) {
      m.react("💙");
    }
  });
}

connectToWA();
