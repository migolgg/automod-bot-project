# 📚 Guía de Instalación Completa - Discord AutoMod Bot

Esta guía te llevará paso a paso para instalar y configurar tu bot de automoderación desde cero.

## 🔧 Requisitos Previos

### Software Necesario
- **Node.js 16.9.0 o superior** - [Descargar aquí](https://nodejs.org/)
- **Git** (opcional) - [Descargar aquí](https://git-scm.com/)
- **Editor de texto** (VS Code, Sublime Text, Notepad++, etc.)

### Cuentas Necesarias
- Cuenta de Discord
- Acceso al servidor donde quieres instalar el bot

## 📋 Paso 1: Crear la Aplicación del Bot

### 1.1 Acceder al Portal de Desarrolladores
1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Inicia sesión con tu cuenta de Discord
3. Haz click en **"New Application"**

### 1.2 Configurar la Aplicación
1. **Nombre**: Escribe un nombre para tu bot (ej: "AutoMod Bot")
2. **Descripción**: Añade una descripción opcional
3. Haz click en **"Create"**

### 1.3 Configurar el Bot
1. En el menú lateral, haz click en **"Bot"**
2. Haz click en **"Add Bot"** y confirma
3. **IMPORTANTE**: Copia y guarda el **Token** (lo necesitarás después)
   - ⚠️ **NUNCA COMPARTAS TU TOKEN**
4. En **"Privileged Gateway Intents"**, activa:
   - ✅ **MESSAGE CONTENT INTENT**
   - ✅ **SERVER MEMBERS INTENT**
   - ✅ **PRESENCE INTENT** (opcional)

### 1.4 Obtener el Client ID
1. Ve a **"General Information"** en el menú lateral
2. Copia el **Application ID** (también llamado Client ID)

## 💻 Paso 2: Preparar el Entorno

### 2.1 Crear Carpeta del Proyecto
```bash
# Crear y navegar a la carpeta
mkdir discord-automod-bot
cd discord-automod-bot
```

### 2.2 Descargar los Archivos
**Opción A: Con Git (Recomendado)**
```bash
git clone <url-del-repositorio> .
```

**Opción B: Descarga Manual**
1. Descarga todos los archivos del proyecto
2. Extráelos en la carpeta `discord-automod-bot`

### 2.3 Estructura Final
Tu carpeta debe verse así:
```
discord-automod-bot/
├── index.js
├── config.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── INSTALL_GUIDE.md
└── start.sh
```

## ⚙️ Paso 3: Configurar el Proyecto

### 3.1 Instalar Dependencias
```bash
# Con npm
npm install

# O con yarn (si lo prefieres)
yarn install
```

### 3.2 Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env
nano .env
# O usa tu editor favorito: code .env, notepad .env, etc.
```

### 3.3 Configurar el Archivo .env
Edita el archivo `.env` y reemplaza los valores:

```env
# Discord Bot Configuration
DISCORD_TOKEN=TU_TOKEN_AQUI          # ← Pega tu token del bot
CLIENT_ID=TU_CLIENT_ID_AQUI          # ← Pega tu Client ID

# Environment
NODE_ENV=production
```

**⚠️ IMPORTANTE:**
- Reemplaza `TU_TOKEN_AQUI` con el token que copiaste en el paso 1.3
- Reemplaza `TU_CLIENT_ID_AQUI` con el Client ID del paso 1.4

## 🔗 Paso 4: Invitar el Bot al Servidor

### 4.1 Generar URL de Invitación
1. Ve al [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación
3. Ve a **"OAuth2" > "URL Generator"**

### 4.2 Configurar Permisos
En **Scopes**, selecciona:
- ✅ `bot`
- ✅ `applications.commands`

En **Bot Permissions**, selecciona:
- ✅ **Send Messages**
- ✅ **Use Slash Commands**
- ✅ **Manage Messages**
- ✅ **Read Message History**
- ✅ **Kick Members**
- ✅ **Ban Members**
- ✅ **Moderate Members** (para timeouts)
- ✅ **View Channels**
- ✅ **Embed Links**

### 4.3 Invitar el Bot
1. Copia la URL generada en la parte inferior
2. Pégala en tu navegador
3. Selecciona el servidor donde quieres añadir el bot
4. Haz click en **"Authorize"**

## 🚀 Paso 5: Ejecutar el Bot

### 5.1 Método Rápido (Script Automático)
```bash
# Dar permisos al script (Linux/Mac)
chmod +x start.sh

# Ejecutar
./start.sh
```

### 5.2 Método Manual
```bash
# Ejecutar directamente
node index.js

# O con npm
npm start
```

### 5.3 Verificar que Funciona
Si todo está bien configurado, deberías ver:
```
✅ Bot conectado como TuBot#1234!
📄 Registrando comandos slash...
✅ Comandos slash registrados correctamente.
```

## ⚡ Paso 6: Configuración Inicial

### 6.1 Configurar Canal de Logs
En tu servidor de Discord:
```
/modlog #nombre-del-canal-logs
```

### 6.2 Abrir Panel de Configuración
```
/automod config
```

### 6.3 Verificar Estado
```
/automod status
```

## 🛠️ Configuración Avanzada

### Anti-Spam
1. Usa `/automod config` > Selecciona "Anti-Spam"
2. Haz click en "Activar"
3. Configura límite (ej: 5 mensajes)
4. Configura ventana de tiempo (ej: 10 segundos)

### Filtro de Palabras
1. Activa "Palabras Prohibidas"
2. Haz click en "Configurar"
3. Añade palabras separadas por comas

### Control de Enlaces
1. Activa "Anti-Enlaces"
2. Configura dominios permitidos (ej: youtube.com, github.com)

## 🔍 Solución de Problemas Comunes

### Error: "Invalid Token"
- ✅ Verifica que el token en `.env` sea correcto
- ✅ No debe tener espacios al inicio o final
- ✅ Regenera el token si es necesario

### Los comandos no aparecen
- ⏰ Espera 5-10 minutos para que Discord los registre
- 🔄 Reinicia Discord
- ✅ Verifica que CLIENT_ID sea correcto

### Error de permisos
- ✅ Verifica que el bot tenga todos los permisos necesarios
- ✅ El rol del bot debe estar por encima de los usuarios que va a moderar
- ✅ Reenvía la invitación con los permisos correctos

### El bot se desconecta constantemente
- ✅ Verifica tu conexión a internet
- ✅ Revisa los logs para errores específicos
- ✅ Asegúrate de tener suficiente RAM disponible

## 📱 Mantener el Bot Activo

### Opción 1: PM2 (Recomendado para Linux/Mac)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar el bot con PM2
pm2 start index.js --name "automod-bot"

# Ver status
pm2 status

# Ver logs
pm2 logs automod-bot

# Reiniciar
pm2 restart automod-bot
```

### Opción 2: Screen (Linux)
```bash
# Crear nueva sesión
screen -S automod-bot

# Ejecutar el bot
node index.js

# Separarse de la sesión: Ctrl+A, luego D

# Volver a la sesión
screen -r automod-bot
```

### Opción 3: Servicios de Hosting
- **Heroku** (gratis con limitaciones)
- **Railway** (gratis con limitaciones)
- **DigitalOcean** (pago)
- **AWS EC2** (gratis el primer año)

## 🔧 Mantenimiento

### Actualizar el Bot
```bash
# Si usas Git
git pull origin main
npm install

# Reiniciar el bot
```

### Backup de Datos
El bot guarda datos en `database.json`. Para hacer backup:
```bash
# Crear backup
cp database.json backup-$(date +%Y%m%d).json
```

### Logs y Monitoreo
- Los logs aparecen en la consola
- Revisa regularmente el archivo `database.json`
- Mantén actualizadas las dependencias

## 📞 Soporte

### Si necesitas ayuda:
1. 📖 Lee esta guía completa
2. 🔍 Revisa la consola para errores específicos
3. 🐛 Busca en la sección de Issues del repositorio
4. 💬 Crea un nuevo Issue con detalles del problema

### Información útil para reportar problemas:
- Versión de Node.js: `node --version`
- Sistema operativo
- Mensaje de error completo
- Pasos para reproducir el problema

---

✅ **¡Listo! Tu bot de automoderación ya está funcionando.**

🌟 **Próximos pasos recomendados:**
1. Configura todas las reglas necesarias
2. Prueba el sistema con usuarios de confianza
3. Ajusta los parámetros según tu comunidad
4. Mantén el bot actualizado