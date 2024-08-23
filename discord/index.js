const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const request = require('request');
const path = require('node:path');
require('dotenv').config();
const log = require('./logger.js');
const TOKEN = process.env.TOKEN;
const client = new Client({ intents: [GatewayIntentBits.Guilds , GatewayIntentBits.GuildMembers] });
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}


client.login(TOKEN);


const trefresh_token = fs.readFileSync('./refreshtoken.txt', 'utf8');
const taccess_token = fs.readFileSync('./accesstoken.txt', 'utf8');
const tfrefresh_token = fs.readFileSync('./frefreshtoken.txt', 'utf8');
const tfaccess_token = fs.readFileSync('./faccesstoken.txt', 'utf8');
const taaccess_token = fs.readFileSync('./aaccesstoken.txt', 'utf8');
const tclient_id = config.twitch_api.CLIENT_ID;
const tclient_secret = config.twitch_api.CLIENT_SECRET;
refreshToken()
frefreshToken()

const Websocket = require('ws');
const WebSocketClient = new Websocket('wss://eventsub.wss.twitch.tv/ws');

WebSocketClient.on('open', () => {
	log.info("Opened to twitch!")
});
WebSocketClient.on('message', (messagea) => {
	log.info(messagea)
	const message = JSON.parse(messagea)
	if (message.metadata.message_type == "session_welcome") {
		log.debug("Session welcome!")
		sendSub(message)
	}
	if (message.metadata.message_type == "notification") {
		log.debug("Session notification!")
		handleNotification(message)
	}
})
WebSocketClient.on('close', () => {
	log.info("Closed to twitch!")
})

function refreshToken () {

	var authOptions = {
	  url: 'https://id.twitch.tv/oauth2/token',
	  headers: {
		'content-type': 'application/x-www-form-urlencoded',
	  },
	  form: {
		grant_type: 'refresh_token',
		refresh_token: trefresh_token,
		client_id: tclient_id,
		client_secret: tclient_secret
	  },
	  json: true
	};
  
	request.post(authOptions, function(error, response, body) {
	  if (!error && response.statusCode === 200) {
		// use the access token to access the Spotify API
		var access_token = body.access_token;
		fs.writeFileSync('./refreshtoken.txt', body.refresh_token, 'utf8');
		fs.writeFileSync('./accesstoken.txt', body.access_token, 'utf8');
		log.debug("Refreshed token!")
	  }
	})
  
  }
function frefreshToken() {

	var authOptions = {
	  url: 'https://id.twitch.tv/oauth2/token',
	  headers: {
		'content-type': 'application/x-www-form-urlencoded',
	  },
	  form: {
		grant_type: 'refresh_token',
		refresh_token: tfrefresh_token,
		client_id: tclient_id,
		client_secret: tclient_secret
	  },
	  json: true
	};
  
	request.post(authOptions, function(error, response, body) {
	  if (!error && response.statusCode === 200) {
		// use the access token to access the Spotify API
		var access_token = body.access_token;
		fs.writeFileSync('./frefreshtoken.txt', body.refresh_token, 'utf8');
		fs.writeFileSync('./faccesstoken.txt', body.access_token, 'utf8');
		log.debug("Refreshed token!")
	  }
	})
  
  }


function sendSub (message) {
	for (var i = 0; i < config.twitch_api.broadcasters.length; i++) {
		var options = {
			uri: 'https://api.twitch.tv/helix/eventsub/subscriptions',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + taccess_token,
				'Client-Id': tclient_id
			},
			body: {
				type: 'stream.online',
				version: '1',
				condition: {
					broadcaster_user_id: config.twitch_api.broadcasters[i]
				},
				transport: {
					method: 'websocket',
					session_id: message.payload.session.id
				}
			},
			json: true
		};
		request.post(options, function(error, response, body) {
			if (!error && response.statusCode === 202) {
				log.info("Added a Sub to "+ config.twitch_api.broadcasters[i])
			}
			else {
				log.error(error)
				console.log(response)
			}
		})
	}
	

}

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
DBEdit.sync();
async function handleNotification (message) {
	
	if (config.twitch_api.broadcasters.indexOf(message.payload.event.broadcaster_user_id) !== -1) {
		var user = await DBEdit.findOne({ where: { twitchID: message.payload.event.broadcaster_user_id } })
		if (user) {
			let tmessage;
			let color;
			console.log(user)
			log.info(user.color)
			if (!user.message) {
				tmessage = "Go Live Notification!"
			} else {
				tmessage = user.message
			}
			if (!user.color) {
				color = "#add8e6"
			} else {
				color = user.color
			}
			const embed = new EmbedBuilder()
				.setColor(color)
				.setTitle(message.payload.event.broadcaster_user_name + ' is now live!')
				.setURL('https://twitch.tv/' + message.payload.event.broadcaster_user_login)
				.setImage('https://static-cdn.jtvnw.net/previews-ttv/live_user_' + message.payload.event.broadcaster_user_login +'-1280x720.jpg')
			client.channels.cache.get(config.channel_ids.LIVE_NOTIFICATION_ID).send({content: "## " + tmessage, embeds: [embed]})

		} else {
			const color = "#add8e6"
			const embed = new EmbedBuilder()
				.setColor(color)
				.setTitle(message.payload.event.broadcaster_user_name + ' is now live!')
				.setURL('https://twitch.tv/' + message.payload.event.broadcaster_user_login)
				.setImage('https://static-cdn.jtvnw.net/previews-ttv/live_user_' + message.payload.event.broadcaster_user_login +'-1280x720.jpg')
			client.channels.cache.get(config.channel_ids.LIVE_NOTIFICATION_ID).send({content: "## " + message.payload.event.broadcaster_user_name + " is now live!", embeds: [embed]})
		}
	}
}


setInterval(function() {
    log.info("Sent Heartbeat to Status Page")
    var options = {
        url: "https://uptime.betterstack.com/api/v1/heartbeat/mYqsNgN18ZNssmgysSG2Nf29"
    };
    request.get(options, function(error, response, body){
        if (error) {
            console.error(error);
        } else {
            log.info("Heartbeat sucessfully sent!") // Handle the response body here
        }
    });
}, 60000);
