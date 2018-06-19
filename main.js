const axios = require('axios');
const Discord = require('discord.js');
const _ = require('lodash');

// Check if the config exists
try {
  var options = require('./config/config').options;
} catch(error) {
  console.log('\x1b[41m%s\x1b[0m', '\nMake sure you copy/rename config.js.example to config.js!\n');
}

// Create Discord client instance
const client = new Discord.Client();

/**
 * Get the players.json
 */
const getPlayers = async server => {
  try {
    return axios.get(`${server}/players.json`, { responseType: 'json', timeout: 10000 });
  } catch(e) {
    console.log(e);
  }
};

/**
 * Connect to Discord
 */
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!\nIf this is your first time connecting, use https://discordapp.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=67176464&scope=bot to authorize your bot for your server.`);
});

/**
 * Poll the servers every X seconds
 */
client.setInterval(async () => {
  
  // Populate the servers array with data from players.json
  const servers = [];
  let total = 0;
  for (const server of options.servers) {
    let players = await getPlayers(`${server.url}/players.json`);
    servers.push({
      name: server.name,
      count: players.data.length,
    });
    total =+ players.data.length;
  };
  
  // Generate the topic string
  const counts = [];
  for (const value of servers) {
    counts.push(`${value.name}: ${value.count}`);
  }
  counts.push(`Total: ${total}`);
  const topic = counts.join(' | ');

  // Set topics for set channels
  for (const channel of options.topicChannels){
    try {
      client.channels.find('name', channel).setTopic(topic);
    } catch(error){
      console.log(error);
    }
  }
}, options.pollRate * 1000);

/**
 * ![server name] commands, messages the player list for the current channel
 */
client.on('message', message => {

  // Ignore other than legit commands
  if(message.channel.type !== 'text' || message.member === null || !message.content.startsWith('!')) {
    return false;
  }

  // Check if the messager has the required role
  let foundRole = false;
  for (const role of options.roles) {
    if (message.member.roles.find("name", role)){
      foundRole = true;
      break;
    }
  }
  if (!foundRole) {
    return false;
  }

  // Parse the command and find a matching server from options array
  const rawCommand = String(message.content).substr(1).trim().toLowerCase().replace(/ /g,'');
  const server = options.servers.find(k => k.name.toLowerCase().replace(/ /g, '') === rawCommand || k.alias.toLowerCase().replace(/ /g, '') === rawCommand);

  if (server) {
    getPlayers(server.url).then(response => {
      let block = [_.startCase(_.toLower(server.name)) + " (" + response.data.length + "/32)", "---"];
      for (let player of response.data) {
        let playerId = _.padStart(player.id, 2);
        block.push("[" + playerId + "] " + player.name + " : " + player.identifiers[0]);
      }
      message.channel.send(block.concat("\n"), {code: true});
    }).catch(error => {
      console.log(error)
    });
  } else {
    return;
  }
});

// Log in
client.login(options.token);
