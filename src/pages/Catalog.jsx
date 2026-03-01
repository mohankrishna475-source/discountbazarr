import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../supabase";
import "../styles/catalog.css";
import SmartCart from "../components/SmartCart";

export default function Catalog({
  addToCart,
  searchTerm,
  cart,
  setCart
}) {
  const [searchParams] = useSearchParams();

  const [tab, setTab] = useState("deals");
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);

  /* 🔹 READ TAB FROM URL */
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const catParam = searchParams.get("cat");
    const itemParam = searchParams.get("item");

    if (tabParam) setTab(tabParam);
    if (catParam) setActiveCategory(catParam);
    if (itemParam) setSelectedItemId(itemParam);
  }, [searchParams]);

  /* 🔹 CATEGORY ICONS */
  const categoryIcons = {
  "Kitchen Appliances": "🍽️",
  "Premium Footwear": "🥾",
  "Household": "🛋️",
  "Fashion Wear": "🧥",
  "Small Appliances": "🧯",
  "Luggage & Bags": "🎒",
  "Home Tools": "🧰",
  "Sports & Fitness": "🏃",
  "Stationary Items": "🖊️",
};

  /* 🔹 LOAD CATEGORIES */
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

  /* 🔹 LOAD PRODUCTS */
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

  /* 🔹 SCROLL TO SELECTED ITEM */
  useEffect(() => {
    if (!selectedItemId) return;

    const el = document.getElementById(`product-${selectedItemId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.outline = "3px solid #facc15";
      el.style.borderRadius = "12px";
    }
  }, [products, selectedItemId]);

  /* 🔍 SEARCH FILTER */
  const filteredProducts = products.filter((item) => {
    if (!searchTerm) return true;
    return item.title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="catalog-page">
      {/* 🔷 HERO */}
      <div className="hero">
        <h1 className="brand-title">Discount Bazarr</h1>

        <div className="tagline">
          <div className="tag-item">🤝 Come with Trust</div>
          <div className="tag-item">🛡 Buy with Confidence</div>
          <div className="tag-item">😊 Move with Happiness</div>
        </div>

        {/* 🔷 TABS */}
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
      </div>

      {/* 🔷 CATEGORY GRID */}
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

      {/* 🔷 PRODUCTS GRID */}
      {activeCategory && (
        <div className="product-grid">
          {filteredProducts.length === 0 && (
            <div style={{ padding: "20px", fontWeight: "bold" }}>
              No products found
            </div>
          )}

          {filteredProducts.map((p) => (
            <div className="product-card" key={p.id} id={`product-${p.id}`}>
              <img src={p.image_url || "/no-image.png"} alt={p.title} />

              <h3 className="title">{p.title}</h3>

              <div className="price-box">
                {p.mrp && <div className="mrp">₹{p.mrp}</div>}

                {p.online_price && (
                  <div className="online">Online ₹{p.online_price}</div>
                )}

                <div className="db-badge">
                  <div className="db-label">DB PRICE</div>
                  <div className="db-value">₹{p.db_price}</div>
                </div>
              </div>

              {p.online_price && p.db_price && (
                <div className="discount">
                  {Math.round(
                    ((p.online_price - p.db_price) / p.online_price) * 100
                  )}
                  % OFF
                </div>
              )}

              {/* 🔹 WHATSAPP BUTTON */}
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

              {/* 🔹 ADD TO CART */}
              <button
  className="cart-btn"
  onClick={() => {
    // 🔷 SMART CART
    setCart((prev) => [
      ...prev,
      {
        id: p.id,
        name: p.title,
        discount_price: p.db_price,
      },
    ]);

    // 🔷 MY CART (SUPABASE)
    addToCart(p);
  }}
>
  Add to Cart
</button>
            </div>
          ))}
        </div>
      )}

      {/* 🔷 SMART CART */}
      <SmartCart cart={cart} setCart={setCart} />
    </div>
  );
}