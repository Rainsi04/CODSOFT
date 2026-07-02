// ===== STATE =====
let projects = [];
let tasks = [];
let currentUser = null;
let currentProjectId = null;
let isAuthMode = 'login';
let activityLog = [];
let nextProjectId = 1;
let nextTaskId = 1;

// ===== DOM REFS =====
const pages = {
  dashboard: document.getElementById('page-dashboard'),
  projects: document.getElementById('page-projects'),
  tasks: document.getElementById('page-tasks'),
  'project-detail': document.getElementById('page-project-detail'),
  login: document.getElementById('page-login'),
};

const navLinks = document.getElementById('navLinks');
const authNav = document.getElementById('authNav');

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  updateDashboard();
  renderProjects();
  renderTasks();
  populateProjectSelects();
  updateAuthUI();
  showPage('dashboard');

  // Auth form
  document.getElementById('authForm').addEventListener('submit', handleAuth);

  // Project form
  document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);

  // Task form
  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);

  // Mobile nav toggle
  document.querySelector('.nav-toggle').addEventListener('click', toggleMobileNav);

  // Auth toggle
  document.getElementById('authToggleLink').addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthMode();
  });

  // Close modals on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
});

// ===== NAVIGATION =====
function showPage(pageId) {
  Object.keys(pages).forEach(key => {
    pages[key].classList.remove('active');
  });
  if (pages[pageId]) pages[pageId].classList.add('active');

  // Close mobile nav
  document.querySelector('.nav-links')?.classList.remove('open');
  document.querySelector('.nav-toggle')?.classList.remove('active');

  // Refresh content
  if (pageId === 'dashboard') updateDashboard();
  if (pageId === 'projects') renderProjects();
  if (pageId === 'tasks') { renderTasks(); populateProjectSelects(); }
}

function toggleMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const isOpen = links.classList.toggle('open');
  toggle.classList.toggle('active');
  toggle.setAttribute('aria-expanded', isOpen);
}

// ===== DATA STORAGE =====
function loadData() {
  const storedProjects = localStorage.getItem('projectFlowProjects');
  const storedTasks = localStorage.getItem('projectFlowTasks');
  const storedActivity = localStorage.getItem('projectFlowActivity');
  const storedIds = localStorage.getItem('projectFlowIds');

  projects = storedProjects ? JSON.parse(storedProjects) : [];
  tasks = storedTasks ? JSON.parse(storedTasks) : [];
  activityLog = storedActivity ? JSON.parse(storedActivity) : [];

  if (storedIds) {
    const ids = JSON.parse(storedIds);
    nextProjectId = ids.nextProjectId || 1;
    nextTaskId = ids.nextTaskId || 1;
  }

  // Add sample data if empty
  if (projects.length === 0 && tasks.length === 0) {
    addSampleData();
  }
}

function saveData() {
  localStorage.setItem('projectFlowProjects', JSON.stringify(projects));
  localStorage.setItem('projectFlowTasks', JSON.stringify(tasks));
  localStorage.setItem('projectFlowActivity', JSON.stringify(activityLog));
  localStorage.setItem('projectFlowIds', JSON.stringify({
    nextProjectId,
    nextTaskId
  }));
}

function addSampleData() {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 14);

  const project = {
    id: nextProjectId++,
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern design',
    status: 'active',
    dueDate: dueDate.toISOString().split('T')[0],
    createdAt: today.toISOString().split('T')[0]
  };
  projects.push(project);

  const sampleTasks = [
    { title: 'Design Homepage', description: 'Create wireframes and mockups', status: 'in-progress', priority: 'high', dueDate: new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0], assignee: 'Sarah' },
    { title: 'Develop Backend API', description: 'Build REST API endpoints', status: 'pending', priority: 'high', dueDate: new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0], assignee: 'Mike' },
    { title: 'Mobile Responsive', description: 'Ensure all pages are mobile-friendly', status: 'pending', priority: 'medium', dueDate: new Date(today.getTime() + 10 * 86400000).toISOString().split('T')[0], assignee: 'Anna' },
    { title: 'SEO Optimization', description: 'Implement SEO best practices', status: 'pending', priority: 'low', dueDate: new Date(today.getTime() + 14 * 86400000).toISOString().split('T')[0], assignee: '' },
  ];

  sampleTasks.forEach(t => {
    tasks.push({
      id: nextTaskId++,
      projectId: project.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      assignee: t.assignee,
      createdAt: today.toISOString().split('T')[0]
    });
  });

  addActivity('created project "' + project.name + '"');
  saveData();
}

