/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */

class WSMessage {
  constructor(type, userName, body) {
    this.type = type;
    this.name = userName;
    this.body = body;
  }
}

export function userRemove(idValue) { // функция удаления пользователя из DOM
  const element = document.getElementById(`${idValue}`);
  element.remove();
}

export default function messageAdd(chatWidgetMessages, userNameValue, messageValue, timeStampValue, idValue) { // функция ДОБАВЛЕНИЯ СООБЩЕНИЯ в чат
  let ownBlockMarker = '';
  let ownMessageMarker = '';
  let userName = userNameValue;

  if (userNameValue === localStorage.getItem('userName')) {
    userName = 'You';
    ownBlockMarker = ' you_upper_block';
    ownMessageMarker = ' you_message__text';
  }

  chatWidgetMessages.insertAdjacentHTML('beforeend', `
    <div class="message" id="${idValue}">
      <div class="upper_block${ownBlockMarker}">
        <div class="_message__user">${userName},</div>
        <div class="message__date">${timeStampValue}</div>
      </div>
      <div class="message__text${ownMessageMarker}">${messageValue}</div>
    </div>`); // добавление нового DOM-элемента, являющегося сообщением чата

  chatWidgetMessages.parentElement.scrollTop = chatWidgetMessages.parentElement.scrollHeight; // автопрокрутка скрол-бара окна чата вниз до последнего сообщения
}

export function userAdd(userWidgetArea, userNameValue) { // функция ДОБАВЛЕНИЯ ИМЕНИ ПОЛЬЗОВАТЕЛЯ в чат
  let ownUserMarker = '';
  let userName = userNameValue;

  if (userNameValue === localStorage.getItem('userName')) {
    userName = 'You';
    ownUserMarker = ' you_user-widget__name';
  }

  userWidgetArea.insertAdjacentHTML('beforeend', `
    <div class="user-widget">
      <div class="user-widget__avatar"></div>
      <div class="user-widget__name${ownUserMarker}">${userName}</div>
    </div>`); // добавление нового DOM-элемента, являющегося аватаром пользователя чата

  userWidgetArea.scrollTop = userWidgetArea.scrollHeight; // автопрокрутка скрол-бара окна списка вниз до последнего имени
}

export function requestWS(ws, requestType, userName, messageBody) { // ОТПРАВКА ЗАПРОСА НА СЕРВЕР
  const packetName = new WSMessage(requestType, userName, messageBody);
  const message = JSON.stringify(packetName);
  ws.send(message);
}
