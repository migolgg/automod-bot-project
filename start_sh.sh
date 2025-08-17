#!/bin/bash

# Script de inicio para Discord AutoMod Bot
# Autor: Tu Nombre
# Versión: 1.0.0

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛡️  Discord AutoMod Bot - Script de Inicio${NC}"
echo "=================================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo -e "${YELLOW}💡 Instala Node.js desde: https://nodejs.org/${NC}"
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="16.9.0"

echo -e "${BLUE}📋 Verificando versión de Node.js...${NC}"
echo "Versión actual: $NODE_VERSION"
echo "Versión requerida: $REQUIRED_VERSION"

# Función para comparar versiones
version_compare() {
    if [[ $1 == $2 ]]; then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++)); do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ -z ${ver2[i]} ]]; then
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]})); then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]})); then
            return 2
        fi
    done
    return 0
}

version_compare $NODE_VERSION $REQUIRED_VERSION
case $? in
    0) echo -e "${GREEN}✅ Versión de Node.js compatible${NC}" ;;
    1) echo -e "${GREEN}✅ Versión de Node.js superior (compatible)${NC}" ;;
    2) echo -e "${RED}❌ Versión de Node.js inferior a la requerida${NC}"
       echo -e "${YELLOW}💡 Actualiza Node.js desde: https://nodejs.org/${NC}"
       exit 1 ;;
esac

# Verificar si el archivo .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    echo -e "${BLUE}📋 Creando archivo .env desde plantilla...${NC}"
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Archivo .env creado${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANTE: Edita el archivo .env con tus tokens antes de continuar${NC}"
        echo -e "${BLUE}💡 Usa: nano .env o tu editor favorito${NC}"
        
        read -p "¿Has configurado el archivo .env? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}❌ Configuración cancelada${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ No se encontró .env.example${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
fi

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencias no instaladas${NC}"
    echo -e "${BLUE}📦 Instalando dependencias...${NC}"
    
    if command -v npm &> /dev/null; then
        npm install
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
        else
            echo -e "${RED}❌ Error instalando dependencias${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ npm no está disponible${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Dependencias ya instaladas${NC}"
fi

# Verificar archivo principal
if [ ! -f "index.js" ]; then
    echo -e "${RED}❌ No se encontró index.js${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Archivo principal encontrado${NC}"
fi

# Verificar variables de entorno críticas
echo -e "${BLUE}🔍 Verificando configuración...${NC}"

# Función para verificar variable de entorno en .env
check_env_var() {
    local var_name=$1
    local var_value=$(grep "^$var_name=" .env | cut -d '=' -f2)
    
    if [ -z "$var_value" ] || [ "$var_value" = "your_token_here" ] || [ "$var_value" = "your_client_id_here" ]; then
        return 1
    else
        return 0
    fi
}

# Verificar DISCORD_TOKEN
if check_env_var "DISCORD_TOKEN"; then
    echo -e "${GREEN}✅ DISCORD_TOKEN configurado${NC}"
else
    echo -e "${RED}❌ DISCORD_TOKEN no configurado correctamente${NC}"
    echo -e "${YELLOW}💡 Edita el archivo .env y añade tu token${NC}"
    exit 1
fi

# Verificar CLIENT_ID
if check_env_var "CLIENT_ID"; then
    echo -e "${GREEN}✅ CLIENT_ID configurado${NC}"
else
    echo -e "${RED}❌ CLIENT_ID no configurado correctamente${NC}"
    echo -e "${YELLOW}💡 Edita el archivo .env y añade tu client ID${NC}"
    exit 1
fi

# Crear directorio de logs si no existe
if [ ! -d "logs" ]; then
    mkdir logs
    echo -e "${GREEN}✅ Directorio de logs creado${NC}"
fi

# Función para manejar señales de interrupción
cleanup() {
    echo -e "\n${YELLOW}⚠️  Deteniendo bot...${NC}"
    kill $BOT_PID 2>/dev/null
    echo -e "${GREEN}✅ Bot detenido correctamente${NC}"
    exit 0
}

# Configurar traps para manejo de señales
trap cleanup SIGTERM SIGINT

echo "=================================================="
echo -e "${GREEN}🚀 Iniciando Discord AutoMod Bot...${NC}"
echo -e "${BLUE}💡 Presiona Ctrl+C para detener el bot${NC}"
echo "=================================================="

# Iniciar el bot
node index.js &
BOT_PID=$!

# Esperar a que el proceso termine
wait $BOT_PID