import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import "../styles/catalog.css";
import SmartCart from "../components/SmartCart";

export default function Catalog({
  addToCart,
  searchTerm,
  cart,
  setCart,
  mode = "home"
}) {

  const navigate = useNavigate();
  const { slug } = useParams();

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [zoomImage, setZoomImage] = useState(null);

  /* VIEW COUNT */
  const increaseViewCount = async (product) => {

    const { data } = await supabase
      .from("catalog_items")
      .select("views_count")
      .eq("id", product.id)
      .single();

    const currentViews = data?.views_count || 0;

    await supabase
      .from("catalog_items")
      .update({ views_count: currentViews + 1 })
      .eq("id", product.id);
  };

  /* ESC CLOSE */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setZoomImage(null);
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  /* SLIDER */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 6 ? 1 : prev + 1));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /* LOAD CATEGORIES */
  useEffect(() => {

    const loadCategories = async () => {

      const { data } = await supabase
        .from("subcategories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      setCategories(data || []);
    };

    loadCategories();

  }, []);

  /* ACTIVE CATEGORY */
  useEffect(() => {

    if (slug) {
      setActiveCategory(slug);
    } else {
      setActiveCategory(null);
    }

  }, [slug]);

  /* CATEGORY PRODUCTS */
  useEffect(() => {

    if (!activeCategory) return;

    const loadProducts = async () => {

      const { data } = await supabase
        .from("catalog_items")
        .select("*")
        .eq("subcategory_slug", activeCategory);

      setProducts(data || []);
    };

    loadProducts();

  }, [activeCategory]);

  /* HOT DEALS LOAD */
  useEffect(() => {

    if (mode !== "hot") return;

    const loadHotDeals = async () => {

      const { data } = await supabase
        .from("catalog_items")
        .select("*")
        .limit(200);

      setProducts(data || []);
    };

    loadHotDeals();

  }, [mode]);

/* DEAL ENGINE */

const usedIds = new Set()

/* BEST DEALS FIRST */

const bestDeals = products
.filter(p => (p.discount_percent || 0) >= 65)
.filter(p=>{
if(usedIds.has(p.id)) return false
usedIds.add(p.id)
return true
})

/* TRENDING */

const trendingDeals = products
.filter(p => (p.views_count || 0) >= 5)
.filter(p=>{
if(usedIds.has(p.id)) return false
usedIds.add(p.id)
return true
})
.slice(0,20)

/* SMART DEAL */

const smartDeals = products
.map(p=>({
...p,
score:(p.views_count||0)+(p.discount_percent||0)
}))
.sort((a,b)=>b.score-a.score)
.filter(p=>{
if(usedIds.has(p.id)) return false
usedIds.add(p.id)
return true
})
.slice(0,20)

/* MANUAL */

const manualDeals = products
.filter(p=>p.is_hot_deal===true)
.filter(p=>{
if(usedIds.has(p.id)) return false
usedIds.add(p.id)
return true
})

  const orderOnWhatsApp = (product) => {

    const message =
      `Hi Discount Bazarr,%0A I want to order:%0A${product.title}%0APrice: ₹${product.db_price}`;

    window.open(`https://wa.me/918328364086?text=${message}`, "_blank");
  };

  return (
    <div className="catalog-page">

      {/* HERO */}
      <div className="hero">

        <h1 className="brand-title">Discount Bazarr</h1>

        <div className="scrolling-brand">
          <div className="brand-slide brand-blue">Discount Bazarr</div>
          <div className="brand-slide brand-yellow">Discount Bazarr</div>
          <div className="brand-slide brand-green">Discount Bazarr</div>
        </div>

      </div>

      {/* HOME */}

   {mode === "home" && !activeCategory && (

<>
  <div className="category-grid">

    {categories.slice(0, 6).map((cat) => (

      <div
        key={cat.id}
        className="category-card"
        onClick={() => navigate(`/category/${cat.slug}`)}
      >

        <div className="cat-icon">

          {cat.name === "Kitchen Appliances" && "🍲"}
          {cat.name === "Premium Footwear" && "👞"}
          {cat.name === "Household" && "🪑"}
          {cat.name === "Fashion Wear" && "👗"}
          {cat.name === "Small Appliances" && "🔋"}
          {cat.name === "Luggage & Bags" && "🧳"}

        </div>

        <div className="category-name">{cat.name}</div>

      </div>

    ))}

  </div>


  {/* 🔥 SLIDER RESTORED */}

  <div style={{ marginTop: "20px" }}>
    <div className="mobile-slider">
      <img
        src={`/slides/slide${currentSlide}.jpg`}
        alt={`slide-${currentSlide}`}
        className="single-slide"
      />
    </div>
  </div>

</>
)}

      {/* HOT DEALS */}

      {mode === "hot" && (

        <>
          <h2 style={{ textAlign: "center" }}>🔥 Hot Deals</h2>

          <div className="product-grid">

            {manualDeals.map((p) => (
              <DealCard key={p.id} p={p} tag="⭐ HOT DEAL" color="#ff4d4f" />
            ))}

            {smartDeals.map((p) => (
              <DealCard key={p.id} p={p} tag="🧠 SMART DEAL" color="#722ed1" />
            ))}

            {trendingDeals.map((p) => (
              <DealCard key={p.id} p={p} tag="🔥 TRENDING" color="#fa8c16" />
            ))}

            {bestDeals.map((p) => (
              <DealCard key={p.id} p={p} tag="💰 BEST DEAL" color="#52c41a" />
            ))}

          </div>
        </>
      )}

      {/* CATEGORY PRODUCTS */}

      {activeCategory && (

        <>
          <button onClick={() => navigate("/")}>← Back</button>

          <div className="product-grid">

            {filteredProducts.map((p) => (

              <div className="product-card" key={p.id}>

                <img
                  src={p.image_url || "/no-image.png"}
                  alt={p.title}
                  onClick={() => {
                    setZoomImage(p.image_url);
                    increaseViewCount(p);
                  }}
                />

                <h3>{p.title}</h3>

                <div className="db-value">₹{p.db_price}</div>

                <button onClick={() => addToCart(p)}>
                  Add to Cart
                </button>

                <button onClick={() => orderOnWhatsApp(p)}>
                  Order on WhatsApp
                </button>

              </div>

            ))}

          </div>
        </>
      )}

      {zoomImage && (

        <div className="image-zoom-overlay" onClick={() => setZoomImage(null)}>

          <img src={zoomImage} alt="zoom" />

        </div>

      )}

      <SmartCart cart={cart} setCart={setCart} />

    </div>
  );
}

/* DEAL CARD */

function DealCard({ p, tag, color }) {

  return (

    <div className="product-card">

      <img
        src={p.image_url || "/no-image.png"}
        alt={p.title}
      />

      <h3>{p.title}</h3>

      <div
        style={{
          background: color,
          padding: "6px",
          borderRadius: "6px",
          color: "white"
        }}
      >
        {tag}
      </div>

      <div className="db-value">₹{p.db_price}</div>

    </div>

  );
}