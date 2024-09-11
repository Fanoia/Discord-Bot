const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const Sequelize = require('sequelize');
const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const fanoiadb = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'fanoia.sqlite',
});
const DBEdit = fanoiadb.define('collabs', {

	makerUserID: Sequelize.STRING,
    makerName: Sequelize.STRING,
    platform: Sequelize.STRING,
    game: Sequelize.STRING,
    time: Sequelize.STRING,
    attendies: Sequelize.STRING,
    streaming: Sequelize.BOOLEAN,
    messageID: Sequelize.STRING,
    nsfw: Sequelize.BOOLEAN,
    hasAlerted: Sequelize.BOOLEAN

});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('collab')
		.setDescription("Allows Fanoia Talent to request a collab with others!")
        .addStringOption(option => option.setName('platform').setDescription('Platform that the game is on!').setRequired(true).setAutocomplete(true))
        .addStringOption(option => option.setName('game').setDescription('The Game you will play').setRequired(true))
        .addStringOption(option => option.setName('date').setDescription('Please insert a timestamp generated from https://unixtimestamp.com').setRequired(true))
        .addBooleanOption(option => option.setName('streaming').setDescription('Is the game being streamed?').setRequired(true))
        .addBooleanOption(option => option.setName('nsfw').setDescription('Is NSFW Language allowed?').setRequired(true)),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name === 'platform') {
            const platforms = [ 'Xbox', 'PlayStation', 'Nintendo Switch', 'PC', 'Mobile'];
            const filtered = platforms.filter((platform) => platform.startsWith(focusedOption.value));
            await interaction.respond(filtered.map((platform) => ({ name: platform, value: platform })));
        }
        
    },
    async execute(interaction, client) {
        DBEdit.sync();
        const platform = interaction.options.getString('platform');
        const game = interaction.options.getString('game');
        const date = interaction.options.getString('date');
        const streaming = interaction.options.getBoolean('streaming');
        const nsfw = interaction.options.getBoolean('nsfw');
        
        const embed = new EmbedBuilder()
            .setColor(0xCD3280)
            .setTitle('**Collab Request**')
            .addFields(
                { name: 'Platform', value: `${platform}`, inline: true},
                { name: 'Game', value: `${game}`, inline: true},
                { name: 'Date', value: `<t:${date}:F>`},
                { name: 'Is it being Streamed?', value: `${streaming}`, inline: true},
                { name: 'Collab Host/Requester', value: '<@' + interaction.user.id + '>'},
                { name: 'Collab Attendees', value: '<@' + interaction.user.id + '>'},
                { name: 'Is NSFW Language allowed?' , value: `${nsfw}`},
            )
            .setThumbnail('https://cdn.highrepublic.live/fanoia/SiteLogoNoText.png')
            .setTimestamp(new Date(date * 1000))
            .setFooter({ text: 'Fanoia', iconURL: 'https://cdn.discordapp.com/avatars/1235719525559963678/2c3a08a00b6d2f76c3e0210481058b23.png?size=1024' });

            const interested = new ButtonBuilder()
                .setCustomId('interested')
                .setLabel('Interested')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success);
            const notinrested = new ButtonBuilder()
                .setCustomId('notinterested')
                .setLabel('Not Interested')
                .setEmoji('🔕')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(interested, notinrested);

        const embededCollabMessage = await client.channels.cache.get(config.channel_ids.COLLAB_CHANNEL_ID).send({embeds: [embed], components: [row]});


        DBEdit.create({
            makerUserID: interaction.user.id,
            makerName: interaction.user.username,
            platform: platform,
            game: game,
            time: date,
            attendies: '["'+ interaction.user.id +'"]',
            streaming: streaming,
            messageID: embededCollabMessage.id,
            nsfw: nsfw
        })

        
        await interaction.deferReply({ephemeral: true});
        await interaction.editReply({content: 'Check <#' + config.channel_ids.COLLAB_CHANNEL_ID + '> for your request!'});
        
    },
};