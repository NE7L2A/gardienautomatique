import { sallesDefaut, libelleTypeCapteur } from "./mock-data";
import {
  getCapteursAjoutes,
  getDispositifsSupprimes,
  getDispositifInfos,
  baseIdCapteur,
} from "./store";
import type { Capteur } from "@/types";

export interface Dispositif {
  baseId: string;
  nom: string;
  capteurs: Capteur[];
}

export function capteursDisponibles(): Capteur[] {
  return [...sallesDefaut.flatMap((s) => s.capteurs), ...getCapteursAjoutes()];
}

export function grouperDispositifs(
  capteurs: Capteur[],
  supprimes: string[]
): Dispositif[] {
  const groupes = new Map<string, Capteur[]>();
  for (const capteur of capteurs) {
    const baseId = baseIdCapteur(capteur.id);
    if (supprimes.includes(baseId)) continue;
    const liste = groupes.get(baseId);
    if (liste) {
      if (!liste.some((c) => c.id === capteur.id)) liste.push(capteur);
    } else {
      groupes.set(baseId, [capteur]);
    }
  }
  return Array.from(groupes.entries()).map(([baseId, liste]) => {
    const reference = liste.find((c) => c.id === baseId) ?? liste[0];
    const infos = getDispositifInfos(baseId);
    const override = infos?.nom.trim();
    const nom = override || reference.nom.replace(/\s*—\s*.+$/, "").trim();
    const capteurs = override
      ? liste.map((c) => {
          const libelle = libelleTypeCapteur[c.type];
          return {
            ...c,
            nom: libelle ? `${override} — ${libelle}` : override,
          };
        })
      : liste;
    return { baseId, nom, capteurs };
  });
}

export function construireDispositifs(): Dispositif[] {
  return grouperDispositifs(capteursDisponibles(), getDispositifsSupprimes());
}

export function getDispositifParId(baseId: string): Dispositif | null {
  return construireDispositifs().find((d) => d.baseId === baseId) ?? null;
}

export const ID_BD_SALLE_TEST = "ESP32_001";

export function getDeviceIdBd(baseId: string): string | null {
  const infos = getDispositifInfos(baseId);
  const idBD = infos?.idBD?.trim();
  if (idBD) return idBD;
  if (baseId === "capteur_00") return ID_BD_SALLE_TEST;
  return null;
}
