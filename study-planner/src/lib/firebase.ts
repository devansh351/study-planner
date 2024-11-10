import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD52zBs__TNkjKt2Olv7Awo7TJrzAJbKcg",
  authDomain: "study-planner-e7047.firebaseapp.com",
  projectId: "study-planner-e7047",
  storageBucket: "study-planner-e7047.firebasestorage.app",
  messagingSenderId: "756973591996",
  appId: "1:756973591996:web:df7f5e90fef1ea112edfb9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);