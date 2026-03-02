"use client";

import { useCallback, useState } from "react";

export type EncuestaFilters = {
  voto: "__ALL__" | string;
  soloValidas: boolean;
  macro: "__ALL__" | string;
  distrito: "__ALL__" | string;
};

const initialFilters: EncuestaFilters = {
  voto: "__ALL__",
  soloValidas: true,
  macro: "__ALL__",
  distrito: "__ALL__",
};

export function useEncuestaFilters() {
  const [filters, setFilters] = useState<EncuestaFilters>(initialFilters);

  const setVoto = useCallback((voto: EncuestaFilters["voto"]) => {
    setFilters((prev) => ({ ...prev, voto }));
  }, []);

  const setSoloValidas = useCallback((soloValidas: boolean) => {
    setFilters((prev) => ({ ...prev, soloValidas }));
  }, []);

  const setMacro = useCallback((macro: EncuestaFilters["macro"]) => {
    setFilters((prev) => ({ ...prev, macro }));
  }, []);

  const setDistrito = useCallback((distrito: EncuestaFilters["distrito"]) => {
    setFilters((prev) => ({ ...prev, distrito }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  return {
    filters,
    setVoto,
    setSoloValidas,
    setMacro,
    setDistrito,
    resetFilters,
  };
}
