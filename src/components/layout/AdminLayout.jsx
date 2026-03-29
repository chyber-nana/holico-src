import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const { admin, handleLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const logout = () => {
    handleLogout();
    navigate("/login");
  };

  return (
    <div className="page-wrap">
      <img className="edge-confetti" src="./src/assets/back1.png" alt="" />

      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div>
            <h2 className="admin-logo">HOLICO ADMIN</h2>
            <p className="admin-user">{admin?.username || admin?.email}</p>

            <nav className="admin-nav">
              <Link
                className={isActive("/admin/dashboard") ? "active" : ""}
                to="/admin/dashboard"
              >
                Dashboard
              </Link>

              <Link
                className={isActive("/admin/nominees") ? "active" : ""}
                to="/admin/nominees"
              >
                Nominees
              </Link>
              <Link
                className={isActive("/admin/categories") ? "active" : ""}
                to="/admin/categories"
              >
                Categories
              </Link>
              <Link
                className={isActive("/admin/pending-payments") ? "active" : ""}
                to="/admin/pending-payments"
              >
                Pending Payments
              </Link>
            </nav>
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
