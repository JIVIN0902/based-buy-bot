const { DB } = require("./db");
const { getRandomInt } = require("./utils");

const data = {
  text: "👀 Anon Confessions on TG 👀",
  url: "https://t.me/BasedConfessions",
  network: "all",
  days: 100,
};
async function updateAds() {
  try {
    const db = new DB();
    const { adsCollection } = await db.init();
    await adsCollection.deleteMany({});
    const currentDate = new Date();
    const expiry = new Date(
      currentDate.getTime() + data.days * 24 * 60 * 60 * 1000
    ).getTime();

    console.log(expiry);

    await adsCollection.create({
      ...data,
      timestamp: Date.now(),
      expiry: expiry,
    });
    console.log("Ad updated");

    console.log(await adsCollection.find({}));

    // const ads = await adsCollection.find({});
    // console.log(ads);
    // const randomIdx = getRandomInt(0, ads.length - 1);
    // const adToShow = ads[randomIdx];
    // console.log(adToShow);
    // await adsCollection.updateOne(
    //   { url: "https://t.me/DegendexChat" },
    //   {
    //     $set: {
    //       text: data.text,
    //       url: data.url,
    //     },
    //   }
    // );
    // console.log("db updated");
    // await adsCollection.deleteOne({ _id: "6605b7c1265415bfa3787f7c" });
    // console.log("deleted");
  } catch (error) {
    console.log(error);
  }
}

// updateAds();
