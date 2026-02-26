import { TaskStatus } from "../types/task";
import { TaskModel } from "../schemas/taskSchemas";

// GET all tasks
export const getTasks = async () => {
  return await TaskModel.find().sort({ createdAt: -1 });
};

// GET task by ID
export const getTaskById = async (id: string) => {
  return await TaskModel.findById(id);
};

// CREATE task
export const createTask = async (
  title: string,
  description: string,
  time: string
) => {
  const [hours, minutes] = time.split(":").map(Number);

  return await TaskModel.create({
    title,
    description,
    time,
    duration: hours * 60 + minutes,
    status: "todo",
  });
};

// UPDATE task
export const updateTask = async (
  id: string,
  updates: {
    title?: string;
    description?: string;
    time?: string;
    status?: TaskStatus;
  }
) => {


  return await TaskModel.findByIdAndUpdate(id, updates, {
    new: true,
  });
};

// DELETE task
export const deleteTaskById = async (id: string) => {
  return await TaskModel.findByIdAndDelete(id);
};

// GET tasks by status
export const getTasksByStatus = async (status: TaskStatus) => {
  return await TaskModel.find({ status }).sort({ createdAt: -1 });
};