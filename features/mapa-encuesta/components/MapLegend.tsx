import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MapLegendProps = {
  selectedVoto: "__ALL__" | string;
};

const scale = [
  { label: ">= 60", color: "#49c5b6" },
  { label: ">= 40", color: "#32aeb2" },
  { label: ">= 20", color: "#2779a7" },
  { label: "> 0", color: "#1f4f73" },
  { label: "Sin datos", color: "#203244" },
];

export function MapLegend({ selectedVoto }: MapLegendProps) {
  const modeText =
    selectedVoto === "__ALL__"
      ? "Modo: Ganador por macrodistrito"
      : `Modo: % apoyo para ${selectedVoto}`;

  return (
    <Card className="pointer-events-none absolute right-3 top-3 z-[500] w-64 border-accent-teal/35 bg-[rgb(3_13_21_/_92%)] shadow-[0_0_20px_rgb(73_197_182_/_16%)] backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="neon-heading text-[11px]">Leyenda</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <p className="text-text-secondary">{modeText}</p>
        <ul className="space-y-1.5">
          {scale.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-2">
              <span className="text-text-secondary">{item.label}</span>
              <span className="h-3 w-7 rounded-sm border border-accent-blue/45" style={{ backgroundColor: item.color }} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
