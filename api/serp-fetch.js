module.exports = async function (req, res) {
  try {

    const query = req.query.query || "nike";

    const apiKey = process.env.SERP_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "SERP_API_KEY not found" });
    }

    const url =
      "https://serpapi.com/search.json?q=" +
      encodeURIComponent(query) +
      "&tbm=isch&api_key=" +
      apiKey;

    const response = await fetch(url);

    const data = await response.json();

    return res.status(200).json({
      status: "success",
      test: "function working",
      results: data.images_results?.slice(0,3)
    });

  } catch (err) {
    return res.status(500).json({
      error: "FUNCTION CRASH",
      message: err.message,
      stack: err.stack
    });
  }
};