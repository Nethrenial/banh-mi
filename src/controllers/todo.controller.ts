import { BanhMiRouter, JsonSerializable } from "../../core"
import { TodoService } from "../services"

const todoController = new BanhMiRouter()
const todoService = new TodoService()

todoController.get("/", async (req, res) => {
    return res.sendFile("/index.html")
})

todoController.get("/retrieve", async (req, res) => {
    const todos = await todoService.getTodoList()
    if (todos) {
        return res.json({
            status: "OK",
            data: todos
        } as JsonSerializable)
    }
    return new Response(JSON.stringify({
        status: "Internal Server Error"
    }), {
        status: 500, headers: {
            "content-type": "application/json"
        }
    })

})

todoController.post("/create", async (req, res) => {
    const todoText = req.getBody<string | undefined>()
    if (!todoText) return new Response(JSON.stringify({
        status: "Bad Request",
        errors: [
            {
                field: "text",
                message: "Text is required"
            }
        ]
    }), {
        status: 400, headers: {
            "content-type": "application/json"
        }
    })

    let createdTodo = await todoService.createTodo(
        todoText
    )
    if (!createdTodo) return new Response(JSON.stringify({
        status: "Internal Server Error"
    }), {
        status: 500, headers: {
            "content-type": "application/json"
        }
    })

    const { _id, text, createdAt, updatedAt, complete } = createdTodo

    return res.json({
        status: "CREATED",
        data: {
            _id,
            text,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
            complete
        }
    })
})


todoController.patch("/:todoId/complete", async (req, res) => {
    const { todoId } = req.getParams<{ todoId?: string }>()
    if (!todoId) return new Response(JSON.stringify({
        status: "Bad Request",
        errors: [
            {
                field: "todoId",
                message: "Todo id is required"
            }
        ]
    }), {
        status: 400, headers: {
            "content-type": "application/json"
        }
    })

    let updatedTodo = await todoService.markAsComplete(todoId)
    if (!updatedTodo) return new Response(JSON.stringify({
        status: "Internal Server Error"
    }), {
        status: 500, headers: {
            "content-type": "application/json"
        }
    })

    const { _id, text, createdAt, updatedAt, complete } = updatedTodo

    return res.json({
        status: "OK",
        data: {
            _id,
            text,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
            complete
        }
    })
})


todoController.delete("/:todoId/remove", async (req, res) => {
    const { todoId } = req.getParams<{ todoId?: string }>()
    if (!todoId) return new Response(JSON.stringify({
        status: "Bad Request",
        errors: [
            {
                field: "todoId",
                message: "Todo id is required"
            }
        ]
    }), {
        status: 400, headers: {
            "content-type": "application/json"
        }
    })

    let deleted = await todoService.deleteTodoById(todoId)
    if (!deleted) return new Response(JSON.stringify({
        status: "Internal Server Error"
    }), {
        status: 500, headers: {
            "content-type": "application/json"
        }
    })

    return res.json({
        status: "OK",
    })
})



export { todoController }