import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-4 py-10 sm:px-6">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Bienvenido al Dashboard de Encuesta
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Aquí podrás explorar métricas clave de intención de voto, filtros por
            macrodistrito y distrito, ranking de candidatos y visualización en mapa.
          </p>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard">Ir al dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
