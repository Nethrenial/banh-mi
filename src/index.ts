import { BanhMiApplication } from "./core/index.js";

const app = new BanhMiApplication();

app.get("/", (req, res) => {
  console.log(`I'm the '/' route`);
});

console.time("Time to register routes")

app.get("/:anyRoute", (req, res) => {
  console.log(`I'm the '/:anyRoute' route`)
})

app.get("/books", (req, res) => {
  console.log(`I'm the '/books' route`);
})

app.get("/books/:id", (req, res) => {
  console.log(`I'm the '/books/:id' route`);
});


app.get("/books/:id/chapters", (req, res) => {
  console.log(`I'm the '/books/:id/chapters' route`);
});


app.get("/books/:id/chapters/:chapterId", (req, res) => {
  console.log(`I'm the '/books/:id/chapters/:chapterId' route`);
});

app.get("/books/:id/chapters/:chapterId/update", (req, res) => {
  console.log(`I'm the '/books/:id/chapters/:chapterId/update' route`);
});


app.get("/books/:id/chapters/:chapterId/delete", (req, res) => {
  console.log(`I'm the '/books/:id/chapters/:chapterId/delete' route`);
});

console.timeEnd("Time to register routes")




app.listen(3000, (server) => {
  console.log(`Server started listening on http://localhost:${server.port}`);
});
