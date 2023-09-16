import { BanhMiRouter } from "../core/index.js"


const booksController = new BanhMiRouter()

const BOOKS = [
    { id: "1", name: "Cat 1" },
    { id: "2", name: "Cat 2" },
    { id: "3", name: "Cat 3" },
    { id: "4", name: "Cat 4" },
    { id: "5", name: "Cat 5" },
    { id: "6", name: "Cat 6" },
    { id: "7", name: "Cat 7" },
    { id: "8", name: "Cat 8" },
    { id: "9", name: "Cat 9" },
    { id: "10", name: "Cat 10" }]

booksController.get("/", (req, res) => {
    return res.send(BOOKS)
})

booksController.post("/", (req, res) => {
    console.log(req.body)
    return res.send("This action creates a book")
})

booksController.get("/:bookId", (req, res) => {
    return res.json(BOOKS.find(cat => cat.id === req.params.bookId))
})

booksController.get("/:bookId/chapters", (req, res) => {
    return res.send(`This action returns all chapters of book with id ${req.params.bookId}, also received the message ${req.message1}`)
})

booksController.get("/:bookId/chapters/:chapterId", (req, res) => {
    const params = req.getParams<{ bookId: string, chapterId: string }>()
    return res.send(`This action returns chapter with id = "${params.chapterId}" of book with id = "${params.bookId}"`)
})

export { booksController }

