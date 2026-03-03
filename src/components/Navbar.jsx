import { useNavigate } from "react-router-dom";

export default function Navbar({
  user,
  cartCount,
  setShowLogin,
  searchTerm,
  setSearchTerm,
}) {
  const navigate = useNavigate();

  return (
    <>
      {/* ================= DESKTOP NAVBAR (UNCHANGED) ================= */}
      <div className="navbar desktop-only">
        <div className="nav-left">
          <img src="/logo.png" alt="logo" className="db-logo" />
          <div className="nav-title">Discount BAZARR</div>
        </div>

        <input
          type="text"
          placeholder="Search products..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="nav-right">
          <div className="cart-icon" onClick={() => navigate("/cart")}>
            🛒 My Cart <span className="cart-count">{cartCount}</span>
          </div>

          {user ? (
            <button className="logout-btn">Logout</button>
          ) : (
            <button
              className="login-btn"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* ================= MOBILE NAVBAR ================= */}
      <div className="mobile-navbar">
        <div className="mobile-top">
          <div className="mobile-brand">Discount Bazarr</div>

          <div className="mobile-icons">
            <span>🔔</span>
            <span>❤️</span>
            <span onClick={() => navigate("/cart")}>
              🛒 <span className="badge">{cartCount}</span>
            </span>
          </div>
        </div>

        <div className="mobile-search">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}