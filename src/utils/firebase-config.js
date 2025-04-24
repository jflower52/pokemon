// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDcS03K8BxorktnMRVI6QrbtHnvQa91JQ",
  authDomain: "pokemon-d5bca.firebaseapp.com",
  projectId: "pokemon-d5bca",
  storageBucket: "pokemon-d5bca.firebasestorage.app",
  messagingSenderId: "412243847586",
  appId: "1:412243847586:web:da2d898d22aea08643aafb",
  measurementId: "G-QB8N3V0CTS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, auth };
