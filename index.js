'use strict';

const { Client, MessageEmbed } = require('discord.js');
const TextHelper = require('./src/_textModules/textHelper.js');
const BotK = require('./src/botk.js')

// Create an instance of a Discord client
const client = new Client();

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
    var validEntry = true;
    var parsedArgs = message.content.split(' ');
    parsedArgs.command = parsedArgs[0];
    var args = parsedArgs.slice(1);
    for (var entry of args)  {
        if (entry.substring(0, 2) !== '--') {
            console.log(String(entry) + " non è un'opzione valida.");
            validEntry = false;
        } else {
            var option = entry.substring(2).split(':');
            if (!option[1]) {
                parsedArgs[option[0]] = '';
            } else {
                parsedArgs[option[0]] = option[1];
            }
        }
        if (validEntry == false) { break; }
    }

    if (validEntry == true) {
        const bot = new BotK(parsedArgs);
        bot.Exec()
        .then(result => {
            message.channel.send(embeddedMessage(colorContext.success, result))
        })
        .catch(error => {
            message.channel.send(embeddedMessage(colorContext.error, error))
        });
    }
});

const textHelper = new TextHelper();
client.login(textHelper.getSecrets().discord.token);

var embeddedMessage = function(color, text) {
  return new MessageEmbed()
        // Set the title of the field
        .setTitle('Bot K - Territory War Intelligence')
        // Set the color of the embed
        .setColor(color)
        // Set the main content of the embed
        .setDescription(text);
      // Send the embed to the same channel as the message
};

var colorContext = {
  "info": 0x0000ff,
  "success": 0x00ff00,
  "error": 0xff0000 
}