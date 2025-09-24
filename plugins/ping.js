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
  const start = new Date().getTime();
  const emojis = [
    '⛅', '👻', '⛄', '👀', '🪁', '🪃', '🎳', '🎀',
    '🌸', '🌟', '🍥', '🎀', '🍓', '🍡', '💗', '🦋',
    '💫', '💀', '☁️', '🌨️', '🌧️', '🌦️', '🌥️', '⛅',
    '🪹', '⚡', '🌟', '☁️', '🎐', '🏖️', '🎐', '🪺',
    '🌊', '🐚', '🪸', '🍒', '🍇', '🍉', '🌻', '🎢',
    '🚀', '🍫', '💎', '🌋', '🏔️', '⛰️', '🌙', '🪐',
    '🌲', '🍃', '🍂', '🍁', '🪵', '🍄', '🌿', '🐞',
    '🐍', '🕊️', '🕷️', '🕸️', '🎃', '🏟️', '🎡', '🥂',
    '🗿', '⛩️'
  ];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const temp = await message.send('🏓 Pinging...');
  const end = new Date().getTime();
  const ping = end - start;
const styledText = `*ᝰ ꜱᴩᷨᴇͦᴇͭᴅ: ${ping} ᴍꜱ ${emoji}*`;
  
  await temp.edit(styledText);
});