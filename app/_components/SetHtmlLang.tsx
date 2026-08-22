"use client";

import { useEffect } from "react";

// El layout raíz no conoce el locale dinámico (Next.js exige un único <html>
// en el layout raíz), así que este componente ajusta el atributo en el cliente.
export function SetHtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
