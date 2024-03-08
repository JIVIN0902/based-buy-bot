const { scheduleJob } = require("node-schedule");
const { DB } = require("./db");
const { buyBot } = require("./utils");
const {
  TRENDING_CHAT_ID,
  TRENDING_MSG_IDS,
  CHAINS,
  TRENDING_RANK_EMOJIS,
} = require("./config");
const dedent = require("dedent");
const { ethers } = require("ethers");
const { default: axios } = require("axios");
const { getTokenDetails } = require("./trend-bot/utils");

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
  } = await db.init();
  const snapshot = Date.now() - 30 * 60 * 1000;
  const weekSnap = Date.now() - 7 * 24 * 60 * 60 * 1000;

  await trendingCollection.deleteMany({
    timestamp: { $lt: weekSnap },
  });

  for (const network of CHAINS) {
    let trendingData = await trendingCollection.find({ network });
    // console.log(network, trendingData);

    let trends = [];
    for (let item of trendingData) {
      const address = ethers.utils.getAddress(item.address);
      const tokenData = await getTokenDetails(address);
      if (!tokenData) continue;
      const liquidity = tokenData.liquidity.usd;
      if (liquidity > 1000) {
        trends.push({ ...item._doc, address });
      } else {
        await trendingCollection.deleteOne({ address });
      }
    }

    // Sort and reverse to get trends
    trends.sort((a, b) => b.priceGrowth - a.priceGrowth);
    trends = trends.slice(0, 10);
    // console.log("TRENDS ->", trends);
    let msg = `✅ <a href='https://t.me/OrangeTrending'> ${network
      .charAt(0)
      .toUpperCase()}${network.slice(1)} Trending</a> (LIVE)\n\n`;
    let i = 1;
    for (let item of trends) {
      try {
        const groupData = await buysCollection.findOne({
          "pool.baseToken.address": item.address,
        });
        if (!groupData) continue;
        // console.log(item.symbol, groupData.tg_link, item.tg_link);
        // console.log(item.symbol, groupData);
        const tgLink = groupData.tg_link || item?.tg_link;
        // console.log(tgLink);
        msg += `${TRENDING_RANK_EMOJIS[i]}<b> <a href='${tgLink}'>${
          item.symbol
        }</a> <a href="https://dexscreener.com/${network}/${
          item.address
        }">📊 CHART (+${item.priceGrowth || 0}%)</a></b>\n`;

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

    msg += `\n🍊 <b><i>Powered by <a href='https://t.me/OrangeBuyBot'>Orange Buy Bot</a>, to qualify use Orange in your group.</i></b>`;
    msg += `🍊 <a href='https://t.me/OrangeTrending'>Orange Trending</a> <i>Automatically updates Trending every 30 secs.</i>`;

    console.log(msg);
    // Replace with you
    await editTrendingMsg(msg, network);
  }
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
    console.log("ERROR while editing");
  }
}

async function sendTrendingMessageFirstTime(network) {
  try {
    const msg = `
    ✅<b> <a href='https://t.me/OrangeTrending'>${network} Trending</a> (LIVE)</b>\n

    🍊 <i><b><a href='https://t.me/OrangeTrending'>@OrangeTrending</a> automatically updates Trending every 20 secs.</b></i>
    `;
    const m = await buyBot.sendMessage(TRENDING_CHAT_ID, dedent(msg), {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    // console.log(`${network} ->`, m.message_id);
  } catch (error) {
    console.log(error.message);
  }
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

updateTrending();
module.exports = { updateTrending };
// ();
// tr();

// (async () => {
//   for (const net of [
//     // "Blast",
//     "PulseChain",
//     "Avalanche",
//     "Scroll",
//     "Metis",
//     "Manta",
//     "Base",
//     "Zksync",
//     "Merlin",
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
