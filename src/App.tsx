import { Authenticated, Unauthenticated, useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold accent-text">Случайный рецепт</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const recipes = useQuery(api.recipes.listRecipes);
  const generateRecipe = useAction(api.recipes.generateRecipe);
  const saveRecipe = useMutation(api.recipes.saveRecipe);
  const [ingredients, setIngredients] = useState("");
  const [currentRecipe, setCurrentRecipe] = useState<null | {
    title: string;
    ingredients: string[];
    instructions: string;
  }>(null);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const ingredientList = ingredients.split(",").map(i => i.trim());
      const recipe = await generateRecipe({ ingredients: ingredientList });
      setCurrentRecipe(recipe);
    } catch (error) {
      toast.error("Failed to generate recipe");
    }
  }

  async function handleSave() {
    if (!currentRecipe) return;
    try {
      await saveRecipe(currentRecipe);
      toast.success("Recipe saved!");
    } catch (error) {
      toast.error("Failed to save recipe");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold accent-text mb-4">Случайный рецепт</h1>
        <Authenticated>
          <p className="text-xl text-slate-600">
            Что приготовить сегодня, {loggedInUser?.email}?
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-slate-600">Sign in to get started</p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>

      <Authenticated>
        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Enter ingredients, separated by commas"
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600"
          >
            Generate Recipe
          </button>
        </form>

        {currentRecipe && (
          <div className="border p-4 rounded">
            <h2 className="text-2xl font-bold mb-4">{currentRecipe.title}</h2>
            <h3 className="font-semibold mb-2">Ingredients:</h3>
            <ul className="list-disc pl-5 mb-4">
              {currentRecipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <p className="whitespace-pre-wrap">{currentRecipe.instructions}</p>
            <button
              onClick={handleSave}
              className="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Save Recipe
            </button>
          </div>
        )}

        {recipes && recipes.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Saved Recipes</h2>
            <div className="space-y-4">
              {recipes.map((recipe) => (
                <div key={recipe._id} className="border p-4 rounded">
                  <h3 className="text-xl font-semibold">{recipe.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(recipe.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Authenticated>
    </div>
  );
}
