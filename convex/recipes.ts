import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const generateRecipe = action({
  args: { ingredients: v.array(v.string()) },
  handler: async (ctx, args) => {
    const prompt = `Create a simple recipe using these ingredients: ${args.ingredients.join(", ")}. Format as JSON with fields: title, ingredients (array), instructions (string).`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No recipe generated");
    
    return JSON.parse(content);
  },
});

export const saveRecipe = mutation({
  args: {
    title: v.string(),
    ingredients: v.array(v.string()),
    instructions: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.insert("recipes", {
      userId,
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listRecipes = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
