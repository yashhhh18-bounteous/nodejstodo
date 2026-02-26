import { z } from "zod";
import mongoose from "mongoose";

// Validation for time format (HH:mm)
const timeFormatSchema = z
  .string()
  .regex(/^([0-6]):[0-5][0-9]$/, "Time must be in HH:mm format")
  .refine((time) => {
    const [h, m] = time.split(":").map(Number);
    return h < 6 || (h === 6 && m === 0);
  }, "Time must be between 00:00 and 06:00");

// CREATE
export const createTaskSchema = z.object({
  title: z.string().min(1).trim(),
  description: z.string().min(1).trim(),
  time: timeFormatSchema,
});

export const createTaskRequestSchema = createTaskSchema;

// UPDATE
export const updateTaskSchema = z.object({
  title: z.string().min(1).trim().optional(),
  description: z.string().min(1).trim().optional(),
  time: timeFormatSchema.optional(),
  status: z.enum(["todo", "inprogress", "done"]).optional(),
});

// STATUS UPDATE
export const updateTaskStatusSchema = z.object({
  status: z.enum(["todo", "inprogress", "done"]),
});

// ✅ FIXED: ID AS STRING (Mongo ObjectId)
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// ----------------- MONGOOSE MODEL -----------------

const TaskMongoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true },
  createdAt: { type: Number, default: Date.now },
  status: {
    type: String,
    enum: ["todo", "inprogress", "done"],
    default: "todo",
  },
});

export const TaskModel =
  mongoose.models.Task || mongoose.model("Task", TaskMongoSchema);