import { normalizeMacroName, normalizeText, parseCoord } from "@/features/encuesta/lib/normalize";
import type {
  EncuestaDataset,
  Hoja1Row,
  MacrodistritosGeoJSON,
  ParaMapaRow,
} from "@/features/encuesta/types";

function parseCsvText(text: string): Record<string, unknown>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === "\"") {
      if (inQuotes && text[i + 1] === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i += 1;
      }

      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  const headerRowIndex = rows.findIndex((record) =>
    record.some((cell) => normalizeText(cell) !== null),
  );
  if (headerRowIndex < 0) {
    return [];
  }

  const headers = rows[headerRowIndex];
  const output: Record<string, unknown>[] = [];

  for (const record of rows.slice(headerRowIndex + 1)) {
    if (record.every((cell) => normalizeText(cell) === null)) {
      continue;
    }

    const parsedRow: Record<string, unknown> = {};

    headers.forEach((header, idx) => {
      parsedRow[header] = record[idx] ?? "";
    });

    output.push(parsedRow);
  }

  return output;
}

async function loadCsv(url: string): Promise<Record<string, unknown>[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo cargar CSV: ${url}`);
  }

  const text = await response.text();
  return parseCsvText(text);
}

function normalizeHeaderKey(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function getFirstColumnValue(
  row: Hoja1Row,
  candidates: string[],
): string | null {
  for (const key of candidates) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      return row[key] ?? null;
    }
  }

  const normalizedMap = new Map<string, string | null>();
  for (const [rawKey, value] of Object.entries(row)) {
    normalizedMap.set(normalizeHeaderKey(rawKey), value);
  }

  for (const key of candidates) {
    const value = normalizedMap.get(normalizeHeaderKey(key));
    if (value !== undefined) {
      return value ?? null;
    }
  }

  return null;
}

export function deriveParaMapaFromHoja1(hoja1: Hoja1Row[]): ParaMapaRow[] {
  return hoja1
    .map((row) => {
      const codigo = normalizeText(getFirstColumnValue(row, ["ID de respuesta"]));
      const fechaRaw =
        getFirstColumnValue(row, ["Respuesta iniciada"]) ??
        getFirstColumnValue(row, ["Respuesta completada"]);

      return {
        codigo: codigo ?? "",
        lat: parseCoord(getFirstColumnValue(row, ["Ubicación [Latitud]"])),
        lng: parseCoord(getFirstColumnValue(row, ["Ubicación [Longitud]"])),
        voto: normalizeText(getFirstColumnValue(row, ["Intención de voto"])),
        macroGraf: normalizeMacroName(
          normalizeText(
            getFirstColumnValue(row, [
              "Distrito en el que se esta encuestando",
            ]),
          ),
        ),
        distrito: normalizeText(
          getFirstColumnValue(row, ["Distrito num", "Numero de distrito"]),
        ),
        fecha: normalizeText(fechaRaw),
      } satisfies ParaMapaRow;
    })
    .filter((row) => row.codigo.length > 0);
}

export async function loadHoja1(): Promise<Hoja1Row[]> {
  const rows = await loadCsv("/data/hoja1.csv");

  return rows.map((row) => {
    const normalized: Hoja1Row = {};

    for (const [key, value] of Object.entries(row)) {
      normalized[key] = normalizeText(value);
    }

    return normalized;
  });
}

export async function loadMacrodistritosGeo(): Promise<MacrodistritosGeoJSON> {
  const response = await fetch("/data/macrodistrito_gamlp_2019.json");
  if (!response.ok) {
    throw new Error("No se pudo cargar macrodistrito_gamlp_2019.json");
  }

  const json = (await response.json()) as unknown;

  if (
    typeof json !== "object" ||
    json === null ||
    (json as { type?: string }).type !== "FeatureCollection" ||
    !Array.isArray((json as { features?: unknown[] }).features)
  ) {
    throw new Error("El archivo de macrodistritos no es un FeatureCollection válido");
  }

  return json as MacrodistritosGeoJSON;
}

export async function loadEncuestaDataset(): Promise<EncuestaDataset> {
  const [hoja1, geo] = await Promise.all([
    loadHoja1(),
    loadMacrodistritosGeo(),
  ]);
  const paraMapa = deriveParaMapaFromHoja1(hoja1);

  const hoja1ById = new Map<string, Hoja1Row>();
  for (const row of hoja1) {
    const id = normalizeText(row["ID de respuesta"]);
    if (id) {
      hoja1ById.set(id, row);
    }
  }

  return {
    paraMapa,
    hoja1,
    geo,
    hoja1ById,
  };
}
