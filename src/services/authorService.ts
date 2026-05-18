import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Author } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

const COLLECTION_NAME = 'authors';

export const authorService = {
  async getAllAuthors(): Promise<Author[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Author));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async getAuthorById(id: string): Promise<Author | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Author;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${id}`);
      return null;
    }
  },

  async createAuthor(author: Omit<Author, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...author,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
      throw error;
    }
  },

  async updateAuthor(id: string, author: Partial<Author>) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...author,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
      throw error;
    }
  },

  async deleteAuthor(id: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
      throw error;
    }
  }
};
