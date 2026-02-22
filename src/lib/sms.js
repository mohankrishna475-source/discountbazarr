export const sendOTP = async (phone) => {
  try {
    const res = await fetch("http://localhost:5000/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    return await res.json();
  } catch (err) {
    console.log("OTP SEND ERROR:", err);
    return { success: false };
  }
};

export const verifyOTP = async (phone, otp) => {
  try {
    const res = await fetch("http://localhost:5000/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, otp }),
    });

    return await res.json();
  } catch (err) {
    return { success: false };
  }
};