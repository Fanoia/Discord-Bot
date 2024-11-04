const { ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const log = require('../../logger.js');
const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const { Sequelize } = require('sequelize');
const fanoiadb = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'fanoia.sqlite',
});
const DBEdit6 = fanoiadb.define('tickets', {

	ticketID: Sequelize.INTEGER,
	channelID: Sequelize.STRING,
	participants: Sequelize.STRING,
    type: Sequelize.STRING,
	claimedBy: Sequelize.STRING,

});
DBEdit6.sync()

module.exports = {
    name: "ticketCat",
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        var data = await DBEdit6.findAll();
        let numberOfTickets = null;
        if (!data) {
            numberOfTickets = 0
        } else {
            numberOfTickets = data.length
        }

        var numberOfTickets2 = -1 + numberOfTickets + 1;





        const channelID = await client.guilds.cache.get(config.information.GUILD_ID).channels.create({
            name: `ticket-${numberOfTickets2}`,
            type: ChannelType.GuildText,
            parent: config.channel_ids.TICKET_CATEGORY_ID,
            permissionOverwrites: [
                {
                    id: interaction.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.UseExternalEmojis]
                },
                {
                    id: config.role_ids.FANOIA_STAFF_ROLE_ID,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.UseExternalEmojis]
                },
                {
                    id: "1219680789701202000",
                    deny: [PermissionsBitField.Flags.ViewChannel]
                }
            ]
        })
        let type;
        if (interaction.values[0] == "general") {
            type = "General"
        } else if (interaction.values[0] == "anonymous") {
            type = "Anonymous"
        } else if (interaction.values[0] == "test") {
            type = "Test"
        }
        await channelID.send({ content: `<@${interaction.user.id}>` });
        const embed = new EmbedBuilder()
            .setColor(0x32CD32)
            .setTitle(`${type} Ticket`)
            .setDescription(`${interaction.user.toString()}, Please wait for a staff member to respond!`)

        const claimButton = new ButtonBuilder()
            .setCustomId('ticketclaim')
            .setLabel('Claim')
            .setStyle(ButtonStyle.Success)

        const closeButton = new ButtonBuilder()
            .setCustomId('ticketclose')
            .setLabel('Close')
            .setStyle(ButtonStyle.Danger)

        const row = new ActionRowBuilder()
            .addComponents(claimButton, closeButton)
        await channelID.send({ embeds: [embed], components: [row] });
        await DBEdit6.create({ ticketID: numberOfTickets2, channelID: channelID.id, participants: interaction.user.id, type: interaction.values[0] });
        await interaction.editReply(`Your ${interaction.values[0]} ticket has been created! ${channelID.toString()}`);


    }
}