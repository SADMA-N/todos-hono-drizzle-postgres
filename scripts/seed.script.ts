import * as schema from "../src/db/schema";
import { db, pool } from "../src/db/db";
import { reset, seed } from "drizzle-seed";

export const seedDb = async () => {
  await reset(db, schema);

  await seed(db, schema).refine((funcs) => ({
    usersTable: {
      columns: { age: funcs.int({ minValue: 0, maxValue: 120 }) },
      count: 10,
      with: {
        todosTable: 10,
      },
    },
    todosTable: {
      columns: {
        title: funcs.valuesFromArray({
          values: [
            "Buy groceries",
            "Walk the dog",
            "Finish project",
            "Go to the gym",
            "Read a book",
            "Exercise",
            "Cook dinner",
            "Clean the house",
            "Pay bills",
            "Plan vacation",
          ],
        }),
        description: funcs.valuesFromArray({
          values: [
            "Remember to buy milk, eggs, and bread.",
            "Take the dog for a walk in the park.",
            "Complete the project by the end of the week.",
            "Go to the gym for a workout session.",
            "Read 'The Great Gatsby' for book club.",
            "Do some cardio and strength training exercises.",
            "Cook a healthy dinner with vegetables and protein.",
            "Clean the living room and kitchen.",
            "Pay electricity and internet bills online.",
            "Plan a vacation to the beach for next month.",
          ],
        }),
      },
    },
  }));
};

seedDb()
  .then(() => {
    console.log("Database seed successfully");
    return pool.end();
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
    return pool.end();
  });
