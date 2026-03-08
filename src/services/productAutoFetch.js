import { supabase } from "../lib/supabaseClient";

const SERP_KEY = import.meta.env.VITE_SERP_API_KEY;

export async function autoFetchProducts(limit = 250) {

  const { data: products } = await supabase
    .from("catalog_items")
    .select("*")
    .is("description", null)
    .limit(limit);

  if (!products) return;

  for (const product of products) {

    const query = `${product.brand} ${product.title}`;

    try {

      const res = await fetch(
        `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=isch&api_key=${SERP_KEY}`
      );

      const json = await res.json();

      const images = json.images_results || [];

      const image1 = images[0]?.original || null;
      const image2 = images[1]?.original || null;
      const image3 = images[2]?.original || null;
      const image4 = images[3]?.original || null;

      const description = `${product.title} by ${product.brand}. High quality product available at DiscountBazarr.`;

      await supabase
        .from("catalog_items")
        .update({
          image_url: image1,
          image_2: image2,
          image_3: image3,
          image_4: image4,
          description: description
        })
        .eq("id", product.id);

      console.log("Updated:", product.title);

    } catch (err) {

      console.log("Error fetching", product.title);

    }

  }

}