import { collection, query, where, getDocs, orderBy, limit, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const cdnService = {
  /**
   * Smart Purge Logic
   * In a real production environment, this would call a CDN API (Cloudflare, Fastly, CloudFront).
   * Here we simulate identifying "Changed" paths and invalidating them.
   */
  async smartPurge() {
    console.log('Initiating Smart CDN Purge...');
    
    // Simulate finding modified content paths
    // In a real app, you'd fetch things updated since the last purge
    const changedPaths: string[] = ['/', '/stories'];
    
    try {
      const articlesRef = collection(db, 'articles');
      // Fetch articles updated in the last 24 hours (simulated logic)
      const q = query(articlesRef, orderBy('updatedAt', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.slug) {
          changedPaths.push(`/stories/${data.slug}`);
        }
      });

      console.log('Paths identified for intelligent invalidation:', changedPaths);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Log the purge event in Firestore for audit trail
      await addDoc(collection(db, 'system_logs'), {
        type: 'CDN_PURGE',
        mode: 'SMART',
        paths: changedPaths,
        timestamp: serverTimestamp(),
        status: 'SUCCESS'
      });

      return {
        success: true,
        purgedCount: changedPaths.length,
        paths: changedPaths
      };
    } catch (err) {
      console.error('Smart Purge Error:', err);
      throw new Error('FAILED_TO_COMMUNICATE_WITH_CDN');
    }
  }
};
