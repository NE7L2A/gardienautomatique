import type {
  ParametresNotification,
  Utilisateur,
  EtatApplication,
  ThemeNom,
  Capteur,
  ParametresAlerte,
  ContactNotification,
  SeuilsCapteur,
  DispositifInfos,
} from "@/types";
import {
  parametresNotificationDefaut,
  parametresAlerteDefaut,
} from "./mock-data";

const CLES = {
  UTILISATEUR: "protecteur_utilisateur",
  NOTIFICATIONS: "protecteur_notifications",
  ETAT_APP: "protecteur_etat_app",
  THEME: "protecteur_theme",
  CAPTEURS_AJOUTES: "protecteur_capteurs_ajoutes",
  COMPTEUR_CAPTEURS: "protecteur_compteur_capteurs",
  ALERTE_PARAMETRES: "protecteur_alerte_parametres",
  ALERTE_CONTACT: "protecteur_alerte_contact",
  SEUILS_CAPTEURS: "protecteur_seuils_capteurs",
  DISPOSITIFS_SUPPRIMES: "protecteur_dispositifs_supprimes",
  DISPOSITIFS_INFOS: "protecteur_dispositifs_infos",
} as const;

export function getUtilisateur(): Utilisateur | null {
  if (typeof window === "undefined") return null;
  const donnees = localStorage.getItem(CLES.UTILISATEUR);
  return donnees ? JSON.parse(donnees) : null;
}

export function sauvegarderUtilisateur(utilisateur: Utilisateur): void {
  localStorage.setItem(CLES.UTILISATEUR, JSON.stringify(utilisateur));
}

export function getParametresNotification(): ParametresNotification {
  if (typeof window === "undefined") return parametresNotificationDefaut;
  const donnees = localStorage.getItem(CLES.NOTIFICATIONS);
  return donnees ? JSON.parse(donnees) : parametresNotificationDefaut;
}

export function sauvegarderParametresNotification(
  params: ParametresNotification
): void {
  localStorage.setItem(CLES.NOTIFICATIONS, JSON.stringify(params));
}

export function getEtatApplication(): EtatApplication {
  if (typeof window === "undefined") {
    return {
      premierLancement: true,
      inscriptionComplete: false,
      setupComplete: false,
      utilisateurConnecte: false,
    };
  }
  const donnees = localStorage.getItem(CLES.ETAT_APP);
  return donnees
    ? JSON.parse(donnees)
    : {
        premierLancement: true,
        inscriptionComplete: false,
        setupComplete: false,
        utilisateurConnecte: false,
      };
}

export function sauvegarderEtatApplication(etat: EtatApplication): void {
  localStorage.setItem(CLES.ETAT_APP, JSON.stringify(etat));
}

export function deconnecter(): void {
  const etat = getEtatApplication();
  etat.utilisateurConnecte = false;
  sauvegarderEtatApplication(etat);
}

export function getTheme(): ThemeNom {
  if (typeof window === "undefined") return "dark";
  const donnees = localStorage.getItem(CLES.THEME);
  return donnees ? JSON.parse(donnees) : "dark";
}

export function sauvegarderTheme(theme: ThemeNom): void {
  localStorage.setItem(CLES.THEME, JSON.stringify(theme));
}

export function getCapteursAjoutes(): Capteur[] {
  if (typeof window === "undefined") return [];
  const donnees = localStorage.getItem(CLES.CAPTEURS_AJOUTES);
  return donnees ? JSON.parse(donnees) : [];
}

export function sauvegarderCapteursAjoutes(capteurs: Capteur[]): void {
  localStorage.setItem(CLES.CAPTEURS_AJOUTES, JSON.stringify(capteurs));
}

export function supprimerCapteur(id: string): void {
  const capteurs = getCapteursAjoutes();
  const filtres = capteurs.filter((c) => c.id !== id);
  sauvegarderCapteursAjoutes(filtres);
}

export function baseIdCapteur(id: string): string {
  return id.replace(/_(hum|gaz|pres)$/, "");
}

