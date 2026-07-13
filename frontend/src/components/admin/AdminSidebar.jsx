import {
  FiBarChart2,
  FiFileText,
  FiGrid,
  FiLogOut,
  FiSettings,
  FiUsers
} from "react-icons/fi";

function AdminSidebar({ activeMenu, setActiveMenu, onLogout }) {
  return (
    <aside className="admin-sidebar">
      <div>
        <div className="admin-logo">
          <div className="admin-logo__mark">CG</div>

          <div>
            <h2>Admin</h2>
            <p>Panel</p>
          </div>
        </div>

        <nav className="admin-menu">
          <button
            className={activeMenu === "users" ? "active" : ""}
            onClick={() => setActiveMenu("users")}
          >
            <FiUsers />
            Пользователи
          </button>

          <button
            className={activeMenu === "analytics" ? "active" : ""}
            onClick={() => setActiveMenu("analytics")}
          >
            <FiBarChart2 />
            Аналитика
          </button>

          <button
            className={activeMenu === "leads" ? "active" : ""}
            onClick={() => setActiveMenu("leads")}
          >
            <FiFileText />
            Заявки на сайте
          </button>

          <button
            className={activeMenu === "blocks" ? "active" : ""}
            onClick={() => setActiveMenu("blocks")}
          >
            <FiGrid />
            Блоки
          </button>
        </nav>
      </div>

      <div className="admin-sidebar-bottom">
        <button
          className={activeMenu === "settings" ? "active" : ""}
          onClick={() => setActiveMenu("settings")}
        >
          <FiSettings />
          Настройки
        </button>

        <button className="admin-logout" onClick={onLogout}>
          <FiLogOut />
          Выйти
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;