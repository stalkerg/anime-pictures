/* eslint-disable import/prefer-default-export */
import { writable } from 'svelte/store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/es';
import 'dayjs/locale/it';
import 'dayjs/locale/ru';
import 'dayjs/locale/de';
import 'dayjs/locale/fr';
import 'dayjs/locale/ja';
import 'dayjs/locale/zh-cn';

const localeName = window.lang.replace('jp', 'ja').replace('zh_CN', 'zh-cn');

dayjs.locale(localeName);
dayjs.extend(relativeTime);
dayjs.extend(LocalizedFormat);

export const _ = writable(param => param);
export const language = writable(localeName);
