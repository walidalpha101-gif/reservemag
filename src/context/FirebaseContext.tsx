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
    // Real-Time Listener: This forces the Navbar/Footer to update the second you hit Save in the Admin Panel
    const unsubscribeSettings = settingsService.subscribeToSiteSettings((settings) => {
      setSiteSettings(settings);
    });

    // Cleanup the listener when the app unmounts
    return () => unsubscribeSettings();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && user.email === 'walid.alpha101@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, isAdmin, loading, siteSettings }}>
      {children}
    </FirebaseContext.Provider>
  );
};
