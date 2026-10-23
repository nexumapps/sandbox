# NEXUM Taller — Sandbox

## Propósito
Entorno separado para ensayar cambios de interfaz y comportamiento sin modificar el repositorio de producción.

## Origen
Clonado desde `nexumapps/nexumapps.github.io`, rama `main`, versión `6.0-dev-v64`.

## Seguridad antes de publicar o probar
- Este clon todavía apunta al mismo proyecto Supabase que producción. No iniciar operaciones de escritura ni sincronización hasta completar el aislamiento y confirmar el uso de NEXUM ZERO.
- GitHub Pages de este repositorio se servirá bajo `/sandbox/`, en el mismo origen `nexumapps.github.io`. Por tanto, el almacenamiento del navegador y los cachés del service worker deben aislarse explícitamente antes de habilitar Pages.
- No se han realizado cambios en Supabase.
