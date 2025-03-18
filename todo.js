document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo');
    const todoList = document.getElementById('todo-list');
    const tasksLeftSpan = document.getElementById('tasks-left');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Load todos from localStorage
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    
    // Render todos
    const renderTodos = (filter = 'all') => {
        todoList.innerHTML = '';
        
        let filteredTodos = todos;
        if (filter === 'active') {
            filteredTodos = todos.filter(todo => !todo.completed);
        } else if (filter === 'completed') {
            filteredTodos = todos.filter(todo => todo.completed);
        }
        
        filteredTodos.forEach((todo, index) => {
            const todoItem = document.createElement('li');
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            todoItem.innerHTML = `
                <div class="todo-content">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                    <span class="todo-text">${todo.text}</span>
                </div>
                <div class="todo-actions">
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            // Toggle completion
            const checkbox = todoItem.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => {
                todos[index].completed = checkbox.checked;
                todoItem.classList.toggle('completed', checkbox.checked);
                saveTodos();
                updateTasksLeft();
            });
            
            // Delete todo
            const deleteBtn = todoItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                todoItem.classList.add('slide-out');
                
                todoItem.addEventListener('animationend', () => {
                    todos.splice(index, 1);
                    saveTodos();
                    renderTodos(getCurrentFilter());
                });
            });
            
            todoList.appendChild(todoItem);
            
            // Animate todo item
            setTimeout(() => {
                todoItem.style.opacity = '1';
                todoItem.style.transform = 'translateX(0)';
            }, index * 50);
        });
        
        updateTasksLeft();
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
    addTodoBtn.addEventListener('click', () => {
        const text = todoInput.value.trim();
        
        if (text) {
            todos.push({
                text,
                completed: false,
                id: Date.now()
            });
            
            todoInput.value = '';
            saveTodos();
            renderTodos(getCurrentFilter());
            
            // Focus back on input
            todoInput.focus();
        }
    });
    
    // Add todo on Enter key
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodoBtn.click();
        }
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
    
    // Initial render
    renderTodos();
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .todo-item {
            opacity: 0;
            transform: translateX(-20px);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .todo-item.completed .todo-text {
            text-decoration: line-through;
            opacity: 0.6;
        }
        
        .slide-out {
            animation: slideOut 0.3s ease forwards;
        }
        
        @keyframes slideOut {
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(style);
});