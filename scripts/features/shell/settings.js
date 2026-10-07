import { openDialog } from '../../components/modal.js';
import { getMotion, getTheme, setMotion, subscribe } from '../../core/store.js';
import { el } from '../../utils/dom.js';
import { MOTION_OPTIONS, THEME_OPTIONS, fromChoice, toChoice } from './preferences.js';
import { changeTheme } from './theme.js';

let openSettingsDialog = null;

function createChoiceGroup({ name, legend, hint, options, read, write }) {
  const inputs = options.map((option) =>
    el('input', {
      class: 'choice__input',
      type: 'radio',
      name,
      value: option.value,
      on: {
        change: (event) => write(fromChoice(option.value), event.target.closest('.choice')),
      },
    }),
  );

  function sync() {
    const selected = toChoice(read());
    for (const input of inputs) input.checked = input.value === selected;
  }

  const element = el(
    'fieldset',
    { class: 'choice-group' },
    el('legend', { class: 'choice-group__legend' }, legend),
    el(
      'div',
      { class: 'choice-group__options' },
      options.map((option, index) =>
        el(
          'label',
          { class: 'choice' },
          inputs[index],
          el('span', { class: 'choice__label' }, option.label),
        ),
      ),
    ),
    hint ? el('p', { class: 'choice-group__hint' }, hint) : null,
  );
  sync();
  return { element, sync };
}

export function openSettings() {
  if (openSettingsDialog) return;
  const themeGroup = createChoiceGroup({
    name: 'settings-theme',
    legend: 'Тема',
    options: THEME_OPTIONS,
    read: getTheme,
    write: changeTheme,
  });
  const motionGroup = createChoiceGroup({
    name: 'settings-motion',
    legend: 'Движение',
    hint: 'Уменьшенное движение убирает плавные появления и сдвиги.',
    options: MOTION_OPTIONS,
    read: getMotion,
    write: (motion) => setMotion(motion),
  });
  const unsubscribe = subscribe((change) => {
    if (change.type === 'theme') themeGroup.sync();
    if (change.type === 'motion') motionGroup.sync();
  });
  openSettingsDialog = openDialog({
    title: 'Настройки',
    body: el('div', { class: 'settings' }, themeGroup.element, motionGroup.element),
    onClose: () => {
      unsubscribe();
      openSettingsDialog = null;
    },
  });
}