// ===== ACTIVITY LOG =====
function addActivity(action) {
  const now = new Date();
  const timeStr = now.toLocaleString();
  activityLog.unshift({
    action,
    time: timeStr,
    timestamp: now.getTime()
  });
  if (activityLog.length > 50) activityLog = activityLog.slice(0, 50);
  saveData();
}

// ===== DASHBOARD =====
function updateDashboard() {
  const totalProjects = projects.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate < today).length;

  document.getElementById('totalProjects').textContent = totalProjects;
  document.getElementById('completedTasks').textContent = completedTasks;
  document.getElementById('pendingTasks').textContent = pendingTasks;
  document.getElementById('overdueTasks').textContent = overdueTasks;

  if (currentUser) {
    document.getElementById('dashboardGreeting').textContent = `Welcome back, ${currentUser.name}! Here's your project overview.`;
  }

  // Recent Projects
  const recent = [...projects].sort((a, b) => b.id - a.id).slice(0, 5);
  const container = document.getElementById('recentProjects');
  if (recent.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary);">No projects yet. Create your first project!</p>';
  } else {
    container.innerHTML = recent.map(p => `
      <div class="project-item" onclick="viewProject(${p.id})">
        <div class="project-info">
          <h4>${escapeHtml(p.name)}</h4>
          <p>${escapeHtml(p.description || 'No description')}</p>
        </div>
        <div class="project-meta">
          <span class="badge badge-${p.status}">${p.status}</span>
          <span style="font-size:0.85rem;color:var(--text-secondary);">${tasks.filter(t => t.projectId === p.id).length} tasks</span>
        </div>
      </div>
    `).join('');
  }

  // Recent Activity
  const activityContainer = document.getElementById('recentActivity');
  if (activityLog.length === 0) {
    activityContainer.innerHTML = '<p style="color:var(--text-secondary);">No recent activity.</p>';
  } else {
    activityContainer.innerHTML = activityLog.slice(0, 10).map(a => `
      <div class="activity-item">
        <span class="activity-icon">📌</span>
        <div class="activity-content">
          <div class="activity-text">${escapeHtml(a.action)}</div>
          <div class="activity-time">${a.time}</div>
        </div>
      </div>
    `).join('');
  }
}

// ===== PROJECTS =====
function renderProjects() {
  const container = document.getElementById('projectList');
  if (projects.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-secondary);">
        <p style="font-size:3rem; margin-bottom:12px;">📂</p>
        <h3>No projects yet</h3>
        <p>Create your first project to get started!</p>
        <button onclick="openProjectModal()" class="btn btn-primary" style="margin-top:16px;">
          Create Project
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = projects.map(p => {
    const taskCount = tasks.filter(t => t.projectId === p.id).length;
    const completed = tasks.filter(t => t.projectId === p.id && t.status === 'completed').length;
    const progress = taskCount > 0 ? Math.round((completed / taskCount) * 100) : 0;

    return `
      <div class="project-card" onclick="viewProject(${p.id})">
        <div class="project-header">
          <h3>${escapeHtml(p.name)}</h3>
          <span class="badge badge-${p.status}">${p.status}</span>
        </div>
        <p class="project-desc">${escapeHtml(p.description || 'No description')}</p>
        <div class="project-footer">
          <span class="task-count"><i class="fas fa-tasks"></i> ${taskCount} tasks</span>
          <span>${progress}% complete</span>
        </div>
      </div>
    `;
  }).join('');
}

function viewProject(projectId) {
  currentProjectId = projectId;
  const project = projects.find(p => p.id === projectId);
  if (!project) return;

  document.getElementById('detailProjectTitle').textContent = project.name;
  document.getElementById('detailProjectDesc').textContent = project.description || 'No description';
  document.getElementById('detailProjectStatus').textContent = project.status;
  document.getElementById('detailProjectStatus').className = `badge badge-${project.status}`;
  document.getElementById('detailProjectDate').textContent = `Created: ${project.createdAt || 'N/A'}`;

  const projectTasks = tasks.filter(t => t.projectId === projectId);
  document.getElementById('detailProjectTasks').textContent = `Tasks: ${projectTasks.length}`;

  renderDetailTasks(projectTasks);
  showPage('project-detail');
}

function renderDetailTasks(projectTasks) {
  const container = document.getElementById('detailTaskList');
  if (projectTasks.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--text-secondary);">
        <p>No tasks in this project yet.</p>
        <button onclick="openTaskModal()" class="btn btn-primary btn-sm" style="margin-top:12px;">
          <i class="fas fa-plus"></i> Add Task
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = projectTasks.map(t => renderTaskItem(t)).join('');
}

