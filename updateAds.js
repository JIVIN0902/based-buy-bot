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
    console.log(ads);
    const randomIdx = getRandomInt(0, ads.length - 1);
    const adToShow = ads[randomIdx];
    // console.log(adToShow);
    // await adsCollection.updateOne(
    //   { text: "$ANDY #1 Yellow Mascot on BLAST" },
    //   { $set: { text: "$ANDY #1 🟡 Mascot on BLAST" } }
    // );
    // console.log("db updated");
    // await adsCollection.deleteOne({ _id: "6605b7c1265415bfa3787f7c" });
    // console.log("deleted");
  } catch (error) {
    console.log(error);
  }
}

// updateAds();
