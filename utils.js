const TelegramBot = require("node-telegram-bot-api");
const dedent = require("dedent");
const fs = require("fs");
const { ethers } = require("ethers");
const {
  explorers,
  BOT_TOKEN,
  TRENDING_MSG_IDS,
  TRENDING_CHAT_IDS,
} = require("./config");

const buyBot = new TelegramBot(BOT_TOKEN, { polling: false });

function compareAddresses(addy1, addy2) {
  return ethers.utils.getAddress(addy1) === ethers.utils.getAddress(addy2);
}

// Path to your JSON file
function readPrices() {
  const filePath = "./prices.json";

  try {
    // Read the file synchronously
    const rawData = fs.readFileSync(filePath, "utf8");

    // Parse the JSON data
    const jsonData = JSON.parse(rawData);

    return jsonData;
  } catch (error) {
    return {};
  }
}

async function updateTrendingMarketCap(
  db,
  marketCap,
  amount_buy,
  chat_id,
  network,
  address
) {
  try {
    const { trendingCollection, trendingVolCollection } = db;
    const isTrending = await trendingCollection.findOne({ address, network });
    if (!isTrending) return;
    const snapshot = Date.now() - 60 * 60 * 1000;
    const prevMarketCap = isTrending?.marketCap;
    console.log("PREV ->", prevMarketCap);
    const marketCapGrowth = prevMarketCap
      ? (marketCap - prevMarketCap / prevMarketCap) * 100
      : 0;

    console.log("GROWTH ->", marketCapGrowth);

    await trendingCollection.updateOne(
      { address, network }, // Filter
      {
        $inc: {
          vol: amount_buy,
        },
        $set: {
          volTimestampLatest: Date.now(),
        },
      },
      { upsert: false } // Options
    );

    if (
      !isTrending.marketCapTimestamp ||
      isTrending.marketCapTimestamp <= snapshot
    ) {
      await trendingCollection.updateOne(
        { address, network }, // Filter
        {
          $set: {
            marketCap,
            marketCapTimestamp: Date.now(),
            marketCapGrowth:
              prevMarketCap === null
                ? Math.floor(Math.random() * 20) + 1
                : marketCapGrowth.toFixed(2),
          },
        },
        { upsert: false } // Options
      );
      console.log("Trending updated", isTrending);
    }
  } catch (error) {
    console.log(error);
  }
}

async function updateTrendingVol(db, amount_buy, chat_id, network, address) {
  try {
    const { trendingCollection, trendingVolCollection } = db;
    const isTrending = await trendingCollection.findOne({ address, network });
    if (isTrending) {
      await trendingVolCollection.create({
        amount_buy,
        chat_id,
        network,
        address,
        timestamp: Date.now(),
      });
      // console.log("Trending updated", isTrending);
    }
  } catch (error) {
    console.log(error);
  }
}

async function sendTelegramMessage(msg, img_url, chat_id, network, is_button) {
  try {
    msg = dedent(msg);
    let keyboardMarkup = is_button
      ? {
          inline_keyboard: [
            [
              {
                text: `🔥 ${network.toUpperCase()} TRENDING 🔥`,
                url: `https://t.me/${TRENDING_CHAT_IDS[network]}/${TRENDING_MSG_IDS[network]}`,
              },
            ],
          ],
        }
      : null;

    if (img_url) {
      const img_type = img_url.includes("mp4") ? "video" : "photo";
      if (img_type === "photo") {
        await buyBot.sendPhoto(chat_id, img_url, {
          caption: msg,
          parse_mode: "HTML",
          reply_markup: keyboardMarkup,
        });
      } else {
        await buyBot.sendVideo(chat_id, img_url, {
          caption: msg,
          parse_mode: "HTML",
          reply_markup: keyboardMarkup,
        });
      }
    } else {
      await buyBot.sendMessage(chat_id, msg, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: keyboardMarkup,
      });
    }
  } catch (error) {
    console.error("Sending message errored:", error.message);
  }
}

function getUserPosition(totalBalance, tokenBought) {
  const prevBalance = totalBalance - tokenBought;
  const position = (tokenBought / prevBalance) * 100;
  return position;
}

function get_data_v2(args, baseToken, quoteToken, token0, token1) {
  const data = {
    amountIn: null,
    amountOut: null,
  };

  if (args.amount0In > 0) {
    if (
      compareAddresses(token0, quoteToken) &&
      compareAddresses(token1, baseToken)
    ) {
      data.amountOut = args.amount1Out;
      data.amountIn = args.amount0In;
    }
  } else if (args.amount1In > 0) {
    if (
      compareAddresses(token0, baseToken) &&
      compareAddresses(token1, quoteToken)
    ) {
      data.amountIn = args.amount1In;
      data.amountOut = args.amount0Out;
    }
  }

  return data;
}

function get_data_v3(args, track_token, other_token, token0, token1) {
  const amount0 = args.amount0 || 0;
  const amount1 = args.amount1 || 0;
  const data = {
    pool_address: "",
    symbol: "None",
    amountIn: null,
    amountOut: null,
  };

  if (amount0 < 0) {
    if (token0 === track_token) {
      data.amountOut = args.amount0.mul(-1);
      data.amountIn = args.amount1;
    }
  }

  if (amount1 < 0) {
    if (token1 === track_token) {
      data.amountOut = args.amount1.mul(-1);
      data.amountIn = args.amount0;
    }
  }

  return data;
}

function get_data_izi(args, track_token, other_token, token0, token1) {
  const { tokenX, tokenY, amountX, amountY, sellXEarnY } = args;
  const data = {
    amountIn: null,
    amountOut: null,
  };
  if (sellXEarnY) {
    if (tokenX === other_token) {
      data.amountIn = amountX;
      data.amountOut = amountY;
    }
  } else if (!sellXEarnY) {
    if (tokenY === other_token) {
      data.amountIn = amountY;
      data.amountOut = amountX;
    }
  }

  return data;
}

function process_number(amountInUsd, buyStep) {
  if (amountInUsd <= buyStep) return 1;
  else if (amountInUsd <= 10000) return parseInt(amountInUsd / buyStep);
  let step = buyStep < 100 ? 100 : buyStep;
  if (amountInUsd <= 50000) return parseInt(amountInUsd / step);
  if (amountInUsd <= 100000) return parseInt(amountInUsd / 250);
  return 200;
}

function formatNumber(amount, max = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  }).format(amount);
}

module.exports = {
  sendTelegramMessage,
  get_data_v3,
  get_data_v2,
  formatNumber,
  process_number,
  readPrices,
  compareAddresses,
  getUserPosition,
  explorers,
  get_data_izi,
  buyBot,
  updateTrendingVol,
  updateTrendingMarketCap,
};
