// Aplicar preset de escalamiento
async function applyEscalationPreset(interaction) {
    const presetType = interaction.options.getString('tipo');
    const config = autoMod.getGuildConfig(interaction.guild.id);
    
    // Presets predefinidos
    const presets = {
        strict: {
            name: '🔒 Estricto',
            description: 'Tolerancia baja - Para comunidades que requieren control estricto',
            rules: {
                spam: {
                    enabled: true,
                    timeWindow: 5 * 60 * 1000,
                    escalationSteps: [
                        { threshold: 1, action: 'delete', duration: null },
                        { threshold: 2, action: 'timeout', duration: 10 * 60 * 1000 },
                        { threshold: 4, action: 'kick', duration: null }
                    ],
                    resetAfter: 1 * 60 * 60 * 1000
                },
                badWords: {
                    enabled: true,
                    timeWindow: 60 * 60 * 1000,
                    escalationSteps: [
                        { threshold: 1, action: 'delete', duration: null },
                        { threshold: 2, action: 'timeout', duration: 60 * 60 * 1000 },
                        { threshold: 3, action: 'ban', duration: null }
                    ],
                    resetAfter: 24 * 60 * 60 * 1000
                },
                invites: {
                    enabled: true,
                    timeWindow: 24 * 60 * 60 * 1000,
                    escalationSteps: [
                        { threshold: 1, action: 'ban', duration: null }
                    ],
                    resetAfter: 7 * 24 * 60 * 60 * 1000
                }
            }
        },
        moderate: {
            name: '⚖️ Moderado',
            description: 'Balance entre flexibilidad y control - Recomendado para la mayoría',
            rules: {
                spam: {
                    enabled: true,
                    timeWindow: 10 * 60 * 1000,
                    escalationSteps: [
                        { threshold: 1, action: 'warn', duration: null },
                        { threshold: 3, action: 'delete', duration: null },
                        { threshold: 5, action: 'timeout', duration: 30 * 60 * 1000 },
                        { threshold: 8, action: 'kick', duration: null }
                    ],
                    resetAfter: 2 * 60 * 60 * 1000
                },
                badWords: {
                    enabled: true,
                    timeWindow: 2 * 60 * 60 * 1000,
                    escalationSteps: [
                        { threshold: 1, action: 'delete', duration: null },
                        { threshold: 2, action: 'warn', duration: null },
                        { threshold: 4, action: 'timeout', duration: 60 * 60 * 1000 },
                        { threshold: 6, action: 'kick', duration: null },
                        { threshold: 8, action: 'ban', duration: null }
                    ],
                    resetAfter: 48 * 60 * 60 * 1000
                },
                links: {
                    enabled: true,
                    timeWindow: 60 * 60 * 1000,
                    escalationSteps: [
                        { threshold: 1, action: 'delete', duration: null },
                        { threshold: 3, action: 'timeout', duration: 15 * 60 * 1000 },
                        { threshold: 5, action: 'timeout', duration: 2 * 60 * 60 * 1000 },
                        { threshold: 8, action: 'kick', duration: null }
                    ],
                    resetAfter: 24 * 60 * 60 * 1000
                }
            }
        },
        lenient: {
            name: '🤝 Tolerante',
            description: 'Tolerancia alta - Para comunidades más relajadas y amigables',
            rules: {
                spam: {
                    enabled: true,
                    timeWindow: 30 * 60 * 1000,
                    escalationSteps: [
                        { threshold: 2, action: 'warn', duration: null },
                        { threshold: 5, action: 'delete', duration: null },
                        { threshold: 8, action: 'timeout', duration: 15 * 60 * 1000 },
                        { threshold: 12, action: 'timeout', duration: 60 * 60 * 1000 },
                        { threshold: 15, action: 'kick', duration: null }
                    ],
                    resetAfter: 6 * 60 * 60 * 1000
                },
                badWords: {
                    enabled: true,
                    timeWindow: 4 * 60 * 60 * 1000,
                    escalationSteps: [
                        { threshold: 1, action: 'warn', duration: null },
                        { threshold: 3, action: 'delete', duration: null },
                        { threshold: 6, action: 'timeout', duration: 30 * 60 * 1000 },
                        { threshold: 10, action: 'kick', duration: null }
                    ],
                    resetAfter: 7 * 24 * 60 * 60 * 1000
                }
            }
        },
        gaming: {
            name: '🎮 Gaming',
            description: 'Optimizado para servidores de gaming - Tolerante con spam de juegos',
            rules: {
                spam: {
                    enabled: true,
                    timeWindow: 15 * 60 * 1000,
                    escalationSteps: [
                        { threshold: 3, action: 'warn', duration: null },
                        { threshold: 6, action: 'timeout', duration: 10 * 60 * 1000 },
                        { threshold: 10, action: 'timeout', duration: 60 * 60 * 1000 },
                        { threshold: 15, action: 'kick', duration: null }
                    ],
                    resetAfter: 4 * 60 * 60 * 1000
                },
                links: {
                    enabled: true,
                    timeWindow: 2 * 60 * 60 * 1000,
                    escalationSteps: [
                        { threshold: 2, action: 'warn', duration: null },
                        { threshold: 5, action: 'delete', duration: null },
                        { threshold: 8, action: 'timeout', duration: 30 * 60 * 1000 }
                    ],
                    resetAfter: 24 * 60 * 60 * 1000
                },
                badWords: {
                    enabled: true,
                    timeWindow: 1 * 60 * 60 * 1000,
                    escalationSteps: [
                        { threshold: 1, action: 'delete', duration: null },
                        { threshold: 3, action: 'warn', duration: null },
                        { threshold: 5, action: 'timeout', duration: 30 * 60 * 1000 },
                        { threshold: 8, action: 'kick', duration: null }
                    ],
                    resetAfter: 24 * 60 * 60 * 1000
                }
            }
        }
    };
    
    const preset = presets[presetType];
    if (!preset) {
        return interaction.reply({
            content: '❌ Preset no encontrado.',
            ephemeral: true
        });
    }
    
    // Aplicar el preset
    if (!config.ruleEscalation) {
        config.ruleEscalation = {};
    }
    
    let appliedRules = [];
    for (const [ruleName, ruleConfig] of Object.entries(preset.rules)) {
        config.ruleEscalation[ruleName] = ruleConfig;
        appliedRules.push(ruleName);
    }
    
    database.guilds.set(interaction.guild.id, config);
    
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`✅ Preset "${preset.name}" Aplicado`)
        .setDescription(preset.description)
        .addFields(
            {
                name: '📊 Reglas Configuradas',
                value: appliedRules.map(rule => `• **${rule}**`).join('\n'),
                inline: true
            },
            {
                name: '⚙️ Características del Preset',
                value: getPresetFeatures(presetType),
                inline: true
            }
        )
        .setFooter({ 
            text: 'Puedes personalizar cada regla individualmente con /escalation config' 
        })
        .setTimestamp();
    
    await interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
}

