import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
}));

app.use(express.json());

/* ================= ENV ================= */
const DEV_MODE = process.env.VITE_DEV_OTP_MODE === "true";
const API_KEY = process.env.FAST2SMS_API_KEY;

/* ================= OTP STORE ================= */
let otpStore = {};

/* OTP EXPIRY → 2 MINUTES */
const OTP_EXPIRY = 2 * 60 * 1000;

/* ================= SEND OTP ================= */
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore[phone] = {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY,
  };

  console.log("OTP for", phone, ":", otp);

  /* DEV MODE → SMS పంపదు → console లో మాత్రమే */
  if (DEV_MODE) {
    return res.json({ success: true, devOtp: otp });
  }

  /* REAL SMS */
  try {
    await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q",
        message: `Your DiscountBazar OTP is ${otp}`,
        language: "english",
        flash: 0,
        numbers: phone,
      }),
    });

    res.json({ success: true });
  } catch (err) {
    console.log("SMS ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* ================= VERIFY OTP ================= */
app.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  const record = otpStore[phone];

  if (!record) {
    return res.status(400).json({ success: false, message: "No OTP found" });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[phone];
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  if (record.otp.toString() === otp.toString()) {
    delete otpStore[phone];
    return res.json({ success: true });
  }

  res.status(400).json({ success: false, message: "Invalid OTP" });
});

/* ================= START SERVER ================= */
app.listen(5000, () => {
  console.log("✅ OTP server running on port 5000");
});