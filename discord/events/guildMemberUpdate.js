const { Events, EmbedBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember, client) {
        //User gets role added
        console.log("FIRED Guild Member Update Event")

        // User got role added
        if (newMember.roles.cache.size > oldMember.roles.cache.size) {
            // Check if the Talent Role was added to the user and ping in the talent channel to let them know.
            if (newMember.roles.cache.has('1222855985136144465') && !oldMember.roles.cache.has('1222855985136144465')) {
                const embed = new EmbedBuilder()
                    .setColor(0xCD3280)
                    .setTitle('**Welcome to FanoiaEN** 🎉')
                    .addFields(
                        { name: 'Information!', value: `Welcome to FanoiaEN! You have been given the <@&1222855985136144465> role!
                        This role gives you access to the Talent related channels!`, inline: true },
                    )
                    
                    await client.channels.cache.get('1223276181244084395').send({ content: "<@" + newMember.id + ">", embeds: [embed] })
            }
        }
    }
}