// Obtener características del preset
function getPresetFeatures(presetType) {
    const features = {
        strict: '• Sanciones inmediatas\n• Tolerancia cero para invites\n• Resets rápidos',
        moderate: '• Balance entre control y flexibilidad\n• Advertencias antes de sanciones\n• Recomendado para mayoría',
        lenient: '• Múltiples advertencias\n• Sanciones graduales\n• Ideal para comunidades amigables',
        gaming: '• Tolerante con spam de gaming\n• Enfoque en enlaces maliciosos\n• Ventanas de tiempo extendidas'
    };
    
    return features[presetType] || 'Características no disponibles';
}// Manejador del comando escalation
async function handleEscalationCommand(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
        case 'config':
            await interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
}

// Manejar interacciones de botones de escalamiento
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    if (interaction.customId.startsWith('escalation_')) {
        const [, action, ruleType] = interaction.customId.split('_');
        
        switch (action) {
            case 'toggle':
                await toggleEscalation(interaction, ruleType);
                break;
            case 'edit':
                await showEscalationEditModal(interaction, ruleType);
                break;
            case 'timing':
                await showTimingModal(interaction, ruleType);
                break;
        }
    }
});

// Alternar escalamiento
async function toggleEscalation(interaction, ruleType) {
    const config = autoMod.getGuildConfig(interaction.guild.id);
    
    if (!config.ruleEscalation) {
        config.ruleEscalation = {};
    }
    
    if (!config.ruleEscalation[ruleType]) {
        // Crear configuración por defecto
        config.ruleEscalation[ruleType] = {
            enabled: false,
            timeWindow: 60 * 60 * 1000, // 1 hora
            escalationSteps: [
                { threshold: 1, action: 'warn', duration: null },
                { threshold: 3, action: 'timeout', duration: 10 * 60 * 1000 },
                { threshold: 5, action: 'kick', duration: null }
            ],
            resetAfter: 24 * 60 * 60 * 1000 // 24 horas
        };
    }
    
    config.ruleEscalation[ruleType].enabled = !config.ruleEscalation[ruleType].enabled;
    database.guilds.set(interaction.guild.id, config);
    
    await interaction.reply({
        content: `✅ Escalamiento para **${ruleType}** ${config.ruleEscalation[ruleType].enabled ? 'activado' : 'desactivado'}.`,
        ephemeral: true
    });
}

// Modal para editar pasos de escalamiento
async function showEscalationEditModal(interaction, ruleType) {
    const config = autoMod.getGuildConfig(interaction.guild.id);
    const escalationConfig = config.ruleEscalation?.[ruleType];
    
    if (!escalationConfig) {
        return interaction.reply({
            content: '❌ No hay configuración de escalamiento para esta regla.',
            ephemeral: true
        });
    }
    
    const modal = new ModalBuilder()
        .setCustomId(`escalation_steps_${ruleType}`)
        .setTitle(`Editar Escalamiento: ${ruleType}`);
    
    // Crear campos para los primeros 5 pasos (limitación de Discord)
    const steps = escalationConfig.escalationSteps.slice(0, 5);
    
    steps.forEach((step, index) => {
        const durationMinutes = step.duration ? Math.floor(step.duration / (60 * 1000)) : 0;
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId(`step_${index}`)
                    .setLabel(`Paso ${index + 1}: ${step.threshold} infracciones`)
                    .setStyle(TextInputStyle.Short)
                    .setValue(`${step.action}${step.duration ? `:${durationMinutes}` : ''}`)
                    .setPlaceholder('Ejemplo: timeout:30 (acción:minutos)')
                    .setRequired(true)
            )
        );
    });
    
    await interaction.showModal(modal);
}

// Modal para configurar tiempos
async function showTimingModal(interaction, ruleType) {
    const config = autoMod.getGuildConfig(interaction.guild.id);
    const escalationConfig = config.ruleEscalation?.[ruleType];
    
    const modal = new ModalBuilder()
        .setCustomId(`escalation_timing_${ruleType}`)
        .setTitle(`Configurar Tiempos: ${ruleType}`)
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('timeWindow')
                    .setLabel('Ventana de Tiempo (minutos)')
                    .setStyle(TextInputStyle.Short)
                    .setValue(String(Math.floor((escalationConfig?.timeWindow || 60 * 60 * 1000) / (60 * 1000))))
                    .setPlaceholder('60 (para 1 hora)')
                    .setRequired(true)
            .addSubcommand(subcommand =>
            subcommand
                .setName('preset')
                .setDescription('Aplicar preset de escalamiento predefinido')
                .addStringOption(option =>
                    option.setName('tipo')
                        .setDescription('Tipo de preset')
                        .setRequired(true)
                        .addChoices(
                            { name: '🔒 Estricto - Tolerancia baja', value: 'strict' },
                            { name: '⚖️ Moderado - Balance', value: 'moderate' },
                            { name: '🤝 Tolerante - Comunidad relajada', value: 'lenient' },
                            { name: '🎮 Gaming - Para servidores de juegos', value: 'gaming' }
                        )
                )
        ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('resetAfter')
                    .setLabel('Reset Después de (horas)')
                    .setStyle(TextInputStyle.Short)
                    .setValue(String(Math.floor((escalationConfig?.resetAfter || 24 * 60 * 60 * 1000) / (60 * 60 * 1000))))
                    .setPlaceholder('24 (para 1 día)')
                    .setRequired(true)
            )
        );
    
    await interaction.showModal(modal);
}

