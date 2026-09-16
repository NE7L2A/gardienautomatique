const ROUTES = [
  {
    methode: "POST",
    route: "/api/mesures",
    description:
      "Enregistrer une mesure d'un dispositif (body : device_id requis + temperature, humidite, gaz_pourcent, presence OUI/NON).",
  },
  {
    methode: "GET",
    route: "/api/mesures",
    description:
      "Lire les relevés (filtres : device_id, from, to, limit — défaut 500, max 2000).",
  },
  {
    methode: "GET",
    route: "/api/capteurs",
    description:
      "Dernière mesure brute de chaque dispositif (état actuel du dashboard).",
  },
  {
    methode: "GET",
    route: "/api/dispositifs",
    description: "Liste des dispositifs (device_id distincts + dernier nom).",
  },
  {
    methode: "GET",
    route: "/api/alert-config",
    description: "Lire la configuration d'alerte (email, sms, temp_min, temp_max, gaz_max).",
  },
  {
    methode: "PUT",
    route: "/api/alert-config",
    description: "Mettre à jour la configuration d'alerte (champs partiels acceptés).",
  },
  {
    methode: "POST",
    route: "/api/notifications/envoyer",
    description:
      "Envoyer un email d'alerte (body : email, titre, message). Destinataire par défaut : alert_config.email.",
  },
  {
    methode: "GET",
    route: "/api/sante",
    description: "Vérification de disponibilité et de la connexion à la base.",
  },
];

export default function Accueil() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          margin: "0 0 0.25rem",
          color: "#ffffff",
        }}
      >
        EYESHOME — API
      </h1>
      <p style={{ margin: "0 0 1.5rem", color: "#94a3b8", fontSize: "0.9rem" }}>
        Backend des données capteurs (PostgreSQL sur Render).
      </p>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.85rem",
        }}
      >
        <thead>
          <tr style={{ textAlign: "left", color: "#94a3b8" }}>
            <th style={{ padding: "0.5rem", borderBottom: "1px solid #334155" }}>Méthode</th>
            <th style={{ padding: "0.5rem", borderBottom: "1px solid #334155" }}>Route</th>
            <th style={{ padding: "0.5rem", borderBottom: "1px solid #334155" }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {ROUTES.map((r) => (
            <tr key={`${r.methode}-${r.route}`}>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #1e293b" }}>
                <span
                  style={{
                    background: r.methode === "GET" ? "#2979ff22" : "#00c85322",
                    color: r.methode === "GET" ? "#90caf9" : "#69f0ae",
                    padding: "0.15rem 0.5rem",
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                >
                  {r.methode}
                </span>
              </td>
              <td
                style={{
                  padding: "0.5rem",
                  borderBottom: "1px solid #1e293b",
                  color: "#ffffff",
                  fontFamily: "monospace",
                }}
              >
                {r.route}
              </td>
              <td
                style={{
                  padding: "0.5rem",
                  borderBottom: "1px solid #1e293b",
                  color: "#94a3b8",
                }}
              >
                {r.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
