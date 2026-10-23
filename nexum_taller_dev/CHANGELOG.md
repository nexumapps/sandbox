## V6.0-dev-v14 — Administración y vinculación de sincronización
- Al crear un taller desde la consola global, el administrador creador recibe automáticamente una membresía activa; si falla la membresía o la auditoría final, el backend intenta revertir el alta.
- La consola muestra el UUID de cada taller y permite vincular este dispositivo al taller con un clic.
- Se persiste una referencia local normalizada al iniciar para evitar que el primer guardado tras actualizar la aplicación encole el histórico como si fueran registros nuevos; las operaciones ya pendientes se conservan.
- Antes de enviar, la app muestra cuántas operaciones están pendientes y una muestra de sus identificadores; exige confirmación explícita.
- Se actualiza `nexum-global-admin` a versión 2 manteniendo `verify_jwt=true`.
- Se sincronizan las referencias de versión en `app.js`, `index.html`, `version.txt` y la caché del service worker.
- Pruebas estáticas y unitarias pasan. La prueba E2E real entre dos dispositivos sigue pendiente; las fotos permanecen locales.

## V5.6.29-beta
- El eje Y y su escala permanecen fijos mientras se desplaza horizontalmente el gráfico.
- Las etiquetas del eje X usan fechas compactas `dd/mm` (o mes numérico en agrupación mensual), con el año identificado en la parte superior y separadores al cambiar de año.
- La agrupación día/semana/mes y los conteos de entradas/salidas conservan la lógica de la versión anterior.

## V5.6.28-beta
- Se corrige el enlace del selector Día/Semana/Mes después de cada renderizado de Estadísticas, para que actualice el gráfico de líneas.
- El selector sigue situado junto al gráfico y no cambia los criterios de las demás estadísticas.

## V5.6.27-beta
- Se movió el selector de agrupación al bloque del gráfico de entradas/salidas.
- Se sustituyó el gráfico de barras de entradas/salidas por un gráfico de líneas con marcadores: entradas azul y salidas roja.
- El eje X muestra fechas y el eje Y cantidad de equipos; se rellenan períodos intermedios sin movimientos con cero.

## V5.6.26-beta — Estadísticas ampliadas
- Añade comparación de entradas y salidas con agrupación diaria, semanal o mensual.
- Añade tiempo medio de resolución por categoría, excluyendo tickets abiertos o con fechas no válidas.
- Añade indicadores de reingresos, reingresos por garantía y sus porcentajes, además de pérdidas económicas y equipos devueltos sin reparar como indicadores separados.
- Una devolución sin reparar no se clasifica automáticamente como pérdida: el indicador económico solo cuenta tickets con inversión y precio registrados cuyo impacto (precio menos inversión) sea negativo.
- Los tickets creados desde el flujo de reapertura quedan identificados como reingresos; los anteriores se detectan mediante sus datos de origen o notas existentes.

## V5.6.25-beta
- El menú Economía permite editar únicamente inversión, margen, precio final y tasa histórica del ticket.
- Se elimina el acceso a la edición completa desde el diálogo económico; la edición completa queda en Histórico.
- La tasa modificada desde Economía solo se guarda en ese ticket y no actualiza la tasa general.
- Se conservan las reglas de cálculo y validación del margen, sin modificar otros tickets.

## V5.6.21-beta
- Logotipo ajustado a un tamaño intermedio.
- Variantes SVG normalizadas a un lienzo común para mantener la alineación al alternar temas.
- Transición breve al cambiar entre claro y oscuro, respetando la preferencia de movimiento reducido.

## V5.6.19-beta — contraste oscuro, logo y tarjeta de reingreso

- Refuerzo de contraste para componentes de Contabilidad, Estadísticas, tablas, estados y detalles en modo oscuro/sistema.
- Aumento del tamaño visible del logo en el encabezado. Se conservan los SVG vectoriales suministrados en la versión anterior.
- El indicador de tarjeta muestra “Reingreso” y “por garantía” en dos líneas, manteniendo el icono en la esquina.
- Pendiente: validación visual en teléfono; la revisión estática no sustituye la prueba real.

# V5.6.18-beta — Temas, identidad visual y configuración

- Reordenada la navegación: Inicio, Nuevo, Cola, Histórico, Contabilidad, Estadísticas y Configuración.
- Añadido selector de tema: claro, oscuro o igual al sistema.
- Integrado el símbolo y wordmark vectoriales NEXUM sin fondos ni slogan, con variantes por tema.
- Añadida gestión de categorías y tasa actual en Configuración.
- Movidos los controles de copia/restauración a Configuración; se incluyen categorías y preferencias de tema en nuevas copias. Las fotos continúan en una exportación separada.
- Las categorías retiradas no modifican los tickets existentes.
- Verificación automatizada estática realizada; prueba real en navegador/teléfono pendiente.

