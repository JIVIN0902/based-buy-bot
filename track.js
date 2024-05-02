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
  get_data_izi,
  updateTrendingVol,
  updateTrendingMarketCap,
  getRandomInt,
  prepareMessage,
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
  DEAD_ADDRESS,
  ZERO_ADDRESS,
  FLOOZ_CHAINS,
} = require("./config");
const { scheduleJob } = require("node-schedule");
const { updatePrices } = require("./updatePrices");
const { updateTrending, updateTrendingVolumes } = require("./updateTrending");
const { trackBurns } = require("./trackBurn");

async function trackBuys(network, version) {
  const provider = new ethers.providers.JsonRpcProvider(RPCS[network]);
  const db = new DB();
  const {
    buysCollection,
    trendingCollection,
    trendingVolCollection,
    adsCollection,
    statsCollection,
  } = await db.init();

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

      // console.log(network, pool_address);
      const chats = await buysCollection.find({
        "pool.pairAddress": ethers.utils.getAddress(pool_address),
      });
      if (chats.length === 0) return;
      const tx_hash = log.transactionHash;
      const networkAds = await adsCollection.find({ network });
      const adToShow =
        networkAds.length > 0
          ? networkAds[getRandomInt(0, networkAds.length - 1)]
          : null;

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

      let i = 0;

      const token0Contract = new ethers.Contract(token0, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);

      const token0Decimals = await token0Contract.decimals();
      const token1Decimals = await token1Contract.decimals();

      for (const chat of chats) {
        i += 1;
        const { min_buy, image, chat_id, pool } = chat;
        const { msg, amountInUsd, isTrending, marketCap } =
          await prepareMessage(
            provider,
            chat,
            network,
            version,
            args,
            adToShow,
            {
              token0,
              token1,
              token0Contract,
              token1Contract,
              token0Decimals,
              token1Decimals,
              pool_address,
              tx_hash,
            },
            {
              buysCollection,
              trendingCollection,
              trendingVolCollection,
              adsCollection,
            }
          );

        try {
          const statsData = {
            tx_hash,
            buyAmount: amountInUsd,
            timestamp: Date.now(),
            network,
            version,
            symbol: pool.baseToken.symbol,
            address: pool.baseToken.address,
          };
          await statsCollection.create({ ...statsData });
          console.log("Stat recorded");
        } catch (error) {}
        if (amountInUsd > min_buy) {
          await sendTelegramMessage(dedent(msg), image, chat_id, network, true);
          if (amountInUsd > 500 && isTrending && i === 1) {
            await sendTelegramMessage(
              dedent(`<b>${TRENDING_CHAINS[network]}</b>\n` + msg),
              null,
              TRENDING_CHAT_IDS[network],
              network,
              false
            );
          }
        }
        await updateTrendingMarketCap(
          { trendingCollection, trendingVolCollection },
          marketCap,
          amountInUsd,
          chat_id,
          network,
          pool.baseToken.address
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  });
}

let tasks = [];
for (const network of CHAINS) {
  for (const version of VERSIONS) {
    tasks.push(trackBuys(network, version));
  }
}

scheduleJob("*/60 * * * * *", updatePrices);
scheduleJob("*/60 * * * * *", updateTrending);
scheduleJob("0 * * * *", updateTrendingVolumes);

Promise.all(tasks)
  .then(() => {
    // This block won't be executed as the promises never resolve
  })
  .catch((err) => {
    console.error("An error occurred in one of the tasks:", err.message);
  });
