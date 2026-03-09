import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
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
const [currentSlide, setCurrentSlide] = useState(1);
const [wishlist, setWishlist] = useState([]);

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

/* NEW FUNCTION FOR CART COUNT */

const updateCartCount = async (product) => {


const { data } = await supabase
  .from("catalog_items")
  .select("cart_count")
  .eq("id", product.id)
  .single();

const current = data?.cart_count || 0;

await supabase
  .from("catalog_items")
  .update({ cart_count: current + 1 })
  .eq("id", product.id);


};

/* WISHLIST */

const toggleWishlist = async (product) => {

  const exists = wishlist.includes(product.id);

  if (exists) {

    await supabase
      .from("wishlist")
      .delete()
      .eq("product_id", product.id);

    await supabase
      .from("catalog_items")
      .update({
        wishlist_count: Math.max((product.wishlist_count || 1) - 1, 0)
      })
      .eq("id", product.id);

    setWishlist(wishlist.filter(id => id !== product.id));

  } else {

    await supabase
      .from("wishlist")
      .insert([{ product_id: product.id }]);

    await supabase
      .from("catalog_items")
      .update({
        wishlist_count: (product.wishlist_count || 0) + 1
      })
      .eq("id", product.id);

    setWishlist([...wishlist, product.id]);

  }

};

/* SLIDER */

useEffect(() => {

const interval = setInterval(() => {
  setCurrentSlide((prev) => (prev === 12 ? 1 : prev + 1));
}, 4000);

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

/* LOAD WISHLIST */

useEffect(() => {

const loadWishlist = async () => {

  const { data } = await supabase
    .from("wishlist")
    .select("product_id");

  if (data) {
    setWishlist(data.map(i => i.product_id));
  }

};

loadWishlist();


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

/* HOT DEALS */

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

const filteredProducts = products.filter((item) => {
if (!searchTerm) return true;
return item.title?.toLowerCase().includes(searchTerm.toLowerCase());
});

const orderOnWhatsApp = (product) => {

  const message =
    `Hi Discount Bazarr,%0A I want to order:%0A${product.title}%0APrice: ₹${product.db_price}`;

  window.open(`https://wa.me/918328364086?text=${message}`, "_blank");

};

const calculateSave = (p) => {
if (!p.online_price || !p.db_price) return 0;
return p.online_price - p.db_price;
};

return ( <div className="catalog-page">


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

  {/* BACK BUTTON */}

  {activeCategory && (
    <div className="back-button" onClick={() => navigate(-1)}>
      ⬅ Back
    </div>
  )}

  {/* BREADCRUMB */}

  {activeCategory && (

    <div className="breadcrumb">

      <span
        className="crumb-link"
        onClick={() => navigate("/")}
      >
        Home
      </span>

      <span className="crumb-sep">›</span>

      <span className="crumb-current">
        {activeCategory.replace("-", " ")}
      </span>

    </div>

  )}

  {/* HOME PAGE */}

  {mode === "home" && !activeCategory && (

    <>

      <div className="mobile-category-header">

        <h2>Shop by Categories</h2>

        <span
          style={{ color: "red", cursor: "pointer", fontWeight: "600" }}
          onClick={() => navigate("/all-categories")}
        >
          See All →
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

      {/* SLIDER */}

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

  {/* CATEGORY PRODUCTS */}

  {activeCategory && (

    <div className="product-grid">

      {filteredProducts.map((p) => {

        const save = calculateSave(p);

        return (

          <div className="product-card" key={p.id}>

            <div style={{ position: "relative" }}>

              <div
                className="wishlist-icon"
                onClick={() => toggleWishlist(p)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  cursor: "pointer",
                  color: wishlist.includes(p.id) ? "red" : "#bbb"
                }}
              >
                <FaHeart />
              </div>

              {p.discount_percent > 0 && (
                <div className="discount-tag">
                  {p.discount_percent}% OFF
                </div>
              )}

              <img
                src={p.image_url || "/no-image.png"}
                alt={p.title}
                onClick={() => {
                  increaseViewCount(p);
                  navigate(`/product/${p.id}`);
                }}
              />

            </div>

            <h3>{p.title}</h3>

            <div style={{ textDecoration: "line-through", color: "#999" }}>
              ₹{p.online_price}
            </div>

            <div style={{ color: "#16a34a", fontWeight: "bold" }}>
              ₹{p.db_price}
            </div>

            <div style={{ fontSize: "12px", color: "#2563eb" }}>
              You Save ₹{save}
            </div>

            <div style={{ fontSize: "11px", color: "#777" }}>
              👁 {p.views_count || 0} views
            </div>

            <button onClick={() => {
              addToCart(p);
              updateCartCount(p);
            }}>
              Add to Cart
            </button>

            <button onClick={() => orderOnWhatsApp(p)}>
              Order on WhatsApp
            </button>

          </div>

        );

      })}

    </div>

  )}

  <SmartCart cart={cart} setCart={setCart} />

</div>

);

}
