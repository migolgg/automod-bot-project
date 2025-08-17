# 🚀 Guía de Despliegue - Discord AutoMod Bot

Esta guía cubre diferentes métodos para desplegar tu bot en producción.

## 📋 Opciones de Despliegue

### 1. 🖥️ Servidor Propio (VPS/Dedicated)
### 2. 🐳 Docker & Docker Compose
### 3. ☁️ Servicios Cloud Gratuitos
### 4. ☁️ Servicios Cloud Premium

---

## 🖥️ Método 1: Servidor Propio

### Requisitos
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- 1GB RAM mínimo (2GB recomendado)
- 10GB espacio en disco
- Conexión estable a internet

### Instalación en Ubuntu/Debian

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Git y herramientas
sudo apt install -y git build-essential

# Clonar proyecto
git clone <tu-repositorio>
cd discord-automod-bot

# Instalar dependencias
npm install --production

# Configurar .env
cp .env.example .env
nano .env  # Editar con tus tokens

# Instalar PM2 para gestión de procesos
sudo npm install -g pm2

# Iniciar bot
pm2 start index.js --name "automod-bot"

# Configurar PM2 para inicio automático
pm2 startup
pm2 save
```

### Instalación en CentOS/RHEL

```bash
# Instalar Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs npm

# Instalar herramientas
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y git

# Continuar con los mismos pasos que Ubuntu
```

---

## 🐳 Método 2: Docker & Docker Compose

### Prerequisitos
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Añadir usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### Despliegue con Docker

```bash
# Clonar proyecto
git clone <tu-repositorio>
cd discord-automod-bot

# Configurar variables de entorno
cp .env.example .env
nano .env  # Editar con tus tokens

# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Actualizar
docker-compose pull
docker-compose up -d --force-recreate
```

### Comandos Útiles de Docker

```bash
# Ver contenedores activos
docker ps

# Ver logs del bot
docker logs automod-bot -f

# Entrar al contenedor
docker exec -it automod-bot sh

# Reiniciar contenedor
docker restart automod-bot

# Ver uso de recursos
docker stats automod-bot
```

---

## ☁️ Método 3: Servicios Cloud Gratuitos

### 3.1 Railway.app

1. **Preparar el proyecto:**
```json
// Añadir a package.json
{
  "scripts": {
    "start": "node index.js",
    "build": "echo 'No build process required'"
  }
}
```

2. **Desplegar:**
   - Ve a [railway.app](https://railway.app)
   - Conecta tu repositorio GitHub
   - Añade variables de entorno
   - Despliega automáticamente

3. **Configurar variables:**
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `NODE_ENV=production`

### 3.2 Render.com

1. **Crear Web Service:**
   - Ve a [render.com](https://render.com)
   - Conecta GitHub
   - Selecciona "Web Service"

2. **Configurar:**
   ```
   Build Command: npm install
   Start Command: node index.js
   ```

3. **Variables de entorno:**
   - Añade `DISCORD_TOKEN` y `CLIENT_ID`

### 3.3 Heroku (Limitado)

```bash
# Instalar Heroku CLI
# Crear Procfile
echo "worker: node index.js" > Procfile

# Desplegar
heroku create tu-bot-name
heroku config:set DISCORD_TOKEN=tu_token
heroku config:set CLIENT_ID=tu_client_id
git push heroku main

# Escalar worker
heroku ps:scale worker=1
```

---

## ☁️ Método 4: Servicios Cloud Premium

### 4.1 DigitalOcean Droplet

```bash
# Crear Droplet Ubuntu 20.04 (1GB RAM)
# Conectar por SSH

# Script de instalación automática
curl -fsSL https://raw.githubusercontent.com/tu-usuario/discord-automod-bot/main/scripts/install.sh | bash

# O instalación manual (ver Método 1)
```

### 4.2 AWS EC2

1. **Crear instancia:**
   - AMI: Ubuntu Server 20.04
   - Tipo: t2.micro (elegible para capa gratuita)
   - Grupo de seguridad: SSH (22), HTTP (80) opcional

2. **Configurar:**
```bash
# Conectar por SSH
ssh -i tu-key.pem ubuntu@tu-ip

