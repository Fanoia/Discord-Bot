const { Events, EmbedBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember, client) {
        //User gets role added
        console.log("FIRED Guild Member Update Event")

        // User got role added
        if (newMember.roles.cache.size > oldMember.roles.cache.size) {
            // Check if the Talent Role was added to the user and ping in the talent channel to let them know.
            if (newMember.roles.cache.has(config.role_ids.FANOIA_TALENT_ROLE_ID) && !oldMember.roles.cache.has(config.role_ids.FANOIA_TALENT_ROLE_ID)) {
                const embed = new EmbedBuilder()
                    .setColor(0xCD3280)
                    .setTitle('**Welcome to FanoiaEN** 🎉')
                    .addFields(
                        { name: 'Information!', value: `Welcome to FanoiaEN! You have been given the <@&1222855985136144465> role!
                        This role gives you access to the Talent related channels!`, inline: true },
                    )
                    
                    await client.channels.cache.get(config.channel_ids.TALENT_CHANNEL_ID).send({ content: "<@" + newMember.id + ">", embeds: [embed] })
            }
            if (newMember.roles.cache.has(config.role_ids.FANOIA_STAFF_ROLE_ID) && !oldMember.roles.cache.has(config.role_ids.FANOIA_STAFF_ROLE_ID)) {
                const embed = new EmbedBuilder()
                    .setColor(0x32CD32)
                    .setTitle('**Welcome to FanoiaEN** 🎉')
                    .addFields(
                        { name: 'Information!', value: `Welcome to FanoiaEN! You have been given the <@&${config.role_ids.FANOIA_STAFF_ROLE_ID}> role!
                        This role gives you access to the Staff related channels!`, inline: true },
                    )
                    
                    await client.channels.cache.get(config.channel_ids.STAFF_CHANNEL_ID).send({ content: "<@" + newMember.id + ">", embeds: [embed] })
            }
        }
    }
}