// Manejar envío de modales de escalamiento
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    
    if (interaction.customId.startsWith('escalation_steps_')) {
        await handleEscalationStepsSubmit(interaction);
    } else if (interaction.customId.startsWith('escalation_timing_')) {
        await handleEscalationTimingSubmit(interaction);
    }
});

// Procesar pasos de escalamiento
async function handleEscalationStepsSubmit(interaction) {
    const ruleType = interaction.customId.replace('escalation_steps_', '');
    const config = autoMod.getGuildConfig(interaction.guild.id);
    
    const newSteps = [];
    let hasError = false;
    let errorMessage = '';
    
    // Procesar cada campo
    for (let i = 0; i < 5; i++) {
        const stepValue = interaction.fields.getTextInputValue(`step_${i}`);
        if (!stepValue.trim()) continue;
        
        try {
            const [action, durationStr] = stepValue.split(':');
            const validActions = ['warn', 'delete', 'timeout', 'kick', 'ban', 'tempban'];
            
            if (!validActions.includes(action.trim())) {
                hasError = true;
                errorMessage = `❌ Acción inválida: "${action}". Acciones válidas: ${validActions.join(', ')}`;
                break;
            }
            
            const step = {
                threshold: i + 1,
                action: action.trim(),
                duration: null
            };
            
            if (durationStr && (action === 'timeout' || action === 'tempban')) {
                const minutes = parseInt(durationStr);
                if (isNaN(minutes) || minutes <= 0) {
                    hasError = true;
                    errorMessage = `❌ Duración inválida para ${action}: "${durationStr}"`;
                    break;
                }
                step.duration = minutes * 60 * 1000;
            }
            
            newSteps.push(step);
        } catch (error) {
            hasError = true;
            errorMessage = `❌ Error procesando paso ${i + 1}: "${stepValue}"`;
            break;
        }
    }
    
    if (hasError) {
        return interaction.reply({
            content: errorMessage + '\n\n**Formato correcto:** `accion` o `accion:minutos`\n**Ejemplo:** `timeout:30`, `kick`, `ban`',
            ephemeral: true
        });
    }
    
    // Actualizar configuración
    config.ruleEscalation[ruleType].escalationSteps = newSteps;
    database.guilds.set(interaction.guild.id, config);
    
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`✅ Escalamiento Actualizado: ${ruleType}`)
        .addFields({
            name: '📊 Nuevos Pasos',
            value: newSteps.map(step => {
                const duration = step.duration ? ` (${Math.floor(step.duration / 60000)}min)` : '';
                return `**${step.threshold}** infracciones → **${step.action}**${duration}`;
            }).join('\n'),
            inline: false
        })
        .setTimestamp();
    
    await interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
}

// Procesar tiempos de escalamiento
async function handleEscalationTimingSubmit(interaction) {
    const ruleType = interaction.customId.replace('escalation_timing_', '');
    const config = autoMod.getGuildConfig(interaction.guild.id);
    
    try {
        const timeWindowMinutes = parseInt(interaction.fields.getTextInputValue('timeWindow'));
        const resetAfterHours = parseInt(interaction.fields.getTextInputValue('resetAfter'));
        
        if (isNaN(timeWindowMinutes) || timeWindowMinutes <= 0) {
            return interaction.reply({
                content: '❌ Ventana de tiempo debe ser un número positivo de minutos.',
                ephemeral: true
            });
        }
        
        if (isNaN(resetAfterHours) || resetAfterHours <= 0) {
            return interaction.reply({
                content: '❌ Tiempo de reset debe ser un número positivo de horas.',
                ephemeral: true
            });
        }
        
        config.ruleEscalation[ruleType].timeWindow = timeWindowMinutes * 60 * 1000;
        config.ruleEscalation[ruleType].resetAfter = resetAfterHours * 60 * 60 * 1000;
        database.guilds.set(interaction.guild.id, config);
        
        await interaction.reply({
            content: `✅ **Tiempos actualizados para ${ruleType}:**\n` +
                    `⏱️ **Ventana de tiempo:** ${timeWindowMinutes} minutos\n` +
                    `🔄 **Reset después de:** ${resetAfterHours} horas`,
            ephemeral: true
        });
        
    } catch (error) {
        await interaction.reply({
            content: '❌ Error procesando los valores. Asegúrate de usar números válidos.',
            ephemeral: true
        });
    }
} showEscalationConfig(interaction);
            break;
        case 'view':
            await showEscalationView(interaction);
            break;
        case 'reset':
            await resetUserInfractions(interaction);
            break;
        case 'stats':
            await showEscalationStats(interaction);
            break;
        case 'preset':
            await applyEscalationPreset(interaction);
            break;
    }
}

// Mostrar configuración de escalamiento
async function showEscalationConfig(interaction) {
    const ruleType = interaction.options.getString('regla');
    const config = autoMod.getGuildConfig(interaction.guild.id);
    const escalationConfig = config.ruleEscalation?.[ruleType] || config.ruleEscalation?.global;
    
    if (!escalationConfig) {
        return interaction.reply({
            content: '❌ No se encontró configuración de escalamiento para esta regla.',
            ephemeral: true
        });
    }
    
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`⚡ Configuración de Escalamiento: ${ruleType.toUpperCase()}`)
        .setDescription(`Estado: ${escalationConfig.enabled ? '✅ Activado' : '❌ Desactivado'}`)
        .addFields(
            {
                name: '⏱️ Ventana de Tiempo',
                value: autoMod.formatDuration(escalationConfig.timeWindow),
                inline: true
            },
            {
                name: '🔄 Reset Después de',
                value: autoMod.formatDuration(escalationConfig.resetAfter),
                inline: true
            },
            {
                name: '📊 Pasos de Escalamiento',
                value: escalationConfig.escalationSteps
                    .map(step => {
                        const durationText = step.duration ? ` (${autoMod.formatDuration(step.duration)})` : '';
                        return `**${step.threshold}** infracciones → **${step.action}**${durationText}`;
                    })
                    .join('\n'),
                inline: false
            }
        )
        .setTimestamp();
    
    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`escalation_toggle_${ruleType}`)
                .setLabel(escalationConfig.enabled ? 'Desactivar' : 'Activar')
                .setStyle(escalationConfig.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`escalation_edit_${ruleType}`)
                .setLabel('Editar Pasos')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`escalation_timing_${ruleType}`)
                .setLabel('Configurar Tiempos')
                .setStyle(ButtonStyle.Secondary)
        );
    
    await interaction.reply({
        embeds: [embed],
        components: [buttons],
        ephemeral: true
    });
}

