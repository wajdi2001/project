import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCxBj7XO2kkClcU3posuhtb4IQpebmzxVg",
  authDomain: "coffeepos-17279.firebaseapp.com",
  projectId: "coffeepos-17279",
  storageBucket: "coffeepos-17279.firebasestorage.app",
  messagingSenderId: "1035422303973",
  appId: "1:1035422303973:web:68546661ce586051daf60c",
  measurementId: "G-SRZZG3JYBJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;