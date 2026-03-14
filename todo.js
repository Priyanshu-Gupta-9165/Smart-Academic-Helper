document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo');
    const todoList = document.getElementById('todo-list');
    const tasksLeftSpan = document.getElementById('tasks-left');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const todoEmpty = document.getElementById('todo-empty');
    const progressFill = document.getElementById('todo-progress-fill');
    const progressPercent = document.getElementById('todo-progress-percent');
    const priorityBtns = document.querySelectorAll('.priority-btn');

    // Load todos from localStorage
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let selectedPriority = 'medium';

    // Priority selector
    priorityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            priorityBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedPriority = btn.dataset.priority;
        });
    });

    // Format date nicely
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Update progress bar
    const updateProgress = () => {
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        progressFill.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
    };

    // Update filter counts
    const updateCounts = () => {
        const countAll = document.getElementById('count-all');
        const countActive = document.getElementById('count-active');
        const countCompleted = document.getElementById('count-completed');

        countAll.textContent = todos.length;
        countActive.textContent = todos.filter(t => !t.completed).length;
        countCompleted.textContent = todos.filter(t => t.completed).length;
    };

    // Update empty state
    const updateEmptyState = (visibleCount) => {
        if (visibleCount === 0) {
            todoEmpty.classList.add('visible');
        } else {
            todoEmpty.classList.remove('visible');
        }
    };

    // Render todos
    const renderTodos = (filter = 'all') => {
        todoList.innerHTML = '';

        let filteredTodos = todos;
        if (filter === 'active') {
            filteredTodos = todos.filter(todo => !todo.completed);
        } else if (filter === 'completed') {
            filteredTodos = todos.filter(todo => todo.completed);
        }

        // Sort: high priority first, then medium, then low
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        filteredTodos.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
        });

        updateEmptyState(filteredTodos.length);

        filteredTodos.forEach((todo, displayIndex) => {
            const realIndex = todos.indexOf(todo);
            const todoItem = document.createElement('li');
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            todoItem.innerHTML = `
                <div class="todo-priority-bar priority-${todo.priority || 'medium'}"></div>
                <div class="todo-checkbox-wrapper">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                </div>
                <div class="todo-content">
                    <div class="todo-text">${escapeHtml(todo.text)}</div>
                    <div class="todo-date">${formatDate(todo.id)}</div>
                </div>
                <div class="todo-actions">
                    <button class="delete-btn" title="Delete task"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;

            // Toggle completion
            const checkbox = todoItem.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => {
                todos[realIndex].completed = checkbox.checked;
                todoItem.classList.toggle('completed', checkbox.checked);
                saveTodos();
                updateTasksLeft();
                updateProgress();
                updateCounts();

                // Re-render after a brief delay for the visual effect
                setTimeout(() => renderTodos(getCurrentFilter()), 300);
            });

            // Delete todo
            const deleteBtn = todoItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                todoItem.classList.add('slide-out');
                todoItem.addEventListener('animationend', () => {
                    todos.splice(realIndex, 1);
                    saveTodos();
                    renderTodos(getCurrentFilter());
                });
            });

            todoList.appendChild(todoItem);

            // Staggered slide-in animation
            setTimeout(() => {
                todoItem.classList.add('visible');
            }, displayIndex * 40);
        });

        updateTasksLeft();
        updateProgress();
        updateCounts();
    };

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // Save todos to localStorage
    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    // Update tasks left count
    const updateTasksLeft = () => {
        const activeTodos = todos.filter(todo => !todo.completed);
        tasksLeftSpan.textContent = `${activeTodos.length} task${activeTodos.length !== 1 ? 's' : ''} left`;
    };

    // Get current filter
    const getCurrentFilter = () => {
        const activeFilter = document.querySelector('.filter-btn.active');
        return activeFilter.dataset.filter;
    };

    // Add new todo
    const addTodo = () => {
        const text = todoInput.value.trim();

        if (text) {
            todos.push({
                text,
                completed: false,
                id: Date.now(),
                priority: selectedPriority
            });

            todoInput.value = '';
            saveTodos();
            renderTodos(getCurrentFilter());
            todoInput.focus();
        } else {
            // Shake the input if empty
            todoInput.style.animation = 'none';
            todoInput.offsetHeight; // trigger reflow
            todoInput.style.animation = 'shake 0.4s ease';
            setTimeout(() => { todoInput.style.animation = ''; }, 400);
        }
    };

    addTodoBtn.addEventListener('click', addTodo);

    // Add todo on Enter key
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    // Clear completed todos
    clearCompletedBtn.addEventListener('click', () => {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos(getCurrentFilter());
    });

    // Filter todos
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTodos(btn.dataset.filter);
        });
    });

    // Migration: add priority to old todos that don't have it
    todos.forEach(todo => {
        if (!todo.priority) todo.priority = 'medium';
    });
    saveTodos();

    // Initial render
    renderTodos();

    // Add shake animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-6px); }
            50% { transform: translateX(6px); }
            75% { transform: translateX(-4px); }
        }
    `;
    document.head.appendChild(style);
});