import { BanhMiApplication, BanhMiBodyParsingMethod } from "../core";
import {connectDB} from "./connect-db"
import { todoController } from "./controllers"

// creating a new BanhMiApplication instance
const app = new BanhMiApplication();

// setting up body parsers
app.setupBodyParsers(
  BanhMiBodyParsingMethod.json,
  BanhMiBodyParsingMethod.urlencoded,
  BanhMiBodyParsingMethod.text,
  BanhMiBodyParsingMethod.raw
)

// setting up static folder
app.setupStaticFolder("src/public")

// setting up routers
app.setupRouter("/todos", todoController)


// connecting to mongodb atlas
await connectDB()


// starting the server
const port = Bun.env['PORT'] || 3000
app.listen(port, (server) => {
  console.log(`[Server]: Started listening on http://localhost:${server.port}`);
});
