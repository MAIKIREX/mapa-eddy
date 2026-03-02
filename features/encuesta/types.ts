export type LoadState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export type ParaMapaRow = {
  codigo: string;
  lat: number | null;
  lng: number | null;
  macroGraf: string | null;
  distrito: string | null;
  voto: string | null;
  fecha: string | null;
};

export type Hoja1Row = Record<string, string | null>;

export type MacroFeatureProps = {
  macro_vige?: string;
  cod_macro?: string | number;
  ha?: number;
};

type GeoJsonGeometry = {
  type: string;
  coordinates?: unknown;
  geometries?: GeoJsonGeometry[];
};

type GeoJsonFeature = {
  type: "Feature";
  geometry: GeoJsonGeometry | null;
  properties: (MacroFeatureProps & Record<string, unknown>) | null;
};

export type MacrodistritosGeoJSON = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

export type EncuestaDataset = {
  paraMapa: ParaMapaRow[];
  hoja1: Hoja1Row[];
  geo: MacrodistritosGeoJSON;
  hoja1ById: Map<string, Hoja1Row>;
};
