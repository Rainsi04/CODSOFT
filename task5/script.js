/* ===== QuizCraft — Online Quiz Maker =====
   Plain JS single-page app using localStorage for persistence.
*/

const STORAGE_USERS = 'quizcraft_users';
const STORAGE_QUIZZES = 'quizcraft_quizzes';
const STORAGE_SESSION = 'quizcraft_session';

// ---------- Storage helpers ----------
function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
}
function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}
function getQuizzes() {
  return JSON.parse(localStorage.getItem(STORAGE_QUIZZES) || '[]');
}
function saveQuizzes(quizzes) {
  localStorage.setItem(STORAGE_QUIZZES, JSON.stringify(quizzes));
}
function getSession() {
  return JSON.parse(localStorage.getItem(STORAGE_SESSION) || 'null');
}
function setSession(username) {
  localStorage.setItem(STORAGE_SESSION, JSON.stringify(username));
}
function clearSession() {
  localStorage.removeItem(STORAGE_SESSION);
}

// Seed a sample quiz the first time so Browse Quizzes isn't empty
function seedIfEmpty() {
  if (getQuizzes().length === 0) {
    const sample = {
      id: 'sample-1',
      title: 'World Capitals',
      description: 'A quick geography warm-up quiz.',
      author: 'QuizCraft',
      createdAt: Date.now(),
      questions: [
        {
          text: 'What is the capital of France?',
          options: ['Berlin', 'Paris', 'Madrid', 'Rome'],
          correctIndex: 1
        },
        {
          text: 'What is the capital of Japan?',
          options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'],
          correctIndex: 2
        },
        {
          text: 'What is the capital of Australia?',
          options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
          correctIndex: 2
        }
      ]
    };
    saveQuizzes([sample]);
  }
}

// ---------- Navigation ----------
const views = ['home', 'auth', 'create', 'list', 'take', 'results'];

function navigate(viewName) {
  views.forEach(v => {
    document.getElementById(`view-${v}`).classList.toggle('hidden', v !== viewName);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelector('.nav-links').classList.remove('open');

  if (viewName === 'create') {
    requireAuthOrRedirect(() => renderCreateView());
  }
  if (viewName === 'list') {
    renderQuizList();
  }
}

function requireAuthOrRedirect(onAuthed) {
  const session = getSession();
  if (!session) {
    navigate('auth');
    document.getElementById('loginMsg').textContent = 'Please sign in to create a quiz.';
    document.getElementById('loginMsg').className = 'form-msg error';
  } else {
    onAuthed();
  }
}

document.querySelectorAll('[data-nav]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    navigate(el.getAttribute('data-nav'));
  });
});

document.querySelector('.nav-toggle').addEventListener('click', () => {
  const links = document.querySelector('.nav-links');
  const expanded = links.classList.toggle('open');
  document.querySelector('.nav-toggle').setAttribute('aria-expanded', expanded);
});

// ---------- Auth ----------
function updateAuthNav() {
  const session = getSession();
  const link = document.getElementById('authNavLink');
  if (session) {
    link.textContent = `Sign Out (${session})`;
  } else {
    link.textContent = 'Sign In';
  }
}

document.getElementById('authNavLink').addEventListener('click', (e) => {
  if (getSession()) {
    e.preventDefault();
    clearSession();
    updateAuthNav();
    navigate('home');
  }
});

document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.getAttribute('data-tab');
    document.getElementById('loginForm').classList.toggle('hidden', target !== 'login');
    document.getElementById('registerForm').classList.toggle('hidden', target !== 'register');
  });
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value;
  const msg = document.getElementById('registerMsg');

  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    msg.textContent = 'That username is already taken.';
    msg.className = 'form-msg error';
    return;
  }
  users.push({ username, password });
  saveUsers(users);
  setSession(username);
  updateAuthNav();
  msg.textContent = 'Account created! You are signed in.';
  msg.className = 'form-msg success';
  setTimeout(() => navigate('home'), 700);
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const msg = document.getElementById('loginMsg');

  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  if (!user) {
    msg.textContent = 'Invalid username or password.';
    msg.className = 'form-msg error';
    return;
  }
  setSession(username);
  updateAuthNav();
  msg.textContent = 'Signed in successfully!';
  msg.className = 'form-msg success';
  setTimeout(() => navigate('home'), 500);
});

// ---------- Quiz creation ----------
let questionCount = 0;

function renderCreateView() {
  document.getElementById('quizForm').reset();
  document.getElementById('questionsContainer').innerHTML = '';
  document.getElementById('createMsg').textContent = '';
  questionCount = 0;
  addQuestionBlock();
  addQuestionBlock();
}

function addQuestionBlock() {
  questionCount++;
  const index = questionCount;
  const container = document.getElementById('questionsContainer');

  const block = document.createElement('div');
  block.className = 'question-block';
  block.dataset.index = index;
  block.innerHTML = `
    <div class="question-block-header">
      <span>Question ${index}</span>
      <button type="button" class="btn-danger remove-question">Remove</button>
    </div>
    <label>Question Text
      <input type="text" class="q-text" required placeholder="Enter your question">
    </label>
    <label>Answer Options (select the correct one)</label>
    ${[0, 1, 2, 3].map(i => `
      <div class="option-row">
        <input type="radio" name="correct-${index}" value="${i}" ${i === 0 ? 'checked' : ''} required>
        <input type="text" class="q-option" required placeholder="Option ${i + 1}">
      </div>
    `).join('')}
  `;
  container.appendChild(block);

  block.querySelector('.remove-question').addEventListener('click', () => {
    if (document.querySelectorAll('.question-block').length > 1) {
      block.remove();
    } else {
      alert('A quiz needs at least one question.');
    }
  });
}

