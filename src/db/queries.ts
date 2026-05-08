import { UUID } from "crypto";
import { todosTable } from "./schema";
import { eq, desc } from "drizzle-orm";
import { db } from "./db";

type NewTodo = {
  userId: UUID;
  title: string;
  description?: string;
  completed?: boolean;
};

export const getTodosByUserId = async (userId: UUID) => {
  const todos = await db
    .select()
    .from(todosTable)
    .where(eq(todosTable.userId, userId))
    .orderBy(desc(todosTable.createdAt));
  return todos;
};

export const insertTodo = async (todo: NewTodo) => {
  const [createdTodo] = await db.insert(todosTable).values(todo).returning();
};
