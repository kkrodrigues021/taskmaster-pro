class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.renderTasks();
        this.updateStats();
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        
        const themeIcons = document.querySelectorAll('#themeToggle i');
        themeIcons[0].style.display = savedTheme === 'light' ? 'block' : 'none';
        themeIcons[1].style.display = savedTheme === 'dark' ? 'block' : 'none';

        document.getElementById('themeToggle').addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
            
            themeIcons[0].style.display = currentTheme === 'light' ? 'block' : 'none';
            themeIcons[1].style.display = currentTheme === 'dark' ? 'block' : 'none';
        });
    }

    setupEventListeners() {
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentFilter = btn.dataset.filter;
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderTasks();
            });
        });
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now(),
            text,
            priority: document.getElementById('prioritySelect').value,
            dueDate: document.getElementById('dueDate').value || null,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        input.value = '';
        this.renderTasks();
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';

        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li class="empty-message">Nenhuma tarefa encontrada</li>';
            this.updateStats();
            return;
        }

        filteredTasks.forEach(task => {
            const taskElement = document.createElement('li');
            taskElement.className = `task-item task-${task.priority} ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;

            taskElement.innerHTML = `
                <div class="task-content">
                    <div class="task-title">${task.text}</div>
                    ${task.dueDate ? `
                        <div class="task-due">
                            <i class="far fa-calendar-alt"></i>
                            ${new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </div>
                    ` : ''}
                </div>
                <div class="task-actions">
                    <button class="task-btn complete-btn" title="${task.completed ? 'Marcar como pendente' : 'Concluir'}">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="task-btn delete-btn" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            taskElement.querySelector('.complete-btn').addEventListener('click', () => {
                this.toggleTaskComplete(task.id);
            });

            taskElement.querySelector('.delete-btn').addEventListener('click', () => {
                this.deleteTask(task.id);
            });

            taskList.appendChild(taskElement);
        });

        this.updateStats();
    }

    toggleTaskComplete(taskId) {
        const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
        
        // Efeito visual
        taskElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            taskElement.style.transform = 'scale(1)';
        }, 200);

        // Atualiza estado
        this.tasks = this.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        this.saveTasks();
        
        // Re-renderiza com delay para animação
        setTimeout(() => this.renderTasks(), 300);
    }

    deleteTask(taskId) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        
        document.getElementById('totalCounter').textContent = total;
        document.getElementById('completedCounter').textContent = completed;
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active': return this.tasks.filter(task => !task.completed);
            case 'completed': return this.tasks.filter(task => task.completed);
            default: return [...this.tasks];
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});