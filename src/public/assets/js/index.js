import { getRemainingTask } from "./get-remaining-task.js"
import { addNewTodo, loadTodos } from "./api/index.js"
import { getCompletedTask } from "./get-completed-task.js";

/**
 * @type {HTMLFormElement}
 */
const newTodoForm = document.querySelector('#new-todo-form');
/**
 * @type {HTMLElement}
 */
const remainingTasksList = document.querySelector('#remaining-tasks');
/**
 * @type {HTMLElement}
 */
const completedTasksList = document.querySelector("#completed-tasks")


newTodoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTodoText = document.querySelector('#new-todo-input');
    const result = await addNewTodo(newTodoText.value);
    if (!result) return;
    remainingTasksList.append(getRemainingTask(result, completedTasksList))
    // clear the input
    newTodoText.value = '';
});



window.addEventListener('load', async () => {
    try {
        const todos = await loadTodos()
        if (todos) {
            const completedTods = todos.filter(todo => todo.complete).map(todo => {
                return getCompletedTask(todo, completedTasksList)
            })
            const remainingTods = todos.filter(todo => !todo.complete).map(todo => {
                return getRemainingTask(todo, completedTasksList)
            })
            remainingTasksList.append(...remainingTods)

        }
    } catch (error) {
        console.log(error)
    }
})