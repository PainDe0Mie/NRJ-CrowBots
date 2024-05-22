const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection, generateDependencyReport } = require('@discordjs/voice');
const sodium = require('libsodium-wrappers');
const { token } = require("./config.json")

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ]
});

const prefix = ";";

// Initialisation de sodium avant de démarrer le client
(async () => {
  await sodium.ready;
})();

client.on("messageCreate", async message => {
  if (message.content === `${prefix}help`) {
    let embed = new MessageEmbed()
      .setTitle("Listes de commandes:")
      .setColor("RED")
      .addField(`\`${prefix}join\``, `Diffuse NRJ dans votre salon vocal, le bot y restera jusqu'à ce que vous le fassiez quitter`)
      .addField(`\`${prefix}leave\``, `Fait déconnecter le bot`)
      .setFooter(`- NRJ Radio`, message.client.user.displayAvatarURL({ dynamic: true }));

    let button0 = new MessageButton()
      .setStyle('LINK')
      .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=274914920512&scope=bot`)
      .setLabel('📥・Invite moi');

    let row = new MessageActionRow()
      .addComponents(button0);

    await message.reply({ embeds: [embed], components: [row] });
  }
});

client.on('messageCreate', async message => {
  if (!message.guild) return;

  if (message.content === `${prefix}leave`) {
    if (message.member.voice.channel) {
      const connection = getVoiceConnection(message.guild.id);
      if (connection) {
        connection.destroy();
        message.react("✔");
        await message.reply(`📻 - J'ai bien quitté: ${message.member.voice.channel} !`);
      } else {
        message.reply('🔊 - *Je ne suis pas connecté à un vocal...*');
      }
    } else {
      message.reply('🔊 - *Tu dois être dans un vocal...*');
    }
  }
});

client.on('messageCreate', async message => {
  if (!message.guild) return;

  if (message.content === `${prefix}join`) {
    if (message.member.voice.channel) {
      const connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: true
      });

      const player = createAudioPlayer();
      const resource = createAudioResource("http://cdn.nrjaudio.fm/audio1/fr/30001/aac_64.mp3");

      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Playing, () => {
        message.react("✔");
        message.reply(`📻 - **La Radio** est bien lancé dans: ${message.member.voice.channel} !`);
      });

      player.on('error', error => {
        console.error(error);
        message.reply("*Y'a eu un bug en lisant l'audio...*");
      });
    } else {
      message.reply("🔊 - *Tu dois être dans un vocal...*");
    }
  }
});

client.on("ready", () => {
  console.log(`${client.user.username} est on !`);
  //console.log(generateDependencyReport()); // Cela affichera les informations de dépendance pour le débogage
  client.user.setActivity(`NRJ | Prefix: [;]`, {
    type: "LISTENING"
  });
});

client.login(token)