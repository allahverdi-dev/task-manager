class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    this.currentFilter = 'all';
    
    // DOM Elements
    this.form = document.getElementById('task-form');
    this.input = document.getElementById('task-name');
    this.taskList = document.getElementById('task-list');
    this.emptyState = document.getElementById('empty-state');
    this.headerStats = document.getElementById('header-stats');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.topBtn = document.getElementById('top-button');
    
    this.init();
  }

  init() {
    // Event Listeners
    this.form.addEventListener('submit', this.addTask.bind(this));
    this.taskList.addEventListener('click', this.handleTaskAction.bind(this));
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.setFilter(e));
    });
    window.addEventListener('scroll', this.toggleTopButton.bind(this));
    this.topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Initial Render
    this.render();
  }

  addTask(e) {
    e.preventDefault();
    const taskText = this.input.value.trim();
    
    if (!taskText) return;

    const newTask = {
      // Hər mühitdə problemsiz işləyən etibarlı unikal ID generatoru
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.tasks.unshift(newTask);
    this.input.value = '';
    this.saveAndRender();
  }

  handleTaskAction(e) {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;
    
    const taskId = taskItem.dataset.id;

    // Handle Delete
    if (e.target.closest('.delete-task')) {
      taskItem.style.transform = 'translateX(20px)';
      taskItem.style.opacity = '0';
      
      setTimeout(() => {
        // String() ilə qəti yoxlama edirik ki, tip fərqliliyi problemi yaranmasın
        this.tasks = this.tasks.filter(task => String(task.id) !== String(taskId));
        this.saveAndRender();
      }, 300);
      
      return; // Silmə işə düşdüsə, funksiyanı burada saxlayırıq
    }

    // Handle Toggle
    if (e.target.type === 'checkbox') {
      const task = this.tasks.find(t => String(t.id) === String(taskId));
      if (task) {
        task.completed = e.target.checked;
        this.saveAndRender();
      }
    }
  }

  setFilter(e) {
    this.filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    this.currentFilter = e.target.dataset.filter;
    this.render();
  }

  getFilteredTasks() {
    switch (this.currentFilter) {
      case 'active': return this.tasks.filter(task => !task.completed);
      case 'completed': return this.tasks.filter(task => task.completed);
      default: return this.tasks;
    }
  }

  updateStats() {
    const completedTasks = this.tasks.filter(task => task.completed).length;
    const totalTasks = this.tasks.length;
    this.headerStats.textContent = `${completedTasks} / ${totalTasks} Completed`;
  }

  toggleTopButton() {
    if (window.scrollY > 200) {
      this.topBtn.classList.remove('hidden');
    } else {
      this.topBtn.classList.add('hidden');
    }
  }

  saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    this.render();
  }

  render() {
    const tasksToRender = this.getFilteredTasks();
    
    // Handle Empty State
    if (this.tasks.length === 0 || tasksToRender.length === 0) {
      this.taskList.innerHTML = '';
      this.emptyState.classList.remove('hidden');
    } else {
      this.emptyState.classList.add('hidden');
      
      this.taskList.innerHTML = tasksToRender.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <label class="task-content">
            <input type="checkbox" ${task.completed ? 'checked' : ''} />
            <span class="task-text">${this.escapeHTML(task.text)}</span>
          </label>
          ${this.isToday(task.createdAt) ? '<span class="badge">Today</span>' : ''}
          <button class="delete-task" aria-label="Delete Task">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </li>
      `).join('');
    }

    this.updateStats();
  }

  isToday(dateString) {
    if (!dateString) return false;
    const taskDate = new Date(dateString);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  }

  // Prevent XSS attacks
  escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  new TaskManager();
});