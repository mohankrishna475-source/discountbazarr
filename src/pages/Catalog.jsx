import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "../styles/catalog.css";

export default function Catalog() {
  const [tab, setTab] = useState("deals");
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);

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
        <div className="logo">DB</div>
        <div className="official">OFFICIAL</div>
        <div className="insta">@discount_bazarr</div>
      </div>

      {/* 🔹 MAIN CONTENT CENTER */}
      <div className="catalog-container">
        {/* HERO */}
        <div className="hero">
          <h1>Discount Bazarr</h1>
          <p>🤝 Come with Trust</p>
          <p>🛡 Buy with Confidence</p>
          <p>😊 Move with Happiness</p>
        </div>

        {/* TABS */}
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

        {/* SUBCATEGORIES */}
        {tab === "deals" && !activeCategory && (
          <div className="category-grid">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="category-card"
                onClick={() => setActiveCategory(cat.slug)}
              >
                <div className="category-name">{cat.name}</div>
                <div className="stock">Stock Loaded</div>
              </div>
            ))}
          </div>
        )}

        {/* PRODUCTS GRID */}
        {activeCategory && (
          <div className="product-grid">
            {products.map((p) => (
              <div key={p.id} className="product-card">
                <img src={p.image_url || "/no-image.png"} alt={p.title} />

                <h3 className="title">{p.title}</h3>

                <div className="price-box">
                  <span className="mrp">₹{p.mrp}</span>
                  <span className="online">₹{p.fsp}</span>
                  <span className="dbprice">₹{p.db_price}</span>
                </div>

                <div className="discount">{p.fsp_percent}% OFF</div>

                <button
                  className="whatsapp-btn"
                  onClick={() =>
                    window.open(
                      `https://wa.me/918328364086?text=I want ${p.title}`,
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