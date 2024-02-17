const explorers = {
  metis: "https://explorer.metis.io",
  avalanche: "https://snowtrace.io",
};

const TRENDINGS = {
  manta: "https://t.me/MantaTrendingLIVE",
  metis: "https://t.me/MetisTrendingLIVE",
  avalanche: "https://t.me/AvaxTrending_LIVE",
};

const RPCS = {
  manta: "https://pacific-rpc.manta.network/http",
  metis: "https://andromeda.metis.io/?owner=1088",
  avalanche:
    "https://open-platform.nodereal.io/336906838ccd4ada98bad06c85251dd6/avalanche-c/ext/bc/C/rpc",
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
};

module.exports = { topics, RPCS, explorers, TRENDINGS, NATIVES };