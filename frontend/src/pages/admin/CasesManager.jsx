import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiBriefcase,
  FiRefreshCw,
  FiSave,
  FiTrash2,
  FiUpload
} from "react-icons/fi";

import {
  createCase,
  deleteCase,
  getAdminCases,
  replaceCaseImage,
  updateCase
} from "../../api/cases";


const caseCategories = [
  {
    id: "development",
    title: "Разработка"
  },
  {
    id: "digital",
    title: "Digital реклама"
  },
  {
    id: "experts",
    title: "Продюсирование экспертов + системные воронки"
  },
  {
    id: "podcasts",
    title: "Подкасты"
  }
];


function getToken() {
  return (
    localStorage.getItem("admin_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token")
  );
}


function CasesManager({ onBack }) {
  const [cases, setCases] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "development",
    logo_text: "",
    accent: "#e60046",
    sort_order: "",
    is_active: true,
    file: null
  });

  const token = getToken();

  const filteredCases = useMemo(() => {
    if (activeCategory === "all") {
      return cases;
    }

    return cases.filter((item) => item.category === activeCategory);
  }, [cases, activeCategory]);

  async function loadCases() {
    try {
      setLoading(true);
      setMessage("");

      const data = await getAdminCases(token);
      setCases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMessage("Не удалось загрузить кейсы. Проверь backend и авторизацию.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateForm(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  async function handleCreate(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setMessage("Введите название кейса");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await createCase(token, form);

      setForm({
        title: "",
        subtitle: "",
        description: "",
        category: "development",
        logo_text: "",
        accent: "#e60046",
        sort_order: "",
        is_active: true,
        file: null
      });

      event.target.reset();

      await loadCases();

      setMessage("Кейс опубликован");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Ошибка создания кейса");
    } finally {
      setSaving(false);
    }
  }

  function changeCaseField(caseId, field, value) {
    setCases((prev) =>
      prev.map((item) =>
        item.id === caseId
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  }

  async function handleSave(item) {
    try {
      setSaving(true);
      setMessage("");

      await updateCase(token, item.id, {
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        category: item.category,
        logo_text: item.logo_text,
        accent: item.accent,
        sort_order: Number(item.sort_order) || 0,
        is_active: Boolean(item.is_active)
      });

      await loadCases();

      setMessage("Кейс сохранён");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Не удалось сохранить кейс");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item) {
    try {
      setSaving(true);
      setMessage("");

      await updateCase(token, item.id, {
        is_active: !item.is_active
      });

      await loadCases();
    } catch (error) {
      console.error(error);
      setMessage("Не удалось изменить статус кейса");
    } finally {
      setSaving(false);
    }
  }

  async function handleReplaceImage(item, file) {
    if (!file) return;

    try {
      setSaving(true);
      setMessage("");

      await replaceCaseImage(token, item.id, file);

      await loadCases();

      setMessage("Изображение кейса заменено");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Не удалось заменить изображение");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(caseId) {
    const confirmed = window.confirm(
      "Удалить кейс? Изображение также будет удалено из облака."
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setMessage("");

      await deleteCase(token, caseId);
      await loadCases();

      setMessage("Кейс удалён");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Не удалось удалить кейс");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2>Кейсы</h2>
          <p>
            Публикуйте кейсы, выбирайте рубрику, загружайте изображения и
            управляйте отображением на главной странице.
          </p>
        </div>

        <button
          className="admin-button admin-button-light"
          type="button"
          onClick={onBack}
        >
          <FiArrowLeft />
          Назад
        </button>
      </div>

      <form className="case-editor-form" onSubmit={handleCreate}>
        <div className="case-editor-grid">
          <label>
            Название кейса
            <input
              type="text"
              placeholder="Например: MONOCHROME"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
            />
          </label>

          <label>
            Подзаголовок
            <input
              type="text"
              placeholder="дизайн и разработка"
              value={form.subtitle}
              onChange={(event) => updateForm("subtitle", event.target.value)}
            />
          </label>

          <label>
            Рубрика
            <select
              value={form.category}
              onChange={(event) => updateForm("category", event.target.value)}
            >
              {caseCategories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Текст в иконке
            <input
              type="text"
              placeholder="M / Ви / AD"
              value={form.logo_text}
              onChange={(event) => updateForm("logo_text", event.target.value)}
            />
          </label>

          <label>
            Акцентный цвет
            <input
              type="color"
              value={form.accent}
              onChange={(event) => updateForm("accent", event.target.value)}
            />
          </label>

          <label>
            Порядок
            <input
              type="number"
              placeholder="10"
              value={form.sort_order}
              onChange={(event) => updateForm("sort_order", event.target.value)}
            />
          </label>

          <label className="case-editor-full">
            Описание
            <textarea
              placeholder="Кратко опиши, что было сделано в кейсе"
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
            />
          </label>

          <label className="case-editor-full">
            Изображение кейса
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              onChange={(event) =>
                updateForm("file", event.target.files?.[0] || null)
              }
            />
          </label>
        </div>

        <label className="case-active-checkbox">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => updateForm("is_active", event.target.checked)}
          />
          Опубликовать сразу
        </label>

        <button
          className="admin-button case-editor-submit"
          type="submit"
          disabled={saving}
        >
          <FiUpload />
          {saving ? "Публикуем..." : "Опубликовать кейс"}
        </button>
      </form>

      {message && <p className="logo-manager-message">{message}</p>}

      <div className="case-admin-tabs">
        <button
          className={
            activeCategory === "all"
              ? "case-admin-tab case-admin-tab-active"
              : "case-admin-tab"
          }
          type="button"
          onClick={() => setActiveCategory("all")}
        >
          Все
        </button>

        {caseCategories.map((category) => (
          <button
            key={category.id}
            className={
              activeCategory === category.id
                ? "case-admin-tab case-admin-tab-active"
                : "case-admin-tab"
            }
            type="button"
            onClick={() => setActiveCategory(category.id)}
          >
            {category.title}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Загрузка кейсов...</p>
      ) : filteredCases.length === 0 ? (
        <div className="case-empty-state">
          <FiBriefcase />
          <h3>Кейсов пока нет</h3>
          <p>Создай первый кейс, и он появится на главной странице.</p>
        </div>
      ) : (
        <div className="case-admin-list">
          {filteredCases.map((item) => (
            <article
              className={
                item.is_active
                  ? "case-admin-row"
                  : "case-admin-row case-admin-row-disabled"
              }
              key={item.id}
            >
              <div
                className="case-admin-preview"
                style={{ "--case-accent": item.accent || "#111111" }}
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} />
                ) : (
                  <span>{item.logo_text || item.title?.[0]}</span>
                )}
              </div>

              <div className="case-admin-fields">
                <label>
                  Название
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(event) =>
                      changeCaseField(item.id, "title", event.target.value)
                    }
                  />
                </label>

                <label>
                  Подзаголовок
                  <input
                    type="text"
                    value={item.subtitle || ""}
                    onChange={(event) =>
                      changeCaseField(item.id, "subtitle", event.target.value)
                    }
                  />
                </label>

                <label>
                  Рубрика
                  <select
                    value={item.category}
                    onChange={(event) =>
                      changeCaseField(item.id, "category", event.target.value)
                    }
                  >
                    {caseCategories.map((category) => (
                      <option value={category.id} key={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Иконка
                  <input
                    type="text"
                    value={item.logo_text || ""}
                    onChange={(event) =>
                      changeCaseField(item.id, "logo_text", event.target.value)
                    }
                  />
                </label>

                <label>
                  Цвет
                  <input
                    type="color"
                    value={item.accent || "#111111"}
                    onChange={(event) =>
                      changeCaseField(item.id, "accent", event.target.value)
                    }
                  />
                </label>

                <label>
                  Порядок
                  <input
                    type="number"
                    value={item.sort_order || 0}
                    onChange={(event) =>
                      changeCaseField(item.id, "sort_order", event.target.value)
                    }
                  />
                </label>

                <label className="case-admin-full">
                  Описание
                  <textarea
                    value={item.description || ""}
                    onChange={(event) =>
                      changeCaseField(item.id, "description", event.target.value)
                    }
                  />
                </label>
              </div>

              <div className="case-admin-actions">
                <button
                  className="admin-button admin-button-light"
                  type="button"
                  disabled={saving}
                  onClick={() => handleToggle(item)}
                >
                  {item.is_active ? "Скрыть" : "Показать"}
                </button>

                <label className="admin-button admin-button-light case-replace-button">
                  <FiRefreshCw />
                  Заменить фото
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={(event) =>
                      handleReplaceImage(item, event.target.files?.[0] || null)
                    }
                  />
                </label>

                <button
                  className="admin-button"
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave(item)}
                >
                  <FiSave />
                  Сохранить
                </button>

                <button
                  className="admin-button logo-delete-button"
                  type="button"
                  disabled={saving}
                  onClick={() => handleDelete(item.id)}
                >
                  <FiTrash2 />
                  Удалить
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CasesManager;