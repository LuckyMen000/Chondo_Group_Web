import { Link } from "react-router-dom";

import { services } from "../data/services";

function Services() {
  return (
    <section className="section section-dark" id="services">
      <div className="container">
        <p className="eyebrow">Услуги</p>
        <h2>Шесть направлений — одна система роста</h2>
        <p className="section-intro">
          Подключаем отдельное направление или собираем комплексное решение
          под задачи бизнеса.
        </p>

        <div className="cards services-grid">
          {services.map((service) => (
            <Link
              className="card service-card service-card-link"
              key={service.slug}
              to={`/services/${service.slug}`}
              aria-label={`Подробнее об услуге «${service.title}»`}
            >
              <span className="service-card__number">/ {service.label}</span>
              <h3>{service.title}</h3>
              <p>{service.cardText}</p>
              <span className="service-card__more">Подробнее →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