## V5.6.17-beta — Corrección geométrica del icono de reingreso
- Se sustituye el SVG de la llave inglesa por una silueta continua, eliminando el segmento que generaba el rombo/rectángulo interior señalado.
- No se modifican el color, el tamaño CSS, la posición, las etiquetas, los datos ni la lógica de garantías.
- Verificación estática: sintaxis JavaScript, sincronización de versión e integridad del ZIP. La comprobación visual en teléfono queda pendiente.

## V5.6.16-beta — Corrección de la silueta de la llave inglesa
- Se reemplaza únicamente el trazado SVG del icono de reingreso por garantía para eliminar la forma rectangular no deseada en la boca de la llave.
- Se mantienen el color gris, el tamaño CSS, la posición, las etiquetas y la lógica de garantías.
- Verificación estática pendiente de prueba visual en el teléfono.

## V5.6.16-beta — Indicadores coherentes de garantía en tarjetas
- La garantía concedida activa muestra un escudo con marca de verificación y los días restantes.
- La garantía concedida vencida muestra un escudo roto y el texto «Garantía vencida».
- Los tickets sin garantía concedida muestran un indicador neutro de ausencia; los reingresos por garantía muestran una herramienta neutra.
- Se mantiene separada la garantía concedida al cliente (`garantiaConcedida`) del motivo de reingreso (`garantia` / `tipoReingresoGarantia`).
- Los iconos son SVG locales, sin dependencias externas. No se modifican la navegación, el modelo de datos ni las reglas de tickets.
- Pruebas estáticas: sintaxis JavaScript, comprobación de versión sincronizada y validación estructural del ZIP. Prueba real de navegador/teléfono pendiente.


## V5.6.7-beta
- Economía por ticket: mantiene Inversión y Ganancia/Pérdida y añade por separado Incremento del taller (Margen) e Impacto total en el taller.
- Ticket rentable: el fondo recupera Inversión + Margen; el crecimiento real sigue siendo el Margen.
- Ticket con pérdida: el Impacto total en el taller refleja la pérdida neta.
- Eliminado “Subtotal de esta operación” de la vista económica del ticket.
# Registro de cambios — NEXUM Taller

## V5.6.8-beta
- Reorganizada únicamente la presentación de las tarjetas de Contabilidad.
- La **Tasa CUP/USD** queda siempre abajo a la izquierda, igual que en los movimientos ECN.
- **Impacto total en el taller** pasa a la derecha, debajo de Inversión e Incremento del taller.
- No se modifican cálculos, datos ni reglas económicas.


## V5.6.0 — primera implementación de la consolidación A+B

### Base y compatibilidad
- Evolución directa de la base V5.5.9 beta; no se reconstruye el proyecto desde cero.
- Se mantiene la migración de datos existentes y se normalizan nombres antiguos de estados, categorías y origen.
- El respaldo JSON identifica la versión de la aplicación.

### Tickets
- Estados normalizados según la especificación V5.6: normales, congelados, listo para recoger y estados finales.
- Los estados finales exigen fecha de salida y al menos un técnico.
- Origen: Particular, Colaborador o Negocio.
- Garantía representa una posible reclamación sobre un trabajo anterior; no concede automáticamente una nueva garantía.
- Se conserva el flujo de reapertura como ticket nuevo.
- Orden interno por fecha + número de inserción dentro de la fecha.

### Economía
- Se incorpora Margen como dato manual independiente de Inversión y Precio final.
- Sugerencia de margen: 60 % de la inversión, redondeado hacia arriba al siguiente múltiplo de 50.
- Sugerencia de precio: máximo entre 1000, 2× inversión e inversión + margen + 500.
- Las sugerencias se muestran como placeholders y no sobrescriben decisiones manuales.
- Al cambiar inversión, solo se actualizan las sugerencias de campos que continúan vacíos.

### Fotografías
- Las fotografías se almacenan en un repositorio IndexedDB independiente de la base principal.
- Los tickets conservan únicamente `photoIds`.
- Hasta 10 fotos por ingreso.
- Una foto inexistente o dañada nunca debe impedir abrir el ticket: se muestra `Error al cargar la foto o no existe`.
- La arquitectura permite separar en futuras exportaciones la base común y el repositorio fotográfico.

### Documentación
- Las funciones nuevas de V5.6 incluyen documentación en el código explicando propósito y comportamiento.

## V5.5.9 beta
- Incrementos totales = incremento/margen del taller antes de pérdidas + ganancias repartidas.
- Se muestra la tasa cambiaria actual junto al botón para modificarla.

