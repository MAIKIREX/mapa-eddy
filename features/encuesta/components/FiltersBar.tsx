"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { FilterOptions } from "@/features/encuesta/lib/aggregate";
import type { EncuestaFilters } from "@/features/encuesta/hooks/useEncuestaFilters";

type FiltersBarProps = {
  filters: EncuestaFilters;
  setVoto: (voto: EncuestaFilters["voto"]) => void;
  setMacro: (macro: EncuestaFilters["macro"]) => void;
  setDistrito: (distrito: EncuestaFilters["distrito"]) => void;
  setSoloValidas: (value: boolean) => void;
  resetFilters: () => void;
  options: FilterOptions;
};

export function FiltersBar({
  filters,
  setVoto,
  setMacro,
  setDistrito,
  setSoloValidas,
  resetFilters,
  options,
}: FiltersBarProps) {
  return (
    <Card className="neon-surface rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="neon-heading text-xs">Control panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1 text-xs uppercase tracking-[0.12em] text-text-secondary">
            <span>Intención de voto</span>
            <Select
              value={filters.voto}
              onValueChange={(value) => setVoto(value)}
              className="border-accent-blue/40 bg-surface-2 text-text-primary"
            >
              <SelectItem value="__ALL__">Todos</SelectItem>
              {options.votos.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </Select>
          </label>

          <label className="space-y-1 text-xs uppercase tracking-[0.12em] text-text-secondary">
            <span>Macrodistrito</span>
            <Select
              value={filters.macro}
              onValueChange={(value) => setMacro(value)}
              className="border-accent-blue/40 bg-surface-2 text-text-primary"
            >
              <SelectItem value="__ALL__">Todos</SelectItem>
              {options.macros.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </Select>
          </label>

          <label className="space-y-1 text-xs uppercase tracking-[0.12em] text-text-secondary">
            <span>Distrito</span>
            <Select
              value={filters.distrito}
              onValueChange={(value) => setDistrito(value)}
              className="border-accent-blue/40 bg-surface-2 text-text-primary"
            >
              <SelectItem value="__ALL__">Todos</SelectItem>
              {options.distritos.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </Select>
          </label>

          <div className="flex items-end justify-between gap-3 rounded-lg border border-accent-teal/20 bg-surface-2/75 p-3">
            <label htmlFor="solo-validas" className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-text-secondary">
              <Switch
                id="solo-validas"
                checked={filters.soloValidas}
                onCheckedChange={setSoloValidas}
                className="data-[state=checked]:bg-accent-teal"
              />
              <span>Solo válidas</span>
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
              className="border-accent-blue/55 bg-accent-blue/10 text-text-primary hover:border-accent-teal/70 hover:bg-accent-teal/10"
            >
              Reset
            </Button>
          </div>
        </div>

        <Separator className="neon-grid-line" />
        <p className="text-xs text-text-secondary">
          Opciones dinámicas: con &quot;Solo válidas&quot; activo, los controles muestran solamente valores disponibles.
        </p>
      </CardContent>
    </Card>
  );
}
