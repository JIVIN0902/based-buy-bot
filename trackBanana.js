const ethers = require("ethers");
const {
  UNISWAP_V3_PAIR_ABI,
  ERC20_ABI,
  UNISWAP_V2_PAIR_ABI,
  IZISWAP_V2_PAIR_ABI,
} = require("./abis");
const TelegramBot = require("node-telegram-bot-api");
const dedent = require("dedent");
const {
  get_data_v2,
  readPrices,
  compareAddresses,
  process_number,
  formatNumber,
  sendTelegramMessage,
  getUserPosition,
  explorers,
  get_data_v3,
  get_data_izi,
  updateTrendingVol,
  updateTrendingMarketCap,
  sendTelegramMessageBanana,
} = require("./utils");
const {
  RPCS,
  topics,
  NATIVES,
  CHAINS,
  VERSIONS,
  TRENDING_RANK_EMOJIS,
  TRENDING_CHAINS,
  TRENDING_MSG_IDS,
  TRENDING_CHAT_IDS,
  TRENDINGS,
  STANDALONE_TRENDINGS,
  BANANA_CHAINS,
} = require("./config");
const { scheduleJob } = require("node-schedule");
const { updatePrices } = require("./updatePrices");
const { updateTrending, updateTrendingVolumes } = require("./updateTrending");
const { trackBurns } = require("./trackBurn");
const { DBBanana } = require("./dbBanana");

