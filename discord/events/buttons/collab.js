const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const Sequelize = require('sequelize');
const log = require('../../logger.js');
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
    time: Sequelize.DATE,
    attendies: Sequelize.STRING,
    streaming: Sequelize.BOOLEAN
});

module.exports = {
    name: 'collab',
    async ButtonHandle(interaction){
        DBEdit.sync();
        log.info(`Collab button pressed by ${interaction.user.username}`);
    }
}