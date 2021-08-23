// nodemon автоматически перезагружает сервер при каждом изменении в коде
// npm run dev

// TODO:
/*
  Сообщения отправляются в указанный chatid, а значит
  Необходимую инфу по созданным обменам дублировать в отдельный свой чат - chatID всегда известен
*/

const TelegramApi = require('node-telegram-bot-api');
const {gameOptions, againOptions} = require('./options')
const token = '1974197114:AAGOr9d7BbVuXMn13vgdhqlmwx1r2mes6rs';

const bot = new TelegramApi(token, {polling: true});

// аналог БД
const chats = {}

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, 'Я загадываю число от 1 до 5, а ты должен будешь его отгадать')
  const randomNumber = Math.floor(Math.random() * 10);
  // по id чата мы записываем рандомное число в массив
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Отгадывай', gameOptions);
}

const start = () => {
  // устанавливаем команды бота
  bot.setMyCommands([
    {command: '/start', description: 'Начальное приветствие'},
    {command: '/info', description: 'Получить информацию о пользователе'},
    {command: '/game', description: 'Сыграть в игру "Угадай число"'}
  ])

  // слушает событие на получение сообщений
  bot.on('message', async msg => {
    const text = msg.text; // вытаскиваем текста сообщения
    const chatId = msg.chat.id; // и id чата

    if (text === '/start') {
      // async, await, return связаны с асинхронностью
      // return в конце завершает выполнение кода
      await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.webp');
      return bot.sendMessage(chatId, `${msg.from.first_name}, Добро пожаловать в обменник криптовалюты!`);
    }
    if (text === '/info') {
      return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name}`);
    }
    if (text === '/game') {
      return startGame(chatId);
    }

    return bot.sendMessage(chatId, 'Я тебя не понял, напиши что-то ещё раз!')
    // bot.sendMessage(chatId, `Привет, ты написал мне: ${text}`); // отправляет сообщение
  })

  // слушает нажатие кнопок
  bot.on('callback_query', async msg => {
    const data = msg.data; // принимаю значение нажатой кнопки
    const chatId = msg.message.chat.id;
    if (data === '/again') {
      return startGame(chatId);
    }
    if (data === chats[chatId]) {
      return await bot.sendMessage(chatId, `Ты угадал! Цифра ${chats[chatId]}`, againOptions)
    } else {
      return await bot.sendMessage(chatId, `К сожалению цифра была ${chats[chatId]}`, againOptions)
    }
  })
}

start();
