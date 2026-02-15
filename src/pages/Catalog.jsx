import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "../styles/catalog.css";

export default function Catalog() {
  const [tab, setTab] = useState("deals");
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);

  // 🔹 CATEGORY ICON MAP
  const categoryIcons = {
    "Kitchen Appliances": "🍳",
    "Premium Footwear": "👟",
    "Household": "🏠",
    "Fashion Wear": "👗",
    "Small Appliances": "🔌",
    "Luggage & Bags": "🧳",
    "Home Tools": "🛠",
    "Sports & Fitness": "🏋️",
    "Stationary Items": "📚",
  };

  // 🔹 LOAD SUBCATEGORIES
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

  // 🔹 LOAD PRODUCTS
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

  return (
    <div className="page-layout">

      {/* 🔹 LEFT SIDEBAR */}
      <div className="sidebar">
        <img
          src="/logo.png"
          alt="Discount Bazarr"
          className="sidebar-logo"
        />
        <div className="official">DB OFFICIAL</div>
        <div className="insta">@discount_bazarr</div>
      </div>

      {/* 🔹 MAIN CONTENT */}
      <div className="catalog-container">

        {/* 🔹 HERO */}
        <div className="hero">
          <h1 className="brand-title">Discount Bazarr</h1>

          <div className="tagline">
            <div className="tag-item">
              <span className="tag-icon">🤝</span>
              Come with Trust
            </div>

            <div className="tag-item">
              <span className="tag-icon">🛡</span>
              Buy with Confidence
            </div>

            <div className="tag-item">
              <span className="tag-icon">😊</span>
              Move with Happiness
            </div>
          </div>
        </div>

        {/* 🔹 TABS */}
        <div className="fancy-tabs">
          <button
            className={tab === "deals" ? "active" : ""}
            onClick={() => {
              setTab("deals");
              setActiveCategory(null);
            }}
          >
            Daily Deals
          </button>

          <button
            className={tab === "hot" ? "active" : ""}
            onClick={() => {
              setTab("hot");
              setActiveCategory(null);
            }}
          >
            Hot Deals
          </button>

          <button
            className={tab === "design" ? "active" : ""}
            onClick={() => setTab("design")}
          >
            Design Lab
          </button>
        </div>

        {/* 🔹 SUBCATEGORIES */}
        {tab === "deals" && !activeCategory && (
          <div className="category-grid">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="category-card"
                onClick={() => setActiveCategory(cat.slug)}
              >
                <div className="cat-icon">
                  {categoryIcons[cat.name] || "🛒"}
                </div>
                <div className="category-name">{cat.name}</div>
                <div className="stock">Stock Loaded</div>
              </div>
            ))}
          </div>
        )}

        {/* 🔹 PRODUCTS GRID */}
        {activeCategory && (
          <div className="product-grid">
            {products.map((p) => (
              <div key={p.id} className="product-card">

                <img
                  src={p.image_url || "/no-image.png"}
                  alt={p.title}
                />

                <h3 className="title">{p.title}</h3>

                <div className="price-box">

                  {/* MRP */}
                  {p.mrp && (
                    <div className="mrp">₹{p.mrp}</div>
                  )}

                  {/* ONLINE PRICE */}
                  {p.online_price && (
                    <div className="online">
                      Online ₹{p.online_price}
                    </div>
                  )}

                  {/* 🔹 DB PRICE BADGE */}
                  <div className="db-badge">
                    <div className="db-label">DB PRICE</div>
                    <div className="db-value">₹{p.db_price}</div>
                  </div>
                </div>

                {/* 🔹 DISCOUNT % (ONLINE → DB) */}
                {p.online_price && p.db_price && (
                  <div className="discount">
                    {Math.round(
                      ((p.online_price - p.db_price) /
                        p.online_price) *
                        100
                    )}
                    % OFF
                  </div>
                )}

                <button
                  className="whatsapp-btn"
                  onClick={() =>
                    window.open(
                      `https://wa.me/918238364086?text=I want ${p.title}`,
                      "_blank"
                    )
                  }
                >
                  Order on WhatsApp
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
