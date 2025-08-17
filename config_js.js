require('dotenv').config();

module.exports = {
    // Discord Bot Configuration
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID || null, // Opcional para desarrollo
    
    // Bot Settings
    prefix: '!', // Prefix para comandos de texto (si los implementas)
    
    // Database Configuration
    database: {
        path: './database.json',
        autoSave: true,
        saveInterval: 5 * 60 * 1000 // 5 minutos
    },
    
    // Default Automod Settings
    defaults: {
        maxWarnings: 3,
        logChannel: null,
        modRoles: [],
        immuneRoles: [],
        
        // Default punishments for rules
        punishments: {
            spam: 'timeout',
            capsLock: 'warn',
            badWords: 'delete',
            links: 'delete',
            mentions: 'warn',
            invites: 'ban',
            duplicateText: 'warn',
            zalgo: 'delete',
            longMessages: 'warn',
            emojispam: 'warn'
        }
    },
    
    // Feature flags
    features: {
        autoSave: true,
        escalationSystem: true,
        whitelistPresets: true,
        advancedLogging: true
    },
    
    // Environment
    environment: process.env.NODE_ENV || 'development',
    
    // Validation
    validate() {
        if (!this.token) {
            throw new Error('DISCORD_TOKEN is required in environment variables');
        }
        if (!this.clientId) {
            throw new Error('CLIENT_ID is required in environment variables');
        }
        return true;
    }
};