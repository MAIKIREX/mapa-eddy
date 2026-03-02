import type { ParaMapaRow } from "@/features/encuesta/types";

export type MacroStatsAll = {
  totalConVoto: number;
  winner: string | null;
  winnerPct: number | null;
};

export type MacroStatsForVoto = {
  totalConVoto: number;
  pct: number | null;
};

function macroKey(value: string | null): string | null {
  const key = value?.trim().toUpperCase();
  return key && key.length > 0 ? key : null;
}

function voteKey(value: string | null): string | null {
  const key = value?.trim();
  return key && key.length > 0 ? key : null;
}

function getTierColor(pct: number | null): { fillColor: string; fillOpacity: number } {
  if (pct == null || pct <= 0) {
    return { fillColor: "#e5e7eb", fillOpacity: 0.2 };
  }
  if (pct >= 60) {
    return { fillColor: "#1d4ed8", fillOpacity: 0.7 };
  }
  if (pct >= 40) {
    return { fillColor: "#2563eb", fillOpacity: 0.62 };
  }
  if (pct >= 20) {
    return { fillColor: "#3b82f6", fillOpacity: 0.54 };
  }
  return { fillColor: "#93c5fd", fillOpacity: 0.46 };
}

export function computeMacroStatsAll(rows: ParaMapaRow[]): Record<string, MacroStatsAll> {
  const macroVotes = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const macro = macroKey(row.macroGraf);
    const voto = voteKey(row.voto);

    if (!macro || !voto) {
      continue;
    }

    const votes = macroVotes.get(macro) ?? new Map<string, number>();
    votes.set(voto, (votes.get(voto) ?? 0) + 1);
    macroVotes.set(macro, votes);
  }

  const result: Record<string, MacroStatsAll> = {};

  for (const [macro, votes] of macroVotes.entries()) {
    let winner: string | null = null;
    let winnerCount = 0;
    let totalConVoto = 0;

    for (const [voto, count] of votes.entries()) {
      totalConVoto += count;
      if (count > winnerCount) {
        winner = voto;
        winnerCount = count;
      }
    }

    result[macro] = {
      totalConVoto,
      winner,
      winnerPct:
        totalConVoto > 0 && winner != null
          ? Number(((winnerCount / totalConVoto) * 100).toFixed(1))
          : null,
    };
  }

  return result;
}

export function computeMacroStatsForVoto(
  rows: ParaMapaRow[],
  voto: string,
): Record<string, MacroStatsForVoto> {
  const target = voto.trim().toUpperCase();
  const accum = new Map<string, { totalConVoto: number; count: number }>();

  for (const row of rows) {
    const macro = macroKey(row.macroGraf);
    const rowVoto = voteKey(row.voto);

    if (!macro || !rowVoto) {
      continue;
    }

    const current = accum.get(macro) ?? { totalConVoto: 0, count: 0 };
    current.totalConVoto += 1;
    if (rowVoto.toUpperCase() === target) {
      current.count += 1;
    }
    accum.set(macro, current);
  }

  const result: Record<string, MacroStatsForVoto> = {};

  for (const [macro, item] of accum.entries()) {
    result[macro] = {
      totalConVoto: item.totalConVoto,
      pct:
        item.totalConVoto > 0
          ? Number(((item.count / item.totalConVoto) * 100).toFixed(1))
          : null,
    };
  }

  return result;
}

export function getChoroplethStyle(params: {
  pct: number | null;
}): { color: string; fillColor: string; fillOpacity: number; weight: number } {
  const tier = getTierColor(params.pct);

  return {
    color: "#1f2937",
    fillColor: tier.fillColor,
    fillOpacity: tier.fillOpacity,
    weight: 1.2,
  };
}
