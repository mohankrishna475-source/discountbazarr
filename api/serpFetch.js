export default async function handler(req, res) {

  const { query } = req.query;

  const apiKey = process.env.SERP_API_KEY;

  try {

    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_images&q=${query}&api_key=${apiKey}`
    );

    const data = await response.json();

    const images =
      data.images_results?.slice(0, 4).map(img => img.original) || [];

    res.status(200).json({ images });

  } catch (error) {

    res.status(500).json({ error: "SerpAPI fetch failed" });

  }

}