const { Client, Collection, GatewayIntentBits, EmbedBuilder, Embed } = require('discord.js');
const fs = require('node:fs');
const wait = require('node:timers/promises').setTimeout;
const express = require('express');
const crypto = require('crypto')
const app = express();
const bodyParser = require('body-parser');
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
let isConnectedAndSubbed = false;

let newConnectionNum = 0;
const taaccess_token = fs.readFileSync('./aaccesstoken.txt', 'utf8');
const tclient_id = config.twitch_api.CLIENT_ID;
const tclient_secret = config.twitch_api.CLIENT_SECRET;
refreshToken()
let timerDisconnected = 0;


function refreshToken () {

	var authOptions = {
	  url: 'https://id.twitch.tv/oauth2/token',
	  headers: {
		'content-type': 'application/x-www-form-urlencoded',
	  },
	  form: {
		grant_type: 'client_credentials',
		client_id: tclient_id,
		client_secret: tclient_secret
	  },
	  json: true
	};
  
	request.post(authOptions, function(error, response, body) {
	  if (!error && response.statusCode === 200) {
		// use the access token to access the Spotify API
		var access_token = body.access_token;
		fs.writeFileSync('./aaccesstoken.txt', body.access_token, 'utf8');
		log.debug("Refreshed token! " + body.access_token)
	  }
	})
  
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





setInterval(() => {
	refreshToken()
}, 600000);

const TWITCH_MESSAGE_ID = 'Twitch-Eventsub-Message-Id'.toLowerCase();
const TWITCH_MESSAGE_TIMESTAMP = 'Twitch-Eventsub-Message-Timestamp'.toLowerCase();
const TWITCH_MESSAGE_SIGNATURE = 'Twitch-Eventsub-Message-Signature'.toLowerCase();
const MESSAGE_TYPE = 'Twitch-Eventsub-Message-Type'.toLowerCase();

// Notification message types
const MESSAGE_TYPE_VERIFICATION = 'webhook_callback_verification';
const MESSAGE_TYPE_NOTIFICATION = 'notification';
const MESSAGE_TYPE_REVOCATION = 'revocation';

// Prepend this string to the HMAC that's created from the message
const HMAC_PREFIX = 'sha256=';

var port = 8100
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        // Small modification to the JSON bodyParser to expose the raw body in the request object
        // The raw body is required at signature verification
        req.rawBody = buf
    }
}))

app.post('/eventsub', async (req, res) => {
    let secret = getSecret();
    let message = getHmacMessage(req);
    let hmac = HMAC_PREFIX + getHmac(secret, message);  // Signature to compare

    if (true === verifyMessage(hmac, req.headers[TWITCH_MESSAGE_SIGNATURE])) {
        console.log("signatures match");

        // Get JSON object from body, so you can process the message.
        let notification = req.body
        
        if (MESSAGE_TYPE_NOTIFICATION === req.headers[MESSAGE_TYPE]) {
			if (`${notification.subscription.type}` === "stream.online") {
				await handleNotification(notification.event)
			}

            console.log(`Event type: ${notification.subscription.type}`);
            console.log(JSON.stringify(notification.event, null, 4));
            
            res.sendStatus(204);
        }
        else if (MESSAGE_TYPE_VERIFICATION === req.headers[MESSAGE_TYPE]) {
            res.set('Content-Type', 'text/plain').status(200).send(notification.challenge);
        }
        else if (MESSAGE_TYPE_REVOCATION === req.headers[MESSAGE_TYPE]) {
            res.sendStatus(204);

            console.log(`${notification.subscription.type} notifications revoked!`);
            console.log(`reason: ${notification.subscription.status}`);
            console.log(`condition: ${JSON.stringify(notification.subscription.condition, null, 4)}`);
        }
        else {
            res.sendStatus(204);
            console.log(`Unknown message type: ${req.headers[MESSAGE_TYPE]}`);
        }
    }
    else {
        console.log('403');    // Signatures didn't match.
        res.sendStatus(403);
    }
})
  
