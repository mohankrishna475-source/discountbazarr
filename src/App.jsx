import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useMemo } from "react";

import Catalog from "./pages/Catalog";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import DBChatbot from "./chatbot/DBChatbot";

function App() {
  /* 🛒 CART STATE */
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  /* 🔎 SEARCH STATE */
  const [searchTerm, setSearchTerm] = useState("");

  /* ➕ ADD TO CART */
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);

      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.db_price,
          qty: 1,
        },
      ];
    });
  };

  /* ❌ REMOVE FROM CART */
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  /* 💰 TOTAL PRICE */
  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  /* 📲 WHATSAPP BULK ORDER */
  const sendBulkWhatsApp = () => {
    if (cart.length === 0) return;

    const phoneNumber = "918328364086"; // 👉 నీ WhatsApp number

    let message = "🛍️ *DISCOUNT BAZAAR ORDER* 🛍️%0A";
    message += "━━━━━━━━━━━━━━━━━━%0A";
    message += "👋 Hi Discount Bazaar,%0A";
    message += "I want to order:%0A%0A";

    cart.forEach((item) => {
      message += `🔹 *${item.title}*%0A`;
      message += `   Qty: ${item.qty}%0A`;
      message += `   Price: ₹${item.price * item.qty}%0A%0A`;
    });

    message += "━━━━━━━━━━━━━━━━━━%0A";
    message += `💰 *Grand Total: ₹${totalPrice}*%0A`;
    message += "📍 Please share stock details.%0A";
    message += "🙏 Thank you";

    window.open(
      `https://wa.me/${phoneNumber}?text=${message}`,
      "_blank"
    );
  };

  return (
    <BrowserRouter>
      {/* 🔝 NAVBAR */}
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
          <div
            style={cartIconStyle}
            onClick={() => setIsCartOpen(!isCartOpen)}
          >
            🛒 Cart ({cart.length})
          </div>
          <div style={loginStyle}>Login</div>
        </div>
      </div>

      {/* 🛒 CART PANEL */}
      {isCartOpen && (
        <div style={cartPanelStyle}>
          <h3>Your Cart</h3>

          {cart.length === 0 && <p>No items</p>}

          {cart.map((item) => (
            <div key={item.id} style={cartItemStyle}>
              <div>{item.title}</div>
              <div>Qty: {item.qty}</div>
              <div>₹{item.price * item.qty}</div>

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

              <button
                style={whatsappBtnStyle}
                onClick={sendBulkWhatsApp}
              >
                Order All on WhatsApp
              </button>
            </>
          )}
        </div>
      )}

      {/* 📄 ROUTES */}
      <Routes>
        <Route
          path="/"
          element={
            <Catalog
              searchTerm={searchTerm}
              addToCart={addToCart}
            />
          }
        />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
      </Routes>

      {/* 🤖 CHATBOT GLOBAL */}
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
  background: "#0f172a",
  color: "#fff",
};

const logoStyle = {
  fontWeight: "bold",
  fontSize: "18px",
};

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
};

const loginStyle = {
  cursor: "pointer",
};

const cartPanelStyle = {
  position: "fixed",
  top: "60px",
  right: "0",
  width: "300px",
  height: "100%",
  background: "#fff",
  boxShadow: "-2px 0 10px rgba(0,0,0,0.2)",
  padding: "15px",
  overflowY: "auto",
  zIndex: 9999,
};

const cartItemStyle = {
  borderBottom: "1px solid #eee",
  paddingBottom: "8px",
  marginBottom: "8px",
};

const removeBtnStyle = {
  background: "red",
  color: "#fff",
  border: "none",
  padding: "4px 8px",
  cursor: "pointer",
  marginTop: "5px",
};

const whatsappBtnStyle = {
  width: "100%",
  background: "green",
  color: "#fff",
  border: "none",
  padding: "10px",
  marginTop: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};
