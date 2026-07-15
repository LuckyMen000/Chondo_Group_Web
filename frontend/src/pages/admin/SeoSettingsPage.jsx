import { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiCheckCircle,
  FiCode,
  FiGlobe,
  FiPlus,
  FiSave,
  FiSearch,
  FiShare2,
  FiTrash2,
  FiXCircle
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import {
  createSeoPage,
  deleteSeoPage,
  getSeoCheck,
  getSeoGlobalSettings,
  getSeoPages,
  updateSeoGlobalSettings,
  updateSeoPage
} from "../../api/seo";

const emptyPageForm = {
  page_name: "",
  path: "/",
  h1: "",
  title: "",
  description: "",
  focus_keyword: "",
  keywords: "",
  canonical_url: "",
  robots: "index, follow",

  og_title: "",
  og_description: "",
  og_image: "",
  og_type: "website",

  twitter_card: "summary_large_image",
  twitter_title: "",
  twitter_description: "",
  twitter_image: "",

  sitemap_enabled: true,
  sitemap_priority: 0.8,
  sitemap_changefreq: "weekly",

  schema_enabled: true,
  schema_type: "Organization",
  custom_schema_json: ""
};

const emptyGlobalForm = {
  site_url: "https://chondo.kz",
  default_site_name: "Chondo Group",
  default_og_image: "",
  robots_txt: "User-agent: *\nAllow: /\n\nSitemap: https://chondo.kz/sitemap.xml",

  organization_name: "Chondo Group",
  organization_logo: "",
  organization_phone: "",
  organization_email: "admin@chondo.kz",
  organization_address: "",
  organization_city: "",
  organization_country: "Kazakhstan",
  social_links: ""
};

const tabs = [
  {
    id: "main",
    title: "Основное",
    icon: <FiSearch />
  },
  {
    id: "social",
    title: "Соцсети",
    icon: <FiShare2 />
  },
  {
    id: "robots",
    title: "Robots / Sitemap",
    icon: <FiGlobe />
  },
  {
    id: "schema",
    title: "Schema",
    icon: <FiCode />
  },
  {
    id: "check",
    title: "Проверка",
    icon: <FiCheckCircle />
  }
];

function getLengthClass(length, min, max) {
  if (length === 0) {
    return "bad";
  }

  if (length < min || length > max) {
    return "warning";
  }

  return "good";
}

function normalizePageForm(page) {
  return {
    ...emptyPageForm,
    ...page,
    sitemap_enabled: Boolean(page?.sitemap_enabled),
    schema_enabled: Boolean(page?.schema_enabled)
  };
}

function normalizeGlobalForm(globalSettings) {
  return {
    ...emptyGlobalForm,
    ...globalSettings
  };
}

function SeoSettingsPage() {
  const navigate = useNavigate();

  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState("");

  const [form, setForm] = useState(emptyPageForm);
  const [globalForm, setGlobalForm] = useState(emptyGlobalForm);

  const [activeTab, setActiveTab] = useState("main");
  const [seoCheck, setSeoCheck] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: ""
  });

  const selectedPage = useMemo(() => {
    return pages.find((page) => page.id === Number(selectedPageId));
  }, [pages, selectedPageId]);

  useEffect(() => {
    async function loadData() {
      try {
        const [pagesData, globalData] = await Promise.all([
          getSeoPages(),
          getSeoGlobalSettings()
        ]);

        setPages(pagesData);
        setGlobalForm(normalizeGlobalForm(globalData));

        if (pagesData.length > 0) {
          setSelectedPageId(pagesData[0].id);
          setForm(normalizePageForm(pagesData[0]));
        }
      } catch (error) {
        setMessage({
          type: "error",
          text: error.message
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadCheck() {
      if (!selectedPageId) {
        setSeoCheck(null);
        return;
      }

      try {
        const data = await getSeoCheck(selectedPageId);
        setSeoCheck(data);
      } catch (error) {
        setSeoCheck(null);
      }
    }

    loadCheck();
  }, [selectedPageId]);

  function handleSelectPage(event) {
    const pageId = Number(event.target.value);
    const page = pages.find((item) => item.id === pageId);

    setSelectedPageId(pageId);

    if (page) {
      setForm(normalizePageForm(page));
    }

    setMessage({ type: "", text: "" });
  }

  function handlePageChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function handleGlobalChange(event) {
    const { name, value } = event.target;

    setGlobalForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleCreatePage() {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const createdPage = await createSeoPage({
        page_name: "Новая страница",
        path: `/new-page-${Date.now()}`,
        h1: "Новая страница",
        title: "Новая страница",
        description: "",
        robots: "index, follow",
        sitemap_enabled: true,
        sitemap_priority: 0.8,
        sitemap_changefreq: "weekly",
        schema_enabled: true,
        schema_type: "Organization"
      });

      setPages((prev) => [...prev, createdPage]);
      setSelectedPageId(createdPage.id);
      setForm(normalizePageForm(createdPage));
      setActiveTab("main");

      setMessage({
        type: "success",
        text: "SEO-страница создана"
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePage() {
    if (!selectedPageId) {
      return;
    }

    const confirmed = window.confirm("Удалить SEO-настройки этой страницы?");

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await deleteSeoPage(selectedPageId);

      const nextPages = pages.filter(
        (page) => page.id !== Number(selectedPageId)
      );

      setPages(nextPages);

      if (nextPages.length > 0) {
        setSelectedPageId(nextPages[0].id);
        setForm(normalizePageForm(nextPages[0]));
      } else {
        setSelectedPageId("");
        setForm(emptyPageForm);
      }

      setMessage({
        type: "success",
        text: "SEO-страница удалена"
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePage(event) {
    event.preventDefault();

    if (!selectedPageId) {
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const updatedPage = await updateSeoPage(selectedPageId, {
        ...form,
        sitemap_priority: Number(form.sitemap_priority)
      });

      setPages((prev) =>
        prev.map((page) => (page.id === updatedPage.id ? updatedPage : page))
      );

      setForm(normalizePageForm(updatedPage));

      const checkData = await getSeoCheck(updatedPage.id);
      setSeoCheck(checkData);

      window.dispatchEvent(new Event("seo-updated"));

      setMessage({
        type: "success",
        text: "SEO-настройки страницы сохранены"
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveGlobal() {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const updatedGlobal = await updateSeoGlobalSettings(globalForm);

      setGlobalForm(normalizeGlobalForm(updatedGlobal));

      window.dispatchEvent(new Event("seo-updated"));

      setMessage({
        type: "success",
        text: "Глобальные SEO-настройки сохранены"
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message
      });
    } finally {
      setSaving(false);
    }
  }

  function renderCounter(value, min, max) {
    const length = value?.length || 0;
    const className = getLengthClass(length, min, max);

    return (
      <span className={`seo-counter ${className}`}>
        {length} / {max}
      </span>
    );
  }

  function getCheckIcon(type) {
    if (type === "success") {
      return <FiCheckCircle />;
    }

    if (type === "error") {
      return <FiXCircle />;
    }

    return <FiAlertTriangle />;
  }

  if (loading) {
    return (
      <section className="admin-card">
        <p>Загрузка SEO-модуля...</p>
      </section>
    );
  }

  return (
    <section className="admin-card seo-admin-page">
      <div className="seo-page-header">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate("/admin")}
        >
          <FiArrowLeft />
          Назад
        </button>

        <div>
          <h2>SEO-настройки сайта</h2>
          <p>
            Управление SEO по страницам: Title, Description, Open Graph, Twitter
            Card, Sitemap, Robots и Schema JSON-LD.
          </p>
        </div>
      </div>

      {message.text && (
        <p className={`form-message ${message.type}`}>
          {message.text}
        </p>
      )}

      <div className="seo-admin-toolbar">
        <label>
          Страница
          <select value={selectedPageId || ""} onChange={handleSelectPage}>
            {pages.length === 0 && (
              <option value="">Страниц пока нет</option>
            )}

            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.page_name} — {page.path}
              </option>
            ))}
          </select>
        </label>

        <div className="seo-toolbar-actions">
          <button
            className="button seo-secondary-button"
            type="button"
            disabled={saving}
            onClick={handleCreatePage}
          >
            <FiPlus />
            Добавить страницу
          </button>

          <button
            className="button seo-danger-button"
            type="button"
            disabled={saving || !selectedPageId}
            onClick={handleDeletePage}
          >
            <FiTrash2 />
            Удалить
          </button>
        </div>
      </div>

      <div className="seo-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`seo-tab ${activeTab === tab.id ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.title}
          </button>
        ))}
      </div>

      <form className="seo-form" onSubmit={handleSavePage}>
        {activeTab === "main" && (
          <div className="seo-panel">
            <div className="seo-form-grid">
              <label>
                Название страницы
                <input
                  type="text"
                  name="page_name"
                  value={form.page_name}
                  onChange={handlePageChange}
                  placeholder="Главная"
                />
              </label>

              <label>
                URL страницы
                <input
                  type="text"
                  name="path"
                  value={form.path}
                  onChange={handlePageChange}
                  placeholder="/"
                />
              </label>
            </div>

            <label>
              H1 страницы
              <input
                type="text"
                name="h1"
                value={form.h1}
                onChange={handlePageChange}
                placeholder="Chondo Group"
              />
            </label>

            <label>
              <div className="seo-label-row">
                SEO Title
                {renderCounter(form.title, 30, 70)}
              </div>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handlePageChange}
                placeholder="Chondo Group — продюсерский центр, маркетинг и разработка"
              />
            </label>

            <label>
              <div className="seo-label-row">
                SEO Description
                {renderCounter(form.description, 70, 180)}
              </div>

              <textarea
                name="description"
                value={form.description}
                onChange={handlePageChange}
                placeholder="Краткое описание страницы для поисковых систем"
                rows="4"
              />
            </label>

            <div className="seo-form-grid">
              <label>
                Фокусный запрос
                <input
                  type="text"
                  name="focus_keyword"
                  value={form.focus_keyword}
                  onChange={handlePageChange}
                  placeholder="продюсерский центр Chondo Group"
                />
              </label>

              <label>
                Canonical URL
                <input
                  type="text"
                  name="canonical_url"
                  value={form.canonical_url}
                  onChange={handlePageChange}
                  placeholder="https://chondo.kz"
                />
              </label>
            </div>

            <label>
              Keywords
              <textarea
                name="keywords"
                value={form.keywords}
                onChange={handlePageChange}
                placeholder="строительство, ремонт, chondo"
                rows="3"
              />
            </label>

            <div className="seo-preview">
              <h3>Предпросмотр Google</h3>

              <div className="seo-preview-card">
                <p className="seo-preview-url">
                  {form.canonical_url ||
                    `${globalForm.site_url}${form.path === "/" ? "" : form.path}`}
                </p>

                <h4>{form.title || "SEO Title будет здесь"}</h4>

                <p>
                  {form.description ||
                    "SEO Description будет отображаться здесь."}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <div className="seo-panel">
            <div className="seo-form-grid">
              <label>
                Open Graph Title
                <input
                  type="text"
                  name="og_title"
                  value={form.og_title}
                  onChange={handlePageChange}
                  placeholder="Заголовок для соцсетей"
                />
              </label>

              <label>
                Open Graph Type
                <select
                  name="og_type"
                  value={form.og_type}
                  onChange={handlePageChange}
                >
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="product">product</option>
                </select>
              </label>
            </div>

            <label>
              Open Graph Description
              <textarea
                name="og_description"
                value={form.og_description}
                onChange={handlePageChange}
                placeholder="Описание для предпросмотра в соцсетях"
                rows="4"
              />
            </label>

            <label>
              Open Graph Image URL
              <input
                type="text"
                name="og_image"
                value={form.og_image}
                onChange={handlePageChange}
                placeholder="https://chondo.kz/og-image.jpg"
              />
            </label>

            <div className="seo-form-grid">
              <label>
                Twitter Card
                <select
                  name="twitter_card"
                  value={form.twitter_card}
                  onChange={handlePageChange}
                >
                  <option value="summary_large_image">
                    summary_large_image
                  </option>
                  <option value="summary">summary</option>
                </select>
              </label>

              <label>
                Twitter Title
                <input
                  type="text"
                  name="twitter_title"
                  value={form.twitter_title}
                  onChange={handlePageChange}
                  placeholder="Заголовок для Twitter / X"
                />
              </label>
            </div>

            <label>
              Twitter Description
              <textarea
                name="twitter_description"
                value={form.twitter_description}
                onChange={handlePageChange}
                placeholder="Описание для Twitter / X"
                rows="3"
              />
            </label>

            <label>
              Twitter Image URL
              <input
                type="text"
                name="twitter_image"
                value={form.twitter_image}
                onChange={handlePageChange}
                placeholder="https://chondo.kz/twitter-image.jpg"
              />
            </label>

            <div className="social-preview-card">
              <div className="social-preview-image">
                {form.og_image ? (
                  <img src={form.og_image} alt="OG preview" />
                ) : (
                  <span>OG Image</span>
                )}
              </div>

              <div>
                <h3>{form.og_title || form.title || "Заголовок"}</h3>
                <p>
                  {form.og_description ||
                    form.description ||
                    "Описание для соцсетей"}
                </p>
                <span>{globalForm.site_url || "https://chondo.kz"}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "robots" && (
          <div className="seo-panel">
            <div className="seo-form-grid">
              <label>
                Robots для страницы
                <select
                  name="robots"
                  value={form.robots}
                  onChange={handlePageChange}
                >
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, follow">noindex, follow</option>
                </select>
              </label>

              <label>
                Changefreq
                <select
                  name="sitemap_changefreq"
                  value={form.sitemap_changefreq}
                  onChange={handlePageChange}
                >
                  <option value="always">always</option>
                  <option value="hourly">hourly</option>
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                  <option value="never">never</option>
                </select>
              </label>
            </div>

            <div className="seo-form-grid">
              <label>
                Sitemap Priority
                <input
                  type="number"
                  name="sitemap_priority"
                  min="0"
                  max="1"
                  step="0.1"
                  value={form.sitemap_priority}
                  onChange={handlePageChange}
                />
              </label>

              <label className="seo-checkbox-label">
                <input
                  type="checkbox"
                  name="sitemap_enabled"
                  checked={form.sitemap_enabled}
                  onChange={handlePageChange}
                />
                Включить страницу в sitemap.xml
              </label>
            </div>

            <hr className="seo-divider" />

            <h3>Глобальные настройки сайта</h3>

            <div className="seo-form-grid">
              <label>
                Site URL
                <input
                  type="text"
                  name="site_url"
                  value={globalForm.site_url}
                  onChange={handleGlobalChange}
                  placeholder="https://chondo.kz"
                />
              </label>

              <label>
                Название сайта по умолчанию
                <input
                  type="text"
                  name="default_site_name"
                  value={globalForm.default_site_name}
                  onChange={handleGlobalChange}
                  placeholder="Chondo Group"
                />
              </label>
            </div>

            <label>
              Default OG Image
              <input
                type="text"
                name="default_og_image"
                value={globalForm.default_og_image}
                onChange={handleGlobalChange}
                placeholder="https://chondo.kz/default-og.jpg"
              />
            </label>

            <label>
              robots.txt
              <textarea
                name="robots_txt"
                value={globalForm.robots_txt}
                onChange={handleGlobalChange}
                rows="8"
              />
            </label>

            <div className="seo-links-box">
              <p>
                robots.txt:{" "}
                <a
                  href="http://localhost:8000/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                >
                  http://localhost:8000/robots.txt
                </a>
              </p>

              <p>
                sitemap.xml:{" "}
                <a
                  href="http://localhost:8000/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                >
                  http://localhost:8000/sitemap.xml
                </a>
              </p>
            </div>

            <button
              className="button seo-secondary-button"
              type="button"
              disabled={saving}
              onClick={handleSaveGlobal}
            >
              <FiSave />
              Сохранить глобальные настройки
            </button>
          </div>
        )}

        {activeTab === "schema" && (
          <div className="seo-panel">
            <label className="seo-checkbox-label">
              <input
                type="checkbox"
                name="schema_enabled"
                checked={form.schema_enabled}
                onChange={handlePageChange}
              />
              Включить Schema JSON-LD для страницы
            </label>

            <label>
              Schema Type
              <select
                name="schema_type"
                value={form.schema_type}
                onChange={handlePageChange}
              >
                <option value="Organization">Organization</option>
                <option value="LocalBusiness">LocalBusiness</option>
                <option value="WebSite">WebSite</option>
                <option value="Service">Service</option>
                <option value="FAQPage">FAQPage</option>
              </select>
            </label>

            <label>
              Custom Schema JSON-LD
              <textarea
                name="custom_schema_json"
                value={form.custom_schema_json}
                onChange={handlePageChange}
                placeholder='{"@context":"https://schema.org","@type":"Organization","name":"Chondo Group"}'
                rows="8"
              />
            </label>

            <hr className="seo-divider" />

            <h3>Данные организации</h3>

            <div className="seo-form-grid">
              <label>
                Название организации
                <input
                  type="text"
                  name="organization_name"
                  value={globalForm.organization_name}
                  onChange={handleGlobalChange}
                />
              </label>

              <label>
                Логотип
                <input
                  type="text"
                  name="organization_logo"
                  value={globalForm.organization_logo}
                  onChange={handleGlobalChange}
                  placeholder="https://chondo.kz/logo.png"
                />
              </label>
            </div>

            <div className="seo-form-grid">
              <label>
                Телефон
                <input
                  type="text"
                  name="organization_phone"
                  value={globalForm.organization_phone}
                  onChange={handleGlobalChange}
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="organization_email"
                  value={globalForm.organization_email}
                  onChange={handleGlobalChange}
                />
              </label>
            </div>

            <label>
              Адрес
              <input
                type="text"
                name="organization_address"
                value={globalForm.organization_address}
                onChange={handleGlobalChange}
              />
            </label>

            <div className="seo-form-grid">
              <label>
                Город
                <input
                  type="text"
                  name="organization_city"
                  value={globalForm.organization_city}
                  onChange={handleGlobalChange}
                />
              </label>

              <label>
                Страна
                <input
                  type="text"
                  name="organization_country"
                  value={globalForm.organization_country}
                  onChange={handleGlobalChange}
                />
              </label>
            </div>

            <label>
              Соцсети, каждая ссылка с новой строки
              <textarea
                name="social_links"
                value={globalForm.social_links}
                onChange={handleGlobalChange}
                placeholder="https://instagram.com/..."
                rows="5"
              />
            </label>

            <button
              className="button seo-secondary-button"
              type="button"
              disabled={saving}
              onClick={handleSaveGlobal}
            >
              <FiSave />
              Сохранить данные организации
            </button>
          </div>
        )}

        {activeTab === "check" && (
          <div className="seo-panel">
            <div className="seo-score-box">
              <div>
                <h3>SEO Score</h3>
                <p>Оценка качества SEO-настроек выбранной страницы.</p>
              </div>

              <strong>{seoCheck?.score ?? 0}/100</strong>
            </div>

            <div className="seo-check-list">
              {seoCheck?.items?.length > 0 ? (
                seoCheck.items.map((item, index) => (
                  <div
                    key={`${item.text}-${index}`}
                    className={`seo-check-item ${item.type}`}
                  >
                    {getCheckIcon(item.type)}
                    <span>{item.text}</span>
                  </div>
                ))
              ) : (
                <p>Проверка пока недоступна.</p>
              )}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button
            className="button modal-save-button"
            type="submit"
            disabled={saving || !selectedPage}
          >
            <FiSave />
            {saving ? "Сохранение..." : "Сохранить SEO страницы"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default SeoSettingsPage;