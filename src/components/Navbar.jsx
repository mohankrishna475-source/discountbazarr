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
      {/* 🔷 DESKTOP NAVBAR (OLD STYLE WILL SHOW) */}
      <div className="navbar">
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

      {/* 🔷 MOBILE NAVBAR */}
      <div className="mobile-navbar">
        <div className="nav-top">
          <img src="/logo.png" alt="logo" className="nav-logo" />

          <div className="nav-brand">Discount BAZARR</div>

          {user ? (
            <button className="nav-login-btn">Hi</button>
          ) : (
            <button
              className="nav-login-btn"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
          )}
        </div>

        <div className="nav-search-row">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="nav-search"
          />
        </div>

        <div
          className="nav-cart-row"
          onClick={() => navigate("/cart")}
        >
          🛒 My Cart <span className="nav-cart-badge">{cartCount}</span>
        </div>
      </div>
    </>
  );
}