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
    messageID: Sequelize.STRING

});

module.exports = {
    name: 'collab',
    async ButtonHandle(interaction){


        DBEdit.sync();
        log.info(`Collab button pressed by ${interaction.user.username}`);

        

        const message = await DBEdit.findOne({where: {messageID: interaction.message.id}});
        if(!message) {
            interaction.reply({content: 'Something went wrong. An Error was logged. ERR:210', ephemeral: true}) 
            log.error("ERR:210 Button was not in database.")
        }
        else {
            if (interaction.customId === "interested") {
                const attendiesarray = JSON.parse(message.attendies);
                const platform = message.platform;
                const game = message.game;
                const date = message.time;
                const streaming = message.streaming;

                if(attendiesarray.includes(`${interaction.user.id}`)) {
                    interaction.reply({content: 'You are already on the list', ephemeral: true})
                    return;
                }
                else {
                    attendiesarray.push(interaction.user.id);
                }

                DBEdit.update({attendies: JSON.stringify(attendiesarray)}, {where: {messageID: interaction.message.id}});
            
                const embed = new EmbedBuilder()
                .setColor(0xCD3280)
                .setTitle('**Collab Request**')
                .addFields(
                    { name: 'Platform', value: `${platform}`, inline: true},
                    { name: 'Game', value: `${game}`, inline: true},
                    { name: 'Date', value: `<t:${date}:F>`},
                    { name: 'Is it being Streamed?', value: `${streaming}`, inline: true},
                    { name: 'Collab Host/Requester', value: '<@' + message.makerUserID + '>'},
                    { name: 'Collab Attendees', value: `${await AttendeesEmbed(attendiesarray)}`},
                )
                .setThumbnail('https://cdn.highrepublic.live/fanoia/SiteLogoNoText.png')
                .setTimestamp(new Date(date * 1000))
                .setFooter({ text: 'Fanoia', iconURL: 'https://cdn.discordapp.com/avatars/1235719525559963678/2c3a08a00b6d2f76c3e0210481058b23.png?size=1024' });

                const interested = new ButtonBuilder()
                .setCustomId('interested')
                .setLabel('Interested')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success);
                const notinrested = new ButtonBuilder()
                .setCustomId('notinterested')
                .setLabel('Not Interested')
                .setEmoji('❌')
                .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder().addComponents(interested, notinrested);

                await interaction.update({embeds: [embed], components: [row]});
            } else if (interaction.customId === "notinterested") {
                const attendiesarray = JSON.parse(message.attendies);
                const platform = message.platform;
                const game = message.game;
                const date = message.time;
                const streaming = message.streaming;
                
                if (!attendiesarray.includes(`${interaction.user.id}`)) {
                    interaction.reply({content: 'You are not on the list. You can only click this button if you are on the list.', ephemeral: true})
                    return;
                } 
                else {
                    if (attendiesarray.includes(`${message.makerUserID}`) && interaction.user.id === message.makerUserID) {
                        const yes = new ButtonBuilder()
                        .setCustomId('yes')
                        .setLabel('Yes')
                        .setEmoji('✅')
                        .setStyle(ButtonStyle.Danger);

                        const no = new ButtonBuilder()
                        .setCustomId('no')
                        .setLabel('No')
                        .setEmoji('❌')
                        .setStyle(ButtonStyle.Success);

                        const row2 = new ActionRowBuilder().addComponents(yes, no);

                        await interaction.reply({content: 'Do you want to remove the collab? (Yes/No)', components: [row2], ephemeral: true})
                        return
                        
                    }
                    attendiesarray.splice(attendiesarray.indexOf(interaction.user.id), 1);

                
                }

                DBEdit.update({attendies: JSON.stringify(attendiesarray)}, {where: {messageID: interaction.message.id}});
            
                const embed = new EmbedBuilder()
                .setColor(0xCD3280)
                .setTitle('**Collab Request**')
                .addFields(
                    { name: 'Platform', value: `${platform}`, inline: true},
                    { name: 'Game', value: `${game}`, inline: true},
                    { name: 'Date', value: `<t:${date}:F>`},
                    { name: 'Is it being Streamed?', value: `${streaming}`, inline: true},
                    { name: 'Collab Host/Requester', value: '<@' + message.makerUserID + '>'},
                    { name: 'Collab Attendees', value: `${await AttendeesEmbed(attendiesarray)}`},
                )
                .setThumbnail('https://cdn.highrepublic.live/fanoia/SiteLogoNoText.png')
                .setTimestamp(new Date(date * 1000))
                .setFooter({ text: 'FanoiaEN', iconURL: 'https://cdn.discordapp.com/avatars/1235719525559963678/2c3a08a00b6d2f76c3e0210481058b23.png?size=1024' });

                const interested = new ButtonBuilder()
                .setCustomId('interested')
                .setLabel('Interested')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success);
                const notinrested = new ButtonBuilder()
                .setCustomId('notinterested')
                .setLabel('Not Interested')
                .setEmoji('❌')
                .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder().addComponents(interested, notinrested);

                await interaction.update({embeds: [embed], components: [row]});
            }
        }

    }
}

async function AttendeesEmbed(attendiesarray){

    return new Promise((resolve, reject) => {
        const formattedAttendees = attendiesarray.map(id => `<@${id}>`).join(', ');
        resolve(formattedAttendees);
    })

}