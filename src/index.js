// Orquesta los pasos 1 a 3
const path = require('path');

// Carga el archivo .env (igual que en el Taller 2)
try {
    process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch (error) {
    // si no hay .env, seguimos con las variables que ya existan
}

const mundo = require('./mundo');
const texto = require('./texto');
const imagen = require('./imagen');

async function main() {
    console.log('Proyecto mundos-ia listo.');
}

main();
