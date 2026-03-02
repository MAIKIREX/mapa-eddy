# Plan de proyecto — Dashboard + Mapa de Encuesta (Next.js + Leaflet)

## 0) Objetivo del MVP

Construir una app **solo frontend** que lea datos desde `public/data/` y permita:

- Ver **KPIs + gráficos** de intención de voto (general / por macrodistrito / por distrito).
- Ver un **mapa** con:
  - Polígonos de macrodistritos (GeoJSON)
  - Puntos de encuestas (lat/long)
- Aplicar **filtros**, principalmente:
  - `Intención de voto` (modo “Todos” o un candidato)
  - `Válidez` (por defecto: solo válidas)
  - `Macrodistrito` / `Distrito` (opcional)

### Datos disponibles

- `public/data/hoja1.csv`
- `public/data/para_mapa.csv`
- `public/data/macrodistrito_gamlp_2019.json`

---

## 1) Arquitectura del repo (usando la skill `nextjs-frontend-structure`)

Aplicar `nextjs-frontend-structure` en modo **scaffold** (sin mover nada si ya existe).

### 1.1 Preflight (obligatorio)

- Detectar `WORKSPACE_ROOT`
- Detectar `CODE_ROOT` (si existe `src/`, trabajar dentro)
- Confirmar router:
  - Si existe `app/` → App Router OK
  - Si solo existe `pages/` → no crear `app/` (salvo que lo pida explícitamente)

### 1.2 Estructura objetivo (CODE_ROOT)

Crear (si faltan):

- `components/ui`
- `components/layout`
- `features/`
- `lib/`
- `types/`

Reglas clave:

- No duplicar `globals.css` ni `tailwind.config`
- `app/**/page.tsx` solo composición; lógica en `features/**`

---

## 2) Diseño de features (dominio)

### 2.1 Feature principal: `features/encuesta`

Responsable de:

- Cargar + normalizar datos (`CSV + GeoJSON`)
- Calcular métricas agregadas (KPIs)
- Exponer selectores/funciones para filtros

Estructura recomendada:

```

features/encuesta/
components/
DashboardPage.tsx
FiltersBar.tsx
KPIsGrid.tsx
VoteRanking.tsx
BreakdownByMacro.tsx
BreakdownByDistrito.tsx
hooks/
useEncuestaData.ts
useEncuestaFilters.ts
services/
dataLoader.ts
lib/
normalize.ts
aggregate.ts
geo.ts
types.ts

```

### 2.2 Feature de mapa: `features/mapa-encuesta`

Responsable de:

- Renderizar Leaflet + GeoJSON + puntos
- Estilos por filtro (modo “Todos” vs candidato seleccionado)

```

features/mapa-encuesta/
components/
EncuestaMap.tsx
MapLegend.tsx
lib/
mapStyle.ts
spatial.ts
types.ts

```

---

## 3) Modelo de datos en memoria (frontend-only)

### 3.1 Carga de `para_mapa.csv` (base para mapa)

Normalización mínima:

- `lat = parseFloat(replace(',', '.'))`
- `lng = parseFloat(replace(',', '.'))`
- `macro = "Macrodistrito X" -> "X" (uppercase)` (para cruzar con `macro_vige`)

Estructura sugerida (`ParaMapaRow`):

- `codigo`
- `lat`, `lng` (nullable)
- `macroGraf`
- `distrito`
- `voto`
- `fecha` (string, opcional)

### 3.2 Carga de `hoja1.csv` (detalle)

Se usa para:

- filtrar por `Válidez`
- futuros filtros (sexo, edad, etc.)
- tooltips / detalles por punto (si se decide)

Unión:

- `hoja1["ID de respuesta"]` ↔ `para_mapa["Codigo"]`

### 3.3 Carga de GeoJSON

GeoJSON `FeatureCollection` con `properties.macro_vige` (nombre macro)

---

## 4) Filtros y comportamiento del dashboard

### 4.1 Filtros (estado global del dashboard)

- `voto`: `"__ALL__" | <opción>`
- `soloValidas`: boolean (default `true`)
- `macro`: `"__ALL__" | <macro>`
- `distrito`: `"__ALL__" | <distrito>`

### 4.2 Métricas que el dashboard debe mostrar

KPIs:

- Total registros
- Total con coordenadas
- Total válidas
- % válidas
- Top 1 intención + %

Gráficos/Tablas:

- Ranking general de intención (bar)
- Breakdown por macrodistrito (tabla / resumen)
- Breakdown por distrito (tabla ordenada por tamaño o por %)

---

## 5) Mapa: capas y modos

### 5.1 Capas

1. Polígonos GeoJSON (macrodistritos)
2. Puntos (CircleMarkers) de encuestas con lat/lng

### 5.2 Modo de visualización (según filtro de voto)

- Modo ALL (`__ALL__`)
  - Polígonos: **ganador por macrodistrito** + % del ganador
  - Puntos: neutrales (o baja opacidad)
- Modo Candidato (voto seleccionado)
  - Polígonos: **% de apoyo de ese voto** por macrodistrito
  - Puntos: solo de ese voto (o resaltados)

### 5.3 Matching macro CSV ↔ GeoJSON

- CSV: `Macrodistrito para gráfico` → normalizar a uppercase sin prefijo “Macrodistrito”
- GeoJSON: `macro_vige` uppercase
- Si no hay match (ej: “SUR”), se deja en “sin datos” para el MVP

---

## 6) UI (shadcn + tailwind + framer-motion)

### 6.1 Layout del dashboard

- Header: título + resumen
- Filtros: Select (voto, macro, distrito) + Switch (solo válidas)
- Grid:
  - KPIs (cards)
  - Ranking (card)
  - Mapa (card grande)
  - Tablas (macro / distrito)

### 6.2 Animaciones

- Fade/slide suave al cambiar filtros (Framer Motion)
- Skeletons mientras cargan CSV/GeoJSON

---

## 7) Implementación por fases (para Codex)

### Fase 1 — Bootstrap + estructura

- Crear proyecto Next + Tailwind + shadcn
- Aplicar `nextjs-frontend-structure` (scaffold)
- Confirmar que `public/data/*` se sirve bien

### Fase 2 — Data layer

- Loader CSV (PapaParse) + loader GeoJSON
- Normalizadores (coords, macro)
- Hook `useEncuestaData` (loading/error/data)

### Fase 3 — Dashboard (sin mapa)

- KPIs
- Ranking intención
- Breakdown macro/distrito (tablas)

### Fase 4 — Mapa

- react-leaflet base
- GeoJSON + puntos
- Popups + leyenda
- Filtrado por intención

### Fase 5 — Refinamiento

- Performance (memoization)
- UI polish (responsive)
- Export CSV filtrado (opcional)

---

## 8) Definición de “listo” (MVP Done)

- Carga datos desde `public/data`
- Dashboard muestra KPIs + ranking + tablas
- Mapa muestra macrodistritos + puntos
- Filtro por `Intención de voto` afecta dashboard y mapa
- Toggle “solo válidas” funciona (si `hoja1.csv` aporta `Válidez`)

```

```
