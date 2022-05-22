/* eslint-disable no-restricted-globals */
/* eslint-disable max-len */
/* eslint-disable no-return-await */
/* eslint-disable consistent-return */
/* eslint-disable no-unreachable */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
// const { timeStamp } = require('console');
const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');
const cors = require('koa-cors'); // npm install koa-cors
const { streamEvents } = require('http-event-stream');
const { stringify } = require('querystring');
const { v4: uuidv4 } = require('uuid');

const app = new Koa();

const WS = require('ws');
const { timeStamp } = require('console');

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());
const wsServer = new WS.Server({ server });

const chatStorage = [ // целевой массив данных сообщений чата
  {
    id: '61112920',
    name: 'Alexandra',
    message: 'I can\'t sleep...',
    created: '23:04 20.03.19',
  },
  {
    id: '61112921',
    name: 'Tony',
    message: 'Listen this: https://youtu.be/xxxxxx',
    created: '23:10 20.03.19',
  },
  {
    id: '61112922',
    name: 'Alexandra',
    message: 'Txx!!! You help me! I listen this music 1 hour and I sleep. Now is my favorite music!!!',
    created: '01:15 21.03.19',
  },
  {
    id: '61112923',
    name: 'Petr',
    message: 'I subscribed just for that &#128513; &#128513; &#128513;',
    created: '01:25 21.03.2019',
  }];

const chatUsers = [{ name: 'Alexandra' }, { name: 'Petr' }, { name: 'Ivan' }];

let newMessage = {};

function getTimeStamp() { // получить текущую дату и время в нужном формате
  const date = new Date();
  const day = date.getDate();
  let month = date.getMonth() + 1;
  if (month < 10) month = `0${month}`; // добавляем ноль для одноразрядных значений
  const year = String(date.getFullYear()).substring(2);
  const hour = date.getHours();
  let minutes = date.getMinutes();
  if (minutes < 10) minutes = `0${minutes}`; // добавляем ноль для одноразрядных значений
  const result = `${hour}:${minutes} ${day}.${month}.${year}`;
  return result;
}

function pushResponse(ctx, value, dataArray = null) { // функция отправки ответа на клиент
  ctx.response.set('Access-Control-Expose-Headers', 'X-MARKER'); // разрешаем доступ к кастомному заголовку 'X-MARKER' в браузере клиента
  ctx.set('X-MARKER', value);
  if (dataArray !== null) {
    ctx.response.body = dataArray;
  } else {
    ctx.response.body = 'empty data';
  }
}

function addMessageItem(nameValue, messageValue) { // функция добавления нового сообщения в целевой массив
  const newItem = {
    id: uuidv4(),
    name: nameValue,
    message: messageValue,
    created: getTimeStamp(),
  };
  newMessage = newItem;
  chatStorage.push(newItem);
}

function findUser(nameValue) { // функция поиска имени пользователя среди уже имеющихся
  let result = null;
  chatUsers.forEach((item, index) => {
    if (item.name === `${nameValue}`) {
      result = index;
    }
  });
  return result;
}

function delUserItem(index) { // функция удаления пользователя
  chatUsers.splice(index, 1);
}

function addUserItem(nameValue) { // функция добавления пользователя
  const newUser = { name: nameValue };
  chatUsers.push(newUser);
}

app.use(cors()); // обработка CORS POLICY

app.use(koaBody({
  urlencoded: true,
  multipart: true, // включим поддержку обработки multipart (приём файлов)
  json: true,
}));

class WSMessage {
  constructor(type, userName, body, created, id) {
    this.type = type;
    this.name = userName;
    this.body = body;
    this.created = created;
    this.id = id;
  }
}

function responseWS(ws, requestType, userName, messageBody, created, id) { // ОТПРАВКА ОТВЕТА КЛИЕНТУ
  let message = '';
  let packetName = '';

  const errCallback = (err) => {
    if (err) {
      console.log('ERR: ', err); // TODO: handle error
    }
  };

  packetName = new WSMessage(requestType, userName, messageBody, created, id);
  message = JSON.stringify(packetName);

  if (requestType === 'new message added!') {
    Array.from(wsServer.clients) // сообщения всем подключенным клиентам
      .filter((o) => o.readyState === WS.OPEN)
      .forEach((o) => o.send(message, errCallback));
  } else {
    ws.send(message, errCallback); // сообщение одному клиенту
  }
}

wsServer.on('connection', (ws, req) => { // обработка забросов от клиента
  let content = ''; // содержимое запроса, принятого от клиента

  ws.on('message', (msg) => {
    console.log('new request resived!');
    content = JSON.parse(msg.toString());
    const { type } = content;
    const { name } = content;
    const { body } = content;
    console.log('Type: ', type);
    console.log('Name: ', name);
    console.log('------------------');

    switch (type) {
      case 'addName': // запрос клиента на подключение к Чату
        if (findUser(name) === null) {
          addUserItem(name);
          responseWS(ws, 'nameAdded', name);
          console.log('new name added!!!');
          console.log('*********************');
        } else {
          responseWS(ws, 'invalidName', name);
          console.log('name rejected!!!');
          console.log('*********************');
        }
        return;
      case 'allMessages': // запрос клиента на загрузку с сервера всех сообщений чата
        responseWS(ws, 'allMessages', 'SERVER', JSON.stringify(chatStorage));
        console.log(`all chat-messages was pushed for user: ${name}`);
        console.log('*********************');
        return;
      case 'allUsers': // запрос клиента на загрузку с сервера всех сообщений чата
        responseWS(ws, 'allUsers', 'SERVER', JSON.stringify(chatUsers));
        console.log(`all chat-users list was pushed for user: ${name}`);
        console.log('*********************');
        return;
      case 'addMessage': // запрос клиента на добавление в чат нового сообщения
        addMessageItem(name, body);
        responseWS(ws, 'new message added!', 'SERVER', JSON.stringify(newMessage));
        console.log(`user ${name} add new message`);
        console.log('*********************');
        return;
      default:
        console.log('fuckOff!');
    }
  });

  responseWS(ws, 'helloClient', 'SERVER', 'welcome, Client ;)'); // первый ответ сервера клиенту при установлении ws-соединения
  console.log('==================');
  console.log('Connection established');
  console.log('==================');
});

server.listen(port);
