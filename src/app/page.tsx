"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Navigation from "@/components/ui/Navigation";
import Semaphore from "@/components/dashboard/Semaphore";
import CarteCapteur from "@/components/dashboard/CarteCapteur";
import { alertesRecentes } from "@/lib/mock-data";
import { supprimerDispositif, getSeuilsCapteur } from "@/lib/store";
import {
  construireDispositifs,
  grouperDispositifs,
  capteursDisponibles,
  getDeviceIdBd,
  type Dispositif,
} from "@/lib/dispositifs";
import {
  obtenirCapteurs,
  obtenirMesures,
  estPresenceActive,
} from "@/lib/api";
import type {
  EtatCapteur,
  Lecture,
  PointTemperature,
  PointHumidite,
  PointGaz,
} from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HistoriqueDispositif {
  temperature?: PointTemperature[];
  humidite?: PointHumidite[];
  gaz?: PointGaz[];
  presence?: { heure: string; actif: boolean }[];
}

const DUREE_BLOC_PRESENCE = 3 * 60 * 1000;
const NOMBRE_BLOCS_PRESENCE = 120;

const tooltipStyle = {
  backgroundColor: "#243447",
  border: "1px solid #334155",
  borderRadius: 8,
  fontSize: 12,
  color: "#FFFFFF",
};

type ValeurOutil = number | string | ReadonlyArray<number | string>;

const formatterPourcent = (v: ValeurOutil | undefined): string => `${v}%`;

