const https = require("https");

module.exports = async function (req, res) {

  const query = req.query.query || "nike";
  const apiKey = process.env.SERP_API_KEY;

  const url =
    "https://serpapi.com/search.json?q=" +
    encodeURIComponent(query) +
    "&tbm=isch&api_key=" +
    apiKey;

  https.get(url, (apiRes) => {

    let data = "";

    apiRes.on("data", (chunk) => {
      data += chunk;
    });

    apiRes.on("end", () => {
      const json = JSON.parse(data);
      res.status(200).json(json);
    });

  }).on("error", (err) => {

    res.status(500).json({
      error: "SerpAPI request failed",
      message: err.message
    });

  });

};