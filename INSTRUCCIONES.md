# Velocimetros

Instrucciones para descargar, instalar y probar la aplicacion desde una computadora y un celular o tablet conectados a la misma red local.

## Requisitos

- Windows, macOS o Linux.
- [Visual Studio Code](https://code.visualstudio.com/).
- [Node.js](https://nodejs.org/) instalado, preferentemente la version LTS.
- Una computadora y un celular o tablet conectados a la misma red Wi-Fi.

## Descargar el proyecto

1. Descarga el proyecto como ZIP desde:

   <https://github.com/jacobogaxiola/velocimetros/archive/refs/heads/main.zip>

2. Cuando termine la descarga, localiza el archivo `main.zip`.
3. Descomprime el archivo en una carpeta de trabajo. En Windows puedes hacer clic derecho sobre el ZIP y elegir **Extraer todo**.
4. Abre la carpeta extraida. Normalmente tendra un nombre parecido a `velocimetros-main`.

## Abrir el proyecto en VS Code

Desde VS Code:

1. Selecciona **Archivo > Abrir carpeta**.
2. Elige la carpeta extraida `velocimetros-main`.
3. Abre una terminal integrada con **Terminal > Nueva terminal**.
4. Confirma que la terminal esta ubicada en la carpeta que contiene `package.json`.

Tambien puedes abrir la carpeta desde PowerShell:

```powershell
cd ruta\a\velocimetros-main
code .
```

## Instalar dependencias

En la terminal de VS Code ejecuta:

```powershell
npm install
```

Este comando instala React, los componentes de velocimetros, Recharts, el generador de QR y el certificado HTTPS local.

## Iniciar el entorno de desarrollo en la red local

Ejecuta:

```powershell
npm run dev -- --host 0.0.0.0
```

Vite mostrara una direccion local y una o mas direcciones de red. Para el celular usa la direccion HTTPS que indique `Network`, por ejemplo:

```text
https://192.168.1.37:5173/
```

La IP puede cambiar dependiendo de la red. Usa siempre la IP que aparezca en la terminal. Si Windows muestra una alerta del firewall, permite el acceso en redes privadas.

La aplicacion genera automaticamente un codigo QR junto al titulo **Velocimetro**. El QR contiene la liga HTTPS de la app usando la IP de red detectada por Vite, por lo que no necesitas escribir la direccion manualmente.

### Abrir desde el celular

1. Conecta el celular o tablet a la misma red Wi-Fi que la computadora.
2. Abre en Chrome la URL HTTPS de red que mostro Vite.
3. La primera vez Chrome puede mostrar una advertencia por el certificado local de desarrollo. Pulsa **Avanzado** y despues **Continuar al sitio**.
4. Escanea con la camara del celular el QR que aparece junto al titulo **Velocimetro**. Ese QR abre la liga de la app en la red local y usa la IP detectada automaticamente por Vite.
5. Si el QR conserva una direccion anterior, reinicia el servidor para que detecte nuevamente la IP actual.

> El GPS del navegador requiere HTTPS. La URL `http://localhost` funciona para la computadora, pero no es suficiente para probar la ubicacion desde un celular mediante la IP local.

## Probar el GPS

1. En el celular, abre la aplicacion mediante HTTPS.
2. Pulsa **Activar GPS**.
3. Acepta el permiso de ubicacion en Chrome.
4. Si Chrome no muestra el permiso, abre **Configuracion > Aplicaciones > Chrome > Permisos > Ubicacion** y selecciona **Permitir mientras se usa la aplicacion**. Tambien confirma que la ubicacion general del celular este activada.
5. El estado debe cambiar a **GPS activo** cuando se reciba una posicion.
6. La velocidad se toma de los datos GPS cuando el dispositivo los proporciona. Si no, la app la calcula usando la distancia y el tiempo entre posiciones.
7. Mientras el GPS esta activo, el control manual de velocidad queda deshabilitado.
8. Pulsa **Desactivar GPS** para volver al control manual.

## Operacion basica

- Usa el selector de botones para cambiar entre los distintos velocimetros.
- Mueve el control **Velocidad** para probar manualmente el cambio de la barra, la aguja y la lectura.
- Usa **Activar GPS** para sustituir el valor manual por la velocidad del dispositivo.
- En el celular, acepta el certificado HTTPS local y el permiso de ubicacion antes de probar el GPS.

## Detener el servidor

En la terminal donde se esta ejecutando Vite, presiona:

```text
Ctrl + C
```

## Problemas frecuentes

### El celular no puede abrir la URL

- Verifica que ambos dispositivos esten en la misma red Wi-Fi.
- Usa la IP de la interfaz Wi-Fi que aparece en la terminal, no `localhost` ni una IP de un adaptador virtual.
- Confirma que el firewall de Windows permita Node.js en redes privadas.
- Reinicia Vite con `npm run dev -- --host 0.0.0.0`.

### El GPS indica que no tiene permiso

- Abre la app con `https://`, no con `http://`.
- Acepta el certificado local de desarrollo en Chrome.
- Activa la ubicacion del celular.
- Revisa los permisos de ubicacion de Chrome y recarga la pagina.

### El comando `npm` no existe

Instala Node.js LTS, cierra y vuelve a abrir VS Code, y ejecuta de nuevo `npm install`.
