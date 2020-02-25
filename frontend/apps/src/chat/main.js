/* global chatTranslations */
/* eslint no-new: off */
import { _ } from '../i18n';
import App from './App.svelte';

document.addEventListener('DOMContentLoaded', () => {
  _.set(param => chatTranslations[param] || param);
  new App({
    target: document.querySelector('#chat_body'),
    props: {},
  });
});
