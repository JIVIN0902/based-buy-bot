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

// // const RPC_URL = "https://andromeda.metis.io/?owner=1088";
// const RPC_URL = "https://pacific-rpc.manta.network/http";
const RPCS = {
  manta: "https://pacific-rpc.manta.network/http",
  metis: "https://andromeda.metis.io/?owner=1088",
};

async function trackBuys(network, version) {
  const provider = new ethers.providers.JsonRpcProvider(RPCS[network]);
  const db = new DB();
  const { buysCollection } = await db.init();
  const topics = {
    v3: "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67",
    v2: "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
    izi: "0x0fe977d619f8172f7fdbe8bb8928ef80952817d96936509f67d66346bc4cd10f",
  };
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

      const tx_hash = log.transactionHash;

      const event = iface.parseLog(log);
      const args = event.args;

      const chats = await buysCollection.find({
        "pool.pairAddress": ethers.utils.getAddress(pool_address),
      });
      const poolContract = new ethers.Contract(pool_address, abi, provider);
      const token0 =
        version === "v2" || version === "v3"
          ? await poolContract.token0()
          : await poolContract.tokenX();
      const token1 =
        version === "v2" || version === "v3"
          ? await poolContract.token1()
          : await poolContract.tokenY();
      console.log(token0, token1);
      const token0Contract = new ethers.Contract(token0, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);

      for (const chat of chats) {
        const pool = chat.pool;
        const { buy_step, buy_emoji, min_buy, image, chat_id, tg_link } = chat;
        const baseToken = pool.baseToken;
        const quoteToken = pool.quoteToken;
        const swap_data = get_data_v3(
          args,
          baseToken.address,
          quoteToken.address,
          token0,
          token1
        );

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
          const msg = `
            <b>New ${baseToken.symbol} Buy!</b>\n
            ${buy_emoji.repeat(process_number(amountInUsd, buy_step))}\n
            💵 <b>Spent: </b> ${formatNumber(amountIn)} ${
            quoteToken.symbol
          } ($${formatNumber(amountInUsd)})
            💰 <b>Bought: </b>${formatNumber(amountOut)} ${baseToken.symbol}
            🏷️ <b>Price:</b> $${
              tokenPriceUsd >= 0.000000001
                ? formatNumber(tokenPriceUsd, 8)
                : formatNumber(tokenPriceUsd, 14)
            }
            ⬆️ <b>Position:</b> ${(position < 0
              ? -1 * position
              : position
            ).toFixed(0)}%
            🏦 <b>Market Cap:</b> $${formatNumber(marketCap)}\n
            <a href='${
              explorers[pool.chainId]
            }/${tx_hash}'>TX</a> | <a href='https://dexscreener.com/${
            pool.chainId
          }/${pool_address}'>CHART</a>${
            tg_link ? ` | <a href='${tg_link}'>TG</a>` : ""
          }
        `;
          if (amountInUsd > min_buy) {
            await sendTelegramMessage(dedent(msg), image, chat_id, network);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
}

trackBuys("metis", "v3");
