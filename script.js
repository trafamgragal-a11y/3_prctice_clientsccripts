'use strict';

const USERS_URL = 'https://jsonplaceholder.typicode.com/users';
const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';

const loadBtn = document.getElementById('load-users-btn');
const searchInput = document.getElementById('search-input');
const statusEl = document.getElementById('status-message');
const usersList = document.getElementById('users-list');
const postsArea = document.getElementById('posts-area');

let allUsers = [];

function setStatus(text, type = '') {
  statusEl.textContent = text;
  statusEl.className = 'status-message' + (type ? ' ' + type : '');
}

async function loadUsers() {
  loadBtn.disabled = true;               
  setStatus('Загрузка...', 'loading');  

  try {
    const response = await fetch(USERS_URL);

    if (!response.ok) {                 
      throw new Error('HTTP-ошибка ' + response.status);
    }

    const data = await response.json();
    allUsers = data;                     
    renderUsers(allUsers);
    setStatus('');                      
  } catch (err) {
    setStatus(
      'Не удалось загрузить пользователей: ' + err.message + '. Нажмите кнопку ещё раз.',
      'error'
    );
  } finally {
    loadBtn.disabled = false;           
  }
}


function renderUsers(users) {
  usersList.textContent = '';           

  users.forEach(function (user) {
    const card = document.createElement('div');
    card.className = 'user-card';

    const name = document.createElement('h3');
    name.textContent = user.name;

    const email = document.createElement('p');
    email.textContent = user.email;

    const city = document.createElement('p');
    city.textContent = user.address.city;

    const postsBtn = document.createElement('button');
    postsBtn.type = 'button';
    postsBtn.className = 'btn-posts';
    postsBtn.textContent = 'Показать публикации';
    postsBtn.addEventListener('click', function () {
      loadPosts(user.id, postsBtn);
    });

    card.append(name, email, city, postsBtn);
    usersList.appendChild(card);
  });
}

function handleSearch() {
  if (allUsers.length === 0) {
    setStatus(
      searchInput.value.trim() === '' ? '' : 'Сначала загрузите пользователей',
      'info'
    );
    return;
  }

  const query = searchInput.value.trim().toLowerCase();

  const filtered = query
    ? allUsers.filter(function (u) {
        return u.name.toLowerCase().includes(query);   // регистронезависимо
      })
    : allUsers;

  renderUsers(filtered);

  if (query && filtered.length === 0) {
    setStatus('Пользователи не найдены', 'info');
  } else {
    setStatus('');
  }
}

async function loadPosts(userId, btn) {
  btn.disabled = true;
  setStatus('Загрузка...', 'loading');

  try {
    const response = await fetch(POSTS_URL + '?userId=' + userId);

    if (!response.ok) {
      throw new Error('HTTP-ошибка ' + response.status);
    }

    const posts = await response.json();
    renderPosts(posts.slice(0, 3));     
    setStatus('');
  } catch (err) {
    setStatus('Не удалось загрузить публикации: ' + err.message, 'error');
  } finally {
    btn.disabled = false;                
  }
}

function renderPosts(posts) {
  postsArea.textContent = '';           

  if (posts.length === 0) {
    const p = document.createElement('p');
    p.className = 'posts-placeholder';
    p.textContent = 'У пользователя нет публикаций.';
    postsArea.appendChild(p);
    return;
  }

  posts.forEach(function (post) {
    const card = document.createElement('article');
    card.className = 'post-card';

    const title = document.createElement('h4');
    title.textContent = post.title;

    const body = document.createElement('p');
    body.textContent = post.body;

    card.append(title, body);
    postsArea.appendChild(card);
  });
}

loadBtn.addEventListener('click', loadUsers);
searchInput.addEventListener('input', handleSearch);