import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { trackVisit } from "../api/analytics";

function createId(prefix) {
  if (window.crypto?.randomUUID) {
    return `${prefix}_${window.crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getOrCreateVisitorId() {
  const key = "analytics_visitor_id";
  let visitorId = localStorage.getItem(key);

  if (!visitorId) {
    visitorId = createId("visitor");
    localStorage.setItem(key, visitorId);
  }

  return visitorId;
}

function getOrCreateSessionId() {
  const key = "analytics_session_id";
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = createId("session");
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

function shouldSkipTracking(pathname) {
  return pathname.startsWith("/admin");
}

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (shouldSkipTracking(location.pathname)) {
      return;
    }

    const fullPath = `${location.pathname}${location.search}`;
    const lastTrackKey = "analytics_last_track";
    const lastTrackRaw = sessionStorage.getItem(lastTrackKey);

    if (lastTrackRaw) {
      try {
        const lastTrack = JSON.parse(lastTrackRaw);

        const isSamePath = lastTrack.path === fullPath;
        const isRecent = Date.now() - lastTrack.time < 30000;

        if (isSamePath && isRecent) {
          return;
        }
      } catch (error) {
        sessionStorage.removeItem(lastTrackKey);
      }
    }

    const payload = {
      visitor_id: getOrCreateVisitorId(),
      session_id: getOrCreateSessionId(),
      path: fullPath,
      referrer: document.referrer || "",
      language: navigator.language || "",
      screen_width: window.screen?.width || null,
      screen_height: window.screen?.height || null
    };

    trackVisit(payload).catch((error) => {
      console.error("Ошибка отправки аналитики:", error);
    });

    sessionStorage.setItem(
      lastTrackKey,
      JSON.stringify({
        path: fullPath,
        time: Date.now()
      })
    );
  }, [location.pathname, location.search]);

  return null;
}

export default AnalyticsTracker;