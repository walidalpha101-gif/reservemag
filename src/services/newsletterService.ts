import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  deleteDoc, 
  doc, 
  addDoc, 
  serverTimestamp,
  where,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Subscriber } from '../types';
import { sanitizeForFirestore } from '../lib/schemas';

const COLLECTION_NAME = 'newsletter_subscribers';

export const newsletterService = {
  async subscribe(email: string, source: string = 'homepage_footer') {
    try {
      // Basic duplicate check (last 100 subs)
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('email', '==', email.toLowerCase()),
        limit(1)
      );
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        return { success: false, message: 'Already subscribed' };
      }

      const cleanData = sanitizeForFirestore({
        email: email.toLowerCase(),
        source,
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, COLLECTION_NAME), cleanData);
      return { success: true };
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
  },

  async getSubscribers(): Promise<Subscriber[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Subscriber));
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      return [];
    }
  },

  async removeSubscriber(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error removing subscriber:', error);
      throw error;
    }
  }
};
