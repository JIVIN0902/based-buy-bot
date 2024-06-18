const { ethers } = require("ethers");
const mongoose = require("mongoose");
const { bananaBuyBot } = require("./utils");
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

const adsSchema = new Schema({
  timestamp: Number,
  url: { type: String, unique: true },
  text: String,
});

const trendingVolumeSchema = new Schema({
  amount_buy: Number,
  chat_id: String,
  network: String,
  address: String,
  timestamp: Number,
});

class DBBanana {
  db;
  constructor() {}

  async init() {
    this.db = await mongoose.connect(
      "mongodb+srv://Dynamo:uNPQBc7OlNcaV5Ei@cluster0.wbqvypk.mongodb.net/banana-buy-bot?retryWrites=true&w=majority",
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

module.exports = { DBBanana };

async function main() {
  const db = new DBBanana();
  const { buysCollection } = await db.init();
  const bananaCt = await buysCollection.countDocuments();
  console.log(bananaCt);
  const groups = await buysCollection.find({});
  let totalMembers = 0;
  for (const group of groups) {
    try {
      totalMembers += await bananaBuyBot.getChatMemberCount(group.chat_id);
    } catch (error) {}
  }
  console.log(`CUMULATIVE MEMBERS Banana ->`, totalMembers);
}

// main();
