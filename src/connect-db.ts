import { connect } from "mongoose"


export async function connectDB() {
    const mongoUri = Bun.env['MONGO_URI']
    if (!mongoUri) {
        throw new Error("Mongo URI not found")
    }

    await connect(mongoUri)
    console.log("[Server]: Connected to MongoDB")
}