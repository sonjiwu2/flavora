import { buildHref, setPageTitle } from '../../core/router.js';
import { el } from '../../utils/dom.js';

export function mount(outlet) {
  setPageTitle('Страница не найдена');
  outlet.append(
    el('h1', { class: 'page-title' }, 'Такой страницы в блокноте нет'),
    el('p', {}, 'Возможно, рецепт переименован или ссылка устарела.'),
    el('a', { class: 'button', href: buildHref('/recipes') }, 'Вернуться к рецептам'),
  );
}
