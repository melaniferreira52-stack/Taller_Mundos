# mundos-ia 🌍

Un programa de consola para el **Taller de mundos** (SENA, Node.js): recibe por
parámetros una **situación**, un **mundo** y **5 colores**, guarda esos datos en un
JSON, le pide a un **modelo de lenguaje gratuito** que escriba la descripción de una
imagen de ese mundo imaginario y, con esa descripción, un **modelo de imágenes
gratuito** genera y guarda la imagen.

```
 [Terminal: situación, mundo y 5 colores]
                  │  process.argv
                  ▼
 data/mundo_<id>.json              (objeto JSON)
                  │  se lee el JSON guardado
                  ▼
 API de TEXTO  (fetch)  ───►  descripciones/mundo_<id>.txt
                  │  se envía la descripción
                  ▼
 API de IMAGEN (fetch)  ───►  imagenes/mundo_<id>.jpg
```

## Cómo funciona

1. **Paso 1** — Valida los 7 argumentos (situación, mundo y 5 colores), calcula un
   `id` estable con `object-hash` (los mismos datos ⇒ mismo id) y guarda el objeto en
   `data/mundo_<id>.json`.
2. **Paso 2** — Vuelve a **leer el JSON desde el archivo** y lo envía con `fetch` a la
   API de texto. El mensaje de sistema pide un párrafo en inglés de 80 a 120 palabras
   que describa una imagen, mencionando los 5 colores. La descripción se guarda en
   `descripciones/mundo_<id>.txt`.
3. **Paso 3** — Lee la descripción desde el `.txt` y la envía a la API de imágenes.
   Convierte la respuesta (base64 o bytes) y guarda la imagen en
   `imagenes/mundo_<id>.jpg`.

### Ahorro de cuota

Si `descripciones/mundo_<id>.txt` ya existe, **no** se llama al modelo de texto. Si
`imagenes/mundo_<id>.jpg` ya existe, **no** se llama al modelo de imágenes. Así puedes
volver a ejecutar el mismo comando sin gastar créditos.

## Requisitos previos

- Node.js 20.12 o superior (`node -v`)
- npm y Git
- Una cuenta gratuita en el servicio de texto y otra en el de imágenes (ver abajo)

## Configuración

1. Clona o copia el proyecto.
2. Copia `.env.example` a `.env` y pega tus claves:

```bash
cp .env.example .env
```

```
TEXTO_API_KEY=pega_aqui_tu_clave
TEXTO_URL=https://api.groq.com/openai/v1/chat/completions
TEXTO_MODELO=openai/gpt-oss-20b
IMAGEN_API_KEY=pega_aqui_tu_token
IMAGEN_URL=https://api.cloudflare.com/client/v4/accounts/TU_ACCOUNT_ID/ai/run/@cf/black-forest-labs/flux-1-schnell
```

> ⚠️ **Nunca subas `.env` a Git.** Ya está en `.gitignore`. Si alguna vez aparece tu
> clave en un chat o en un repositorio, revócala en la consola del servicio y crea una
> nueva.

3. Instala la única dependencia permitida por el taller:

```bash
npm install
```

## Uso

```bash
npm start -- "<situación>" "<mundo>" <color1> <color2> <color3> <color4> <color5>
```

Ejemplo real:

```bash
npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta
```

Las comillas son necesarias: sin ellas, cada palabra de la situación o del mundo
llegaría como un argumento distinto.

Salida esperada:

```
Paso 1: mundo guardado en data/mundo_cba86145.json
Paso 2: descripción guardada en descripciones/mundo_cba86145.txt
Paso 3: imagen guardada en imagenes/mundo_cba86145.jpg
Listo. Revisa la carpeta imagenes/
```

Si ejecutas el mismo comando otra vez, el programa reutiliza los archivos y no llama a
ninguna API:

```
Paso 1: mundo guardado en data/mundo_cba86145.json
Paso 2: la descripción ya existía, no se llamó al modelo de texto.
Paso 3: la imagen ya existía, no se llamó al modelo de imágenes.
Listo. Revisa la carpeta imagenes/
```

## Estructura del proyecto

```
mundos-ia/
├── src/
│   ├── index.js     # orquesta los pasos 1 a 3 (Parte 5)
│   ├── mundo.js     # valida los argumentos, crea el objeto y lo guarda o lee (Parte 2)
│   ├── texto.js     # consulta al modelo de lenguaje con fetch (Parte 3)
│   └── imagen.js    # consulta al modelo de imágenes y devuelve los bytes (Parte 4)
├── data/            # JSON de cada mundo (NO va a Git)
├── descripciones/   # .txt de cada descripción (NO va a Git)
├── imagenes/        # .jpg de cada imagen (NO va a Git)
├── evidencias/      # capturas de pantalla y pruebas (Parte 6)
├── .env             # tus claves (NO va a Git)
├── .env.example     # plantilla sin claves reales (sí va a Git)
├── .gitignore
├── package.json
├── README.md
└── PROMPT.md
```

## Servicios gratuitos elegidos

