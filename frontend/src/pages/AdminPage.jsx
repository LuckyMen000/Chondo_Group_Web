import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getMe } from "../api/auth";

import AdminSidebar from "../components/admin/AdminSidebar";

import UsersPage from "./admin/UsersPage";
import AnalyticsPage from "./admin/AnalyticsPage";
import BlocksPage from "./admin/BlocksPage";
import SettingsPage from "./admin/SettingsPage";
import LeadsPage from "./admin/LeadsPage";
import SeoSettingsPage from "./admin/SeoSettingsPage";

function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isSeoSettingsPage = location.pathname === "/admin/settings/seo";

  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState(
    isSeoSettingsPage ? "settings" : "users"
  );
  const [loading, setLoading] = useState(true);

  function logout() {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  }

  function handleMenuChange(menu) {
    setActiveMenu(menu);

    if (location.pathname !== "/admin") {
      navigate("/admin");
    }
  }

  useEffect(() => {
    if (isSeoSettingsPage) {
      setActiveMenu("settings");
    }
  }, [isSeoSettingsPage]);

  useEffect(() => {
    async function loadAdminData() {
      const token = localStorage.getItem("admin_token");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      try {
        const currentUser = await getMe(token);
        setUser(currentUser);
      } catch (error) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar
          activeMenu={activeMenu}
          setActiveMenu={handleMenuChange}
          onLogout={logout}
        />

        <main className="admin-content">
          <p>Загрузка...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={handleMenuChange}
        onLogout={logout}
      />

      <main className="admin-content">
        <header className="admin-topbar">
          <div>
            <h1>Админ-панель</h1>

            {user && (
              <p>
                Пользователь: <b>{user.login}</b> / {user.email}
              </p>
            )}
          </div>
        </header>

        {isSeoSettingsPage ? (
          <SeoSettingsPage />
        ) : (
          <>
            {activeMenu === "users" && <UsersPage />}

            {activeMenu === "analytics" && <AnalyticsPage />}

            {activeMenu === "leads" && <LeadsPage />}

            {activeMenu === "blocks" && <BlocksPage />}

            {activeMenu === "settings" && <SettingsPage />}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminPage;