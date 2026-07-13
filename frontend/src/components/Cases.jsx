import { useEffect, useMemo, useState } from "react";

import { getCases } from "../api/cases";


const categories = [
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


function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("development");
  const [activeCaseId, setActiveCaseId] = useState(null);

  const activeCases = useMemo(
    () => cases.filter((item) => item.category === activeCategory),
    [cases, activeCategory]
  );

  const activeCase =
    activeCases.find((item) => item.id === activeCaseId) || activeCases[0];

  useEffect(() => {
    async function loadCases() {
      try {
        const data = await getCases();

        const normalizedCases = Array.isArray(data) ? data : [];

        setCases(normalizedCases);

        const firstCategoryWithCases =
          categories.find((category) =>
            normalizedCases.some((item) => item.category === category.id)
          )?.id || "development";

        setActiveCategory(firstCategoryWithCases);

        const firstCase = normalizedCases.find(
          (item) => item.category === firstCategoryWithCases
        );

        setActiveCaseId(firstCase?.id || null);
      } catch (error) {
        console.error("Ошибка загрузки кейсов:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, []);

  useEffect(() => {
    const firstCase = activeCases[0];

    if (firstCase) {
      setActiveCaseId(firstCase.id);
    } else {
      setActiveCaseId(null);
    }
  }, [activeCategory, activeCases]);

  if (loading) {
    return null;
  }

  if (!cases.length) {
    return null;
  }

  return (
    <section className="cases-showcase-section" id="cases">
      <div className="container">
        <div className="cases-showcase-head">
          <p className="eyebrow">Кейсы</p>
          <h2>Примеры решений</h2>
        </div>

        <div className="cases-tabs" role="tablist" aria-label="Рубрики кейсов">
          {categories.map((category) => {
            const hasCases = cases.some((item) => item.category === category.id);

            if (!hasCases) return null;

            return (
              <button
                key={category.id}
                className={
                  activeCategory === category.id
                    ? "cases-tab cases-tab-active"
                    : "cases-tab"
                }
                type="button"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.title}
              </button>
            );
          })}
        </div>

        <div className="cases-showcase">
          <aside className="cases-showcase-list">
            {activeCases.map((item) => (
              <button
                key={item.id}
                className={
                  activeCase?.id === item.id
                    ? "case-preview-card case-preview-card-active"
                    : "case-preview-card"
                }
                style={{ "--case-accent": item.accent || "#111111" }}
                type="button"
                onClick={() => setActiveCaseId(item.id)}
              >
                <div className="case-preview-logo">
                  <span>{item.logo_text || item.title?.[0]}</span>
                </div>

                <div className="case-preview-text">
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                </div>
              </button>
            ))}
          </aside>

          {activeCase && (
            <article
              className="case-display"
              style={{ "--case-accent": activeCase.accent || "#111111" }}
            >
              <div className="case-display-bg">
                {activeCase.image_url ? (
                  <img src={activeCase.image_url} alt={activeCase.title} />
                ) : null}
              </div>

              <div className="case-display-overlay">
                <div>
                  <p>{activeCase.subtitle}</p>
                  <h3>{activeCase.title}</h3>
                </div>

                <span className="case-display-badge">Case</span>
              </div>

              {activeCase.description && (
                <div className="case-display-description">
                  <p>{activeCase.description}</p>
                </div>
              )}
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

export default Cases;