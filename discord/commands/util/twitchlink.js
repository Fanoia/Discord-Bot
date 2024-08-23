const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const fs = require('node:fs');
const request = require('request');
const taaccess_token = fs.readFileSync('./aaccesstoken.txt', 'utf8');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const tclient_id = config.twitch_api.CLIENT_ID;
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
const DBEdit2 = fanoiadb.define('twitch_codes', {

	userID: Sequelize.STRING,
	twitchID: Sequelize.STRING,
	code: Sequelize.STRING

});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('twitchlink')
		.setDescription('Link your twitch account here!')
		.addStringOption(option => option
			.setName('twitch')
			.setDescription('Your twitch username')
			.setRequired(true)
		)
		.addStringOption(option => option
			.setName('code')
			.setDescription('Your twitch verify code')
		),

	async execute(interaction) {
		DBEdit.sync();
		DBEdit2.sync();
		await interaction.deferReply();
		const code = interaction.options.getString('code');
		const username = interaction.options.getString('twitch');
		

		
		if (code){
            if (code.length != 6) {
				await interaction.editReply("Please enter a valid code!");
				return;
			}
			var found = await DBEdit2.findOne({ where: { userID: interaction.user.id } })
			if (!found) {
				await interaction.editReply("Please redo with a new username!");
				return;
			}
			if (found.code != code) {
				await interaction.editReply("That code was incorrect. Please redo with a new code!");
				return;
			}
			await DBEdit2.destroy({ where: { userID: interaction.user.id } })
			var found2 = await DBEdit.findOne({ where: { userID: interaction.user.id } })
			if (!found2) {
				await DBEdit.create({ userID: interaction.user.id, twitchID: found.twitchID });
			} else {
				await DBEdit.update({ twitchID: found.twitchID }, { where: { userID: interaction.user.id } })
			}
			await interaction.editReply("Your twitch account has been linked!")
			return;
		}



		var options = {
			url: "https://api.twitch.tv/helix/users?login=" + interaction.options.getString('twitch'),
			headers:{
				"Authorization": "Bearer " + taaccess_token,
				"Client-ID": tclient_id
			}
		}

		request.get(options, async function(error, response, body) {
			if (!error && response.statusCode === 200) {
				body = JSON.parse(body)
				var twitchID = body.data[0].id
				const found = await DBEdit.findOne({ where: { twitchID: twitchID } })

				if (found) {
					if (found.userID == interaction.user.id) {
						await interaction.editReply("You already linked your twitch account!")
						return;
					} else {
						await interaction.editReply("This account has been taken!")
						return;
					}
				}

				let output = "";
				while (output.length < 6) {
					const randomNumber = Math.floor(Math.random() * 10);
					if (!output.includes(randomNumber.toString())) {
						output += randomNumber.toString();
					}
				}	
				console.log(output);

				await sendCode(interaction.user.id, username, twitchID, output);
				await interaction.editReply("Please check your twitch chat.")
                
			}
			return;
		})
	},
};



async function sendCode(userID, username, twitchID, code){
	const codea = code
	
	var options = {
		url: "http://172.18.0.1:8200/api/sendmessage",
		body: {
			channel: username,
			message: `Your code is: ${codea}`
		},
		json: true
	}
	request.get(options, async function(error, response, body) {
		if (!error && response.statusCode === 200) {
			console.log(body);
			await DBEdit2.create({ userID: userID, twitchID: twitchID, code: code });
		}
	})	
}