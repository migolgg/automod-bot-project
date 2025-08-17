const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Validar configuración al iniciar
try {
    config.validate();
} catch (error) {
    console.error('❌ Error de configuración:', error.message);
    console.error('💡 Asegúrate de configurar el archivo .env correctamente');
    process.exit(1);
}

// Base de datos en memoria (en producción usar una base de datos real)
const database = {
    guilds: new Map(),
    warnings: new Map(),
    sanctions: new Map(),
    automodRules: new Map(),
    exceptions: new Map()
};

// Cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ]
});

// Clase principal de automoderación
class AutoModerationSystem {
    constructor() {
        this.rules = {
            spam: { enabled: false, limit: 5, timeWindow: 5000, punishment: 'warn', escalation: null },
            capsLock: { enabled: false, percentage: 70, punishment: 'warn', escalation: null },
            badWords: { enabled: false, words: [], punishment: 'warn', escalation: null },
            links: { enabled: false, whitelist: [], punishment: 'warn', escalation: null },
            mentions: { enabled: false, limit: 5, punishment: 'warn', escalation: null },
            duplicateText: { enabled: false, threshold: 80, punishment: 'warn', escalation: null },
            zalgo: { enabled: false, punishment: 'warn', escalation: null },
            invites: { enabled: false, punishment: 'warn', escalation: null },
            longMessages: { enabled: false, maxLength: 2000, punishment: 'warn', escalation: null },
            emojispam: { enabled: false, limit: 10, punishment: 'warn', escalation: null }
        };
        this.userMessages = new Map();
        this.recentMessages = new Map();
    }

    // Configurar reglas del servidor
    configureGuild(guildId, settings) {
        database.guilds.set(guildId, {
            ...this.rules,
            ...settings,
            exceptions: database.exceptions.get(guildId) || [],
            logChannel: null,
            modRoles: [],
            immuneRoles: [],
            maxWarnings: 3,
            escalationRules: {
                1: 'warn',
                2: 'timeout',
                3: 'kick',
                4: 'ban'
            },
            // Sistema de escalamiento avanzado por regla
            ruleEscalation: {
                // Configuración global por defecto
                global: {
                    enabled: true,
                    timeWindow: 24 * 60 * 60 * 1000, // 24 horas
                    escalationSteps: [
                        { threshold: 1, action: 'warn', duration: null },
                        { threshold: 2, action: 'timeout', duration: 5 * 60 * 1000 }, // 5 min
                        { threshold: 3, action: 'timeout', duration: 30 * 60 * 1000 }, // 30 min
                        { threshold: 5, action: 'kick', duration: null },
                        { threshold: 7, action: 'ban', duration: null }
                    ],
                    resetAfter: 7 * 24 * 60 * 60 * 1000 // Reset después de 7 días
                },
                // Configuraciones específicas por tipo de regla
                spam: {
                    enabled: true,
                    timeWindow: 10 * 60 * 1000, // 10 minutos para spam
                    escalationSteps: [
                        { threshold: 1, action: 'delete', duration: null },
                        { threshold: 3, action: 'timeout', duration: 5 * 60 * 1000 },
                        { threshold: 5, action: 'timeout', duration: 60 * 60 * 1000 }, // 1 hora
                        { threshold: 8, action: 'kick', duration: null }
                    ],
                    resetAfter: 2 * 60 * 60 * 1000 // Reset después de 2 horas
                },
                badWords: {
                    enabled: true,
                    timeWindow: 60 * 60 * 1000, // 1 hora
                    escalationSteps: [
                        { threshold: 1, action: 'delete', duration: null },
                        { threshold: 2, action: 'warn', duration: null },
                        { threshold: 3, action: 'timeout', duration: 30 * 60 * 1000 },
                        { threshold: 5, action: 'kick', duration: null },
                        { threshold: 6, action: 'ban', duration: null }
                    ],
                    resetAfter: 24 * 60 * 60 * 1000
                },
                invites: {
                    enabled: true,
                    timeWindow: 24 * 60 * 60 * 1000,
                    escalationSteps: [
                        { threshold: 1, action: 'delete', duration: null },
                        { threshold: 2, action: 'timeout', duration: 60 * 60 * 1000 }, // 1 hora
                        { threshold: 3, action: 'ban', duration: null } // Tolerancia cero para invites
                    ],
                    resetAfter: 7 * 24 * 60 * 60 * 1000
                }
            }
        });
    }

