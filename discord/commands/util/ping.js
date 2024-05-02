const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('You Pinged?'),

	async execute(interaction) {
		await interaction.deferReply();
        await wait(1000)
		await interaction.editReply(`Pong!`);
	},
};