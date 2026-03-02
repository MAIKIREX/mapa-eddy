import { TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Kpis, VoteRankingItem } from "@/features/encuesta/lib/aggregate";

type KPIsGridProps = {
  kpis: Kpis;
  topVote: VoteRankingItem | null;
};

export function KPIsGrid({ kpis, topVote }: KPIsGridProps) {
  const cards = [
    { label: "Total", value: kpis.total_all },
    { label: "Filtrado", value: kpis.total_filtered },
    { label: "Con coordenadas", value: kpis.total_with_coords_filtered },
    { label: "Distritos", value: kpis.unique_distritos_filtered },
    { label: "Macros", value: kpis.unique_macros_filtered },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {cards.map((item) => (
        <Card
          key={item.label}
          className="neon-surface rounded-xl transition hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgb(73_197_182_/_16%)]"
        >
          <CardHeader className="pb-1">
            <CardTitle className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="neon-kpi text-4xl font-semibold tabular-nums">{item.value}</p>
          </CardContent>
        </Card>
      ))}

      <Card className="neon-surface rounded-xl transition hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgb(73_197_182_/_16%)]">
        <CardHeader className="pb-1">
          <CardTitle className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">Top intención</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topVote ? (
            <>
              <Badge className="border-accent-teal/45 bg-accent-teal/15 text-accent-teal">{topVote.voto}</Badge>
              <div className="flex items-center gap-2">
                <p className="neon-kpi text-3xl font-semibold tabular-nums">{topVote.pct.toFixed(1)}%</p>
                <TrendingUp className="size-4 text-accent-blue" />
              </div>
            </>
          ) : (
            <p className="text-sm text-text-secondary">Sin datos</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
