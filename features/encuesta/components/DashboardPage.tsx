"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  applyFiltersToParaMapa,
  computeBreakdownByDistrito,
  computeBreakdownByMacro,
  computeKPIs,
  computeVoteRanking,
  getFilterOptions,
  getValidIds,
} from "@/features/encuesta/lib/aggregate";
import { useEncuestaData } from "@/features/encuesta/hooks/useEncuestaData";
import { useEncuestaFilters } from "@/features/encuesta/hooks/useEncuestaFilters";
import { BreakdownByDistrito } from "@/features/encuesta/components/BreakdownByDistrito";
import { BreakdownByMacro } from "@/features/encuesta/components/BreakdownByMacro";
import { FiltersBar } from "@/features/encuesta/components/FiltersBar";
import { KPIsGrid } from "@/features/encuesta/components/KPIsGrid";
import { VoteRanking } from "@/features/encuesta/components/VoteRanking";
import { MapLegend } from "@/features/mapa-encuesta/components/MapLegend";

const EncuestaMap = dynamic(
  () => import("@/features/mapa-encuesta/components/EncuestaMap").then((mod) => mod.EncuestaMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[420px] w-full rounded-xl md:h-[520px]" />,
  },
);

const motionProps = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.24, ease: "easeOut" as const },
};

function DashboardSkeleton() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[520px] w-full rounded-xl" />
    </section>
  );
}

export default function DashboardPage() {
  const { data, loading, error } = useEncuestaData();
  const { filters, setDistrito, setMacro, setSoloValidas, setVoto, resetFilters } = useEncuestaFilters();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="neon-heading text-2xl">Dashboard de Encuesta</h1>
        <Card className="neon-surface border-destructive/40 bg-destructive/10">
          <CardHeader>
            <CardTitle className="neon-heading text-sm">Error de carga</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="neon-heading text-2xl">Dashboard de Encuesta</h1>
        <p className="text-sm text-muted-foreground">No hay datos disponibles.</p>
      </section>
    );
  }

  const validIds = getValidIds(data.hoja1ById);
  const options = getFilterOptions(data, filters.soloValidas ? validIds : undefined);
  const filtered = applyFiltersToParaMapa(data, filters);
  const kpis = computeKPIs(filtered, data.paraMapa.length);
  const ranking = computeVoteRanking(filtered);
  const byMacro = computeBreakdownByMacro(filtered);
  const byDistrito = computeBreakdownByDistrito(filtered);
  const topVote = ranking[0] ?? null;

  const filtersKey = `${filters.voto}|${filters.macro}|${filters.distrito}|${filters.soloValidas ? "1" : "0"}`;

  return (
    <div className="min-h-screen bg-background">
      <main className="min-w-0">
        <header className="border-b border-[rgb(73_197_182_/_20%)] bg-[linear-gradient(180deg,rgb(3_11_18_/_96%),rgb(2_8_14_/_92%))] px-4 py-4 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-accent-blue/35 pb-3">
            <div>
              <h1 className="neon-heading text-lg sm:text-xl">Dashboard de Encuesta</h1>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-text-secondary">
                Control center geoespacial y electoral
              </p>
            </div>

            <Badge className="border-accent-teal/45 bg-accent-teal/10 text-accent-teal">
              Datos cargados: {filtered.length}
            </Badge>
          </div>

          <FiltersBar
            filters={filters}
            setVoto={setVoto}
            setMacro={setMacro}
            setDistrito={setDistrito}
            setSoloValidas={setSoloValidas}
            resetFilters={resetFilters}
            options={options}
          />
        </header>

        <section className="px-4 py-5 sm:px-6">
          <motion.div key={filtersKey} {...motionProps} className="space-y-4">
            <KPIsGrid kpis={kpis} topVote={topVote} />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <Card className="neon-surface xl:col-span-8">
                <CardHeader className="pb-2">
                  <CardTitle className="neon-heading text-xs">Mapa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <EncuestaMap geo={data.geo} rows={filtered} selectedVoto={filters.voto} />
                    <MapLegend selectedVoto={filters.voto} />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4 xl:col-span-4">
                <VoteRanking ranking={ranking} />
                <BreakdownByMacro rows={byMacro} />
              </div>
            </div>

            <Separator className="neon-grid-line" />
            <BreakdownByDistrito rows={byDistrito} />
          </motion.div>
        </section>
      </main>
    </div>
  );
}
