import type { EncuestaFilters } from "@/features/encuesta/hooks/useEncuestaFilters";
import type { EncuestaDataset, Hoja1Row, ParaMapaRow } from "@/features/encuesta/types";

export type VoteRankingItem = {
  voto: string;
  count: number;
  pct: number;
};

export type Kpis = {
  total_all: number;
  total_filtered: number;
  total_with_coords_filtered: number;
  unique_distritos_filtered: number;
  unique_macros_filtered: number;
};

export type BreakdownByMacroRow = {
  macro: string;
  total: number;
  topVoto: string | null;
  topPct: number | null;
};

export type BreakdownByDistritoRow = {
  distrito: string;
  total: number;
  topVoto: string | null;
  topPct: number | null;
  macro: string | null;
};

export type FilterOptions = {
  votos: string[];
  macros: string[];
  distritos: string[];
};

function toComparable(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const v = value.trim();
  return v.length > 0 ? v.toUpperCase() : null;
}

function getTopVote(values: (string | null)[]): { topVoto: string | null; topPct: number | null } {
  const counts = new Map<string, number>();

  for (const value of values) {
    const voto = value?.trim();
    if (!voto) {
      continue;
    }
    counts.set(voto, (counts.get(voto) ?? 0) + 1);
  }

  if (counts.size === 0) {
    return { topVoto: null, topPct: null };
  }

  let winner: string | null = null;
  let winnerCount = 0;
  let totalConVoto = 0;

  for (const [voto, count] of counts) {
    totalConVoto += count;
    if (count > winnerCount) {
      winner = voto;
      winnerCount = count;
    }
  }

  return {
    topVoto: winner,
    topPct: totalConVoto > 0 ? Number(((winnerCount / totalConVoto) * 100).toFixed(1)) : null,
  };
}

export function getValidIds(hoja1ById: Map<string, Hoja1Row>): Set<string> {
  const validIds = new Set<string>();

  for (const [id, row] of hoja1ById.entries()) {
    const value = row["Válidez"] ?? row["Validez"];
    if (typeof value === "string" && value.trim().toUpperCase() === "SI") {
      validIds.add(id);
    }
  }

  return validIds;
}

export function applyFiltersToParaMapa(
  dataset: EncuestaDataset,
  filters: EncuestaFilters,
): ParaMapaRow[] {
  const validIds = getValidIds(dataset.hoja1ById);
  const targetMacro = filters.macro === "__ALL__" ? null : toComparable(filters.macro);
  const targetDistrito =
    filters.distrito === "__ALL__" ? null : toComparable(filters.distrito);
  const targetVoto = filters.voto === "__ALL__" ? null : toComparable(filters.voto);

  return dataset.paraMapa.filter((row) => {
    if (targetMacro && toComparable(row.macroGraf) !== targetMacro) {
      return false;
    }

    if (targetDistrito && toComparable(row.distrito) !== targetDistrito) {
      return false;
    }

    if (targetVoto && toComparable(row.voto) !== targetVoto) {
      return false;
    }

    if (filters.soloValidas && validIds.size > 0 && !validIds.has(row.codigo)) {
      return false;
    }

    return true;
  });
}

export function computeKPIs(
  filtered: ParaMapaRow[],
  totalAll: number,
  validCountAll?: number,
): Kpis {
  void validCountAll;

  const distritos = new Set<string>();
  const macros = new Set<string>();
  let withCoords = 0;

  for (const row of filtered) {
    if (row.lat != null && row.lng != null) {
      withCoords += 1;
    }
    if (row.distrito) {
      distritos.add(row.distrito.toUpperCase());
    }
    if (row.macroGraf) {
      macros.add(row.macroGraf.toUpperCase());
    }
  }

  return {
    total_all: totalAll,
    total_filtered: filtered.length,
    total_with_coords_filtered: withCoords,
    unique_distritos_filtered: distritos.size,
    unique_macros_filtered: macros.size,
  };
}

export function computeVoteRanking(filtered: ParaMapaRow[]): VoteRankingItem[] {
  const counts = new Map<string, number>();

  for (const row of filtered) {
    const voto = row.voto?.trim();
    if (!voto) {
      continue;
    }
    counts.set(voto, (counts.get(voto) ?? 0) + 1);
  }

  const totalConVoto = Array.from(counts.values()).reduce((acc, value) => acc + value, 0);

  const ranking = Array.from(counts.entries()).map(([voto, count]) => ({
    voto,
    count,
    pct: totalConVoto > 0 ? Number(((count / totalConVoto) * 100).toFixed(1)) : 0,
  }));

  ranking.sort((a, b) => b.count - a.count);

  return ranking;
}

export function computeBreakdownByMacro(filtered: ParaMapaRow[]): BreakdownByMacroRow[] {
  const groups = new Map<string, ParaMapaRow[]>();

  for (const row of filtered) {
    const macro = row.macroGraf?.trim();
    if (!macro) {
      continue;
    }

    const current = groups.get(macro) ?? [];
    current.push(row);
    groups.set(macro, current);
  }

  const rows: BreakdownByMacroRow[] = [];

  for (const [macro, list] of groups.entries()) {
    const { topVoto, topPct } = getTopVote(list.map((item) => item.voto));
    rows.push({
      macro,
      total: list.length,
      topVoto,
      topPct,
    });
  }

  rows.sort((a, b) => b.total - a.total);
  return rows;
}

export function computeBreakdownByDistrito(filtered: ParaMapaRow[]): BreakdownByDistritoRow[] {
  const groups = new Map<string, ParaMapaRow[]>();

  for (const row of filtered) {
    const distrito = row.distrito?.trim();
    if (!distrito) {
      continue;
    }

    const current = groups.get(distrito) ?? [];
    current.push(row);
    groups.set(distrito, current);
  }

  const rows: BreakdownByDistritoRow[] = [];

  for (const [distrito, list] of groups.entries()) {
    const { topVoto, topPct } = getTopVote(list.map((item) => item.voto));

    const macroCounts = new Map<string, number>();
    for (const item of list) {
      const macro = item.macroGraf?.trim();
      if (!macro) {
        continue;
      }
      macroCounts.set(macro, (macroCounts.get(macro) ?? 0) + 1);
    }

    let macroWinner: string | null = null;
    let macroWinnerCount = 0;
    for (const [macro, count] of macroCounts.entries()) {
      if (count > macroWinnerCount) {
        macroWinner = macro;
        macroWinnerCount = count;
      }
    }

    rows.push({
      distrito,
      macro: macroWinner,
      total: list.length,
      topVoto,
      topPct,
    });
  }

  rows.sort((a, b) => b.total - a.total);
  return rows;
}

export function getFilterOptions(dataset: EncuestaDataset, validIds?: Set<string>): FilterOptions {
  const baseRows =
    validIds && validIds.size > 0
      ? dataset.paraMapa.filter((row) => validIds.has(row.codigo))
      : dataset.paraMapa;

  const votos = new Set<string>();
  const macros = new Set<string>();
  const distritos = new Set<string>();

  for (const row of baseRows) {
    const voto = row.voto?.trim();
    const macro = row.macroGraf?.trim();
    const distrito = row.distrito?.trim();

    if (voto) {
      votos.add(voto);
    }
    if (macro) {
      macros.add(macro);
    }
    if (distrito) {
      distritos.add(distrito);
    }
  }

  return {
    votos: Array.from(votos).sort((a, b) => a.localeCompare(b, "es")),
    macros: Array.from(macros).sort((a, b) => a.localeCompare(b, "es")),
    distritos: Array.from(distritos).sort((a, b) => a.localeCompare(b, "es")),
  };
}