async function trackBuys(network, version) {
  const provider = new ethers.providers.JsonRpcProvider(RPCS[network]);
  const db = new DBBanana();
  const { buysCollection } = await db.init();

  const topic = topics[version];

  // Create a filter object for the event
  const filter = {
    topics: [topic],
  };

  const abi =
    version === "v2"
      ? UNISWAP_V2_PAIR_ABI
      : version === "izi"
      ? IZISWAP_V2_PAIR_ABI
      : UNISWAP_V3_PAIR_ABI;
  const iface = new ethers.utils.Interface(abi);

  provider.on(filter, async (log) => {
    try {
      const pool_address = log.address;
      //   console.log(network, pool_address);

      const chats = await buysCollection.find({
        "pool.pairAddress": ethers.utils.getAddress(pool_address),
      });
      if (chats.length === 0) return;
      const tx_hash = log.transactionHash;

      const event = iface.parseLog(log);
      const args = event.args;

      const poolContract = new ethers.Contract(pool_address, abi, provider);
      const token0 =
        version === "v2" || version === "v3"
          ? await poolContract.token0()
          : await poolContract.tokenX();
      const token1 =
        version === "v2" || version === "v3"
          ? await poolContract.token1()
          : await poolContract.tokenY();
      const token0Contract = new ethers.Contract(token0, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);

      const token0Decimals = await token0Contract.decimals();
      const token1Decimals = await token1Contract.decimals();
      let i = 0;
      for (const chat of chats) {
        i += 1;
        const pool = chat.pool;
        const {
          buy_step,
          buy_emoji,
          min_buy,
          image,
          chat_id,
          tg_link,
          twitter,
          website,
          circ_supply,
        } = chat;
        const baseToken = pool.baseToken;
        const quoteToken = pool.quoteToken;
        // console.log(chat.chat_id, baseToken.symbol, circ_supply);
        const swap_data =
          version === "v3"
            ? get_data_v3(
                args,
                baseToken.address,
                quoteToken.address,
                token0,
                token1
              )
            : version === "izi"
            ? get_data_izi(
                args,
                baseToken.address,
                quoteToken.address,
                token0,
                token1
              )
            : get_data_v2(
                args,
                baseToken.address,
                quoteToken.address,
                token0,
                token1
              );

        let { amountIn, amountOut } = swap_data;

        if (!amountIn && !amountOut) return;

        let to =
          version === "v3" ? args.recipient : version === "v2" ? args.to : null;
        if (version === "izi") {
          const tx_receipt = await provider.getTransaction(tx_hash);
          to = tx_receipt.from;
        }
        let totalSupply = compareAddresses(token0, baseToken.address)
          ? await token0Contract.totalSupply()
          : await token1Contract.totalSupply();
        let tokenInDecimals = compareAddresses(token0, quoteToken.address)
          ? token0Decimals
          : token1Decimals;
        tokenInDecimals = parseInt(tokenInDecimals.toString());
        let tokenOutDecimals = compareAddresses(token0, baseToken.address)
          ? token0Decimals
          : token1Decimals;
        tokenOutDecimals = parseInt(tokenOutDecimals.toString());

        totalSupply = parseInt(
          ethers.utils.formatUnits(totalSupply, tokenOutDecimals).toString()
        );
        let userBalance = compareAddresses(token0, baseToken.address)
          ? await token0Contract.balanceOf(to)
          : await token1Contract.balanceOf(to);
        userBalance = parseFloat(
          ethers.utils.formatUnits(userBalance, tokenOutDecimals).toString()
        );
        amountIn = parseFloat(
          ethers.utils.formatUnits(amountIn, tokenInDecimals).toString()
        );
        amountOut = parseFloat(
          ethers.utils.formatUnits(amountOut, tokenOutDecimals).toString()
        );
        const position =
          to !== null ? getUserPosition(userBalance, amountOut) : null;
        // console.log(amountIn, amountOut);
        const prices = readPrices();
        const quoteTokenPrice = prices[quoteToken.symbol];
        const amountInUsd = amountIn * quoteTokenPrice;
        // console.log("Amt in usd ->", amountInUsd);
        const tokenPriceUsd = (amountIn / amountOut) * quoteTokenPrice;
        // console.log("Token price usd ->", tokenPriceUsd);
        const supply = circ_supply ? circ_supply : totalSupply;
        // console.log("Supply ->", supply, baseToken.symbol);
        const marketCap = tokenPriceUsd * supply;
        // console.log(amountInUsd, tokenPriceUsd, marketCap);
        const explorer = explorers[pool.chainId];
        const native = NATIVES[network];
        const nativePrice = prices[native];

        const isWhale = amountInUsd >= 3000;
        const emoji = isWhale ? "🐳" : buy_emoji;

        let msg = `
            <b>New ${baseToken.symbol}${isWhale ? " Whale" : ""} Buy!</b>\n
            ${emoji.repeat(process_number(amountInUsd, buy_step))}\n
            💵 <b>Spent:</b> ${formatNumber(amountIn, 3)} ${
          quoteToken.symbol
        } ($${formatNumber(amountInUsd)})
            💰 <b>Bought: </b>${formatNumber(amountOut)} ${baseToken.symbol}
            🏷️ <b>${baseToken.symbol} Price:</b> $${
          tokenPriceUsd >= 0.000000001
            ? formatNumber(tokenPriceUsd, 8)
            : formatNumber(tokenPriceUsd, 18)
        }
            💲 <b>${native} Price:</b> $${
          nativePrice >= 1
            ? formatNumber(nativePrice)
            : formatNumber(nativePrice, 8)
        }
            ${
              to
                ? `🧔‍♂️ <b>Buyer: </b><a href="${explorer}/address/${to}">${to.slice(
                    0,
                    5
                  )}...${to.slice(38)}</a> | `
                : ""
            }<a href='${explorer}/tx/${tx_hash}'>TX</a> 
            ${
              position
                ? position === Infinity || position >= 100 || position <= -100
                  ? "<b>✅ New Chad</b>"
                  : `⬆️ <b>Position:</b> +${(position < 0
                      ? -1 * position
                      : position
                    ).toFixed(0)}%`
                : ""
            }
            🏦 <b>Market Cap:</b> $${formatNumber(marketCap, 0)}
            ${trendingMsg || ""}
            <a href='https://dexscreener.com/${
              pool.chainId
            }/${pool_address}'>📊 CHART</a>${
          tg_link ? ` | <a href='${tg_link}'>TG</a>` : ""
        }${twitter ? ` | <a href='${twitter}'>X</a>` : ""}${
          website ? ` | <a href='${website}'>WEBSITE</a>` : ""
        } 
        `;

        if (amountInUsd > min_buy) {
          await sendTelegramMessageBanana(
            dedent(msg),
            image,
            chat_id,
            network,
            true
          );
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  });
}

let tasks = [];
for (const network of BANANA_CHAINS) {
  for (const version of VERSIONS) {
    tasks.push(trackBuys(network, version));
  }
}

// scheduleJob("*/60 * * * * *", updatePrices);
// scheduleJob("*/60 * * * * *", updateTrending);
// scheduleJob("0 * * * *", updateTrendingVolumes);

Promise.all(tasks)
  .then(() => {
    // This block won't be executed as the promises never resolve
  })
  .catch((err) => {
    console.error("An error occurred in one of the tasks:", err.message);
  });
