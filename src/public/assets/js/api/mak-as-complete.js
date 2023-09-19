/**
 * @param {string} todoId 
 * @returns 
 */
export async function markAsComplete(todoId) {
    try {
        const result = await fetch(`/todos/${todoId}/complete`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (result.ok) {
            /**
            * @type {import(".").CreateTodoResponse}
            */
            const completedTodo = await result.json();
            return completedTodo.data
        }
    } catch (error) {
        console.error(error);
        return false
    }
}