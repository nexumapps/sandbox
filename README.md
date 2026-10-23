# NEXUM Taller — publicación raíz de GitHub Pages

Versión del paquete: `6.0-dev-v14` (sin incremento de versión por empaquetado).

## Publicación

Este paquete está preparado para colocar sus archivos en la raíz de `nexumapps/nexumapps.github.io`, sustituyendo `index.html`, `app.js` y `styles.css` de la web pública anterior. El despliegue debe realizarse en una rama separada y revisarse mediante Pull Request; no publicar directamente en `main` sin validación.

## PWA y modo offline

- Requiere GitHub Pages/HTTPS para que el navegador pueda registrar `sw.js`.
- `manifest.webmanifest`, iconos y service worker están enlazados desde `index.html`.
- Los tickets y movimientos se guardan en almacenamiento local del navegador; las fotos se guardan en IndexedDB.
- La copia de seguridad de datos y la copia del repositorio fotográfico son operaciones separadas.
- Abrir `index.html` como `file://` no equivale a la PWA alojada en HTTPS: el almacenamiento no se comparte entre esos orígenes.

## Sincronización cloud — limitación importante

La sincronización es manual y requiere sesión, membresía activa, ID del taller y RPC/migraciones compatibles en Supabase. La presencia de conexión a Internet no significa que los datos estén sincronizados. Las fotos no se sincronizan entre dispositivos. Las pruebas de esta entrega son estáticas/locales; no constituyen una prueba E2E con dos dispositivos y backend real.

## Pruebas realizadas

- `node --check app.js`, `sync-core.js` y `sw.js`.
- `node tests/sync-core.test.js`.
- `node tests/admin-global-contract.test.cjs`.
- `node tests/sync-integration-contract.test.cjs`.
- Verificación del JSON del manifiesto, existencia de recursos cacheados y dimensiones de iconos.

Las pruebas del código fuente y migraciones están en `nexum_taller_dev/`; no se ejecutan automáticamente por GitHub Pages.
