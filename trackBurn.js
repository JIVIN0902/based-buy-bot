const { ethers } = require("ethers");
const { ERC20_ABI } = require("./abis");
const { DB } = require("./db");
const { sendTelegramMessage } = require("./utils");
const dedent = require("dedent");

const iface = new ethers.utils.Interface(ERC20_ABI);
async function listenForAllERC20Transfers(providerUrl, network) {
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);

  const transferTopic = ethers.utils.id("Transfer(address,address,uint256)");
  const db = new DB();
  const { buysCollection, trendingCollection, trendingVolCollection } =
    await db.init();

  provider.on(
    {
      topics: [transferTopic],
    },
    async (log, data) => {
      // console.log(`Transfer event log: `, log);
      try {
        const logs = iface.parseLog(log);
        const args = logs.args;
        if (
          args.to === "0x000000000000000000000000000000000000dEaD" ||
          args.to === "0x0000000000000000000000000000000000000000"
        ) {
          console.log(args.to, args.value.toString());
          const tokenAddress = log.address;
          const isLpBurn = await buysCollection.find({
            "pool.pairAddress": ethers.utils.getAddress(tokenAddress),
          });

          const isTokenBurn = await buysCollection.find({
            "pool.baseToken.address": ethers.utils.getAddress(tokenAddress),
          });
          console.log(isLpBurn, isTokenBurn);
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
            const totalSupply = await tokenContract.totalSupply();
            console.log("Amount Burned: ", args.value.toString());
            let remainingSupply = totalSupply.sub(args.value);
            remainingSupply = parseInt(
              ethers.utils
                .formatUnits(remainingSupply, tokenDecimals)
                .toString()
            );
            console.log("Remaining Supply: ", remainingSupply);
            const amountBurned = parseInt(
              ethers.utils.formatUnits(args.value, tokenDecimals).toString()
            );
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
              } = chat;
              const msg = `
              <b>Tokens Burnt!</b>\n
              <b>Amount Burned: </b>${amountBurned}
              </b>Remaining Supply: </b>${remainingSupply}
              `;
              await sendTelegramMessage(
                dedent(msg),
                image,
                chat_id,
                network,
                true
              );
            }
          }
        }
      } catch (error) {
        console.log("Some error: ", error.message);
      }
    }
  );

  console.log("Listening for all ERC-20 Burn events...");
}

// Example usage

const providerUrl =
  "https://open-platform.nodereal.io/014f811f63514485bf519847d0b19465/base";
// ("https://eth-mainnet.nodereal.io/v1/014f811f63514485bf519847d0b19465");
listenForAllERC20Transfers(providerUrl, "base");