// Ver configuración actual
async function showEscalationView(interaction) {
    const ruleType = interaction.options.getString('regla');
    const config = autoMod.getGuildConfig(interaction.guild.id);
    
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('📊 Vista General del Escalamiento')
        .setTimestamp();
    
    if (ruleType) {
        const escalationConfig = config.ruleEscalation?.[ruleType];
        if (escalationConfig) {
            embed.addFields({
                name: `⚡ ${ruleType.toUpperCase()}`,
                value: `**Estado:** ${escalationConfig.enabled ? '✅ Activado' : '❌ Desactivado'}\n` +
                       `**Ventana:** ${autoMod.formatDuration(escalationConfig.timeWindow)}\n` +
                       `**Reset:** ${autoMod.formatDuration(escalationConfig.resetAfter)}\n` +
                       `**Pasos:** ${escalationConfig.escalationSteps.length}`,
                inline: true
            });
        }
    } else {
        // Mostrar todas las reglas
        const rules = ['global', 'spam', 'badWords', 'links', 'invites'];
        for (const rule of rules) {
            const escalationConfig = config.ruleEscalation?.[rule];
            if (escalationConfig) {
                embed.addFields({
                    name: `⚡ ${rule.toUpperCase()}`,
                    value: `${escalationConfig.enabled ? '✅' : '❌'} | ${escalationConfig.escalationSteps.length} pasos`,
                    inline: true
                });
            }
        }
    }
    
    await interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
}

