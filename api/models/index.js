const dotenv = require('dotenv');
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = process.env.URL
db.users = require("./userModel.js")(mongoose);
db.items = require("./itemModel.js")(mongoose);

module.exports = db;