// ===== TASKS =====
function renderTasks() {
  const statusFilter = document.getElementById('taskStatusFilter')?.value || 'all';
  const projectFilter = document.getElementById('taskProjectFilter')?.value || 'all';
  const sortFilter = document.getElementById('taskSortFilter')?.value || 'due-date';

  let filtered = [...tasks];

  if (statusFilter !== 'all') {
    filtered = filtered.filter(t => t.status === statusFilter);
  }
  if (projectFilter !== 'all') {
    filtered = filtered.filter(t => t.projectId === parseInt(projectFilter));
  }

  // Sort
  switch (sortFilter) {
    case 'due-date':
      filtered.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      break;
    case 'priority': {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      break;
    }
    case 'title':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }

  const container = document.getElementById('taskList');
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--text-secondary);">
        <p style="font-size:2rem; margin-bottom:12px;">✅</p>
        <h3>No tasks found</h3>
        <p>Try adjusting your filters or create a new task.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(t => renderTaskItem(t)).join('');
}

function renderTaskItem(task) {
  const project = projects.find(p => p.id === task.projectId);
  const isCompleted = task.status === 'completed';
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = task.status !== 'completed' && task.dueDate < today;

  return `
    <div class="task-item" style="${isOverdue ? 'border-left: 3px solid var(--danger);' : ''}">
      <span class="task-check ${isCompleted ? 'completed' : ''}" onclick="toggleTaskStatus(${task.id})">
        ${isCompleted ? '✅' : '⬜'}
      </span>
      <div class="task-info">
        <h4 style="${isCompleted ? 'text-decoration: line-through; color: var(--text-secondary);' : ''}">
          ${escapeHtml(task.title)}
        </h4>
        <p>${escapeHtml(task.description || '')} ${project ? '• ' + escapeHtml(project.name) : ''}</p>
      </div>
      <div class="task-meta">
        <span class="badge badge-${task.status}">${task.status}</span>
        <span class="badge badge-${task.priority}">${task.priority}</span>
        <span style="font-size:0.85rem;color:${isOverdue ? 'var(--danger)' : 'var(--text-secondary)'};">
          ${task.dueDate}
        </span>
        ${task.assignee ? `<span style="font-size:0.85rem;color:var(--text-secondary);">👤 ${escapeHtml(task.assignee)}</span>` : ''}
      </div>
      <div class="task-actions">
        <button onclick="editTask(${task.id})" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `;
}

function toggleTaskStatus(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  task.status = task.status === 'completed' ? 'pending' : 'completed';
  const action = task.status === 'completed' ? 'completed' : 'reopened';
  addActivity(`task "${task.title}" ${action}`);
  saveData();
  refreshCurrentView();
}

function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  const task = tasks.find(t => t.id === taskId);
  tasks = tasks.filter(t => t.id !== taskId);
  if (task) addActivity(`deleted task "${task.title}"`);
  saveData();
  refreshCurrentView();
}

// ===== MODALS =====
function openProjectModal(projectId = null) {
  const modal = document.getElementById('projectModal');
  const form = document.getElementById('projectForm');
  form.reset();

  if (projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    document.getElementById('projectModalTitle').textContent = 'Edit Project';
    document.getElementById('editProjectId').value = projectId;
    document.getElementById('projectName').value = project.name;
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectStatus').value = project.status;
    document.getElementById('projectDueDate').value = project.dueDate || '';
  } else {
    document.getElementById('projectModalTitle').textContent = 'Create New Project';
    document.getElementById('editProjectId').value = '';
  }

  modal.classList.add('active');
}

function closeProjectModal() {
  document.getElementById('projectModal').classList.remove('active');
}

function openTaskModal(taskId = null) {
  const modal = document.getElementById('taskModal');
  const form = document.getElementById('taskForm');
  form.reset();

  populateProjectSelects();

  if (taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    document.getElementById('taskModalTitle').textContent = 'Edit Task';
    document.getElementById('editTaskId').value = taskId;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskProject').value = task.projectId;
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDueDate').value = task.dueDate;
    document.getElementById('taskAssignee').value = task.assignee || '';
  } else {
    document.getElementById('taskModalTitle').textContent = 'Create New Task';
    document.getElementById('editTaskId').value = '';
    // Pre-select current project if in detail view
    if (currentProjectId) {
      const projectSelect = document.getElementById('taskProject');
      if ([...projectSelect.options].some(opt => opt.value == currentProjectId)) {
        projectSelect.value = currentProjectId;
      }
    }
  }

  modal.classList.add('active');
}

function closeTaskModal() {
  document.getElementById('taskModal').classList.remove('active');
}

function populateProjectSelects() {
  const selects = ['taskProject', 'taskProjectFilter'];
  selects.forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select a project</option>';
    if (id === 'taskProjectFilter') {
      select.innerHTML = '<option value="all">All Projects</option>';
    }
    projects.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.name;
      select.appendChild(option);
    });
    if (currentValue) select.value = currentValue;
  });
}

