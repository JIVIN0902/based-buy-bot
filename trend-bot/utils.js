const { ethers } = require("ethers");
const {
  RPCS,
  NATIVES,
  TRENDINGS_AMOUNTS_PER_HOURS,
  TRENDING_RECIPIENT_ADDRESS,
} = require("../config");
const { getNativePrice } = require("../updatePrices");
const { DB } = require("../db");
const { compareAddresses } = require("../utils");
const { default: axios } = require("axios");

async function getTokenDetails(tokenAddress) {
  try {
    const base_url = "https://api.dexscreener.com/latest/dex/tokens";
    const url = `${base_url}/${tokenAddress}`;
    const { data } = await axios.get(url);
    if (!data.pairs) return;
    return data.pairs[0];
  } catch (error) {
    // throw new Error("Unable to fetch token details. Please try again");
    return;
  }
}

function getPaymentAmountToBeSent(network, hrs) {
  const native = NATIVES[network];
  const nativePriceUsd = getNativePrice(native);
  const amountToBeSent =
    TRENDINGS_AMOUNTS_PER_HOURS[hrs] * (1 / nativePriceUsd);
  return parseFloat(amountToBeSent.toFixed(4));
}

async function validatePayment(txHash, requiredAmount, data) {
  try {
    const { hrs_tier, address, user_id, symbol, tg_link, network } = data;
    const db = new DB();
    const { trendingCollection } = await db.init();
    const trendingExists = await trendingCollection.findOne({
      tx_hash: txHash,
    });
    if (trendingExists) {
      return `❌ Oops! Looks Like this payment has already been confirmed. Please Check the tx hash and try again`;
    }
    const provider = new ethers.providers.JsonRpcProvider(RPCS[network]);

    // Fetch the transaction details using the transaction hash
    const tx = await provider.getTransaction(txHash);

    if (!tx) {
      return `❌ Transaction with this hash does not exist.`;
    }

    if (!compareAddresses(tx.to, TRENDING_RECIPIENT_ADDRESS)) {
      return `❌ The Recipient of this tx is not ${TRENDING_RECIPIENT_ADDRESS}. Pls Check the transaction and try again`;
    }

    // Convert the value from wei to ETH
    const valueInNative = ethers.utils.formatEther(tx.value);
    if (parseFloat(valueInNative) < requiredAmount) {
      return `❌ Insufficient Transfer Amount. Pls make sure the amount transferred is greater than or equal to ${requiredAmount}`;
    }

    console.log(`Transaction Amount: ${valueInNative} ${NATIVES[network]}`);
    return `
      <b>✅ Your Booking has been confirmed ✅</b>\n
      <b>Token Address: </b> ${address}
      <b>Network Address: </b> ${network}
      <b>Plan: </b> ${hrs_tier}hrs
    `;
  } catch (error) {
    console.error("Error fetching transaction:", error);
  }
}

// // console.log(getPaymentAmountToBeSent("manta", 8));
// validatePayment(
//   "0x80d5ef544192aa7b9bd245a996a759828fdafc18488338fd4f63c94977936ef2",
//   0.1,
//   {
//     hrs_tier: 8,
//     address: "0x480E158395cC5b41e5584347c495584cA2cAf78d",
//     user_id: 1234,
//     symbol: "VOYA",
//     tg_link: "https://t.me/voya",
//     network: "manta",
//   }
// ).then(console.log);

module.exports = { getTokenDetails };
