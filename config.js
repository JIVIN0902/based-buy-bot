const { config } = require("dotenv");
config();
const explorers = {
  metis: "https://explorer.metis.io",
  avalanche: "https://snowtrace.io",
  manta: "https://manta-pacific.calderaexplorer.xyz",
  scroll: "https://scrollscan.com",
  zksync: "https://explorer.zksync.io",
  dymension: "https://jsonrpc.dymension.nodestake.org	",
  base: "https://basescan.org",
  pulsechain:
    "https://scan.mypinata.cloud/ipfs/bafybeidn64pd2u525lmoipjl4nh3ooa2imd7huionjsdepdsphl5slfowy/#",
  blast: "https://blastscan.io",
  merlinchain: "https://scan.merlinchain.io",
};

// const BOT_TOKEN = "6758353198:AAH0ddOvAUOq_1RMNv_IhkavwuaWO1mWa_A";
const BOT_TOKEN = process.env.BOT_TOKEN;

const TRENDINGS = {
  manta: "https://t.me/MantaTrendingLIVE",
  metis: "https://t.me/MetisTrendingLIVE",
  avalanche: "https://t.me/AvaxTrending_LIVE",
  scroll: "https://t.me/ScrollTrendingLIVE",
  zksync: "https://t.me/ZkSyncTrendingLIVE",
  dymension: "https://t.me/DymensionTrending",
  blast: "https://t.me/BlastTrendingAlert",
  base: "https://t.me/OrangeTrending",
  pulsechain: "https://t.me/OrangeTrending",
  blast: "https://t.me/OrangeTrending",
  merlinchain: "https://t.me/OrangeTrending",
};

const RPCS = {
  manta: "https://pacific-rpc.manta.network/http",
  metis: "https://andromeda.metis.io/?owner=1088",
  avalanche:
    "https://open-platform.nodereal.io/336906838ccd4ada98bad06c85251dd6/avalanche-c/ext/bc/C/rpc",
  scroll: "https://rpc.scroll.io",
  zksync:
    "https://open-platform.nodereal.io/014f811f63514485bf519847d0b19465/zksync",
  dymension: "https://dymension-evm.blockpi.network/v1/rpc/public	",
  base: "https://open-platform.nodereal.io/01a63ae96ef3458aa2a161b3ab7b16d6/base",
  pulsechain: "https://rpc.pulsechain.com",
  blast: "https://blast.blockpi.network/v1/rpc/public",
  merlinchain: "https://rpc.merlinchain.io",
  zetachain: "https://zetachain-evm.blockpi.network/v1/rpc/public",
};

const topics = {
  v3: "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67",
  v2: "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
  izi: "0x0fe977d619f8172f7fdbe8bb8928ef80952817d96936509f67d66346bc4cd10f",
};

const NATIVES = {
  manta: "ETH",
  metis: "METIS",
  avalanche: "AVAX",
  scroll: "ETH",
  zksync: "ETH",
  dymension: "DYM",
  base: "ETH",
  pulsechain: "PLS",
  blast: "ETH",
  merlinchain: "BTC",
  zetachain: "ZETA",
};

const TRENDING_CHAT_ID = -1001883705059;

const TRENDING_MSG_IDS = {
  manta: 48,
  metis: 47,
  avalanche: 45,
  scroll: 46,
  zksync: 50,
  base: 49,
  pulsechain: 44,
  blast: 43,
  merlinchain: 51,
  zetachain: 20,
};

const TRENDING_RANK_EMOJIS = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
  4: "4️⃣",
  5: "5️⃣",
  6: "6️⃣",
  7: "7️⃣",
  8: "8️⃣",
  9: "9️⃣",
  10: "🔟",
  11: "1️⃣1️⃣",
  12: "1️⃣2️⃣",
  13: "1️⃣3️⃣",
  14: "1️⃣4️⃣",
  15: "1️⃣5️⃣",
  16: "1️⃣6️⃣",
  17: "1️⃣7️⃣",
  18: "1️⃣8️⃣",
  19: "1️⃣9️⃣",
  20: "2️⃣0️⃣",
};

const VERSIONS = ["v2", "v3", "izi"];

const CHAINS = [
  "merlinchain",
  "manta",
  "metis",
  "avalanche",
  "scroll",
  "base",
  "zksync",
  "pulsechain",
  "blast",
  "zetachain",
];

const TRENDING_CHAINS = {
  manta: "MANTA",
  metis: "METIS",
  avalanche: "AVAX",
  scroll: "SCROLL",
  zksync: "ZKSYNC",
  pulsechain: "PULSE",
  blast: "BLAST",
  merlinchain: "MERLIN",
  base: "BASE",
  zetachain: "ZETACHAIN",
};

const TRENDING_RECIPIENT_ADDRESS = "0x70eA2D4Ac98b304FbF8924fb43C8f7f220F0b4F6";

const TRENDINGS_AMOUNTS_PER_HOURS = {
  8: 100,
  24: 200,
};

module.exports = {
  topics,
  RPCS,
  explorers,
  TRENDINGS,
  NATIVES,
  TRENDING_CHAT_ID,
  TRENDING_MSG_IDS,
  CHAINS,
  VERSIONS,
  BOT_TOKEN,
  TRENDING_RANK_EMOJIS,
  TRENDINGS_AMOUNTS_PER_HOURS,
  TRENDING_RECIPIENT_ADDRESS,
  TRENDING_CHAINS,
};
