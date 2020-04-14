/* global messagesTranslations */
/* eslint no-new: off */
import { _ } from '../i18n';
import App from './App.svelte';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Load messages app');
  _.set(param => messagesTranslations[param] || param);
  new App({
    target: document.querySelector('#cont') || document.querySelector('#body_wrapper'),
    props: {},
  });
});