# Seguir pasos del Método 1
```

### 4.3 Google Cloud Platform

```bash
# Crear VM con gcloud CLI
gcloud compute instances create automod-bot \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --machine-type=e2-micro \
    --zone=us-central1-a

# Conectar
gcloud compute ssh automod-bot --zone=us-central1-a

# Instalar (ver Método 1)
```

---

## 🔧 Configuración Post-Despliegue

### SSL/HTTPS (Si usas webhook)

```bash
# Con Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d tu-dominio.com
```

### Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Firewalld (CentOS)
sudo firewall-cmd --add-service=ssh --permanent
sudo firewall-cmd --add-service=http --permanent
sudo firewall-cmd --add-service=https --permanent
sudo firewall-cmd --reload
```

### Backup Automático

```bash
# Crear script de backup
cat > /home/usuario/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/usuario/backups"
BOT_DIR="/home/usuario/discord-automod-bot"

mkdir -p $BACKUP_DIR
cp $BOT_DIR/database.json $BACKUP_DIR/database_$DATE.json

# Mantener solo últimos 7 backups
find $BACKUP_DIR -name "database_*.json" -type f -mtime +7 -delete
EOF

chmod +x /home/usuario/backup.sh

# Programar en cron (cada 6 horas)
crontab -e
# Añadir: 0 */6 * * * /home/usuario/backup.sh
```

### Monitoreo

```bash
# Instalar htop para monitoreo
sudo apt install htop

# Ver uso de recursos
htop

# Monitoreo específico del bot
pm2 monit
```

---

## 📊 Monitoring y Logging

### PM2 Logs

```bash
# Ver logs en tiempo real
pm2 logs automod-bot

# Ver solo errores
pm2 logs automod-bot --err

# Rotar logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### System Logs

```bash
# Ver logs del sistema
sudo journalctl -u pm2-usuario --follow

# Ver logs de Docker
docker logs automod-bot --follow --tail 100
```

### Alertas (Opcional)

```bash
# Script de verificación
cat > /home/usuario/check_bot.sh << 'EOF'
#!/bin/bash

# Verificar si el bot está ejecutándose
if ! pm2 describe automod-bot > /dev/null 2>&1; then
    echo "Bot no encontrado, reiniciando..."
    cd /home/usuario/discord-automod-bot
    pm2 start index.js --name "automod-bot"
    
    # Enviar notificación (opcional)
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚨 AutoMod Bot reiniciado automáticamente"}' \
    YOUR_SLACK_WEBHOOK_URL
fi
EOF

chmod +x /home/usuario/check_bot.sh

# Programar verificación cada 5 minutos
crontab -e
# Añadir: */5 * * * * /home/usuario/check_bot.sh
```

---

## 🔄 Actualización y Mantenimiento

### Actualización Manual

```bash
# Método tradicional
cd discord-automod-bot
git pull origin main
npm install --production
pm2 restart automod-bot

# Con Docker
docker-compose down
docker-compose pull
docker-compose up -d
```

### Actualización Automática (GitHub Actions)

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.7
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.PRIVATE_KEY }}
        script: |
          cd discord-automod-bot
          git pull origin main
          npm install --production
          pm2 restart automod-bot
```

### Script de Actualización Automática

```bash
cat > /home/usuario/update_bot.sh << 'EOF'
#!/bin/bash
cd /home/usuario/discord-automod-bot

echo "🔄 Verificando actualizaciones..."
git fetch origin

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ $LOCAL != $REMOTE ]; then
    echo "📥 Nueva versión disponible, actualizando..."
    
    # Backup de la base de datos
    cp database.json database.backup.$(date +%Y%m%d_%H%M%S).json
    
    # Actualizar código
    git pull origin main
    npm install --production
    
    # Reiniciar bot
    pm2 restart automod-bot
    
    echo "✅ Bot actualizado correctamente"
else
    echo "✅ Bot ya está actualizado"
fi
EOF

chmod +x /home/usuario/update_bot.sh

# Ejecutar actualización automática diaria
crontab -e
# Añadir: 0 2 * * * /home/usuario/update_bot.sh >> /var/log/bot_update.log 2>&1
```

