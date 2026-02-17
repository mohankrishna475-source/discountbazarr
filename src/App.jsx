import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalog from "./pages/Catalog";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import DBChatbot from "./chatbot/DBChatbot";

function App() {
  return (
    <BrowserRouter>
      {/* ROUTES */}
      <Routes>
        {/* Main catalog */}
        <Route path="/" element={<Catalog />} />

        {/* Daily deals redirect route (chatbot links kosam) */}
        <Route path="/daily-deals" element={<Catalog />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>

      {/* Chatbot global (all pages lo kanipistundi) */}
      <DBChatbot />
    </BrowserRouter>
  );
}

export default App;
