import { htmlStringToElement } from "./utils/html-string-to-element.js"

const newTodoForm = document.querySelector('#new-todo-form');
const remainingTaksList = document.querySelector('#remaining-tasks');



async function addNewTodo(todo) {
    try {
        const result = await fetch('/todos/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todo)
        });
        if(result.ok) {
            const newTodo = await result.json();
            console.log(newTodo);
        }
    } catch (error) {
        console.error(error);
        return false
    }
}

newTodoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTodoText = document.querySelector('#new-todo-input');
    const result = await addNewTodo(newTodoText.value);
    if(!result) return;
    const newTodo = htmlStringToElement(`
        <li class="flex items-center justify-between">
            <p>${newTodoText.value}</p>
            <div class="flex items-center gap-2">
            <input type="checkbox" name="task-1-complete" id="task-1-complete">
            <button>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 384 512">
                    <path fill="currentColor"
                        d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7L86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256L41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3l105.4 105.3c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256l105.3-105.4z" />
                </svg>
            </button>
            </div>
        </li>`);
    remainingTaksList.appendChild(newTodo);
});