// const { ethers } = require("ethers");

// // const number = 0.5;
// // const bigNumberString = ethers.BigNumber.from(number.toString()).toString();

// // console.log(bigNumberString); // Prints: '500000000000000000'

// let amountIn = ethers.BigNumber.from("0x11c37937e08000");
// amountIn = parseFloat(ethers.utils.formatUnits(amountIn, 18));
// // ethers.utils.parseUnits();
// console.log(amountIn);

// let amountOut = -9.50613102709001e24;
// amountOut = amountOut.toLocaleString("fullwide", { useGrouping: false });
// amountOut = ethers.BigNumber.from(amountOut).mul(-1);
// // console.log(amountIn.toString());
// amountOut = parseFloat(ethers.utils.formatUnits(amountOut, 18).toString());
// console.log(amountOut);

// // amountIn = parseInt(amountIn.toString());
// // amountOut = parseInt(amountOut.toString());
// // console.log(amountIn, amountOut);
// // amountIn = amountIn.div(decimal);
// // const decimal = ethers.BigNumber.from((10 ** 18).toString());
// // amountOut = amountOut.div(decimal);
// // console.log(amountOut.toString());
// // amountIn = parseFloat(amountIn);
// // amountOut = parseFloat(amountOut);
// // console.log(amountIn, amountOut);
// // // const amountInUsd = amountIn * quoteTokenPrice;
// // // // console.log("Amt in usd ->", amountInUsd);
// // // const tokenPriceUsd = (amountIn / amountOut) * quoteTokenPrice;
// // // // console.log("Token price usd ->", tokenPriceUsd);
// // // const supply = circ_supply ? circ_supply : totalSupply;
// // // const marketCap = (tokenPriceUsd * supply) / 10 ** tokenOutDecimals;
// // // // console.log(amountInUsd, tokenPriceUsd, marketCap);
// // // const explorer = explorers[pool.chainId];
// // // const native = NATIVES[network];
// // // const nativePrice = prices[native];
