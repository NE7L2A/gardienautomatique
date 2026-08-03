export type EtatCapteur = "normal" | "alerte" | "danger";

export type NiveauAlerte = "info" | "warning" | "danger";

export type TypeCapteur =
  | "temperature"
  | "flamme"
  | "presence"
  | "humidite"
  | "gaz";

export type CanalAlerte = "sms" | "email" | "push";

export type PresenceValeur = "OUI" | "NON";

export interface Lecture {
  id: number;
  device_id: string;
  nom: string | null;
  timestamp: string;
  temperature: number | null;
  humidite: number | null;
  gaz_pourcent: number | null;
  presence: PresenceValeur | null;
}

export type FrequenceAlerte = "immediat" | "groupe";

export interface Capteur {
  id: string;
  nom: string;
  type: TypeCapteur;
  valeur: number | string;
  unite: string;
  etat: EtatCapteur;
  salle: string;
  derniereMiseAJour: string;
}

export interface ContactNotification {
  telephone: string;
  email: string;
}

export interface ParametresAlerte {
  seuilTemperatureCritique: number;
  detectionFlamme: boolean;
  frequence: FrequenceAlerte;
  canalFlamme: CanalAlerte;
  canalTemperature: CanalAlerte;
  canalPresence: CanalAlerte;
}

export interface Salle {
  id: string;
  nom: string;
  capteurs: Capteur[];
}

export interface PointTemperature {
  heure: string;
  temperature: number;
  salle: string;
  [key: string]: string | number;
}

export interface PointHumidite {
  heure: string;
  humidite: number;
  salle: string;
  [key: string]: string | number;
}

export interface PointGaz {
  heure: string;
  gaz: number;
  salle: string;
  [key: string]: string | number;
}

export interface EtatSalle {
  salle: string;
  temperature: number;
  alertes: number;
  capteurs: number;
}

export interface ParametresAlerteConfig {
  contact: ContactNotification;
  parametres: ParametresAlerte;
}

export interface Alerte {
  id: string;
  type: TypeCapteur;
  niveau: NiveauAlerte;
  canal: CanalAlerte;
  message: string;
  timestamp: string;
  lue: boolean;
  envoyee: boolean;
}

export interface ParametresNotification {
  activees: boolean;
  presences: boolean;
  temperatures: boolean;
  gaz: boolean;
  humidites: boolean;
  rapportsQuotidiens: boolean;
  email: string;
}

export interface ConfigAlertes {
  id?: number;
  email?: string | null;
  sms?: string | null;
  temp_min?: number | null;
  temp_max?: number | null;
  hum_min?: number | null;
  hum_max?: number | null;
  gaz_max?: number | null;
}

export type ThemeNom = "dark" | "light" | "nord";

export interface Utilisateur {
  id: string;
  email: string;
  telephone: string;
  nomDomicile: string;
  adresse: string;
  theme: ThemeNom;
}

export interface EtatApplication {
  premierLancement: boolean;
  inscriptionComplete: boolean;
  setupComplete: boolean;
  utilisateurConnecte: boolean;
}

export interface EvenementHistorique {
  id: string;
  type: TypeCapteur;
  niveau: NiveauAlerte;
  titre: string;
  description: string;
  timestamp: string;
}

export interface SeuilsCapteur {
  capteurId: string;
  temperatureMin?: number;
  temperatureMax?: number;
  humiditeMin?: number;
  humiditeMax?: number;
  gazMax?: number;
  presenceActive: boolean;
  flammeActive: boolean;
}

export interface DispositifInfos {
  idBD: string;
  nom: string;
}
