import { Request, Response } from "express";
import {
  createTask,
  deleteTaskById,
  getTaskById,
  getTasks,
  getTasksByStatus,
  updateTask,
} from "../data/tasks";
import { TaskStatus } from "../types/task";
import {
  createTaskRequestSchema,
  idParamSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "../schemas/taskSchemas";
import { ZodError } from "zod";

// ---------- helpers ----------
const formatZodError = (error: ZodError): string =>
  error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");

const logError = (label: string, error: unknown) => {
  console.error(`\n❌ ${label}`);
  if (error instanceof Error) {
    console.error(error.message);
    console.error(error.stack);
  } else {
    console.error(error);
  }
};

// ---------- controllers ----------

// GET /tasks
export const listTasks = async (_req: Request, res: Response) => {
  console.log("➡️ GET /tasks");
  try {
    const tasks = await getTasks();
    res.json(tasks);
  } catch (error) {
    logError("LIST TASKS FAILED", error);
    res.status(500).json({ message: "Failed to retrieve tasks" });
  }
};

// GET /tasks/status/:status
export const getTasksByStatusHandler = async (req: Request, res: Response) => {
  try {
    const status = req.params.status as TaskStatus;

    if (!["todo", "inprogress", "done"].includes(status)) {
      return res.status(400).json({
        message: 'Status must be "todo", "inprogress", or "done"',
      });
    }

    const tasks = await getTasksByStatus(status);
    res.json(tasks);
  } catch (error) {
    logError("GET TASKS BY STATUS FAILED", error);
    res.status(500).json({ message: "Failed to retrieve tasks by status" });
  }
};

// GET /tasks/:id
export const getSingleTask = async (req: Request, res: Response) => {
  try {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid task ID",
        errors: formatZodError(parsed.error),
      });
    }

    const task = await getTaskById(parsed.data.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    logError("GET SINGLE TASK FAILED", error);
    res.status(500).json({ message: "Failed to retrieve task" });
  }
};

// POST /tasks
export const createSingleTask = async (req: Request, res: Response) => {
  try {
    const parsed = createTaskRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: formatZodError(parsed.error),
      });
    }

    const task = await createTask(
      parsed.data.title,
      parsed.data.description,
      parsed.data.time
    );

    res.status(201).json(task);
  } catch (error) {
    logError("CREATE TASK FAILED", error);
    res.status(500).json({ message: "Failed to create task" });
  }
};

// PUT /tasks/:id
export const updateSingleTask = async (req: Request, res: Response) => {
  try {
    const idParsed = idParamSchema.safeParse(req.params);
    const bodyParsed = updateTaskSchema.safeParse(req.body);

    if (!idParsed.success || !bodyParsed.success) {
      return res.status(400).json({
        message: "Validation failed",
      });
    }

    const updated = await updateTask(idParsed.data.id, bodyParsed.data);
    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updated);
  } catch (error) {
    logError("UPDATE TASK FAILED", error);
    res.status(500).json({ message: "Failed to update task" });
  }
};

// PATCH /tasks/:id/status
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const idParsed = idParamSchema.safeParse(req.params);
    const statusParsed = updateTaskStatusSchema.safeParse(req.body);

    if (!idParsed.success || !statusParsed.success) {
      return res.status(400).json({ message: "Validation failed" });
    }

    const updated = await updateTask(idParsed.data.id, {
      status: statusParsed.data.status,
    });

    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updated);
  } catch (error) {
    logError("UPDATE STATUS FAILED", error);
    res.status(500).json({ message: "Failed to update task status" });
  }
};

// DELETE /tasks/:id
export const deleteSingleTask = async (req: Request, res: Response) => {
  try {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const deleted = await deleteTaskById(parsed.data.id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(deleted);
  } catch (error) {
    logError("DELETE TASK FAILED", error);
    res.status(500).json({ message: "Failed to delete task" });
  }
};