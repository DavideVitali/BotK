'use strict';

const { Client, MessageEmbed } = require('discord.js');
const TextHelper = require('./src/_textModules/textHelper.js');
const BotK = require('./src/botk.js')
const MongoClient = require('mongodb').MongoClient;

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
    var inputArgs = message.content.split(' ');
    var botCommandLine = new Object();
    botCommandLine.command = inputArgs[0];
    var optionArgs = inputArgs.slice(1);

    if (botCommandLine.command && botCommandLine.command.toUpperCase() == 'BK')
    {
        for (let i = 0; i < optionArgs.length; i++)  {
            if (optionArgs[i].substring(0, 1) !== '-') {
                botCommandLine.error = (String(optionArgs[i]) + " non è un'opzione valida.");
                validEntry = false;
            } else {
                var option = optionArgs[i].substring(1).split(':');
                if (!option[1]) {
                    botCommandLine[option[0]] = '';
                } else {
                    botCommandLine[option[0]] = option[1];
                }
            }
            if (validEntry == false) { break; }
        }
    
        if (validEntry == true) {
            
            try {
                const bot = new BotK(botCommandLine, message.author.id);

                bot.Exec()
                .then(result => {
                    message.channel.send(embeddedMessage(colorContext.success, result))
                })
                .catch(error => {
                    message.channel.send(embeddedMessage(colorContext.error, error))
                });
            } catch (error) {
                message.channel.send(embeddedMessage(colorContext.error, error))
            }
        } else {
            message.channel.send(embeddedMessage(colorContext.error, parsedArgs.error));
        }
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