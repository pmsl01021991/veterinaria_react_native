import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBeJ3_hABLyfaBD4D1NL-UzHfgOyiunsZg',
  authDomain: 'veterinariainterfaces3.firebaseapp.com',
  projectId: 'veterinariainterfaces3',
  storageBucket: 'veterinariainterfaces3.firebasestorage.app',
  messagingSenderId: '323242753044',
  appId: '1:323242753044:web:c86c8827c16a2f688afb01',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);