| Servicio | Para qué | Clave que necesitas |
|---|---|---|
| [Groq](https://console.groq.com/keys) | Texto (modelo `openai/gpt-oss-20b`) | `TEXTO_API_KEY` |
| [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) | Imagen (FLUX.1-schnell) | `IMAGEN_API_KEY` + tu Account ID en `IMAGEN_URL` |

El programa **detecta el servicio por el contenido de la URL** (`ai.api.nvidia.com`,
`api.cloudflare.com` o `image.pollinations.ai`) y por el `content-type` de la respuesta
(JSON con base64 o bytes directos), así que funciona con cualquiera de las tres opciones
de la guía. Para cambiar de servicio solo editas `.env`.

### Límites gratuitos

- **Groq**: 30 peticiones por minuto y 1.000 por día (plan gratuito).
- **Cloudflare Workers AI**: 10.000 "neuronas" gratis por día, compartidas por todos
  los modelos de tu cuenta.
- Si recibes 401/403, 402/429, 404/410 o un timeout, el programa muestra un mensaje en
  español explicando qué pasó (Parte 5).

## Experimentos de publicación (Parte 6)

Ejecuté `npm publish --dry-run` (sin publicar de verdad) en dos situaciones:

| Situación | ¿Aparece `.env`? | ¿Aparecen `data/`, `descripciones/`, `imagenes/`? |
|---|---|---|
| Con `.gitignore` | ❌ No | ❌ No (14 archivos en el tarball) |
| Sin `.gitignore` (renombrado a `.gitignore.off`) | ✅ **Sí (¡con tus claves!)** | ✅ Sí (28 archivos en el tarball) |

**¿Por qué es peligroso?** Si publicas el paquete sin `.gitignore` (o sin un
`.npmignore`), npm incluiría tu `.env` dentro del tarball y **cualquiera que descargue
el paquete tendría tus claves de API**. Por eso `.gitignore` (o `.npmignore`) es
obligatorio, y por eso el taller pide hacer este experimento para verlo con tus propios
ojos. Después del experimento restauré el nombre del archivo.

## Preguntas de reflexión

### ¿Por qué el id se calcula sin la fecha? ¿Qué pasaría si la incluyeras?

Porque el id debe ser **estable**: los mismos datos (situación, mundo y colores) deben
producir siempre el mismo id. Si incluyeras `creadoEn`, el id cambiaría en **cada
ejecución** (la fecha siempre es distinta), y nunca se reutilizarían los archivos: cada
vez llamarías a las APIs y gastarías tu cuota gratuita. La fecha sí se guarda en el JSON
como información, pero no participa en el hash.

### ¿Por qué se le pide al modelo de texto la descripción en inglés?

Porque los modelos de generación de imágenes (como FLUX.1-schnell) fueron entrenados
principalmente con textos en inglés y **entienden mejor las instrucciones en ese
idioma**. Si probaras la misma descripción en español, probablemente la imagen saldría
menos fiel a lo pedido. El mensaje de sistema indica además el rango de palabras (80 a
120) y qué describir (escena, elementos, iluminación, composición y estilo artístico)
para que el resultado sea una descripción de imagen, no un cuento.

### ¿Qué diferencia hay entre una respuesta JSON de texto y una respuesta con los bytes de una imagen? ¿Qué es base64?

- La API de **texto** responde un **JSON** (texto estructurado) y la descripción está
  en `datos.choices[0].message.content`.
- La API de **imágenes** responde o un JSON con la imagen **codificada en base64**
  (NVIDIA, Cloudflare) o los **bytes crudos** de la imagen (Pollinations).

**base64** es una forma de representar datos binarios como texto, para poder
transportarlos dentro de un JSON (que solo admite caracteres de texto). Una imagen no
se puede poner "tal cual" dentro de un JSON, así que se convierte: los bytes se agrupan
y se mapean a 64 caracteres seguros (`A-Z`, `a-z`, `0-9`, `+`, `/`). Para recuperar los
bytes reales se usa `Buffer.from(textoBase64, 'base64')`.

### ¿Qué pasaría si guardas la imagen con 'utf-8'? ¿Por qué?

`writeFileSync(ruta, bytes, 'utf-8')` **intentaría interpretar los bytes como texto**:
los convertiría con la codificación UTF-8 y, al volver a escribir, los bytes no serían
los originales. La imagen quedaría **dañada y no se abriría** en el visor. Por eso el
taller insiste en guardar los bytes **tal cual, sin segundo argumento de encoding**:
`fs.writeFileSync(ruta, bytes)`.

### ¿Qué pasos consumen cuota gratuita y cómo evitaste repetirlos?

Consumen cuota el **Paso 2** (llamada al modelo de texto) y el **Paso 3** (llamada al
modelo de imágenes). El Paso 1 no: solo escribe un archivo local. Evité repetirlos
comprobando con `fs.existsSync` si `descripciones/mundo_<id>.txt` o
`imagenes/mundo_<id>.jpg` ya existen: si existen, se leen del archivo y **no** se llama
a la API. Como el id es estable, el mismo comando siempre encuentra los mismos archivos.

### Si usaste IA: ¿qué fue lo más difícil de pedirle y qué parte tuviste que corregir tú?

Ver sección "Uso de IA" del `PROMPT.md`.

## Errores frecuentes y solución

| Síntoma | Causa probable |
|---|---|
| `Cannot read properties of undefined (reading '0')` | La API devolvió un error y la respuesta no trae `choices` ni `artifacts`. |
| `410 Gone ... has reached its end of life` | El modelo de NVIDIA fue retirado: elige otro de la lista vigente. |
| `402` con `FREE_LIMIT` | Superaste el límite sin clave de Pollinations: espera o usa otro servicio. |
| `401` o `403` | Clave mal copiada, con espacios o comillas en el `.env`, o sin permisos (Cloudflare: el token necesita acceso a Workers AI). |
| La imagen no abre o se ve dañada | La guardaste con `'utf-8'`, o guardaste el JSON completo en vez de los bytes. |
| El id cambia en cada ejecución | Incluiste `creadoEn` en el cálculo del hash. |
| `npm start` ignora tus argumentos | Falta el doble guion: `npm start -- "..." "..." ...`. |
| `TypeError: fetch failed` | Sin internet, URL mal escrita, o un proxy/firewall bloquea la conexión. |

## Licencia

ISC — proyecto educativo del SENA.