    // Obtener configuración del servidor
    getGuildConfig(guildId) {
        return database.guilds.get(guildId) || this.configureGuild(guildId, {});
    }

    // Verificar si un usuario tiene inmunidad
    isImmune(member, guildConfig) {
        if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
        return guildConfig.immuneRoles.some(roleId => member.roles.cache.has(roleId));
    }

    // Verificar excepciones
    hasException(guildId, userId, ruleType, channelId = null) {
        const exceptions = database.exceptions.get(guildId) || [];
        return exceptions.some(ex => 
            (ex.userId === userId || ex.roleId) && 
            ex.ruleType === ruleType && 
            (ex.channelId === channelId || ex.channelId === 'all')
        );
    }

    // Detectar spam
    async detectSpam(message) {
        const userId = message.author.id;
        const guildId = message.guild.id;
        const config = this.getGuildConfig(guildId);
        
        if (!config.spam.enabled) return false;

        const key = `${guildId}_${userId}`;
        const now = Date.now();
        
        if (!this.userMessages.has(key)) {
            this.userMessages.set(key, []);
        }
        
        const messages = this.userMessages.get(key);
        messages.push(now);
        
        // Limpiar mensajes antiguos
        const validMessages = messages.filter(time => now - time < config.spam.timeWindow);
        this.userMessages.set(key, validMessages);
        
        return validMessages.length > config.spam.limit;
    }

    // Detectar texto en mayúsculas
    detectCapsLock(message) {
        const config = this.getGuildConfig(message.guild.id);
        if (!config.capsLock.enabled) return false;
        
        const text = message.content.replace(/[^a-zA-Z]/g, '');
        if (text.length < 5) return false;
        
        const capsCount = text.replace(/[^A-Z]/g, '').length;
        const percentage = (capsCount / text.length) * 100;
        
        return percentage >= config.capsLock.percentage;
    }

    // Detectar palabras prohibidas
    detectBadWords(message) {
        const config = this.getGuildConfig(message.guild.id);
        if (!config.badWords.enabled || !config.badWords.words.length) return false;
        
        const content = message.content.toLowerCase();
        return config.badWords.words.some(word => content.includes(word.toLowerCase()));
    }

    // Detectar enlaces
    detectLinks(message) {
        const config = this.getGuildConfig(message.guild.id);
        if (!config.links.enabled) return false;
        
        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
        const urls = message.content.match(urlRegex);
        
        if (!urls) return false;
        
        // Si no hay whitelist configurada, bloquear todos los enlaces
        if (config.links.whitelist.length === 0) return true;
        
        // Verificar cada URL encontrada
        return urls.some(url => {
            const urlLower = url.toLowerCase();
            
            // Verificar si la URL contiene algún dominio de la whitelist
            const isWhitelisted = config.links.whitelist.some(whitelistedDomain => {
                const domainLower = whitelistedDomain.toLowerCase();
                
                // Verificación flexible: permite subdominios y diferentes protocolos
                return urlLower.includes(domainLower) || 
                       urlLower.includes(`www.${domainLower}`) ||
                       urlLower.includes(`://${domainLower}`) ||
                       urlLower.includes(`://www.${domainLower}`);
            });
            
            return !isWhitelisted; // Retorna true si NO está en whitelist (debe bloquearse)
        });
    }

    // Detectar exceso de menciones
    detectMentions(message) {
        const config = this.getGuildConfig(message.guild.id);
        if (!config.mentions.enabled) return false;
        
        const mentions = message.mentions.users.size + message.mentions.roles.size;
        return mentions > config.mentions.limit;
    }