export function getDispositifsSupprimes(): string[] {
  if (typeof window === "undefined") return [];
  const donnees = localStorage.getItem(CLES.DISPOSITIFS_SUPPRIMES);
  return donnees ? JSON.parse(donnees) : [];
}

function sauvegarderDispositifsSupprimes(ids: string[]): void {
  localStorage.setItem(CLES.DISPOSITIFS_SUPPRIMES, JSON.stringify(ids));
}

export function supprimerDispositif(baseId: string): void {
  const capteurs = getCapteursAjoutes();
  const filtres = capteurs.filter((c) => baseIdCapteur(c.id) !== baseId);
  sauvegarderCapteursAjoutes(filtres);

  const supprimes = getDispositifsSupprimes();
  if (!supprimes.includes(baseId)) {
    sauvegarderDispositifsSupprimes([...supprimes, baseId]);
  }
}

export function genererIdCapteur(): string {
  if (typeof window === "undefined") return "capteur_01";
  const compteur = parseInt(
    localStorage.getItem(CLES.COMPTEUR_CAPTEURS) || "0",
    10
  );
  const nouveauCompteur = compteur + 1;
  localStorage.setItem(CLES.COMPTEUR_CAPTEURS, String(nouveauCompteur));
  return `capteur_${String(nouveauCompteur).padStart(2, "0")}`;
}

export function getParametresAlerte(): ParametresAlerte {
  if (typeof window === "undefined") return parametresAlerteDefaut;
  const donnees = localStorage.getItem(CLES.ALERTE_PARAMETRES);
  return donnees ? JSON.parse(donnees) : parametresAlerteDefaut;
}

export function sauvegarderParametresAlerte(params: ParametresAlerte): void {
  localStorage.setItem(CLES.ALERTE_PARAMETRES, JSON.stringify(params));
}

export function getContactNotification(): ContactNotification {
  if (typeof window === "undefined") return { telephone: "", email: "" };
  const donnees = localStorage.getItem(CLES.ALERTE_CONTACT);
  return donnees ? JSON.parse(donnees) : { telephone: "", email: "" };
}

export function sauvegarderContactNotification(contact: ContactNotification): void {
  localStorage.setItem(CLES.ALERTE_CONTACT, JSON.stringify(contact));
}

export function getSeuilsCapteur(id: string): SeuilsCapteur | null {
  if (typeof window === "undefined") return null;
  const donnees = localStorage.getItem(CLES.SEUILS_CAPTEURS);
  if (!donnees) return null;
  const tous: SeuilsCapteur[] = JSON.parse(donnees);
  return tous.find((s) => s.capteurId === id) || null;
}

export function sauvegarderSeuilsCapteur(seuils: SeuilsCapteur): void {
  if (typeof window === "undefined") return;
  const donnees = localStorage.getItem(CLES.SEUILS_CAPTEURS);
  const tous: SeuilsCapteur[] = donnees ? JSON.parse(donnees) : [];
  const index = tous.findIndex((s) => s.capteurId === seuils.capteurId);
  if (index >= 0) {
    tous[index] = seuils;
  } else {
    tous.push(seuils);
  }
  localStorage.setItem(CLES.SEUILS_CAPTEURS, JSON.stringify(tous));
}

export function getDispositifInfos(baseId: string): DispositifInfos | null {
  if (typeof window === "undefined") return null;
  const donnees = localStorage.getItem(CLES.DISPOSITIFS_INFOS);
  if (!donnees) return null;
  const tous: Record<string, DispositifInfos> = JSON.parse(donnees);
  return tous[baseId] || null;
}

export function sauvegarderDispositifInfos(
  baseId: string,
  infos: DispositifInfos
): void {
  if (typeof window === "undefined") return;
  const donnees = localStorage.getItem(CLES.DISPOSITIFS_INFOS);
  const tous: Record<string, DispositifInfos> = donnees
    ? JSON.parse(donnees)
    : {};
  tous[baseId] = infos;
  localStorage.setItem(CLES.DISPOSITIFS_INFOS, JSON.stringify(tous));
}
