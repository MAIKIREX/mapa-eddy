"use client";

import { useEffect, useState } from "react";

import { loadEncuestaDataset } from "@/features/encuesta/services/dataLoader";
import type { EncuestaDataset, LoadState } from "@/features/encuesta/types";

const initialState: LoadState<EncuestaDataset> = {
  data: null,
  loading: true,
  error: null,
};

export function useEncuestaData(): LoadState<EncuestaDataset> {
  const [state, setState] = useState<LoadState<EncuestaDataset>>(initialState);

  useEffect(() => {
    let cancelled = false;

    loadEncuestaDataset()
      .then((data) => {
        if (cancelled) {
          return;
        }
        setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los datos de la encuesta.";

        setState({ data: null, loading: false, error: message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
