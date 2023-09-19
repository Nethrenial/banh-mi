/**
 * @param {string} todoId 
 * @returns 
 */
export async function deleteTodo(todoId) {
    try {
        const result = await fetch(`/todos/${todoId}/remove`, { method: 'DELETE'});
        if (result.ok) {
            const completedTodo = await result.json();
            return completedTodo.status
        }
    } catch (error) {
        console.error(error);
        return false
    }
}