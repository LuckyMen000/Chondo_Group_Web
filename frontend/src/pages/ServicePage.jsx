import { Link, useParams } from "react-router-dom";

import Header from "../components/Header";
import ContactForm from "../components/ContactForm";
import ServiceCases from "../components/ServiceCases";
import Footer from "../components/Footer";
import NotFoundPage from "./NotFoundPage";
import { getServiceBySlug, services } from "../data/services";

function ServicePage() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

  if (!service) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Header />

      <main className="service-page">
        <section className="service-hero">
          <div className="container service-hero__inner">
            <div>
              <p className="eyebrow">Услуга / {service.label}</p>
              <h1>{service.heroTitle}</h1>
              <p className="service-hero__intro">{service.intro}</p>

              <div className="hero__actions service-hero__actions">
                <a href="#contact" className="button hero__button-primary">
                  Обсудить задачу
                </a>
                <Link to="/#cases" className="button hero__button-secondary">
                  Смотреть кейсы
                </Link>
              </div>
            </div>

            <div className="service-hero__summary">
              <p className="service-hero__summary-label">Результат</p>
              <p>{service.result}</p>

              <div className="service-tags">
                {service.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section section-dark service-includes">
          <div className="container">
            <p className="eyebrow">Что входит</p>
            <h2>Закрываем задачу целиком</h2>

            <div className="service-detail-grid">
              {service.includes.map((item, index) => (
                <article className="service-detail-card" key={item.title}>
                  <span>0{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section service-process-section">
          <div className="container service-process-layout">
            <div>
              <p className="eyebrow">Процесс</p>
              <h2>Как строится работа</h2>
              <p className="service-process-lead">
                До начала проекта фиксируем объём работ, сроки, зоны
                ответственности и ожидаемый результат.
              </p>
            </div>

            <ol className="service-process-list">
              {service.process.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section service-suitable-section">
          <div className="container service-suitable-layout">
            <div>
              <p className="eyebrow">Когда это актуально</p>
              <h2>Подходит для вашей задачи, если</h2>
            </div>

            <ul className="service-suitable-list">
              {service.suitable.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="container other-services">
            <p>Другие направления</p>
            <div>
              {services
                .filter((item) => item.slug !== service.slug)
                .map((item) => (
                  <Link key={item.slug} to={`/services/${item.slug}`}>
                    {item.title}
                  </Link>
                ))}
            </div>
          </div>
        </section>

        <ServiceCases
          category={service.caseCategory}
          serviceTitle={service.title}
        />

        <ContactForm serviceName={service.title} />
      </main>

      <Footer />
    </>
  );
}

export default ServicePage;
