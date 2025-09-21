const donPm = new Set();
const set_of_filters = new Set();
let spam_block = {run:false};
const fs = require("fs");
const simpleGit = require('simple-git');
const git = simpleGit();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  jidNormalizedUser,
  normalizeMessageContent,
  fetchLatestBaileysVersion,
  DisconnectReason,
  proto,
  Browsers,
  getAggregateVotesInPollMessage,
  getKeyAuthor,
  decryptPollVote
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const axios = require('axios');
const express = require("express");
const cron = require('node-cron');
const app = express();

const path = require("path");
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');
optionalDependencies = {
  "@ffmpeg-installer/darwin-arm64": "4.1.5",
  "@ffmpeg-installer/darwin-x64": "4.1.0",
  "@ffmpeg-installer/linux-arm": "4.1.3",
  "@ffmpeg-installer/linux-arm64": "4.1.4",
  "@ffmpeg-installer/linux-ia32": "4.1.0",
  "@ffmpeg-installer/linux-x64": "4.1.0",
  "@ffmpeg-installer/win32-ia32": "4.1.0",
  "@ffmpeg-installer/win32-x64": "4.1.0"
}
let platform = os.platform() + '-' + os.arch();
let packageName = '@ffmpeg-installer/' + platform;
if (optionalDependencies[packageName]) {
  const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
  ffmpeg.setFfmpegPath(ffmpegPath);
}
const { platforms } = require('./base');
const {
  commands,
  serialize,
  WAConnection
} = require('./main');
const {
  isAdmin,
  isBotAdmin,
   parsedJid,
  extractUrlsFromString
} = require('./handler');
const config = require('../config');
const {
  sleep
} = require('i-nrl');
const {GenListMessage} = require('./youtube');
const {
  groupDB,
  personalDB
} = require("./database");
let ext_plugins = 0;
String.prototype.format = function() {p
  let i = 0,
    args = arguments;
  return this.replace(/{}/g, function() {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};
const MOD = (config.WORKTYPE && config.WORKTYPE.toLowerCase().trim()) == 'public' ? 'public' : 'private';
const PREFIX_FOR_POLL = (!config.PREFIX || config.PREFIX == 'false' || config.PREFIX == 'null') ? "" : (config.PREFIX.includes('[') && config.PREFIX.includes(']')) ? config.PREFIX[2] : config.PREFIX.trim();

function insertSudo() {
  if (config.SUDO == 'null' || config.SUDO == 'false' || !config.SUDO) return []
  config.SUDO = config.SUDO.replaceAll(' ', '');
  return config.SUDO.split(/[;,|]/) || [config.SUDO];
};
function toMessage(msg) {
  return !msg ? false : msg == 'null' ? false : msg == 'false' ? false : msg == 'off' ? false : msg;
}
function removeFile(FilePath) {
  const tmpFiless = fs.readdirSync('./' + FilePath)
  const ext = ['.mp4', '.gif', '.webp', '.jpg', '.jpeg', '.png', '.mp3', '.wav', '.bin', '.opus'];
  tmpFiless.map((tmpFiles) => {
    if (FilePath) {
      if (ext.includes(path.extname(tmpFiles).toLowerCase())) {
        fs.unlinkSync('./' + FilePath + '/' + tmpFiles)
      }
    } else {
      if (ext.includes(path.extname(tmpFiles).toLowerCase())) {
        fs.unlinkSync('./' + tmpFiles)
      }
    }
  });
  return true
};
console.log('🤍 await few secounds to start Bot');

const store = {};
store.poll_message = {
  message: []
};

//=================================================================================

const init = async (file_path) => {
  if (!fs.existsSync('./' + file_path)) fs.mkdirSync('./' + file_path);
  console.log('🍁 generating session!!');

  if (!config.SESSION_ID) {
      console.log('please provide a session id in config.js\n\nscan from server🥲');
    console.log('please provide a session id in config.js\n\nscan from server🥹');
    console.log('please provide a session id in config.js\n\nscan from server😥');
    await sleep(60000);
    process.exit(1);
  }

  const authDir = `./${file_path}/auth_info_baileys`;
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir);
   
    await downloadSessionFromMega(file_path);
  }
};
//=================================================================================
async function downloadSessionFromMega(file_path) {
  const { File } = require('megajs');
  try {
    const sessPart = config.SESSION_ID.replace('KAISEN~', '');
    const megaUrl = `https://mega.nz/file/${sessPart}`;
    const file = File.fromURL(megaUrl);
    console.log('🍓 connect session...');
    const buffer = await file.downloadBuffer();
    const targetPath = `./${file_path}/auth_info_baileys/creds.json`;
    fs.writeFileSync(targetPath, buffer);
    console.log('🍉 Session downloaded and saved successfully!');
  } catch (e) {
    console.log('❌ Failed to connect session :', e.message || e);
    console.log("🎐 Rebooting in 45 seconds...");
    await sleep(45000);
    process.exit(0);
  }
   console.log(`🌲 auth file loaded from db`)
}
//=================================================================================
const connect = async (file_path) => {
  try {
    console.log("🌱 Syncing Database");
    await config.DATABASE.sync();
    const {
      state,
      saveCreds
    } = await useMultiFileAuthState(`./${file_path}/auth_info_baileys`);
    var { version } = await fetchLatestBaileysVersion();
  
    let conn = await makeWASocket({
      version,
      logger:  pino({ level: 'silent' }),
      browser: Browsers.macOS("Firefox"),
      printQRInTerminal: false,
      auth: state,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      getMessage: async (key) => {} 
      });
   conn.ev.on("creds.update", saveCreds);
    if (!conn.wcg) conn.wcg = {}
    conn = new WAConnection(conn);
   conn.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
     const statusCode = lastDisconnect?.error?.output?.statusCode || 0;
    console.log(`🛑 connection closed with status code: ${statusCode}`);
      switch (statusCode) {
      case DisconnectReason.badSession:
        console.log("❌ Bad Session File. Delete session and rescan QR.");
        break;
      case DisconnectReason.connectionClosed:
        console.log("⚠️ Connection closed. Reconnecting...");
        await sleep(3000);
        connect(file_path);
        break;
      case DisconnectReason.connectionLost:
        console.log("⚠️ Connection lost. Trying to reconnect...");
        await sleep(3000);
        connect(file_path);
        break;
      case DisconnectReason.connectionReplaced:
        console.log("⚠️ Connection replaced by a new session. You might be logged in elsewhere.");
        break;
      case DisconnectReason.loggedOut:
        console.log("🛑 Logged out. Delete session and rescan QR.");
        break;
      case DisconnectReason.restartRequired:
        console.log("🔁 Restart required. Reconnecting...");
        await sleep(3000);
        connect(file_path);
        break;
      case DisconnectReason.timedOut:
        console.log("⏱️ Connection timed out. Trying to reconnect...");
        await sleep(3000);
        connect(file_path);
        break;
      case DisconnectReason.multideviceMismatch:
        console.log("❌ Multi-device mismatch. Please re-login.");
        break;
      default:
        console.log(`❌ Unknown disconnect reason: ${statusCode}. Reconnecting...`);
        await sleep(3000);
        connect(file_path);
    }
  
  } else if (connection === "open") {
        const reactArray = ['🤍', '🍓', '🍄', '🎐', '🌸', '🍁', '🪼']
        const {
          ban,
          plugins,
          toggle,
          sticker_cmd,
          shutoff,
          login
        } = await personalDB(['ban', 'toggle', 'sticker_cmd', 'plugins', 'shutoff', 'login'], {
          content: {}
        }, 'get');
        for (const p in plugins) {
          try {
            const {
              data
            } = await axios(plugins[p] + '/raw');
            fs.writeFileSync(
              "./plugins/" + p + ".js",
              data
            );
            ext_plugins += 1
            require("./plugins/" + p + ".js");
          } catch (e) {
            ext_plugins = 1
            await personalDB(['plugins'], {
              content: {
                id: p
              }
            }, 'delete');
            console.log('there is an error in plugin\nplugin name: ' + p);
            console.log(e)
          }
        }
        console.log('🎀 external plugins installed successfully')
        fs.readdirSync("./plugins").forEach((plugin) => {
          if (path.extname(plugin).toLowerCase() == ".js") {
            try {
              require("../plugins/" + plugin);
            } catch (e) {
              console.log(e)
              fs.unlinkSync("./plugins/" + plugin);
            }
          } 
          });
     console.log("🏓 plugin installed successfully");
  //=================================================================================
if (login !== 'true' && shutoff !== 'true') {
  let start_msg; 
  if (shutoff !== 'true') {
    await personalDB(['login'], { content: 'true' }, 'set');
 
    const { version } = require("../package.json");
    const botNumber = conn.user.id.split('@')[0]
    const mode = config.WORKTYPE;
    const prefix = config.PREFIX;
    start_msg = `
*╭━━━〔🍓𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦〕━━━✦*
*┃🌱 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 : ${botNumber}*
*┃👻 𝐏𝐑𝐄𝐅𝐈𝐗        : ${prefix}*
*┃🔮 𝐌𝐎𝐃𝐄        : ${mode}*
*┃☁️ 𝐏𝐋𝐀𝐓𝐅𝐎𝐑𝐌    : ${platforms()}*
*┃🍉 PLUGINS      : ${commands.length}*
*┃🎐 𝐕𝐄𝐑𝐒𝐈𝐎𝐍      : ${version}*
*╰━━━━━━━━━━━━━━━━━━╯*
`;
    if (start_msg) {
      await conn.sendMessage(conn.user.id, {
        text: start_msg
      });

      await conn.sendMessage(conn.user.id, {
        image: { url: 'https://files.catbox.moe/hwl3d4.jpg' },
        caption: start_msg
      });
    }
  }
   } else if (shutoff !== 'true') {
     const botNumber = conn.user.id.split('@')[0]
     console.log(`🍉 Connecting to WhatsApp ${botNumber}`);
   await conn.sendMessage(conn.user.id, {
    text: '_🌱 Bot has restarted~_'
  });
  }
   const createrS = await insertSudo();
        conn.ev.on('contacts.update', update => {
          for (let contact of update) {
            let id = conn.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = {
              id,
              name: contact.notify
            }
          }
        });
    const handleAntilink = require('./antilink');
    const handleAntiword = require('./antiword'); // ✅ Antiword import
    const autoReact = require('./autoreact'); 
const { handleStatusUpdate } = require('./autostatus');
conn.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    await handleStatusUpdate(conn, msg);
});
 conn.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (!msg?.message) return;
      const jid = msg.key.remoteJid;
      const isGroup = jid.endsWith('@g.us');
      const fromMe = msg.key.fromMe;
      if (fromMe) return;
        const sender = msg.key.participant || jid;
        const message = {
        chat: jid,
        sender,
        isGroup,
        message: msg,
        client: conn,
        react: async (emoji) => {
          return conn.sendMessage(jid, {
            react: {
              text: emoji,
              key: msg.key
            }
          });
        }
      };
    try {
        await handleAntilink(conn, msg);
        await handleAntiword(conn, msg);  
        await autoReact(message);
        
      } catch (err) {
        console.error('❌ Handler Error:', err);
      }
    });