    // Detectar invitaciones de Discord
    detectInvites(message) {
        const config = this.getGuildConfig(message.guild.id);
        if (!config.invites.enabled) return false;
        
        const inviteRegex = /discord\.gg\/[a-zA-Z0-9]+|discord\.com\/invite\/[a-zA-Z0-9]+|discordapp\.com\/invite\/[a-zA-Z0-9]+/gi;
        return inviteRegex.test(message.content);
    }

    // Detectar texto duplicado
    detectDuplicateText(message) {
        const config = this.getGuildConfig(message.guild.id);
        if (!config.duplicateText.enabled) return false;
        
        const channelKey = `${message.guild.id}_${message.channel.id}`;
        const recent = this.recentMessages.get(channelKey) || [];
        
        const similarity = recent.some(recentMsg => {
            const similarity = this.calculateSimilarity(message.content, recentMsg);
            return similarity >= config.duplicateText.threshold;
        });
        
        recent.push(message.content);
        if (recent.length > 10) recent.shift();
        this.recentMessages.set(channelKey, recent);
        
        return similarity;
    }

    // Calcular similitud entre textos
    calculateSimilarity(text1, text2) {
        const longer = text1.length > text2.length ? text1 : text2;
        const shorter = text1.length > text2.length ? text2 : text1;
        
        if (longer.length === 0) return 100;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return ((longer.length - distance) / longer.length) * 100;
    }

    // Distancia de Levenshtein
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // Detectar mensajes muy largos
    detectLongMessage(message) {
        const config = this.getGuildConfig(message.guild.id);
        if (!config.longMessages.enabled) return false;
        
        return message.content.length > config.longMessages.maxLength;
    }

