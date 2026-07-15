import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { getSeoByPath } from "../api/seo";

function setMetaTag(name, content) {
  if (!content) {
    return;
  }

  let tag = document.querySelector(`meta[name="${name}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function setPropertyMetaTag(property, content) {
  if (!content) {
    return;
  }

  let tag = document.querySelector(`meta[property="${property}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function setCanonical(url) {
  if (!url) {
    return;
  }

  let link = document.querySelector(`link[rel="canonical"]`);

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", url);
}

function setJsonLd(schema) {
  let script = document.querySelector("#seo-json-ld");

  if (!schema) {
    if (script) {
      script.remove();
    }

    return;
  }

  if (!script) {
    script = document.createElement("script");
    script.setAttribute("id", "seo-json-ld");
    script.setAttribute("type", "application/ld+json");
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(schema);
}

function buildSchema(page, globalSettings) {
  if (!page?.schema_enabled) {
    return null;
  }

  if (page?.custom_schema_json) {
    try {
      return JSON.parse(page.custom_schema_json);
    } catch (error) {
      console.error("Ошибка JSON-LD:", error);
    }
  }

  const siteUrl = globalSettings?.site_url || window.location.origin;
  const siteName = globalSettings?.default_site_name || "Chondo Group";
  const canonicalUrl = page?.canonical_url || `${siteUrl}${page?.path || "/"}`;

  const sameAs = globalSettings?.social_links
    ? globalSettings.social_links
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const schema = {
    "@context": "https://schema.org",
    "@type": page?.schema_type || "Organization",
    name: globalSettings?.organization_name || siteName,
    url: canonicalUrl
  };

  if (globalSettings?.organization_logo) {
    schema.logo = globalSettings.organization_logo;
  }

  if (globalSettings?.organization_phone) {
    schema.telephone = globalSettings.organization_phone;
  }

  if (globalSettings?.organization_email) {
    schema.email = globalSettings.organization_email;
  }

  if (globalSettings?.organization_address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: globalSettings.organization_address,
      addressLocality: globalSettings.organization_city || undefined,
      addressCountry: globalSettings.organization_country || undefined
    };
  }

  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  return schema;
}

function applySeo(data, pathname) {
  const hasPage = Boolean(data?.page);
  const page = data?.page || {};
  const globalSettings = data?.global_settings || {};

  const siteName = globalSettings.default_site_name || "Chondo Group";
  const siteUrl = globalSettings.site_url || window.location.origin;

  const title = hasPage
    ? page.title || siteName
    : `Страница не найдена — ${siteName}`;
  const description = hasPage ? page.description || "" : "";
  const canonicalUrl =
    page.canonical_url ||
    `${siteUrl.replace(/\/$/, "")}${pathname === "/" ? "" : pathname}`;

  document.title = title;

  setMetaTag("description", description);
  setMetaTag("keywords", page.keywords || "");
  setMetaTag(
    "robots",
    hasPage ? page.robots || "index, follow" : "noindex, nofollow"
  );

  setPropertyMetaTag("og:title", page.og_title || title);
  setPropertyMetaTag("og:description", page.og_description || description);
  setPropertyMetaTag(
    "og:image",
    page.og_image || globalSettings.default_og_image || ""
  );
  setPropertyMetaTag("og:type", page.og_type || "website");
  setPropertyMetaTag("og:url", canonicalUrl);
  setPropertyMetaTag("og:site_name", siteName);

  setMetaTag("twitter:card", page.twitter_card || "summary_large_image");
  setMetaTag("twitter:title", page.twitter_title || page.og_title || title);
  setMetaTag(
    "twitter:description",
    page.twitter_description || page.og_description || description
  );
  setMetaTag(
    "twitter:image",
    page.twitter_image ||
      page.og_image ||
      globalSettings.default_og_image ||
      ""
  );

  setCanonical(canonicalUrl);

  const schema = hasPage ? buildSchema(page, globalSettings) : null;
  setJsonLd(schema);
}

function GlobalSeo() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      return;
    }

    async function loadSeo() {
      try {
        const data = await getSeoByPath(location.pathname);
        applySeo(data, location.pathname);
      } catch (error) {
        console.error("Ошибка загрузки SEO:", error);
      }
    }

    loadSeo();

    window.addEventListener("seo-updated", loadSeo);

    return () => {
      window.removeEventListener("seo-updated", loadSeo);
    };
  }, [location.pathname]);

  return null;
}

export default GlobalSeo;