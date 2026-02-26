export type TaskStatus = "todo" | "inprogress" | "done";

export interface Task {
  _id?: string;          // MongoDB ID
  title: string;
  description: string;
  time: string;          // "HH:mm"
  duration: number;      // minutes
  createdAt: number;
  status: TaskStatus;
}
// Request/Response DTOs for type safety
export interface CreateTaskRequest {
  title: string;
  description: string;
  time: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  time?: string;
  status?: TaskStatus;
}

export interface TaskResponse extends Task {}
