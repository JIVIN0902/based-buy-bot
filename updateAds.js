const { DB } = require("./db");
const { getRandomInt } = require("./utils");

const data = {
  text: "🔥 Buy Ads 🔥",
  url: "https://t.me/maxxCrypto404",
};
async function updateAds() {
  try {
    const db = new DB();
    const { adsCollection } = await db.init();
    // await adsCollection.create({
    //   ...data,
    //   timestamp: Date.now(),
    // });
    // console.log("Ad updated");

    // console.log(await adsCollection.find({}));

    const ads = await adsCollection.find({});
    const randomIdx = getRandomInt(0, ads.length - 1);
    const adToShow = ads[randomIdx];
    console.log(adToShow);
  } catch (error) {
    console.log(error);
  }
}

updateAds();
