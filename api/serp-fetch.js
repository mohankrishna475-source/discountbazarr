const axios = require("axios");

module.exports = async function (req, res) {

  try {

    const query = req.query.query || "nike";
    const apiKey = process.env.SERP_API_KEY;

    const url =
      "https://serpapi.com/search.json?q=" +
      encodeURIComponent(query) +
      "&tbm=isch&api_key=" +
      apiKey;

    const response = await axios.get(url);

    return res.status(200).json(response.data);

  } catch (error) {

    return res.status(500).json({
      error: "SerpAPI fetch failed",
      message: error.message
    });

  }

};