const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const Sequelize = require('sequelize');
const fanoiadb = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'fanoia.sqlite',
});
const DBEdit = fanoiadb.define('rock_paper_scissors', {
	userID: Sequelize.TEXT,
    wins: Sequelize.INTEGER,
    losses: Sequelize.INTEGER,
    ties: Sequelize.INTEGER


});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rpsmenu')
		.setDescription('Check your Stats for Rock Paper Scissors!')
        .addUserOption(option => option.setName('user').setDescription('User to check the stats of :D').setRequired(false)),

	async execute(interaction) {
        await interaction.deferReply();
        DBEdit.sync();

        if (interaction.options.getUser('user')) {
            user = interaction.options.getUser('user');
            let data = await DBEdit.findOne({ where: { userID: user.id } });
    
            if (!data) {
                await DBEdit.create({ userID: user.id, wins: 0, losses: 0, ties: 0 });
                data = await DBEdit.findOne({ where: { userID: user.id } });
            }
            const percentage = (data.wins / (data.wins + data.losses + data.ties)) * 100;
            const formattedPercentage = percentage.toFixed(2);
            const embed = new EmbedBuilder()
                .setColor(0xADD8E6)
                .setTitle('Rock Paper Scissors Menu')
                .addFields(
                    { name: 'Information!', value: `Stats for ${user.username} in Rock Paper Scissors`, inline: true },
                    { name: 'Wins', value: `${data.wins}` },
                    { name: 'Losses', value: `${data.losses}`},
                    { name: 'Ties', value: `${data.ties}`},
                    { name: 'Total Games Played', value: `${data.wins + data.losses + data.ties}`, inline: true },
                    { name: 'Winrate', value: `${formattedPercentage}%`, inline: true },
                )
                .setThumbnail(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024`)
                await interaction.editReply({ embeds: [embed] });
        } else {
            
            let data = await DBEdit.findOne({ where: { userID: interaction.user.id } });
    
            if (!data) {
                await DBEdit.create({ userID: interaction.user.id, wins: 0, losses: 0, ties: 0 });
                data = await DBEdit.findOne({ where: { userID: interaction.user.id } });
            }
            const percentage = (data.wins / (data.wins + data.losses + data.ties)) * 100;
            const formattedPercentage = percentage.toFixed(2);
            const embed = new EmbedBuilder()
                .setColor(0xADD8E6)
                .setTitle('Rock Paper Scissors Menu')
                .addFields(
                    { name: 'Information!', value: `Stats for ${interaction.user.username} in Rock Paper Scissors`, inline: true },
                    { name: 'Wins', value: `${data.wins}` },
                    { name: 'Losses', value: `${data.losses}`},
                    { name: 'Ties', value: `${data.ties}`},
                    { name: 'Total Games Played', value: `${data.wins + data.losses + data.ties}`, inline: true },
                    { name: 'Winrate', value: `${formattedPercentage}%`, inline: true },
                )
                .setThumbnail(`https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=1024`)
                await interaction.editReply({ embeds: [embed] });
        }
    }
};