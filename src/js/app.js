/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable no-alert */
/* eslint-disable max-len */
/* eslint-disable no-plusplus */

import sendHttpRequest, { clearFormFields, focusOnInput } from './base';
// import { body } from 'koa/lib/response';
import messageAdd, { userRemove, userAdd, requestWS } from './actions';
// import response from 'koa/lib/response';

const backendWS = 'ws://localhost:7070/ws'; // АДРЕС WebSocket-СЕРВЕРА

document.addEventListener('DOMContentLoaded', () => { // помещаем addEventlistener внутрь обратной функции - для успешного прохождения тестов Jest
  const btnContinue = document.getElementById('continue'); // кнопка "ПРОДОЛЖИТЬ"
  const AddUserNameForm = document.getElementById('Add_UserName_Form'); // форма "Выберите Псевдоним"
  const AddForm = document.getElementById('AddForm');
  const chatWidgetInput = document.getElementById('chat-widget__input'); // поле ввода сообщений чата
  const warningBanner = document.querySelector('.warning__banner');
  const chatWidgetMessages = document.getElementById('chat-widget__messages'); // окно, содержащее все сообщения чата
  const userWidgetArea = document.getElementById('user-widget_area'); // окно, содержащее список всех участников чата

  AddUserNameForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
  });

  let openedWs = false; // маркер активного открытого ws-соединения
  let userName = ''; // имя пользователя
  let userMessage = ''; // сообщение, введённое пользователем чата
  let userFullMessage = {}; // ранее ведённое сообщение, полученного с сервера
  let chatStorage = []; // весь массив сообщений
  let сhatUsers = []; // весь массив имён пользователей

  let ws = new WebSocket(backendWS);
  ws.binaryType = 'blob'; // arraybuffer

  ws.addEventListener('open', () => { // открытие ws-соединения с сервером
    if (ws.readyState === WebSocket.OPEN) {
      console.log('ws-connect successfull!');
      openedWs = true;
      // After this we can send messages
      requestWS(ws, 'helloServer', userName, 'hello, Server!');
    }
  });

  ws.addEventListener('message', (evt) => { // обработка принятых с сервера данных
    console.log('new response resived!');
    const content = JSON.parse(evt.data);
    const { type } = content;
    const resivedName = content.name;
    const { body } = content;
    const resivedCreated = content.created;
    const resivedId = content.id;

    switch (type) {
      case 'helloClient': // служебный ответ сервера
        console.log(resivedCreated, '  ', body);
        console.log('----------------------');
        return;
      case 'invalidName': // "такое имя уже есть!"
        clearFormFields(AddForm);
        userName = '';
        warningBanner.classList.remove('display_none');
        return;
      case 'nameAdded': // "пользователь добавлен в Чат"
        clearFormFields(AddForm);
        userName = resivedName;
        localStorage.setItem('userName', userName); // запись имени пользователя в локальное хранилище
        warningBanner.classList.add('display_none');
        AddUserNameForm.classList.add('display_none');
        console.log(`User ${resivedName} was joined to the Chat.`);
        requestWS(ws, 'allMessages', resivedName);
        requestWS(ws, 'allUsers', resivedName);
        return;
      case 'allMessages': // получены все сообщения, хранящиеся на сервере
        chatStorage = JSON.parse(body);

        for (let m = 0; m < chatStorage.length; m++) { // отрисовка всех сообщений, полученных с сервера
          const { name } = chatStorage[m];
          const { message } = chatStorage[m];
          const { created } = chatStorage[m];
          messageAdd(chatWidgetMessages, name, message, created);
        }

        return;
      case 'allUsers': // получен список всех участников чата, хранящийся на сервере
        сhatUsers = JSON.parse(body);

        for (let u = 0; u < сhatUsers.length; u++) { // отрисовка списка всех пользователей, полученных с сервера
          const { name } = сhatUsers[u];
          const { message } = сhatUsers[u];
          const { created } = сhatUsers[u];
          const { id } = сhatUsers[u];
          userAdd(userWidgetArea, name, message, created, id);
          focusOnInput(chatWidgetInput);
        }

        return;
      case 'new message added!': // получено от сервера(сохранённое на нём) введённое ранее сообщение
        userFullMessage = JSON.parse(body);
        const { name } = userFullMessage;
        const { message } = userFullMessage;
        const { created } = userFullMessage;
        messageAdd(chatWidgetMessages, name, message, created);
        return;
      case 'SomeOne user abandoned us!': // "один из пользователей покинул чат"

        userRemove(chatWidgetMessages, resivedId);
        focusOnInput(chatWidgetInput);
        return;

      default:
        console.log('fuckOff!');
    }
  });

  ws.addEventListener('close', (evt) => { // обработка закрытия ws-соединения с сервером
    if (evt.wasClean) {
      alert(`[close] Соединение закрыто чисто, код=${evt.code} причина=${evt.reason}`);
      openedWs = false;
    } else {
      // например, сервер убил процесс или сеть недоступна
      // обычно в этом случае event.code 1006
      alert('[close] Соединение прервано');
      openedWs = false;
      console.log('WebSocket connection was failed! Trying reconnect...');
      setTimeout(() => {
        ws = new WebSocket(backendWS); // reconnect ws-соединения чрз 3 секунды
        console.log('Trying ws-reconnect now...');
      },
      3000);
    }
  // After this we can't send messages
  });

  /*
  ws.addEventListener('error', (error) => { // обработка ошибок ws-соединения с сервером
    alert(`[error] ${error.message}`);
  });
*/

  AddForm.querySelector('input').onchange = () => { //  обработка ввода сообщений в поле "ПСЕВДОНИМ"
    userName = AddForm.querySelector('input').value; // заполнение элемента данными, вводимыми через поле <input>
    AddForm.querySelector('input').value = ''; // очистка поля <input> после ввода имени
  };

  chatWidgetInput.onchange = () => { //  ОБРАБОТКА ВВОДА СООБЩЕНИЙ чата
    userMessage = chatWidgetInput.value;
    chatWidgetInput.value = '';
    requestWS(ws, 'addMessage', userName, userMessage);
  };

  AddUserNameForm.addEventListener('click', () => { // обработка формы "ВЫБЕРИТЕ ПСЕВДОНИМ"
    function handlerAdd() {
      if (!openedWs) {
        alert('Связь с сервером не установлена! Перезагрузи страницу.');
        return;
      }

      if (userName === '') {
        alert('Заполни поле!');
        return;
      }
      requestWS(ws, 'addName', userName);
      btnContinue.removeEventListener('click', handlerAdd);
    }
    btnContinue.addEventListener('click', handlerAdd); // нажата кнопка "ПРОДОЛЖИТЬ"
  });
});