## V5.6.1-beta — correcciones de prueba económica e interfaz
- **Balance corregido:** el fondo físico suma únicamente el margen de tickets finalizados; ya no suma la ganancia total del ticket.
- **Categoría corregida:** `Sin definir` ya no se duplica en los selectores de categoría, incluido el formulario de edición.
- **Placeholders de precios:** al abrir/limpiar un ticket se muestran las sugerencias de Margen y Precio final; en edición también se muestran cuando el valor real está vacío. Las sugerencias nunca sustituyen valores manuales existentes.
- **Saldo inicial compuesto:** Restablecer de fábrica permite introducir por separado saldo inicial CUP y saldo inicial USD. Ambos pueden coexistir y se almacenan como movimientos independientes.
- **Sellos:** se incorpora el sello derivado `BAJA RENTABILIDAD` y `PÉRDIDA` para tickets finalizados según las reglas económicas aprobadas.
- **Documentación:** se documentó explícitamente la nueva regla de cálculo del fondo.

## V5.6.2-beta — correcciones adicionales de prueba
- **Garantía editable:** la casilla Garantía aparece en la edición del ticket y puede marcarse o desmarcarse después de la creación.
- **Pérdidas y fondo:** un ticket finalizado con ganancia total negativa resta la pérdida absoluta del fondo físico del taller. Los tickets con ganancia no negativa siguen aportando únicamente su margen.
- **Orden estable:** Historial ya no utiliza `ordenFecha` como segundo criterio; cuando el criterio principal empata, se conserva el orden existente del array.

## V5.6.3-beta — 2026-10-08
- Contabilidad: las tarjetas de tickets finalizados muestran explícitamente el **Incremento del taller**.
- El incremento del taller corresponde al margen del ticket cuando existe ganancia.
- Cuando existe pérdida, se muestra **Impacto en taller** con el importe negativo que reduce el fondo.
- Se muestra también el equivalente en USD para operaciones en CUP.

## V5.6.4-beta

- Corregido el flujo de sugerencias económicas: Inversión, Margen y Precio final empiezan vacíos. Al introducir una inversión, Margen y Precio final muestran sugerencias mediante `placeholder`, sin escribir valores en los campos. Si el usuario deja un campo sugerido vacío al guardar, se usa la sugerencia como valor almacenado.
- Corregida la normalización de tickets con pérdida: si la ganancia total es negativa, el margen se fuerza a 0 y la ganancia disponible queda igual a la ganancia total negativa. También se corrigen registros antiguos al cargarlos.
- Al reabrir un ticket por garantía, la nueva ficha marca automáticamente `Garantía`.
- La tarjeta de cada TK en Contabilidad muestra ahora su tasa CUP/USD histórica.
- Se mantienen las correcciones validadas de Incremento/Impacto en taller, fondo, PÉRDIDA, BAJA RENTABILIDAD, garantía editable y categoría Sin definir única.


## V5.6.5-beta — 2026-10-08
- **Edición de Economía reorganizada:** los datos económicos ahora se presentan integrados como cuadros dentro de la misma cuadrícula de información del ticket, sin una sección separada de edición debajo.
- **Margen:** se renombra definitivamente “Reinversión del taller” a **Margen**, manteniendo la terminología utilizada en el resto de la aplicación.
- **Campos editables:** Margen, Moneda, Tasa cambiaria y Técnico(s) se editan directamente en sus propios cuadros. Los datos derivados del ticket se muestran como información de consulta.
- **Tope del margen:** el margen no puede superar la Ganancia Total; si la ganancia total es negativa, el margen queda en 0. El control limita el valor al máximo válido y el valor disponible se actualiza al modificar el margen.
- Se mantiene la corrección de pérdida, garantía, tasa histórica e impacto/incremento del taller.


## V5.6.6-beta — 2026-10-08
- **Economía completa integrada:** se conserva toda la información económica mostrada anteriormente dentro de una única cuadrícula de cuadros.
- Se reincorpora **Subtotal de esta operación** a la vista económica. Si el ticket no tiene un subtotal almacenado, se muestra como no definido en lugar de inventar un valor.
- Los campos económicos editables continúan integrados directamente en sus propios cuadros: **Margen, Moneda, Tasa cambiaria y Técnico(s)**.
- Se mantiene **Margen** como terminología oficial en lugar de “Reinversión del taller”.
- El margen continúa limitado a la Ganancia Total y se fuerza a 0 cuando existe pérdida.
- En los detalles económicos generales se usa también “Margen” para mantener terminología consistente.


