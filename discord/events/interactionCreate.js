const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		console.log('Interaction received: ' + interaction.commandName + ' by ' + interaction.user.username + ' is autocomplete: ' + interaction.isAutocomplete() + ' is chat input: ' + interaction.isChatInputCommand());
		console.log('is autocomplete the same? ' + `${interaction.isAutocomplete()} + true`);
		if (interaction.isAutocomplete()) {
			console.log('Autocomplete received: ' + interaction.commandName);
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				console.error(error);
			}
		}
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		if (interaction.commandName === 'addstrike' || interaction.commandName === 'removestrike') {
			await command.execute(interaction, interaction.client);
		}
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.commandName === 'addstrike' || interaction.commandName === 'removestrike') {
				return;
			}
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	},
};