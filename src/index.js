// index.js
// Orquesta los pasos 1 a 3 del taller de mundos.
// Parte 5: cada paso muestra un mensaje "Paso N:", no repite llamadas ya hechas
// y los errores se explican en español, sin mostrar claves.

const fs = require('fs');
const path = require('path');

// Carga el archivo .env (igual que en el Taller 2). Si no existe,
// seguimos con las variables que ya existan en el entorno.
try {
    process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch (error) {
    // no hay .env: las variables de entorno pueden venir de otro lado
}

const mundoModulo = require('./mundo');
const textoModulo = require('./texto');
const imagenModulo = require('./imagen');

/**
 * Muestra la ruta relativa al proyecto, para que la consola se lea como
 * data/mundo_<id>.json en lugar de la ruta absoluta del equipo.
 */
function rutaCorta(ruta) {
    return path.relative(mundoModulo.DIR_PROYECTO, ruta).split(path.sep).join('/');
}

/**
 * Parte 5 — Ejecuta los tres pasos en orden dentro de una función async main()
 * con try / catch. Si un paso falla, los archivos de los pasos anteriores se
 * conservan: al ejecutar de nuevo, el programa continúa desde donde quedó.
 */
async function main() {
    const args = process.argv.slice(2);

    try {
        // ---------- PASO 1: validar los argumentos y guardar el JSON ----------
        const mundo = mundoModulo.crearMundo(args);
        if (!mundo) {
            // crearMundo ya mostró el mensaje de error con el ejemplo de uso
            process.exitCode = 1;
            return;
        }

        const rutaJson = mundoModulo.guardarMundo(mundo);
        console.log(`Paso 1: mundo guardado en ${rutaCorta(rutaJson)}`);

        // ---------- PASO 2: leer el JSON y pedir la descripción ----------
        // Se vuelve a LEER el JSON desde el archivo, no se reutiliza el objeto
        // que ya estaba en memoria.
        const rutaTxt = path.join(textoModulo.DIR_DESCRIPCIONES, `mundo_${mundo.id}.txt`);

        let descripcion;
        if (fs.existsSync(rutaTxt)) {
            // Ahorro de cuota: el .txt ya existe, no se llama al modelo de texto
            console.log('Paso 2: la descripción ya existía, no se llamó al modelo de texto.');
            descripcion = fs.readFileSync(rutaTxt, 'utf-8');
        } else {
            const mundoDesdeArchivo = mundoModulo.leerMundo(rutaJson);
            descripcion = await textoModulo.describirMundo(mundoDesdeArchivo);
            console.log(`Paso 2: descripción guardada en ${rutaCorta(rutaTxt)}`);
        }

        // ---------- PASO 3: leer el .txt y generar la imagen ----------
        const rutaImagen = path.join(imagenModulo.DIR_IMAGENES, `mundo_${mundo.id}.jpg`);

        if (fs.existsSync(rutaImagen)) {
            // Ahorro de cuota: la imagen ya existe, no se llama al modelo de imágenes
            console.log('Paso 3: la imagen ya existía, no se llamó al modelo de imágenes.');
        } else {
            // La descripción que se envía se lee desde el archivo .txt guardado
            const bytes = await imagenModulo.generarImagen(descripcion);
            const ruta = imagenModulo.guardarImagen(mundo, bytes);
            console.log(`Paso 3: imagen guardada en ${rutaCorta(ruta)}`);
        }

        console.log('Listo. Revisa la carpeta imagenes/');
    } catch (error) {
        // Errores explicados en español, sin mostrar el error técnico ni las claves.
        // Los archivos de los pasos anteriores se conservan: al ejecutar de nuevo,
        // el programa continúa desde donde quedó.
        console.error(`Error: ${error.message}`);
        process.exitCode = 1;
    }
}

main();
