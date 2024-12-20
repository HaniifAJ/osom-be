// Import the functions you need from the SDKs you need
const { initializeApp } = require('firebase/app')
const { getFirestore } = require('firebase/firestore')
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCu2sLqBiFrrT-B4OkOR2gml4FDJ9Odkvw",
  authDomain: "rakamin-final-project-422f3.firebaseapp.com",
  projectId: "rakamin-final-project-422f3",
  storageBucket: "rakamin-final-project-422f3.firebasestorage.app",
  messagingSenderId: "694756648253",
  appId: "1:694756648253:web:919e79011349e869e11154"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = db
