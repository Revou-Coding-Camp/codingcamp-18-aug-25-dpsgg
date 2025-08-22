console.log("Hello, World!");

let listTodo = [];

/// Validate Form Inputs
function validateForm() {
    /// DOM Form Elements
    const taskInput = document.getElementById("task-input");
    const dueDateInput = document.getElementById("due-date-input");

    if (taskInput.value === '' || dueDateInput.value === '') {
        alert("Please enter a task.");
    } else {
        addTodo(taskInput.value, dueDateInput.value);
    }
}

/// Add a new Todo
function addTodo(task, dueDate) {
    listTodo.push({
        task: task,
        dueDate: dueDate
    });

    renderTodoList();
}

/// Render the Todo List
function renderTodoList() {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = '';


    for (let i = 0; i < listTodo.length; i++) {
        taskList.innerHTML += `<li class="border-b py-2">${listTodo[i].task} - Due: ${listTodo[i].dueDate}</li>`;
    }
}

/// Delete all Todos
function deleteAll() {
    listTodo = [];
    renderTodoList();
}