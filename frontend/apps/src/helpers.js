/* global grecaptcha */

export function genAvatarUrl(user) {
  if (user.isavatar) {
    return `${window.avatarHost}/${parseInt(user.id / 1000, 10)}/${user.id}.png?v=${user.avatar_version}`;
  }
  return `${window.avatarHost}/anonym.png`;
}

let permissionNotification = 'default';

export function requestNotificationPermission() {
  if (permissionNotification.toLowerCase() === 'default') {
    Notification.requestPermission((result) => {
      permissionNotification = result;
    });
  }
}

export function showNotification(title, tag, text, icon) {
  let mailNotification;
  switch (permissionNotification.toLowerCase()) {
    case 'granted':
      mailNotification = new Notification(title, {
        tag,
        body: text,
        icon,
      });
      mailNotification.onclick = () => {
        window.focus();
        this.cancel();
      };
      break;
    case 'denied':
      break;
    case 'default':
      Notification.requestPermission((result) => {
        permissionNotification = result;
      });
      mailNotification = new Notification(title, {
        tag,
        body: text,
        icon,
      });
      mailNotification.onclick = () => {
        window.focus();
        this.cancel();
      };
      break;
    default:
      break;
  }
}

export function loadScript(src) {
  return new Promise((resolve) => {
    let r = false;
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    s.onload = () => {
      if (!r && (!s.readyState || s.readyState === 'complete')) {
        r = true;
        resolve();
      }
    };
    s.onreadystatechange = s.onload;
    const t = document.getElementsByTagName('script')[0];
    t.parentNode.insertBefore(s, t);
  });
}

export const captchaUrl = 'https://www.google.com/recaptcha/api.js?render=6LekE2wUAAAAAMLyxxd5Iz5HC1owZ6yQXxYMuNYO';

export function getCaptcha() {
  return new Promise((resolve, reject) => {
    grecaptcha.ready(() => {
      grecaptcha.execute('6LekE2wUAAAAAMLyxxd5Iz5HC1owZ6yQXxYMuNYO', { action: 'add_comment' })
        .then(resolve, reject);
    });
  });
}