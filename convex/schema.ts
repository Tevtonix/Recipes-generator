import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  recipes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    ingredients: v.array(v.string()),
    instructions: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
