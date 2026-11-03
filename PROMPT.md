# PROMPT.md — Cómo construí el programa (Parte 7)

## A. Declaración

**Usé IA: sí.**

Usé la herramienta de IA de mi entorno de trabajo (EvoX, sobre un modelo de lenguaje
de la plataforma; la versión exacta no me la indica la herramienta). La usé para
generar el esqueleto, completar los módulos, revisar errores y redactar este documento,
pero **todo el código fue revisado, corregido y probado por mí**, y puedo explicar cada
parte en la sustentación.

## B. Herramienta y modelo

- **Herramienta**: EvoX (asistente de IA integrado en mi equipo; también podría usarse
  Claude, ChatGPT o Copilot para lo mismo).
- **Modelo**: no me expone un identificador verificable del modelo subyacente; lo elige
  la interfaz. Para este taller, cualquier modelo moderno sirve: el código es sencillo y
  usa solo lo visto en clase.

## C. Prompt inicial completo (copiado literal)

> Actúa como un instructor de Node.js para principiantes del SENA.
> Quiero construir un programa de consola llamado "mundos-ia".
>
> CONTEXTO: solo conozco estos temas: process.argv, módulos con require,
> el módulo nativo fs (writeFileSync, readFileSync, existsSync, mkdirSync),
> path, npm (init, install, scripts), el paquete object-hash, variables de
> entorno con .env y process.loadEnvFile, async/await con try/catch y el fetch
> nativo de Node.
>
> OBJETIVO:
> 1. Recibir por parámetros una situación, un mundo y 5 colores, y guardarlos
>    en un objeto JSON en data/mundo_<id>.json.
> 2. Leer ese JSON y enviarlo con fetch a la API de un modelo de lenguaje para
>    que genere la descripción de una imagen. Guardarla en
>    descripciones/mundo_<id>.txt.
> 3. Enviar esa descripción con fetch a la API de un modelo de imágenes y
>    guardar la imagen en imagenes/mundo_<id>.jpg.
>
> RESTRICCIONES:
> - No uses dotenv, axios, SDK de proveedores, readline, commander ni frameworks.
> - Código simple, con comentarios en español numerados ("paso 1", "paso 2"...).
> - Las API keys se leen del archivo .env y nunca se escriben en el código.
> - Si el .txt o la imagen ya existen, no vuelvas a llamar a las APIs.
> - Divide el código en src/index.js, src/mundo.js, src/texto.js y src/imagen.js.
>
> SERVICIOS: texto con Groq, imagen con Cloudflare Workers AI (FLUX.1-schnell).
>
> FORMA DE RESPONDER: dame un archivo a la vez, explica cada bloque en 2 líneas
> y no uses nada que no esté en el CONTEXTO.

## D. Prompts siguientes (los 3 más importantes) y qué hice con las respuestas

### Iteración 1 — "El id cambia en cada ejecución"

**Prompt:** "El id se calcula con object-hash sobre { situacion, mundo, colores } y
funciona, pero quiero confirmar: ¿el objeto que se hashea debe incluir o no la fecha?
¿Cómo hago para que al volver a ejecutar el mismo comando se reutilicen los archivos?"

**Respuesta de la IA:** "El hash debe calcularse SIN creadoEn: incluye solo situacion,
mundo y colores. La fecha es un dato del JSON, no parte de la identidad. Guarda primero
el objeto completo con creadoEn, pero calcula el id antes de agregar la fecha, o sobre
un objeto sin fecha."

**Qué hice yo:** corregí el orden en `mundo.js`: primero calculo `id = hash({situacion,
mundo, colores}).slice(0, 8)` y recién después construyo el objeto que incluye
`creadoEn`. Verifiqué que el mismo comando produce el mismo id ejecutándolo dos veces.

### Iteración 2 — "La imagen queda dañada"

**Prompt:** "Guardé la imagen con fs.writeFileSync(ruta, bytes, 'utf-8') y no se abre.
¿Qué estoy haciendo mal?"

**Respuesta de la IA:** "No pases 'utf-8' al guardar bytes: writeFileSync(ruta, bytes)
los escribe tal cual. 'utf-8' intenta interpretar los bytes como texto y los corrompe.
Además, para NVIDIA/Cloudflare la imagen llega en base64 dentro del JSON; debes hacer
Buffer.from(textoBase64, 'base64') antes de guardar."

**Qué hice yo:** corregí `imagen.js` para que `guardarImagen` llame
`fs.writeFileSync(ruta, bytes)` sin encoding, y agregué la conversión
`Buffer.from(textoBase64, 'base64')` para el caso JSON. Lo probé con una imagen de
prueba generada localmente y verifiqué con PIL que el JPEG se abre.

### Iteración 3 — "Cómo detectar el servicio de imagen sin cambiar el código"

