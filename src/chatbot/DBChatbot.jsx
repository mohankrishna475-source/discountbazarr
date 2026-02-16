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
    if (step === "results") setStep("category");
    if (step === "custom") setStep("price");
  };

  const goToProduct = (item) => {
   window.location.href =
  `/daily-deals?item=${item.id}&cat=${item.subcategory_slug}`;

  };

  return (
    <>
      {/* Floating Button */}
      <div style={floatingStyle}>
        <div onClick={() => setOpen(!open)} style={circleStyle}>
          DB
        </div>
        <div style={{ fontSize: "12px", fontWeight: "bold" }}>DB Bot</div>
      </div>

      {/* Chat Box */}
      {open && (
        <div style={chatBoxStyle}>
          <div style={headerStyle}>Discount Bazaar Assistant</div>

          <div style={bodyStyle}>
            {/* BACK BUTTON */}
            {step !== "price" && (
              <button onClick={goBack} style={backBtnStyle}>
                ← Back
              </button>
            )}

            {/* STEP 1 – PRICE */}
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

                <button
                  style={btnStyle}
                  onClick={() => setStep("custom")}
                >
                  Custom
                </button>
              </>
            )}

            {/* STEP CUSTOM PRICE */}
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

            {/* STEP 2 – CATEGORY */}
            {step === "category" && (
              <>
                <div style={msgStyle}>📦 Select category</div>

                {categories.map((c, i) => (
                  <button
                    key={i}
                    style={btnStyle}
                    onClick={() =>
                      fetchItems(range.min, range.max, c.slug)
                    }
                  >
                    {c.name}
                  </button>
                ))}
              </>
            )}

            {/* STEP 3 – RESULTS */}
            {step === "results" && (
              <>
                <div style={msgStyle}>🛍️ Items found</div>

                {loading && (
                  <div style={typingStyle}>Typing...</div>
                )}

                {items.map((item, i) => (
                  <div
                    key={i}
                    style={cardStyle}
                    onClick={() => goToProduct(item)}
                  >
                    <img
                      src={item.image_url}
                      alt=""
                      style={imgStyle}
                    />
                    <div>
                      <div style={{ fontWeight: "600" }}>
                        {item.title}
                      </div>
                      <div style={priceStyle}>
                        ₹{item.db_price}
                      </div>
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

/* STYLES */

const floatingStyle = {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  zIndex: 9999,
  textAlign: "center",
};

const circleStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  backgroundColor: "#facc15",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
};

const chatBoxStyle = {
  position: "fixed",
  bottom: "100px",
  right: "20px",
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
