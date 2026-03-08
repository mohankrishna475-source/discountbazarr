module.exports = async function (req, res) {

  try {

    const query = req.query.query;

    const apiKey = process.env.SERP_API_KEY;

    const url =
      "https://serpapi.com/search.json?q=" +
      encodeURIComponent(query) +
      "&tbm=isch&api_key=" +
      apiKey;

    const response = await fetch(url);

    const data = await response.json();

    res.status(200).json(data);

  } catch (err) {

    res.status(500).json({
      error: "SERVER ERROR",
      message: err.message
    });

  }

};