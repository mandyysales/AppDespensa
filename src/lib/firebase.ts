import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  projectId: firebaseConfigJson.projectId,
  appId: firebaseConfigJson.appId,
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicialização do Firestore com suporte explícito a persistência IndexedDB offline
let dbInstance;

try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, firebaseConfigJson.firestoreDatabaseId || '(default)');
} catch (e) {
  // Fallback caso já esteja inicializado ou ambiente não suporte IndexedDB
  try {
    dbInstance = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || '(default)');
  } catch (err) {
    dbInstance = getFirestore(app);
  }
}

export const db = dbInstance;
export default app;
