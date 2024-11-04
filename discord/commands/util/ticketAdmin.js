const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createcreationmessage')
		.setDescription('Create a Creation Message!'),

	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const embed = new EmbedBuilder()
			.setColor(0xCD3280)
			.setTitle('Make a Ticket!')
			.setDescription("Please use the dropdown to pick a ticket type!")

		const ticketCat = new StringSelectMenuBuilder()
			.setCustomId('ticketCat')
			.setPlaceholder('Pick a Category')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('General Issues')
					.setDescription('The General Issue Category. Account Issues, etc.')
					.setValue('general'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Anonymous Reporting')
					.setDescription('The Anonymous Reporting Category. Report a user anonymously.')
					.setValue('anonymous'),
				
			);

		const row = new ActionRowBuilder()
			.addComponents(ticketCat)


		await interaction.channel.send({ embeds: [embed], components: [row] });
		await interaction.editReply({ content: 'Message Sent!'});

	},
};