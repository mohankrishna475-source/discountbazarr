import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
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
import AllCategories from "./pages/AllCategories";

/* ✅ NEW PRODUCT PAGE IMPORT */
import ProductPage from "./pages/ProductPage";

/* ✅ AUTO FETCH IMPORT */
import { autoFetchProducts } from "./services/productAutoFetch";

/* 🔷 MOBILE BOTTOM NAV COMPONENT */
function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="mobile-bottom-nav">
      <div
        className={location.pathname === "/" ? "active" : ""}
        onClick={() => navigate("/")}
      >
        🏠
        <span>Home</span>
      </div>

      <div
        className={location.pathname === "/hot-deals" ? "active" : ""}
        onClick={() => navigate("/hot-deals")}
      >
        🔥
        <span>Hot Deals</span>
      </div>

      <div
        className={location.pathname === "/design-lab" ? "active" : ""}
        onClick={() => navigate("/design-lab")}
      >
        🎨
        <span>Design Lab</span>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);

  /* ✅ AUTO FETCH RUN */
  useEffect(() => {
    autoFetchProducts(250); 
  }, []);

  useEffect(() => {
    const savedPhone = localStorage.getItem("db_user_phone");
    if (savedPhone) {
      setUser({ phone: savedPhone });
    }
  }, []);

  const fetchCartCount = async (phone) => {
    if (!phone) return;

    const { count, error } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_phone", phone);

    if (error) {
      console.error("Cart count error:", error);
      return;
    }

    setCartCount(count || 0);
  };

  useEffect(() => {
    if (user?.phone) {
      fetchCartCount(user.phone);
    } else {
      setCartCount(0);
    }
  }, [user]);

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
      <Navbar
        user={user}
        cartCount={cartCount}
        setShowLogin={setShowLogin}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

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

      <Routes>

        {/* 🏠 HOME PAGE */}
        <Route
          path="/"
          element={
            <Catalog
              addToCart={addToCart}
              searchTerm={searchTerm}
              cart={cart}
              setCart={setCart}
              mode="home"
            />
          }
        />

        {/* 🔥 HOT DEALS PAGE */}
        <Route
          path="/hot-deals"
          element={
            <Catalog
              addToCart={addToCart}
              searchTerm={searchTerm}
              cart={cart}
              setCart={setCart}
              mode="hot"
            />
          }
        />

        {/* 🎨 DESIGN LAB PAGE */}
        <Route
          path="/design-lab"
          element={
            <Catalog
              addToCart={addToCart}
              searchTerm={searchTerm}
              cart={cart}
              setCart={setCart}
              mode="design"
            />
          }
        />

        {/* CATEGORY PRODUCTS PAGE */}
        <Route
          path="/category/:slug"
          element={
            <Catalog
              addToCart={addToCart}
              searchTerm={searchTerm}
              cart={cart}
              setCart={setCart}
              mode="home"
            />
          }
        />

        {/* ✅ PRODUCT DETAIL PAGE */}
        <Route
          path="/product/:id"
          element={
            <ProductPage
              addToCart={addToCart}
              user={user}
            />
          }
        />

        <Route path="/cart" element={<Cart user={user} />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/all-categories" element={<AllCategories />} />

      </Routes>

      <MobileBottomNav />
      <DBChatbot />
    </BrowserRouter>
  );
}

export default App;