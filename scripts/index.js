document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addTodoButton = document.getElementById('add-todo-button');
    const saveTodoButton = document.getElementById('save-todo-button');
    const loadTodoButton = document.getElementById('load-todo-button');
    const todoList = document.getElementById('todo-list');
    const editModal = document.getElementById('edit-modal');
    const editTitleInput = document.getElementById('edit-todo-title');
    const editSubtasksContainer = document.getElementById('edit-subtasks-container');
    const saveEditButton = document.getElementById('save-edit-button');
    const closeButton = document.querySelector('.close-button');
    const addSubtaskButtonModal = document.getElementById('add-subtask-button-modal');

    let currentEditTodoItem = null;

    // Charger les tâches depuis le localStorage
    loadTodos();

    addTodoButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    saveTodoButton.addEventListener('click', saveTodosToFile);
    loadTodoButton.addEventListener('click', loadTodosFromFile);

    function sanitizeInput(input) {
        const tempDiv = document.createElement('div');
        tempDiv.textContent = input;
        return tempDiv.innerHTML;
    }

    function addTodo() {
        const todoText = sanitizeInput(todoInput.value.trim());
        if (todoText) {
            const todoItem = document.createElement('li');
            todoItem.classList.add('todo-item');
            todoItem.innerHTML = `
                <span>${todoText}</span>
                <div class="subtask-container"></div>
                <div class="button-container">
                    <button class="add-subtask-button" type="button"></button>
                    <button class="edit-button" type="button"></button>
                    <button class="complete-button" type="button"></button>
                    <button class="delete-button" type="button"></button>
                </div>
            `;
            todoList.appendChild(todoItem);
            todoInput.value = '';

            saveTodo({
                text: todoText,
                subtasks: [],
                completed: false
            });
            addEventListeners(todoItem);
        }
    }

    function addEventListeners(todoItem) {
        const deleteButton = todoItem.querySelector('.delete-button');
        const completeButton = todoItem.querySelector('.complete-button');
        const addSubtaskButton = todoItem.querySelector('.add-subtask-button');
        const editButton = todoItem.querySelector('.edit-button');

        deleteButton.addEventListener('click', () => {
            removeTodo(todoItem);
        });

        completeButton.addEventListener('click', () => {
            todoItem.classList.toggle('completed');
            updateTodos();
        });

        addSubtaskButton.addEventListener('click', () => {
            addSubtask(todoItem);
        });

        editButton.addEventListener('click', () => {
            openEditModal(todoItem);
        });
    }

    function addSubtask(todoItem) {
        const subtaskText = sanitizeInput(prompt("Ajouter une sous-tâche:"));
        if (subtaskText) {
            const subtaskContainer = todoItem.querySelector('.subtask-container');
            const subtask = document.createElement('div');
            subtask.classList.add('subtask');
            subtask.textContent = `- ${subtaskText}`;
            subtaskContainer.appendChild(subtask);

            const todos = getTodos();
            const todoIndex = Array.from(todoList.children).indexOf(todoItem);
            if (todos[todoIndex]) {
                todos[todoIndex].subtasks = todos[todoIndex].subtasks || [];
                todos[todoIndex].subtasks.push(subtaskText);
                localStorage.setItem('todos', JSON.stringify(todos));
            }
        }
    }

    function openEditModal(todoItem) {
        currentEditTodoItem = todoItem;
        editTitleInput.value = todoItem.querySelector('span').textContent;
        editSubtasksContainer.innerHTML = '';

        const subtasks = todoItem.querySelectorAll('.subtask');
        subtasks.forEach(subtask => {
            const subtaskInput = document.createElement('input');
            subtaskInput.type = 'text';
            subtaskInput.value = subtask.textContent.slice(2);
            const subtaskContainer = document.createElement('div');
            subtaskContainer.classList.add('edit-subtask-container');
            subtaskContainer.appendChild(subtaskInput);

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('subtask-button', 'delete');
            deleteButton.addEventListener('click', () => {
                editSubtasksContainer.removeChild(subtaskContainer);
            });
            subtaskContainer.appendChild(deleteButton);

            editSubtasksContainer.appendChild(subtaskContainer);
        });

        editModal.style.display = 'block';
    }

    function closeEditModal() {
        editModal.style.display = 'none';
        currentEditTodoItem = null;
    }

    function saveEdits() {
        if (currentEditTodoItem) {
            const newTitle = sanitizeInput(editTitleInput.value.trim());
            const newSubtasks = Array.from(editSubtasksContainer.querySelectorAll('input')).map(input => sanitizeInput(input.value.trim()));

            if (newTitle) {
                currentEditTodoItem.querySelector('span').textContent = newTitle;

                const subtaskContainer = currentEditTodoItem.querySelector('.subtask-container');
                subtaskContainer.innerHTML = '';
                newSubtasks.forEach(subtaskText => {
                    if (subtaskText) {
                        const subtask = document.createElement('div');
                        subtask.classList.add('subtask');
                        subtask.textContent = `- ${subtaskText}`;
                        subtaskContainer.appendChild(subtask);
                    }
                });

                updateTodos();
                closeEditModal();
            }
        }
    }

    function saveTodo(todo) {
        const todos = getTodos();
        todos.push(todo);
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function getTodos() {
        const todos = localStorage.getItem('todos');
        return todos ? JSON.parse(todos) : [];
    }

    function updateTodos() {
        const todos = [];
        todoList.querySelectorAll('.todo-item').forEach((item, index) => {
            const subtasks = [];
            item.querySelectorAll('.subtask').forEach(subtask => {
                subtasks.push(subtask.textContent.slice(2));
            });
            todos.push({
                text: item.querySelector('span').textContent,
                subtasks: subtasks,
                completed: item.classList.contains('completed')
            });
        });
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function loadTodos() {
        const todos = getTodos();
        todos.forEach(todo => {
            const todoItem = document.createElement('li');
            todoItem.classList.add('todo-item');
            if (todo.completed) {
                todoItem.classList.add('completed');
            }
            const subtasks = todo.subtasks ? todo.subtasks : [];
            todoItem.innerHTML = `
                <span>${sanitizeInput(todo.text)}</span>
                <div class="subtask-container">${subtasks.map(subtask => `<div class="subtask">- ${sanitizeInput(subtask)}</div>`).join('')}</div>
                <div class="button-container">
                    <button class="add-subtask-button" type="button"></button>
                    <button class="edit-button" type="button"></button>
                    <button class="complete-button" type="button"></button>
                    <button class="delete-button" type="button"></button>
                </div>
            `;
            todoList.appendChild(todoItem);
            addEventListeners(todoItem);
        });
    }

    function removeTodo(todoItem) {
        todoList.removeChild(todoItem);
        updateTodos();
    }

    closeButton.addEventListener('click', closeEditModal);
    saveEditButton.addEventListener('click', saveEdits);
    window.addEventListener('click', (event) => {
        if (event.target == editModal) {
            closeEditModal();
        }
    });

    addSubtaskButtonModal.addEventListener('click', () => {
        const subtaskInput = document.createElement('input');
        subtaskInput.type = 'text';
        const subtaskContainer = document.createElement('div');
        subtaskContainer.classList.add('edit-subtask-container');
        subtaskContainer.appendChild(subtaskInput);

        const completeButton = document.createElement('button');
        completeButton.classList.add('subtask-button', 'complete');
        completeButton.addEventListener('click', () => {
            subtaskInput.classList.toggle('completed');
        });
        subtaskContainer.appendChild(completeButton);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('subtask-button', 'delete');
        deleteButton.addEventListener('click', () => {
            editSubtasksContainer.removeChild(subtaskContainer);
        });
        subtaskContainer.appendChild(deleteButton);

        editSubtasksContainer.appendChild(subtaskContainer);
    });

    function saveTodosToFile() {
        const todos = getTodos();
        const blob = new Blob([JSON.stringify(todos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'todos.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    function loadTodosFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                const text = await file.text();
                const todos = JSON.parse(text);
                localStorage.setItem('todos', JSON.stringify(todos));
                todoList.innerHTML = '';
                loadTodos();
            }
        };
        input.click();
    }
});
