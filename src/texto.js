// texto.js
// Consulta al modelo de lenguaje con fetch y devuelve la descripción de la imagen.
// Parte 3 del taller: leer el JSON guardado y pedir la descripción al modelo de texto.

const fs = require('fs');
const path = require('path');
const { DIR_PROYECTO } = require('./mundo');

const DIR_DESCRIPCIONES = path.join(DIR_PROYECTO, 'descripciones');

/**
 * Convierte una respuesta HTTP fallida en un mensaje claro en español,
 * sin mostrar errores técnicos ni las claves.
 */
function errorDeRespuesta(respuesta, bodyTexto) {
    if (respuesta.status === 401 || respuesta.status === 403) {
        return new Error('La API key no es válida. Revisa tu archivo .env.');
    }
    if (respuesta.status === 402 || respuesta.status === 429) {
        const retry = respuesta.headers.get('retry-after');
        const aviso = retry ? ` Espera ${retry} segundos.` : ' Espera un momento.';
        return new Error('Superaste el límite gratuito.' + aviso);
    }
    if (respuesta.status === 404 || respuesta.status === 410) {
        return new Error('El modelo o la URL no existen. Revisa tu configuración.');
    }
    // Cualquier otro estado: mostramos el estado, no la clave ni datos sensibles
    return new Error(`El servicio respondió con el estado ${respuesta.status}. Intenta de nuevo más tarde.`);
}

/**
 * Parte 3 — Pide al modelo de texto que describa el mundo (función async).
 * - El mensaje del usuario es el contenido del JSON: JSON.stringify(mundo).
 * - El mensaje de sistema pide UN párrafo en inglés de 80 a 120 palabras,
 *   que describa una imagen (escena, elementos, iluminación, composición y
 *   estilo artístico), mencionando los 5 colores, sin títulos ni markdown.
 * - Usa AbortSignal.timeout(30000) y revisa respuesta.ok, como en el Taller 2.
 * Devuelve la descripción (texto) y la guarda en descripciones/mundo_<id>.txt.
 */
async function describirMundo(mundo) {
    const url = process.env.TEXTO_URL;
    const modelo = process.env.TEXTO_MODELO;
    const clave = process.env.TEXTO_API_KEY;

    // Pollinations no necesita clave; si no hay clave, no se manda la cabecera.
    // (En el Taller 2 con Groq/NVIDIA sí se manda Authorization: Bearer <clave>)
    const cabeceras = { 'Content-Type': 'application/json' };
    if (clave && !clave.includes('pega_aqui')) {
        cabeceras.Authorization = `Bearer ${clave}`;
    }

    const mensajeSistema =
        'You are an expert image prompt writer. Respond with a SINGLE paragraph in English ' +
        'of 80 to 120 words that describes an image: the scene, its elements, lighting, ' +
        'composition and artistic style. Do NOT write a story. Mention all these 5 colors ' +
        '(you may translate them into English): ' + mundo.colores.join(', ') + '. ' +
        'No titles, no markdown formatting, no text written inside the image.';

    const cuerpo = {
        model: modelo,
        messages: [
            { role: 'system', content: mensajeSistema },
            { role: 'user', content: JSON.stringify(mundo) }
        ]
    };

    let respuesta;
    try {
        respuesta = await fetch(url, {
            method: 'POST',
            headers: cabeceras,
            body: JSON.stringify(cuerpo),
            signal: AbortSignal.timeout(30000)
        });
    } catch (error) {
        // fetch lanza TypeError sin conexión; TimeoutError cuando se agota el tiempo
        if (error.name === 'TimeoutError') {
            throw new Error('El servicio tardó demasiado en responder.');
        }
        throw new Error('No se pudo conectar. Revisa tu internet o la URL.');
    }

    if (!respuesta.ok) {
        // Lee el cuerpo solo para depurar en pantalla; no imprime claves
        const body = await respuesta.text().catch(() => '');
        throw errorDeRespuesta(respuesta, body);
    }

    const datos = await respuesta.json();
    const contenido = datos && datos.choices && datos.choices[0]
        ? datos.choices[0].message.content
        : '';

    // Valida la respuesta: si llega vacía, lanza un Error
    if (!contenido || contenido.trim().length === 0) {
        throw new Error('El modelo de texto respondió vacío. Intenta de nuevo.');
    }

    let descripcion = contenido.trim();
    // Si supera los 1500 caracteres, se recorta y se avisa (Cloudflare acepta máx. 2048)
    if (descripcion.length > 1500) {
        console.log('Aviso: la descripción superó 1500 caracteres y se recortó.');
        descripcion = descripcion.slice(0, 1500);
    }

    // Guarda la descripción en descripciones/mundo_<id>.txt
    fs.mkdirSync(DIR_DESCRIPCIONES, { recursive: true });
    const ruta = path.join(DIR_DESCRIPCIONES, `mundo_${mundo.id}.txt`);
    fs.writeFileSync(ruta, descripcion);

    return descripcion;
}

module.exports = { describirMundo, DIR_DESCRIPCIONES };
