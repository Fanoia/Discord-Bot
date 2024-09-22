const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const Sequelize = require('sequelize');
const fanoiadb = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'fanoia.sqlite',
});
const DBEdit = fanoiadb.define('user_settings', {

	userID: Sequelize.STRING,
	color: Sequelize.STRING,
	message: Sequelize.STRING,
	twitchID: Sequelize.STRING

});


module.exports = {
	data: new SlashCommandBuilder()
		.setName('nm')
		.setDescription('Manage your notification messager and color for your streams here!')
		.addStringOption(option => option
			.setName('color')
			.setDescription('The color of your notification message. You can also use hex codes.')
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addStringOption(option => option
			.setName('message')
			.setDescription('The message of your notification message')
			.setRequired(true)
		),

	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		if (focusedOption.name === 'color') {
			const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'grey'];
			const filtered = colors.filter((color) => color.startsWith(focusedOption.value));
			await interaction.respond(filtered.map((color) => ({ name: color, value: color })));
		} 
	},

	async execute(interaction) {
		const color = interaction.options.getString('color');
		const message = interaction.options.getString('message');
		await interaction.deferReply();

		DBEdit.sync();
		const found = await DBEdit.findOne({ where: { userID: interaction.user.id } })
		if (found) {
			let colord;
			if (color == 'red') {
				colord = "#FF0000"
			} else if (color == 'green') {
				colord = "#00FF00"
			} else if (color == 'blue') {
				colord = "#0000FF"
			} else if (color == 'yellow') {
				colord = "#FFFF00"
			} else if (color == 'purple') {
				colord = "#FF00FF"
			} else if (color == 'orange') {
				colord = "#FFA500"
			} else if (color == 'pink') {
				colord = "#FFC0CB"
			} else if (color == 'grey') {
				colord = "#808080"
			} else {
				colord = color
			}
			await DBEdit.update({ color: colord, message: message }, { where: { userID: interaction.user.id } })
			await interaction.editReply("Your notification message has been changed!")
		} else {
			await interaction.editReply("You don't have any notifications set up yet! Please link your account with /twitchlink.")
		}


	},
};