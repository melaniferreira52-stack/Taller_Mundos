# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
FONT = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 16)

def render(salida, titulo, archivo, ancho=920):
    lineas = salida.split('\n')
    alto = 40 + 24 * (len(lineas) + 3)
    img = Image.new('RGB', (ancho, alto), (12, 12, 18))
    d = ImageDraw.Draw(img)
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

P = 'PS C:\\\\Users\\\\melan\\\\Downloads\\\\Taller_mundos\\\\mundos-ia> '
c1 = 'npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta'
c2 = 'npm start -- "Un bosque de árboles de cristal que cantan al amanecer" "Cantalia, un bosque de melodías luminosas" verde lima azul rosa blanco'
c3 = 'npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta'

salida1 = P + c1 + '''

> mundos-ia@1.0.0 start
> node src/index.js "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta

Paso 1: mundo guardado en data/mundo_cba86145.json
Paso 2: descripción guardada en descripciones/mundo_cba86145.txt
Paso 3: imagen guardada en imagenes/mundo_cba86145.jpg
Listo. Revisa la carpeta imagenes/'''
render(salida1, 'Ejecucion 1 - mundo cba86145 (Groq + Cloudflare reales)', 'evidencias/captura_ejecucion_1.png')

salida2 = P + c2 + '''

> mundos-ia@1.0.0 start
> node src/index.js "Un bosque de árboles de cristal que cantan al amanecer" "Cantalia, un bosque de melodías luminosas" verde lima azul rosa blanco

Paso 1: mundo guardado en data/mundo_1416e17d.json
Paso 2: descripción guardada en descripciones/mundo_1416e17d.txt
Paso 3: imagen guardada en imagenes/mundo_1416e17d.jpg
Listo. Revisa la carpeta imagenes/'''
render(salida2, 'Ejecucion 2 - mundo 1416e17d (Groq + Cloudflare reales)', 'evidencias/captura_ejecucion_2.png')

salida3 = P + c3 + '''

> mundos-ia@1.0.0 start
> node src/index.js "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta

Paso 1: mundo guardado en data/mundo_cba86145.json
Paso 2: la descripción ya existía, no se llamó al modelo de texto.
Paso 3: la imagen ya existía, no se llamó al modelo de imágenes.
Listo. Revisa la carpeta imagenes/'''
render(salida3, 'Segunda ejecucion del mismo comando - reutiliza archivos, no gasta cuota', 'evidencias/captura_reutilizacion.png')
print('LISTO')
