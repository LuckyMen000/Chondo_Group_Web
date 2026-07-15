import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaInstagram,
  FaTelegramPlane,
  FaWhatsapp,
  FaExternalLinkAlt,
  FaShieldAlt,
} from "react-icons/fa";

import { getPublicFooterSettings } from "../api/footer";

const EMPTY_SOCIAL_LINKS = {
  instagram_url: "",
  telegram_url: "",
  whatsapp_url: "",
};

function getSafeExternalUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function SocialItem({ href, icon, label }) {
  const safeHref = getSafeExternalUrl(href);
  const content = (
    <>
      <span>{icon}</span>
      {label}
    </>
  );

  if (!safeHref) {
    return (
      <div
        className="footer__social-link footer__social-link--disabled"
        aria-disabled="true"
        title="Ссылка пока не добавлена"
      >
        {content}
      </div>
    );
  }

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className="footer__social-link"
      aria-label={label}
    >
      {content}
    </a>
  );
}

function Footer() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const sectionLink = (hash) => (isHome ? hash : `/${hash}`);
  const [socialLinks, setSocialLinks] = useState(EMPTY_SOCIAL_LINKS);

  useEffect(() => {
    const controller = new AbortController();

    getPublicFooterSettings({ signal: controller.signal })
      .then((data) => {
        setSocialLinks({
          instagram_url: data?.instagram_url || "",
          telegram_url: data?.telegram_url || "",
          whatsapp_url: data?.whatsapp_url || "",
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Не удалось загрузить ссылки футера", error);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <footer className="footer">
      <div className="container footer__inner footer__inner-new">
        <div className="footer__brand">
          <p className="footer__kicker">MEDIA / MARKETING / DEVELOPMENT</p>

          <Link to="/" className="footer__logo">
            Chondo Group
          </Link>

          <p className="footer__description">
            Создаём контент, запускаем маркетинг, выстраиваем автоворонки и
            разрабатываем цифровые продукты для роста бизнеса.
          </p>

          <div className="footer__tags">
            <span>Продакшн</span>
            <span>Маркетинг</span>
            <span>Разработка</span>
            <span>Автоворонки</span>
          </div>

          <div className="footer__admin-card">
            <span className="footer__admin-icon">
              <FaShieldAlt />
            </span>

            <p>
              Проекты Chondo Group реализуются ТОО «Солтрикс». Работаем по
              договору. NDA — по запросу.
            </p>
          </div>

          <Link to={sectionLink("#contact")} className="footer__cta">
            Обсудить проект
            <FaExternalLinkAlt />
          </Link>
        </div>

        <div className="footer__nav">
          <h4>Навигация</h4>

          <Link to={sectionLink("#about")}>О нас</Link>
          <Link to={sectionLink("#services")}>Услуги</Link>
          <Link to={sectionLink("#cases")}>Кейсы</Link>
          <Link to={sectionLink("#contact")}>Контакты</Link>
        </div>

        <div className="footer__socials">
          <h4>Связаться</h4>

          <div className="footer__social-list">
            <SocialItem
              href={socialLinks.instagram_url}
              icon={<FaInstagram />}
              label="Instagram"
            />
            <SocialItem
              href={socialLinks.telegram_url}
              icon={<FaTelegramPlane />}
              label="Telegram"
            />
            <SocialItem
              href={socialLinks.whatsapp_url}
              icon={<FaWhatsapp />}
              label="WhatsApp"
            />
          </div>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© 2026 Chondo Group. Все права защищены.</p>
        <p>Медиа, маркетинг и технологии для роста</p>
      </div>
    </footer>
  );
}

export default Footer;
