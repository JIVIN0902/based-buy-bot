const TelegramBot = require("node-telegram-bot-api");
const { DB } = require("../db");

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const bot = new TelegramBot("6761137970:AAFwdMMo-VUfAXvx8MZ5VUbswr_0LdUOBDk", {
  polling: true,
});

// Listen for /echo command
bot.onText(/\/trending (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const echoMessage = match[1];
  let [tg_link, address, network, symbol, days, chat_id, marketCap] =
    echoMessage.split(" ");
  days = parseInt(days);
  const db = new DB();

  const {
    buysCollection,
    trendingCollection,
    trendingVolCollection,
    statsCollection,
  } = await db.init();

  const ranks = await trendingCollection.find({ network });
  const rank = ranks.length + 1;

  await trendingCollection.create({
    tg_link,
    tx_hash: null,
    lastVolResetTimestamp: 0,
    hrs_tier: 24 * days,
    address,
    symbol,
    rank,
    timestamp: Date.now(),
    network,
    chat_id: parseInt(chat_id),
    vol: 0,
    volTimestampLatest: 0,
    marketCap,
    marketCapGrowth: 11,
    marketCapTimestamp: 0,
  });

  const message = `Project added to trending ✅\n
  SYMBOL: ${symbol}
  TG: ${tg_link}
  `;
  //   /trending https://t.me/basedduckbuck 0x2a5df5D3DBa819089cE1daCD55477f522C3AFFa3 base $BUCK 7 -1002014104417 80000
  //   TG, token address, network, symbol, days, chat id, marketcap

  await bot.sendMessage(chatId, message);
});
