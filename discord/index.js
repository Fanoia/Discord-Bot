const { Client, Collection, GatewayIntentBits, EmbedBuilder, Embed } = require('discord.js');
const fs = require('node:fs');
const wait = require('node:timers/promises').setTimeout;
const express = require('express');
const crypto = require('crypto')
const app = express();
const moment = require('moment-timezone');
const bodyParser = require('body-parser');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const passport = require('passport');
const request = require('request');
const path = require('node:path');
require('dotenv').config();
const log = require('./logger.js');
const TOKEN = process.env.TOKEN;
const client = new Client({ intents: [GatewayIntentBits.Guilds , GatewayIntentBits.GuildMembers] });
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const ejs = require('ejs')
const querystring = require('node:querystring');
const session = require('express-session');
const { Sequelize, Op, DataTypes} = require('sequelize');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const SESSION_SECRET = config.information.SESSION_SECRET;





// Command Handler
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






//Event Handler
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

//Login
client.login(TOKEN);







//Twitch API (Talent Notifications)
let isConnectedAndSubbed = false;

let newConnectionNum = 0;
let taaccess_token = fs.readFileSync('./aaccesstoken.txt', 'utf8');
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
		taaccess_token = body.access_token
		fs.writeFileSync('./aaccesstoken.txt', body.access_token, 'utf8');
		log.debug("Refreshed token! " + body.access_token)
	  }
	})
  
  }




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

	if (req.rawHeaders[1] !== "events.fanoia.live") {
		res.status(502).send("Invalid Host.")
		return
	}
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
  // sendSubs()
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

 


// COLLABS Alert code.

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
		if (collab.time * 1000 <= Date.now() + 3600000) {
			if (!collab.hasAlerted) {
				await DBEdit2.update({ hasAlerted: true }, { where: { id: collab.id } });
				var users = JSON.parse(collab.attendies)
				var user_ping = users.map(id => `<@${id}>`).join(', ');
				client.channels.cache.get(config.channel_ids.COLLAB_ALERT_ID).send({ content: user_ping + "\n# Collab \"" + collab.game + "\" starts in 1 HOUR or less.\nIF you cannot attend, please remove yourself from the attendees list [here](https://discord.com/channels/" + config.information.GUILD_ID + "/" + config.channel_ids.COLLAB_CHANNEL_ID + "/" + collab.messageID + ")" })
			}
		}
	}
}



const act = express();




const DBEdit3 = fanoiadb.define("users",
    {
        discordId: Sequelize.STRING,
        username: Sequelize.STRING,
        nickname: Sequelize.STRING,
        avatar: Sequelize.STRING,
        talent: Sequelize.BOOLEAN,
        staff: Sequelize.BOOLEAN,
        approved: Sequelize.BOOLEAN,
        token: Sequelize.STRING,
        expires: Sequelize.DATE

    }
)
DBEdit3.sync();

const DiscordStrategy = require('passport-discord').Strategy;

const scopes = ['identify', 'email', 'guilds', 'guilds.members.read'];

