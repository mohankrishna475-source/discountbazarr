import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function ProductPage({ addToCart }) {

  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);

  /* NEW STATE (SerpAPI) */
  const [autoImages, setAutoImages] = useState([]);
  const [autoDescription, setAutoDescription] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  /* SERP API FETCH */
  const fetchSerpData = async (title) => {

    try {

      const apiKey = import.meta.env.VITE_SERP_API_KEY;

      const url =
        `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(title)}&api_key=${apiKey}`;

      const res = await fetch(url);
      const data = await res.json();

      const item = data.shopping_results?.[0];

      if (item) {

        if (item.thumbnail) {
          setAutoImages([item.thumbnail]);
        }

        if (item.snippet) {
          setAutoDescription(item.snippet);
        }

      }

    } catch (err) {
      console.log("SerpAPI error", err);
    }

  };

  const fetchProduct = async () => {

    const { data } = await supabase
      .from("catalog_items")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {

      setProduct(data);

      await supabase
        .from("catalog_items")
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq("id", id);

      loadRelated(data.subcategory_slug);

      /* CALL SERP API */
      fetchSerpData(data.title);

    }

  };

  const loadRelated = async (slug) => {

    const { data } = await supabase
      .from("catalog_items")
      .select("*")
      .eq("subcategory_slug", slug)
      .neq("id", id)
      .limit(6);

    setRelated(data || []);

  };

  if (!product) return <div style={{ padding: 20 }}>Loading...</div>;

  const images = [
    product.image_url,
    product.image_2,
    product.image_3,
    product.image_4,
    ...autoImages
  ].filter(Boolean);

  const nextImage = () => {
    setImageIndex((imageIndex + 1) % images.length);
  };

  const prevImage = () => {
    setImageIndex((imageIndex - 1 + images.length) % images.length);
  };

  const buyNow = () => {

    const message = `Hello DiscountBazarr

I want to buy this product

Product: ${product.title}
Price: ₹${product.db_price}

Product Link:
https://discountbazarr.com/product/${product.id}`;

    window.open(
      "https://wa.me/918328364086?text=" +
        encodeURIComponent(message),
      "_blank"
    );
  };

  return (
    <div className="product-page">

      {/* BACK BUTTON */}

      <div className="product-back-btn">
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>

      {/* IMAGE SLIDER */}

      <div className="product-images">

        {images.length > 1 && (
          <button className="product-arrow left" onClick={prevImage}>
            ◀
          </button>
        )}

        <img
          src={images[imageIndex]}
          alt={product.title}
          className="product-main-image"
          onClick={() => setZoomImage(images[imageIndex])}
        />

        {images.length > 1 && (
          <button className="product-arrow right" onClick={nextImage}>
            ▶
          </button>
        )}

      </div>

      {/* THUMBNAILS */}

      <div className="product-thumbs">

        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt=""
            onClick={() => setImageIndex(i)}
          />
        ))}

      </div>

      {/* PRODUCT INFO */}

      <div className="product-info">

        <h2>{product.title}</h2>

        <div className="product-brand">
          Brand: {product.brand}
        </div>

        <div className="product-rating">
          ⭐ {product.rating || 4.5} ({product.reviews_count || 0} reviews)
        </div>

        <div className="product-price">

          <span className="product-db-price">
            ₹{product.db_price}
          </span>

          <span className="product-online-price">
            ₹{product.online_price}
          </span>

          <span className="product-discount">
            {product.discount_percent}% OFF
          </span>

        </div>

        <div className="product-buttons">

          <button
            className="add-cart-btn"
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </button>

          <button className="buy-btn" onClick={buyNow}>
            Buy Now
          </button>

        </div>

        {/* DESCRIPTION */}

        <div className="product-description">

          <h3>Description</h3>

          <p>
            {product.description || autoDescription}
          </p>

        </div>

      </div>

      {/* RELATED PRODUCTS */}

      <div style={{ marginTop: 40 }}>

        <h3>Related Products</h3>

        <div className="product-grid">

          {related.map((p) => (

            <div
              key={p.id}
              className="product-card"
              onClick={() => navigate(`/product/${p.id}`)}
            >

              <img
                src={p.image_url}
                alt={p.title}
              />

              <div className="title">{p.title}</div>

              <div className="db-value">₹{p.db_price}</div>

            </div>

          ))}

        </div>

      </div>

      {/* CUSTOMER REVIEWS */}

      <div style={{ marginTop: 40 }}>

        <h3>Customer Reviews</h3>

        <p>⭐ {product.rating || 4.5} average rating</p>

        <p>{product.reviews_count || 0} customer reviews</p>

        <p style={{ color: "#666" }}>
          Customer review system coming soon.
        </p>

      </div>

      {/* IMAGE ZOOM */}

      {zoomImage && (

        <div
          className="image-zoom-overlay"
          onClick={() => setZoomImage(null)}
        >

          <img
            src={zoomImage}
            className="zoomed-image"
            alt=""
          />

        </div>

      )}

    </div>
  );

}

export default ProductPage;