    // Detectar spam de emojis
    detectEmojiSpam(message) {
        const config = this.getGuildConfig(message.guild.id);
        if (!config.emojispam.enabled) return false;
        
        const emojiRegex = /<a?:\w+:\d+>|[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
        const emojis = message.content.match(emojiRegex);
        
        return emojis && emojis.length > config.emojispam.limit;
    }

    // Detectar texto zalgo
    detectZalgo(message) {
        const config = this.getGuildConfig(message.guild.id);
        if (!config.zalgo.enabled) return false;
        
        const zalgoRegex = /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g;
        const zalgoCount = (message.content.match(zalgoRegex) || []).length;
        
        return zalgoCount > 5;
    }

    // Ejecutar sanción con escalamiento avanzado
    async executePunishment(message, ruleType, basePunishment) {
        const member = message.member;
        const guild = message.guild;
        const config = this.getGuildConfig(guild.id);

        // Verificar si hay escalamiento específico para esta regla
        const ruleEscalation = config.ruleEscalation?.[ruleType] || config.ruleEscalation?.global;
        
        if (ruleEscalation && ruleEscalation.enabled) {
            const escalatedAction = await this.calculateEscalation(member, ruleType, ruleEscalation);
            if (escalatedAction) {
                await this.executeAction(message, member, ruleType, escalatedAction.action, escalatedAction.duration);
                await this.logEscalatedAction(guild, member, ruleType, escalatedAction, message.content);
                return;
            }
        }

        // Si no hay escalamiento, usar castigo base
        await this.executeAction(message, member, ruleType, basePunishment, null);
        await this.logAction(guild, member, ruleType, basePunishment, message.content);
    }

    // Calcular escalamiento basado en infracciones recientes
    async calculateEscalation(member, ruleType, escalationConfig) {
        const key = `${member.guild.id}_${member.id}_${ruleType}`;
        const now = Date.now();
        
        // Obtener infracciones recientes para esta regla específica
        let ruleInfractions = database.sanctions.get(key) || [];
        
        // Filtrar infracciones dentro de la ventana de tiempo
        ruleInfractions = ruleInfractions.filter(infraction => 
            now - infraction.timestamp < escalationConfig.timeWindow
        );
        
        // Agregar la infracción actual
        ruleInfractions.push({
            timestamp: now,
            ruleType: ruleType,
            id: Date.now()
        });
        
        // Guardar infracciones actualizadas
        database.sanctions.set(key, ruleInfractions);
        
        const infractionCount = ruleInfractions.length;
        
        // Encontrar el escalamiento apropiado
        const escalationSteps = escalationConfig.escalationSteps.sort((a, b) => b.threshold - a.threshold);
        const applicableStep = escalationSteps.find(step => infractionCount >= step.threshold);
        
        if (applicableStep) {
            return {
                action: applicableStep.action,
                duration: applicableStep.duration,
                count: infractionCount,
                threshold: applicableStep.threshold
            };
        }
        
        return null;
    }

    // Ejecutar acción específica
    async executeAction(message, member, ruleType, action, duration = null) {
        try {
            switch (action) {
                case 'warn':
                    await this.addWarning(member, ruleType, message.content);
                    break;

                case 'delete':
                    await message.delete();
                    break;

                case 'timeout':
                    const timeoutDuration = duration || 5 * 60 * 1000; // 5 minutos por defecto
                    await member.timeout(timeoutDuration, `Violación de regla: ${ruleType}`);
                    await message.delete();
                    break;

                case 'kick':
                    await member.kick(`Escalamiento automático: ${ruleType}`);
                    await message.delete();
                    break;

                case 'ban':
                    await member.ban({ reason: `Escalamiento automático: ${ruleType}` });
                    break;

                case 'tempban':
                    // Para implementar bans temporales en el futuro
                    await member.ban({ reason: `Ban temporal: ${ruleType}` });
                    break;
            }
        } catch (error) {
            console.error('Error ejecutando acción:', error);
        }
    }

    // Log de acción escalada
    async logEscalatedAction(guild, member, ruleType, escalation, content) {
        const config = this.getGuildConfig(guild.id);
        if (!config.logChannel) return;

        const channel = guild.channels.cache.get(config.logChannel);
        if (!channel) return;

        const durationText = escalation.duration ? 
            ` (${this.formatDuration(escalation.duration)})` : '';

        const embed = new EmbedBuilder()
            .setColor(this.getActionColor(escalation.action))
            .setTitle('⚡ Escalamiento Automático')
            .addFields(
                { name: '👤 Usuario', value: `${member.user.tag} (${member.id})`, inline: true },
                { name: '⚖️ Regla Violada', value: ruleType, inline: true },
                { name: '🔨 Acción', value: `${escalation.action}${durationText}`, inline: true },
                { name: '📊 Infracciones', value: `${escalation.count}/${escalation.threshold} en ventana de tiempo`, inline: true },
                { name: '📝 Contenido', value: content.substring(0, 1000) + (content.length > 1000 ? '...' : ''), inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Sistema de Automoderación' });

        await channel.send({ embeds: [embed] });
    }
}

// Inicializar sistema de automoderación
const autoMod = new AutoModerationSystem();

// Evento cuando el bot está listo
client.once('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}!`);
    client.user.setActivity('Moderando servidores', { type: 'WATCHING' });
    
    // Inicializar limpieza automática de infracciones cada hora
    setInterval(() => {
        autoMod.cleanupExpiredInfractions();
        console.log('🧹 Limpieza de infracciones expiradas completada');
    }, 60 * 60 * 1000); // Cada hora
    
    // Ejecutar limpieza inicial
    autoMod.cleanupExpiredInfractions();
});

// Evento de mensajes
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    
    const config = autoMod.getGuildConfig(message.guild.id);
    const member = message.member;
    
    // Verificar inmunidad
    if (autoMod.isImmune(member, config)) return;
    
    // Array de verificaciones
    const checks = [
        { name: 'spam', detector: () => autoMod.detectSpam(message) },
        { name: 'capsLock', detector: () => autoMod.detectCapsLock(message) },
        { name: 'badWords', detector: () => autoMod.detectBadWords(message) },
        { name: 'links', detector: () => autoMod.detectLinks(message) },
        { name: 'mentions', detector: () => autoMod.detectMentions(message) },
        { name: 'invites', detector: () => autoMod.detectInvites(message) },
        { name: 'duplicateText', detector: () => autoMod.detectDuplicateText(message) },
        { name: 'zalgo', detector: () => autoMod.detectZalgo(message) },
        { name: 'longMessages', detector: () => autoMod.detectLongMessage(message) },
        { name: 'emojispam', detector: () => autoMod.detectEmojiSpam(message) }
    ];
    
    // Ejecutar verificaciones
    for (const check of checks) {
        if (autoMod.hasException(message.guild.id, message.author.id, check.name, message.channel.id)) {
            continue;
        }
        
        try {
            const detected = await check.detector();
            if (detected) {
                const ruleConfig = config[check.name];
                if (ruleConfig && ruleConfig.enabled) {
                    await autoMod.executePunishment(message, check.name, ruleConfig.punishment);
                    break; // Solo aplicar una sanción por mensaje
                }
            }
        } catch (error) {
            console.error(`Error en verificación ${check.name}:`, error);
        }
    }
});

