import { BanhMiRouter } from "../../core/index.js"


const todoController = new BanhMiRouter()

todoController.get("/", async (req, res) => {
    return res.sendFile("/index.html")    
})

todoController.post("/create", async (req, res) => {
    console.log(req.body)
    return res.send("Todo created")
})


export { todoController }