import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

import { SiteSettings } from '../types';
import { settingsService } from '../services/settingsService';

interface FirebaseContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  siteSettings: SiteSettings | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  siteSettings: null,
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const settings = await settingsService.getSiteSettings();
        setSiteSettings(settings);
      } catch (err) {
        console.error("Failed to initialize site data/settings:", err);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && user.email === 'walid.alpha101@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, isAdmin, loading, siteSettings }}>
      {children}
    </FirebaseContext.Provider>
  );
};
