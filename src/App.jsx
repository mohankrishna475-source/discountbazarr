import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalog from "./pages/Catalog";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import DBChatbot from "./chatbot/DBChatbot";   // ✅ chatbot import

function App() {
  return (
    <BrowserRouter>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>

      {/* ✅ Chatbot global component (all pages lo kanipistundi) */}
      <DBChatbot />

    </BrowserRouter>
  );
}

export default App;
