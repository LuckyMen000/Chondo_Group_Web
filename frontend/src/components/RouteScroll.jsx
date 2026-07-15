import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function RouteScroll() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const timer = window.setTimeout(() => {
        const target = document.querySelector(location.hash);

        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 0);

      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0, behavior: "auto" });
    return undefined;
  }, [location.pathname, location.hash]);

  return null;
}

export default RouteScroll;
