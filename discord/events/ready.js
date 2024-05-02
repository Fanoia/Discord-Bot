const { ActivityType, Events } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setStatus('dnd');
		StatusCycle(client)
		setInterval(StatusCycle, 370000, client);
	},
};

async function StatusCycle(client) {
	await client.user.setActivity("Fanoia Members! 👀 ", { type: ActivityType.Watching });
	await wait(120000);
	await client.user.setActivity("your Streams! 👀", { type: ActivityType.Watching });
	await wait(120000);
	await client.user.setActivity("with the Circuts! 👀", { type: ActivityType.Playing });
	await wait(120000);
}