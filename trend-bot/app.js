const TelegramBot = require("node-telegram-bot-api");
const {
  GET_TOKEN_ADDRESS,
  TOKEN_ADDRESS,
  GET_GROUP_LINK,
  GROUP_LINK,
  PLAN,
  TOKEN_DATA,
  NETWORK,
} = require("./state");
const { TRENDING_CHAINS } = require("../config");
const { getTokenDetails } = require("./utils");
const dedent = require("dedent");
const { mainSchema, trendingSchema, trendingVolumeSchema } = require("../db");
const { default: mongoose } = require("mongoose");
const { ethers } = require("ethers");

const token = "6761137970:AAFwdMMo-VUfAXvx8MZ5VUbswr_0LdUOBDk";
const db = mongoose.connection;
mongoose.connect(
  "mongodb+srv://Dynamo:uNPQBc7OlNcaV5Ei@cluster0.wbqvypk.mongodb.net/based-buy-bot?retryWrites=true&w=majority",
  {}
);
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.on("connected", function () {
  console.log("Mongoose connection successfully opened");
});

const buysCollection = db.model("buys", mainSchema);
const trendingCollection = db.model("trends", trendingSchema);
const trendingVolCollection = db.model("trending-volume", trendingVolumeSchema);

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
let messageState = {};

