/**
 * @typedef {Object} TodoItem
 * @property {boolean} complete - Indicates whether the to-do item is complete.
 * @property {string} createdAt - The creation date of the to-do item.
 * @property {string} text - The description or text of the to-do item.
 * @property {string} updatedAt - The last update date of the to-do item.
 * @property {string} _id - The unique identifier of the to-do item.
 */

/**
 * @typedef {Object} CreateTodoResponse
 * @property {TodoItem} data - The to-do item data.
 * @property {string} status - The status of the data.
 */

/**
 * @typedef {Object} TodoListResponse
 * @property {TodoItem[]} data - The to-do item data.
 * @property {string} status - The status of the data.
 */


export * from "./add-new-todo.js"
export * from "./load-todos.js"
export * from "./mak-as-complete.js"
export * from "./delete-todo.js"