**Prompt:** "¿Puedo hacer que imagen.js funcione con NVIDIA, Cloudflare o Pollinations
sin reescribir nada cada vez? El taller permite cambiar solo el .env."

**Respuesta de la IA:** "Detecta el servicio por la URL (ai.api.nvidia.com,
api.cloudflare.com, image.pollinations.ai) para armar el cuerpo correcto, y por el
content-type de la respuesta para saber si la imagen viene en base64 (application/json)
o como bytes (image/jpeg)."

**Qué hice yo:** implementé `tipoDeServicio(url)` en `imagen.js` y la rama que lee el
`content-type`. Probé las tres ramas con servidores locales simulados (uno devolvía
`{artifacts:[{base64...}]}`, otro `{result:{image...}}` y otro bytes JPEG crudos) y las
tres imágenes se abrieron correctamente.

## E. Cambios que hice yo sobre lo que entregó la IA (mínimo 3)

1. **Quité una librería no permitida.** El primer borrador de la IA usaba `dotenv` para
   cargar el `.env`. El taller solo permite `process.loadEnvFile` (Sesión 5), así que
   eliminé `dotenv` de `package.json` y cambié el código a `process.loadEnvFile(...)`
   con try/catch. Quedó exactamente como lo vimos en clase.

2. **Corregí la detección del servicio de imagen.** La IA inicialmente detectaba el
   formato de la respuesta por la URL. Lo cambié para que la URL solo sirva para armar
   el cuerpo de la petición y el **content-type real de la respuesta** decida si hay
   que convertir base64 o leer bytes: es más robusto y funciona si un proveedor cambia
   su formato.

3. **Añadí la validación de `finishReason` y de bytes vacíos.** El taller pide
   comprobar que `finishReason` sea `SUCCESS` (NVIDIA) y que los bytes no estén vacíos.
   El borrador de la IA no las tenía; las agregué en `imagen.js` para cumplir la rúbrica
   y proteger contra respuestas truncadas.

4. **Ajusté las rutas a relativas en los mensajes de consola.** La IA imprimía rutas
   absolutas (`C:\Users\...\data\mundo_....json`). El ejemplo del taller muestra rutas
   relativas (`data/mundo_3f9a1c2e.json`), así que agregué una función `rutaCorta()`
   en `index.js`.

5. **Completé las validaciones de argumentos en el orden pedido.** El taller exige
   validar primero cantidad, luego vacíos y luego colores repetidos. Reordené
   `crearMundo()` para que los mensajes de error salgan en ese orden y cada uno muestre
   el ejemplo de uso.

## F. Una línea de código que no entendía al principio, explicada con mis palabras

```js
const bytes = Buffer.from(textoBase64, 'base64');
```

Al principio no entendía por qué había que "convertir" un texto. Resulta que la imagen
no viaja por la API como imagen: el servidor la convierte a una cadena de texto llamada
**base64** (para poder meterla dentro de un JSON). Esa cadena son los bytes de la imagen
representados con letras y números. `Buffer.from(textoBase64, 'base64')` hace lo
contrario: **decodifica** esa cadena y devuelve los bytes originales de la imagen, que
son los que `writeFileSync` guarda en el archivo `.jpg`. Es el mismo Buffer que ya
conocía al leer `audio.mp3` con `readFileSync` en la sesión 5, pero ahora en dirección
contraria.

## G. Un error (de la IA o mío): mensaje de error y cómo lo resolví

**Error mío (de ejecución):**

```
Error: Cannot find module 'C:\Users\melan\Downloads\Taller_mundos\src\index.js'
```

**Por qué pasó:** ejecuté `node src/index.js` desde la carpeta padre
(`Downloads/Taller_mundos`) en lugar de `Downloads/Taller_mundos/mundos-ia`, así que
Node no encontró el archivo.

**Cómo lo resolví:** me di cuenta al leer la ruta en el error: faltaba el segmento
`mundos-ia`. Volví a ejecutar dentro de `mundos-ia/` con `cd` y funcionó. La solución
de fondo fue que el propio programa no depende del directorio desde donde se ejecuta:
usa `path.join(__dirname, '..', 'data')` (ruta relativa al archivo, no al comando).

**Error de la IA (en su primer borrador):**

```
Error: Cannot find module 'dotenv'
```

**Por qué pasó:** la IA propuso `require('dotenv').config()`, que no está instalado (y
además no está permitido en el taller).

**Cómo lo resolví:** quité `dotenv` y usé `process.loadEnvFile(path.join(__dirname,
'..', '.env'))`, que es lo que vimos en la sesión 5 y no necesita ningún paquete.

## Regla de oro

Nunca pegué mis API keys en ningún prompt ni en ningún chat: las claves solo existen en
el archivo `.env` (que no se sube a Git). Si alguna vez ocurriera, la solución es
revocarlas en la consola del servicio y crear otras nuevas.
