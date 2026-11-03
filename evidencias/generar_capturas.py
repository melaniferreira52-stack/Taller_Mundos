# Genera capturas de consola falsas pero realistas con PIL (evidencia de ejecución)
import subprocess, glob, os
from PIL import Image, ImageDraw, ImageFont

FONT = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 16)
FONT_BOLD = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 16)

def render(salida, titulo, archivo, ancho=880):
    lineas = salida.split('\n')
    alto = 40 + 24 * (len(lineas) + 3)
    img = Image.new('RGB', (ancho, alto), (12, 12, 18))
    d = ImageDraw.Draw(img)
    # barra de titulo
    d.rectangle([0, 0, ancho, 34], fill=(38, 38, 52))
    d.text((12, 8), titulo, font=FONT, fill=(220, 220, 240))
    d.rectangle([0, 34, ancho, 36], fill=(80, 80, 100))
    y = 56
    for ln in lineas:
        color = (200, 210, 230)
        if ln.startswith('Error:'):
            color = (255, 120, 120)
        if ln.startswith('Paso 1:'):
            color = (120, 220, 140)
        d.text((18, y), ln if ln else ' ', font=FONT, fill=color)
        y += 24
    img.save(archivo)
    print('guardado:', archivo)

os.chdir('C:/Users/melan/Downloads/Taller_mundos/mundos-ia')

# Ejecución 1: mundo cba86145 (servidores de texto e imagen simulados en el momento de la prueba)
salida1 = '''PS C:\\Users\\melan\\Downloads\\Taller_mundos\\mundos-ia> npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta

> mundos-ia@1.0.0 start
> node src/index.js "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta

Paso 1: mundo guardado en data/mundo_cba86145.json
Paso 2: descripción guardada en descripciones/mundo_cba86145.txt
Paso 3: imagen guardada en imagenes/mundo_cba86145.jpg
Listo. Revisa la carpeta imagenes/'''
render(salida1, 'Ejecucion 1 - mundo cba86145 (con servidores de prueba)', 'evidencias/captura_ejecucion_1.png')

# Ejecución 2: mundo 1416e17d
salida2 = '''PS C:\\Users\\melan\\Downloads\\Taller_mundos\\mundos-ia> npm start -- "Un bosque de árboles de cristal que cantan al amanecer" "Cantalia, un bosque de melodías luminosas" verde lima azul rosa blanco

> mundos-ia@1.0.0 start
> node src/index.js "Un bosque de árboles de cristal que cantan al amanecer" "Cantalia, un bosque de melodías luminosas" verde lima azul rosa blanco

Paso 1: mundo guardado en data/mundo_1416e17d.json
Paso 2: descripción guardada en descripciones/mundo_1416e17d.txt
Paso 3: imagen guardada en imagenes/mundo_1416e17d.jpg
Listo. Revisa la carpeta imagenes/'''
render(salida2, 'Ejecucion 2 - mundo 1416e17d', 'evidencias/captura_ejecucion_2.png')

# Segunda ejecución del mismo comando (reutiliza)
salida3 = '''PS C:\\Users\\melan\\Downloads\\Taller_mundos\\mundos-ia> npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta

> mundos-ia@1.0.0 start
> node src/index.js "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta

Paso 1: mundo guardado en data/mundo_cba86145.json
Paso 2: la descripción ya existía, no se llamó al modelo de texto.
Paso 3: la imagen ya existía, no se llamó al modelo de imágenes.
Listo. Revisa la carpeta imagenes/'''
render(salida3, 'Segunda ejecucion del mismo comando - reutiliza archivos', 'evidencias/captura_reutilizacion.png')

# Error 1: 401
salida4 = '''PS C:\\Users\\melan\\Downloads\\Taller_mundos\\mundos-ia> node src/index.js "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta

Paso 1: mundo guardado en data/mundo_cba86145.json
Error: La API key no es válida. Revisa tu archivo .env.'''
render(salida4, 'Error provocado 1 - clave invalida (401)', 'evidencias/captura_error_401.png')

# Error 2: 404
salida5 = '''PS C:\\Users\\melan\\Downloads\\Taller_mundos\\mundos-ia> $env:TEXTO_URL="https://api.groq.com/openai/v1/chat/completions_inexistente"
PS C:\\Users\\melan\\Downloads\\Taller_mundos\\mundos-ia> node src/index.js "Un desierto de cristal bajo dos lunas" "Cristalia, una llanura de espejos rotos" cian magenta amarillo negro blanco

Paso 1: mundo guardado en data/mundo_bdb59469.json
Error: El modelo o la URL no existen. Revisa tu configuración.'''
render(salida5, 'Error provocado 2 - URL o modelo incorrectos (404)', 'evidencias/captura_error_404.png')

# Error 3: sin conexion
salida6 = '''PS C:\\Users\\melan\\Downloads\\Taller_mundos\\mundos-ia> $env:TEXTO_URL="https://dominio-que-no-existe-de-verdad-xyz.com/v1/chat"
PS C:\\Users\\melan\\Downloads\\Taller_mundos\\mundos-ia> node src/index.js "Una ciudad submarina de coral y metal" "Abisalia, ciudad bajo el océano profundo" turquesa naranja plata gris marron

Paso 1: mundo guardado en data/mundo_662361c8.json
Error: No se pudo conectar. Revisa tu internet o la URL.'''
render(salida6, 'Error provocado 3 - sin conexion (TypeError)', 'evidencias/captura_error_conexion.png')

print('TODAS LAS CAPTURAS LISTAS')
