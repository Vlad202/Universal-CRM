import VMdEditor from '@kangc/v-md-editor';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import Prism from 'prismjs';

VMdEditor.use(githubTheme, { Prism });

// Все ключи, которые ожидаются с .toolbar
const toolbarKeys = [
  'bold', 'underline', 'italic', 'strikeThrough',
  'title', 'sub', 'sup', 'quote',
  'unorderedList', 'orderedList',
  'code', 'link', 'image', 'table',
  'mermaid', 'katex',
  'revoke', 'next', 'save', 'prettier',
  'pageFullscreen', 'fullscreen', 'preview', 'htmlPreview',
  'catalog', 'github',
  'undo', 'redo', 'clear',
  'h', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strikethrough', 'ul', 'li', 'ol', 'codeBlock', 'hr',
  'imageLink', 'imageUpload', 'imagePaste',
  'syncScrollLang', 'syncScroll',
];

// Генерация объекта вида { bold: { toolbar: "Жирний" }, ... }
const langConfig = Object.fromEntries(
  toolbarKeys.map(key => [key, { toolbar: key }])
);

// Основной язык
VMdEditor.lang.use('uk-UA', {
  ...langConfig,
  toolbarTips: {
    bold: 'Жирний',
    italic: 'Курсив',
    quote: 'Цитата',
    save: 'Зберегти',
    preview: 'Перегляд'
    // можешь дополнить
  },
  editor: {
    input: 'Введіть текст...',
    select: 'Обрати',
    upload: 'Завантажити',
    autoSave: 'Автозбереження'
  },
  toc: {
    title: 'Зміст',
    close: 'Закрити'
  },
  syncScrollLang: {
    enable: 'Увімкнути синхронний скрол',
    disable: 'Вимкнути синхронний скрол'
  },
  uploadLang: {
    drag: 'Перетягніть файли або клацніть для завантаження',
    upload: 'Завантажити'
  }
});

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VMdEditor);
});
