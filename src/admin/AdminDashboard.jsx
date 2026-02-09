export default function AdminDashboard() {
  return (
    <div style={{ padding: 20, border: "2px solid green" }}>
      <h2>Admin Dashboard</h2>

      <p>✅ You are logged in as Admin</p>

      <hr />

      <h3>Next Actions (Coming Steps)</h3>
      <ul>
        <li>Upload CSV File</li>
        <li>Update Stock</li>
        <li>Manage Products</li>
      </ul>
    </div>
  );
}
