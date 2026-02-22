import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import "../styles/login.css";

const API = "http://localhost:5000";

export default function PhoneLogin({ onLoginSuccess, onClose }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ⏱ RESEND TIMER */
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* 🔐 DIRECT LOGIN (NO OTP – TEMP MODE) */
  const directLogin = async () => {
    if (!phone) {
      alert("Enter phone number");
      return;
    }

    /* 🔥 SAVE USER IN SUPABASE */
    const { error } = await supabase.from("users").upsert(
      [{ phone }],
      { onConflict: ["phone"] }
    );

    if (error) {
      console.log("User insert error:", error);
    }

    /* 🔐 SAVE IN LOCAL STORAGE */
    localStorage.setItem("db_user_phone", phone);

    onLoginSuccess({ phone });

    if (onClose) onClose(); // ✅ close popup
  };

  /* 📩 SEND OTP */
  const sendOtp = async () => {
    if (!phone) {
      alert("Enter phone number");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSent(true);
        setTimer(60);

        if (data.devOtp) {
          console.log("DEV OTP:", data.devOtp);
          alert(`DEV OTP: ${data.devOtp}`);
        }
      } else {
        alert("OTP send failed");
      }
    } catch (err) {
      setLoading(false);
      alert("Server not running on port 5000");
    }
  };

  /* ✅ VERIFY OTP */
  const verifyOtp = async () => {
    if (!otp) {
      alert("Enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        const { error } = await supabase.from("users").upsert(
          [{ phone }],
          { onConflict: ["phone"] }
        );

        if (error) {
          console.log("User insert error:", error);
        }

        localStorage.setItem("db_user_phone", phone);

        onLoginSuccess({ phone });

        if (onClose) onClose(); // ✅ close popup
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (err) {
      setLoading(false);
      alert("Server error");
    }
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-popup" onClick={(e) => e.stopPropagation()}>
        <h3>Login with Phone</h3>

        <input
          type="text"
          placeholder="Enter phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* 🔥 TEMP DIRECT LOGIN BUTTON */}
        <button onClick={directLogin}>
          Login (No OTP)
        </button>

        <hr />

        {!sent && (
          <button onClick={sendOtp} disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        )}

        {sent && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button onClick={verifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>

            {timer > 0 ? (
              <p>Resend OTP in {timer}s</p>
            ) : (
              <button onClick={sendOtp}>Resend OTP</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}