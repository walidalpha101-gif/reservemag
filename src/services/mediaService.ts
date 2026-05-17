import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { MediaAsset } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

const COLLECTION_NAME = 'media';

export const mediaService = {
  async uploadFile(
    file: File, 
    path: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `${path}/${fileName}`);
    
    console.log(`Starting upload: ${path}/${fileName} (${(file.size / 1024).toFixed(2)} KB)`);
    
    return new Promise((resolve, reject) => {
      const metadata = {
        contentType: file.type,
      };

      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      // Initialize progress
      if (onProgress) onProgress(0);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress.toFixed(2)}%`);
          if (onProgress) onProgress(progress);
        }, 
        (error) => {
          console.error('Firebase Storage Upload Task Error:', {
            code: error.code,
            message: error.message,
            name: error.name,
            serverResponse: error.serverResponse
          });
          reject(error);
        }, 
        async () => {
          try {
            console.log('Upload complete, fetching download URL...');
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Download URL obtained:', downloadURL);
            
            // Also store metadata in Firestore
            try {
              await addDoc(collection(db, COLLECTION_NAME), {
                name: file.name,
                url: downloadURL,
                path: `${path}/${fileName}`,
                size: file.size,
                type: file.type,
                uploadedAt: serverTimestamp(),
              });
            } catch (fsError) {
              console.warn('Failed to save media metadata to Firestore, but upload succeeded:', fsError);
            }

            resolve(downloadURL);
          } catch (urlError) {
            console.error('Error getting download URL:', urlError);
            reject(urlError);
          }
        }
      );
    });
  },

  async uploadArticleImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
    return this.uploadFile(file, 'articles', onProgress);
  },

  async uploadSettingsImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
    return this.uploadFile(file, 'settings', onProgress);
  },

  async getAllAssets(): Promise<MediaAsset[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MediaAsset));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async deleteAsset(id: string, storagePath: string) {
    try {
      // Delete from Storage
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      
      // Delete from Firestore
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  }
};
