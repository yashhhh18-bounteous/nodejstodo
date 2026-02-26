import { Router } from "express";
import {
  createSingleTask,
  deleteSingleTask,
  getSingleTask,
  getTasksByStatusHandler,
  listTasks,
  updateSingleTask,
  updateTaskStatus,
} from "../controllers/taskController";

const taskRouter = Router();

// GET all tasks
taskRouter.get("/", listTasks);

// GET tasks by status (todo, inprogress, done)
taskRouter.get("/status/:status", getTasksByStatusHandler);

// GET single task by ID
taskRouter.get("/:id", getSingleTask);

// POST create new task
taskRouter.post("/", createSingleTask);

// PUT update task (all fields)
taskRouter.put("/:id", updateSingleTask);

// PATCH update task status only
taskRouter.patch("/:id/status", updateTaskStatus);

// DELETE task
taskRouter.delete("/:id", deleteSingleTask);

export default taskRouter;
