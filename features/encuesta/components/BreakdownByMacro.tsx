import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BreakdownByMacroRow } from "@/features/encuesta/lib/aggregate";

type BreakdownByMacroProps = {
  rows: BreakdownByMacroRow[];
};

export function BreakdownByMacro({ rows }: BreakdownByMacroProps) {
  return (
    <Card className="neon-surface rounded-xl">
      <CardHeader>
        <CardTitle className="neon-heading text-xs">Breakdown por Macrodistrito</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-text-secondary">No hay datos para mostrar.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-text-secondary">Macro</TableHead>
                <TableHead className="text-right text-text-secondary">Total</TableHead>
                <TableHead className="text-text-secondary">Ganador</TableHead>
                <TableHead className="text-right text-text-secondary">% ganador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.macro} className="border-divider hover:bg-accent-teal/8">
                  <TableCell className="font-medium text-text-primary">{row.macro}</TableCell>
                  <TableCell className="text-right tabular-nums text-text-secondary">{row.total}</TableCell>
                  <TableCell>
                    {row.topVoto ? (
                      <Badge className="border-accent-blue/50 bg-accent-blue/14 text-accent-teal">{row.topVoto}</Badge>
                    ) : (
                      <span className="text-text-secondary">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-accent-teal">
                    {row.topPct == null ? "-" : `${row.topPct.toFixed(1)}%`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
