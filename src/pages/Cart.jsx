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
  const phoneNumber = "918328364086";

  const total = cartItems.reduce(
    (sum, item) => sum + item.db_price * item.qty,
    0
  );

  const message = `
🛒 *DISCOUNT BAZAAR – BULK ORDER*

🤝 Come with Trust | 🛡 Buy with Confidence | 😊 Move with Happiness

Hello 👋
I want to order the following items:

${cartItems
  .map(
    (item, i) => `
${i + 1}. ${item.title}
   Qty: ${item.qty}
   Price: ₹${item.db_price}
   Subtotal: ₹${item.db_price * item.qty}
`
  )
  .join("\n")}

💰 *Total Amount: ₹${total}*

📦 Please confirm availability
🚚 Delivery details will be shared after confirmation

🖼 Product Images:
👉 https://yourdomain.com/cart

🙏 Thank you
– Discount Bazaar
`;

  const url =
    "https://wa.me/" +
    phoneNumber +
    "?text=" +
    encodeURIComponent(message);

  window.open(url, "_blank");
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