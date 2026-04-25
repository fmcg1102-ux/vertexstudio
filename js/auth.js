const DEMO_CREDENTIALS = {
  email: 'demo@vertexstudio.tech',
  password: 'demo123'
};

const SESSION_KEY = 'vs_auth';

function guardPage() {
  if (sessionStorage.getItem(SESSION_KEY) !== 'true') {
    window.location.href = 'login.html';
  }
}

function handleLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const email    = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('loginError');

  if (
    email    === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password
  ) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    window.location.href = 'dashboard.html';
  } else {
    errorEl.textContent = 'Invalid email or password. Try the demo credentials below.';
    errorEl.hidden = false;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', handleLoginSubmit);
  }
});