document.getElementById('addQuestionBtn').addEventListener('click', addQuestionBlock);

document.getElementById('quizForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('quizTitle').value.trim();
  const description = document.getElementById('quizDescription').value.trim();
  const msg = document.getElementById('createMsg');

  const blocks = document.querySelectorAll('.question-block');
  const questions = [];

  for (const block of blocks) {
    const text = block.querySelector('.q-text').value.trim();
    const options = Array.from(block.querySelectorAll('.q-option')).map(o => o.value.trim());
    const correctRadio = block.querySelector('input[type="radio"]:checked');
    if (!text || options.some(o => !o) || !correctRadio) {
      msg.textContent = 'Please fill out every question completely.';
      msg.className = 'form-msg error';
      return;
    }
    questions.push({ text, options, correctIndex: parseInt(correctRadio.value, 10) });
  }

  const quizzes = getQuizzes();
  quizzes.push({
    id: 'quiz-' + Date.now(),
    title,
    description,
    author: getSession() || 'Anonymous',
    createdAt: Date.now(),
    questions
  });
  saveQuizzes(quizzes);

  msg.textContent = 'Quiz published successfully!';
  msg.className = 'form-msg success';
  setTimeout(() => navigate('list'), 700);
});

// ---------- Quiz listing ----------
function renderQuizList() {
  const grid = document.getElementById('quizGrid');
  const empty = document.getElementById('listEmpty');
  const quizzes = getQuizzes().sort((a, b) => b.createdAt - a.createdAt);

  grid.innerHTML = '';
  empty.classList.toggle('hidden', quizzes.length > 0);

  quizzes.forEach(quiz => {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.innerHTML = `
      <h3>${escapeHtml(quiz.title)}</h3>
      <p>${escapeHtml(quiz.description || 'No description provided.')}</p>
      <div class="quiz-meta">
        <span>${quiz.questions.length} question${quiz.questions.length === 1 ? '' : 's'}</span>
        <span>by ${escapeHtml(quiz.author)}</span>
      </div>
      <button class="btn btn-primary btn-block start-quiz-btn">Take Quiz</button>
    `;
    card.querySelector('.start-quiz-btn').addEventListener('click', () => startQuiz(quiz.id));
    grid.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Quiz taking ----------
let activeQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];

function startQuiz(quizId) {
  const quiz = getQuizzes().find(q => q.id === quizId);
  if (!quiz) return;
  activeQuiz = quiz;
  currentQuestionIndex = 0;
  userAnswers = new Array(quiz.questions.length).fill(null);
  navigate('take');
  renderQuestion();
}

function renderQuestion() {
  const quiz = activeQuiz;
  const q = quiz.questions[currentQuestionIndex];
  const total = quiz.questions.length;

  document.getElementById('progressFill').style.width = `${((currentQuestionIndex) / total) * 100}%`;
  document.getElementById('progressLabel').textContent = `Question ${currentQuestionIndex + 1} of ${total}`;
  document.getElementById('takeQuestionText').textContent = q.text;

  const list = document.getElementById('takeOptionsList');
  list.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn' + (userAnswers[currentQuestionIndex] === i ? ' selected' : '');
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      userAnswers[currentQuestionIndex] = i;
      list.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    list.appendChild(btn);
  });

  const nextBtn = document.getElementById('nextQuestionBtn');
  nextBtn.textContent = currentQuestionIndex === total - 1 ? 'Finish Quiz' : 'Next';
}

document.getElementById('nextQuestionBtn').addEventListener('click', () => {
  if (userAnswers[currentQuestionIndex] === null) {
    alert('Please select an answer before continuing.');
    return;
  }
  if (currentQuestionIndex < activeQuiz.questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    document.getElementById('progressFill').style.width = '100%';
    showResults();
  }
});

// ---------- Results ----------
function showResults() {
  const quiz = activeQuiz;
  let correctCount = 0;

  const breakdown = document.getElementById('resultsBreakdown');
  breakdown.innerHTML = '';

  quiz.questions.forEach((q, i) => {
    const isCorrect = userAnswers[i] === q.correctIndex;
    if (isCorrect) correctCount++;

    const item = document.createElement('div');
    item.className = 'results-breakdown-item ' + (isCorrect ? 'correct' : 'incorrect');
    item.innerHTML = `
      <strong>${i + 1}. ${escapeHtml(q.text)}</strong>
      <div class="your-answer">Your answer: ${escapeHtml(q.options[userAnswers[i]] ?? 'No answer')}</div>
      ${isCorrect ? '' : `<div class="correct-answer">Correct answer: ${escapeHtml(q.options[q.correctIndex])}</div>`}
    `;
    breakdown.appendChild(item);
  });

  document.getElementById('scoreDisplay').textContent =
    `${correctCount} / ${quiz.questions.length}`;

  navigate('results');
}

document.getElementById('retakeBtn').addEventListener('click', () => {
  startQuiz(activeQuiz.id);
});

// ---------- Init ----------
seedIfEmpty();
updateAuthNav();
navigate('home');
