import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCjQJbjSsBzHjFyrhUUsSr6sxdvEa3y8II',
  authDomain: 'barcode-a8db8.firebaseapp.com',
  projectId: 'barcode-a8db8',
  storageBucket: 'barcode-a8db8.firebasestorage.app',
  messagingSenderId: '765431754954',
  appId: '1:765431754954:web:f28b3d1ed61da67a54c433',
  measurementId: 'G-36WC2ZM2QJ',
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
