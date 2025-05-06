export async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      await navigator.wakeLock.request('screen');
      console.log('Wake lock активирован');
    } catch (err) {
      console.error('Не удалось получить wake lock:', err);
    }
  } else {
    console.warn('Wake Lock API не поддерживается в этом браузере.');
  }
}

