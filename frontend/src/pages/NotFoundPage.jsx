import { useEffect } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

function NotFoundPage() {
  useEffect(() => {
    document.title = "Страница не найдена — Chondo Group";

    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.setAttribute("name", "robots");
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute("content", "noindex, nofollow");
  }, []);

  return (
    <>
      <Header />

      <main className="not-found-page">
        <section className="not-found">
          <div className="container not-found__inner">
            <p className="not-found__code">404</p>
            <p className="eyebrow">Страница не найдена</p>
            <h1>Здесь ничего нет</h1>
            <p className="not-found__text">
              Возможно, ссылка устарела или в адресе есть ошибка. Вернитесь на
              главную — там находятся услуги, кейсы и форма для связи с нами.
            </p>

            <div className="not-found__actions">
              <Link to="/" className="button hero__button-primary">
                На главную
              </Link>
              <Link to="/#contact" className="button hero__button-secondary">
                Обсудить проект
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default NotFoundPage;
