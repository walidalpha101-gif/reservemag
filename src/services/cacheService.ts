
import { clearIndexedDbPersistence } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const cacheService = {
  async clearBrowserCache() {
    console.log('Clearing browser storage...');
    localStorage.clear();
    sessionStorage.clear();

    try {
      console.log('Clearing Firestore persistence...');
      await clearIndexedDbPersistence(db);
    } catch (err) {
      console.warn('Firestore persistence not cleared (may not be enabled):', err);
    }

    if ('caches' in window) {
      console.log('Clearing Cache API stores...');
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      } catch (err) {
        console.error('Error clearing Cache API:', err);
      }
    }

    if ('serviceWorker' in navigator) {
      console.log('Unregistering service workers...');
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      } catch (err) {
        console.error('Error unregistering Service Workers:', err);
      }
    }
  },

  async hardReload() {
    await this.clearBrowserCache();
    console.log('Force reloading...');
    // window.location.reload(true) is deprecated in some browsers, 
    // so we use this common pattern to force reload from server
    window.location.href = window.location.origin + window.location.pathname + '?cache=' + Date.now();
  }
};