// Comandos slash
const commands = [
    new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configurar el sistema de automoderación')
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('Configurar reglas de automoderación')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Ver estado del sistema de automoderación')
        ),

    new SlashCommandBuilder()
        .setName('modlog')
        .setDescription('Configurar canal de logs de moderación')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal para logs de moderación')
                .setRequired(true)
        )
];

// Manejo de comandos slash
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    // Verificar permisos
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({
            content: '❌ No tienes permisos para usar este comando.',
            ephemeral: true
        });
    }

    try {
        switch (commandName) {
            case 'automod':
                await handleAutoModCommand(interaction);
                break;
            case 'modlog':
                await handleModLogCommand(interaction);
                break;
        }
    } catch (error) {
        console.error('Error en comando:', error);
        await interaction.reply({
            content: '❌ Hubo un error al ejecutar el comando.',
            ephemeral: true
        });
    }
});

// Manejador del comando automod
async function handleAutoModCommand(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
        case 'config':
            await showConfigurationPanel(interaction);
            break;
        case 'status':
            await showStatus(interaction);
            break;
    }
}

// Mostrar panel de configuración
async function showConfigurationPanel(interaction) {
    const config = autoMod.getGuildConfig(interaction.guild.id);
    
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🛡️ Panel de Configuración - Automoderación')
        .setDescription('Selecciona una regla para configurar:');

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('config_rule')
        .setPlaceholder('Selecciona una regla para configurar')
        .addOptions([
            {
                label: 'Anti-Spam',
                description: `Estado: ${config.spam?.enabled ? '✅ Activado' : '❌ Desactivado'}`,
                value: 'spam'
            },
            {
                label: 'Anti-Mayúsculas',
                description: `Estado: ${config.capsLock?.enabled ? '✅ Activado' : '❌ Desactivado'}`,
                value: 'capsLock'
            },
            {
                label: 'Palabras Prohibidas',
                description: `Estado: ${config.badWords?.enabled ? '✅ Activado' : '❌ Desactivado'}`,
                value: 'badWords'
            },
            {
                label: 'Anti-Enlaces',
                description: `Estado: ${config.links?.enabled ? '✅ Activado' : '❌ Desactivado'}`,
                value: 'links'
            },
            {
                label: 'Anti-Invitaciones',
                description: `Estado: ${config.invites?.enabled ? '✅ Activado' : '❌ Desactivado'}`,
                value: 'invites'
            }
        ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
    });
}

// Mostrar estado del sistema
async function showStatus(interaction) {
    const config = autoMod.getGuildConfig(interaction.guild.id);
    
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('📊 Estado del Sistema de Automoderación')
        .addFields(
            { 
                name: '🚫 Anti-Spam', 
                value: config.spam?.enabled ? `✅ Activado (${config.spam.limit} msgs/${config.spam.timeWindow/1000}s)` : '❌ Desactivado', 
                inline: true 
            },
            { 
                name: '🔤 Anti-Mayúsculas', 
                value: config.capsLock?.enabled ? `✅ Activado (${config.capsLock.percentage}%)` : '❌ Desactivado', 
                inline: true 
            },
            { 
                name: '🤐 Palabras Prohibidas', 
                value: config.badWords?.enabled ? `✅ Activado (${config.badWords.words.length} palabras)` : '❌ Desactivado', 
                inline: true 
            },
            { 
                name: '🔗 Anti-Enlaces', 
                value: config.links?.enabled ? `✅ Activado` : '❌ Desactivado', 
                inline: true 
            },
            { 
                name: '📢 Anti-Menciones', 
                value: config.mentions?.enabled ? `✅ Activado (${config.mentions.limit} max)` : '❌ Desactivado', 
                inline: true 
            },
            { 
                name: '🎫 Anti-Invitaciones', 
                value: config.invites?.enabled ? '✅ Activado' : '❌ Desactivado', 
                inline: true 
            }
        )
        .setFooter({ 
            text: `Canal de logs: ${config.logChannel ? `<#${config.logChannel}>` : 'No configurado'}` 
        })
        .setTimestamp();
    
    await interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
}

