import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDLcdpVEUHpaUP2IgMuYeszaHmmhODcHH8",
  authDomain: "online-sinav-2026.firebaseapp.com",
  projectId: "online-sinav-2026",
  storageBucket: "online-sinav-2026.firebasestorage.app",
  messagingSenderId: "11871426342",
  appId: "1:11871426342:web:6dbcda4a5542f8b475ade7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'pro-sinav-cloud-v5';