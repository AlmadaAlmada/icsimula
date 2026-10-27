/**
 * Metadados injetados pelo Vite em tempo de build (ver `define` em vite.config.ts).
 * Permitem identificar exatamente qual versão/commit está publicada.
 */
export const BUILD_INFO = {
  version: __APP_VERSION__,
  commit: __APP_COMMIT__,
  builtAt: __APP_BUILT_AT__,
};
