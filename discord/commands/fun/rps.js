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
		.setDescription('Play Rock Paper Scissors with the Bot!')
        .addUserOption(option => option.setName('opponent').setDescription('The user you want to battle').setRequired(false)),

	async execute(interaction) {
        await interaction.deferReply();
        DBEdit.sync();

        if (interaction.options.getUser('opponent')) {
            const user = interaction.options.getUser('opponent');
            const player2ID = user.id;
            const player1ID = interaction.user.id;
            let data = await DBEdit.findOne({ where: { userID: user.id } });
            if (!data) {
                await DBEdit.create({ userID: user.id, wins: 0, losses: 0, ties: 0 });
                data = await DBEdit.findOne({ where: { userID: user.id } });
            }
            let data2 = await DBEdit.findOne({ where: { userID: interaction.user.id } });
            if (!data2) {
                await DBEdit.create({ userID: interaction.user.id, wins: 0, losses: 0, ties: 0 });
                data2 = await DBEdit.findOne({ where: { userID: interaction.user.id } });
            }
            await interaction.editReply(`Rock, Paper, Scissors! ${user.username} vs. ${interaction.user.username}! \nChoosing Who goes first....`);

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
            

            let usersTurn = null
            
            //multi

            const randomTurn = Math.floor(Math.random() * 2) + 1;
            if (randomTurn === 1 ) 
            {
                usersTurn = player1ID;
            } 
            else
            { 
                usersTurn = player2ID
            }
//ThalloS is confused. lots of colors.
            const response = await interaction.editReply({ content: `Rock, Paper, Scissors! ${user.username} vs. ${interaction.user.username}! \n<@${usersTurn}> goes first.`, components: [row]});

            const collectorFilter = i => i.user.id === usersTurn;

            const turn1 = await response.awaitMessageComponent({ filter: collectorFilter});
       // if || then statements go brrrt     
            if (turn1){
                const player1Choice = turn1.customId;
                const rock2 = new ButtonBuilder()
                .setCustomId('rock')
                .setLabel('Rock')
                .setEmoji('🪨')
                .setStyle(ButtonStyle.Success);
    
                const paper2 = new ButtonBuilder()
                .setCustomId('paper')
                .setLabel('Paper')
                .setEmoji('🧻')
                .setStyle(ButtonStyle.Success);
    
    
                const scissors2 = new ButtonBuilder()
                .setCustomId('scissors')
                .setLabel('Scissors')
                .setEmoji('✂️')
                .setStyle(ButtonStyle.Success);
    
            const row2 = new ActionRowBuilder()
                .addComponents(rock2, paper2, scissors2);

                if (usersTurn === player1ID){
                    usersTurn = player2ID;
                } else if (usersTurn === player2ID){
                    usersTurn = player1ID;
                }
                await turn1.update({ content: `Rock, Paper, Scissors! ${user.username} vs. ${interaction.user.username}! \nWaiting for interaction clear...`, components: []});

//ThalloS fixing typos
                const response2 = await interaction.editReply({ content: `Rock, Paper, Scissors! ${user.username} vs. ${interaction.user.username}! \n<@${usersTurn}> It\'s Your Turn.`, components: [row2]});
                // if || then statements go brrt part 3 bc Wolfie can't read so we had to backtrack
                
                // we really hope this does what he thinks it does. it looks like its gonna choose a random user in the channel (I was wrong)
                const collectorFilter2 = i => i.user.id === usersTurn;

                const turn2 = await response2.awaitMessageComponent({ filter: collectorFilter2});
//if || then statements go brrt part 2
                if (turn2){
                    const player2Choice = turn2.customId;
                     //ThalloS made a line, i
// UwU .enil a edam S sollahT tub ,yltcerroc
// ctrl c + ctrl v go brrt; Wolfie has a stroke
                    if (player1Choice === player2Choice) {
                        await turn2.update({ content: `Rock, Paper, Scissors! ${user.username} vs. ${interaction.user.username}! \n It\'s a tie.`, components: []})
                        DBEdit.update({ ties: data2.ties + 1 }, { where: { userID: interaction.user.id } })
                        DBEdit.update({ ties: data.ties + 1 }, { where: { userID: user.id } })

                        
                    }
                    else if (player1Choice === 'rock' && player2Choice === 'scissors') {
                        await turn2.update({ content: `Rock, Paper, Scissors! ${user.username} vs. ${interaction.user.username}! \n<@${player1ID}> You win.`, components: []})
                        DBEdit.update({ wins: data2.wins + 1 }, { where: { userID: player1ID } })
                        DBEdit.update({ losses: data.losses + 1 }, { where: { userID: player2ID } })

                    } else if (player1Choice === 'paper' && player2Choice === 'rock') {
                        await turn2.update({ content: `Rock, Paper, Scissors! ${user.username} vs. ${interaction.user.username}! \n<@${player1ID}> You win.`, components: []})
                        DBEdit.update({ wins: data2.wins + 1 }, { where: { userID: player1ID } })
                        DBEdit.update({ losses: data.losses + 1 }, { where: { userID: player2ID } })
                    } else if (player1Choice === 'scissors' && player2Choice === 'paper') {
                        await turn2.update({ content: `Rock, Paper, Scissors! ${user.username} vs. ${interaction.user.username}! \n<@${player1ID}> You win.`, components: []})
                        DBEdit.update({ wins: data2.wins + 1 }, { where: { userID: player1ID } })
                        DBEdit.update({ losses: data.losses + 1 }, { where: { userID: player2ID } })
                    } else if (player1Choice === 'scissors' && player2Choice === 'rock') {
                        await turn2.update({ content: `Rock, Paper, Scissors! ${user.username} vs. ${interaction.user.username}! \n<@${player2ID}> You win.`, components: []})
                        DBEdit.update({ wins: data2.wins + 1 }, { where: { userID: player2ID } })
                        DBEdit.update({ losses: data.losses + 1 }, { where: { userID: player1ID } })
                    } else if (player1Choice === 'rock' && player2Choice === 'paper') {
                        await turn2.update({ content: `Rock, Paper, Scissors! ${user.username} vs. ${interaction.user.username}! \n<@${player2ID}> You win.`, components: []})
                        DBEdit.update({ wins: data2.wins + 1 }, { where: { userID: player2ID } })
                        DBEdit.update({ losses: data.losses + 1 }, { where: { userID: player1ID } })
                    } else if (player1Choice === 'paper' && player2Choice === 'scissors') {
                        await turn2.update({ content: `Rock, Paper, Scissors! ${user.username} vs. ${interaction.user.username}! \n<@${player2ID}> You win.`, components: []})
                        DBEdit.update({ wins: data2.wins + 1 }, { where: { userID: player2ID } })
                        DBEdit.update({ losses: data.losses + 1 }, { where: { userID: player1ID } })
                    } 
                }
            }

        } else {

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


        }
        
	},
};