// !    Variables
const notification = document.querySelector('#notification');
const loginForm = document.querySelector('#loginForm');

// !    Fnctions
const showNotification = (message, type = 'success') => {
  notification.textContent = message;
  notification.className = type === 'error' ? 'show error' : 'show';

  setTimeout(() => {
    notification.className = 'hidden';
  }, 3000);
};

// !    Events

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;

  const users = JSON.parse(localStorage.getItem('users')) || [];

  const isUser = users.find(
    (user) => user.username === username && user.password === password,
  );

  if (isUser) {
    const token = btoa(
      JSON.stringify({
        username: username,
        exp: Date.now() + 86400000,
      }),
    );

    localStorage.setItem('token', token);
    localStorage.setItem('loggedUser', username);
    showNotification('با موفقیت وارد شدید');
    window.location.href = 'index.html';
  } else {
    showNotification('نام کاربری یا رمز عبور اشتباه است', 'error');
    return;
  }
});
