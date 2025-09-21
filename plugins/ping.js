const {
  plugin,
  isAccess,
  mode,
  config
} = require('../lib');

plugin({
  pattern: 'ping|pong',
  desc: 'Check bot response speed',
  react: '🍄',
  fromMe: mode,
  type: 'info'
}, async (message, match) => {
  const emojis = [
    '⛅🌦️🌤️', '💘💝💖', '👻⛄👀', '🪁🪃🎳',
    '🎀🎁🎈', '🙊🙉🙈', '🌸✨💮', '🩷🌙💫',
    '🌈🌸🌟', '🍥🌺🎀', '🍓🍡💗', '🦋🎐💖',
    '💫🫧🌙', '💞🌸🐾', '🍰🎀🌼', '🍡🌼💗',
    '👻💀☠️', '🤍🩷🩶', '☁️🌨️🌧️', '🌦️🌥️⛅',
    '🌜🌚🌝', '🥀🌹💐', '☃️🪺🪹', '🍂🍄🌾',
    '🍁🌴🍀', '🐼🐹🐰', '👻⛄☃️', '⚡✨🌟',
    '☁️🎐🏖️', '🌴🌳🌲',
    '🌊🐚🪸', '🍒🍇🍉', '🪷🌼🌻', '🐶🐱🐭',
    '🚀🛸🛰️', '🍫🍩🍪', '🪙💎💰', '🌋🏔️⛰️',
    '🪅🎊🎉', '📚🖋️📜', '🍵☕🥛', '🎧🎤🎼',
    '🌞🔥🌅', '🌄🏞️🏕️', '🌌🌠🌙', '🪐🌎🌏',
    '🌳🌲🌴', '🍃🍂🍁', '🪵🍄🌿', '🪲🦋🐞',
    '🐢🦎🐍', '🦀🦞🦐', '🐬🐳🐋', '🦈🐟🐠',
    '🍔🍟🌭', '🍕🥪🥗', '🍜🍣🍱', '🥟🍤🍢',
    '🍰🧁🍮', '🍯🍞🥐', '🥩🍗🥓', '🥥🍍🥭',
    '🦊🦝🐻', '🐨🦘🦙', '🦒🦓🦌', '🦏🐘🦛',
    '🐔🐧🦤', '🦅🦆🦉', '🦢🦩🕊️', '🕷️🕸️🦂',
    '🧙🧝🧚', '🧛🧟🧞', '🧜🦸🦹', '🐉🐲👾',
    '🎃🪦⚰️', '⚗️🔭🔬', '🛡️⚔️🏹',
    '🗿🏰🏯', '🕌⛩️🛕', '🕍⛪🛤️', '🏟️🎡🎢',
    '💖💗💓', '💜💙💚', '❤️🧡💛', '🖤🤎🤍'
  ];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const start = new Date().getTime();

  await message.send('🏓 Pinging...');

  const end = new Date().getTime();
  const ping = end - start;

  const styledText = `◈ ${emoji}\n*╰┈➤ 𝐏O͒N͒𝐆: ${ping} ms*`;

  const channelJid = "120363420208876417@newsletter";
  const channelName = "𝖐𝚊𝚒𝚜𝖊𝖓 𝙼ԃ";         
  const serverMessageId = 1;

  await message.client.sendMessage(message.jid, {
    text: styledText,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelJid,
        newsletterName: channelName,
        serverMessageId: serverMessageId
      }
    }
  });
});