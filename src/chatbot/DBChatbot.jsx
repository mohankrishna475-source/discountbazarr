import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const priceRanges = [
  { label: "₹0 – ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1000", min: 500, max: 1000 },
  { label: "₹1000 – ₹1500", min: 1000, max: 1500 },
  { label: "₹1500 – ₹2000", min: 1500, max: 2000 },
];

const categories = [
  { name: "Footwear", slug: "premium-footwear" },
  { name: "Kitchen", slug: "kitchen-appliances" },
  { name: "Home", slug: "household" },
  { name: "Appliances", slug: "small-appliances" },
];

export default function DBChatbot() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("price");
  const [range, setRange] = useState(null);
  const [customPrice, setCustomPrice] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async (min, max, slug) => {
    setLoading(true);

    let query = supabase
      .from("catalog_items")
      .select("id, title, db_price, image_url, subcategory_slug")
      .gte("db_price", min)
      .lte("db_price", max)
      .limit(8);

    if (slug) query = query.eq("subcategory_slug", slug);

    const { data } = await query;

    setItems(data || []);
    setLoading(false);
    setStep("results");
  };

  const goBack = () => {
    if (step === "category") setStep("price");
    else if (step === "results") setStep("category");
    else if (step === "custom") setStep("price");
  };

  const goToProduct = (item) => {
    setOpen(false);
    window.location.assign(
      `/?tab=deals&cat=${item.subcategory_slug}&item=${item.id}`
    );
  };

  return (
    <>
      {/* 🔥 TOP RIGHT FLOATING BUTTON */}
      <div style={topButtonStyle} onClick={() => setOpen(!open)}>
        DB
      </div>

      {/* 🔥 CHAT POPUP */}
      {open && (
        <div style={chatBoxStyle}>
          <div style={headerStyle}>
            Discount BAZARR Assistant
            <span
              style={closeStyle}
              onClick={() => setOpen(false)}
            >
              ✕
            </span>
          </div>

          <div style={bodyStyle}>
            {step !== "price" && (
              <button onClick={goBack} style={backBtnStyle}>
                ← Back
              </button>
            )}

            {step === "price" && (
              <>
                <div style={msgStyle}>👋 Select your price range</div>

                {priceRanges.map((r, i) => (
                  <button
                    key={i}
                    style={btnStyle}
                    onClick={() => {
                      setRange(r);
                      setStep("category");
                    }}
                  >
                    {r.label}
                  </button>
                ))}

                <button style={btnStyle} onClick={() => setStep("custom")}>
                  Custom
                </button>
              </>
            )}

            {step === "custom" && (
              <>
                <div style={msgStyle}>Enter max price</div>

                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter amount"
                />

                <button
                  style={btnStyle}
                  onClick={() => {
                    setRange({ min: 0, max: Number(customPrice) });
                    setStep("category");
                  }}
                >
                  Apply
                </button>
              </>
            )}

            {step === "category" && (
              <>
                <div style={msgStyle}>📦 Select category</div>

                {categories.map((c, i) => (
                  <button
                    key={i}
                    style={btnStyle}
                    onClick={() => fetchItems(range.min, range.max, c.slug)}
                  >
                    {c.name}
                  </button>
                ))}
              </>
            )}

            {step === "results" && (
              <>
                <div style={msgStyle}>🛍️ Items found</div>

                {loading && <div style={typingStyle}>Loading...</div>}

                {items.map((item) => (
                  <div
                    key={item.id}
                    style={cardStyle}
                    onClick={() => goToProduct(item)}
                  >
                    <img src={item.image_url} alt="" style={imgStyle} />
                    <div>
                      <div style={{ fontWeight: "600" }}>{item.title}</div>
                      <div style={priceStyle}>₹{item.db_price}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* 🔥 TOP RIGHT BUTTON */
const topButtonStyle = {
  position: "fixed",
  top: "90px",
  right: "16px",
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  backgroundColor: "#facc15",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  zIndex: 9999,
};

/* CHAT BOX */
const chatBoxStyle = {
  position: "fixed",
  top: "150px",
  right: "16px",
  width: "280px",
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
  overflow: "hidden",
  zIndex: 9999,
};

const headerStyle = {
  backgroundColor: "#facc15",
  padding: "10px",
  fontWeight: "bold",
  display: "flex",
  justifyContent: "space-between",
};

const closeStyle = {
  cursor: "pointer",
};

const bodyStyle = {
  padding: "10px",
  maxHeight: "320px",
  overflowY: "auto",
  fontSize: "13px",
  background: "#f9f9f9",
};

const msgStyle = {
  background: "#fff",
  padding: "8px",
  borderRadius: "8px",
  marginBottom: "8px",
  border: "1px solid #eee",
};

const btnStyle = {
  width: "100%",
  padding: "8px",
  marginBottom: "6px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  marginBottom: "6px",
  borderRadius: "8px",
  border: "1px solid #ddd",
};

const cardStyle = {
  display: "flex",
  gap: "8px",
  padding: "8px",
  borderRadius: "8px",
  border: "1px solid #eee",
  marginBottom: "6px",
  cursor: "pointer",
  background: "#fff",
};

const imgStyle = {
  width: "40px",
  height: "40px",
  objectFit: "cover",
  borderRadius: "6px",
};

const priceStyle = {
  color: "green",
  fontWeight: "bold",
};

const backBtnStyle = {
  marginBottom: "8px",
  border: "none",
  background: "none",
  cursor: "pointer",
  fontWeight: "bold",
};

const typingStyle = {
  fontStyle: "italic",
  color: "gray",
};