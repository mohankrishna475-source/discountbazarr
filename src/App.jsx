import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import DBChatbot from "./chatbot/DBChatbot";
import PhoneLogin from "./components/PhoneLogin";
import Navbar from "./components/Navbar";
import "./styles/catalog.css";

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔷 GLOBAL SMART CART
  const [cart, setCart] = useState([]);

  /* 🔄 LOAD USER */
  useEffect(() => {
    const savedPhone = localStorage.getItem("db_user_phone");
    if (savedPhone) {
      setUser({ phone: savedPhone });
    }
  }, []);

  /* 📦 FETCH CART COUNT */
  const fetchCartCount = async (phone) => {
    if (!phone) return;

    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_phone", phone);

    setCartCount(count || 0);
  };

  /* 🔄 UPDATE COUNT WHEN USER CHANGES */
  useEffect(() => {
    if (user?.phone) {
      fetchCartCount(user.phone);
    } else {
      setCartCount(0);
    }
  }, [user]);

  /* ➕ ADD TO CART */
  const addToCart = async (product) => {
    if (!user?.phone) {
      setShowLogin(true);
      return;
    }

    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_phone", user.phone)
      .eq("product_id", product.id)
      .single();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ qty: existing.qty + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        user_phone: user.phone,
        product_id: product.id,
        title: product.title,
        db_price: product.db_price,
        qty: 1,
      });
    }

    await fetchCartCount(user.phone);
  };

  return (
    <BrowserRouter>
      {/* 🔷 NAVBAR */}
      <Navbar
        user={user}
        cartCount={cartCount}
        setShowLogin={setShowLogin}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* 🔐 LOGIN POPUP */}
      {showLogin && !user && (
        <div className="login-popup">
          <PhoneLogin
            onClose={() => setShowLogin(false)}
            onLoginSuccess={(phone) => {
              setUser({ phone });
              localStorage.setItem("db_user_phone", phone);
              setShowLogin(false);
              fetchCartCount(phone);
            }}
          />
        </div>
      )}

      {/* 🌐 ROUTES */}
      <Routes>
        <Route
          path="/"
          element={
            <Catalog
              addToCart={addToCart}
              searchTerm={searchTerm}
              cart={cart}
              setCart={setCart}
            />
          }
        />
        <Route path="/cart" element={<Cart user={user} />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>

      {/* 🤖 DB BOT */}
      <DBChatbot />
    </BrowserRouter>
  );
}

export default App;
