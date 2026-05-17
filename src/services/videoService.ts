import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  serverTimestamp,
  where,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { VideoInterview } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

const COLLECTION_NAME = 'video_interviews';

export const videoService = {
  async getAllVideos(): Promise<VideoInterview[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VideoInterview));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async getFeaturedVideos(): Promise<VideoInterview[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('featured', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VideoInterview));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async createVideo(video: Omit<VideoInterview, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...video,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    }
  },

  async updateVideo(id: string, video: Partial<VideoInterview>) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...video
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async deleteVideo(id: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  }
};
