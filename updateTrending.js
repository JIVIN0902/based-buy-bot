const { scheduleJob } = require("node-schedule");
const { DB } = require("./db");
// const { buyBot } = require("./utils");
const {
  TRENDING_CHAT_ID,
  TRENDING_MSG_IDS,
  CHAINS,
  TRENDING_RANK_EMOJIS,
  TRENDING_CHAT_IDS,
  STANDALONE_TRENDINGS,
  STANDALONE_TRENDING_CHAT_IDS,
  ORANGE_TRENDING_CHAT_ID,
} = require("./config");
const dedent = require("dedent");
const { ethers } = require("ethers");
const { default: axios } = require("axios");
const { getTokenDetails } = require("./trend-bot/utils");
const TelegramBot = require("node-telegram-bot-api");
const { getAdToShow } = require("./utils");

// const BOT_TOKEN = "7109381344:AAGxAINAtCMN-0qdwrYyS94raBa5u_9p244";
const BOT_TOKEN = "6855442320:AAGdHmPQkG9gJI5QuLPH-TVpuXS_E6j6r3o";
const buyBot = new TelegramBot(BOT_TOKEN, { polling: false });

const BREAK_INTERVAL = 10 * 60 * 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateTrending() {
  const db = new DB();
  const {
    trendingCollection,
    trendingVolCollection,
    buysCollection,
    adsCollection,
  } = await db.init();
  const snapshot = Date.now() - 30 * 60 * 1000;
  const weekSnap = Date.now() - 7 * 24 * 60 * 60 * 1000;

  await trendingCollection.deleteMany({
    timestamp: { $lt: weekSnap },
  });
  await trendingVolCollection.deleteMany({
    timestamp: { $lt: snapshot },
  });
  for (const network of CHAINS) {
    let trendingData = await trendingCollection.find({ network });

    let trends = [];
    for (let item of trendingData) {
      const address = ethers.utils.getAddress(item.address);
      if (item.marketCap > 10000) {
        trends.push({ ...item._doc, address });
      } else {
        await trendingCollection.deleteOne({ address });
      }
    }

    // // Sort and reverse to get trends
    trends.sort((a, b) => b.vol - a.vol);
    trends = trends.slice(0, 10);
    // console.log("TRENDS ->", trends);
    let msg = `✅ <a href='https://t.me/OrangeTrending'> ${network
      .charAt(0)
      .toUpperCase()}${network.slice(1)} Trending</a> (LIVE)\n\n`;
    let i = 1;
    await trendingCollection.updateMany({ network }, { $set: { rank: 0 } });
    for (let item of trends) {
      try {
        const groupData = await buysCollection.findOne({
          "pool.baseToken.address": item.address,
        });
        if (!groupData) continue;
        const tgLink = groupData.tg_link || item?.tg_link;
        msg += `${TRENDING_RANK_EMOJIS[i]}<b> <a href='${tgLink}'>${
          item.symbol
        }</a> <a href="https://dexscreener.com/${network}/${
          item.address
        }">📊 CHART (${
          item?.marketCapGrowth > 100
            ? Math.floor(Math.random() * 20) + 1
            : item.marketCapGrowth || 0
        }%)</a></b>\n`;

        await trendingCollection.updateOne(
          { address: item.address },
          {
            $set: {
              rank: i,
            },
          }
        );
        i++;
      } catch (e) {
        console.error(e);
      }
    }

    msg += `\n🍊 <b><i>@OrangeBuyBot, to qualify use Orange in your group.</i></b>`;
    msg += `\n🍊<b><i> @OrangeBuyBot Automatically updates Trending every 30 secs.</i></b>`;

    // Replace with you
    // console.log(msg);
    await editTrendingMsg(adsCollection, msg, network);
  }
}

async function editTrendingMsg(adsCollection, msg, network) {
  try {
    const adToShow = await getAdToShow(adsCollection);
    const reply_markup = {
      inline_keyboard: [
        [
          {
            text: adToShow.text,
            url: adToShow.url,
          },
        ],
      ],
    };
    console.log(reply_markup);
    const msg_ids = TRENDING_MSG_IDS[network];
    const standalone_chat_id = STANDALONE_TRENDING_CHAT_IDS[network];
    if (standalone_chat_id && msg_ids.standalone) {
      console.log("STANDALONE ->", standalone_chat_id, msg_ids.standalone);
      try {
        await buyBot.editMessageText(dedent(msg), {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          chat_id: standalone_chat_id,
          message_id: msg_ids.standalone,
        });
      } catch (error) {}
      await buyBot.editMessageReplyMarkup(reply_markup, {
        chat_id: standalone_chat_id,
        message_id: msg_ids.standalone,
      });
    }
    if (msg_ids.orangeTrending) {
      console.log("ORANGE ->", msg_ids.orangeTrending);
      try {
        await buyBot.editMessageText(dedent(msg), {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          chat_id: ORANGE_TRENDING_CHAT_ID,
          message_id: msg_ids.orangeTrending,
        });
      } catch (error) {}
      await buyBot.editMessageReplyMarkup(reply_markup, {
        chat_id: ORANGE_TRENDING_CHAT_ID,
        message_id: msg_ids.orangeTrending,
      });
    }
  } catch (error) {
    console.log("ERROR while editing", error.message);
  }
}

async function sendTrendingMessageFirstTime(network, chat_id) {
  try {
    const msg = `
    ✅<b> <a href='https://t.me/ChilizTrendingLIVE'>${network} Trending</a> (LIVE)</b>\n

    🍌 <b><i>Powered by @BananaBuyBot, to qualify use Banana in your group.</i></b>
    🍌  <i><b>@BananaBuyBot automatically updates Trending every 20 secs.</b></i>
    `;
    const m = await buyBot.sendMessage(chat_id, dedent(msg), {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    console.log(`${network} ->`, m.message_id);
  } catch (error) {
    console.log(error.message);
  }
}

async function updateTrendingVolumes() {
  const db = new DB();
  const { trendingCollection, trendingVolCollection, buysCollection } =
    await db.init();
  await trendingCollection.updateMany({}, { $set: { vol: 0 } });
}

async function tr() {
  try {
    const reply_markup = {
      inline_keyboard: [
        [
          {
            text: "Book Trending",
            url: "https://t.me/OrangeTrendBot",
          },
        ],
      ],
    };
    await buyBot.editMessageReplyMarkup(reply_markup, {
      chat_id: TRENDING_CHAT_ID,
      message_id: 20,
    });
  } catch (error) {
    console.log(error.message);
  }
}

// updateTrending();
module.exports = { updateTrending, updateTrendingVolumes };
// ();
// tr();

// (async () => {
//   for (const net of [
//     "Chillis",
//     // "Blast",
//     // "PulseChain",
//     // "Avalanche",
//     // "Scroll",
//     // "Metis",
//     // "Manta",
//     // "Base",
//     // "Zksync",
//     // "Merlin",
//   ]) {
//     await sendTrendingMessageFirstTime(net, -1002027639711);
//   }
// })();

// const msg = `
//     ✅ <a href='https://t.me/OrangeTrending'>Metis Trending</a> (LIVE)\n

//     🍊 <b><i>Powered by <a href='https://t.me/OrangeBuyBot'>Orange Buy Bot</a>, to qualify use Orange in your group.</i></b>
//     🍊 <a href='https://t.me/OrangeTrending'>Orange Trending</a> <i>Automatically updates Trending every 30 secs.</i>
//     `;
// editTrendingMsg(msg, "metis");
