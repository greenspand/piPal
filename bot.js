var TelegramBot = require('node-telegram-bot-api');
var Rx = require('rxjs/Rx');
var lights = require('./philipsHue');
var utils = require('./utils');
var request = require('request');

var TOKEN = '230142293:AAEn6bVv_7-il-XmGcR9e8rMaHRnq3O1RYs';
var USER = 'iot_home_bot';


var options = {
  polling: true
};

var token = process.env.TELEGRAM_BOT_TOKEN || TOKEN;

var bot = new TelegramBot(token, options);
bot.getMe().then(function(me) {
  console.log('Hi my name is %s!', me.username);
});

// Matches lights
bot.onText(/\/lights/, function(msg) {
  var chatId = msg.chat.id;
  var opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['Yes, turn the lights on !', 'No, turn the lights off !']
      ],
      //one_time_keyboard: false,
      resize_keyboard: true
        //  force_reply: true
    })
  };
  bot.sendMessage(chatId, 'Do you want to turn the lights on or off?',
    opts).then(function(resp) {
    console.log('Response: ' + resp.text);
    var messageId = resp.message_id;
    bot.onReplyToMessage(chatId, messageId, resp.text);
  });
});


// Any kind of message
bot.on('message', function(msg) {
  var chatId = msg.chat.id;
  var data = msg.entities;
  console.log(data);
  bot.sendMessage(chatId, "Option selected");
});


// Matches /photo
bot.onText(/\/photo/, function(msg) {
  var chatId = msg.chat.id;
  // From file
  var photo = __dirname + '/../test/bot.gif';
  bot.sendPhoto(chatId, photo, {
    caption: "I'm a bot!"
  });
});

// Matches /audio
bot.onText(/\/audio/, function(msg) {
  var chatId = msg.chat.id;
  var url =
    'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg';
  // From HTTP request!
  var audio = request(url);
  bot.sendAudio(chatId, audio)
    .then(function(resp) {
      // Forward the msg
      var messageId = resp.message_id;
      bot.forwardMessage(chatId, chatId, messageId);
    });
});

// Matches /love
bot.onText(/\/love/, function(msg) {
  var chatId = msg.chat.id;
  var opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['Yes, you are the bot of my life ❤'],
        ['No, sorry there is another one...']
      ]
    })
  };
  bot.sendMessage(chatId, 'Do you love me?', opts);
});

bot.onText(/\/echo (.+)/, function(msg, match) {
  var chatId = msg.chat.id;
  var resp = match[1];
  bot.sendMessage(chatId, "helloe echop");
});
