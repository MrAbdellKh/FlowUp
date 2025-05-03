import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyDKJpdfbZ5-Me5rJ8mNrZ4dToBvt59H6Uk",
  authDomain: "flowup-ed44b.firebaseapp.com",
  projectId: "flowup-ed44b",
  storageBucket: "flowup-ed44b.firebasestorage.app",
  messagingSenderId: "43844276882",
  appId: "1:43844276882:web:90a6486fbf6ffde16e0c4b",
  measurementId: "G-EM9VBZH9S7"
};


// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialiser Firebase Storage

export { auth, db, storage }; // Exporter Firebase Storage