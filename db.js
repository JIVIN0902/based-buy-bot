const { ethers } = require("ethers");
const mongoose = require("mongoose");
const { buyBot } = require("./utils");
const { parse } = require("json2csv");
const { promises } = require("fs");
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

const statsSchema = new Schema({
  tx_hash: String,
  timestamp: Number,
  buyAmount: Number,
  network: String,
  version: String,
  symbol: String,
  address: String,
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

const adsSchema = new Schema({
  timestamp: Number,
  url: { type: String, unique: true },
  text: String,
  network: { type: String, default: null },
  expiry: Number,
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
    const adsCollection = this.db.model("ads", adsSchema);
    const statsCollection = this.db.model("stats", statsSchema);
    const trendingVolCollection = this.db.model(
      "trending-volume",
      trendingVolumeSchema
    );

    return {
      buysCollection,
      trendingCollection,
      trendingVolCollection,
      adsCollection,
      statsCollection,
    };
  }
}

class DBCustom {
  db;
  constructor() {}

  async init() {
    this.db = await mongoose.connect(
      "mongodb+srv://Dynamo:uNPQBc7OlNcaV5Ei@cluster0.wbqvypk.mongodb.net/custom-buy-bot?retryWrites=true&w=majority",
      {}
    );

    const buysCollection = this.db.model("buys", mainSchema);
    const trendingCollection = this.db.model("trends", trendingSchema);
    const adsCollection = this.db.model("ads", adsSchema);
    const trendingVolCollection = this.db.model(
      "trending-volume",
      trendingVolumeSchema
    );

    return {
      buysCollection,
      trendingCollection,
      trendingVolCollection,
      adsCollection,
    };
  }
}

module.exports = {
  DB,
  mainSchema,
  trendingSchema,
  trendingVolumeSchema,
  DBCustom,
};

async function test() {
  const db = new DB();
  const {
    buysCollection,
    trendingCollection,
    trendingVolCollection,
    statsCollection,
    adsCollection,
  } = await db.init();
  // await statsCollection.deleteMany({});
  await trendingCollection.deleteOne({ _id: "6636afb374301276784361f9" });
  // let data = await statsCollection.find({ network: "blast" });
  // data = data.map((item) => ({
  //   tx_hash: item.tx_hash,
  //   timestamp: parseInt(item.timestamp / 1000),
  //   buyAmount: item.buyAmount,
  //   network: item.network,
  //   version: item.version,
  //   symbol: item.symbol,
  //   address: item.address,
  // }));

  // const csv = parse(data);
  // await promises.writeFile("orange.csv", csv);

  // const grpCount = await buysCollection.countDocuments();
  // console.log(grpCount);
  // const chats = await buysCollection.find({
  //   "pool.pairAddress": ethers.utils.getAddress(
  //     "0x131fc641d2c62c3aef5c50014d48332288d3612d"
  //   ),
  // });
  // console.log(chats);
  // const groups = await buysCollection.find({});
  // let totalMembers = 0;
  // for (const group of groups) {
  //   try {
  //     totalMembers += await buyBot.getChatMemberCount(group.chat_id);
  //   } catch (error) {}
  // }
  // console.log(`CUMULATIVE MEMBERS ->`, totalMembers);

  // console.log(
  //   await buysCollection.find({
  //     // "pool.baseToken.address": "0xcDE90558fc317C69580DeeAF3eFC509428Df9080",
  //     "pool.chainId": "degen",
  //   })
  // );
  // await trendingCollection.deleteMany({
  //   symbol: "PEPEWIFXAI",
  // });
  const items = await trendingCollection.find({ network: "merlinchain" });
  for (const item of items) {
    console.log(item);
  }

  // await buysCollection.deleteOne({
  //   _id: "662836b356be3c2bbcc1f389",
  // });
  // // console.log(
  // console.log(
  //   await buysCollection.find({
  //     "pool.chainId": "blast",
  //     "pool.baseToken.address": ethers.utils.getAddress(
  //       "0x76D6556758365e63e48A0DFAfd19C8DBa15F97eE"
  //     ),
  //   })
  // );
  // );
  // // const data = await buysCollection.find({ network: "svm" });
  // // for (const item of data) {
  // //   console.log(item);
  // // }
  // // console.log();
  // // console.log(await buysCollection.find({ "pool.chainId": "avalanche" }));
  // // for (const item of ["65e3dd72a1f6d76ded7b8689", "65e3dd79a1f6d76ded7b868b"]) {
  // // const delRes = await trendingCollection.deleteOne({
  // //   _id: "65e38ab38f7d2f4734ba6ff4",
  // // });
  // // console.log(delRes);
  // // }
  // // await buysCollection.deleteOne({ _id: "65d108ad4d4497d6248bd687" });
  // // console.log(
  // //   await buysCollection.find({ "pool.baseToken.symbol": "VMUMDOGE" })
  // // );
  // // console.log(
  // //   await trendingCollection.updateOne(
  // //     { address: "0x5D5cB63E071E4cA1956F9C8C5258Fe7711FD2Ba9" },
  // //     { $set: { network: "blast" } }
  // //   )
  // // );
  // console.log(await trendingCollection.deleteMany({ network: "blast" }));
  // await trendingCollection.create({
  //   tg_link: "https://t.me/basedduckbuck",
  //   tx_hash: null,
  //   lastVolResetTimestamp: 0,
  //   hrs_tier: 24 * 30,
  //   address: "0x2a5df5D3DBa819089cE1daCD55477f522C3AFFa3",
  //   symbol: "$BUCK",
  //   rank: 1,
  //   timestamp: Date.now(),
  //   network: "base",
  //   chat_id: -1002014104417,
  //   vol: 0,
  //   volTimestampLatest: 0,
  //   marketCap: 8000,
  //   marketCapGrowth: 11,
  //   marketCapTimestamp: 0,
  // });
  // console.log(await trendingCollection.find({ network: "base" }));
  // const data = await buysCollection.find();
  // for (const item of data) {
  //   console.log(item);
  // }
  // await adsCollection.deleteOne({ url: "https://t.me/AndyBlastL2" });
  // console.log(await adsCollection.find({}));
}

// test();
