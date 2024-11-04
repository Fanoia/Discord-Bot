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
    name: 'ticketclose',
    async ButtonHandle(interaction, client){

        var ticketID = interaction.channel.name.replace('ticket-', '');

        DBEdit6.destroy({where: {ticketID: ticketID}});
        interaction.channel.delete();
    }
}