import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FeaturedRequest, FeaturedRequestStatus } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { sanitizeForFirestore } from '../lib/schemas';

const COLLECTION_NAME = 'featured_requests';

export const leadService = {
  async submitRequest(request: Omit<FeaturedRequest, 'id' | 'createdAt' | 'status'>) {
    try {
      const cleanData = sanitizeForFirestore({
        ...request,
        status: 'New' as FeaturedRequestStatus,
        createdAt: serverTimestamp()
      });
      const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
      throw error;
    }
  },

  async getAllRequests() {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FeaturedRequest));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async updateRequestStatus(id: string, status: FeaturedRequestStatus) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
      throw error;
    }
  },

  async deleteRequest(id: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
      throw error;
    }
  }
};
