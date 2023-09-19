import {Todo} from "../models"

export class TodoService {


    async getTodoList() {
        try {
            const todos = Todo.find()
            return todos
        } catch (error) {
            console.log(error)
            return false
        }       
    }

    async createTodo(todoText: string) {
        try {
            const newTodo = new Todo({
                text: todoText,
                complete: false
            })
            const createdTodo = await newTodo.save()
            return createdTodo
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async markAsComplete(todoId: string) {
        try {
            const todo = await Todo.findById(todoId)
            if (!todo) return false
            todo.complete = true
            const updatedTodo = await todo.save()
            return updatedTodo
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async deleteTodoById(todoId: string) {
        try {
            const todo = await Todo.findById(todoId)
            if (!todo) return false
            await todo.deleteOne()
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }
}