const handleChatbot = require('./chatbot');
  conn.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg?.message) return;
        if (msg.key.fromMe) return;

        try {
       // run chatbot handler
          await handleChatbot(conn, msg, { groupDB, personalDB });
        } catch (err) {
          console.error('Handler Error:', err);
        }
      });
//=================================================================================

       const name = config.CMD_NAME;
    function externalPreview(profileImage, options = {}) {
      return {
          showAdAttribution: true,
           title: options.title || 'Welcome Message',
            body: options.body || name,
          thumbnailUrl: profileImage || 'https://i.imgur.com/U6d9F1v.png',
          sourceUrl: options.sourceUrl || 'https://whatsapp.com/channel/0029VaAKCMO1noz22UaRdB1Q',
          mediaType: 1,
          renderLargerThumbnail: true
      };
        }
        conn.ev.on('group-participants.update', async (update) => {
      const { id: groupJid, participants, action } = update;
      if (action !== 'add') return;

      // Get group metadata
      const groupMetadata = await conn.groupMetadata(groupJid).catch(() => {});
      const groupName = groupMetadata?.subject || 'Group';
      const groupSize = groupMetadata?.participants?.length || 'Unknown';

      // Check welcome config
      const { welcome } =
        (await groupDB(['welcome'], { jid: groupJid, content: {} }, 'get')) || {};
      if (welcome?.status !== 'true') return;

      const rawMessage = welcome.message || '';

      for (const user of participants) {
        const mentionTag = `@${user.split('@')[0]}`;

        // Get user profile pic or fallback
        let profileImage;
        try {
          profileImage = await conn.profilePictureUrl(user, 'image');
        } catch {
          profileImage = 'https://i.imgur.com/U6d9F1v.png';
        }

        // Replace placeholders
        let text = rawMessage
          .replace(/&mention/g, mentionTag)
          .replace(/&size/g, groupSize)
          .replace(/&name/g, groupName)
          .replace(/&pp/g, ''); // Remove &pp from message

        // Send welcome message
        if (rawMessage.includes('&pp')) {
          await conn.sendMessage(groupJid, {
             text,
              mentions: [user],
                      contextInfo: {
                          externalAdReply: externalPreview(profileImage)
                      }
          });
        } else {
          await conn.sendMessage(groupJid, {
            text,
            mentions: [user],
          });
        }
      }
    });		
 
