// mundo.js
// Valida los argumentos, crea el objeto del mundo y lo guarda o lo lee (JSON)
// Parte 2 del taller: de los parámetros de la consola al archivo data/mundo_<id>.json

const fs = require('fs');
const path = require('path');
const hash = require('object-hash');

// Carpetas donde se guardan los archivos, calculadas desde la ubicación
// de este archivo (no desde donde se ejecuta el comando)
const DIR_PROYECTO = path.join(__dirname, '..');
const DIR_DATA = path.join(DIR_PROYECTO, 'data');

/**
 * Muestra un mensaje de error claro en español y devuelve false.
 * Cada validación fallida explica qué se esperaba y muestra un ejemplo de uso.
 */
function mostrarError(mensaje) {
    console.error(`Error: ${mensaje}`);
    console.error('Uso: npm start -- "<situación>" "<mundo>" <color1> <color2> <color3> <color4> <color5>');
    console.error('Ejemplo: npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta');
    return false;
}

/**
 * Parte 2 — Crea el objeto del mundo a partir de los argumentos de la consola.
 * Validaciones:
 *  1. Deben llegar exactamente 7 argumentos.
 *  2. Ningún argumento puede estar vacío ni tener solo espacios.
 *  3. Los 5 colores deben ser distintos (sin distinguir mayúsculas de minúsculas).
 *
 * El id son los primeros 8 caracteres del hash de object-hash calculado sobre
 * { situacion, mundo, colores } (sin la fecha: así los mismos datos siempre
 * producen el mismo id y los archivos se reutilizan).
 */
function crearMundo(args) {
    // Los 7 argumentos son: situacion, mundo y los 5 colores
    if (args.length !== 7) {
        return mostrarError(`Deben llegar exactamente 7 argumentos (situación, mundo y 5 colores) y llegaron ${args.length}.`);
    }

    // Ningún argumento puede estar vacío ni tener solo espacios
    for (const arg of args) {
        if (arg.trim().length === 0) {
            return mostrarError('Ningún argumento puede estar vacío ni tener solo espacios.');
        }
    }

    const situacion = args[0].trim();
    const mundo = args[1].trim();
    const colores = args.slice(2).map((c) => c.trim());

    // Los 5 colores deben ser distintos, sin distinguir mayúsculas de minúsculas
    const coloresEnMinuscula = colores.map((c) => c.toLowerCase());
    const coloresUnicos = new Set(coloresEnMinuscula);
    if (coloresUnicos.size !== 5) {
        return mostrarError('Los 5 colores deben ser distintos (no importan las mayúsculas).');
    }

    // id estable: mismo situacion + mundo + colores => mismo id
    const id = hash({ situacion, mundo, colores }).slice(0, 8);

    return {
        id,
        situacion,
        mundo,
        colores,
        creadoEn: new Date().toISOString()
    };
}

/**
 * Parte 2 — Guarda el objeto del mundo en data/mundo_<id>.json.
 * Crea la carpeta data/ si no existe.
 */
function guardarMundo(mundo) {
    fs.mkdirSync(DIR_DATA, { recursive: true });
    const ruta = path.join(DIR_DATA, `mundo_${mundo.id}.json`);
    // null, 2 => el JSON se guarda indentado, legible para humanos
    fs.writeFileSync(ruta, JSON.stringify(mundo, null, 2));
    return ruta;
}

/**
 * Parte 3 — Vuelve a leer el JSON desde el archivo (readFileSync + JSON.parse).
 * No se reutiliza el objeto que ya estaba en memoria: el programa consulta
 * lo guardado, como pide el taller.
 */
function leerMundo(ruta) {
    const contenido = fs.readFileSync(ruta, 'utf-8');
    return JSON.parse(contenido);
}

module.exports = {
    crearMundo,
    guardarMundo,
    leerMundo,
    DIR_DATA,
    DIR_PROYECTO
};
