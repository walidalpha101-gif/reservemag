import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SiteSettings, HomepageConfig } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

import { normalizeSettings, sanitizeForFirestore } from '../lib/schemas';

const SETTINGS_COLLECTION = 'settings';
const SITE_DOC = 'site';
const HOMEPAGE_DOC = 'homepage';

export const settingsService = {
  async getSiteSettings(): Promise<SiteSettings | null> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SITE_DOC);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return normalizeSettings(docSnap.data());
      }
      return normalizeSettings({});
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${SITE_DOC}`);
      return null;
    }
  },

  async updateSiteSettings(settings: SiteSettings) {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SITE_DOC);
      const cleanData = sanitizeForFirestore({ ...settings, updatedAt: serverTimestamp() });
      await setDoc(docRef, cleanData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${SETTINGS_COLLECTION}/${SITE_DOC}`);
    }
  },

  async getHomepageConfig(): Promise<HomepageConfig | null> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, HOMEPAGE_DOC);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as HomepageConfig;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${HOMEPAGE_DOC}`);
      return null;
    }
  },

  async updateHomepageConfig(config: HomepageConfig) {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, HOMEPAGE_DOC);
      await setDoc(docRef, { ...config, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${SETTINGS_COLLECTION}/${HOMEPAGE_DOC}`);
    }
  }
};
