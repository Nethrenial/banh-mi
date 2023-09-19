import mongoose from "mongoose";

// create a todo model with id, text, complete, default created_at and updated_at
const todoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    complete: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });


// make a ts interface for the todo model
export interface TodoInterface extends mongoose.Document {
    text: string
    complete: boolean
    createdAt: Date
    updatedAt: Date
}

// export the model
export const Todo = mongoose.model<TodoInterface>("Todo", todoSchema)