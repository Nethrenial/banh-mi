import { deleteTodo } from "./api/index.js";
import { htmlStringToElement } from "./utils/index.js"

/**
 * 
 * @param {import("./api").TodoItem} todoItem 
 * @param {HTMLElement} completedTasksList 
 */
export function getCompletedTask(todoItem, completedTasksList) {
    const completedTask = htmlStringToElement(
        `<li class="flex items-center justify-between">
        <p>${todoItem.text}</p>
        <div class="flex items-center gap-2">
            <button>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 384 512">
                    <path fill="currentColor"
                        d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7L86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256L41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3l105.4 105.3c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256l105.3-105.4z" />
                </svg>
            </button>
        </div>
    </li>`
    )
    completedTask.querySelector('button').addEventListener('click', async (e) => {
        const response = await deleteTodo(todoItem._id);
        if(response) {
            e.target.closest('li').remove();
        }
    });
    completedTasksList.appendChild(completedTask)
    return completedTask
}