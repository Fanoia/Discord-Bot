const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('STAFF ONLY: View the profile of a spificied user')
		.addUserOption(option => option.setName('user').setDescription('The URL of the clip').setRequired(false)),

	async execute(interaction) {
		await interaction.deferReply();
		const user = interaction.user;
		const member = interaction.member;
		if (!member.roles.cache.has('1222224010813767690')){
			await interaction.editReply('**THIS IS A STAFF ONLY COMMAND**');
		}
		else {
			
			const user2 = interaction.options.getUser('user')
			const member2 = interaction.options.getMember('user')
			if (user2) {
			if (member2.roles.cache.has('1222224010813767690')) {
				const embed = new EmbedBuilder()
					.setColor(0x32CD32)
					.setTitle('Profile')
					.addFields(
						{ name: 'Username', value: `${user2.username}`, inline: true },
					{ name: 'ID', value: `${user2.id}`, inline: true },
					{ name: 'Created At', value: `${user2.createdAt}`, inline: true },
					{ name: 'Joined At', value: `${member2.joinedAt}`, inline: true },
					{ name: 'Badges', value: `${await BadgeCheck(user2)}`, inline: true },
					{ name: "Roles", value: `${member2.roles.cache.map(role => role.toString()).join(", ")}` },
					)
					.setThumbnail(`https://cdn.discordapp.com/avatars/${user2.id}/${user2.avatar}.png?size=1024`)
					await interaction.editReply({ embeds: [embed] });
			}
			else if (member2.roles.cache.has(config.role_ids.FANOIA_TALENT_ROLE_ID)) {
				const embed = new EmbedBuilder()
					.setColor(0xCD3280)
					.setTitle('Profile')
					.addFields(
						{ name: 'Username', value: `${user2.username}`, inline: true },
					{ name: 'ID', value: `${user2.id}`, inline: true },
					{ name: 'Created At', value: `${user2.createdAt}`, inline: true },
					{ name: 'Joined At', value: `${member2.joinedAt}`, inline: true },
					{ name: 'Badges', value: `${await BadgeCheck(user2)}`, inline: true },
					{ name: "Roles", value: `${member2.roles.cache.map(role => role.toString()).join(", ")}` },
					)
					.setThumbnail(`https://cdn.discordapp.com/avatars/${user2.id}/${user2.avatar}.png?size=1024`)
					await interaction.editReply({ embeds: [embed] });
			}
			
		} else{
			const embed = new EmbedBuilder()
				.setColor(0xCD3280)
				.setTitle('Profile')
				.addFields(
					{ name: 'Username', value: `${user.username}`, inline: true },
					{ name: 'ID', value: `${user.id}`, inline: true },
					{ name: 'Created At', value: `${user.createdAt}`, inline: true },
					{ name: 'Joined At', value: `${member.joinedAt}`, inline: true },
					{ name: 'Badges', value: `${await BadgeCheck(user)}`, inline: true },
				)
				.setThumbnail(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024`)
				await interaction.editReply({ embeds: [embed] });
		}
	}
	},
};

async function BadgeCheck(user){
	const badges = user.flags.toArray();
	console.log(badges)
	let badgeImageURIs = [];
	if (badges.includes('HypeSquadOnlineHouse1')) {
		badgeImageURIs.push("Hype Squad Bravery Badge")
	}
	if (badges.includes('HypeSquadOnlineHouse2')) {
		badgeImageURIs.push("Hype Squad Brilliance Badge")
	}
	if (badges.includes('HypeSquadOnlineHouse3')) {
		badgeImageURIs.push("Hype Squad Balance Badge")
	}
	return new Promise((resolve, reject) => {
		resolve(badgeImageURIs.join('\n'))
	})

}