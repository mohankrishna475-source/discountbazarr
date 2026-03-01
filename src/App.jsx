import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import DBChatbot from "./chatbot/DBChatbot";
import PhoneLogin from "./components/PhoneLogin";

/* 🔷 NAVBAR COMPONENT */
function Navbar({
  user,
  setUser,
  cartCount,
  setShowLogin,
  searchTerm,
  setSearchTerm,
}) {
  const navigate = useNavigate();

  return (
    <div style={navStyle}>
      <div style={navLeft}>
        <img src="/logo.png" alt="logo" style={logoImg} />
        <div style={logoText}>Discount BAZARR</div>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        style={searchStyle}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div style={navRight}>
        <div style={cartIconStyle} onClick={() => navigate("/cart")}>
          🛒 My Cart <span style={cartBadge}>{cartCount}</span>
        </div>

        {user ? (
          <button
            style={logoutBtn}
            onClick={() => {
              setUser(null);
              localStorage.removeItem("db_user_phone");
              setCartCount(0);
              setCart([]);
            }}
          >
            Logout
          </button>
        ) : (
          <button style={loginBtn} onClick={() => setShowLogin(true)}>
            Login
          </button>
        )}
      </div>
    </div>
  );
}

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

  /* ➕ ADD TO CART (COUNT FIX HERE) */
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

    // 🔥 THIS LINE FIXES MY CART COUNT
    await fetchCartCount(user.phone);
  };

  return (
    <BrowserRouter>
      <Navbar
        user={user}
        setUser={setUser}
        cartCount={cartCount}
        setShowLogin={setShowLogin}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {showLogin && !user && (
        <div style={loginPopupStyle}>
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

      <DBChatbot />
    </BrowserRouter>
  );
}

export default App;

/* 🎨 STYLES */

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 24px",
  background: "linear-gradient(90deg, #0f172a, #1e3a8a, #06b6d4)",
  color: "#fff",
};

const navLeft = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const logoImg = {
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  background: "#fff",
  padding: "3px",
};

const logoText = {
  fontWeight: "bold",
  fontSize: "18px",
  background: "linear-gradient(90deg, #facc15, #f97316)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const searchStyle = {
  width: "100%",
  maxWidth: "420px",
  padding: "8px 14px",
  borderRadius: "20px",
  border: "none",
  outline: "none",
};

const navRight = {
  display: "flex",
  gap: "15px",
  alignItems: "center",
};

const cartIconStyle = {
  cursor: "pointer",
  fontWeight: "bold",
};

const cartBadge = {
  background: "#facc15",
  color: "#000",
  padding: "3px 8px",
  borderRadius: "50%",
  marginLeft: "6px",
  fontSize: "12px",
};

const loginBtn = {
  background: "#22c55e",
  border: "none",
  padding: "6px 14px",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "bold",
};

const logoutBtn = {
  background: "#ef4444",
  border: "none",
  padding: "6px 14px",
  borderRadius: "20px",
  cursor: "pointer",
  color: "#fff",
};

const loginPopupStyle = {
  position: "fixed",
  top: "80px",
  right: "20px",
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 0 15px rgba(0,0,0,0.3)",
  zIndex: 9999,
};