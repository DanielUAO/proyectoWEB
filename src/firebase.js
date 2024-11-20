// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbe2aLox18uN0E6FNCXjepZI1IYgnd-aE",
  authDomain: "tienda-d4d0b.firebaseapp.com",
  projectId: "tienda-d4d0b",
  storageBucket: "tienda-d4d0b.firebasestorage.app",
  messagingSenderId: "827139776211",
  appId: "1:827139776211:web:c579bc2b7e35938761fe26"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, collection, getDocs, addDoc, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, storage, ref, uploadBytes, getDownloadURL };