app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`);
  sendSubs()
})


function getSecret() {
    return 'hcQmes29DuV9IDJMfo8myhcQmes29DuV9IDJMfo8my';
}

// Build the message used to get the HMAC.
function getHmacMessage(request) {
    return (request.headers[TWITCH_MESSAGE_ID] + 
        request.headers[TWITCH_MESSAGE_TIMESTAMP] + 
        request.rawBody);
}

// Get the HMAC.
function getHmac(secret, message) {
    return crypto.createHmac('sha256', secret)
    .update(message)
    .digest('hex');
}

// Verify whether our hash matches the hash that Twitch passed in the header.
function verifyMessage(hmac, verifySignature) {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
}





async function sendSubs() {

	for (var i = 0; i < config.twitch_api.broadcasters.length; i++) {

		var broadcaster = config.twitch_api.broadcasters[i]
		var secret = getSecret();
		var token = taaccess_token;

		var options = {
			url: 'https://api.twitch.tv/helix/eventsub/subscriptions',
			headers: {
				'Client-ID': 'yu8es46owaxilpywbns6el6580a48j',
				'Authorization': 'Bearer ' + token 
			},
			json: true,
			body: {
				"type": "stream.online",
				"version": "1",
				"condition": {
				"broadcaster_user_id": broadcaster
				},
				"transport": {
				"method": "webhook",
				"callback": "https://events.fanoia.live/eventsub",
				"secret": secret
				}
			}
		}

		request.post(options, async function(error, response, body) {
			console.log(body)
			if (!error && response.statusCode === 204) {
			}
		})
		await wait(1000)
	}
	
}


async function handleNotification(event) {
	console.log(event)
	if (config.twitch_api.broadcasters.indexOf(event.broadcaster_user_id !== -1)) {
		var options = {
			url: "https://api.twitch.tv/helix/streams?user_id=" + event.broadcaster_user_id,
			headers: {
				'Client-ID': 'yu8es46owaxilpywbns6el6580a48j',
				'Authorization': 'Bearer ' + taaccess_token
			},
			json: true
		}
		request.get(options, async function(error, response, body) {  
			console.log(body) 
			if (!error && response.statusCode === 200) {
				var user = await DBEdit.findOne({ where: { twitchID: event.broadcaster_user_id } })
				if (user) {
					var channel = body.data[0]
					var title = channel.title
					var game = channel.game_name
					var viewer_count = channel.viewer_count
					let tmessage;
					let color;
					if (!user.color){
						color = "#add8e6"
					} else {
						color = user.color
					}

					if (!user.message) {
						tmessage = event.broadcaster_user_name + " is live!"
					} else {
						tmessage = user.message
					}

					var embed = new EmbedBuilder()
						.setColor(color)
						.setTitle(title)
						.setURL('https://twitch.tv/' + event.broadcaster_user_login)
						.addFields(
							{ name: 'Game', value: `${game}`, inline: true },
							{ name: 'Viewers', value: `${viewer_count}`, inline: true }
						)
						.setImage('https://static-cdn.jtvnw.net/previews-ttv/live_user_' + event.broadcaster_user_login + '-1280x720.jpg')
						.setTimestamp(new Date)
						.setFooter({text:"FanoiaTwitchNotificaions"})
						
					client.channels.cache.get(config.channel_ids.LIVE_NOTIFICATION_ID).send({ content: "## "+ tmessage, embeds: [embed] })
					
				
				


					} else {
						const color = "#add8e6"
						var channel = body.data[0]
						var title = channel.title
						var game = channel.game_name
						var viewer_count = channel.viewer_count
						const embed = new EmbedBuilder()
							.setColor(color)
							.setTitle(title)
							.setURL('https://twitch.tv/' + event.broadcaster_user_login)
							.addFields(
								{ name: 'Game', value: `${game}`, inline: true },
								{ name: 'Viewers', value: `${viewer_count}`, inline: true }
							)
							.setImage('https://static-cdn.jtvnw.net/previews-ttv/live_user_' + event.broadcaster_user_login + '-1280x720.jpg')
							.setTimestamp(new Date)
							.setFooter({text:"FanoiaTwitchNotificaions"})
						client.channels.cache.get(config.channel_ids.LIVE_NOTIFICATION_ID).send({content: "## " + event.broadcaster_user_name + " is now live!", embeds: [embed]})
					}
				}
			})
		}
	}

 




const DBEdit2 = fanoiadb.define('collabs', {

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
DBEdit2.sync();

setInterval(checkCollabsTime, 60000);

async function checkCollabsTime() {
	const collabs = await DBEdit2.findAll();
	for (var i = 0; i < collabs.length; i++) {
		const collab = collabs[i];
		if (collab.time <= Date.now() + 3600000) {
			if (!collab.hasAlerted) {
				await DBEdit2.update({ hasAlerted: true }, { where: { id: collab.id } });
				var users = JSON.parse(collab.attendies)
				var user_ping = users.map(id => `<@${id}>`).join(', ');
				client.channels.cache.get(config.channel_ids.COLLAB_ALERT_ID).send({ content: user_ping + "\n# Collab \"" + collab.game + "\" starts in 1 HOUR or less.\nIF you cannot attend, please remove yourself from the attendees list [here](https://discord.com/channels/" + config.information.GUILD_ID + "/" + config.channel_ids.COLLAB_CHANNEL_ID + "/" + collab.messageID + ")" })
			}
		}
	}
}