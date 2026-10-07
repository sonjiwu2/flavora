import { icon } from '../../components/icons.js';
import { buildHref, setPageTitle } from '../../core/router.js';
import { el } from '../../utils/dom.js';

export function mount(outlet) {
  setPageTitle('Страница не найдена');
  outlet.append(
    el(
      'section',
      { class: 'notice-screen' },
      el('h1', { class: 'page-title' }, 'Такой страницы в блокноте нет'),
      el(
        'p',
        { class: 'notice-screen__text' },
        'Возможно, рецепт переименован или ссылка устарела. Все рецепты по-прежнему лежат в каталоге.',
      ),
      el(
        'a',
        { class: 'button', href: buildHref('/recipes') },
        icon('arrow-left'),
        'Вернуться к рецептам',
      ),
    ),
  );
}
