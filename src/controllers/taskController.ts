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
export const listTasks = async (_req: Request, res: Response): Promise<void> => {
  console.log("➡️ GET /tasks");
  try {
    const tasks = await getTasks();
    console.log("✅ tasks fetched:", tasks.length);
    res.json(tasks);
  } catch (error) {
    logError("LIST TASKS FAILED", error);
    res.status(500).json({ message: "Failed to retrieve tasks" });
  }
};

// GET /tasks/status/:status
export const getTasksByStatusHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("➡️ GET /tasks/status", req.params);
  try {
    const status = req.params.status as TaskStatus;

    if (!["todo", "inprogress", "done"].includes(status)) {
      console.warn("⚠️ Invalid status:", status);
      res.status(400).json({
        message: 'Status must be "todo", "inprogress", or "done"',
      });
      return;
    }

    const tasks = await getTasksByStatus(status);
    console.log(`✅ ${tasks.length} tasks with status=${status}`);
    res.json(tasks);
  } catch (error) {
    logError("GET TASKS BY STATUS FAILED", error);
    res.status(500).json({ message: "Failed to retrieve tasks by status" });
  }
};

// GET /tasks/:id
export const getSingleTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("➡️ GET /tasks/:id", req.params);
  try {
    const parseResult = idParamSchema.safeParse(req.params);

    if (!parseResult.success) {
      console.warn("⚠️ Invalid ID:", req.params);
      res.status(400).json({
        message: "Invalid task ID",
        errors: formatZodError(parseResult.error),
      });
      return;
    }

    const { id } = parseResult.data;
    const task = await getTaskById(id);

    if (!task) {
      console.warn("⚠️ Task not found:", id);
      res.status(404).json({ message: "Task not found" });
      return;
    }

    console.log("✅ Task found:", id);
    res.json(task);
  } catch (error) {
    logError("GET SINGLE TASK FAILED", error);
    res.status(500).json({ message: "Failed to retrieve task" });
  }
};

// POST /tasks
export const createSingleTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("➡️ POST /tasks", req.body);
  try {
    const parseResult = createTaskRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      console.warn("⚠️ Create validation failed");
      res.status(400).json({
        message: "Validation failed",
        errors: formatZodError(parseResult.error),
      });
      return;
    }

    console.log("⏳ Creating task...");
    const task = await createTask(
      parseResult.data.title,
      parseResult.data.description,
      parseResult.data.time
    );

    console.log("✅ Task created with id:", task._id);
    res.status(201).json(task);
  } catch (error) {
    logError("CREATE TASK FAILED", error);
    res.status(500).json({ message: "Failed to create task" });
  }
};

// PUT /tasks/:id
export const updateSingleTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("➡️ PUT /tasks/:id", req.params, req.body);
  try {
    const idParseResult = idParamSchema.safeParse(req.params);
    if (!idParseResult.success) {
      console.warn("⚠️ Invalid ID for update");
      res.status(400).json({
        message: "Invalid task ID",
        errors: formatZodError(idParseResult.error),
      });
      return;
    }

    const updateParseResult = updateTaskSchema.safeParse(req.body);
    if (!updateParseResult.success) {
      console.warn("⚠️ Update validation failed");
      res.status(400).json({
        message: "Validation failed",
        errors: formatZodError(updateParseResult.error),
      });
      return;
    }

    const updated = await updateTask(
      idParseResult.data.id,
      updateParseResult.data
    );

    if (!updated) {
      console.warn("⚠️ Task not found for update");
      res.status(404).json({ message: "Task not found" });
      return;
    }

    console.log("✅ Task updated:", updated._id);
    res.json(updated);
  } catch (error) {
    logError("UPDATE TASK FAILED", error);
    res.status(500).json({ message: "Failed to update task" });
  }
};

// PATCH /tasks/:id/status
export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("➡️ PATCH /tasks/:id/status", req.params, req.body);
  try {
    const idParseResult = idParamSchema.safeParse(req.params);
    if (!idParseResult.success) {
      console.warn("⚠️ Invalid ID for status update");
      res.status(400).json({
        message: "Invalid task ID",
        errors: formatZodError(idParseResult.error),
      });
      return;
    }

    const statusParseResult = updateTaskStatusSchema.safeParse(req.body);
    if (!statusParseResult.success) {
      console.warn("⚠️ Status validation failed");
      res.status(400).json({
        message: "Validation failed",
        errors: formatZodError(statusParseResult.error),
      });
      return;
    }

    const updated = await updateTask(idParseResult.data.id, {
      status: statusParseResult.data.status,
    });

    if (!updated) {
      console.warn("⚠️ Task not found for status update");
      res.status(404).json({ message: "Task not found" });
      return;
    }

    console.log("✅ Status updated:", updated._id);
    res.json(updated);
  } catch (error) {
    logError("UPDATE STATUS FAILED", error);
    res.status(500).json({ message: "Failed to update task status" });
  }
};

// DELETE /tasks/:id
export const deleteSingleTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("➡️ DELETE /tasks/:id", req.params);
  try {
    const parseResult = idParamSchema.safeParse(req.params);
    if (!parseResult.success) {
      console.warn("⚠️ Invalid ID for delete");
      res.status(400).json({
        message: "Invalid task ID",
        errors: formatZodError(parseResult.error),
      });
      return;
    }

    const deleted = await deleteTaskById(parseResult.data.id);
    if (!deleted) {
      console.warn("⚠️ Task not found for delete");
      res.status(404).json({ message: "Task not found" });
      return;
    }

    console.log("✅ Task deleted:", deleted._id);
    res.json(deleted);
  } catch (error) {
    logError("DELETE TASK FAILED", error);
    res.status(500).json({ message: "Failed to delete task" });
  }
};