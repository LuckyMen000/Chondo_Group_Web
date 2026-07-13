import { FiArrowRight, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function SettingsPage() {
  const navigate = useNavigate();

  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2>Настройки</h2>
          <p>Управление общими настройками сайта и админ-панели.</p>
        </div>
      </div>

      <div className="settings-list">
        <button
          className="settings-card-button"
          type="button"
          onClick={() => navigate("/admin/settings/seo")}
        >
          <div className="settings-card-left">
            <div className="settings-card-icon">
              <FiSearch />
            </div>

            <div>
              <h3>SEO</h3>
              <p>
                Title, description, Open Graph, Twitter Card, sitemap, robots и
                Schema JSON-LD.
              </p>
            </div>
          </div>

          <FiArrowRight className="settings-card-arrow" />
        </button>
      </div>
    </section>
  );
}

export default SettingsPage;