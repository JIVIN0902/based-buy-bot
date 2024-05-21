const { default: axios } = require("axios");
const fs = require("fs");
const { scheduleJob } = require("node-schedule");

async function updatePrices() {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=metis-token,avalanche-2,ethereum,manta-network,pulsechain,bitcoin,zetachain,degen-base,xdce-crowd-sale,coredaoorg,chiliz,xai-blockchain,dream-machine-token&vs_currencies=usd`;
  const { data } = await axios.get(url);
  const ethPrice = data.ethereum.usd;
  const avaxPrice = data["avalanche-2"].usd;
  const metisPrice = data["metis-token"].usd;
  const mantaPrice = data["manta-network"].usd;
  const plsPrice = data["pulsechain"].usd;
  const btcPrice = data["bitcoin"].usd;
  const zetaPrice = data["zetachain"].usd;
  const degenPrice = data["degen-base"].usd;
  const xdcPrice = data["xdce-crowd-sale"].usd;
  const corePrice = data["coredaoorg"].usd;
  const chillisPrice = data["chiliz"].usd;
  const xaiPrice = data["xai-blockchain"].usd;
  const dmtPrice = data["dream-machine-token"].usd;
  const priceData = {
    ETH: ethPrice,
    WETH: ethPrice,
    METIS: metisPrice,
    WMETIS: metisPrice,
    Metis: metisPrice,
    AVAX: avaxPrice,
    WAVAX: avaxPrice,
    USDC: 1,
    DAI: 1,
    USDT: 1,
    "m.USDC": 1,
    "m.USDT": 1,
    PLS: plsPrice,
    WPLS: plsPrice,
    MANTA: mantaPrice,
    WBTC: btcPrice,
    BTC: btcPrice,
    "ETH.ETH": ethPrice,
    "BTC.BTC": btcPrice,
    ZETA: zetaPrice,
    WZETA: zetaPrice,
    WDEGEN: degenPrice,
    DEGEN: degenPrice,
    XDC: xdcPrice,
    WXDC: xdcPrice,
    CORE: corePrice,
    WCORE: corePrice,
    CHZ: chillisPrice,
    WCHZ: chillisPrice,
    XAI: xaiPrice,
    WXAI: xaiPrice,
    DMT: dmtPrice,
    WDMT: dmtPrice,
  };
  const jsonData = JSON.stringify(priceData, null, 2);
  // console.log(jsonData);
  fs.writeFile("prices.json", jsonData, (err) => {
    if (err) {
      console.error("An error occurred:", err.message);
    } else {
      console.log("Data written to file successfully.");
    }
  });
}

function getNativePrice(key) {
  let data = fs.readFileSync("prices.json", "utf-8");
  data = JSON.parse(data);
  return data[key];
}

module.exports = { getNativePrice, updatePrices };
