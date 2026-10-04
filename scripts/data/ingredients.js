export const ingredients = Object.freeze({
  spaghetti: { name: 'Спагетти' },
  pesto: { name: 'Песто' },
  parmesan: { name: 'Пармезан' },
  basil: { name: 'Базилик' },
  'pasta-water': { name: 'Вода от пасты', staple: true },
  salt: { name: 'Соль', staple: true },
  'black-pepper': { name: 'Чёрный перец', staple: true },
});

export function getIngredientName(ingredientId) {
  return ingredients[ingredientId]?.name ?? ingredientId;
}
