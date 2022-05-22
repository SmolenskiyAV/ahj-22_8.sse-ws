/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable no-alert */

const backendURL = 'http://localhost:7070/'; // АДРЕС СЕРВЕРА

export default function sendHttpRequest(xhr, method, marker, data) { // функция отправки запроса
  xhr.open(`${method}`, `${backendURL}?method=${marker}`);
  if ((method === 'POST') && (marker === 'statusTicket')) {
    xhr.send(JSON.stringify(data));
  } else {
    xhr.send(data);
  }
}

export function clearFormFields(formElement) { // функция очистки полей формы
  formElement.querySelector('input').value = '';
}

export function focusOnInput(chatWidgetInput) { // функция перевода фокуса в начало поля ввода
  chatWidgetInput.focus(); // на поле непосредственно
  chatWidgetInput.selectionStart = chatWidgetInput.value.length; // в начало поля
}

export function serverAnswer(xhr, answer) { // функция визуализации ответа сервера на стороне клиента
  alert(`answer = ${answer}`);
  console.log('response = ', xhr.response);
}