## V5.6.9-beta — Corrección del flujo de garantías
- Al reabrir un ticket se pregunta explícitamente si el ingreso es por garantía (Aceptar = sí; Cancelar = ingreso normal).
- Cada reingreso crea un nuevo Ticket ID y un nuevo Equipo ID; si es por garantía, conserva el vínculo al Ticket ID original.
- Se distingue la posible reclamación de garantía (`garantia`) de la garantía concedida al cliente (`garantiaConcedida`).
- En edición se puede conceder una garantía al entregar, configurar duración/unidad/fecha de inicio y calcular vencimiento.
- Examinar muestra los datos de la garantía concedida y, en reingresos vinculados, el ticket original y el resumen de su garantía.
- Se mantienen compatibles los tickets antiguos sin campos de garantía nuevos.


## V5.6.10-beta
- Corregido el flujo de reapertura: primero confirma si se desea reabrir el ticket; si se acepta, pregunta por separado si el nuevo ingreso es por garantía. Cancelar la primera pregunta mantiene el ticket cerrado; cancelar la segunda crea un reingreso normal.


## V5.6.11-beta
- Corrección: al crear un reingreso por garantía, conserva el Equipo ID del ticket original, ya que corresponde al mismo equipo físico. El Ticket ID sigue siendo nuevo. Los reingresos normales continúan generando un Equipo ID nuevo.


## V5.6.12-beta
- Corrección de la semántica de reingreso: tanto el reingreso por garantía como el reingreso normal conservan el Equipo ID del equipo físico original.
- Solo un ingreso nuevo iniciado desde Nuevo ticket genera un Equipo ID nuevo. Cada reingreso continúa generando un Ticket ID nuevo.


## V5.6.13-beta
- Compacta la configuración de garantía: duración numérica junto a selector de unidad.
- Elimina la fecha de inicio editable; la garantía comienza automáticamente en la fecha de salida/entrega.
- Mantiene el cálculo automático de vencimiento y el resto de la lógica existente.


## V5.6.14-beta — Indicador de garantía en tarjetas
- Añade a la esquina superior derecha de las tarjetas un escudo con el estado de la garantía concedida al cliente y los días restantes.
- Las garantías vencidas se identifican como **Garantía vencida**; las garantías futuras muestran la fecha de inicio; las tarjetas sin garantía concedida no muestran el escudo.
- Se centraliza el cálculo del estado de la garantía para mantener coherentes la tarjeta, el detalle y el resumen del ticket original al registrar un reingreso. La fecha de vencimiento se considera incluida.
- Se actualiza la versión visible en `index.html`, la constante `APP_VERSION`, `version.txt`, el nombre de caché del service worker y la documentación. No se cambian la navegación, el almacenamiento ni las reglas de creación de tickets.


## V5.6.20-beta
- Se integran directamente los SVG claros y oscuros proporcionados por el usuario.
- Se corrige la selección del logotipo según el tema activo.
- Se mejora el contraste de la X de cierre, etiquetas de estado y textos secundarios en temas claro, oscuro y sistema.


## V5.6.24-beta — Campos económicos vacíos y sugerencias
- En un ticket nuevo, Inversión, Margen y Precio final permanecen vacíos inicialmente.
- Al introducir una inversión positiva, Margen y Precio final muestran placeholders calculados con las reglas existentes (margen del 60 % redondeado hacia arriba al siguiente múltiplo de 50; precio mínimo 1000, al menos el doble de la inversión y al menos inversión + margen sugerido + 500).
- Las sugerencias son orientativas y no se guardan como importes reales si el usuario deja los campos vacíos.
- Se conserva el comportamiento de los registros existentes; se actualiza la caché de la PWA.

## V6.0-dev-v14 — preparación PWA/offline (2026-10-20)
- Se completó el manifiesto PWA con identidad NEXUM, `start_url`/`scope`, iconos PNG de 192 y 512 px, icono maskable y apple-touch-icon.
- Se amplió el HTML con metadatos de instalación móvil e iconos.
- Se reforzó el service worker: cachea todos los recursos locales necesarios, reclama clientes tras activar y ofrece fallback a `index.html` para navegación sin conexión.
- La limpieza de caché ahora solo elimina cachés de versiones NEXUM, no las de otras aplicaciones del mismo origen.
- El botón Instalar dispone de ayuda manual si el navegador no emite `beforeinstallprompt`.
- Se sincronizaron `version.txt`, título/etiqueta, changelog y versión de caché.
- Límite conocido: el service worker requiere HTTPS o localhost; `file://index.html` no puede tener PWA/offline de la misma manera. Esta corrección no certifica todavía la sincronización cloud ni la conservación de datos entre orígenes.
