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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateTrending() {
  const db = new DB();
  const { trendingCollection, trendingVolCollection, buysCollection } =
    await db.init();
  const snapshot = Date.now() - 30 * 60 * 1000;
  const weekSnap = Date.now() - 7 * 24 * 60 * 60 * 1000;
  await trendingVolCollection.deleteMany({
    timestamp: { $lt: snapshot },
  });
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
        let condition = {
          address,
          timestamp: { $gte: snapshot },
        };
        let result = await trendingVolCollection.aggregate([
          { $match: condition },
          { $group: { _id: null, total: { $sum: "$amount_buy" } } },
        ]);

        let volume = result.length > 0 && result[0].total ? result[0].total : 0;

        trends.push({ address, vol: volume });
      } else {
        await trendingCollection.deleteOne({ address });
      }
    }

    // Sort and reverse to get trends
    trends.sort((a, b) => b.vol - a.vol);
    let msg = `✅ <a href='https://t.me/OrangeTrending'> ${network
      .charAt(0)
      .toUpperCase()}${network.slice(1)} Trending</a> (LIVE)\n\n`;
    let i = 1;
    for (let item of trends) {
      try {
        let trendingGroup = await trendingCollection.findOne({
          address: item.address,
        });
        if (trendingGroup) {
          const prevVol = trendingGroup.vol;
          let volGrowth = (item.vol / prevVol) * 100;
          volGrowth = volGrowth.toFixed(2);
          const groupData = await buysCollection.findOne({
            address: item.address,
          });
          const tgLink = trendingGroup?.tg_link
            ? trendingGroup?.tg_link
            : groupData?.tg_link;
          msg += `${TRENDING_RANK_EMOJIS[i]}<b> <a href='${tgLink}'>${trendingGroup.symbol}</a> <a href="https://dexscreener.com/${network}/${item.address}">📊 CHART (+${volGrowth}%)</a></b>\n`;
        }
        await trendingCollection.updateOne(
          { address: item.address },
          { $set: { rank: i, vol: item.vol + trendingGroup.vol } }
        );
        i++;
      } catch (e) {
        console.error(e);
      }
    }

    msg += `\n🍊 <b><i>Powered by <a href='https://t.me/OrangeBuyBot'>Orange Buy Bot</a>, to qualify use Orange in your group.</i></b>`;
    msg += `🍊 <a href='https://t.me/OrangeTrending'>Orange Trending</a> <i>Automatically updates Trending every 30 secs.</i>`;

    // console.log(msg);
    // Replace with you
    await editTrendingMsg(msg, network);
    // await sleep(1000);
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
    console.log("ERROR while editing ->", error.message);
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

scheduleJob("*/30 * * * * *", updateTrending);
// updateTrending();
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
