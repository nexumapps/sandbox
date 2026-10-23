# Notas de publicación — NEXUM Taller V6.0-dev-v14

- El paquete de despliegue reutiliza la versión V6.0-dev-v14; no se incrementó la versión por cambiar el destino de publicación.
- La raíz del sitio pasa a ser la interfaz de gestión NEXUM Taller.
- Se conservan `manifest.webmanifest`, `sw.js`, `sync-core.js`, iconos y logos necesarios para la PWA.
- No se incluye ninguna clave de Supabase de tipo service-role ni secreto de servidor en el frontend.
- No se ha modificado ni desplegado el backend Supabase durante esta preparación.
- La sincronización cloud E2E, el comportamiento real tras instalación y la restauración de datos deben validarse en el sitio HTTPS tras desplegar.
