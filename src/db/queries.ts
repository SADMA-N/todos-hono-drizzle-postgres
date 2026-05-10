import { UUID } from "crypto";
import { todosTable, usersTable } from "./schema";
import { eq, desc } from "drizzle-orm";
import { db } from "./db";

export type NewTodo = {
  userId: UUID;
  title: string;
  description?: string;
  completed?: boolean;
};

export const insertUser = async (email: string, password: string) => {
  const passwordHash = await Bun.password.hash(password);

  const [user] = await db
    .insert(usersTable)
    .values({
      email,
      passwordHash,
    })
    .returning();

  return user.id as UUID;
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
  return createdTodo;
};