// Manejador del comando modlog
async function handleModLogCommand(interaction) {
    const channel = interaction.options.getChannel('canal');
    
    if (!channel.isTextBased()) {
        return interaction.reply({
            content: '❌ El canal debe ser un canal de texto.',
            ephemeral: true
        });
    }
    
    const config = autoMod.getGuildConfig(interaction.guild.id);
    config.logChannel = channel.id;
    database.guilds.set(interaction.guild.id, config);
    
    await interaction.reply({
        content: `✅ Canal de logs configurado en ${channel}.`,
        ephemeral: true
    });
}

// Manejo de interacciones de componentes
client.on('interactionCreate', async (interaction) => {
    if (interaction.isStringSelectMenu()) {
        await handleSelectMenuInteraction(interaction);
    } else if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
    } else if (interaction.isModalSubmit()) {
        await handleModalSubmit(interaction);
    }
});

// Manejar selecciones de menú
async function handleSelectMenuInteraction(interaction) {
    if (interaction.customId === 'config_rule') {
        const ruleType = interaction.values[0];
        await showRuleConfiguration(interaction, ruleType);
    }
}

// Mostrar configuración de regla específica
async function showRuleConfiguration(interaction, ruleType) {
    const config = autoMod.getGuildConfig(interaction.guild.id);
    const ruleConfig = config[ruleType] || {};
    
    const ruleNames = {
        spam: 'Anti-Spam',
        capsLock: 'Anti-Mayúsculas',
        badWords: 'Palabras Prohibidas',
        links: 'Anti-Enlaces',
        mentions: 'Anti-Menciones Masivas',
        invites: 'Anti-Invitaciones'
    };
    
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`⚙️ Configuración: ${ruleNames[ruleType]}`)
        .setDescription(`Estado actual: ${ruleConfig.enabled ? '✅ Activado' : '❌ Desactivado'}`)
        .addFields(
            { name: '🔨 Castigo', value: ruleConfig.punishment || 'warn', inline: true }
        );
    
    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`toggle_${ruleType}`)
                .setLabel(ruleConfig.enabled ? 'Desactivar' : 'Activar')
                .setStyle(ruleConfig.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`configure_${ruleType}`)
                .setLabel('Configurar')
                .setStyle(ButtonStyle.Primary)
        );
    
    await interaction.update({
        embeds: [embed],
        components: [buttons]
    });
}

// Manejar interacciones de botones
async function handleButtonInteraction(interaction) {
    const [action, ruleType] = interaction.customId.split('_');
    
    switch (action) {
        case 'toggle':
            await toggleRule(interaction, ruleType);
            break;
        case 'configure':
            await showConfigureModal(interaction, ruleType);
            break;
    }
}

// Alternar estado de regla
async function toggleRule(interaction, ruleType) {
    const config = autoMod.getGuildConfig(interaction.guild.id);
    
    if (!config[ruleType]) {
        config[ruleType] = { enabled: false, punishment: 'warn' };
    }
    
    config[ruleType].enabled = !config[ruleType].enabled;
    database.guilds.set(interaction.guild.id, config);
    
    await interaction.reply({
        content: `✅ Regla "${ruleType}" ${config[ruleType].enabled ? 'activada' : 'desactivada'}.`,
        ephemeral: true
    });
}

