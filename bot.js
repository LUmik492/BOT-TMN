const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitFieldconst, MessageActionRow, MessageButton, PermissionFlagsBits } = require('discord.js');


// Załaduj konfigurację z pliku config.json
const config = require('./config.json');  // Ścieżka do pliku config.json
const { ADMIN_ROLE_ID } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.once('ready', () => {
    console.log(`Zalogowano jako ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!verify') {
        const channelId = '1355484380608593984';  // Zmień 'YOUR_CHANNEL_ID' na ID kanału
        const channel = await client.channels.fetch(channelId);

        if (channel) {
            console.log('Kanał znaleziony:', channel.name);  // Wyświetli nazwę kanału w konsoli
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_button')
                    .setLabel('Kliknij, aby się zweryfikować')
                    .setStyle(ButtonStyle.Primary)
            );

            try {
                await channel.send({
                    content: 'Kliknij przycisk, aby przejść weryfikację:',
                    components: [row],
                });
            } catch (error) {
                console.error('Błąd wysyłania wiadomości na kanał:', error);
            }
        } else {
            console.log('Kanał o podanym ID nie został znaleziony.');
        }
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'verify_button') {
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (member) {
            const role = interaction.guild.roles.cache.get('1355484380281438292');  // Zmień ID_ROLI na odpowiednie

            if (role) {
                await member.roles.add(role);
                await interaction.reply({
                    content: 'Zostałeś pomyślnie zweryfikowany!',
                    ephemeral: true,
                });
            } else {
                console.log('Rola o podanym ID nie została znaleziona!');
            }
        }
    }
});

// ID roli, która ma uprawnienia do komend administracyjnych

client.on('messageCreate', async (message) => {
    // Ignorowanie wiadomości od bota
    if (message.author.bot) return;

    // Komenda !clear
    if (message.content.startsWith('!clear')) {
        // Sprawdzenie, czy użytkownik ma rolę "Administrator"
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('Nie masz uprawnień do używania tej komendy!');
        }

        // Usuwanie wiadomości
        const args = message.content.split(' ').slice(1);  // Pobieranie argumentów z komendy
        const amount = parseInt(args[0]);

        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('Podaj liczbę wiadomości do usunięcia (od 1 do 100).');
        }

        try {
            // Usuwanie wiadomości
            await message.channel.bulkDelete(amount);
            message.reply(`Pomyślnie usunięto ${amount} wiadomości.`);
        } catch (error) {
            console.error('Błąd przy usuwaniu wiadomości:', error);
            message.reply('Wystąpił błąd przy usuwaniu wiadomości.');
        }
    }

    // Komenda !kick
    if (message.content.startsWith('!kick')) {
        // Sprawdzenie, czy użytkownik ma rolę "Administrator"
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('Nie masz uprawnień do używania tej komendy!');
        }

        // Kicking użytkownika z serwera
        const member = message.mentions.members.first();
        if (!member) return message.reply('Musisz oznaczyć użytkownika, którego chcesz wyrzucić.');

        try {
            await member.kick('Wyrzucony przez bota');
            message.reply(`${member.user.tag} został wyrzucony z serwera.`);
        } catch (error) {
            console.error('Błąd przy wyrzucaniu użytkownika:', error);
            message.reply('Wystąpił błąd przy wyrzucaniu użytkownika.');
        }
    }

    // Komenda !ban
    if (message.content.startsWith('!ban')) {
        // Sprawdzenie, czy użytkownik ma rolę "Administrator"
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('Nie masz uprawnień do używania tej komendy!');
        }

        // Banowanie użytkownika
        const member = message.mentions.members.first();
        if (!member) return message.reply('Musisz oznaczyć użytkownika, którego chcesz zbanować.');

        try {
            await member.ban({ reason: 'Zbanowany przez bota' });
            message.reply(`${member.user.tag} został zbanowany.`);
        } catch (error) {
            console.error('Błąd przy banowaniu użytkownika:', error);
            message.reply('Wystąpił błąd przy banowaniu użytkownika.');
        }
    }

    // Komenda !mute
    if (message.content.startsWith('!mute')) {
        // Sprawdzenie, czy użytkownik ma rolę "Administrator"
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('Nie masz uprawnień do używania tej komendy!');
        }

        // Mute użytkownika na całym serwerze
        const member = message.mentions.members.first();
        if (!member) return message.reply('Musisz oznaczyć użytkownika, którego chcesz wyciszyć.');

        try {
            // Nadanie uprawnień do wyciszenia na całym serwerze
            await member.timeout(60 * 60 * 1000);  // Wyciszenie na 1 godzinę (w milisekundach)
            message.reply(`${member.user.tag} został wyciszony na 1 godzinę.`);
        } catch (error) {
            console.error('Błąd przy wyciszaniu użytkownika:', error);
            message.reply('Wystąpił błąd przy wyciszaniu użytkownika.');
        }
    }

    // Komenda !unmute
    if (message.content.startsWith('!unmute')) {
        // Sprawdzenie, czy użytkownik ma rolę "Administrator"
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('Nie masz uprawnień do używania tej komendy!');
        }

        // Unmute użytkownika
        const member = message.mentions.members.first();
        if (!member) return message.reply('Musisz oznaczyć użytkownika, którego chcesz odciszyć.');

        try {
            // Usunięcie timeoutu (odciszenie)
            await member.timeout(null);  // Usuwamy wyciszenie
            message.reply(`${member.user.tag} został odciszony.`);
        } catch (error) {
            console.error('Błąd przy odciszaniu użytkownika:', error);
            message.reply('Wystąpił błąd przy odciszaniu użytkownika.');
        }
    }
});
// KONFIGURACJA – Podmień ID kategorii i ról!
const CATEGORY_ID = "1357225632026595388"; // ID kategorii dla ticketów
const REKRUTACJA_ROLE_ID = "1355484380294025267"; // ID roli do rekrutacji
const ZARZAD_ROLE_ID = "1355484380294025267"; // ID roli zarządu
const HELP_ROLE_ID = "1355484380281438297"; // ID roli do pomocy ogólnej

// Obiekt przechowujący otwarte tickety (użytkownik -> ID kanału)
const openTickets = new Map();

client.on('ready', () => {
    console.log(`✅ Bot ${client.user.tag} jest online!`);
});

// Obsługa komendy do wysłania panelu ticketów
client.on('messageCreate', async (message) => {
    if (message.content === '!setup-tickets' && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_rekrutacja')
                .setLabel('📝 Rekrutacja')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('ticket_pomoc')
                .setLabel('❓ Pomoc Ogólna')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('ticket_zarzad')
                .setLabel('🏛 Sprawa do Zarządu')
                .setStyle(ButtonStyle.Danger)
        );

        await message.channel.send({
            content: '🎫 **System Ticketów** 🎫\nKliknij przycisk poniżej, aby utworzyć ticket!',
            components: [row]
        });
    }
});

// Obsługa przycisków tworzących ticket
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const { customId, guild, user } = interaction;

    // Sprawdzenie, czy użytkownik ma już otwarty ticket
    if (openTickets.has(user.id)) {
        return interaction.reply({
            content: '❌ Masz już otwarty ticket!',
            ephemeral: true
        });
    }

    // Określenie nazwy kanału i przypisanie odpowiednich ról
    let ticketName, allowedRole;
    if (customId === 'ticket_rekrutacja') {
        ticketName = `ticket-rekrutacja-${user.username}`;
        allowedRole = REKRUTACJA_ROLE_ID;
    } else if (customId === 'ticket_pomoc') {
        ticketName = `ticket-pomoc-${user.username}`;
        allowedRole = HELP_ROLE_ID;
    } else if (customId === 'ticket_zarzad') {
        ticketName = `ticket-zarzad-${user.username}`;
        allowedRole = ZARZAD_ROLE_ID;
    } else {
        return;
    }

    // Tworzenie kanału ticketowego
    const ticketChannel = await guild.channels.create({
        name: ticketName,
        type: ChannelType.GuildText,
        parent: CATEGORY_ID,
        permissionOverwrites: [
            {
                id: guild.id, // Wszyscy - brak dostępu
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: user.id, // Twórca ticketu - pełny dostęp
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            },
            {
                id: allowedRole, // Odpowiednia rola - dostęp
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            },
            {
                id: ADMIN_ROLE_ID, // Administratorzy - pełny dostęp
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            }
        ]
    });

    // Dodanie ticketu do listy otwartych ticketów
    openTickets.set(user.id, ticketChannel.id);

    // Przycisk do zamknięcia ticketu
    const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('❌ Zamknij Ticket')
            .setStyle(ButtonStyle.Danger)
    );

    // Wysyłanie wiadomości w ticketowym kanale
    await ticketChannel.send({
        content: `🎟 **Ticket dla ${user.username}**\nWitaj! Opisz swój problem, a odpowiednia osoba wkrótce się tobą zajmie.\n\n🔒 Kliknij przycisk poniżej, aby zamknąć ticket.`,
        components: [closeButton]
    });

    await interaction.reply({
        content: `✅ Ticket został utworzony: ${ticketChannel}`,
        ephemeral: true
    });
});

// Obsługa zamykania ticketu
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    const { customId, channel, user } = interaction;

    if (customId === 'close_ticket') {
        // Sprawdzenie, czy użytkownik to twórca ticketu lub admin
        if (!openTickets.has(user.id) && !interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return interaction.reply({ content: '❌ Nie możesz zamknąć tego ticketu!', ephemeral: true });
        }

        await interaction.reply({
            content: '🛑 Ticket zostanie zamknięty za 5 sekund...',
            ephemeral: true
        });

        setTimeout(async () => {
            await channel.delete();
            openTickets.delete(user.id);
        }, 5000);
    }
});
// Logowanie bota za pomocą tokenu z config.json
client.login(config.TOKEN).catch(console.error);
