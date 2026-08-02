import { CATEGORIES } from "./config";

export function matchesCategory(title: string, categoryKey: string): boolean {
  const cfg = CATEGORIES[categoryKey];
  const t = title.toLowerCase();
  if (cfg.exclude.some((bad) => t.includes(bad))) return false;
  if (cfg.mustIncludeAny.length && !cfg.mustIncludeAny.some((kw) => t.includes(kw))) return false;
  return true;
}

function parsePosted(posted: string | undefined | null): Date | null {
  if (!posted) return null;
  const trimmed = posted.trim();

  // RFC 822 / ISO — Date.parse handles both reasonably well in Node
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return parsed;

  // Unix timestamp as string
  const ts = parseFloat(trimmed);
  if (!isNaN(ts)) return new Date(ts * 1000);

  return null;
}

export function recencyBonus(posted: string | undefined | null): number {
  const dt = parsePosted(posted);
  if (!dt) return 0;
  let ageDays = (Date.now() - dt.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays < 0) ageDays = 0;
  if (ageDays >= 14) return 0;
  return Math.round(6 * (1 - ageDays / 14));
}

export function scoreListing(title: string, categoryKey: string, posted?: string | null): number {
  const cfg = CATEGORIES[categoryKey];
  const t = title.toLowerCase();
  let score = 0;
  for (const kw of cfg.mustIncludeAny) if (t.includes(kw)) score += 3;
  for (const kw of cfg.levelInclude) if (t.includes(kw)) score += 5;
  score += recencyBonus(posted);
  return score;
}
