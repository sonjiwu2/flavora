export const CATEGORIES = Object.freeze([
  { id: 'breakfast', label: 'Завтраки' },
  { id: 'soup', label: 'Супы' },
  { id: 'salad', label: 'Салаты' },
  { id: 'pasta', label: 'Паста' },
  { id: 'meat', label: 'Мясо' },
  { id: 'fish', label: 'Рыба' },
  { id: 'vegetable', label: 'Овощные блюда' },
  { id: 'baking', label: 'Выпечка' },
  { id: 'dessert', label: 'Десерты' },
]);

const labelsById = new Map(CATEGORIES.map((category) => [category.id, category.label]));

export function getCategoryLabel(categoryId) {
  return labelsById.get(categoryId) ?? '';
}
