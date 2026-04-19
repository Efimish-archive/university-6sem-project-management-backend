import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: int().primaryKey(),
  firstName: text().notNull(),
  lastName: text().notNull(),
  middleName: text().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  numbers: many(numbers),
}));

export const numbers = sqliteTable("numbers", {
  number: text().primaryKey(),
  car: text().notNull(),
  userId: int()
    .references(() => users.id)
    .notNull(),
});

export const numbersRelations = relations(numbers, ({ one }) => ({
  user: one(users, {
    fields: [numbers.userId],
    references: [users.id],
  }),
}));

export const admins = sqliteTable("admins", {
  id: int().primaryKey(),
  login: text().notNull(),
  passwordHash: text().notNull(),
});
