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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 6 ? 1 : prev + 1));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    if (slug) {
      setActiveCategory(slug);
    } else {
      setActiveCategory(null);
    }
  }, [slug]);

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

  const filteredProducts = products.filter((item) => {
    if (!searchTerm) return true;
    return item.title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const orderOnWhatsApp = (product) => {
    const message = `Hi Discount Bazarr,%0A I want to order:%0A${product.title}%0APrice: ₹${product.db_price}`;
    window.open(`https://wa.me/918328364086?text=${message}`, "_blank");
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.find((i) => i.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter((i) => i.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
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

        <div className="mobile-tagline">
          <div className="tag-line-row">
            <span className="tag-blue">• Come with Trust</span>
            <span className="tag-yellow">• Buy with Confidence</span>
          </div>
          <div className="tag-line-row">
            <span className="tag-green">• Move with Happiness</span>
          </div>
        </div>
      </div>

      {/* HOME */}
      {mode === "home" && !activeCategory && (
        <>
          <div className="mobile-category-header">
            <h2>Shop By Categories</h2>
            <span onClick={() => navigate("/all-categories")}>
              See All
            </span>
          </div>

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
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>🔥 Hot Deals</h2>
          <p>Exciting offers coming soon...</p>
        </div>
      )}

      {/* DESIGN LAB */}
      {mode === "design" && (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>🎨 Design Lab</h2>
          <p>Custom design services launching soon...</p>
        </div>
      )}

      {/* PRODUCTS */}
      {activeCategory && (
        <>
          <div className="mobile-back-btn">
            <button onClick={() => navigate("/")}>
              ← Back
            </button>
          </div>

          <div className="product-grid">
            {filteredProducts.map((p) => (
              <div className="product-card" key={p.id}>
                <div className="product-top-icons">
                  <span
                    className={`wish-icon ${
                      wishlist.find((i) => i.id === p.id) ? "active" : ""
                    }`}
                    onClick={() => toggleWishlist(p)}
                  >
                    ♥
                  </span>

                  <span
                    className="mini-cart-icon"
                    onClick={() => addToCart(p)}
                  >
                    🛒
                  </span>
                </div>

                <img
                  src={p.image_url || "/no-image.png"}
                  alt={p.title}
                />

                <h3 className="title">{p.title}</h3>

                <div className="db-badge">
                  <div className="db-label">DB PRICE</div>
                  <div className="db-value">₹{p.db_price}</div>
                </div>

                <button
                  className="cart-btn"
                  onClick={() => addToCart(p)}
                >
                  Add to Cart
                </button>

                <button
                  className="whatsapp-btn"
                  onClick={() => orderOnWhatsApp(p)}
                >
                  Order on WhatsApp
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 🔥 NEW DB FLOATING BUTTON */}
      <div
        className="db-floating-btn"
        onClick={() => navigate("/")}
      >
        DB
      </div>

      <SmartCart cart={cart} setCart={setCart} />
    </div>
  );
}