function formaterHeure(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function construireBlocsPresence(
  lectures: Lecture[]
): { heure: string; actif: boolean }[] {
  const maintenant = Date.now();
  const debut = maintenant - NOMBRE_BLOCS_PRESENCE * DUREE_BLOC_PRESENCE;
  const blocs = Array.from({ length: NOMBRE_BLOCS_PRESENCE }, (_, i) => ({
    heure: new Date(debut + i * DUREE_BLOC_PRESENCE).toLocaleTimeString(
      "fr-FR",
      { hour: "2-digit", minute: "2-digit" }
    ),
    actif: false,
  }));
  for (const lecture of lectures) {
    if (!lecture.presence) continue;
    const t = new Date(lecture.timestamp).getTime();
    if (t < debut || t > maintenant) continue;
    const index = Math.floor((t - debut) / DUREE_BLOC_PRESENCE);
    const i = Math.min(Math.max(index, 0), NOMBRE_BLOCS_PRESENCE - 1);
    if (estPresenceActive(lecture.presence)) blocs[i].actif = true;
  }
  return blocs;
}

function construireHistorique(
  lectures24: Lecture[],
  lectures6: Lecture[]
): HistoriqueDispositif {
  const triees = [...lectures24].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const result: HistoriqueDispositif = {};

  const temperature = triees
    .filter((l) => l.temperature !== null)
    .map((l) => ({
      heure: formaterHeure(l.timestamp),
      temperature: l.temperature as number,
      salle: "",
    }));
  if (temperature.length > 0) result.temperature = temperature;

  const humidite = triees
    .filter((l) => l.humidite !== null)
    .map((l) => ({
      heure: formaterHeure(l.timestamp),
      humidite: l.humidite as number,
      salle: "",
    }));
  if (humidite.length > 0) result.humidite = humidite;

  const gaz = triees
    .filter((l) => l.gaz_pourcent !== null)
    .map((l) => ({
      heure: formaterHeure(l.timestamp),
      gaz: l.gaz_pourcent as number,
      salle: "",
    }));
  if (gaz.length > 0) result.gaz = gaz;

  result.presence = construireBlocsPresence(lectures6);
  return result;
}

function appliquerLectures(
  dispositifs: Dispositif[],
  lectures: Lecture[]
): Dispositif[] {
  const parDevice = new Map<string, Lecture>();
  for (const lecture of lectures) parDevice.set(lecture.device_id, lecture);

  return dispositifs.map((dispositif) => {
    const idBD = getDeviceIdBd(dispositif.baseId);
    const lecture = idBD ? parDevice.get(idBD) : undefined;
    if (!lecture) return dispositif;

    const seuils = getSeuilsCapteur(dispositif.baseId);
    const tempMax = seuils?.temperatureMax ?? 28;
    const tempMin = seuils?.temperatureMin ?? 18;
    const humMax = seuils?.humiditeMax ?? 80;
    const humMin = seuils?.humiditeMin ?? 20;
    const gazMax = seuils?.gazMax ?? 60;

    return {
      ...dispositif,
      capteurs: dispositif.capteurs.map((c) => {
        if (c.type === "temperature" && lecture.temperature !== null) {
          const v = lecture.temperature;
          const etat: EtatCapteur =
            v > tempMax ? "danger" : v > tempMax - 1 || v < tempMin ? "alerte" : "normal";
          return { ...c, valeur: v, etat, derniereMiseAJour: lecture.timestamp };
        }
        if (c.type === "humidite" && lecture.humidite !== null) {
          const v = lecture.humidite;
          const etat: EtatCapteur =
            v > humMax || v < humMin
              ? "danger"
              : v > humMax - 5 || v < humMin + 5
              ? "alerte"
              : "normal";
          return { ...c, valeur: v, etat, derniereMiseAJour: lecture.timestamp };
        }
        if (c.type === "gaz" && lecture.gaz_pourcent !== null) {
          const v = lecture.gaz_pourcent;
          const etat: EtatCapteur =
            v > gazMax ? "danger" : v > gazMax - 10 ? "alerte" : "normal";
          return { ...c, valeur: v, etat, derniereMiseAJour: lecture.timestamp };
        }
        if (c.type === "presence" && lecture.presence) {
          const actif = estPresenceActive(lecture.presence);
          return {
            ...c,
            valeur: actif ? "Détecté" : "Sécurisé",
            etat: actif ? "alerte" : "normal",
            derniereMiseAJour: lecture.timestamp,
          };
        }
        return c;
      }),
    };
  });
}

type Ecouteur = () => void;

let snapshot: Dispositif[] | null = null;
let snapshotServeur: Dispositif[] | null = null;
const ecouteurs = new Set<Ecouteur>();

function lireSnapshot(): Dispositif[] {
  if (snapshot === null) snapshot = construireDispositifs();
  return snapshot;
}

function lireSnapshotServeur(): Dispositif[] {
  if (snapshotServeur === null)
    snapshotServeur = grouperDispositifs(capteursDisponibles(), []);
  return snapshotServeur;
}

function publier(nouveau: Dispositif[]): void {
  snapshot = nouveau;
  ecouteurs.forEach((fn) => fn());
}

function actualiserDepuisStockage(): void {
  publier(construireDispositifs());
}

function souscrire(onChange: Ecouteur): () => void {
  ecouteurs.add(onChange);
  return () => {
    ecouteurs.delete(onChange);
  };
}

interface GraphiqueProps {
  titre: string;
  sousTitre: string;
  data: ReadonlyArray<Record<string, unknown>>;
  dataKey: string;
  couleur: string;
  domaine: [string | number, string | number];
  formatter?: (v: ValeurOutil | undefined) => string;
}

function Graphique({
  titre,
  sousTitre,
  data,
  dataKey,
  couleur,
  domaine,
  formatter,
}: GraphiqueProps) {
  return (
    <div className="bg-[#243447] rounded-xl p-4 border border-[#334155]">
      <h3 className="text-white font-bold text-sm mb-1">{titre}</h3>
      <p className="text-[#64748B] text-xs mb-3">{sousTitre}</p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="heure" tick={{ fontSize: 10, fill: "#64748B" }} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: "#64748B" }} domain={domaine} width={40} tickFormatter={formatter} />
            <Tooltip contentStyle={tooltipStyle} formatter={formatter} />
            <Line type="monotone" dataKey={dataKey} stroke={couleur} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BlocsPresence({
  donnees,
  nomDispositif,
}: {
  donnees: { heure: string; actif: boolean }[];
  nomDispositif: string;
}) {
  const actifs = donnees.filter((p) => p.actif).length;
  return (
    <div className="bg-[#243447] rounded-xl p-4 border border-[#334155]">
      <h3 className="text-white font-bold text-sm mb-1">Présence — 6h</h3>
      <p className="text-[#64748B] text-xs mb-3">
        {actifs} blocs actifs sur {donnees.length} — {nomDispositif}
      </p>
      <div className="flex flex-wrap gap-1">
        {donnees.map((p, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-sm ${
              p.actif ? "bg-[#FF9900] shadow-[0_0_6px_rgba(255,153,0,0.5)]" : "bg-[#334155]"
            }`}
            title={`${p.heure} — ${p.actif ? "Présence détectée" : "Aucun mouvement"}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#FF9900]" />
          <span className="text-[10px] text-[#94A3B8]">Détecté</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#334155]" />
          <span className="text-[10px] text-[#94A3B8]">Aucun mouvement</span>
        </div>
        <span className="text-[10px] text-[#64748B] ml-auto">Chaque bloc = 3 min</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const dispositifs = useSyncExternalStore(
    souscrire,
    lireSnapshot,
    lireSnapshotServeur
  );
  const [selection, setSelection] = useState<string>("tous");
  const [horsLigne, setHorsLigne] = useState(false);
  const [historiques, setHistoriques] = useState<
    Record<string, HistoriqueDispositif>
  >({});

  const cleDispositifs = dispositifs
    .map((d) => `${d.baseId}:${getDeviceIdBd(d.baseId) ?? ""}`)
    .join("|");

  async function rafraichirValeurs() {
    const lectures = await obtenirCapteurs();
    if (!lectures) {
      setHorsLigne(true);
      return;
    }
    setHorsLigne(false);
    publier(appliquerLectures(lireSnapshot(), lectures));
  }

  async function rafraichirHistorique() {
    const courants = lireSnapshot();
    const maintenant = new Date().toISOString();
    const debut24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const debut6h = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const result: Record<string, HistoriqueDispositif> = {};
    for (const d of courants) {
      const idBD = getDeviceIdBd(d.baseId);
      if (!idBD) continue;
      const [r24, r6] = await Promise.all([
        obtenirMesures({
          device_id: idBD,
          from: debut24h,
          to: maintenant,
          limit: 2000,
        }),
        obtenirMesures({
          device_id: idBD,
          from: debut6h,
          to: maintenant,
          limit: 2000,
        }),
      ]);
      if (r24) result[d.baseId] = construireHistorique(r24, r6 ?? []);
    }
    setHistoriques(result);
  }

  useEffect(() => {
    actualiserDepuisStockage();
    setTimeout(rafraichirValeurs, 0);
    setTimeout(rafraichirHistorique, 0);
    const intervalValeurs = setInterval(rafraichirValeurs, 5000);
    const intervalHistorique = setInterval(rafraichirHistorique, 60000);
    return () => {
      clearInterval(intervalValeurs);
      clearInterval(intervalHistorique);
    };
  }, []);

  useEffect(() => {
    setTimeout(rafraichirHistorique, 0);
  }, [cleDispositifs]);

  const dispositifsVisibles =
    selection === "tous"
      ? dispositifs
      : dispositifs.filter((d) => d.baseId === selection);

  const capteursVisibles = dispositifsVisibles.flatMap((d) => d.capteurs);

  const etatGlobal: EtatCapteur = capteursVisibles.some(
    (c) => c.etat === "danger"
  )
    ? "danger"
    : capteursVisibles.some((c) => c.etat === "alerte")
    ? "alerte"
    : "normal";

  const gererSuppression = (dispositif: Dispositif) => {
    if (
      !window.confirm(
        `Supprimer le dispositif « ${dispositif.nom} » ? Toutes ses données seront retirées de la page.`
      )
    )
      return;
    supprimerDispositif(dispositif.baseId);
    actualiserDepuisStockage();
    if (selection === dispositif.baseId) setSelection("tous");
  };

  return (
    <div className="min-h-screen bg-[#1A2332] pb-24">
      <Header />

      <main className="px-5 py-5 space-y-5">
        {dispositifs.length > 0 && (
          <select
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
            aria-label="Choisir un dispositif"
            className="w-full bg-[#243447] text-white rounded-xl px-4 py-3 text-sm border border-[#334155] focus:outline-none focus:border-[#FF9900]"
          >
            <option value="tous" className="bg-[#243447]">
              Tous
            </option>
            {dispositifs.map((d) => (
              <option key={d.baseId} value={d.baseId} className="bg-[#243447]">
                {d.nom}
              </option>
            ))}
          </select>
        )}

        {horsLigne && (
          <div className="bg-[#FF1744]/10 border border-[#FF1744]/25 rounded-xl p-3">
            <p className="text-[#FF1744] text-xs font-semibold">
              Backend hors ligne — dernières données affichées
            </p>
          </div>
        )}

        <div className="flex justify-center py-4">
          <Semaphore
            etat={etatGlobal}
            label={
              etatGlobal === "normal"
                ? "Tout est sécurisé"
                : etatGlobal === "alerte"
                ? "Vigilance requise"
                : "Alerte active"
            }
          />
        </div>

        {alertesRecentes.filter((a) => !a.lue).length > 0 && (
          <div className="bg-[#FF9900]/8 border border-[#FF9900]/20 rounded-xl p-3">
            <p className="text-[#FF9900] text-xs font-semibold mb-1 uppercase tracking-wider">
              Alertes récentes
            </p>
            {alertesRecentes
              .filter((a) => !a.lue)
              .slice(0, 2)
              .map((alerte) => (
                <p key={alerte.id} className="text-white text-sm">
                  {alerte.message}
                </p>
              ))}
          </div>
        )}

        {dispositifsVisibles.map((dispositif) => {
          const hist = historiques[dispositif.baseId];
          const idBD = getDeviceIdBd(dispositif.baseId);
          return (
            <section key={dispositif.baseId} className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-white font-bold text-lg">
                    {dispositif.nom}
                  </h2>
                  <p className="text-[#64748B] text-xs">
                    {dispositif.capteurs.length} mesure(s) en temps réel
                    {idBD ? ` · ${idBD}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/modifier-dispositif?id=${dispositif.baseId}`}
                    aria-label={`Modifier ${dispositif.nom}`}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#2979FF]/10 border border-[#2979FF]/20 text-[#2979FF] transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => gererSuppression(dispositif)}
                    aria-label={`Supprimer ${dispositif.nom}`}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FF1744]/10 border border-[#FF1744]/20 text-[#FF1744] transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {dispositif.capteurs.map((capteur) => (
                  <CarteCapteur key={capteur.id} capteur={capteur} />
                ))}
              </div>

              {!idBD && (
                <div className="bg-[#243447] rounded-xl p-4 border border-[#334155]">
                  <p className="text-[#94A3B8] text-xs">
                    En attente de données — renseignez l&apos;ID de la base de
                    données via « Modifier ».
                  </p>
                </div>
              )}

              {hist?.temperature && (
                <Graphique
                  titre="Température — 24h"
                  sousTitre={`Évolution ${dispositif.nom}`}
                  data={hist.temperature}
                  dataKey="temperature"
                  couleur="#FF9900"
                  domaine={["dataMin - 2", "dataMax + 2"]}
                />
              )}

              {hist?.humidite && (
                <Graphique
                  titre="Humidité — 24h"
                  sousTitre={`Taux d'humidité ${dispositif.nom}`}
                  data={hist.humidite}
                  dataKey="humidite"
                  couleur="#2979FF"
                  domaine={[0, 100]}
                  formatter={formatterPourcent}
                />
              )}

              {hist?.gaz && (
                <Graphique
                  titre="Gaz — 24h"
                  sousTitre={`Concentration (%) ${dispositif.nom}`}
                  data={hist.gaz}
                  dataKey="gaz"
                  couleur="#FF5722"
                  domaine={[0, "dataMax + 20"]}
                  formatter={formatterPourcent}
                />
              )}

              {hist?.presence && (
                <BlocsPresence
                  donnees={hist.presence}
                  nomDispositif={dispositif.nom}
                />
              )}
            </section>
          );
        })}

        {dispositifsVisibles.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <p className="text-[#64748B] text-sm">
              Aucun dispositif à afficher.
            </p>
            <Link
              href="/ajouter-capteur"
              className="inline-block bg-[#FF9900] text-[#232F3E] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#E88B00] transition-colors"
            >
              Ajouter un dispositif
            </Link>
          </div>
        )}

        {dispositifs.length > 0 && (
          <Link
            href="/ajouter-capteur"
            className="flex items-center justify-center gap-2 bg-[#FF9900] text-[#232F3E] py-3 rounded-xl text-sm font-bold hover:bg-[#E88B00] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un dispositif
          </Link>
        )}

        <p className="text-[#64748B] text-xs text-center pt-2">
          Mise à jour en temps réel
        </p>
      </main>

      <Navigation />
    </div>
  );
}