// ===== FORM HANDLERS =====
function handleProjectSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('editProjectId').value;
  const name = document.getElementById('projectName').value.trim();
  const description = document.getElementById('projectDescription').value.trim();
  const status = document.getElementById('projectStatus').value;
  const dueDate = document.getElementById('projectDueDate').value;

  if (!name) return;

  if (id) {
    // Edit existing project
    const project = projects.find(p => p.id === parseInt(id));
    if (project) {
      project.name = name;
      project.description = description;
      project.status = status;
      project.dueDate = dueDate;
      addActivity(`updated project "${name}"`);
    }
  } else {
    // Create new project
    const newProject = {
      id: nextProjectId++,
      name,
      description,
      status,
      dueDate,
      createdAt: new Date().toISOString().split('T')[0]
    };
    projects.push(newProject);
    addActivity(`created project "${name}"`);
  }

  saveData();
  closeProjectModal();
  refreshCurrentView();
}

function handleTaskSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('editTaskId').value;
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const projectId = parseInt(document.getElementById('taskProject').value);
  const status = document.getElementById('taskStatus').value;
  const priority = document.getElementById('taskPriority').value;
  const dueDate = document.getElementById('taskDueDate').value;
  const assignee = document.getElementById('taskAssignee').value.trim();

  if (!title || !projectId) return;

  if (id) {
    // Edit existing task
    const task = tasks.find(t => t.id === parseInt(id));
    if (task) {
      task.title = title;
      task.description = description;
      task.projectId = projectId;
      task.status = status;
      task.priority = priority;
      task.dueDate = dueDate;
      task.assignee = assignee;
      addActivity(`updated task "${title}"`);
    }
  } else {
    // Create new task
    const newTask = {
      id: nextTaskId++,
      projectId,
      title,
      description,
      status,
      priority,
      dueDate,
      assignee,
      createdAt: new Date().toISOString().split('T')[0]
    };
    tasks.push(newTask);
    addActivity(`created task "${title}"`);
  }

  saveData();
  closeTaskModal();
  refreshCurrentView();
}

// ===== AUTH =====
function updateAuthUI() {
  if (currentUser) {
    authNav.innerHTML = `<a href="#" onclick="logout()" class="nav-cta">Logout</a>`;
  } else {
    authNav.innerHTML = `<a href="#" onclick="showPage('login')" class="nav-cta">Login</a>`;
  }
}

function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;

  if (isAuthMode === 'login') {
    currentUser = { email, name: email.split('@')[0] };
    updateAuthUI();
    showPage('dashboard');
    showNotification(`Welcome back, ${currentUser.name}!`);
  } else {
    currentUser = { email, name: email.split('@')[0] };
    updateAuthUI();
    showPage('dashboard');
    showNotification(`Account created! Welcome, ${currentUser.name}!`);
  }
  document.getElementById('authForm').reset();
}

function logout() {
  currentUser = null;
  updateAuthUI();
  showPage('dashboard');
  showNotification('Logged out successfully.');
}

function toggleAuthMode() {
  if (isAuthMode === 'login') {
    isAuthMode = 'register';
    document.getElementById('authTitle').textContent = 'Create Account';
    document.getElementById('authSubtitle').textContent = 'Join us to manage your projects.';
    document.getElementById('authSubmit').textContent = 'Register';
    document.getElementById('authToggleText').textContent = 'Already have an account?';
    document.getElementById('authToggleLink').textContent = 'Login';
  } else {
    isAuthMode = 'login';
    document.getElementById('authTitle').textContent = 'Login';
    document.getElementById('authSubtitle').textContent = 'Sign in to manage your projects.';
    document.getElementById('authSubmit').textContent = 'Login';
    document.getElementById('authToggleText').textContent = "Don't have an account?";
    document.getElementById('authToggleLink').textContent = 'Register';
  }
}

// ===== UTILITY =====
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function refreshCurrentView() {
  const activePage = document.querySelector('.page.active');
  if (!activePage) return;
  const id = activePage.id.replace('page-', '');
  if (id === 'project-detail' && currentProjectId) {
    viewProject(currentProjectId);
  } else {
    showPage(id);
  }
}

function showNotification(message) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    padding: '16px 24px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    zIndex: '1000',
    maxWidth: '360px',
    animation: 'fadeIn 0.3s ease',
  });
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Expose functions globally
window.showPage = showPage;
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;
window.viewProject = viewProject;
window.toggleTaskStatus = toggleTaskStatus;
window.deleteTask = deleteTask;
window.editTask = (id) => openTaskModal(id);
window.logout = logout;
window.renderTasks = renderTasks;
window.filterProducts = renderTasks; // For filter change events