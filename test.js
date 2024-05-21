// // const { ethers } = require("ethers");
// // const { NATIVES, explorers, TRENDINGS, TRENDING_MSG_IDS } = require("./config");
// // const dedent = require("dedent");
// const {
//   process_number,
//   formatNumber,
//   sendTelegramMessage,
// } = require("./utils");

// // // const number = 0.5;
// // // const bigNumberString = ethers.BigNumber.from(number.toString()).toString();

// // // console.log(bigNumberString); // Prints: '500000000000000000'

// // let amountIn = ethers.BigNumber.from("0x11c37937e08000");
// // amountIn = parseFloat(ethers.utils.formatUnits(amountIn, 18));
// // // // ethers.utils.parseUnits();
// // // console.log(amountIn);

// // let amountOut = -9.50613102709001e24;
// // amountOut = amountOut.toLocaleString("fullwide", { useGrouping: false });
// // amountOut = ethers.BigNumber.from(amountOut).mul(-1);
// // // console.log(amountIn.toString());
// // amountOut = parseFloat(ethers.utils.formatUnits(amountOut, 18).toString());
// // console.log(amountOut);

// // // amountIn = parseInt(amountIn.toString());
// // // amountOut = parseInt(amountOut.toString());
// // // console.log(amountIn, amountOut);
// // // const decimal = ethers.BigNumber.from((10 ** 18).toString());
// // // amountIn = amountIn.div(decimal);
// // // amountOut = amountOut.div(decimal);
// // // console.log(amountOut.toString());
// // // amountIn = parseFloat(amountIn);
// // // amountOut = parseFloat(amountOut);
// // console.log(amountIn, amountOut);
// // let quoteTokenPrice = 2345;
// // const amountInUsd = amountIn * quoteTokenPrice;
// // // console.log("Amt in usd ->", amountInUsd);
// // const tokenPriceUsd = (amountIn / amountOut) * quoteTokenPrice;
// // // console.log("Token price usd ->", tokenPriceUsd);
// // let circ_supply = 1000000;
// // const supply = circ_supply ? circ_supply : totalSupply;
// // let tokenOutDecimals = 18;
// // const marketCap = (tokenPriceUsd * supply) / 10 ** tokenOutDecimals;
// // // console.log(amountInUsd, tokenPriceUsd, marketCap);
// // const pool = { chainId: "base" };
// // const explorer = explorers[pool.chainId];
// // const network = "base";
// // const native = NATIVES[network];
// // const nativePrice = 2345;
// // const baseToken = { symbol: "ABCD" };
// // const quoteToken = { symbol: "ETH" };
// // to = "0x713ea4a158Dc5BCb451beEB13c000698A12F9720";
// // const tx_hash = "0x713ea4a158Dc5BCb451beEB13c000698A12F9720";
// // const pool_address = "0x713ea4a158Dc5BCb451beEB13c000698A12F9720";
// // const tg_link = null;
// // const website = null;
// // const twitter = null;
// // const position = 25;
// // const trendingMsg = "\nTRENDING\n";
// // const adMsg = "ads";

// // let msg = `
// //             <b>New ABCD Buy!</b>\n
// //             ${"🟢".repeat(process_number(amountInUsd, 10))}\n
// //             💵 <b>Spent:</b> ${formatNumber(amountIn, 3)} ${
// //   quoteToken.symbol
// // } ($${formatNumber(amountInUsd)})
// //             💰 <b>Bought: </b>${formatNumber(amountOut)} ${baseToken.symbol}
// //             🏷️ <b>${baseToken.symbol} Price:</b> $${
// //   tokenPriceUsd >= 0.000000001
// //     ? formatNumber(tokenPriceUsd, 8)
// //     : formatNumber(tokenPriceUsd, 18)
// // }
// //             💲 <b>${native} Price:</b> $${
// //   nativePrice >= 1 ? formatNumber(nativePrice) : formatNumber(nativePrice, 8)
// // }
// //             ${
// //               to
// //                 ? `🧔‍♂️ <b>Buyer: </b><a href="${explorer}/address/${to}">${to.slice(
// //                     0,
// //                     5
// //                   )}...${to.slice(38)}</a> | `
// //                 : ""
// //             }<a href='${explorer}/tx/${tx_hash}'>TX</a>
// //             ${
// //               position
// //                 ? position === Infinity || position >= 100 || position <= -100
// //                   ? "<b>✅ New Chad</b>"
// //                   : `⬆️ <b>Position:</b> +${(position < 0
// //                       ? -1 * position
// //                       : position
// //                     ).toFixed(0)}%`
// //                 : ""
// //             }
// //             🏦 <b>Market Cap:</b> $${formatNumber(marketCap, 0)}
// //             ${trendingMsg || ""}
// //             <a href='https://dexscreener.com/${
// //               pool.chainId === "degen" ? "degenchain" : pool.chainId
// //             }/${pool_address}'>📊 CHART</a>${
// //   tg_link ? ` | <a href='${tg_link}'>TG</a>` : ""
// // }${twitter ? ` | <a href='${twitter}'>X</a>` : ""}${
// //   website ? ` | <a href='${website}'>WEBSITE</a>` : ""
// // } | <a href="${TRENDINGS[network]}/${
// //   TRENDING_MSG_IDS[network].orangeTrending
// // }">TRENDING</a>
// //         ${adMsg || ""}
// //         `;

// // console.log(msg);

// // sendTelegramMessage(dedent(msg), null, -4010683331, "base", false);
// console.log(process_number(4373.78, 10));

// const { default: axios } = require("axios");
// const { ethers } = require("ethers");
// const fs = require("fs");

// const url =
//   "https://testnet.vrd.network/api?module=account&action=listaccounts&offset=500&page=2";

// async function fetchAndParse() {
//   try {
//     let { data } = await axios.get(url);
//     data = data.result;
//     // console.log(data);

//     // Check if data is an array
//     if (!Array.isArray(data)) {
//       console.error("Expected data to be an array");
//       return;
//     }

//     // Prepare CSV content
//     const csvHeaders = "address,balance\n";
//     const csvRows = data
//       .map(
//         (item) =>
//           `${item.address},${ethers.utils.formatUnits(item.balance, "ether")}`
//       )
//       .join("\n");
//     const csvContent = csvHeaders + csvRows;

//     // Write CSV content to file
//     fs.writeFileSync("output2.csv", csvContent, "utf8");
//     console.log("CSV file has been saved.");
//   } catch (error) {
//     console.error("Error fetching or parsing data:", error);
//   }
// }

// fetchAndParse();
