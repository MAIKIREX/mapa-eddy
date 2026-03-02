"use client";

import { useMemo } from "react";
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { Layer } from "leaflet";

import { normalizeMacroName } from "@/features/encuesta/lib/normalize";
import type { MacrodistritosGeoJSON, ParaMapaRow } from "@/features/encuesta/types";
import {
  computeMacroStatsAll,
  computeMacroStatsForVoto,
  getChoroplethStyle,
} from "@/features/mapa-encuesta/lib/mapStyle";

type EncuestaMapProps = {
  geo: MacrodistritosGeoJSON;
  rows: ParaMapaRow[];
  selectedVoto: "__ALL__" | string;
};

const MAP_CENTER: [number, number] = [-16.5, -68.15];
const FEATURE_MACRO_FALLBACK: Record<string, string[]> = {
  CALACOTO: ["SUR"],
  OBRAJES: ["SUR"],
  OVEJUYO: ["SUR"],
};

function resolveStatByMacro<T extends Record<string, unknown>>(
  stats: Record<string, T>,
  featureMacro: string | null,
): T | null {
  if (!featureMacro) {
    return null;
  }

  const direct = stats[featureMacro];
  if (direct) {
    return direct;
  }

  const fallbacks = FEATURE_MACRO_FALLBACK[featureMacro] ?? [];
  for (const key of fallbacks) {
    const value = stats[key];
    if (value) {
      return value;
    }
  }

  return null;
}

export function EncuestaMap({ geo, rows, selectedVoto }: EncuestaMapProps) {
  const statsAll = useMemo(() => computeMacroStatsAll(rows), [rows]);

  const statsByVoto = useMemo(() => {
    if (selectedVoto === "__ALL__") {
      return {};
    }
    return computeMacroStatsForVoto(rows, selectedVoto);
  }, [rows, selectedVoto]);

  const rowsWithCoords = useMemo(() => {
    return rows.filter((row) => {
      if (row.lat == null || row.lng == null) {
        return false;
      }

      if (selectedVoto === "__ALL__") {
        return true;
      }

      return (row.voto ?? "").trim().toUpperCase() === selectedVoto.trim().toUpperCase();
    });
  }, [rows, selectedVoto]);

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-xl border border-accent-blue/45 bg-surface-2 md:h-[520px]">
      <MapContainer center={MAP_CENTER} zoom={11.6} className="z-0 h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoJSON
          data={geo}
          style={(feature) => {
            const macro = normalizeMacroName(feature?.properties?.macro_vige);
            const pct =
              selectedVoto === "__ALL__"
                ? resolveStatByMacro(statsAll, macro)?.winnerPct ?? null
                : resolveStatByMacro(statsByVoto, macro)?.pct ?? null;

            return getChoroplethStyle({ pct });
          }}
          onEachFeature={(feature, layer: Layer) => {
            const macroNameRaw =
              typeof feature.properties?.macro_vige === "string"
                ? feature.properties.macro_vige
                : "SIN DATO";
            const macro = normalizeMacroName(macroNameRaw);

            if (!macro) {
              layer.bindPopup(`<strong>Macro:</strong> ${macroNameRaw}<br/>Sin datos disponibles`);
              return;
            }

            if (selectedVoto === "__ALL__") {
              const stats = resolveStatByMacro(statsAll, macro);
              const winner = stats?.winner ?? "Sin datos";
              const winnerPct =
                stats?.winnerPct == null ? "-" : `${stats.winnerPct.toFixed(1)}%`;
              const totalConVoto = stats?.totalConVoto ?? 0;

              layer.bindPopup(
                `<strong>Macro:</strong> ${macroNameRaw}<br/><strong>Total con voto:</strong> ${totalConVoto}<br/><strong>Ganador:</strong> ${winner}<br/><strong>% ganador:</strong> ${winnerPct}`,
              );
              return;
            }

            const stats = resolveStatByMacro(statsByVoto, macro);
            const pct = stats?.pct == null ? "-" : `${stats.pct.toFixed(1)}%`;
            const totalConVoto = stats?.totalConVoto ?? 0;

            layer.bindPopup(
              `<strong>Macro:</strong> ${macroNameRaw}<br/><strong>Total con voto:</strong> ${totalConVoto}<br/><strong>% apoyo ${selectedVoto}:</strong> ${pct}`,
            );
          }}
        />

        {rowsWithCoords.map((row, idx) => (
          <CircleMarker
            key={`${row.codigo}-${idx}`}
            center={[row.lat as number, row.lng as number]}
            radius={4}
            pathOptions={{
              color: selectedVoto === "__ALL__" ? "#1f6a95" : "#49c5b6",
              fillColor: selectedVoto === "__ALL__" ? "#2779a7" : "#49c5b6",
              fillOpacity: 0.72,
              weight: 1,
            }}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Código:</strong> {row.codigo}
                </p>
                <p>
                  <strong>Voto:</strong> {row.voto ?? "-"}
                </p>
                <p>
                  <strong>Distrito:</strong> {row.distrito ?? "-"}
                </p>
                <p>
                  <strong>Macro:</strong> {row.macroGraf ?? "-"}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
