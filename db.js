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
});

const trendingSchema = new Schema({
  network: String,
  symbol: String,
  tg_link: { type: String, default: null },
  address: String,
  rank: { type: Number, default: null },
  vol: { type: Number, default: 10 },
  tx_hash: { type: String, default: null },
  hrs_tier: { type: Number, default: null },
  timestamp: Number,
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
  await trendingCollection.deleteMany({
    network: "manta",
  });
  // console.log(await trendingCollection.findOne({ network: "blast" }));
  // console.log(
  //   await trendingCollection.updateOne(
  //     { address: "0x5D5cB63E071E4cA1956F9C8C5258Fe7711FD2Ba9" },
  //     { $set: { network: "blast" } }
  //   )
  // );
  // await trendingCollection.create({
  //   network: "merlinchain",
  //   symbol: "VOYA",
  //   project: "Voya",
  //   tg_link: "https://t.me/+YQyWhYjpeUQ1NDM1",
  //   address: ethers.utils.getAddress(
  //     "0x480E158395cC5b41e5584347c495584cA2cAf78d"
  //   ),
  // });
  // const data = await buysCollection.find();
  // for (const item of data) {
  //   console.log(item);
  // }
}

test();
