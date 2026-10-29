// !    Variables
const notification = document.querySelector('#notification');
const registerForm = document.querySelector('#registerForm');

// !    Functions

const showNotification = (message, type = 'success') => {
  notification.textContent = message;
  notification.className = type === 'error' ? 'show error' : 'show';

  setTimeout(() => {
    notification.className = 'hidden';
  }, 3000);
};

// !    Events

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.querySelector('#username');
  const password = document.querySelector('#password');

  let users = JSON.parse(localStorage.getItem('users')) || [];

  const isUser = users.find((user) => user.username === username.value);
  if (isUser) {
    showNotification('این کاربر قبلا ثبت نام کردده است', 'error');
    return;
  }

  users.push({ username: username.value, password: password.value });
  localStorage.setItem('users', JSON.stringify(users));
  showNotification('ثبت نام با موفقیت انجام شد');
});
