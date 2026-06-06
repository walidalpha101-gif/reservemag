import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  limit, 
  serverTimestamp,
  writeBatch,
  documentId
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Article } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { demoArticles } from '../data/demoContent';
import { normalizeArticle, sanitizeForFirestore } from '../lib/schemas';

const COLLECTION_NAME = 'articles';

export const articleService = {
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  async seedDemoData() {
    try {
      console.log('Seeding demo data...');
      const batch = writeBatch(db);
      
      for (const article of demoArticles) {
        const docRef = doc(db, COLLECTION_NAME, article.slug);
        batch.set(docRef, sanitizeForFirestore({
          ...article,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }), { merge: true });
      }
      
      await batch.commit();
      console.log('Demo data seeded successfully');
    } catch (error) {
      console.error('Error seeding demo data:', error);
    }
  },

  async ensureContentExists() {
    try {
      const q = query(collection(db, COLLECTION_NAME), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.warn('Archive empty. Initiating emergency recovery...');
        await this.seedDemoData();
        return true;
      }
      return false;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return false;
    }
  },

  async getAllArticles(includeDrafts = true): Promise<Article[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));
      
      if (!includeDrafts) {
        q = query(
          collection(db, COLLECTION_NAME), 
          where('status', '==', 'published'),
          orderBy('updatedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => normalizeArticle({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async getPublishedArticles(limitCount: number = 50): Promise<Article[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'published'),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => normalizeArticle({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async getArticlesByIds(ids: string[]): Promise<Article[]> {
    if (!ids || ids.length === 0) return [];
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where(documentId(), 'in', ids.slice(0, 10))
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => normalizeArticle({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('slug', '==', slug), limit(1));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const doc = querySnapshot.docs[0];
      return normalizeArticle({ id: doc.id, ...doc.data() });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/slug/${slug}`);
      return null;
    }
  },

  async getFeaturedArticles(): Promise<Article[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('featured', '==', true),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => normalizeArticle({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async createArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const cleanSlug = article.slug || this.generateSlug(article.title);
      const cleanData = sanitizeForFirestore({
        ...article,
        slug: cleanSlug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    }
  },

  async updateArticle(id: string, article: Partial<Article>) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const cleanData = sanitizeForFirestore({
        ...article,
        updatedAt: serverTimestamp()
      });
      await updateDoc(docRef, cleanData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async deleteArticle(id: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async isAuthorUsed(authorId: string): Promise<boolean> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('authorId', '==', authorId), limit(1));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking author usage:', error);
      return false;
    }
  }
};