---

## 🛡️ Seguridad

### Configuración Básica de Seguridad

```bash
# Cambiar puerto SSH (opcional)
sudo nano /etc/ssh/sshd_config
# Cambiar: Port 22 a Port 2222
sudo systemctl restart sshd

# Deshabilitar login root
sudo passwd -l root

# Configurar fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Variables de Entorno Seguras

```bash
# Crear archivo .env con permisos restrictivos
chmod 600 .env

# Verificar permisos
ls -la .env
# Debe mostrar: -rw------- 1 usuario usuario
```

### Rotación de Tokens

```bash
# Script para actualizar token
cat > /home/usuario/rotate_token.sh << 'EOF'
#!/bin/bash

echo "🔑 Rotando token del bot..."
echo "1. Ve a Discord Developer Portal"
echo "2. Regenera el token"
echo "3. Actualiza el archivo .env"
echo "4. Ejecuta: pm2 restart automod-bot"

read -p "¿Has actualizado el token? (y/N): " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pm2 restart automod-bot
    echo "✅ Token actualizado y bot reiniciado"
fi
EOF

chmod +x /home/usuario/rotate_token.sh
```

---

## 📈 Optimización de Rendimiento

### Configuración de PM2 para Múltiples Instancias

```bash
# Crear ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'automod-bot',
    script: 'index.js',
    instances: 1, // Solo 1 instancia para bots de Discord
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Usar el archivo de configuración
pm2 start ecosystem.config.js
```

### Optimización de Memoria

```bash
# Configurar swap (si tienes poca RAM)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Hacer permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 🔍 Troubleshooting Common Issues

### Bot se desconecta frecuentemente

```bash
# Verificar memoria disponible
free -h

# Verificar logs de PM2
pm2 logs automod-bot --lines 100

# Reiniciar con más memoria
pm2 restart automod-bot --max-memory-restart 300M
```

### Error de permisos

```bash
# Verificar propietario de archivos
ls -la

# Corregir permisos
sudo chown -R usuario:usuario /home/usuario/discord-automod-bot
chmod 755 index.js
```

### Puerto ocupado

```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3000

# Matar proceso si es necesario
sudo kill -9 PID
```

---

## 📋 Checklist de Despliegue

### Pre-Despliegue
- [ ] Token y Client ID configurados
- [ ] Permisos del bot verificados en Discord
- [ ] Código probado localmente
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas

### Post-Despliegue
- [ ] Bot conectado exitosamente
- [ ] Comandos registrados en Discord
- [ ] Logs funcionando correctamente
- [ ] Backup automático configurado
- [ ] Monitoreo configurado
- [ ] Firewall configurado
- [ ] SSL configurado (si aplica)

### Mantenimiento Regular
- [ ] Verificar logs semanalmente
- [ ] Actualizar dependencias mensualmente
- [ ] Rotar tokens trimestralmente
- [ ] Revisar backups mensualmente
- [ ] Monitorear uso de recursos

---

## 📞 Soporte Post-Despliegue

### Recursos Útiles
- **Logs**: `pm2 logs automod-bot`
- **Status**: `pm2 status`
- **Restart**: `pm2 restart automod-bot`
- **Monitoreo**: `pm2 monit`

### Contactos de Emergencia
```bash
# Script de información del sistema
cat > /home/usuario/system_info.sh << 'EOF'
#!/bin/bash
echo "=== INFORMACIÓN DEL SISTEMA ==="
echo "Fecha: $(date)"
echo "Uptime: $(uptime)"
echo "Memoria: $(free -h)"
echo "Disco: $(df -h /)"
echo "PM2 Status:"
pm2 status
echo "Últimos 10 logs del bot:"
pm2 logs automod-bot --lines 10 --nostream
EOF

chmod +x /home/usuario/system_info.sh
```

---

✅ **Tu bot está ahora desplegado en producción y listo para moderar tu servidor de Discord 24/7!**

🔔 **Recuerda:**
- Monitorear regularmente los logs
- Mantener el sistema actualizado
- Hacer backups periódicos
- Revisar la seguridad del servidor