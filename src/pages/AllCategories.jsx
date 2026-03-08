import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "../styles/catalog.css";

export default function AllCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

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

  return (
    <div className="catalog-page">
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

      <div className="mobile-back-btn">
        <button onClick={() => navigate("/")}>
          ← Back
        </button>
      </div>

      <div className="mobile-category-header">
        <h2>All Categories</h2>
      </div>

      <div className="category-grid">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="category-card"
            onClick={() => navigate(`/category/${cat.slug}`)}
          >

            {/* 🔥 CATEGORY EMOJI ICONS */}
            <div className="cat-icon">
              {cat.name === "Kitchen Appliances" && "🍲"}
              {cat.name === "Premium Footwear" && "👞"}
              {cat.name === "Household" && "🪑"}
              {cat.name === "Fashion Wear" && "👗"}
              {cat.name === "Small Appliances" && "🔋"}
              {cat.name === "Luggage & Bags" && "🧳"}
              {cat.name === "Home Tools" && "🛠"}
              {cat.name === "Sports & Fitness" && "🏋️"}
              {cat.name === "Stationary Items" && "📚"}
            </div>

            <div className="category-name">{cat.name}</div>

          </div>
        ))}
      </div>

    </div>
  );
}