// Listen for any kind of message
bot.on("message", (msg) => {
  try {
    // msg is the received Message from Telegram
    const chatId = msg.chat.id; // The chat id where the message came from
    if (!messageState[chatId]) {
      messageState[chatId] = { currentState: null };
    }
    const currentState = messageState[chatId]?.currentState;

    if (msg.text === "/start") {
      // Send a message to the chat acknowledging receipt of their message
      const reply_markup = {
        inline_keyboard: Object.keys(TRENDING_CHAINS).map((key) => [
          {
            text: TRENDING_CHAINS[key],
            callback_data: key,
          },
        ]),
      };

      bot.sendMessage(chatId, "Choose your chain below: ", { reply_markup });
    } else if (currentState === GET_TOKEN_ADDRESS) {
      messageState[chatId][TOKEN_ADDRESS] = msg.text;
      messageState[chatId].currentState = GET_GROUP_LINK;
      bot.sendMessage(chatId, "Enter group/portal link: ", {
        reply_markup: { force_reply: true },
      });
    } else if (currentState === GET_GROUP_LINK) {
      messageState[chatId][GROUP_LINK] = msg.text;

      const reply_markup = {
        inline_keyboard: [
          [{ text: "🔴 8 hrs 🔴", callback_data: "8_hrs" }],
          [{ text: "🔴 24 hrs 🔴", callback_data: "24_hrs" }],
          [{ text: "🔴 7 days 🔴", callback_data: "168_hrs" }],
          [{ text: "✅ Confirm ✅", callback_data: "confirm_hrs" }],
        ],
      };
      bot.sendMessage(
        chatId,
        "ℹ️ Select open slot or click to see the nearest potential availability time: ",
        {
          reply_markup,
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
});

bot.on("callback_query", async (callbackQuery) => {
  try {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    if (!messageState[chatId]) {
      messageState[chatId] = { currentState: null };
    }
    const currentState = messageState[chatId]?.currentState;

    const networks = Object.keys(TRENDING_CHAINS);
    if (networks.includes(action)) {
      console.log(action);
      messageState[chatId].currentState = GET_TOKEN_ADDRESS;
      messageState[chatId][NETWORK] = action;

      await bot.sendMessage(chatId, "Enter token address: ", {
        reply_markup: { force_reply: true },
      });
    } else if (["8_hrs", "24_hrs", "168_hrs"].includes(action)) {
      let inline_keyboard = msg.reply_markup.inline_keyboard;
      let hrs = action.split("_")[0];
      hrs = parseInt(hrs);
      const prevSelected = messageState[chatId][PLAN];
      const idx = inline_keyboard.findIndex(
        (item) => item[0].callback_data === action
      );
      const prevIdx = inline_keyboard.findIndex(
        (item) => item[0].callback_data === `${prevSelected}_hrs`
      );

      if (prevIdx >= 0) {
        let text = inline_keyboard[prevIdx][0].text;
        inline_keyboard[prevIdx][0] = {
          text: text.includes("🔴")
            ? text.replace(/🔴/g, "🟢")
            : text.replace(/🟢/g, "🔴"),
          callback_data: `${prevSelected}_hrs`,
        };
      }

      let text = inline_keyboard[idx][0].text;
      inline_keyboard[idx][0] = {
        text: text.includes("🔴")
          ? text.replace(/🔴/g, "🟢")
          : text.replace(/🟢/g, "🔴"),
        callback_data: action,
      };
      // console.log(idx, hrs);
      messageState[chatId][PLAN] = hrs;
      await bot.editMessageReplyMarkup(
        { inline_keyboard },
        { message_id: msg.message_id, chat_id: chatId }
      );
    } else if (action === "confirm_hrs") {
      const address = messageState[chatId][TOKEN_ADDRESS];
      const hrs_tier = messageState[chatId][PLAN];
      const tg_link = messageState[chatId][GROUP_LINK];
      const token_data = await getTokenDetails(address);
      const liquidity = token_data.liquidity.usd;
      console.log("LIQUIDITY ->", liquidity);
      if (liquidity < 1000) {
        await bot.sendMessage(
          chatId,
          "<b>❌ This token has very little liquidity. Pls Ensure you have at least 1000$ in liquidity to be eligible for trending</b>",
          {
            parse_mode: "HTML",
          }
        );
        return;
      }
      messageState[chatId][TOKEN_DATA] = token_data;
      const symbol = token_data.baseToken.symbol;
      const reply_markup = {
        inline_keyboard: [
          [{ text: "✅ Confirm Booking ✅", callback_data: "confirm_booking" }],
          [{ text: "🔁 Start Over 🔁", callback_data: "start_over" }],
        ],
      };
      const msg = `
      <b>BOOKING DETAILS</b>\n
      <b>Token Address: </b><code>${address}</code>
      <b>Group/Portal Link: </b>${tg_link}
      <b>Symbol </b>${symbol}
      <b>Slot Time: </b>${hrs_tier}hrs
      `;
      await bot.sendMessage(chatId, dedent(msg), {
        reply_markup,
        parse_mode: "HTML",
      });
    } else if (action === "confirm_booking") {
      let address = messageState[chatId][TOKEN_ADDRESS];
      const hrs_tier = messageState[chatId][PLAN];
      const tg_link = messageState[chatId][GROUP_LINK];
      const token_data = messageState[chatId][TOKEN_DATA];
      const network = messageState[chatId][NETWORK];
      const symbol = token_data.baseToken.symbol;
      address = ethers.utils.getAddress(address);
      const data = {
        address,
        hrs_tier,
        tg_link,
        symbol,
        timestamp: Date.now(),
        network,
      };
      const existingRanks = await trendingCollection.countDocuments({
        network,
      });
      const trendingExists = await trendingCollection.findOne({ address });
      if (trendingExists) {
        await bot.sendMessage(
          chatId,
          "<b>❌ Trending entry already exists for this token</b>",
          {
            parse_mode: "HTML",
          }
        );
        return;
      }
      await trendingCollection.create({ ...data, rank: existingRanks + 1 });
      const msg = `
      🎉 <b>BOOKING CONFIRMED</b>🎉
      <b><i>Thank you for booking trending with @OrangeBuyBot</i></b>\n\n
      <b>BOOKING DETAILS</b>\n
      <b>Token Address: </b>${address}
      <b>Group/Portal Link: </b>${tg_link}
      <b>Symbol </b>${symbol}
      <b>Slot Time: </b>${hrs_tier}hrs
      `;
      await bot.sendMessage(chatId, dedent(msg), {
        parse_mode: "HTML",
      });
    } else if (action === "start_over") {
      // Send a message to the chat acknowledging receipt of their message

      messageState[chatId] = { currentState: null };
      const reply_markup = {
        inline_keyboard: Object.keys(TRENDING_CHAINS).map((key) => [
          {
            text: TRENDING_CHAINS[key],
            callback_data: key,
          },
        ]),
      };

      bot.sendMessage(chatId, "Choose your chain below: ", { reply_markup });
    }
  } catch (error) {
    console.log(error);
  }
});
