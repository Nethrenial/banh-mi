export async function loadTodos() {
    try {
        const result = await fetch('/todos/retrieve');
        if (result.ok) {
            /**
             * @type {import(".").TodoListResponse}
             */
            const newTodo = await result.json();
            return newTodo.data
        }
    } catch (error) {
        console.error(error);
        return false
    }
}