//=================================================================================

     function externalGoodbyePreview(profileImage, options = {}) {
        return {
            showAdAttribution: true,
            title: options.title || 'Goodbye Message',
            body: options.body || name,
            thumbnailUrl: profileImage || 'https://i.imgur.com/U6d9F1v.png',
            sourceUrl: options.sourceUrl || 'https://whatsapp.com/channel/0029VaAKCMO1noz22UaRdB1Q',
            mediaType: 1,
            renderLargerThumbnail: true
        };
     }
                 const sentGoodbye = new Set();

                 conn.ev.on('group-participants.update', async (update) => {
                   const { id: groupJid, participants, action } = update;

                   if (action !== 'remove') return; // ✅ Only on user left

                   const groupMetadata = await conn.groupMetadata(groupJid).catch(() => {});
                   const groupName = groupMetadata?.subject || 'Group';
                   const groupSize = groupMetadata?.participants?.length || 'Unknown';

                   const { exit } =
                     (await groupDB(['exit'], { jid: groupJid, content: {} }, 'get')) || {};

                   if (exit?.status !== 'true') return;

                   const rawMessage = exit.message || 'Goodbye &mention!';

                   for (const user of participants) {
                     const key = `${groupJid}_${user}`;
                     if (sentGoodbye.has(key)) return;
                     sentGoodbye.add(key);
                     setTimeout(() => sentGoodbye.delete(key), 10_000);

                     const mentionTag = `@${user.split('@')[0]}`;
                     let profileImage;

                     try {
                       profileImage = await conn.profilePictureUrl(user, 'image');
                     } catch {
                       profileImage = 'https://i.imgur.com/U6d9F1v.png';
                     }

                     const text = rawMessage
                       .replace(/&mention/g, mentionTag)
                       .replace(/&name/g, groupName)
                       .replace(/&size/g, groupSize)
                       .replace(/&pp/g, '');

                     if (rawMessage.includes('&pp')) {
                       await conn.sendMessage(groupJid, {
                         text,
                           mentions: [user],
                           contextInfo: {
                               externalAdReply: externalGoodbyePreview(profileImage)
                           }
                       });
                     } else {
                       await conn.sendMessage(groupJid, {
                         text,
                         mentions: [user],
                       });
                     }
                   }
                 });
    
