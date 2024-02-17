const ethers = require("ethers");
const {
  UNISWAP_V3_PAIR_ABI,
  ERC20_ABI,
  UNISWAP_V2_PAIR_ABI,
  IZISWAP_V2_PAIR_ABI,
} = require("./abis");
const TelegramBot = require("node-telegram-bot-api");
const dedent = require("dedent");
const { DB } = require("./db");
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
} = require("./utils");
const { RPCS, topics, NATIVES } = require("./config");

async function trackBuyAndSendMessage(
  log,
  buysCollection,
  iface,
  abi,
  network,
  provider
) {
  try {
    const pool_address = log.address;
    console.log(pool_address);

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
    console.log(version, token0, token1, pool_address);
    const token0Contract = new ethers.Contract(token0, ERC20_ABI, provider);
    const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);

    for (const chat of chats) {
      console.log(chat.chat_id);
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
      } = chat;
      const baseToken = pool.baseToken;
      const quoteToken = pool.quoteToken;
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
      console.log(swap_data);

      let { amountIn, amountOut } = swap_data;
      const to = version === "v3" ? args.recipient : args.to;
      const token0Decimals = await token0Contract.decimals();
      const token1Decimals = await token1Contract.decimals();
      let userBalance = compareAddresses(token0, baseToken.address)
        ? await token0Contract.balanceOf(to)
        : await token1Contract.balanceOf(to);
      userBalance = parseInt(userBalance.toString());
      const totalSupply = compareAddresses(token0, baseToken.address)
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

      if (amountIn && amountOut) {
        console.log(baseToken.symbol);
        amountIn = parseInt(amountIn.toString());
        amountOut = parseInt(amountOut.toString());
        const position = getUserPosition(userBalance, amountOut);
        amountIn = amountIn / 10 ** tokenInDecimals;
        amountOut = amountOut / 10 ** tokenOutDecimals;
        const prices = readPrices();
        const quoteTokenPrice = prices[quoteToken.symbol];
        const amountInUsd = amountIn * quoteTokenPrice;
        const tokenPriceUsd = (amountIn / amountOut) * quoteTokenPrice;
        const marketCap =
          (tokenPriceUsd * totalSupply) / 10 ** tokenOutDecimals;
        console.log(amountInUsd, tokenPriceUsd, marketCap);
        const explorer = explorers[pool.chainId];
        const native = NATIVES[network];
        const nativePrice = prices[native];
        const msg = `
            <b>New ${baseToken.symbol} Buy!</b>\n
            ${buy_emoji.repeat(process_number(amountInUsd, buy_step))}\n
            💵 <b>Spent: </b> ${formatNumber(amountIn)} ${
          quoteToken.symbol
        } ($${formatNumber(amountInUsd)})
            💰 <b>Bought: </b>${formatNumber(amountOut)} ${baseToken.symbol}
            🏷️ <b>${baseToken.symbol} Price:</b> $${
          tokenPriceUsd >= 0.000000001
            ? formatNumber(tokenPriceUsd, 8)
            : formatNumber(tokenPriceUsd, 14)
        }
            💲 ${native} Price: ${nativePrice}
            🧔‍♂️ <b>Buyer: </b><a href="${explorer}/address/${to}">${to.slice(
          0,
          5
        )}...${to.slice(38)}</a>
            ${
              position === Infinity
                ? "✅ New Buyer"
                : `⬆️ <b>Position:</b> ${(position < 0
                    ? -1 * position
                    : position
                  ).toFixed(0)}%`
            }
            🏦 <b>Market Cap:</b> $${formatNumber(marketCap, 0)}\n
            <a href='${explorer}/tx/${tx_hash}'>TX</a> | <a href='https://dexscreener.com/${
          pool.chainId
        }/${pool_address}'>CHART</a>${
          tg_link ? ` | <a href='${tg_link}'>TG</a>` : ""
        }${twitter ? ` | <a href='${twitter}'>TWITTER</a>` : ""}${
          website ? ` | <a href='${website}'>WEBSITE</a>` : ""
        }
        `;
        if (amountInUsd > min_buy) {
          await sendTelegramMessage(dedent(msg), image, chat_id, network);
          console.log("msg sent");
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function trackBuys(network, version) {
  const provider = new ethers.providers.JsonRpcProvider(RPCS[network]);
  const db = new DB();
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
      console.log(pool_address);

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
      console.log(version, token0, token1, pool_address);
      const token0Contract = new ethers.Contract(token0, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);

      for (const chat of chats) {
        console.log(chat.chat_id);
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
        } = chat;
        const baseToken = pool.baseToken;
        const quoteToken = pool.quoteToken;
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
        console.log(swap_data);

        let { amountIn, amountOut } = swap_data;
        const to = version === "v3" ? args.recipient : args.to;
        const token0Decimals = await token0Contract.decimals();
        const token1Decimals = await token1Contract.decimals();
        let userBalance = compareAddresses(token0, baseToken.address)
          ? await token0Contract.balanceOf(to)
          : await token1Contract.balanceOf(to);
        userBalance = parseInt(userBalance.toString());
        const totalSupply = compareAddresses(token0, baseToken.address)
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

        if (amountIn && amountOut) {
          console.log(baseToken.symbol);
          amountIn = parseInt(amountIn.toString());
          amountOut = parseInt(amountOut.toString());
          const position = getUserPosition(userBalance, amountOut);
          amountIn = amountIn / 10 ** tokenInDecimals;
          amountOut = amountOut / 10 ** tokenOutDecimals;
          const prices = readPrices();
          const quoteTokenPrice = prices[quoteToken.symbol];
          const amountInUsd = amountIn * quoteTokenPrice;
          const tokenPriceUsd = (amountIn / amountOut) * quoteTokenPrice;
          const marketCap =
            (tokenPriceUsd * totalSupply) / 10 ** tokenOutDecimals;
          console.log(amountInUsd, tokenPriceUsd, marketCap);
          const explorer = explorers[pool.chainId];
          const native = NATIVES[network];
          const nativePrice = prices[native];
          const msg = `
            <b>New ${baseToken.symbol} Buy!</b>\n
            ${buy_emoji.repeat(process_number(amountInUsd, buy_step))}\n
            💵 <b>Spent: </b> ${formatNumber(amountIn)} ${
            quoteToken.symbol
          } ($${formatNumber(amountInUsd)})
            💰 <b>Bought: </b>${formatNumber(amountOut)} ${baseToken.symbol}
            🏷️ <b>${baseToken.symbol} Price:</b> $${
            tokenPriceUsd >= 0.000000001
              ? formatNumber(tokenPriceUsd, 8)
              : formatNumber(tokenPriceUsd, 14)
          }
            💲 ${native} Price: ${nativePrice}
            🧔‍♂️ <b>Buyer: </b><a href="${explorer}/address/${to}">${to.slice(
            0,
            5
          )}...${to.slice(38)}</a>
            ${
              position === Infinity
                ? "✅ New Buyer"
                : `⬆️ <b>Position:</b> ${(position < 0
                    ? -1 * position
                    : position
                  ).toFixed(0)}%`
            }
            🏦 <b>Market Cap:</b> $${formatNumber(marketCap, 0)}\n
            <a href='${explorer}/tx/${tx_hash}'>TX</a> | <a href='https://dexscreener.com/${
            pool.chainId
          }/${pool_address}'>CHART</a>${
            tg_link ? ` | <a href='${tg_link}'>TG</a>` : ""
          }${twitter ? ` | <a href='${twitter}'>TWITTER</a>` : ""}${
            website ? ` | <a href='${website}'>WEBSITE</a>` : ""
          }
        `;
          if (amountInUsd > min_buy) {
            await sendTelegramMessage(dedent(msg), image, chat_id, network);
            console.log("msg sent");
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
}

// // trackBuys("manta", "izi");
// const versions = ["v2", "v3"];
// let tasks = [];
// for (const version of versions) {
//   tasks.push(trackBuys("avalanche", version));
// }

// Promise.all(tasks)
//   .then(() => {
//     // This block won't be executed as the promises never resolve
//   })
//   .catch((err) => {
//     console.error("An error occurred in one of the tasks:", err);
//   });

trackBuys("avalanche", "v2");
