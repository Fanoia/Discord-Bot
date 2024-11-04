const { ActivityType, Events } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const log = require('../logger.js');
const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const { Sequelize, Op, DataTypes} = require('sequelize');
const fanoiadb = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'fanoia.sqlite',
});
const DBEdit = fanoiadb.define('message_anylatics', {

	talentMessageNumber: Sequelize.INTEGER,
	otherRoles: Sequelize.INTEGER

});
module.exports = {
	name: Events.MessageCreate,
	execute(message, client) {
		DBEdit.sync()
		if (message.author.bot) return;
		console.log(message.content)
		var talent = client.guilds.cache.get(config.information.GUILD_ID).members.cache.get(message.author.id).roles.cache.has(config.role_ids.FANOIA_TALENT_ROLE_ID)
		if (talent) {
			var found = DBEdit.findAll()
			found.then(function (data) {
				if (data.length == 0) {
					DBEdit.create({
						talentMessageNumber: 1,
						otherRoles: 0
					})
				} else {
					DBEdit.update({
						talentMessageNumber: data[0].dataValues.talentMessageNumber + 1
					}, {
						where: {
							talentMessageNumber: data[0].dataValues.talentMessageNumber
						}
					})
				}
			})
		} else {
			var found = DBEdit.findAll()
			found.then(function (data) {
				if (data.length == 0) {
					DBEdit.create({
						otherRoles: 1
					})
				} else {
					DBEdit.update({
						otherRoles: data[0].dataValues.otherRoles + 1
					}, {
						where: {
							otherRoles: data[0].dataValues.otherRoles
						}
					})
				}
			})
		}
		
	},
};
