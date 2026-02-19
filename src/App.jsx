import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Catalog from "./pages/Catalog";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import DBChatbot from "./chatbot/DBChatbot";

function App() {
  /* 🛒 CART STATE (load from localStorage) */
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("db_cart");
    return saved ? JSON.parse(saved) : [];
  });

  /* 🔍 SEARCH STATE */
  const [searchTerm, setSearchTerm] = useState("");

  /* 🛒 CART PANEL TOGGLE */
  const [showCart, setShowCart] = useState(false);

  /* 💾 SAVE CART TO localStorage whenever cart changes */
  useEffect(() => {
    localStorage.setItem("db_cart", JSON.stringify(cart));
  }, [cart]);

  /* ➕ ADD TO CART */
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);

      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });
  };

  /* ❌ REMOVE FROM CART */
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  /* 💰 TOTAL PRICE */
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.db_price * item.qty,
    0
  );

  /* 📲 WHATSAPP BULK MESSAGE */
  const sendWhatsAppOrder = () => {
    if (cart.length === 0) return;

    const phone = "918328364086"; // ⚠️ WhatsApp number with country code

    const itemsText = cart
      .map(
        (item, i) =>
          `${i + 1}. ${item.title} (Qty: ${item.qty}) – ₹${
            item.db_price * item.qty
          }`
      )
      .join("%0A");

    const message =
      `🛍️ *Discount Bazarr Order*%0A%0A` +
      `Hello 👋%0AI want to order the following items:%0A%0A` +
      `${itemsText}%0A%0A` +
      `💰 *Total: ₹${totalPrice}*%0A%0A` +
      `Please confirm availability.`;

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <BrowserRouter>
      {/* 🔹 NAVBAR */}
      <div style={navStyle}>
        <div style={logoStyle}>Discount Bazarr</div>

        <input
          type="text"
          placeholder="Search products..."
          style={searchStyle}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div style={navRight}>
          <div style={cartIconStyle} onClick={() => setShowCart(!showCart)}>
            🛒 Cart ({cart.length})
          </div>

          <div style={loginStyle}>Login</div>
        </div>
      </div>

      {/* 🔹 CART PANEL (ONLY WHEN CLICK CART) */}
      {showCart && (
        <div style={cartPanelStyle}>
          <h3>Your Cart</h3>

          {cart.length === 0 && <p>No items in cart</p>}

          {cart.map((item) => (
            <div key={item.id} style={cartItemStyle}>
              <div>
                <strong>{item.title}</strong>
                <div>Qty: {item.qty}</div>
                <div>₹{item.db_price * item.qty}</div>
              </div>

              <button
                style={removeBtnStyle}
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          ))}

          {cart.length > 0 && (
            <>
              <h4>Total: ₹{totalPrice}</h4>

              <button style={orderBtnStyle} onClick={sendWhatsAppOrder}>
                Order All on WhatsApp
              </button>
            </>
          )}
        </div>
      )}

      {/* 🔹 ROUTES */}
      <Routes>
        <Route
          path="/"
          element={
            <Catalog
              addToCart={addToCart}
              searchTerm={searchTerm}
            />
          }
        />

        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>

      {/* 🔹 CHATBOT GLOBAL */}
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
  padding: "10px 20px",
  background: "#1f2937",
  color: "#fff",
};

const logoStyle = { fontWeight: "bold", fontSize: "18px" };

const searchStyle = {
  width: "40%",
  padding: "6px",
  borderRadius: "6px",
  border: "none",
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

const loginStyle = {
  cursor: "pointer",
};

const cartPanelStyle = {
  position: "fixed",
  right: 0,
  top: "60px",
  width: "320px",
  height: "100%",
  background: "#fff",
  boxShadow: "-2px 0 10px rgba(0,0,0,0.2)",
  padding: "15px",
  overflowY: "auto",
  zIndex: 9999,
};

const cartItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
};

const removeBtnStyle = {
  background: "red",
  color: "#fff",
  border: "none",
  padding: "5px 8px",
  cursor: "pointer",
};

const orderBtnStyle = {
  width: "100%",
  padding: "10px",
  background: "green",
  color: "#fff",
  border: "none",
  marginTop: "10px",
  cursor: "pointer",
};
