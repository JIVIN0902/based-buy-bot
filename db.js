const { ethers } = require("ethers");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  address: String,
  name: String,
  symbol: String,
});

const transactionsSchema = new Schema({
  buys: Number,
  sells: Number,
});

const volumeSchema = new Schema({
  h24: Number,
  h6: Number,
  h1: Number,
  m5: Number,
});

const priceChangeSchema = new Schema({
  m5: Number,
  h1: Number,
  h6: Number,
  h24: Number,
});

const liquiditySchema = new Schema({
  usd: Number,
  base: Number,
  quote: Number,
});

const poolSchema = new Schema({
  chainId: String,
  dexId: String,
  url: String,
  pairAddress: String,
  baseToken: tokenSchema,
  quoteToken: tokenSchema,
  priceNative: String,
  priceUsd: String,
  txns: {
    m5: transactionsSchema,
    h1: transactionsSchema,
    h6: transactionsSchema,
    h24: transactionsSchema,
  },
  volume: volumeSchema,
  priceChange: priceChangeSchema,
  liquidity: liquiditySchema,
  fdv: Number,
  pairCreatedAt: Number,
});

const mainSchema = new Schema({
  pool: poolSchema,
  chat_id: Number,
  buy_step: { type: Number, default: 10 },
  buy_emoji: { type: String, default: "🟢" },
  image: { type: String, default: null },
  website: { type: String, default: null },
  tg_link: { type: String, default: null },
  min_buy: { type: Number, default: 5 },
  twitter: { type: String, default: null },
  circ_supply: { type: Number, default: null },
  total_burned: { type: Number, default: 0 },
  lp_burned: { type: Number, default: 0 },
});

const trendingSchema = new Schema({
  network: String,
  symbol: String,
  tg_link: { type: String, default: null },
  address: String,
  rank: { type: Number, default: 0 },
  tx_hash: { type: String, default: null },
  hrs_tier: { type: Number, default: null },
  timestamp: Number,
  marketCap: { type: Number, default: null },
  marketCapTimestamp: { type: Number, default: null },
  marketCapGrowth: { type: Number, default: null },
  vol: { type: Number, default: 0 },
  volTimestampLatest: { type: Number, default: 0 },
  lastVolResetTimestamp: { type: Number, default: 0 },
});

const trendingVolumeSchema = new Schema({
  amount_buy: Number,
  chat_id: String,
  network: String,
  address: String,
  timestamp: Number,
});

class DB {
  db;
  constructor() {}

  async init() {
    this.db = await mongoose.connect(
      "mongodb+srv://Dynamo:uNPQBc7OlNcaV5Ei@cluster0.wbqvypk.mongodb.net/based-buy-bot?retryWrites=true&w=majority",
      {}
    );

    const buysCollection = this.db.model("buys", mainSchema);
    const trendingCollection = this.db.model("trends", trendingSchema);
    const trendingVolCollection = this.db.model(
      "trending-volume",
      trendingVolumeSchema
    );

    return {
      buysCollection,
      trendingCollection,
      trendingVolCollection,
    };
  }
}

module.exports = { DB, mainSchema, trendingSchema, trendingVolumeSchema };

async function test() {
  const db = new DB();
  const { buysCollection, trendingCollection, trendingVolCollection } =
    await db.init();
  // console.log(
  //   await buysCollection.find({
  //     "pool.baseToken.address": "0xcDE90558fc317C69580DeeAF3eFC509428Df9080",
  //   })
  // );
  // const items = await trendingCollection.find({});
  // for (const item of items) {
  //   console.log(item);
  // }

  // await buysCollection.deleteOne({
  //   _id: "65fcc4db8325c097d811b167",
  // });
  // console.log(
  //   await buysCollection.find({
  //     "pool.chainId": "svm",
  //     "pool.pairAddress": "0xD05bd2fd4c5dFC743dE05FFb8322Ad8C36da6705",
  //   })
  // );
  // const data = await buysCollection.find({ network: "svm" });
  // for (const item of data) {
  //   console.log(item);
  // }
  // console.log();
  // console.log(await buysCollection.find({ "pool.chainId": "avalanche" }));
  // for (const item of ["65e3dd72a1f6d76ded7b8689", "65e3dd79a1f6d76ded7b868b"]) {
  // const delRes = await trendingCollection.deleteOne({
  //   _id: "65e38ab38f7d2f4734ba6ff4",
  // });
  // console.log(delRes);
  // }
  // await buysCollection.deleteOne({ _id: "65d108ad4d4497d6248bd687" });
  // console.log(
  //   await buysCollection.find({ "pool.baseToken.symbol": "VMUMDOGE" })
  // );
  // console.log(
  //   await trendingCollection.updateOne(
  //     { address: "0x5D5cB63E071E4cA1956F9C8C5258Fe7711FD2Ba9" },
  //     { $set: { network: "blast" } }
  //   )
  // );
  await trendingCollection.create({
    network: "base",
    symbol: "COINYE",
    project: "CoinYe",
    tg_link: "https://t.me/CoinyeWest",
    address: ethers.utils.getAddress(
      "0x0028e1E60167b48a938B785AA5292917E7eacA8b"
    ),
  });
  console.log(await trendingCollection.findOne({ symbol: "COINYE" }));
  // const data = await buysCollection.find();
  // for (const item of data) {
  //   console.log(item);
  // }
}

// test();
