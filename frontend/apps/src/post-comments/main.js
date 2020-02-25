/* global commentsTranslations */
/* eslint no-new: off */
import { _ } from '../i18n';
import App from './Comments.svelte';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Load comments');
  _.set(param => commentsTranslations[param] || param);
  new App({
    target: document.querySelector('#cont') || document.querySelector('#body_wrapper'),
    props: {},
  });
});
