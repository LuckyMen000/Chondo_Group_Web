import { useEffect, useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { SiGoogleanalytics, SiMeta } from "react-icons/si";
import {
  FiBarChart2,
  FiChrome,
  FiGlobe,
  FiHelpCircle,
  FiRefreshCw,
  FiShare2,
  FiUsers
} from "react-icons/fi";

import { getAnalyticsSummary } from "../../api/analytics";

const WORLD_MAP_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const periodOptions = [
  { value: "today", label: "Сегодня" },
  { value: "yesterday", label: "Вчера" },
  { value: "7d", label: "7 дней" },
  { value: "14d", label: "14 дней" },
  { value: "30d", label: "30 дней" },
  { value: "2m", label: "2 месяца" },
  { value: "6m", label: "6 месяцев" },
  { value: "custom", label: "Произвольный период" }
];

const COUNTRY_CODE_TO_MAP_ID = {
  AF: "004",
  AL: "008",
  DZ: "012",
  AO: "024",
  AR: "032",
  AM: "051",
  AU: "036",
  AT: "040",
  AZ: "031",
  BY: "112",
  BE: "056",
  BJ: "204",
  BO: "068",
  BA: "070",
  BW: "072",
  BR: "076",
  BG: "100",
  BF: "854",
  BI: "108",
  KH: "116",
  CM: "120",
  CA: "124",
  CF: "140",
  TD: "148",
  CL: "152",
  CN: "156",
  CO: "170",
  CG: "178",
  CD: "180",
  CR: "188",
  CI: "384",
  HR: "191",
  CU: "192",
  CZ: "203",
  DK: "208",
  DO: "214",
  EC: "218",
  EG: "818",
  SV: "222",
  EE: "233",
  ET: "231",
  FI: "246",
  FR: "250",
  GA: "266",
  GM: "270",
  GE: "268",
  DE: "276",
  GH: "288",
  GR: "300",
  GT: "320",
  GN: "324",
  GW: "624",
  GY: "328",
  HT: "332",
  HN: "340",
  HU: "348",
  IS: "352",
  IN: "356",
  ID: "360",
  IR: "364",
  IQ: "368",
  IE: "372",
  IL: "376",
  IT: "380",
  JM: "388",
  JP: "392",
  JO: "400",
  KZ: "398",
  KE: "404",
  KR: "410",
  KW: "414",
  KG: "417",
  LA: "418",
  LV: "428",
  LB: "422",
  LS: "426",
  LR: "430",
  LY: "434",
  LT: "440",
  MG: "450",
  MW: "454",
  MY: "458",
  ML: "466",
  MR: "478",
  MX: "484",
  MD: "498",
  MN: "496",
  ME: "499",
  MA: "504",
  MZ: "508",
  MM: "104",
  NA: "516",
  NP: "524",
  NL: "528",
  NZ: "554",
  NI: "558",
  NE: "562",
  NG: "566",
  MK: "807",
  NO: "578",
  OM: "512",
  PK: "586",
  PA: "591",
  PY: "600",
  PE: "604",
  PH: "608",
  PL: "616",
  PT: "620",
  QA: "634",
  RO: "642",
  RU: "643",
  RW: "646",
  SA: "682",
  SN: "686",
  RS: "688",
  SL: "694",
  SK: "703",
  SI: "705",
  SO: "706",
  ZA: "710",
  ES: "724",
  LK: "144",
  SD: "729",
  SR: "740",
  SZ: "748",
  SE: "752",
  CH: "756",
  SY: "760",
  TJ: "762",
  TZ: "834",
  TH: "764",
  TG: "768",
  TN: "788",
  TR: "792",
  TM: "795",
  UG: "800",
  UA: "804",
  AE: "784",
  GB: "826",
  US: "840",
  UY: "858",
  UZ: "860",
  VE: "862",
  VN: "704",
  YE: "887",
  ZM: "894",
  ZW: "716"
};

const COUNTRY_NAME_TO_MAP_ID = {
  Казахстан: "398",
  Россия: "643",
  США: "840",
  Великобритания: "826",
  Германия: "276",
  Франция: "250",
  Турция: "792",
  Китай: "156",
  Узбекистан: "860",
  Кыргызстан: "417",
  Украина: "804",
  Беларусь: "112",
  ОАЭ: "784"
};

function getMaxValue(items) {
  if (!items || items.length === 0) {
    return 1;
  }

  return Math.max(...items.map((item) => item.value || item.visits || 0), 1);
}

function getPercent(value, max) {
  if (!value || !max) {
    return 0;
  }

  return Math.max(4, Math.round((value / max) * 100));
}

function AnalyticsMetricList({ title, icon, items, emptyText }) {
  const maxValue = getMaxValue(items);

  return (
    <div className="analytics-panel">
      <div className="analytics-panel-header">
        <div className="analytics-panel-icon">{icon}</div>

        <div>
          <h3>{title}</h3>
          <p>{emptyText}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="analytics-empty">Данных пока нет.</p>
      ) : (
        <div className="analytics-metric-list">
          {items.map((item) => (
            <div className="analytics-metric-item" key={`${title}-${item.name}`}>
              <div className="analytics-metric-top">
                <span>
                  {item.name}
                  {item.code && item.code !== "UNKNOWN" ? (
                    <small> {item.code}</small>
                  ) : null}
                </span>

                <b>{item.value}</b>
              </div>

              <div className="analytics-progress">
                <div
                  className="analytics-progress-fill"
                  style={{
                    width: `${getPercent(item.value, maxValue)}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsPage() {
  const [mapCountries, setMapCountries] = useState([]);
  const [zoom, setZoom] = useState(1);

  const [position, setPosition] = useState({
    x: 480,
    y: 300
  });

  const [dragging, setDragging] = useState(false);

  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0
  });

  const [showTrafficHint, setShowTrafficHint] = useState(false);

  const [period, setPeriod] = useState("7d");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [summary, setSummary] = useState({
    total_visits: 0,
    unique_visitors: 0,
    countries: [],
    sources: [],
    browsers: [],
    daily: []
  });

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState({
    type: "",
    text: ""
  });

  const dailyMax = useMemo(() => {
    return getMaxValue(summary.daily);
  }, [summary.daily]);

  const countryMax = useMemo(() => {
    return getMaxValue(summary.countries);
  }, [summary.countries]);

  const countryStatsByMapId = useMemo(() => {
    const map = {};

    summary.countries.forEach((country) => {
      const code = country.code?.toUpperCase?.() || "";
      const mapId =
        COUNTRY_CODE_TO_MAP_ID[code] ||
        COUNTRY_NAME_TO_MAP_ID[country.name] ||
        "";

      if (mapId) {
        map[mapId] = country;
      }
    });

    return map;
  }, [summary.countries]);

  useEffect(() => {
    async function loadMap() {
      try {
        const response = await fetch(WORLD_MAP_URL);
        const worldData = await response.json();

        const countriesData = feature(
          worldData,
          worldData.objects.countries
        ).features;

        setMapCountries(countriesData);
      } catch (error) {
        console.error("Ошибка загрузки карты:", error);
      }
    }

    loadMap();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const params = {
        period
      };

      if (period === "custom") {
        params.date_from = dateFrom;
        params.date_to = dateTo;
      }

      const data = await getAnalyticsSummary(params);

      setSummary({
        total_visits: data.total_visits || 0,
        unique_visitors: data.unique_visitors || 0,
        countries: data.countries || [],
        sources: data.sources || [],
        browsers: data.browsers || [],
        daily: data.daily || []
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (period === "custom" && (!dateFrom || !dateTo)) {
      return;
    }

    loadAnalytics();
  }, [period]);

  function handleApplyCustomPeriod() {
    if (!dateFrom || !dateTo) {
      setMessage({
        type: "error",
        text: "Выберите дату начала и дату окончания"
      });

      return;
    }

    loadAnalytics();
  }

  function zoomIn() {
    setZoom((prev) => Math.min(prev + 0.2, 2.2));
  }

  function zoomOut() {
    setZoom((prev) => Math.max(prev - 0.2, 0.7));
  }

  function resetZoom() {
    setZoom(1);

    setPosition({
      x: 480,
      y: 300
    });
  }

  function handleMouseDown(event) {
    setDragging(true);

    setDragStart({
      x: event.clientX - position.x,
      y: event.clientY - position.y
    });
  }

  function handleMouseMove(event) {
    if (!dragging) {
      return;
    }

    setPosition({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y
    });
  }

  function handleMouseUp() {
    setDragging(false);
  }

  function handleMouseLeave() {
    setDragging(false);
  }

  function getCountryOpacity(countryValue) {
    if (!countryValue) {
      return 1;
    }

    const percent = countryValue / countryMax;

    if (percent >= 0.8) return 1;
    if (percent >= 0.5) return 0.85;
    if (percent >= 0.25) return 0.7;

    return 0.55;
  }

  const projection = geoNaturalEarth1()
    .scale(145 * zoom)
    .translate([position.x, position.y]);

  const pathGenerator = geoPath().projection(projection);

  return (
    <section className="analytics-page">
      <div className="analytics-card">
        <div className="analytics-header">
          <div>
            <h2>Аналитика посещений</h2>
            <p>
              Карта мира, страны, источники трафика, браузеры и динамика
              посещений сайта.
            </p>
          </div>

          <button
            className="button analytics-refresh-button"
            type="button"
            onClick={loadAnalytics}
            disabled={loading}
          >
            <FiRefreshCw />
            {loading ? "Обновление..." : "Обновить"}
          </button>
        </div>

        {message.text && (
          <p className={`form-message ${message.type}`}>{message.text}</p>
        )}

        <div className="analytics-periods">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              className={`analytics-period-button ${
                period === option.value ? "active" : ""
              }`}
              type="button"
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {period === "custom" && (
          <div className="analytics-custom-period">
            <label>
              С даты
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </label>

            <label>
              По дату
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </label>

            <button
              className="button analytics-apply-button"
              type="button"
              onClick={handleApplyCustomPeriod}
              disabled={loading}
            >
              Применить
            </button>
          </div>
        )}

        <div className="analytics-summary-grid">
          <div className="analytics-summary-card">
            <div>
              <span>Всего посещений</span>
              <strong>{summary.total_visits}</strong>
            </div>

            <FiBarChart2 />
          </div>

          <div className="analytics-summary-card">
            <div>
              <span>Уникальные пользователи</span>
              <strong>{summary.unique_visitors}</strong>
            </div>

            <FiUsers />
          </div>

          <div className="analytics-summary-card">
            <div>
              <span>Стран</span>
              <strong>{summary.countries.length}</strong>
            </div>

            <FiGlobe />
          </div>

          <div className="analytics-summary-card">
            <div>
              <span>Источников</span>
              <strong>{summary.sources.length}</strong>
            </div>

            <FiShare2 />
          </div>
        </div>

        <div className="analytics-main-grid">
          <div
            className={`analytics-map-wrapper ${dragging ? "dragging" : ""}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div className="map-zoom-controls">
              <button type="button" onClick={zoomOut}>
                −
              </button>

              <span>{Math.round(zoom * 100)}%</span>

              <button type="button" onClick={zoomIn}>
                +
              </button>

              <button type="button" className="map-reset" onClick={resetZoom}>
                Сбросить
              </button>
            </div>

            <svg
              viewBox="0 0 960 600"
              className="analytics-map-svg"
              role="img"
              aria-label="Карта мира"
            >
              {mapCountries.map((country) => {
                const countryId = String(country.id).padStart(3, "0");
                const countryStat = countryStatsByMapId[countryId];
                const visits = countryStat?.value || 0;

                return (
                  <path
                    key={country.id}
                    d={pathGenerator(country) || ""}
                    className={`analytics-map-country ${
                      visits > 0 ? "has-visits" : ""
                    }`}
                    style={{
                      opacity: getCountryOpacity(visits)
                    }}
                  >
                    <title>
                      {countryStat
                        ? `${countryStat.name}: ${countryStat.value}`
                        : country.properties?.name || "Страна"}
                    </title>
                  </path>
                );
              })}
            </svg>

            <div className="map-legend">
              <span className="legend-empty" />
              Нет данных
              <span className="legend-active" />
              Были посещения
            </div>
          </div>

          <div className="analytics-services">
            <button type="button" className="analytics-service-button">
              <SiGoogleanalytics />
              <span>Google Аналитика</span>
            </button>

            <button type="button" className="analytics-service-button">
              <span className="yandex-icon">Я</span>
              <span>Яндекс Метрика</span>
            </button>

            <button type="button" className="analytics-service-button">
              <SiMeta />
              <span>Facebook Pixel</span>
            </button>
          </div>
        </div>

        <div className="traffic-sources-card">
          <div className="traffic-sources-header">
            <div className="traffic-title-wrap">
              <h3>Источники трафика</h3>

              <button
                type="button"
                className="traffic-help-button"
                onClick={() => setShowTrafficHint((prev) => !prev)}
              >
                <FiHelpCircle />
              </button>
            </div>

            {showTrafficHint && (
              <div className="traffic-tooltip">
                Показывает, с каких сайтов или платформ приходит больше всего
                трафика: Direct, Instagram, Facebook, Discord, TikTok,
                WhatsApp, Viber, VK, LinkedIn, Google, Яндекс и другие.
              </div>
            )}
          </div>

          <p>
            Direct — если пользователь зашёл напрямую по ссылке. Остальные
            источники определяются по referrer и UTM-меткам.
          </p>
        </div>

        {loading ? (
          <p>Загрузка аналитики...</p>
        ) : (
          <>
            <div className="analytics-section">
              <div className="analytics-section-header">
                <h3>Динамика посещений</h3>
                <p>Посещения и уникальные пользователи по дням.</p>
              </div>

              {summary.daily.length === 0 ? (
                <p className="analytics-empty">Данных пока нет.</p>
              ) : (
                <div className="analytics-daily-chart">
                  {summary.daily.map((day) => (
                    <div className="analytics-day" key={day.date}>
                      <div className="analytics-day-bars">
                        <div
                          className="analytics-day-bar visits"
                          style={{
                            height: `${getPercent(day.visits, dailyMax)}%`
                          }}
                          title={`Посещения: ${day.visits}`}
                        />

                        <div
                          className="analytics-day-bar unique"
                          style={{
                            height: `${getPercent(
                              day.unique_visitors,
                              dailyMax
                            )}%`
                          }}
                          title={`Уникальные: ${day.unique_visitors}`}
                        />
                      </div>

                      <span>{day.date.slice(5)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="analytics-chart-legend">
                <span>
                  <i className="visits" />
                  Посещения
                </span>

                <span>
                  <i className="unique" />
                  Уникальные
                </span>
              </div>
            </div>

            <div className="analytics-grid">
              <AnalyticsMetricList
                title="Страны"
                icon={<FiGlobe />}
                items={summary.countries}
                emptyText="Откуда заходили пользователи."
              />

              <AnalyticsMetricList
                title="Источники трафика"
                icon={<FiShare2 />}
                items={summary.sources}
                emptyText="Direct, Instagram, Facebook, Discord, TikTok, WhatsApp и другие."
              />

              <AnalyticsMetricList
                title="Браузеры"
                icon={<FiChrome />}
                items={summary.browsers}
                emptyText="Google Chrome, Яндекс Браузер, Firefox, Safari и другие."
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default AnalyticsPage;