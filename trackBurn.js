const { ethers } = require("ethers");
const { ERC20_ABI } = require("./abis");
const { DB } = require("./db");
const { sendTelegramMessage, formatNumber } = require("./utils");
const dedent = require("dedent");
const { RPCS, explorers } = require("./config");

const iface = new ethers.utils.Interface(ERC20_ABI);

async function listenForAllERC20Transfers(network) {
  const provider = new ethers.providers.JsonRpcProvider(RPCS[network]);

  const transferTopic = ethers.utils.id("Transfer(address,address,uint256)");
  const db = new DB();
  const { buysCollection, trendingCollection, trendingVolCollection } =
    await db.init();

  provider.on(
    {
      topics: [transferTopic],
    },
    async (log, data) => {
      try {
        const logs = iface.parseLog(log);
        const args = logs.args;
        const tx_hash = log.transactionHash;
        if (
          args.to === "0x000000000000000000000000000000000000dEaD" ||
          args.to === "0x0000000000000000000000000000000000000000"
        ) {
          const tokenAddress = log.address;
          const isLpBurn = await buysCollection.find({
            "pool.pairAddress": ethers.utils.getAddress(tokenAddress),
          });

          const isTokenBurn = await buysCollection.find({
            "pool.baseToken.address": ethers.utils.getAddress(tokenAddress),
          });
          if (isLpBurn.length > 0) {
            console.log("LP was burnt");
          } else if (isTokenBurn.length > 0) {
            console.log("Token Burned: ", tokenAddress);
            const tokenContract = new ethers.Contract(
              tokenAddress,
              ERC20_ABI,
              provider
            );
            const tokenDecimals = await tokenContract.decimals();
            let i = 0;
            for (const chat of isTokenBurn) {
              const {
                buy_step,
                buy_emoji,
                min_buy,
                image,
                chat_id,
                tg_link,
                twitter,
                website,
                circ_supply,
                total_burned,
                pool,
              } = chat;

              const explorer = explorers[pool.chainId];
              let totalSupply = circ_supply
                ? ethers.utils.parseUnits(circ_supply.toString(), tokenDecimals)
                : await tokenContract.totalSupply();
              //   console.log(totalSupply.toString());
              //   console.log("Amount Burned: ", args.value.toString());
              let remainingSupply = totalSupply.sub(args.value);
              remainingSupply = parseInt(
                ethers.utils
                  .formatUnits(remainingSupply, tokenDecimals)
                  .toString()
              );
              //   console.log("Remaining Supply: ", remainingSupply);
              const amountBurned = parseInt(
                ethers.utils.formatUnits(args.value, tokenDecimals).toString()
              );
              i === 0 &&
                (await buysCollection.updateMany(
                  {
                    "pool.baseToken.address":
                      ethers.utils.getAddress(tokenAddress),
                  },
                  {
                    $set: {
                      circ_supply: remainingSupply,
                    },
                    $inc: {
                      total_burned: amountBurned,
                    },
                  }
                ));
              totalSupply = parseInt(
                ethers.utils.formatUnits(totalSupply, tokenDecimals).toString()
              );
              //   console.log("TSUPPLY->", totalSupply);
              //   console.log("BURNED ->", amountBurned);
              //   console.log("RATIO ->", amountBurned / totalSupply);
              let percentageBurned = (amountBurned / totalSupply) * 100;
              percentageBurned = percentageBurned.toFixed(4);
              let totalBurned = total_burned + amountBurned;
              let percentageTotalBurned = (totalBurned / totalSupply) * 100;
              percentageTotalBurned = percentageTotalBurned.toFixed(4);
              const msg = `
              <b>${amountBurned} ${pool.baseToken.symbol} Burned!</b>\n
              🔥🔥🔥🔥🔥🔥🔥🔥\n
              <b>👌 Amount Burned: </b>${formatNumber(
                amountBurned
              )} (${percentageBurned}%)
              <b>✌️ Total Burned: </b>${formatNumber(
                totalBurned
              )} (${percentageTotalBurned}%)
              <b>👉 Remaining Supply: </b>${formatNumber(remainingSupply)}
              <a href='${explorer}/tx/${tx_hash}'>TX/a> | <a href='https://dexscreener.com/${
                pool.chainId
              }/${pool.pairAddress}'>📊 CHART</a>${
                tg_link ? ` | <a href='${tg_link}'>TG</a>` : ""
              }${twitter ? ` | <a href='${twitter}'>X</a>` : ""}${
                website ? ` | <a href='${website}'>WEBSITE</a>` : ""
              }
              `;

              await sendTelegramMessage(
                dedent(msg),
                image,
                chat_id,
                network,
                true
              );
              i += 1;
            }
          }
        }
      } catch (error) {
        // console.log(error.message);
      }
    }
  );
}

// Example usage

// const providerUrl =
//   "https://open-platform.nodereal.io/014f811f63514485bf519847d0b19465/base";
// ("https://eth-mainnet.nodereal.io/v1/014f811f63514485bf519847d0b19465");
listenForAllERC20Transfers("base");
