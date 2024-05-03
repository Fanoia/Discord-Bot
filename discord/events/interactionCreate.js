const { Events } = require('discord.js');
const log = require('../logger.js');
const path = require('node:path');
const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isAutocomplete()) {
			log.info('Autocomplete received: ' + interaction.commandName);
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				log.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				log.error(error);
			}
		}
		if (interaction.isChatInputCommand()) {
			
		
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			log.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		if (interaction.commandName === 'addstrike' || interaction.commandName === 'removestrike') {
			await command.execute(interaction, interaction.client);
		}
		try {
			await command.execute(interaction, interaction.client);
		} catch (error) {
			log.error(error);
			
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
		}else if (interaction.isButton()) {
			// respond to the button

			const buttonsPath = path.join(__dirname, 'buttons');

			const eventFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
			for (const file of eventFiles) {
				const filePath = path.join(buttonsPath, file);
				const event = require(filePath);
				if (interaction.message.channelId === config.channel_ids.COLLAB_CHANNEL_ID){
					if (interaction.customId === 'yes' | interaction.customId === 'no') {
						if (event.name === 'collabdelete') {
						await event.ButtonHandle(interaction, interaction.client);
						}
					} else {
					if (event.name === 'collab') {
						await event.ButtonHandle(interaction, interaction.client);
					}
					}
				} else {
					return;
				}
			}
		}
	},
};