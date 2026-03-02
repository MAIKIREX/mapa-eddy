export function normalizeMacroName(input: string | null | undefined): string | null {
  if (input == null) {
    return null;
  }

  const value = input
    .trim()
    .toUpperCase()
    .replace(/^MACRODISTRITO\s*/i, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

  return value.length > 0 ? value : null;
}

export function parseCoord(input: unknown): number | null {
  if (input == null) {
    return null;
  }

  const raw = String(input).trim();
  if (raw.length === 0) {
    return null;
  }

  const parsed = Number(raw.replace(/,/g, "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeText(input: unknown): string | null {
  if (input == null) {
    return null;
  }

  const value = String(input).trim();
  return value.length > 0 ? value : null;
}
