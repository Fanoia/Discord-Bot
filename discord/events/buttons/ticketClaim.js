const { ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const log = require('../../logger.js');
const fs = require('node:fs');
const wait = require('node:timers/promises').setTimeout;
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
    name: 'ticketclaim',
    async ButtonHandle(interaction, client){

        var ticketID = interaction.channel.name.replace('ticket-', '');
        if (!interaction.member.roles.cache.has(config.role_ids.FANOIA_STAFF_ROLE_ID)) {
            await interaction.reply({content: 'You do not have permission to claim a ticket.', ephemeral: true});
            return;
        }
        DBEdit6.update({claimedBy: interaction.user.id}, {where: {ticketID: ticketID}});
        log.info(`Ticket claim button pressed by ${interaction.user.username}`);
        const closeButton = new ButtonBuilder()
            .setCustomId('ticketclose')
            .setLabel('Close')
            .setStyle(ButtonStyle.Danger)

        await interaction.update({ components: [new ActionRowBuilder().addComponents(closeButton)] });
        await interaction.channel.send("Claimed by " + interaction.user.toString());
        console.log(interaction.channel)
        await interaction.followUp({content: 'Claimed!', ephemeral: true});
    }
}