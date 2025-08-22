document.addEventListener('DOMContentLoaded', () => {
    // === DOM ELEMENTS ===
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const dueDateInput = document.getElementById('due-date-input');
    const todoList = document.getElementById('todo-list');
    const filterButtons = document.getElementById('filter-buttons');
    const deleteAllBtn = document.getElementById('delete-all-btn'); // Tombol baru
    
    // Statistics Elements
    const totalTasksEl = document.getElementById('total-tasks');
    const pendingTasksEl = document.getElementById('pending-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');

    // === STATE MANAGEMENT ===
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    // === RENDERING LOGIC ===
    const renderTodos = () => {
        todoList.innerHTML = ''; 

        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'pending') return !todo.completed;
            if (currentFilter === 'completed') return todo.completed;
            return true;
        });

        if (filteredTodos.length === 0) {
            let message = "Hooray, no tasks pending!";
            if (currentFilter === 'completed') message = "No completed tasks yet.";
            else if (currentFilter === 'all' && todos.length > 0) message = "No tasks match the current filter.";
            else if (todos.length === 0) message = "Add a new task to get started!";
            
            todoList.innerHTML = `<p class="text-center text-gray-500">${message}</p>`;
        } else {
            filteredTodos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            
            filteredTodos.forEach(todo => {
                const todoElement = createTodoElement(todo);
                todoList.appendChild(todoElement);
            });
        }

        updateStats();
        updateFilterButtons();
        
        // Sembunyikan tombol delete all jika tidak ada tugas
        deleteAllBtn.style.display = todos.length > 0 ? 'block' : 'none';
    };

    const createTodoElement = (todo) => {
        const item = document.createElement('div');
        item.className = `p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${todo.completed ? 'bg-green-50' : 'bg-white shadow'}`;

        const content = document.createElement('div');
        content.className = `flex-grow ${todo.completed ? 'text-gray-400 line-through' : ''}`;
        
        const localDate = new Date(todo.dueDate + 'T00:00:00');
        const statusBadge = `<span class="text-xs font-semibold px-2.5 py-1 rounded-full ${todo.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${todo.completed ? 'Finished' : 'Pending'}</span>`;
        
        content.innerHTML = `
            <div class="flex items-center gap-3 mb-2">
                <p class="font-semibold text-lg">${todo.text}</p>
                ${statusBadge}
            </div>
            <p class="text-sm text-gray-500">
                <i class="fas fa-calendar-alt mr-2"></i>
                Due by: ${localDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        `;

        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'flex items-center gap-2 flex-shrink-0';
        
        const finishButton = createButton('Finish', todo.completed ? 'bg-yellow-500' : 'bg-green-500', () => toggleComplete(todo.id));
        if (todo.completed) finishButton.textContent = 'Undo';

        const editButton = createButton('Edit', 'bg-blue-500', () => handleEdit(todo, item));
        const deleteButton = createButton('Delete', 'bg-red-500', () => deleteTodo(todo.id));
        
        buttonGroup.appendChild(finishButton);
        if (!todo.completed) {
            buttonGroup.appendChild(editButton);
        }
        buttonGroup.appendChild(deleteButton);
        
        item.appendChild(content);
        item.appendChild(buttonGroup);

        return item;
    };

    const createButton = (text, classes, onClick) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `${classes} text-white px-3 py-1 text-sm rounded-md hover:opacity-80 transition-opacity`;
        button.addEventListener('click', onClick);
        return button;
    };

    const updateStats = () => {
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        totalTasksEl.textContent = total;
        completedTasksEl.textContent = completed;
        pendingTasksEl.textContent = total - completed;
    };

    const updateFilterButtons = () => {
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.className = button.dataset.filter === currentFilter 
                ? 'filter-btn bg-blue-500 text-white px-4 py-2 rounded-lg' 
                : 'filter-btn bg-gray-300 text-gray-700 px-4 py-2 rounded-lg';
        });
    };

    // === ACTIONS & EVENT HANDLERS ===
    
    const handleAddTask = (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        const dueDate = dueDateInput.value;

        if (!text) { alert('Task name cannot be empty.'); todoInput.focus(); return; }
        if (!dueDate) { alert('Please select a due date.'); dueDateInput.focus(); return; }

        todos.push({ id: Date.now(), text, dueDate, completed: false });
        saveTodos();
        renderTodos();
        todoForm.reset();
        setDefaultDate();
    };
    
    const toggleComplete = (id) => {
        const todo = todos.find(t => t.id === id);
        if (todo) { todo.completed = !todo.completed; saveTodos(); renderTodos(); }
    };

    // **FUNGSI DELETE YANG DIPERBAIKI**
    const deleteTodo = (id) => {
        // Konfirmasi sebelum menghapus
        if (confirm('Are you sure you want to delete this task?')) {
            // Filter array untuk menghapus todo dengan id yang sesuai
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
        }
    };
    
    const handleEdit = (todo, itemElement) => {
        const contentDiv = itemElement.querySelector('div');
        const editForm = document.createElement('div');
        editForm.className = 'flex-grow flex flex-col gap-2';
        editForm.innerHTML = `<input type="text" value="${todo.text}" class="w-full p-2 border rounded text-black font-normal text-base"><input type="date" value="${todo.dueDate}" class="w-full p-2 border rounded text-gray-600 text-sm">`;
        itemElement.replaceChild(editForm, contentDiv);
        
        const buttonGroup = itemElement.querySelector('div:last-child');
        buttonGroup.innerHTML = ''; 
        
        const saveButton = createButton('Save', 'bg-green-600', () => {
            const newText = editForm.querySelector('input[type="text"]').value.trim();
            const newDueDate = editForm.querySelector('input[type="date"]').value;
            if (!newText || !newDueDate) { alert('Task name and due date cannot be empty.'); return; }
            updateTodo(todo.id, newText, newDueDate);
        });
        const cancelButton = createButton('Cancel', 'bg-gray-500', renderTodos);
        buttonGroup.append(saveButton, cancelButton);
    };

    const updateTodo = (id, newText, newDueDate) => {
        const todo = todos.find(t => t.id === id);
        if (todo) { todo.text = newText; todo.dueDate = newDueDate; saveTodos(); renderTodos(); }
    };

    const handleFilterClick = (e) => {
        if (e.target.matches('.filter-btn')) { currentFilter = e.target.dataset.filter; renderTodos(); }
    };

    // **FUNGSI BARU UNTUK DELETE ALL**
    const handleDeleteAll = () => {
        if (todos.length > 0 && confirm('Are you sure you want to delete ALL tasks? This action cannot be undone.')) {
            todos = []; // Kosongkan array
            saveTodos();
            renderTodos();
        }
    };

    // === INITIALIZATION ===
    const setDefaultDate = () => {
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        const todayString = today.toISOString().split('T')[0];
        dueDateInput.value = todayString;
        dueDateInput.min = todayString;
    };
    
    // Tambahkan event listener untuk tombol baru
    deleteAllBtn.addEventListener('click', handleDeleteAll);
    todoForm.addEventListener('submit', handleAddTask);
    filterButtons.addEventListener('click', handleFilterClick);
    setDefaultDate();
    renderTodos(); // Initial render
});