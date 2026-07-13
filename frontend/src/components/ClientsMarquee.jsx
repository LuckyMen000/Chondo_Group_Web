import { useEffect, useState } from "react";

import { getClientLogos } from "../api/clientLogos";


function ClientsMarquee() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogos() {
      try {
        const data = await getClientLogos();

        if (Array.isArray(data)) {
          setClients(
            data.map((logo) => ({
              id: logo.id,
              name: logo.name,
              logo: logo.image_url,
            }))
          );
        }
      } catch (error) {
        console.error("Ошибка загрузки логотипов:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLogos();
  }, []);

  if (loading) {
    return null;
  }

  if (!clients.length) {
    return null;
  }

  const duplicatedClients = [...clients, ...clients, ...clients];

  return (
    <section
      className="clients-marquee"
      aria-label="Компании, с которыми мы работали"
    >
      <div className="clients-marquee__track">
        {duplicatedClients.map((client, index) => (
          <div
            className="clients-marquee__item"
            key={`${client.id}-${index}`}
          >
            <img
              src={client.logo}
              alt={client.name}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default ClientsMarquee;