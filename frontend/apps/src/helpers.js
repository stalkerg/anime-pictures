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