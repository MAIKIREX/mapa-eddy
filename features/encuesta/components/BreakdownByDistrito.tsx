"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BreakdownByDistritoRow } from "@/features/encuesta/lib/aggregate";

type BreakdownByDistritoProps = {
  rows: BreakdownByDistritoRow[];
};

export function BreakdownByDistrito({ rows }: BreakdownByDistritoProps) {
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) {
      return rows;
    }

    return rows.filter((row) => row.distrito.toLowerCase().includes(text));
  }, [rows, query]);

  return (
    <Card className="neon-surface rounded-xl">
      <CardHeader className="gap-3">
        <CardTitle className="neon-heading text-xs">Breakdown por Distrito</CardTitle>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar distrito..."
          aria-label="Buscar distrito"
          className="border-accent-blue/40 bg-surface-2 text-text-primary placeholder:text-text-secondary"
        />
      </CardHeader>
      <CardContent>
        {filteredRows.length === 0 ? (
          <p className="text-sm text-text-secondary">No hay distritos para el texto buscado.</p>
        ) : (
          <ScrollArea className="max-h-[430px]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-surface">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-text-secondary">Distrito</TableHead>
                  <TableHead className="text-text-secondary">Macro</TableHead>
                  <TableHead className="text-right text-text-secondary">Total</TableHead>
                  <TableHead className="text-text-secondary">Ganador</TableHead>
                  <TableHead className="text-right text-text-secondary">% ganador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.distrito} className="border-divider hover:bg-accent-teal/8">
                    <TableCell className="font-medium text-text-primary">{row.distrito}</TableCell>
                    <TableCell className="text-text-secondary">{row.macro ?? "-"}</TableCell>
                    <TableCell className="text-right tabular-nums text-text-secondary">{row.total}</TableCell>
                    <TableCell>
                      {row.topVoto ? (
                        <Badge className="border-accent-teal/50 bg-accent-teal/12 text-accent-teal">{row.topVoto}</Badge>
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
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
