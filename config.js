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
  zetachain: "https://explorer.zetachain.com",
  svm: "https://svmscan.io",
  bevm: "https://scan-mainnet.bevm.io",
  degen: "https://explorer.degen.tips",
  xdc: "https://explorer.xinfin.network",
  core: "https://scan.coredao.org",
  bitlayer: "https://www.btrscan.com",
  b2: "https://explorer.bsquared.network",
  chillis: "https://chiliscan.com",
  xai: "https://explorer.xai-chain.net",
  sanko: "https://explorer.sanko.xyz",
  qom: "https://scan.qom.one",
};

// const BOT_TOKEN = "6758353198:AAH0ddOvAUOq_1RMNv_IhkavwuaWO1mWa_A";
const BOT_TOKEN = process.env.BOT_TOKEN;

const TRENDINGS = {
  manta: "https://t.me/OrangeTrending",
  metis: "https://t.me/OrangeTrending",
  avalanche: "https://t.me/OrangeTrending",
  scroll: "https://t.me/OrangeTrending",
  zksync: "https://t.me/OrangeTrending",
  dymension: "https://t.me/OrangeTrending",
  blast: "https://t.me/OrangeTrending",
  base: "https://t.me/OrangeTrending",
  pulsechain: "https://t.me/OrangeTrending",
  blast: "https://t.me/OrangeTrending",
  merlinchain: "https://t.me/OrangeTrending",
  zetachain: "https://t.me/OrangeTrending",
  degen: "https://t.me/OrangeTrending",
  core: "https://t.me/OrangeTrending",
  svm: "https://t.me/SatoshiVMTrending",
  bevm: "https://t.me/OrangeTrending",
  xai: "https://t.me/OrangeTrending",
  chillis: "https://t.me/ChilizTrendingLIVE",
};

const STANDALONE_TRENDINGS = {
  zksync: "https://t.me/ZkSyncTrendingLive",
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
  inevm: "https://mainnet.rpc.inevm.com/http",
  svm: "https://alpha-rpc-node-http.svmscan.io",
  bevm: "https://rpc-mainnet-1.bevm.io",
  degen: "https://rpc.degen.tips",
  xdc: "https://erpc.xinfin.network",
  core: "https://rpc.coredao.org",
  bitlayer: "https://rpc.bitlayer.org",
  b2: "https://rpc.bsquared.network",
  chillis: "https://rpc.ankr.com/chiliz",
  xai: "https://xai-chain.net/rpc",
  sanko: "https://mainnet.sanko.xyz",
  qom: "https://rpc.qom.one",
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
  svm: "BTC",
  bevm: "BTC",
  bitlayer: "BTC",
  degen: "DEGEN",
  xdc: "XDC",
  core: "CORE",
  b2: "BTC",
  chillis: "CHZ",
  xai: "XAI",
  sanko: "DMT",
  qom: "QOM",
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dead";

const ORANGE_TRENDING_CHAT_ID = -1001883705059;

const STANDALONE_TRENDING_CHAT_IDS = {
  manta: null,
  metis: null,
  avalanche: null,
  scroll: null,
  zksync: -1002053145502,
  base: null,
  pulsechain: null,
  blast: null,
  merlinchain: null,
  zetachain: null,
  svm: -1002045980358,
  chillis: -1002027639711,
};

const TRENDING_CHAT_IDS = {
  manta: -1001883705059,
  metis: -1001883705059,
  avalanche: -1001883705059,
  scroll: -1001883705059,
  zksync: -1001883705059,
  base: -1001883705059,
  pulsechain: -1001883705059,
  blast: -1001883705059,
  merlinchain: -1001883705059,
  zetachain: -1001883705059,
  svm: -1002045980358,
  bevm: -1002045980359,
  degen: -1001883705059,
  core: -1001883705059,
  xai: -1001883705059,
};

const TRENDING_MSG_IDS = {
  manta: {
    orangeTrending: 48,
  },
  metis: {
    orangeTrending: 47,
  },
  avalanche: {
    orangeTrending: 45,
  },
  scroll: {
    orangeTrending: 46,
  },
  zksync: {
    orangeTrending: 50,
    standalone: 8,
  },
  base: {
    orangeTrending: 49,
  },
  pulsechain: {
    orangeTrending: 44,
  },
  blast: {
    orangeTrending: 43,
  },
  merlinchain: {
    orangeTrending: 51,
  },
  zetachain: {
    orangeTrending: 55,
  },
  svm: {
    orangeTrending: 56,
  },
  bevm: {
    orangeTrending: 57,
  },
  degen: {
    orangeTrending: 58,
  },
  core: {
    orangeTrending: 59,
  },
  chillis: {
    standalone: 3,
  },
  xai: {
    orangeTrending: 60,
  },
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

const BURN_GIF =
  "https://firebasestorage.googleapis.com/v0/b/raidon-90131.appspot.com/o/burn.mp4?alt=media&token=7c33a0e2-8386-4a9e-8906-0de8190b12e2";

const VERSIONS = ["v2", "v3", "izi"];

const CHAINS = [
  "merlinchain",
  "manta",
  "metis",
  "avalanche",
  "scroll",
  "base",
  "zksync",
  // "pulsechain",
  "blast",
  "zetachain",
  // "bevm",
  // "degen",
  // "core",
  "xai",
];

const BANANA_CHAINS = [
  "svm",
  "pulsechain",
  "xdc",
  "bitlayer",
  "b2",
  "chillis",
  "sanko",
  "qom",
];

const FLOOZ_CHAINS = ["base", "blast", "avalanche", "zksync"];

const CHARTS = {
  xdc: "https://www.geckoterminal.com/xdc/pools",
  chillis: "https://www.geckoterminal.com/chiliz-chain/pools",
  sanko: "https://www.defined.fi/sanko",
  qom: "https://www.qomswap.com/info/pools",
};

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
  svm: "satoshivm",
  bevm: "bevm",
  degen: "DEGEN",
  core: "CORE",
  chillis: "CHILLIZ",
  xai: "XAI",
};

const TREND_BOT_CHAINS = {
  svm: "SatoshiVM",
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
  TRENDING_CHAT_IDS,
  TRENDING_MSG_IDS,
  ORANGE_TRENDING_CHAT_ID,
  CHAINS,
  VERSIONS,
  BOT_TOKEN,
  TRENDING_RANK_EMOJIS,
  TRENDINGS_AMOUNTS_PER_HOURS,
  TRENDING_RECIPIENT_ADDRESS,
  TRENDING_CHAINS,
  TREND_BOT_CHAINS,
  BURN_GIF,
  STANDALONE_TRENDINGS,
  STANDALONE_TRENDING_CHAT_IDS,
  BANANA_CHAINS,
  CHARTS,
  ZERO_ADDRESS,
  DEAD_ADDRESS,
  FLOOZ_CHAINS,
};
