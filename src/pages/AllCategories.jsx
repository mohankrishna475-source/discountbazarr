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
            onClick={() => navigate(`/category/${cat.slug}`)}   // 🔥 IMPORTANT FIX
          >
            <div className="cat-icon">
              {cat.name === "Kitchen Appliances" && "🍲"}
              {cat.name === "Premium Footwear" && "👞"}
              {cat.name === "Household" && "🪑"}
              {cat.name === "Fashion Wear" && "👗"}
              {cat.name === "Small Appliances" && "🔋"}
              {cat.name === "Luggage & Bags" && "🧳"}
              {cat.name === "Home Tools" && "🔧"}
              {cat.name === "Sports & Fitness" && "🏋️"}
              {cat.name === "Stationary Items" && "📒"}
            </div>

            <div className="category-name">{cat.name}</div>
          </div>
        ))}
      </div>

    </div>
  );
}