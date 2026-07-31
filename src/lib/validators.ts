export function validerEmail(email: string): string | null {
  if (!email.trim()) return "L'email est requis";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email.trim())) return "Format d'email invalide (ex: user@domain.com)";
  return null;
}

export function validerTelephone(tel: string): string | null {
  if (!tel.trim()) return "Le numéro est requis";
  const nettoye = tel.replace(/[\s\-]/g, "");
  if (!nettoye.startsWith("+")) return "Le numéro doit commencer par + (indicatif pays)";
  const chiffres = nettoye.slice(1);
  if (!/^\d+$/.test(chiffres)) return "Le numéro ne doit contenir que des chiffres après le +";
  if (chiffres.length < 8) return "Le numéro doit contenir au moins 8 chiffres après l'indicatif";
  return null;
}
