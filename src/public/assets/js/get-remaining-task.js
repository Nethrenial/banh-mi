import { markAsComplete, deleteTodo } from "./api/index.js";
import { getCompletedTask } from "./get-completed-task.js"
import { htmlStringToElement } from "./utils/index.js";

/**
 * 
 * @param {import("./api/index.js").TodoItem} result 
 * @param {HTMLElement} completedTasksList 
 * @returns 
 */
export function getRemainingTask(result, completedTasksList) {
    const newTodo = htmlStringToElement(`
        <li class="flex items-center justify-between" data-todo="${result._id}">
            <p>${result.text}</p>
            <div class="flex items-center gap-2">
            <input type="checkbox" name="task-${result._id}-complete" id="task-${result._id}-complete">
            <button>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 384 512">
                    <path fill="currentColor"
                        d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7L86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256L41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3l105.4 105.3c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256l105.3-105.4z" />
                </svg>
            </button>
            </div>
        </li>`);
    newTodo.querySelector(`#task-${result._id}-complete`).addEventListener('change', async (e) => {
        const result = await markAsComplete(e.target.closest('li').dataset.todo);
        if (!result) return;
        e.target.closest('li').remove();
        getCompletedTask(result, completedTasksList)
    });
    newTodo.querySelector('button').addEventListener('click', async (e) => {
        const response = await deleteTodo(result._id);
        if(response) {
            e.target.closest('li').remove();
        }
    });
    return newTodo
}