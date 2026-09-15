# FitSense — landing page

Landing interactiva de FitSense, con fotografía editorial y una demo que se puede probar antes de descargar.

```
index.html      estructura y contenido
styles.css      sistema visual (paleta, tipografía, movimiento)
script.js       zoom al hacer scroll, semana interactiva, tarjetas y diálogos
assets/         cuatro fotografías WebP locales y sus prompts de generación
fonts/          Archivo variable (SIL OFL 1.1, ver fonts/OFL.txt)
```

Sin build ni dependencias: se abre `index.html` y funciona.

Para servirla en local: `py -m http.server 5173 --bind 127.0.0.1`.

## Interacciones actuales

- La foto de portada pasa de un encuadre lateral a ocupar la pantalla al bajar; una segunda escena amplía otra imagen. El desplazamiento sigue siendo nativo, sin bloquear ni interceptar la rueda o el gesto táctil.
- El contador de “Tu semana” refleja exactamente los días seleccionados, de 0 a 7. Sin selección, muestra 0. Series y repeticiones están en un detalle opcional y también quedan en 0.
- La selección solo cambia por acciones del usuario; no hay selección automática de días.
- “Voy con todo”, “Tengo poco tiempo” y “Quiero volver” prueban semanas de 3, 2 y 0 días. El anillo y el mensaje se actualizan al tocar cada día.
- Las tarjetas fotográficas se amplían al seleccionarlas; funcionan con clic, Enter, Espacio y flechas. Su enlace lleva a la demo con una semana relacionada con la opción elegida.
- El menú móvil y el aviso de descarga usan diálogos nativos para mantener el foco y cerrar con Escape. Las preguntas usan detalles nativos, disponibles incluso sin JavaScript.
- El botón de pausa detiene los efectos. La preferencia del sistema de movimiento reducido elimina las escenas con scroll prolongado y las animaciones; los controles siguen funcionando.
- Los botones “Empieza gratis” y “Quiero empezar” abren un aviso con acceso a la demo. **Faltan los enlaces reales de App Store y Google Play**; no se simula una descarga.

## Imágenes

Las cuatro imágenes suman aproximadamente 526 KB: `hero-wide.webp` (95.6 KB), `energy.webp` (174.4 KB), `training.webp` (118.5 KB) y `equipment.webp` (137 KB). La portada se carga con prioridad; las demás imágenes usan carga diferida. Generadas con ImageGen; los prompts completos están en `assets/README.md`.

## Validación de esta revisión

Verificado en el navegador: ampliación de ambas imágenes al desplazar, pausa que conserva el encuadre, semanas de 3/2/0 días, contador completo de 0 a 7 y vuelta a 0, tarjetas por clic y teclado, detalle opcional, preguntas y diálogos con movimiento pausado, menú móvil y restauración del foco. Anchos de 1265, 390 y 320 px sin desbordamiento horizontal. Sin errores de consola; JavaScript validado con `node --check script.js`.

## Referencia del diseño inicial

Las reglas de abajo son históricas y no describen el diseño actual. La versión actual prioriza fotos que se amplían al bajar, mensajes breves, bloques de color y una semana interactiva, en lugar de las tablas y capturas iniciales.

## Sistema visual

| Rol | Valor |
|---|---|
| Fondo | `#0F1216` |
| Superficie | `#171B22` |
| Acción | `#D3FF48` (solo botones) |
| Texto | `#EDEDE7` |
| Secundario | `#9A9E94` |
| Texto sobre lima | `#0F1216` |

Bordes hairline 1px blanco al 8%. Sin sombras ni degradados. Grano al 2% sobre el
fondo. Tipografía Archivo: titulares en Expanded (`wdth 125`) peso 600 con
tracking -0.02em, cuerpo regular a 1.6 de interlínea, cifras tabulares,
sentence case en toda la página.

## El lima aparece una sola vez por pantalla

La regla se cumple en tiempo de ejecución, no por disciplina al escribir el
HTML. `script.js` observa los cinco puntos de descarga y deja en lima solo uno,
con esta prioridad:

1. El botón de sección que esté en pantalla (hero, cómo funciona, cierre).
2. La barra fija inferior, en celular, cuando el hero ya salió.
3. El botón del nav, cuando no hay ninguno de los anteriores.

Los demás pasan a contorno hairline. Verificado recorriendo la página cada
200px en 1440 y en 390: siempre exactamente un lima visible.

## Movimiento

Solo `transform` y `opacity`, con una excepción pedida: la altura del acordeón.

- Spring propio (rigidez 200, amortiguación 26) con integración a 240Hz.
  Interrumpible: al cambiar el objetivo sigue desde la posición y la velocidad
  actuales, nunca reinicia.
- Hover y press 150ms `cubic-bezier(.4,0,.2,1)`; entradas 450ms
  `cubic-bezier(.16,1,.3,1)` con 16px de desplazamiento, una sola vez.
- Escalonado de 45ms entre casilleros al recalcular.
- Botón: press a `scale(.97)` con spring; el hover aclara el relleno 6% y no
  toca la escala.
- `prefers-reduced-motion` apaga todo y los springs saltan al valor final. La
  demo del hero sigue siendo usable.

## La demo del hero

Siete casilleros de lunes a domingo. Se tocan para marcar los días entrenados y
el plan de la semana siguiente se recalcula en vivo: días, series y
repeticiones. Arranca con tres marcados y se anima sola una vez, salvo que la
persona la toque antes o pida menos movimiento.

## Decisiones donde el brief se cruzaba consigo mismo

- **Texto del botón del nav.** El brief pide "Descargar" en el nav y, a la vez,
  cero variaciones del texto. Mandó la regla dura: dice "Descargar la app" en
  los cinco lugares.
- **Precios en el nav.** No hay sección de precios en la lista de secciones. El
  enlace lleva al cierre, que es donde está el precio: "Gratis · iOS y Android".
- **Menú en celular.** "Logo + botón" no deja dónde abrir el menú inferior, así
  que hay un botón de menú en contorno hairline (nunca lima) junto al de
  descarga.
- **Máximo 40 palabras por sección.** Se cuenta el texto de la página. Las
  etiquetas dentro de la demo y de las capturas de la app son interfaz del
  producto, no copy. Con el acordeón abierto, preguntas frecuentes llega a 45.
- **Altura del acordeón.** Es la única animación que no es transform ni opacity,
  porque el brief la pide explícitamente.

## Accesibilidad

Foco de teclado visible en todo elemento interactivo (anillo 2px separado 2px).
Los casilleros son `role="checkbox"` con `aria-checked`; el plan se anuncia con
`aria-live`. El acordeón usa `aria-expanded` y saca del árbol de accesibilidad
la respuesta cerrada. Sin JavaScript, todas las secciones y respuestas se ven.
