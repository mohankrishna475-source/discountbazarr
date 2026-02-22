import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function Cart({ user }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ LOAD CART ITEMS
  const loadCart = async () => {
    if (!user?.phone) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_phone", user.phone);

    if (error) {
      console.log("Cart load error:", error);
      setCartItems([]);
    } else {
      setCartItems(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  // ❌ REMOVE ITEM
  const removeItem = async (id) => {
    await supabase.from("cart_items").delete().eq("id", id);
    loadCart();
  };

  // 💰 TOTAL
  const total = cartItems.reduce(
    (sum, item) => sum + item.db_price * item.qty,
    0
  );

  // 📲 BULK WHATSAPP ORDER
  const handleBulkWhatsApp = () => {
    if (!cartItems.length) return;

    let message = "Discount Bazaar Order\n\n";
    message += "Hello, I want to order the following items:\n\n";

    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.title} – Qty: ${item.qty} – ₹${item.db_price}\n`;
    });

    message += `\nTotal: ₹${total}\n\nPlease confirm availability.`;

    const encodedMessage = encodeURIComponent(message);

    const phoneNumber = "918328364086"; // 👉 నీ WhatsApp number పెట్టు

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
      "_blank"
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* 🔙 BACK BUTTON */}
      <Link to="/" style={backBtn}>
        ← Back to Catalog
      </Link>

      <h2>Your Cart</h2>

      {loading ? (
        <p>Loading...</p>
      ) : cartItems.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.id} style={itemRow}>
              <div>
                <b>{item.title}</b>
                <div>Qty: {item.qty}</div>
                <div>₹{item.db_price}</div>
              </div>

              <button
                style={removeBtn}
                onClick={() => removeItem(item.id)}
              >
                Remove
              </button>
            </div>
          ))}

          <h3>Total: ₹{total}</h3>

          {/* 📲 BULK WHATSAPP BUTTON */}
          <button style={whatsappBtn} onClick={handleBulkWhatsApp}>
            Order All on WhatsApp
          </button>
        </>
      )}
    </div>
  );
}

const backBtn = {
  display: "inline-block",
  marginBottom: "15px",
  padding: "8px 14px",
  background: "#2563eb",
  color: "#fff",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "bold",
};

const itemRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px",
  borderBottom: "1px solid #ddd",
};

const removeBtn = {
  background: "red",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
};

const whatsappBtn = {
  background: "#25D366",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "15px",
};