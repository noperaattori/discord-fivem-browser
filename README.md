# discord-fivem-browser

A proper README coming soon.

### Quick start

1. Copy/rename `config.js.example` to `config.js`
2. Create a bot user in Discord developer website and copy it's token to config.js
3. Follow the instructions in the console to authorize the bot on your server
4. Make sure the bot has `manage-channels` and `read/send message` permissions

### Installation
```
npm install
node main.js
```
### Usage
The bot automatically updates the topics in the channels set in the config.js

To see the playerlist, type `![server name]`, for example `!server1`. This requires role(s) set in the config.js

Feel free to add issues or better yet, do pull requests

Run the bot on `Node.js v10.4.1` and use [Forever](https://github.com/foreverjs/forever) to run it, as the Discord.js crashes occasionally.
