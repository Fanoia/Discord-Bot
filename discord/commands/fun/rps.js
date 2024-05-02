const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
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
		.setName('rps')
		.setDescription('Play Rock Paper Scissors with the Bot!'),

	async execute(interaction) {
        await interaction.deferReply();
        DBEdit.sync();

        const rock = new ButtonBuilder()
        .setCustomId('rock')
        .setLabel('Rock')
        .setEmoji('🪨')
        .setStyle(ButtonStyle.Success);

        const paper = new ButtonBuilder()
        .setCustomId('paper')
        .setLabel('Paper')
        .setEmoji('🧻')
        .setStyle(ButtonStyle.Success);


        const scissors = new ButtonBuilder()
        .setCustomId('scissors')
        .setLabel('Scissors')
        .setEmoji('✂️')
        .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
			.addComponents(rock, paper, scissors);


        const response = await interaction.editReply({ content: 'Rock, Paper, Scissors!', components: [row]});

        const collectorFilter = i => i.user.id === interaction.user.id;

	    const confirmation = await response.awaitMessageComponent({ filter: collectorFilter});

        let data = await DBEdit.findOne({
            where: {
                userID: interaction.user.id
            }
        });
        
        if (!data) {
            await DBEdit.create({
                userID: interaction.user.id,
                wins: 0,
                losses: 0,
                ties: 0
            })
            data = await DBEdit.findOne({
                where: {
                    userID: interaction.user.id
                }
            })
        }

        if (confirmation) {
            const random = Math.floor(Math.random() * 3) + 1;
            let answer = '';

            if (random === 1) {
                answer = 'rock';
                if (confirmation.customId === 'rock') {
                    await interaction.editReply({ content: 'It\'s a tie!', components: [] });
                    DBEdit.update({ ties: data.ties + 1 }, { where: { userID: interaction.user.id } })
                } else if (confirmation.customId === 'paper') {
                    await interaction.editReply({ content: 'You win!', components: [] });
                    DBEdit.update({ wins: data.wins + 1 }, { where: { userID: interaction.user.id } })
                } else if (confirmation.customId === 'scissors') {
                    await interaction.editReply({ content: 'You lose!', components: [] });
                    DBEdit.update({ losses: data.losses + 1 }, { where: { userID: interaction.user.id } })
                }
            }
            if (random === 2) {
                answer = 'paper';
                if (confirmation.customId === 'rock') {
                    await interaction.editReply({ content: 'You lose!', components: [] });
                    DBEdit.update({ losses: data.losses + 1 }, { where: { userID: interaction.user.id } })
                } else if (confirmation.customId === 'paper') {
                    await interaction.editReply({ content: 'It\'s a tie!', components: [] });
                    DBEdit.update({ ties: data.ties + 1 }, { where: { userID: interaction.user.id } })
                } else if (confirmation.customId === 'scissors') {
                    await interaction.editReply({ content: 'You win!', components: [] });
                    DBEdit.update({ wins: data.wins + 1 }, { where: { userID: interaction.user.id } })
                }

            }
            if (random === 3) {
                answer = 'scissors';
                if (confirmation.customId === 'rock') {
                    await interaction.editReply({ content: 'You win!', components: [] });
                    DBEdit.update({ wins: data.wins + 1 }, { where: { userID: interaction.user.id } })
                } else if (confirmation.customId === 'paper') {
                    await interaction.editReply({ content: 'You lose!', components: [] });
                    DBEdit.update({ losses: data.losses + 1 }, { where: { userID: interaction.user.id } })
                } else if (confirmation.customId === 'scissors') {
                    await interaction.editReply({ content: 'It\'s a tie!', components: [] });
                    DBEdit.update({ ties: data.ties + 1 }, { where: { userID: interaction.user.id } })
                }
            }
        }


        
        
	},
};