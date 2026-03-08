export default async function handler(req, res) {

  const { query } = req.query;

  const apiKey = process.env.SERP_API_KEY;

  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=isch&api_key=${apiKey}`;

  try {

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);

  } catch (error) {

    res.status(500).json({ error: "SerpAPI fetch failed" });

  }

}