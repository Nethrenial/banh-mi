import { BanhMiApplication } from "./core/index.js";
import { booksController } from "./controllers/index.js"
import { BanhMiBodyParsingMethod } from "./core/types/banh-mi-request.types.js";

const app = new BanhMiApplication();

app.setupBodyParsers(BanhMiBodyParsingMethod.json, BanhMiBodyParsingMethod.urlencoded, BanhMiBodyParsingMethod.text, BanhMiBodyParsingMethod.raw)

app.setupGlobalMiddleware((req, res) => {
  req.message1 = "Hello from middleware 1"
  return res.send("I intercepted the request")
})

app.setupRouter("/books", booksController)


function sleep(ms: number, message?: string) {
  return new Promise<string>((resolve, reject) => {
    setTimeout(() => { resolve(message ?? "Hello World") }, ms)
  })
}


app.get("/", (req, res) => {
  req.message1 = "Hello from middleware 1"
}, async (req, res) => {
  console.time("Time to settle message 2")
  req.message2 = await sleep(2, "Hello from middleware 2")
  console.timeEnd("Time to settle message 2")
}, (req, res) => {
  req.message3 = "Hello from middleware 3"
}, (req, res) => {
  [1, 2, 3].forEach(n => {
    console.log(req[`message${n}`])
  })
  return res.send("Done going through all middleware")
});


// app.get("/:anyRoute", (req, res) => {
//   console.log(req.params)
// })

// app.get("/books", (req, res) => {
//   console.log(`I'm the '/books' route`);
// })

// app.get("/books/:bookId", (req, res) => {
//   console.log(req.params);
// });


// app.get("/books/:bookId/chapters", (req, res) => {
//   console.log(`I'm the '/books/:id/chapters' route`);
// });


// app.get("/books/:bookId/chapters/:chapterId", (req, res) => {
//   console.log(`I'm the '/books/:id/chapters/:chapterId' route`);
// });



// app.get("/books/:bookId/chapters/:chapterId/update", async (req, res) => {
//   console.log(`I'm the '/books/:id/chapters/:chapterId/update' route`);
//   const result = await sleep(100)
//   return res.json(result)
// });


// app.get("/books/:bookId/chapters/:chapterId/delete", (req, res) => {
//   console.log(`I'm the '/books/:id/chapters/:chapterId/delete' route`);
// });


app.get("/authors/:authorId/books/:bookId/download", (req, res) => {
  req.message1 = "Hello from middleware 1"
}, async (req, res) => {
  // console.time("Time to settle message 2")
  req.message2 = "Hello from middleware 2"
  // console.timeEnd("Time to settle message 2")
}, (req, res) => {
  req.message3 = "Hello from middleware 3"
}, (req, res) => {
  [1, 2, 3].forEach(n => {
    console.log(req[`message${n}`])
  })
  return res.send({ message: "Done going through all middleware", params: req.params })
});

let num_of_requests = 0
let queries : Record<string, string> = {}

app.get("/get-params", (req, res) => {
  num_of_requests++
  for (const key in req.query) {
    if (Object.prototype.hasOwnProperty.call(req.query, key)) {
      const element = req.query[key];
      queries[key] = element
    }
  }
  if(req.query["num_of_requests"]) {
    console.log(num_of_requests)
    console.log(`Number of random query params: ${Object.entries(queries).length}`)
    console.log(Bun.write('query-params.json',JSON.stringify(queries)))
  }
  return res.json({ message: "All the params"})
})



app.listen(3000, (server) => {
  console.log(`Server started listening on http://localhost:${server.port}`);
});
