import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VoteRankingItem } from "@/features/encuesta/lib/aggregate";

type VoteRankingProps = {
  ranking: VoteRankingItem[];
};

export function VoteRanking({ ranking }: VoteRankingProps) {
  const topTen = ranking.slice(0, 10);

  return (
    <Card className="neon-surface rounded-xl">
      <CardHeader>
        <CardTitle className="neon-heading text-xs">Ranking de intención (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        {topTen.length === 0 ? (
          <p className="text-sm text-text-secondary">No hay registros con voto para este filtro.</p>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-surface">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-text-secondary">Intención</TableHead>
                  <TableHead className="text-right text-text-secondary">Conteo</TableHead>
                  <TableHead className="text-right text-text-secondary">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topTen.map((row) => (
                  <TableRow key={row.voto} className="border-divider hover:bg-accent-teal/8">
                    <TableCell className="font-medium text-text-primary">{row.voto}</TableCell>
                    <TableCell className="text-right tabular-nums text-text-secondary">{row.count}</TableCell>
                    <TableCell className="text-right tabular-nums text-accent-teal">{row.pct.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
