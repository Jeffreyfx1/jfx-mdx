const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

module.exports = {
  SESSION_ID: process.env.SESSION_ID || "",

  AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
  AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
  AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
  AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*SEEN YOUR STATUS BY JFX MD-X🤍*",

  WELCOME: process.env.WELCOME || "true",
  ADMIN_EVENTS: process.env.ADMIN_EVENTS || "false",
  ANTI_LINK: process.env.ANTI_LINK || "true",
  MENTION_REPLY: process.env.MENTION_REPLY || "false",

  MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://files.catbox.moe/z62ts0.jpg",
  PREFIX: process.env.PREFIX || ".",
  BOT_NAME: process.env.BOT_NAME || "JFX MD-X",
  STICKER_NAME: process.env.STICKER_NAME || "JFX MD-X",

  CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
  CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",

  DELETE_LINKS: process.env.DELETE_LINKS || "true",
  OWNER_NUMBER: process.env.OWNER_NUMBER || "+2349046157539",
  OWNER_NAME: process.env.OWNER_NAME || "JEPHTER TECH",
  DESCRIPTION: process.env.DESCRIPTION || "*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ JEPHTER TECH*",

  ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/z62ts0.jpg",
  LIVE_MSG: process.env.LIVE_MSG || "> Alive & Ready — *JFX MD-X* ⚡",

  READ_MESSAGE: process.env.READ_MESSAGE || "false",
  AUTO_REACT: process.env.AUTO_REACT || "false",
  ANTI_BAD: process.env.ANTI_BAD || "false",
  MODE: process.env.MODE || "public",
  ANTI_LINK_KICK: process.env.ANTI_LINK_KICK || "true",

  AUTO_VOICE: process.env.AUTO_VOICE || "false",
  AUTO_STICKER: process.env.AUTO_STICKER || "false",
  AUTO_REPLY: process.env.AUTO_REPLY || "false",
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "false",
  PUBLIC_MODE: process.env.PUBLIC_MODE || "true",
  AUTO_TYPING: process.env.AUTO_TYPING || "false",
  READ_CMD: process.env.READ_CMD || "false",

  DEV: process.env.DEV || "+2349046157539",
  ANTI_VV: process.env.ANTI_VV || "true",
  ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "log",
  AUTO_RECORDING: process.env.AUTO_RECORDING || "false"
};
