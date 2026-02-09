import { BrowserRouter, Routes, Route } from "react-router-dom";

import Catalog from "./pages/catalog";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Page */}
        <Route path="/" element={<Catalog />} />

        {/* Admin Pages */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
