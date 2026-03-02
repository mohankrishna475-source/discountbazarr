import { useState, useMemo } from "react";

export default function SmartCart({ cart = [], setCart }) {
  const [open, setOpen] = useState(true);

  // ✅ SAFE CART
  const safeCart = Array.isArray(cart) ? cart : [];

  // ✅ TOTAL (memo for performance)
  const total = useMemo(() => {
    return safeCart.reduce(
      (sum, item) => sum + Number(item?.discount_price || 0),
      0
    );
  }, [safeCart]);

  // ❌ REMOVE ITEM
  function removeItem(index) {
    if (!setCart) return;
    const newCart = [...safeCart];
    newCart.splice(index, 1);
    setCart(newCart);
  }

// ✅ CUSTOM WHATSAPP MESSAGE (WITH PRODUCT LINK)
const baseUrl =
  window.location.hostname === "localhost"
    ? "https://discountbazarr.com"
    : window.location.origin;

const message =
  `Hi Discount BAZARR 👋\n` +
  safeCart
    .map(
      (i) =>
        `${i.name} - ₹${i.discount_price}\n${baseUrl}/?item=${i.id}`
    )
    .join("\n") +
  `\n----------------\n` +
  `Total: ₹${total}\n` +
  `Please confirm availability.`;
);

  return (
    <div className="smart-cart-container">
      {/* 🔷 HEADER */}
      <div
        className="cart-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
        }}
      >
        <span>⚡ Smart Cart</span>
        <button
          onClick={() => setOpen(!open)}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          {open ? "−" : "+"}
        </button>
      </div>

      {/* 🔷 COLLAPSE CONTENT */}
      {open && (
        <>
          {safeCart.length === 0 && (
            <p style={{ marginTop: "10px" }}>No items</p>
          )}

          <div className="cart-items" style={{ marginTop: "10px" }}>
            {safeCart.map((item, i) => (
              <div
                key={`${item.id}-${i}`}
                className="cart-item"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                  fontSize: "14px",
                  gap: "6px",
                }}
              >
                <span style={{ flex: 1 }}>{item.name}</span>
                <span>₹{item.discount_price}</span>
                <button
                  onClick={() => removeItem(i)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>

          <h4 style={{ marginTop: "10px" }}>Total: ₹{total}</h4>

          {safeCart.length > 0 && (
            <a
              href={`https://wa.me/918328364086?text=${message}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                marginTop: "10px",
                background: "#25D366",
                color: "#fff",
                padding: "8px",
                borderRadius: "8px",
                textAlign: "center",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              📲 WhatsApp Checkout
            </a>
          )}
        </>
      )}
    </div>
  );
}