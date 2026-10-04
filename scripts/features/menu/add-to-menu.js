import { showToast } from '../../components/toast.js';
import { MEALS, setMeal } from '../../core/store.js';
import { getRecipe } from '../../data/recipes.js';

function toLocalIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function openAddToMenu(recipeId) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return;
  setMeal(toLocalIsoDate(new Date()), MEALS[2], recipeId);
  showToast(`«${recipe.title}» добавлено в меню на сегодня`);
}
