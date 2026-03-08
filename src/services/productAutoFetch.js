import { supabase } from "../lib/supabaseClient";

export async function autoFetchProducts(limit = 250) {

  const { data: products } = await supabase
    .from("catalog_items")
    .select("*")
    .is("image_url", null)
    .limit(limit);

  if (!products) return;

  for (const product of products) {

    const query = `${product.brand} ${product.title}`;

    try {

      const res = await fetch(
        `/api/serp-fetch?query=${encodeURIComponent(query)}`
      );

      const data = await res.json();

      const images = data.images || [];

      const image1 = images[0] || null;
      const image2 = images[1] || null;
      const image3 = images[2] || null;
      const image4 = images[3] || null;

      const description = `${product.title} by ${product.brand}. High quality product available at DiscountBazarr with best price and trusted delivery.`;

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

    } catch (error) {

      console.error("Error fetching", product.title);

    }

  }

}