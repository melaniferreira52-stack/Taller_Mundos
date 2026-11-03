// imagen.js
// Consulta al modelo de imágenes con fetch y devuelve los bytes de la imagen.
// Parte 4 del taller: enviar la descripción y guardar la imagen en imagenes/mundo_<id>.jpg

const fs = require('fs');
const path = require('path');
const { DIR_PROYECTO } = require('./mundo');

const DIR_IMAGENES = path.join(DIR_PROYECTO, 'imagenes');

/**
 * Detecta el servicio a partir de la URL del .env, solo para armar el CUERPO
 * de la petición (cada servicio pide campos distintos).
 * La forma en que LLEGA la imagen no se adivina por la URL: se mira el
 * content-type de la respuesta (abajo), que es lo que realmente dice la verdad.
 */
function tipoDeServicio(url) {
    if (!url) return 'desconocido';
    if (url.includes('ai.api.nvidia.com')) return 'nvidia';
    if (url.includes('api.cloudflare.com')) return 'cloudflare';
    if (url.includes('image.pollinations.ai')) return 'pollinations';
    return 'desconocido';
}

/**
 * Convierte una respuesta HTTP fallida en un mensaje claro en español.
 */
function errorDeRespuesta(respuesta) {
    if (respuesta.status === 401 || respuesta.status === 403) {
        return new Error('La API key no es válida. Revisa tu archivo .env (el token de Cloudflare necesita acceso a Workers AI).');
    }
    if (respuesta.status === 402 || respuesta.status === 429) {
        const retry = respuesta.headers.get('retry-after');
        const aviso = retry ? ` Espera ${retry} segundos.` : ' Espera un momento.';
        return new Error('Superaste el límite gratuito.' + aviso);
    }
    if (respuesta.status === 404 || respuesta.status === 410) {
        return new Error('El modelo o la URL no existen. Revisa tu configuración.');
    }
    return new Error(`El servicio respondió con el estado ${respuesta.status}. Intenta de nuevo más tarde.`);
}

/**
 * Parte 4 — Envía la descripción al modelo de imágenes y devuelve los bytes (Buffer).
 * Usa AbortSignal.timeout(60000): generar una imagen tarda más que generar texto.
 */
async function generarImagen(descripcion) {
    const url = process.env.IMAGEN_URL;
    const clave = process.env.IMAGEN_API_KEY;
    const servicio = tipoDeServicio(url);

    // Cabeceras: el token solo se manda si existe (Pollinations no lo necesita)
    const cabeceras = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (clave && !clave.includes('pega_aqui')) {
        cabeceras.Authorization = `Bearer ${clave}`;
    }

    let peticion;

    if (servicio === 'pollinations') {
        // GET sin cuerpo y sin clave; la descripción va dentro de la URL
        peticion = {
            method: 'GET',
            signal: AbortSignal.timeout(60000)
        };
        // La URL se completa abajo, después de armar las cabeceras
    } else {
        // POST con un JSON en el cuerpo
        let cuerpo;
        if (servicio === 'nvidia') {
            cuerpo = { prompt: descripcion, width: 1024, height: 1024, steps: 4, seed: 0 };
        } else if (servicio === 'cloudflare') {
            // Cloudflare: prompt (máx. 2048 caracteres) y steps (hasta 8)
            cuerpo = { prompt: descripcion, steps: 4 };
        } else {
            // Servicio desconocido: se envían los campos habituales
            cuerpo = { prompt: descripcion, steps: 4 };
        }
        peticion = {
            method: 'POST',
            headers: cabeceras,
            body: JSON.stringify(cuerpo),
            signal: AbortSignal.timeout(60000)
        };
    }

    // La URL de Pollinations lleva la descripción codificada
    const urlFinal = servicio === 'pollinations'
        ? `${url}${encodeURIComponent(descripcion)}?width=1024&height=1024&nologo=true`
        : url;

    let respuesta;
    try {
        respuesta = await fetch(urlFinal, peticion);
    } catch (error) {
        // fetch lanza TypeError sin conexión; TimeoutError cuando se agota el tiempo
        if (error.name === 'TimeoutError') {
            throw new Error('El servicio tardó demasiado en responder.');
        }
        throw new Error('No se pudo conectar. Revisa tu internet o la URL.');
    }

    if (!respuesta.ok) {
        throw errorDeRespuesta(respuesta);
    }

    // ¿Cómo llegó la imagen? Dos casos, según el content-type de la respuesta:
    //  - application/json      => viene en base64 dentro de un JSON (NVIDIA, Cloudflare)
    //  - image/jpeg, etc.      => viene directamente como bytes    (Pollinations)
    const tipoContenido = respuesta.headers.get('content-type') || '';

    let bytes;

    if (tipoContenido.includes('application/json')) {
        const datos = await respuesta.json();

        // NVIDIA: datos.artifacts[0].base64 · Cloudflare: datos.result.image
        let textoBase64;
        let finishReason;

        if (datos && datos.artifacts && datos.artifacts[0] && datos.artifacts[0].base64) {
            textoBase64 = datos.artifacts[0].base64;
            finishReason = datos.artifacts[0].finishReason;
        } else if (datos && datos.result && datos.result.image) {
            textoBase64 = datos.result.image;
        } else {
            // Ayuda para depurar: muestra la forma de la respuesta, nunca la clave
            throw new Error(`La respuesta no trae la imagen. Claves recibidas: ${Object.keys(datos).join(', ')}`);
        }

        // Si el servicio informa un estado de finalización, debe ser SUCCESS
        if (finishReason && finishReason !== 'SUCCESS') {
            throw new Error(`El modelo de imágenes terminó con estado ${finishReason}.`);
        }

        // base64 -> bytes. OJO: SIN 'utf-8', la imagen se guarda tal cual.
        bytes = Buffer.from(textoBase64, 'base64');
    } else {
        // La imagen llega directamente como bytes
        bytes = Buffer.from(await respuesta.arrayBuffer());
    }

    return bytes;
}

/**
 * Parte 4 — Guarda los bytes de la imagen en imagenes/mundo_<id>.jpg.
 * Crea la carpeta imagenes/ si no existe. Valida que los bytes no estén vacíos.
 */
function guardarImagen(mundo, bytes) {
    if (!bytes || bytes.length === 0) {
        throw new Error('La imagen llegó vacía. No se guardó nada.');
    }
    fs.mkdirSync(DIR_IMAGENES, { recursive: true });
    const ruta = path.join(DIR_IMAGENES, `mundo_${mundo.id}.jpg`);
    // Los bytes se guardan tal cual, SIN pasar 'utf-8'
    fs.writeFileSync(ruta, bytes);
    return ruta;
}

module.exports = { generarImagen, guardarImagen, DIR_IMAGENES };
