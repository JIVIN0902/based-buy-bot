const { DB } = require("./db");
const { getRandomInt } = require("./utils");

const data = {
  text: "🔥 Degen Dex 🔥",
  url: "https://t.me",
  network: "degen",
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

    // const ads = await adsCollection.find({});
    // console.log(ads);
    // const randomIdx = getRandomInt(0, ads.length - 1);
    // const adToShow = ads[randomIdx];
    // console.log(adToShow);
    await adsCollection.updateOne(
      { url: "https://t.me" },
      {
        $set: {
          text: "DegenDex - NativeDex On Degen",
          url: "https://t.me/DegendexChat",
        },
      }
    );
    // console.log("db updated");
    // await adsCollection.deleteOne({ _id: "6605b7c1265415bfa3787f7c" });
    // console.log("deleted");
  } catch (error) {
    console.log(error);
  }
}

// updateAds();