//=================================================================================

          conn.ev.on("messages.upsert", async (chatUpdate) => {
        if (set_of_filters.has(chatUpdate.messages[0].key.id)) {
            set_of_filters.delete(chatUpdate.messages[0].key.id)
            return
          }
         const {
            pdm,
            antipromote,
            antidemote,
            filter,
            antidelete
          } = await groupDB(['pdm', 'antidemote', 'antipromote', 'filter', 'antiword', 'antidelete'], {
            jid: chatUpdate.messages[0].key.remoteJid
          }, 'get')
          if (chatUpdate.messages[0]?.messageStubType && shutoff != 'true') {
            const jid = chatUpdate.messages[0]?.key.remoteJid;
            const participant = chatUpdate.messages[0].messageStubParameters[0];
            const actor = chatUpdate.messages[0]?.participant;
            if (!jid || !participant || !actor) return;
            const botadmins = createrS.map(a => !!a);
            const botJid = jidNormalizedUser(conn.user.id)
            const groupMetadata = await conn.groupMetadata(jid).catch(e => {
              participants: []
            });
            const admins = (jid) => groupMetadata.participants.filter(v => v.admin !== null).map(v => v.id).includes(jid);
            if (chatUpdate.messages[0].messageStubType == proto?.WebMessageInfo?.StubType?.GROUP_PARTICIPANT_DEMOTE) {
              if (pdm == 'true') {
                await conn.sendMessage(jid, {
                  text: '_' + `@${actor.split('@')[0]} demoted @${participant.split("@")[0]} from admin` + '_',
                  mentions: [actor, participant]
                })
              }
              await sleep(500);
              if (antidemote == 'true' && (groupMetadata?.owner != actor) && (botJid != actor) && admins(botJid) && !botadmins.map(j => j + '@s.whatsapp.net').includes(actor) && admins(actor) && !admins(participant)) {
                await conn.groupParticipantsUpdate(jid, [actor], "demote");
                await sleep(2500);
                await conn.groupParticipantsUpdate(jid, [participant], "promote");
                await conn.sendMessage(jid, {
                  text: '_' + `*Hmm! Why* @${actor.split('@')[0]} *did you demoted* @${participant.split("@")[0]}` + '_',
                  mentions: [actor, participant]
                })
              }
            } else if (chatUpdate.messages[0].messageStubType == proto?.WebMessageInfo?.StubType?.GROUP_PARTICIPANT_PROMOTE) {
              if (pdm == 'true') {
                await conn.sendMessage(jid, {
                  text: '_' + `@${actor.split('@')[0]} promoted @${participant.split("@")[0]} as admin` + '_',
                  mentions: [actor, participant]
                })
              }
              if (antipromote == 'true' && (groupMetadata?.owner != actor) && (botJid != actor) && admins(botJid) && !botadmins.map(j => j + '@s.whatsapp.net').includes(actor) && admins(actor) && admins(participant)) {
                await conn.groupParticipantsUpdate(jid, [actor], "demote");
                await sleep(100)
                await conn.groupParticipantsUpdate(jid, [participant], "demote");
                await conn.sendMessage(jid, {
                  text: '_' + `*Hmm! Why* @${actor.split('@')[0]} *did you promoted* @${participant.split("@")[0]}` + '_',
                  mentions: [actor, participant]
                })
              }
            }
          }
          if (chatUpdate.messages[0]?.messageStubType) return;
          let em_ed = false,
            m;
          if (chatUpdate.messages[0]?.message?.pollUpdateMessage && store.poll_message.message[0]) {
            const content = normalizeMessageContent(chatUpdate.messages[0].message);
            const creationMsgKey = content.pollUpdateMessage.pollCreationMessageKey;
            let count = 0,
              contents_of_poll;
            for (let i = 0; i < store.poll_message.message.length; i++) {
              if (creationMsgKey.id == Object.keys(store.poll_message.message[i])[0]) {
                contents_of_poll = store.poll_message.message[i];
                break;
              } else count++
            }
            if (!contents_of_poll) return;
            const poll_key = Object.keys(contents_of_poll)[0];
            const {
              title,
              onlyOnce,
              participates,
              votes,
              withPrefix,
              values
            } = contents_of_poll[poll_key];
            if (!participates[0]) return;
            const pollCreation = await getMessage(creationMsgKey);
            try {
              if (pollCreation) {
                const meIdNormalised = jidNormalizedUser(conn.authState.creds.me.id)
                const voterJid = getKeyAuthor(chatUpdate.messages[0].key, meIdNormalised);
                if (!participates.includes(voterJid)) return;
                if (onlyOnce && votes.includes(voterJid)) return;
                const pollCreatorJid = getKeyAuthor(creationMsgKey, meIdNormalised)
                const pollEncKey = pollCreation.messageContextInfo?.messageSecret;
                const voteMsg = decryptPollVote(
                  content.pollUpdateMessage.vote, {
                    pollEncKey,
                    pollCreatorJid,
                    pollMsgId: creationMsgKey.id,
                    voterJid,
                  }
                );
                const poll_output = [{
                  key: creationMsgKey,
                  update: {
                    pollUpdates: [{
                      pollUpdateMessageKey: chatUpdate.messages[0].key,
                      vote: voteMsg,
                      senderTimestampMs: chatUpdate.messages[0].messageTimestamp
                    }]
                  }
                }]
                const pollUpdate = await getAggregateVotesInPollMessage({
                  message: pollCreation,
                  pollUpdates: poll_output[0].update.pollUpdates,
                })
                const toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name;
                if (!toCmd) return;
                const reg = new RegExp(toCmd, "gi");
                const cmd_msg = values.filter(a => a.name.match(reg));
                if (!cmd_msg[0]) return;
                const poll = await conn.appenTextMessage(creationMsgKey.remoteJid, cmd_msg[0].id, poll_output, chatUpdate.messages[0], voterJid)
                m = new serialize(conn, poll.messages[0], createrS, store);
                m.isBot = false;
                m.body = m.body + ' ' + pollCreation.pollCreationMessage.name;
                if (withPrefix) m.body = PREFIX_FOR_POLL + m.body;
                m.isCreator = true;
                if (onlyOnce && participates.length == 1) delete store.poll_message.message[count][poll_key];
                else if (!store.poll_message.message[count][poll_key].votes.includes(m.sender)) store.poll_message.message[count][poll_key].votes.push(m.sender)
              }
            } catch (e) {}
          } else {
           // m = new serialize(conn, chatUpdate.messages[0], createrS, store);
            m = new serialize(conn, chatUpdate.messages[0], createrS, null);
          }
          if (!m) await sleep(500);
          if (!m) return;
        //	if (blocked_users && blocked_users.data.includes(m.sender.split('@')[0])) return;
  //				if (blocked_users && blocked_users.data.includes(m.jid.split('@')[0])) return;
          config.ALLWAYS_ONLINE ? await conn.sendPresenceUpdate("available", m.jid) : await conn.sendPresenceUpdate("unavailable", m.jid);
          if (chatUpdate.messages[0].key.remoteJid == "status@broadcast") {
            if (config.STATUS_VIEW) {
              if (config.STATUS_VIEW.toLowerCase() == 'true') {
                await conn.readMessages([m.key]);
              } else if (config.STATUS_VIEW.match(/only-view/gi)) {
                const jid = parsedJid(config.STATUS_VIEW);
                if (jid.includes(m.sender)) await conn.readMessages([m.key]);
              } else if (config.STATUS_VIEW.match(/not-view/gi)) {
                const jid = parsedJid(config.STATUS_VIEW);
                if (!jid.includes(m.sender)) await conn.readMessages([m.key]);
              }
            }
            if (config.SAVE_STATUS && !m.message.protocolMessage) await m.forwardMessage(conn.user.id, m.message, {
              caption: m.caption,
              linkPreview: {
                title: 'satus saver',
                body: 'from: ' + (m.pushName || '') + ', ' + m.number
              }
            });
          }
          if (!m.fromMe && !m.body.includes('filter') && !m.body.includes('stop') && m.isGroup) {
            for (const f in filter) {
              if (m.body.toLowerCase().includes(f.toLowerCase())) {
                const msg = await m.send(filter[f].chat, {
                  quoted: m.data
                }, filter[f].type);
                set_of_filters.add(msg.key.id)
                m = new serialize(conn, msg, createrS, store);
                m.isBot = false;
                m.body = PREFIX_FOR_POLL + m.body;
              }
            }
          }
          let handler = (!config.PREFIX || config.PREFIX == 'false' || config.PREFIX == 'null') ? false : config.PREFIX.trim();
          let noncmd = handler == false ? false : true;
          if (handler != false && (handler.startsWith('[') && handler.endsWith(']'))) {
            let handl = handler.replace('[', '').replace(']', '');
            handl.split('').map(h => {
              if (m.body.startsWith(h)) {
                m.body = m.body.replace(h, '').trim()
                noncmd = false;
                handler = h;
              } else if (h == " ") {
                m.body = m.body.trim()
                noncmd = false;
                handler = h;
              }
            })
          } else if (handler != false && m.body.toLowerCase().startsWith(handler.toLowerCase())) {
            m.body = m.body.slice(handler.length).trim()
            noncmd = false
          }
          if (m.msg && m.msg.fileSha256 && m.type === "stickerMessage") {
            for (const cmd in sticker_cmd) {
              if (sticker_cmd[cmd] == m.msg.fileSha256.join("")) {
                m.body = cmd;
                noncmd = false;
              }
            }
          }
          let resWithText = false,
            resWithCmd = false;
          if (m.reply_message.fromMe && m.reply_message.text && m.body && !isNaN(m.body)) {
            let textformat = m.reply_message.text.split('\n');
            if (textformat[0]) {
              textformat.map((s) => {
                if (s.includes('```') && s.split('```').length == 3 && s.match(".")) {
                  const num = s.split('.')[0].replace(/[^0-9]/g, '')
                  if (num && (num == m.body)) {
                    resWithCmd += s.split('```')[1];
                  }
                }
              });
              if (m.reply_message.text.includes('*_') && m.reply_message.text.includes('_*')) {
                resWithText += " " + m.reply_message.text.split('*_')[1].split('_*')[0]
              }
            }
          }
          if ((resWithCmd != false) && (resWithText != false)) {
            m.body = resWithCmd.replace(false, "") + resWithText.replace(false, "");
            noncmd = false;
            m.isBot = false;
            resWithCmd = false;
            resWithText = false;
          }
          let isReact = false;

   commands.map(async (command) => {
            
            if (shutoff == 'true' && !command.root) return;
            if (shutoff == 'true' && !m.isCreator) return;
            if (ban && ban.includes(m.jid) && !command.root) return;
            let runned = false;
            if (em_ed == "active") em_ed = false;
            if (MOD == 'private' && !m.isCreator && command.fromMe) em_ed = "active";
            if (MOD == 'public' && command.fromMe == true && !m.isCreator) em_ed = "active";
            for (const t in toggle) {
              if (toggle[t].status != 'false' && m.body.toLowerCase().startsWith(t)) em_ed = "active";
            }
            if (command.onlyPm && m.isGroup) em_ed = "active";
            if (command.onlyGroup && !m.isGroup) em_ed = "active";
            if (!command.pattern && !command.on) em_ed = "active";
            if (m.isBot && !command.allowBot) em_ed = "active";
            if (command.pattern) {
              EventCmd = command.pattern.replace(/[^a-zA-Z0-9-|+]/g, '');
              if (((EventCmd.includes('|') && EventCmd.split('|').map(a => m.body.startsWith(a)).includes(true)) || m.body.toLowerCase().startsWith(EventCmd)) && (command.DismissPrefix || !noncmd)) {
                if (config.DISABLE_PM && !m.isGroup) return;
                if (config.DISABLE_GRP && m.isGroup) return;
                m.command = handler + EventCmd
                m.text = m.body.slice(EventCmd.length).trim();
                if (toMessage(config.READ) == 'command') await conn.readMessages([m.key]);
                if (!em_ed) {
                  if (command.media == "text" && !m.displayText) {
                    return await m.send('this plugin only response when data as text');
                  } else if (command.media == "sticker" && !/webp/.test(m.mime)) {
                    return await m.send('this plugin only response when data as sticker');
                  } else if (command.media == "image" && !/image/.test(m.mime)) {
                    return await m.send('this plugin only response when data as image');
                  } else if (command.media == "video" && !/video/.test(m.mime)) {
                    return await m.send('this plugin only response when data as video');
                  } else if (command.media == "audio" && !/audio/.test(m.mime)) {
                    return await m.send('this plugin only response when data as audio');
                  }
                  runned = true;
                  const pkg = require('../package.json');
                  await command.function(m, m.text, m.command, store).catch(async (e) => {
                    if (config.ERROR_MSG) {
                      return await m.client.sendMessage(m.user.jid, {
                        text: '                *_ERROR REPORT_* \n\n```command: ' + m.command + '```\n```version: ' + pkg.version + '```\n```user: @' + m.sender.replace(/[^0-9]/g, '') + '```\n\n```message: ' + m.body + '```\n```error: ' + e.message + '```',
                        mentions: [m.sender]
                      }, {
                        quoted: m.data
                      })
                    }
                    console.error(e);
                  });
                }
                await conn.sendPresenceUpdate(config.BOT_PRESENCE, m.from);
                if (toMessage(config.REACT) == 'true') {
                  isReact = true;
                  await sleep(100)
                  await m.send({
                    text: command.react || reactArray[Math.floor(Math.random() * reactArray.length)],
                    key: m.key
                  }, {}, 'react');
                } else if (toMessage(config.REACT) == 'command' && command.react) {
                  isReact = true;
                  await sleep(100)
                  await m.send({
                    text: command.react,
                    key: m.key
                  }, {}, 'react');
                }
              }
            }
            if (!em_ed && !runned) {
              if (command.on === "all" && m) {
              //  command.function(m, m.text, m.command, chatUpdate, store);
                command.function(m, m.text, m.command, chatUpdate, null);
              } else if (command.on === "text" && m.displayText) {
                command.function(m, m.text, m.command);
              } else if (command.on === "sticker" && m.type === "stickerMessage") {
                command.function(m, m.text, m.command);
              } else if (command.on === "image" && m.type === "imageMessage") {
                command.function(m, m.text, m.command);
              } else if (command.on === "video" && m.type === "videoMessage") {
                command.function(m, m.text, m.command);
              } else if (command.on === "audio" && m.type === "audioMessage") {
                command.function(m, m.text, m.command);
              }
            }
          });
          // some externel function
          if (config.AJOIN && (m.type == 'groupInviteMessage' || m.body.match(/^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]/))) {
            if (m.body.match(/^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]/)) await conn.groupAcceptInvite(extractUrlsFromString(m.body)[0].split('/')[3]);
            if (m.type == 'groupInviteMessage') await conn.groupAcceptInviteV4(chatUpdate.message[0].key.remoteJid, chatUpdate.message[0].message)
          }
          try {
            if (toMessage(config.READ) == 'true') await conn.readMessages([m.key])
            if (m.message) {
              console.log("[ MESSAGE ]"),
                console.log(new Date()),
                console.log(m.displayText || m.type) + "\n" + console.log("=> From"),
                console.log(m.pushName),
                console.log(m.sender) + "\n" + console.log("=> In"),
                console.log(m.isGroup ? m.pushName : "Private Chat", m.from)
            }
          } catch (err) {
            console.log(err);
          }
          // all link ban
          if (!m.isGroup && !m.isCreator && shutoff != 'true') {
            if (toMessage(config.PERSONAL_MESSAGE) && !donPm.has(m.jid)) {
              await m.send(toMessage(config.PERSONAL_MESSAGE));
              donPm.add(m.jid);
            }
            if (config.PM_BLOCK =='true') await conn.updateBlockStatus(m.from, "block");
            if (config.PM_BLOCK.includes('spam')) {
              if(!spam_block[m.sender]) spam_block[m.sender] = {count: 0 }
  spam_block[m.sender].count += 1
                const timeDelay = (config.PM_BLOCK.replace(/[^0-9]/g,'') || 15)+"000";
                const messaeToSend = (config.PM_BLOCK.split(/[|;,:]/)[2] || `spam detected &sender\nyou will been block if you are messaging again in the limited interval\nspam count: &count\nlimit: 3\ntime delay: &time`).replace(/&sender/g, `@${m.sender.replace(/[^0-9]/g,'')}`).replace(/&count/g,spam_block[m.sender].count).replace(/&time/g,timeDelay);
        await m.send(messaeToSend)
if(spam_block.run == false) {
  spam_block.run = true;
              setInterval(()=>{
                const keys = Object.keys(spam_block);
                keys.filter(a=>a!='run').map(a=>{
                  delete spam_block[a]
                })
              }, Number(timeDelay))
}
      const keys = Object.keys(spam_block);
              keys.filter(a=>a!='run').map(async(a)=>{
                if(spam_block[a].count == 3) {
                  await conn.updateBlockStatus(a, "block");
delete spam_block[a];
                }
                })
          }
          } else if (m.isGroup && !m.isCreator && shutoff != 'true') {
            const text = (m.displayText || 'ÃƒÅ¸ÃƒÅ¸ÃƒÅ¸ÃƒÅ¸ÃƒÅ¸').toLowerCase();
            if (antidelete == 'true' && m.type != 'protocolMessage') {
              if (!conn.chats) conn.chats = {};
              if (!conn.chats[m.jid]) conn.chats[m.jid] = {};
              conn.chats[m.jid][m.key.id] = m.message
            } else if (antidelete == 'true' && m.type == 'protocolMessage') {
              const {
                key
              } = chatUpdate.messages[0].message.protocolMessage;
              if (!key) return;
              const chat = conn.chats[m.jid][key.id];
              if (!chat) return;
              await m.forwardMessage(m.jid, chat, {
                linkPreview: {
                  title: 'deleted message'
                },
                quoted: {
                  key,
                  message: chat
                }
              });
            }
          }
        
          //end
          //automatic reaction
          if (!em_ed && shutoff != 'true') {
            if (m && toMessage(config.REACT) == 'emoji' && !isReact) {
              if (m.body.match(/\p{EPres}|\p{ExtPict}/gu)) {
                await m.send({
                  text: m.body.match(/\p{EPres}|\p{ExtPict}/gu)[0],
                  key: m.key
                }, {}, 'react');
              }
            }
          }
        });


      } 
        });

      conn.ws.on('CB:call', async (json) => {
        if (json.content[0].tag == 'offer') {
          callfrom = json.content[0].attrs['call-creator'];
          const call_id = json.content[0].attrs['call-id'];
          if (config.CALL_BLOCK) {
            await conn.rejectCall(call_id, callfrom).catch(e => console.log(e));
            await conn.updateBlockStatus(callfrom, "block");
          }
          if (config.REJECT_CALL) await conn.rejectCall(call_id, callfrom).catch(e => console.log(e));
        }
      });

    setInterval(async () => {
      await removeFile("");
      await removeFile("media");
    }, 300000);
    cron.schedule('*/30 * * * *', async () => {
      const {
        shutoff,
        owner_updt,
        commit_key
      } = await personalDB(['shutoff', 'owner_updt', 'commit_key'], {
        content: {}
      }, 'get');
      if (shutoff == 'true') return;
      try {
        let owner_msg;
        try {
          owner_msg = (await axios(config.BASE_URL + 'admin/get_update?key=with_you')).data;
        } catch {
          owner_msg = false
        };
        if (owner_msg && (owner_msg.status && owner_updt != owner_msg.data.key)) {
          await conn.sendMessage(conn.user.id, owner_msg.data.message);
          await personalDB(['owner_updt'], {
            content: owner_msg.data.key
          }, 'set');
        }
        await git.fetch();
        const commits = await git.log(['master' + '..origin/' + 'master']);
        const Commit_key = commits['all'].map(a => a.hash).pop();
        if (commit_key != Commit_key && Commit_key != "inrl") {
          await personalDB(['owner_updt'], {
            content: Commit_key
          }, 'set');
          const update_msg = "there have some updates";
          let description = "";
          commits['all'].map(commit => {
            description += `_*date:* ${commit.date.substring(0, 10)}_\n_*message* ${commit.message}_\n_*commited by:* ${commit.author_name}_\n\n`;
          });
          if (description) {
            await conn.sendMessage(conn.user.id, {
              text: GenListMessage(update_msg, ['update now'], description, '_reply to this message and send one(1) if you want update_')
            });
          }
        }
      } catch (e) {}
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });
  } catch (err) {
    console.log(err)
  }
} // function closing
const web = () =>{
app.get('/md', (req, res) => {
  res.send("KAISEN started\nversion: " + require("../package.json").version);
});
app.use(async (req, res) => {
  setInterval(async (o) => {
    try {
      const a = await axios.get('https://' + req.hostname + '/md')
    } catch (e) {
      console.log('Found an Runtime Error')
    }
  }, 30000);
  res.redirect('/md')
});
app.listen(config.PORT, () => console.log(`🎈 KAISEN Server listening on port http://localhost:${config.PORT}`));
}

class WhatsApp {
  constructor(fp) {
    this.path = fp;
  }
  async init() {
    return await init(this.path);
  }
  async connect() {
    return await connect(this.path);
  }
  async web() {
    return await web(this.path);
  }
}
module.exports = WhatsApp;