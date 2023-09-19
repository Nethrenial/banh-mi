/**
 * @param {string} todo 
 * @returns 
 */
export async function addNewTodo(todo) {
    try {
        const result = await fetch('/todos/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todo)
        });
        if (result.ok) {
            /**
             * @type {import(".").CreateTodoResponse}
             */
            const newTodo = await result.json();
            return newTodo.data
        }
    } catch (error) {
        console.error(error);
        return false
    }
}
