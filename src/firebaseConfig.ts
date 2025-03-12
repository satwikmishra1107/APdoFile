// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxfF7Fff_jROJanlJ8mxDEypJFbGx8m_Y",
  authDomain: "chunkydiscord-25.firebaseapp.com",
  projectId: "chunkydiscord-25",
  storageBucket: "chunkydiscord-25.firebasestorage.app",
  messagingSenderId: "119390820458",
  appId: "1:119390820458:web:42639495dd66a19f16d213",
  measurementId: "G-1TGG8NN548"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export const db=getFirestore(app)

export default app;