// Mostrar modal de configuración
async function showConfigureModal(interaction, ruleType) {
    const config = autoMod.getGuildConfig(interaction.guild.id);
    const ruleConfig = config[ruleType] || {};
    
    const modal = new ModalBuilder()
        .setCustomId(`configure_modal_${ruleType}`)
        .setTitle(`Configurar ${ruleType}`);
    
    switch (ruleType) {
        case 'spam':
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('limit')
                        .setLabel('Límite de mensajes')
                        .setStyle(TextInputStyle.Short)
                        .setValue(String(ruleConfig.limit || 5))
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('timeWindow')
                        .setLabel('Ventana de tiempo (segundos)')
                        .setStyle(TextInputStyle.Short)
                        .setValue(String((ruleConfig.timeWindow || 5000) / 1000))
                        .setRequired(true)
                )
            );
            break;
            
        case 'capsLock':
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('percentage')
                        .setLabel('Porcentaje de mayúsculas (0-100)')
                        .setStyle(TextInputStyle.Short)
                        .setValue(String(ruleConfig.percentage || 70))
                        .setRequired(true)
                )
            );
            break;
            
        case 'badWords':
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('words')
                        .setLabel('Palabras prohibidas (separadas por comas)')
                        .setStyle(TextInputStyle.Paragraph)
                        .setValue(ruleConfig.words?.join(', ') || '')
                        .setRequired(false)
                )
            );
            break;
            
        case 'links':
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('whitelist')
                        .setLabel('Dominios permitidos (separados por comas)')
                        .setStyle(TextInputStyle.Paragraph)
                        .setValue(ruleConfig.whitelist?.join(', ') || '')
                        .setRequired(false)
                )
            );
            break;
    }
    
    await interaction.showModal(modal);
}

// Manejar envío de modal
async function handleModalSubmit(interaction) {
    const [, , ruleType] = interaction.customId.split('_');
    const config = autoMod.getGuildConfig(interaction.guild.id);
    
    if (!config[ruleType]) {
        config[ruleType] = { enabled: false, punishment: 'warn' };
    }
    
    switch (ruleType) {
        case 'spam':
            const limit = parseInt(interaction.fields.getTextInputValue('limit'));
            const timeWindow = parseInt(interaction.fields.getTextInputValue('timeWindow')) * 1000;
            
            if (limit > 0 && timeWindow > 0) {
                config[ruleType].limit = limit;
                config[ruleType].timeWindow = timeWindow;
            }
            break;
            
        case 'capsLock':
            const percentage = parseInt(interaction.fields.getTextInputValue('percentage'));
            if (percentage >= 0 && percentage <= 100) {
                config[ruleType].percentage = percentage;
            }
            break;
            
        case 'badWords':
            const wordsText = interaction.fields.getTextInputValue('words');
            config[ruleType].words = wordsText
                .split(',')
                .map(word => word.trim())
                .filter(word => word.length > 0);
            break;
            
        case 'links':
            const whitelistText = interaction.fields.getTextInputValue('whitelist');
            config[ruleType].whitelist = whitelistText
                .split(',')
                .map(domain => domain.trim())
                .filter(domain => domain.length > 0);
            break;
    }
    
    database.guilds.set(interaction.guild.id, config);
    
    await interaction.reply({
        content: `✅ Configuración de "${ruleType}" actualizada correctamente.`,
        ephemeral: true
    });
}

// Registro de comandos slash
async function deployCommands() {
    const rest = new REST({ version: '10' }).setToken(config.token);
    
    try {
        console.log('📄 Registrando comandos slash...');
        
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );
        
        console.log('✅ Comandos slash registrados correctamente.');
    } catch (error) {
        console.error('❌ Error registrando comandos:', error);
    }
}

// Funciones de utilidad para persistencia de datos
function saveDatabase() {
    const data = {
        guilds: Object.fromEntries(database.guilds),
        warnings: Object.fromEntries(database.warnings),
        sanctions: Object.fromEntries(database.sanctions),
        automodRules: Object.fromEntries(database.automodRules),
        exceptions: Object.fromEntries(database.exceptions)
    };
    
    fs.writeFileSync(path.join(__dirname, 'database.json'), JSON.stringify(data, null, 2));
}

