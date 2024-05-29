const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");
const Mongo_url = 'mongodb://127.0.0.1:27017/Wanderlust';

async function main() {
    await mongoose.connect(Mongo_url);
};

main().then(() => {
    console.log("Connected to database");
})
    .catch((err) => {
        console.log(err);
    });
const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "664261a326a21e42979c6bde" }));
    await Listing.insertMany(initData.data);
    console.log("Data was initialize");
};
initDB();