passport.use(new DiscordStrategy({
    authorizationURL: 'https://discord.com/api/oauth2/authorize',
    clientID: config.information.CLIENT_ID,
    tokenURL: 'https://discord.com/api/v10/oauth2/token',
    clientSecret: config.information.CLIENT_SECRET,
    callbackURL: 'https://activity.fanoia.live/auth/discord/callback',
    scope: scopes, 
	prompt: "none"
},
async function(accessToken, refreshToken, data, profile, cb) {
	
	var options = {
		url: 'https://discord.com/api/users/@me/guilds/' + config.information.GUILD_ID + '/member',
		headers: {
			Authorization: 'Bearer ' + accessToken
		}
	}
	let talent = false;
	let staff = false;
	let rateLimit = false;
	
	await request.get(options, function(error, response, body) {
		if (error) {
			console.log(error)
		} else {
			if (JSON.parse(body).message == "You are being rate limited.") {
				rateLimit = true
				return
			}
			if (JSON.parse(body).roles.includes(config.role_ids.FANOIA_TALENT_ROLE_ID)) {
				talent = true
			}
			if (JSON.parse(body).roles.includes(config.role_ids.FANOIA_STAFF_ROLE_ID)) {
				staff = true
			}
		}
	})

    const found = await DBEdit3.findOrCreate({ where: { discordId: profile.id }, 
        defaults: {
            discordId: profile.id,
            username: profile.username,
            nickname: profile.global_name,
            avatar: profile.avatar,
            token: accessToken,
            expires: new Date().setMilliseconds(new Date().getMilliseconds() + data.expires_in),
            approved: false,
            staff: staff,
            talent: talent
        }})
    if (found) {
        DBEdit3.update({ token: accessToken, expires: new Date().setMilliseconds(new Date().getMilliseconds() + data.expires_in), staff: staff, talent: talent}, { where: { discordId: profile.id } })
    }

    return cb(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user); // Serialize the user ID into the session
  });


  passport.deserializeUser(function(user, done) {
    done(null, user);
});


act.use(express.static(path.join(__dirname, "public")))
.use(cors())
.use(cookieParser())
.use(session({secret: SESSION_SECRET, resave: false, saveUninitialized: false}))
.use(passport.initialize())
.use(passport.session())
.use(bodyParser.json())
.use(bodyParser.urlencoded({ extended: true }))
.use((req, res, next) => {
	const timezone = moment.tz.guess();
	req.timezone = timezone;
	next();
})
.use((req, res, next) => {
	if (req.session && req.session.passport) {
		var found = DBEdit3.findOne({ where: { discordId: req.session.passport.user.id } }) 
		if (found) {
			req.staff = found.staff
			req.talent = found.talent
		}
	}
	next();
});

act.set("view engine", "ejs");

act.get ('/', async (req, res) => {
	if(req.session && req.session.passport) {
        var html = await ejs.renderFile("views/indexl.ejs", {user: req.session.passport.user, request: request, config: config, wait: wait, async: true});
        res.send(html);
      } else {
        res.render("index");
      }
})

act.listen(port + 1, async () => {
	console.log(`Example app listening at http://localhost:${port + 1}`);
})

act.get('/login', passport.authenticate('discord', { prompt: "none" }));
act.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/#login_error', successRedirect: '/' }));

act.get('/logout', (req, res) => {
    var token = req.session.passport.user.accessToken
    req.logOut(function(err) {
        if (err) {
            console.log(err);
        } else {


            var options = {
                url: "https://discord.com/api/oauth2/token/revoke?token=" + token,
                headers:{
                    'Authorization': 'Basic ' + (new Buffer(config.information.CLIENT_ID+ ':' + config.information.CLIENT_SECRET).toString('base64'))
                }
            }

            console.log((new Buffer(config.information.CLIENT_ID+ ':' + config.information.CLIENT_SECRET).toString('base64')))
            request.post(options, function(error, response, body) {
                if (error) {
                    console.log(error)
                } else {
                    console.log(body)
                }
            })
            req.session.destroy(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/');
                }
              });
        }
      });
});


act.get('/collabs', async (req, res) => {
	if(req.session && req.session.passport) {
		var html = await ejs.renderFile("views/collabs.ejs", {user: req.session.passport.user, request: request, config: config, wait: wait, async: true, DBEdit2: DBEdit2});
		res.send(html);
	} else {
		res.status(403).redirect("/");
	}
})

act.get('/collabs/:id', async (req, res) => {
	if(req.session && req.session.passport) {
		var html = await ejs.renderFile("views/collab.ejs", {user: req.session.passport.user, request: request, config: config, wait: wait, async: true, DBEdit2: DBEdit2, id: req.params.id, timezone: req.timezone, moment: moment, DBEdit3: DBEdit3});
		res.send(html);
	} else {
		res.status(403).redirect("/");
	}
})

act.get('/join/:id', async (req, res) => {
	if(req.session && req.session.passport) {
		var found = await DBEdit2.findOne({ where: { messageID: req.params.id } })	
		if (found) {
			if (JSON.parse(found.attendies).indexOf(req.session.passport.user.id) !== -1) {
				res.redirect('/collabs/' + req.params.id)
				return
			}
			await DBEdit2.update({ attendies: JSON.stringify([...JSON.parse(found.attendies), req.session.passport.user.id]) }, { where: { messageID: req.params.id } })
			res.redirect('/collabs/' + req.params.id)
		} else {
			res.status(404).json({ error: "Collab not found, Please try again later!" });
		}
	}
})

act.get('/leave/:id', async (req, res) => {
	if(req.session && req.session.passport) {
		var found = await DBEdit2.findOne({ where: { messageID: req.params.id } })	
		if (found) {
			if (JSON.parse(found.attendies).includes(req.session.passport.user.id)) {
				if (found.makerUserID == req.session.passport.user.id) {
					res.status(403).json({ error: "You cannot leave your own collab! Please delete it via the discord channel." });
					return
				}
			await DBEdit2.update({ attendies: JSON.stringify([...JSON.parse(found.attendies), req.session.passport.user.id]) }, { where: { messageID: req.params.id } })
			res.redirect('/collabs/' + req.params.id)
			} else {
				res.status(403).json({ error: "You are not in this collab! Join it first!" });
			}
		} else {
			res.status(404).json({ error: "Collab not found, Please try again later!" });
		}
	}
})

