import { z } from "zod";
import { TaskStatus } from "../types/task";
import mongoose from "mongoose";

// Validation for time format (HH:mm)
const timeFormatSchema = z
  .string()
  .regex(/^([0-6]|[0][0-5]):[0-5][0-9]$/, "Time must be in HH:mm format")
  .refine(
    (time) => {
      const [h, m] = time.split(":").map(Number);
      return h <= 6 && (h < 6 || m === 0); // Max 6 hours, if 6 then no minutes
    },
    "Time must be between 00:00 and 06:00"
  );

// Base schema for task creation
export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").trim(),
  description: z.string().min(1, "Task description cannot be empty").trim(),
  time: timeFormatSchema,
});

// Schema for task creation request
export const createTaskRequestSchema = createTaskSchema;

// Schema for task update (all fields optional)
export const updateTaskSchema = z.object({
  title: z.string().min(1).trim().optional(),
  description: z.string().min(1).trim().optional(),
  time: timeFormatSchema.optional(),
  status: z
    .enum(["todo", "inprogress", "done"] as const)
    .optional(),
});

// Schema for task status update
export const updateTaskStatusSchema = z.object({
  status: z.enum(["todo", "inprogress", "done"] as const),
});

// Schema for query parameters (id validation)
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("ID must be a positive integer"),
});



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

// Avoid model overwrite error in dev
export const TaskModel =
  mongoose.models.Task || mongoose.model("Task", TaskMongoSchema);


// Infer types from schemas for runtime type safety
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