// Resetear infracciones de usuario
async function resetUserInfractions(interaction) {
    const user = interaction.options.getUser('usuario');
    const ruleType = interaction.options.getString('regla') || 'all';
    const guildId = interaction.guild.id;
    
    let resetCount = 0;
    
    if (ruleType === 'all') {
        // Resetear todas las infracciones del usuario
        const keysToDelete = [];
        for (const [key] of database.sanctions.entries()) {
            if (key.startsWith(`${guildId}_${user.id}_`)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => {
            resetCount += database.sanctions.get(key)?.length || 0;
            database.sanctions.delete(key);
        });
    } else {
        // Resetear infracciones de una regla específica
        const key = `${guildId}_${user.id}_${ruleType}`;
        const infractions = database.sanctions.get(key);
        if (infractions) {
            resetCount = infractions.length;
            database.sanctions.delete(key);
        }
    }
    
    // También limpiar advertencias generales si se solicita
    if (ruleType === 'all') {
        const warningKey = `${guildId}_${user.id}`;
        database.warnings.delete(warningKey);
    }
    
    await interaction.reply({
        content: `✅ **${resetCount}** infracciones reseteadas para ${user.tag} ${ruleType === 'all' ? 'en todas las reglas' : `en la regla "${ruleType}"`}.`,
        ephemeral: true
    });
    
    // Log de la acción
    const config = autoMod.getGuildConfig(interaction.guild.id);
    if (config.logChannel) {
        const channel = interaction.guild.channels.cache.get(config.logChannel);
        if (channel) {
            const logEmbed = new EmbedBuilder()
                .setColor('#00aa00')
                .setTitle('🔄 Reset de Infracciones')
                .addFields(
                    { name: '👤 Usuario', value: `${user.tag} (${user.id})`, inline: true },
                    { name: '👮 Moderador', value: `${interaction.user.tag}`, inline: true },
                    { name: '📊 Infracciones Reseteadas', value: `${resetCount}`, inline: true },
                    { name: '🎯 Regla', value: ruleType === 'all' ? 'Todas' : ruleType, inline: true }
                )
                .setTimestamp();
            
            await channel.send({ embeds: [logEmbed] });
        }
    }
}

// Mostrar estadísticas del servidor
async function showEscalationStats(interaction) {
    const guildId = interaction.guild.id;
    
    // Contar infracciones por regla
    const ruleStats = {};
    const userStats = {};
    const now = Date.now();
    
    for (const [key, infractions] of database.sanctions.entries()) {
        if (!key.startsWith(guildId)) continue;
        
        const [, userId, ruleType] = key.split('_');
        
        // Filtrar infracciones recientes (últimas 24h)
        const recentInfractions = infractions.filter(inf => 
            now - inf.timestamp < 24 * 60 * 60 * 1000
        );
        
        if (recentInfractions.length > 0) {
            ruleStats[ruleType] = (ruleStats[ruleType] || 0) + recentInfractions.length;
            userStats[userId] = (userStats[userId] || 0) + recentInfractions.length;
        }
    }
    
    const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('📊 Estadísticas de Infracciones (Últimas 24h)')
        .setTimestamp();
    
    // Top reglas violadas
    const topRules = Object.entries(ruleStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    if (topRules.length > 0) {
        embed.addFields({
            name: '🏆 Reglas Más Violadas',
            value: topRules.map(([rule, count], i) => 
                `${i + 1}. **${rule}**: ${count} infracciones`
            ).join('\n'),
            inline: true
        });
    }
    
    // Top usuarios con más infracciones
    const topUsers = Object.entries(userStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    if (topUsers.length > 0) {
        const userPromises = topUsers.map(async ([userId, count]) => {
            try {
                const user = await interaction.guild.members.fetch(userId);
                return `${user.user.tag}: ${count}`;
            } catch {
                return `Usuario desconocido: ${count}`;
            }
        });
        
        const userList = await Promise.all(userPromises);
        
        embed.addFields({
            name: '👥 Usuarios Más Activos',
            value: userList.map((userInfo, i) => `${i + 1}. ${userInfo}`).join('\n'),
            inline: true
        });
    }
    
    // Estadísticas generales
    const totalInfractions = Object.values(ruleStats).reduce((a, b) => a + b, 0);
    const uniqueUsers = Object.keys(userStats).length;
    
    embed.addFields({
        name: '📈 Resumen General',
        value: `**Total de infracciones:** ${totalInfractions}\n` +
               `**Usuarios únicos:** ${uniqueUsers}\n` +
               `**Promedio por usuario:** ${uniqueUsers > 0 ? (totalInfractions / uniqueUsers).toFixed(1) : 0}`,
        inline: false
    });
    
    if (totalInfractions === 0) {
        embed.setDescription('🎉 ¡No hay infracciones registradas en las últimas 24 horas!');
    }
    
    awaitconst { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Configuración del bot
const config = {
    token: 'TU_TOKEN_AQUI',
    clientId: 'TU_CLIENT_ID_AQUI',
    guildId: 'TU_GUILD_ID_AQUI' // Opcional para comandos globales
};

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
    new SlashCommandBuilder()
        .setName('escalation')
        .setDescription('Configurar sistema de escalamiento de sanciones')
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('Configurar escalamiento para una regla específica')
                .addStringOption(option =>
                    option.setName('regla')
                        .setDescription('Regla para configurar')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Global (todas las reglas)', value: 'global' },
                            { name: 'Anti-Spam', value: 'spam' },
                            { name: 'Palabras Prohibidas', value: 'badWords' },
                            { name: 'Anti-Enlaces', value: 'links' },
                            { name: 'Anti-Invitaciones', value: 'invites' },
                            { name: 'Anti-Mayúsculas', value: 'capsLock' },
                            { name: 'Anti-Menciones', value: 'mentions' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('Ver configuración de escalamiento actual')
                .addStringOption(option =>
                    option.setName('regla')
                        .setDescription('Regla específica a ver (opcional)')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Global', value: 'global' },
                            { name: 'Anti-Spam', value: 'spam' },
                            { name: 'Palabras Prohibidas', value: 'badWords' },
                            { name: 'Anti-Enlaces', value: 'links' },
                            { name: 'Anti-Invitaciones', value: 'invites' },
                            { name: 'Anti-Mayúsculas', value: 'capsLock' },
                            { name: 'Anti-Menciones', value: 'mentions' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Resetear infracciones de un usuario')
                .addUserOption(option =>
                    option.setName('usuario')
                        .setDescription('Usuario para resetear infracciones')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('regla')
                        .setDescription('Regla específica a resetear (opcional)')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Todas las reglas', value: 'all' },
                            { name: 'Anti-Spam', value: 'spam' },
                            { name: 'Palabras Prohibidas', value: 'badWords' },
                            { name: 'Anti-Enlaces', value: 'links' },
                            { name: 'Anti-Invitaciones', value: 'invites' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('Ver estadísticas de infracciones del servidor')
        ),

    new SlashCommandBuilder()
        .setName('immune-role')
        .setDescription('Gestionar roles inmunes a la automoderación')
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Rol para gestionar')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('accion')
                .setDescription('Agregar o quitar inmunidad')
                .setRequired(true)
                .addChoices(
                    { name: 'Agregar', value: 'add' },
                    { name: 'Quitar', value: 'remove' }
                )
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

    // Método auxiliar para obtener dominio de una URL
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return null;
        }
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

    // Verificar escalamiento por advertencias
    async checkWarningEscalation(member) {
        const config = this.getGuildConfig(member.guild.id);
        const key = `${member.guild.id}_${member.id}`;
        const warnings = database.warnings.get(key) || [];
        
        const warningCount = warnings.length;
        const escalation = config.escalationRules[warningCount];
        
        if (escalation && escalation !== 'warn') {
            await this.executeEscalation(member, escalation, warningCount);
        }
    }

    // Ejecutar escalamiento
    async executeEscalation(member, action, warningCount) {
        try {
            switch (action) {
                case 'timeout':
                    await member.timeout(30 * 60 * 1000, `Escalamiento automático: ${warningCount} advertencias`);
                    break;
                case 'kick':
                    await member.kick(`Escalamiento automático: ${warningCount} advertencias`);
                    break;
                case 'ban':
                    await member.ban({ reason: `Escalamiento automático: ${warningCount} advertencias` });
                    break;
            }

            await this.logAction(member.guild, member, 'escalamiento', action, `${warningCount} advertencias`);
        } catch (error) {
            console.error('Error en escalamiento:', error);
        }
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
                .setName('exception')
                .setDescription('Gestionar excepciones de reglas')
                .addUserOption(option =>
                    option.setName('usuario')
                        .setDescription('Usuario para la excepción')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('regla')
                        .setDescription('Regla para la excepción')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Spam', value: 'spam' },
                            { name: 'Mayúsculas', value: 'capsLock' },
                            { name: 'Palabras prohibidas', value: 'badWords' },
                            { name: 'Enlaces', value: 'links' },
                            { name: 'Menciones', value: 'mentions' },
                            { name: 'Invitaciones', value: 'invites' }
                        )
                )
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Canal específico (opcional)')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName('accion')
                        .setDescription('Agregar o quitar excepción')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Agregar', value: 'add' },
                            { name: 'Quitar', value: 'remove' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('warnings')
                .setDescription('Ver advertencias de un usuario')
                .addUserOption(option =>
                    option.setName('usuario')
                        .setDescription('Usuario para ver advertencias')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear-warnings')
                .setDescription('Limpiar advertencias de un usuario')
                .addUserOption(option =>
                    option.setName('usuario')
                        .setDescription('Usuario para limpiar advertencias')
                        .setRequired(true)
                )
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
        ),

    new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Gestionar lista blanca de enlaces permitidos')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Agregar dominio a la lista blanca')
                .addStringOption(option =>
                    option.setName('dominio')
                        .setDescription('Dominio a agregar (ej: giphy.com)')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remover dominio de la lista blanca')
                .addStringOption(option =>
                    option.setName('dominio')
                        .setDescription('Dominio a remover')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Ver todos los dominios en la lista blanca')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('preset')
                .setDescription('Aplicar preset de dominios comunes')
                .addStringOption(option =>
                    option.setName('tipo')
                        .setDescription('Tipo de preset')
                        .setRequired(true)
                        .addChoices(
                            { name: '🎭 Medios (GIFs, imágenes)', value: 'media' },
                            { name: '🎮 Gaming', value: 'gaming' },
                            { name: '💻 Desarrollo', value: 'dev' },
                            { name: '📚 Educativo', value: 'edu' },
                            { name: '🌐 Social Media', value: 'social' }
                        )
                )
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
            case 'escalation':
                await handleEscalationCommand(interaction);
                break;
            case 'immune-role':
                await handleImmuneRoleCommand(interaction);
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
        case 'exception':
            await handleException(interaction);
            break;
        case 'warnings':
            await showWarnings(interaction);
            break;
        case 'clear-warnings':
            await clearWarnings(interaction);
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
                label: 'Anti-Menciones Masivas',
                description: `Estado: ${config.mentions?.enabled ? '✅ Activado' : '❌ Desactivado'}`,
                value: 'mentions'
            }
        ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
    });
}

// Manejar excepciones
async function handleException(interaction) {
    const user = interaction.options.getUser('usuario');
    const rule = interaction.options.getString('regla');
    const channel = interaction.options.getChannel('canal');
    const action = interaction.options.getString('accion');
    
    const guildId = interaction.guild.id;
    const exceptions = database.exceptions.get(guildId) || [];
    
    const exceptionData = {
        userId: user.id,
        ruleType: rule,
        channelId: channel ? channel.id : 'all',
        addedBy: interaction.user.id,
        addedAt: new Date()
    };
    
    if (action === 'add') {
        // Verificar si ya existe
        const exists = exceptions.some(ex => 
            ex.userId === exceptionData.userId && 
            ex.ruleType === exceptionData.ruleType && 
            ex.channelId === exceptionData.channelId
        );
        
        if (exists) {
            return interaction.reply({
                content: '❌ Esta excepción ya existe.',
                ephemeral: true
            });
        }
        
        exceptions.push(exceptionData);
        database.exceptions.set(guildId, exceptions);
        
        await interaction.reply({
            content: `✅ Excepción agregada para ${user.tag} en la regla "${rule}"${channel ? ` en el canal ${channel}` : ' en todos los canales'}.`,
            ephemeral: true
        });
    } else {
        // Remover excepción
        const index = exceptions.findIndex(ex => 
            ex.userId === exceptionData.userId && 
            ex.ruleType === exceptionData.ruleType && 
            ex.channelId === exceptionData.channelId
        );
        
        if (index === -1) {
            return interaction.reply({
                content: '❌ Esta excepción no existe.',
                ephemeral: true
            });
        }
        
        exceptions.splice(index, 1);
        database.exceptions.set(guildId, exceptions);
        
        await interaction.reply({
            content: `✅ Excepción removida para ${user.tag} en la regla "${rule}".`,
            ephemeral: true
        });
    }
}

// Mostrar advertencias
async function showWarnings(interaction) {
    const user = interaction.options.getUser('usuario');
    const key = `${interaction.guild.id}_${user.id}`;
    const warnings = database.warnings.get(key) || [];
    
    if (warnings.length === 0) {
        return interaction.reply({
            content: `📋 ${user.tag} no tiene advertencias.`,
            ephemeral: true
        });
    }
    
    const embed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle(`📋 Advertencias de ${user.tag}`)
        .setDescription(`Total: ${warnings.length} advertencias`);
    
    const recentWarnings = warnings.slice(-5); // Últimas 5 advertencias
    
    recentWarnings.forEach((warning, index) => {
        embed.addFields({
            name: `⚠️ Advertencia ${warnings.length - recentWarnings.length + index + 1}`,
            value: `**Razón:** ${warning.reason}\n**Fecha:** ${warning.timestamp.toLocaleDateString()}\n**Moderador:** ${warning.moderator}`,
            inline: false
        });
    });
    
    if (warnings.length > 5) {
        embed.setFooter({ text: `Mostrando las últimas 5 de ${warnings.length} advertencias` });
    }
    
    await interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
}

// Limpiar advertencias
async function clearWarnings(interaction) {
    const user = interaction.options.getUser('usuario');
    const key = `${interaction.guild.id}_${user.id}`;
    
    database.warnings.delete(key);
    
    await interaction.reply({
        content: `✅ Se han limpiado todas las advertencias de ${user.tag}.`,
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

// Manejador del comando whitelist
async function handleWhitelistCommand(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const config = autoMod.getGuildConfig(interaction.guild.id);
    
    // Inicializar links si no existe
    if (!config.links) {
        config.links = { enabled: false, whitelist: [], punishment: 'warn' };
    }
    
    switch (subcommand) {
        case 'add':
            const domainToAdd = interaction.options.getString('dominio').toLowerCase().replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
            
            if (config.links.whitelist.includes(domainToAdd)) {
                return interaction.reply({
                    content: `❌ El dominio **${domainToAdd}** ya está en la lista blanca.`,
                    ephemeral: true
                });
            }
            
            config.links.whitelist.push(domainToAdd);
            database.guilds.set(interaction.guild.id, config);
            
            await interaction.reply({
                content: `✅ Dominio **${domainToAdd}** agregado a la lista blanca.\n🔗 Enlaces de este dominio ahora están permitidos.`,
                ephemeral: true
            });
            break;
            
        case 'remove':
            const domainToRemove = interaction.options.getString('dominio').toLowerCase();
            const index = config.links.whitelist.indexOf(domainToRemove);
            
            if (index === -1) {
                return interaction.reply({
                    content: `❌ El dominio **${domainToRemove}** no está en la lista blanca.`,
                    ephemeral: true
                });
            }
            
            config.links.whitelist.splice(index, 1);
            database.guilds.set(interaction.guild.id, config);
            
            await interaction.reply({
                content: `✅ Dominio **${domainToRemove}** removido de la lista blanca.\n🚫 Enlaces de este dominio ahora serán bloqueados.`,
                ephemeral: true
            });
            break;
            
        case 'list':
            if (config.links.whitelist.length === 0) {
                return interaction.reply({
                    content: '📋 La lista blanca está vacía. Todos los enlaces serán bloqueados si la regla anti-enlaces está activada.',
                    ephemeral: true
                });
            }
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('📋 Lista Blanca de Enlaces')
                .setDescription('Dominios permitidos en este servidor:')
                .addFields({
                    name: '🔗 Dominios Permitidos',
                    value: config.links.whitelist.map((domain, i) => `${i + 1}. **${domain}**`).join('\n'),
                    inline: false
                })
                .setFooter({ 
                    text: `Total: ${config.links.whitelist.length} dominios | Estado: ${config.links.enabled ? '✅ Activado' : '❌ Desactivado'}` 
                })
                .setTimestamp();
            
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
            break;
            
        case 'preset':
            const presetType = interaction.options.getString('tipo');
            const presets = getWhitelistPresets();
            const selectedPreset = presets[presetType];
            
            if (!selectedPreset) {
                return interaction.reply({
                    content: '❌ Preset no encontrado.',
                    ephemeral: true
                });
            }
            
            // Agregar dominios del preset que no estén ya en la lista
            const newDomains = selectedPreset.domains.filter(domain => !config.links.whitelist.includes(domain));
            config.links.whitelist.push(...newDomains);
            database.guilds.set(interaction.guild.id, config);
            
            const presetEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`✅ Preset "${selectedPreset.name}" aplicado`)
                .setDescription(selectedPreset.description)
                .addFields({
                    name: '🆕 Dominios agregados',
                    value: newDomains.length > 0 ? newDomains.map(d => `• **${d}**`).join('\n') : 'Ninguno (ya estaban en la lista)',
                    inline: false
                })
                .setFooter({ text: `Total en lista blanca: ${config.links.whitelist.length} dominios` })
                .setTimestamp();
            
            await interaction.reply({
                embeds: [presetEmbed],
                ephemeral: true
            });
            break;
    }
}

// Función para obtener presets de whitelist
function getWhitelistPresets() {
    return {
        media: {
            name: '🎭 Medios (GIFs e Imágenes)',
            description: 'Dominios populares para GIFs, imágenes y medios visuales',
            domains: [
                'giphy.com',
                'tenor.com',
                'imgur.com',
                'media.discordapp.net',
                'cdn.discordapp.com',
                'i.imgur.com',
                'gfycat.com',
                'redgifs.com',
                'streamable.com',
                'gyazo.com',
                'prnt.sc',
                'i.redd.it',
                'preview.redd.it'
            ]
        },
        gaming: {
            name: '🎮 Gaming',
            description: 'Plataformas y sitios relacionados con gaming',
            domains: [
                'steam.com',
                'steamcommunity.com',
                'twitch.tv',
                'youtube.com',
                'youtu.be',
                'discord.gg',
                'github.com',
                'reddit.com',
                'twitter.com'
            ]
        },
        dev: {
            name: '💻 Desarrollo',
            description: 'Herramientas y sitios para desarrolladores',
            domains: [
                'github.com',
                'stackoverflow.com',
                'docs.microsoft.com',
                'developer.mozilla.org',
                'npmjs.com',
                'nodejs.org',
                'reactjs.org',
                'discord.js.org',
                'codepen.io',
                'jsfiddle.net'
            ]
        },
        edu: {
            name: '📚 Educativo',
            description: 'Sitios educativos y de aprendizaje',
            domains: [
                'youtube.com',
                'youtu.be',
                'wikipedia.org',
                'github.com',
                'stackoverflow.com',
                'w3schools.com',
                'freecodecamp.org',
                'codecademy.com',
                'khanacademy.org',
                'coursera.org'
            ]
        },
        social: {
            name: '🌐 Social Media',
            description: 'Principales redes sociales y plataformas',
            domains: [
                'twitter.com',
                'instagram.com',
                'facebook.com',
                'youtube.com',
                'youtu.be',
                'tiktok.com',
                'reddit.com',
                'discord.gg',
                'twitch.tv',
                'linkedin.com'
            ]
        }
    };
}

// Manejador del comando immune-role (reubicado)
async function handleImmuneRoleCommand(interaction) {
    const role = interaction.options.getRole('rol');
    const action = interaction.options.getString('accion');
    
    const config = autoMod.getGuildConfig(interaction.guild.id);
    
    if (action === 'add') {
        if (config.immuneRoles.includes(role.id)) {
            return interaction.reply({
                content: `❌ El rol ${role} ya es inmune a la automoderación.`,
                ephemeral: true
            });
        }
        
        config.immuneRoles.push(role.id);
        database.guilds.set(interaction.guild.id, config);
        
        await interaction.reply({
            content: `✅ El rol ${role} ahora es inmune a la automoderación.`,
            ephemeral: true
        });
    } else {
        const index = config.immuneRoles.indexOf(role.id);
        if (index === -1) {
            return interaction.reply({
                content: `❌ El rol ${role} no es inmune a la automoderación.`,
                ephemeral: true
            });
        }
        
        config.immuneRoles.splice(index, 1);
        database.guilds.set(interaction.guild.id, config);
        
        await interaction.reply({
            content: `✅ El rol ${role} ya no es inmune a la automoderación.`,
            ephemeral: true
        });
    }
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
        invites: 'Anti-Invitaciones',
        duplicateText: 'Anti-Texto Duplicado',
        zalgo: 'Anti-Zalgo',
        longMessages: 'Anti-Mensajes Largos',
        emojispam: 'Anti-Spam de Emojis'
    };
    
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`⚙️ Configuración: ${ruleNames[ruleType]}`)
        .setDescription(`Estado actual: ${ruleConfig.enabled ? '✅ Activado' : '❌ Desactivado'}`)
        .addFields(
            { name: '🔨 Castigo', value: ruleConfig.punishment || 'warn', inline: true }
        );
    
    // Añadir campos específicos según el tipo de regla
    switch (ruleType) {
        case 'spam':
            embed.addFields(
                { name: '📊 Límite', value: `${ruleConfig.limit || 5} mensajes`, inline: true },
                { name: '⏱️ Ventana de tiempo', value: `${(ruleConfig.timeWindow || 5000)/1000} segundos`, inline: true }
            );
            break;
        case 'capsLock':
            embed.addFields(
                { name: '📈 Porcentaje', value: `${ruleConfig.percentage || 70}%`, inline: true }
            );
            break;
        case 'badWords':
            embed.addFields(
                { name: '📝 Palabras', value: `${ruleConfig.words?.length || 0} configuradas`, inline: true }
            );
            break;
        case 'mentions':
            embed.addFields(
                { name: '👥 Límite', value: `${ruleConfig.limit || 5} menciones`, inline: true }
            );
            break;
        case 'longMessages':
            embed.addFields(
                { name: '📏 Longitud máxima', value: `${ruleConfig.maxLength || 2000} caracteres`, inline: true }
            );
            break;
        case 'emojispam':
            embed.addFields(
                { name: '😀 Límite', value: `${ruleConfig.limit || 10} emojis`, inline: true }
            );
            break;
    }
    
    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`toggle_${ruleType}`)
                .setLabel(ruleConfig.enabled ? 'Desactivar' : 'Activar')
                .setStyle(ruleConfig.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`configure_${ruleType}`)
                .setLabel('Configurar')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`punishment_${ruleType}`)
                .setLabel('Cambiar Castigo')
                .setStyle(ButtonStyle.Secondary)
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
        case 'punishment':
            await showPunishmentSelect(interaction, ruleType);
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
    
    // Actualizar el panel
    await showRuleConfiguration(interaction, ruleType);
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
            
        case 'mentions':
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('limit')
                        .setLabel('Límite de menciones')
                        .setStyle(TextInputStyle.Short)
                        .setValue(String(ruleConfig.limit || 5))
                        .setRequired(true)
                )
            );
            break;
            
        case 'longMessages':
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('maxLength')
                        .setLabel('Longitud máxima del mensaje')
                        .setStyle(TextInputStyle.Short)
                        .setValue(String(ruleConfig.maxLength || 2000))
                        .setRequired(true)
                )
            );
            break;
            
        case 'emojispam':
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('limit')
                        .setLabel('Límite de emojis')
                        .setStyle(TextInputStyle.Short)
                        .setValue(String(ruleConfig.limit || 10))
                        .setRequired(true)
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

// Mostrar selector de castigo
async function showPunishmentSelect(interaction, ruleType) {
    const config = autoMod.getGuildConfig(interaction.guild.id);
    const currentPunishment = config[ruleType]?.punishment || 'warn';
    
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`punishment_select_${ruleType}`)
        .setPlaceholder('Selecciona un castigo')
        .addOptions([
            {
                label: 'Advertencia',
                description: 'Solo registra una advertencia',
                value: 'warn',
                default: currentPunishment === 'warn'
            },
            {
                label: 'Eliminar mensaje',
                description: 'Elimina el mensaje infractor',
                value: 'delete',
                default: currentPunishment === 'delete'
            },
            {
                label: 'Timeout',
                description: 'Silencia al usuario temporalmente',
                value: 'timeout',
                default: currentPunishment === 'timeout'
            },
            {
                label: 'Expulsar',
                description: 'Expulsa al usuario del servidor',
                value: 'kick',
                default: currentPunishment === 'kick'
            },
            {
                label: 'Banear',
                description: 'Banea permanentemente al usuario',
                value: 'ban',
                default: currentPunishment === 'ban'
            }
        ]);
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    await interaction.reply({
        content: '🔨 Selecciona el castigo para esta regla:',
        components: [row],
        ephemeral: true
    });
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
            
        case 'mentions':
            const mentionLimit = parseInt(interaction.fields.getTextInputValue('limit'));
            if (mentionLimit > 0) {
                config[ruleType].limit = mentionLimit;
            }
            break;
            
        case 'longMessages':
            const maxLength = parseInt(interaction.fields.getTextInputValue('maxLength'));
            if (maxLength > 0) {
                config[ruleType].maxLength = maxLength;
            }
            break;
            
        case 'emojispam':
            const emojiLimit = parseInt(interaction.fields.getTextInputValue('limit'));
            if (emojiLimit > 0) {
                config[ruleType].limit = emojiLimit;
            }
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

// Manejar selección de castigo
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    
    if (interaction.customId.startsWith('punishment_select_')) {
        const ruleType = interaction.customId.replace('punishment_select_', '');
        const punishment = interaction.values[0];
        
        const config = autoMod.getGuildConfig(interaction.guild.id);
        if (!config[ruleType]) {
            config[ruleType] = { enabled: false };
        }
        
        config[ruleType].punishment = punishment;
        database.guilds.set(interaction.guild.id, config);
        
        await interaction.update({
            content: `✅ Castigo cambiado a "${punishment}" para la regla "${ruleType}".`,
            components: []
        });
    }
});

// Registro de comandos slash
async function deployCommands() {
    const rest = new REST({ version: '10' }).setToken(config.token);
    
    try {
        console.log('🔄 Registrando comandos slash...');
        
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
    
    fs.writeFileSync('database.json', JSON.stringify(data, null, 2));
}

function loadDatabase() {
    try {
        if (fs.existsSync('database.json')) {
            const data = JSON.parse(fs.readFileSync('database.json', 'utf8'));
            
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
    console.log('🔄 Guardando base de datos...');
    saveDatabase();
    console.log('✅ Base de datos guardada. Cerrando bot...');
    process.exit(0);
});

// Inicializar el bot
async function startBot() {
    // Cargar base de datos
    loadDatabase();
    
    // Registrar comandos
    await deployCommands();
    
    // Conectar bot
    await client.login(config.token);
}

// Iniciar el bot
startBot().catch(console.error);

// Exportar para uso modular
module.exports = { client, autoMod, database };