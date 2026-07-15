import { useEffect, useMemo, useState } from "react";

import { getCases } from "../api/cases";

function ServiceCases({ category, serviceTitle }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCases() {
      try {
        const data = await getCases({ signal: controller.signal });
        setCases(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Ошибка загрузки кейсов услуги:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCases();

    return () => controller.abort();
  }, []);

  const serviceCases = useMemo(
    () => cases.filter((item) => item.category === category),
    [cases, category]
  );

  if (loading || !serviceCases.length) {
    return null;
  }

  return (
    <section className="section service-cases-section" id="service-cases">
      <div className="container">
        <div className="service-cases-head">
          <div>
            <p className="eyebrow">Кейсы по направлению</p>
            <h2>Реальные проекты по направлению «{serviceTitle}»</h2>
          </div>
          <p>
            Показываем задачу клиента, реализованное решение и результат работы
            по этому направлению.
          </p>
        </div>

        <div className="service-cases-grid">
          {serviceCases.map((item) => (
            <article
              className="service-case-card"
              key={item.id}
              style={{ "--case-accent": item.accent || "#111111" }}
            >
              <div className="service-case-media">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} loading="lazy" />
                ) : (
                  <span>{item.logo_text || item.title?.[0] || "C"}</span>
                )}
              </div>

              <div className="service-case-content">
                {item.subtitle && (
                  <p className="service-case-subtitle">{item.subtitle}</p>
                )}
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceCases;
