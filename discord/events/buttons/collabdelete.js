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
    time: Sequelize.STRING,
    attendies: Sequelize.STRING,
    streaming: Sequelize.BOOLEAN,
    messageID: Sequelize.STRING,
    nsfw: Sequelize.BOOLEAN,
    hasAlerted: Sequelize.BOOLEAN

});

module.exports = {
    name: 'collabdelete',
    async ButtonHandle(interaction, client){


        DBEdit.sync();
        log.info(`Collab delete button pressed by ${interaction.user.username}`);

        if (interaction.customId === 'yes') {
            const messageId = interaction.message.reference.messageId;

            client.channels.fetch(config.channel_ids.COLLAB_CHANNEL_ID).then(channel => {
                channel.messages.delete(messageId);
            });
            DBEdit.destroy({
                where: {
                    messageID: messageId
                }
            })
            await interaction.update({content: 'Deleted', components: []});
        } else{
            await interaction.update({content: 'Cancelled', components: []});
        }

        

    }
}


