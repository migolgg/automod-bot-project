# 🛡️ Discord AutoMod Bot

Un bot avanzado de automoderación para Discord con sistema de escalamiento inteligente, configuración personalizable y múltiples tipos de detección.

## ✨ Características

### 🔍 Detección Inteligente
- **Anti-Spam**: Detecta y previene spam de mensajes
- **Anti-Mayúsculas**: Controla el uso excesivo de mayúsculas
- **Filtro de Palabras**: Bloquea palabras prohibidas personalizables
- **Control de Enlaces**: Sistema de whitelist para enlaces
- **Anti-Menciones**: Previene menciones masivas
- **Anti-Invitaciones**: Bloquea invitaciones de Discord
- **Texto Duplicado**: Detecta mensajes repetitivos
- **Anti-Zalgo**: Filtra texto con caracteres especiales
- **Mensajes Largos**: Controla la longitud de mensajes
- **Anti-Emoji Spam**: Previene spam de emojis

### ⚡ Sistema de Escalamiento
- **Escalamiento Automático**: Sanciones progresivas basadas en infracciones
- **Configuración por Regla**: Escalamiento personalizable para cada tipo de infracción
- **Ventanas de Tiempo**: Control temporal de infracciones
- **Reset Automático**: Limpieza automática de infracciones expiradas

### 🎛️ Configuración Avanzada
- **Panel Interactivo**: Configuración mediante botones y menús
- **Roles Inmunes**: Usuarios exentos de automoderación
- **Excepciones**: Sistema granular de excepciones por usuario/canal
- **Logging Completo**: Registro detallado de todas las acciones

## 📦 Instalación

### Prerequisitos
- Node.js 16.9.0 o superior
- npm o yarn
- Una aplicación de Discord Bot

### Paso 1: Crear el Bot en Discord

1. Ve al [Portal de Desarrolladores de Discord](https://discord.com/developers/applications)
2. Haz click en "New Application" y dale un nombre a tu bot
3. Ve a la sección "Bot" en el menú lateral
4. Haz click en "Add Bot"
5. Copia el **Token** del bot (lo necesitarás más tarde)
6. En la sección "Privileged Gateway Intents", habilita:
   - MESSAGE CONTENT INTENT
   - SERVER MEMBERS INTENT

### Paso 2: Obtener Client ID

1. En tu aplicación de Discord, ve a "General Information"
2. Copia el **Application ID** (también conocido como Client ID)

### Paso 3: Clonar e Instalar

```bash
# Clonar el repositorio (o descargar los archivos)
git clone <url-del-repositorio>
cd discord-automod-bot

# Instalar dependencias
npm install

# Crear archivo de configuración
cp .env.example .env
```

### Paso 4: Configurar Variables de Entorno

Edita el archivo `.env` con tus datos:

```env
DISCORD_TOKEN=tu_token_del_bot_aqui
CLIENT_ID=tu_client_id_aqui
NODE_ENV=production
```

### Paso 5: Invitar el Bot a tu Servidor

1. Ve al [Generador de URLs de Discord](https://discord.com/developers/applications)
2. Selecciona tu aplicación
3. Ve a "OAuth2" > "URL Generator"
4. En **Scopes**, selecciona: `bot` y `applications.commands`
5. En **Bot Permissions**, selecciona:
   - Manage Messages
   - Kick Members
   - Ban Members
   - Moderate Members
   - Read Message History
   - Send Messages
   - Use Slash Commands
   - Manage Roles (opcional)

6. Copia la URL generada y úsala para invitar el bot a tu servidor

### Paso 6: Ejecutar el Bot

```bash
# Producción
npm start

# Desarrollo (con auto-restart)
npm run dev
```

## 🚀 Uso Rápido

### Comandos Principales

- `/automod config` - Abrir panel de configuración
- `/automod status` - Ver estado actual del sistema
- `/modlog #canal` - Configurar canal de logs

### Configuración Básica

1. Usa `/modlog #logs` para establecer un canal de logs
2. Usa `/automod config` para abrir el panel de configuración
3. Selecciona las reglas que quieres activar
4. Configura los parámetros según tus necesidades

## ⚙️ Configuración Detallada

### Anti-Spam
```
Límite: 5 mensajes
Ventana: 5 segundos
Acción: timeout/kick/ban
```

### Anti-Mayúsculas
```
Porcentaje: 70%
Acción: warn/delete
```

### Palabras Prohibidas
```
Lista personalizable
Acción: delete/warn/timeout
```

### Control de Enlaces
```
Sistema de whitelist
Dominios permitidos configurables
Presets disponibles (medios, gaming, etc.)
```

## 🔧 Sistema de Escalamiento

El bot incluye un sistema de escalamiento inteligente que aplica sanciones progresivas:

### Configuración por Defecto
1. **Primera infracción**: Advertencia
2. **Segunda infracción**: Timeout 5min
3. **Tercera infracción**: Timeout 30min
4. **Quinta infracción**: Expulsión
5. **Séptima infracción**: Ban

### Configuración Personalizada
- Ventanas de tiempo configurables
- Acciones personalizables por regla
- Reset automático de infracciones

## 📊 Logging y Monitoreo

El bot registra todas las acciones en el canal configurado:
- Usuario afectado
- Regla violada
- Acción tomada
- Contenido del mensaje (si aplica)
- Información de escalamiento

## 🛠️ Desarrollo

### Estructura del Proyecto
```
discord-automod-bot/
├── index.js          # Archivo principal
├── config.js         # Configuración
├── package.json      # Dependencias
├── .env.example      # Plantilla de configuración
├── .gitignore        # Archivos ignorados
└── README.md         # Documentación
```

### Scripts Disponibles
```bash
npm start     # Iniciar en producción
npm run dev   # Iniciar en desarrollo
```

## 🔐 Seguridad

- El token del bot se almacena de forma segura en variables de entorno
- Los datos se guardan localmente en `database.json`
- Sistema de permisos integrado
- Verificación de inmunidad para administradores

## 🐛 Solución de Problemas

### El bot no responde
- Verifica que el token sea correcto
- Asegúrate de que el bot tenga los permisos necesarios
- Revisa la consola para errores

### Los comandos no aparecen
- Espera unos minutos para que Discord registre los comandos
- Verifica que el CLIENT_ID sea correcto
- Reinicia Discord si es necesario

### Errores de permisos
- Asegúrate de que el bot tenga permisos para:
  - Leer mensajes
  - Enviar mensajes
  - Eliminar mensajes
  - Silenciar usuarios
  - Expulsar usuarios
  - Banear usuarios

## 📝 Changelog

### v1.0.0
- Lanzamiento inicial
- Sistema de automoderación completo
- 10 tipos de detección diferentes
- Sistema de escalamiento avanzado
- Panel de configuración interactivo

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 💬 Soporte

Si necesitas ayuda:
1. Revisa esta documentación
2. Verifica la sección de solución de problemas
3. Abre un issue en el repositorio

## 🌟 Características Próximas

- [ ] Base de datos SQL
- [ ] Panel web de administración
- [ ] Más presets de configuración
- [ ] Sistema de reports
- [ ] Integración con APIs externas
- [ ] Estadísticas avanzadas

---

⭐ Si este proyecto te fue útil, no olvides darle una estrella en GitHub!