import { Hono } from "hono";
import { getTodosByUserId } from "./db/queries";
import { UUID } from "crypto";

const app = new Hono();

app.get("/todos", async (c) => {
  const userId = c.req.query("userId");

  if (!userId) {
    return c.json({ error: "Missing userId query parameter" }, 400);
  }

  try {
    const todos = await getTodosByUserId(userId as UUID);
    return c.json({ todos });
  } catch (error) {
    return c.json({ error: "Failed to fetch todos" }, 500);
  }
});

export default app;
