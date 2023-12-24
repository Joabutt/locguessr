const OpenAI = require("openai");
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const path = require("path");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const FormData = require("form-data");
const admin = require("firebase-admin");
const serviceAccount = require("/path/to/your/serviceaccount/json");
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static("public"));


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.RTDB_URL,
});

var db = admin.database();
var counterRef = db.ref("counter");

// Set Initial Counter Value at start of the day
resetCounterDaily();

function resetCounterDaily() {
  var now = new Date();
  var millisTillNextDay =
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) -
    now;

  if (millisTillNextDay < 0) {
    millisTillNextDay += 86400000; // it's after 00:00 of today, get time till 00:00:00 tomorrow.
  }

  setTimeout(function () {
    counterRef.set(50); // Reset query counter everyday
    resetCounterDaily(); // Call itself again to reset the counter next day
  }, millisTillNextDay);
}
app.listen("5000", () => {
  console.log(`Server running at 5000`);
});

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname) + "/index.html");
});

app.get("/icon", async (req, res) => {
  res.sendFile(path.join(__dirname) + "/icon.svg");
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname) + "/about.html");
});

app.post("/upload", async (req, res) => {
  try {
    const snapshot = await admin.database().ref("/counter").once("value");
    const counter = snapshot.val();
    if (counter <= 0) {
      var now = new Date();
      var millisTillNextDay =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          0,
          0,
          0,
          0
        ) - now;

      // Convert milliseconds to hours, minutes, and seconds
      var hours = Math.floor(millisTillNextDay / (1000 * 60 * 60));
      var minutes = Math.floor(
        (millisTillNextDay % (1000 * 60 * 60)) / (1000 * 60)
      );
      var seconds = Math.floor((millisTillNextDay % (1000 * 60)) / 1000);
      var formattedTime = `${hours.toString().padStart(2, '0')} Hours, ${minutes.toString().padStart(2, '0')} Minutes, ${seconds.toString().padStart(2, '0')} Seconds`;
      return res.status(429).send(`Reached daily limit for image search, resetting in: ${formattedTime}`);
    }

    const { data } = req.files.image;
    const form = new FormData();
    var imageb64 = data.toString("base64");

    form.append("image", imageb64);
    const responsebb = await axios.post(
      "https://api.imgbb.com/1/upload",
      form,
      {
        params: {
          key: process.env.IMGBB_API_KEY,
        },
      }
    );
    const imgurl = responsebb.data.data.url;

    // Move the responsibility of decrementing the counter here right before AI API call.
    // If the Image Upload API or AI API fail for any reason then the counter won't be decremented.
    counterRef.transaction(function (currentCount) {
      return currentCount - 1; // currentCount will never be null as we are checking it at the top.
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a image analysing robot and you will only return your answers with a country or state or location, and nothing else.",
        },
        {
          role: "user",
          content: "Where on earth is this?",
        },
        {
          role: "assistant",
          content: "Texas, United States",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyse the Image. After being extremely thourough in examining everything, then make an educated guess on where in the world the picture would be taken in, even if you are unsure. Only tell me the location of where it is, not anything else. Also add the country's country code at the end too, in brackets and full caps. ",
            },
            {
              type: "image_url",
              image_url: {
                url: imgurl,
              },
            },
          ],
        },
      ],
      max_tokens: 4000,
    });

    res.send(response.choices[0].message.content);
  } catch (error) {
    console.log(error);
    res.status(400).send("Error encountered during image processing.");
  }
});
