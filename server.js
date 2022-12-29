const express = require('express')
const bodyParser = require("body-parser");
const app = express();
var cors = require('cors')
const dotenv = require('dotenv');
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(__dirname + '/api/public'));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to my Tixzar Movie Appication" });
});

const db = require("./api/models");
db.mongoose.set('strictQuery', false);
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });
  


require("./api/routes/userRoute.js")(app);

app.listen(process.env.PORT || 4444, () => {
    console.log(`Server is running on port ${process.env.PORT || 4444}.`);
})
