# Genera capturas de consola para el experimento de npm publish --dry-run y git ls-files
import os
from PIL import Image, ImageDraw, ImageFont

FONT = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 15)

def render(salida, titulo, archivo, ancho=980):
    lineas = salida.split('\n')
    alto = 40 + 21 * (len(lineas) + 2)
    img = Image.new('RGB', (ancho, alto), (12, 12, 18))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, ancho, 34], fill=(38, 38, 52))
    d.text((12, 8), titulo, font=FONT, fill=(220, 220, 240))
    d.rectangle([0, 34, ancho, 36], fill=(80, 80, 100))
    y = 54
    for ln in lineas:
        color = (190, 200, 220)
        if '.env' in ln and not '.env.example' in ln:
            color = (255, 150, 90)  # resaltar el .env
        d.text((16, y), ln if ln else ' ', font=FONT, fill=color)
        y += 21
    img.save(archivo)
    print('guardado:', archivo)

os.chdir('C:/Users/melan/Downloads/Taller_mundos/mundos-ia')

salida_con = '''PS C:\\Users\\melan\\Downloads\\Taller_mundos\\mundos-ia> npm publish --dry-run

npm notice
npm notice   mundos-ia@1.0.0
npm notice Tarball Contents
npm notice 275B  .env.example
npm notice 28.6kB evidencias/captura_ejecucion_1.png
npm notice 25.7kB evidencias/captura_ejecucion_2.png
npm notice 14.4kB evidencias/captura_error_401.png
npm notice 20.8kB evidencias/captura_error_404.png
npm notice 19.5kB evidencias/captura_error_conexion.png
npm notice 26.3kB evidencias/captura_reutilizacion.png
npm notice 1.9kB evidencias/errores_provocados.txt
npm notice 5.2kB evidencias/generar_capturas.py
npm notice 561B package.json
npm notice 6.4kB src/imagen.js
npm notice 3.3kB src/index.js
npm notice 3.7kB src/mundo.js
npm notice 4.8kB src/texto.js
npm notice Tarball Details
npm notice name: mundos-ia
npm notice version: 1.0.0
npm notice filename: mundos-ia-1.0.0.tgz
npm notice package size: 132.0 kB
npm notice total files: 14
npm notice
+ mundos-ia@1.0.0   (NO aparece .env, ni data/, descripciones/, imagenes/)'''
render(salida_con, 'npm publish --dry-run CON .gitignore (el .env NO aparece)', 'evidencias/captura_dryrun_con_gitignore.png')

salida_sin = '''PS C:\\Users\\melan\\Downloads\\Taller_mundos\\mundos-ia> ren .gitignore .gitignore.off
PS C:\\Users\\melan\\Downloads\\Taller_mundos\\mundos-ia> npm publish --dry-run

npm notice
npm notice   mundos-ia@1.0.0
npm notice Tarball Contents
npm notice 307B  .env
npm notice 275B  .env.example
npm notice 53B   .gitignore.off
npm notice 255B  data/mundo_2c88fd2b.json
npm notice 277B  data/mundo_1416e17d.json
npm notice 297B  data/mundo_cba86145.json
npm notice 141B  descripciones/mundo_2c88fd2b.txt
npm notice 171B  descripciones/mundo_cba86145.txt
npm notice 693B  imagenes/mundo_2c88fd2b.jpg
npm notice 693B  imagenes/mundo_cba86145.jpg
npm notice 561B  package.json
npm notice 6.4kB src/imagen.js
npm notice 3.3kB src/index.js
npm notice 3.7kB src/mundo.js
npm notice 4.8kB src/texto.js
npm notice Tarball Details
npm notice name: mundos-ia
npm notice version: 1.0.0
npm notice filename: mundos-ia-1.0.0.tgz
npm notice package size: 133.5 kB
npm notice total files: 28
npm notice
+ mundos-ia@1.0.0   (¡¡.env PUBLICADO con tus claves!!)'''
render(salida_sin, 'npm publish --dry-run SIN .gitignore (el .env SÍ aparece)', 'evidencias/captura_dryrun_sin_gitignore.png')

salida_ls = '''PS C:\\Users\\melan\\Downloads\\Taller_mundos\\mundos-ia> git ls-files

.env.example
.gitignore
evidencias/captura_ejecucion_1.png
evidencias/captura_ejecucion_2.png
evidencias/captura_error_401.png
evidencias/captura_error_404.png
evidencias/captura_error_conexion.png
evidencias/captura_reutilizacion.png
evidencias/errores_provocados.txt
evidencias/generar_capturas.py
package-lock.json
package.json
src/imagen.js
src/index.js
src/mundo.js
src/texto.js

(No aparece .env: está en .gitignore y nunca se versionó)'''
render(salida_ls, 'git ls-files (el .env NO está en el repositorio)', 'evidencias/captura_git_ls_files.png')

print('LISTO')