function loadDatabase() {
    try {
        const dbPath = path.join(__dirname, 'database.json');
        if (fs.existsSync(dbPath)) {
            const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            
            database.guilds = new Map(Object.entries(data.guilds || {}));
            database.warnings = new Map(Object.entries(data.warnings || {}));
            database.sanctions = new Map(Object.entries(data.sanctions || {}));
            database.automodRules = new Map(Object.entries(data.automodRules || {}));
            database.exceptions = new Map(Object.entries(data.exceptions || {}));
            
            console.log('✅ Base de datos cargada correctamente.');
        }
    } catch (error) {
        console.error('❌ Error cargando la base de datos:', error);
    }
}

// Guardar base de datos cada 5 minutos
setInterval(saveDatabase, 5 * 60 * 1000);

// Guardar base de datos al cerrar el proceso
process.on('SIGINT', () => {
    console.log('💾 Guardando base de datos...');
    saveDatabase();
    console.log('✅ Base de datos guardada. Cerrando bot...');
    process.exit(0);
});

// Inicializar el bot
async function startBot() {
    try {
        // Cargar base de datos
        loadDatabase();
        
        // Registrar comandos
        await deployCommands();
        
        // Conectar bot
        await client.login(config.token);
    } catch (error) {
        console.error('❌ Error iniciando el bot:', error);
        process.exit(1);
    }
}

// Iniciar el bot
startBot().catch(console.error);

// Exportar para uso modular
module.exports = { client, autoMod, database };
            .setFooter({ text: 'Sistema de Escalamiento Automático' });

        await channel.send({ embeds: [embed] });
    }

    // Obtener color según acción
    getActionColor(action) {
        const colors = {
            'warn': '#ffaa00',
            'delete': '#ff6600',
            'timeout': '#ff0066',
            'kick': '#cc0000',
            'ban': '#990000',
            'tempban': '#660000'
        };
        return colors[action] || '#ff0000';
    }

    // Formatear duración
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d`;
        if (hours > 0) return `${hours}h`;
        if (minutes > 0) return `${minutes}m`;
        return `${seconds}s`;
    }

    // Limpiar infracciones expiradas
    cleanupExpiredInfractions() {
        const now = Date.now();
        
        for (const [key, infractions] of database.sanctions.entries()) {
            const [guildId, userId, ruleType] = key.split('_');
            const config = this.getGuildConfig(guildId);
            const escalationConfig = config.ruleEscalation?.[ruleType] || config.ruleEscalation?.global;
            
            if (escalationConfig) {
                const validInfractions = infractions.filter(inf => 
                    now - inf.timestamp < escalationConfig.resetAfter
                );
                
                if (validInfractions.length !== infractions.length) {
                    if (validInfractions.length > 0) {
                        database.sanctions.set(key, validInfractions);
                    } else {
                        database.sanctions.delete(key);
                    }
                }
            }
        }
    }

    // Añadir advertencia
    async addWarning(member, reason, content) {
        const key = `${member.guild.id}_${member.id}`;
        const warnings = database.warnings.get(key) || [];
        
        warnings.push({
            id: Date.now(),
            reason,
            content,
            timestamp: new Date(),
            moderator: 'AutoMod'
        });
        
        database.warnings.set(key, warnings);
    }

    // Registrar acción en log
    async logAction(guild, member, ruleType, action, content) {
        const config = this.getGuildConfig(guild.id);
        if (!config.logChannel) return;

        const channel = guild.channels.cache.get(config.logChannel);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🛡️ Acción de Automoderación')
            .addFields(
                { name: '👤 Usuario', value: `${member.user.tag} (${member.id})`, inline: true },
                { name: '⚖️ Regla Violada', value: ruleType, inline: true },
                { name: '🔨 Acción', value: action, inline: true },
                { name: '📝 Contenido', value: content.substring(0, 1000) + (content.length > 1000 ? '...' : ''), inline: false }
            )
            .setTimestamp()