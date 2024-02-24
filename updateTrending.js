const { scheduleJob } = require("node-schedule");
const { DB } = require("./db");
const { buyBot } = require("./utils");
const { TRENDING_CHAT_ID, TRENDING_MSG_IDS } = require("./config");
const dedent = require("dedent");

async function updateTrending() {
  const db = new DB();
  const { trendingCollection, trendingVolCollection } = await db.init();
  const snapshot = Date.now() - 30 * 60 * 1000;
}
async function editTrendingMsg(msg, network) {
  try {
    await buyBot.editMessageText(dedent(msg), {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      chat_id: TRENDING_CHAT_ID,
      message_id: TRENDING_MSG_IDS[network],
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function sendTrendingMessageFirstTime(network) {
  try {
    const msg = `
    ✅ <a href='https://t.me/OrangeTrending'>${network} Trending</a> (LIVE)\n

    🍊 <b><i>Powered by <a href='https://t.me/OrangeBuyBot'>Orange Buy Bot</a>, to qualify use Orange in your group.</i></b>
    🍊 <a href='https://t.me/OrangeTrending'>Orange Trending</a> <i>Automatically updates Trending every 30 secs.</i>
    `;
    const m = await buyBot.sendMessage(TRENDING_CHAT_ID, dedent(msg), {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    console.log(`${network} ->`, m.message_id);
  } catch (error) {
    console.log(error.message);
  }
}

// (async () => {
//   for (const net of [
//     "Avalanche",
//     "Metis",
//     "Manta",
//     "Scroll",
//     "MerlinChain",
//     "Blast",
//     "PulseChain",
//     "Zksync",
//     "Base",
//   ]) {
//     await sendTrendingMessageFirstTime(net);
//   }
// })();
// const msg = `
//     ✅ <a href='https://t.me/OrangeTrending'>Metis Trending</a> (LIVE)\n

//     🍊 <b><i>Powered by <a href='https://t.me/OrangeBuyBot'>Orange Buy Bot</a>, to qualify use Orange in your group.</i></b>
//     🍊 <a href='https://t.me/OrangeTrending'>Orange Trending</a> <i>Automatically updates Trending every 30 secs.</i>
//     `;
// editTrendingMsg(msg, "metis");
