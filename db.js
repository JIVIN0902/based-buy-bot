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

    return {
      buysCollection,
    };
  }
}

module.exports = { DB };

// async function test() {
//   const db = new DB();
//   const { buysCollection } = await db.init();
//   console.log(await buysCollection.find());
// }

// test();
