/* ============================================================
   FIREBASE CONFIGURATION
   ============================================================
   How to fill this in:
   1. Go to https://console.firebase.google.com/ and create a project.
   2. Project settings -> General -> Your apps -> add a Web app.
   3. Copy the firebaseConfig object it gives you and paste the
      values below.
   4. In the same project, turn on Firestore Database and
      Authentication -> Sign-in method -> Email/Password.

   This file is loaded with a plain <script> tag (see the "compat"
   SDK links in each HTML page), which is why we can just call
   firebase.initializeApp() directly instead of using import
   statements — no bundler needed for this to work.
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyArgEikCe8tL_KuCyPDEYnubf98c0wDl3c",
  authDomain: "it-commitee.firebaseapp.com",
  projectId: "it-commitee",
  storageBucket: "it-commitee.firebasestorage.app",
  messagingSenderId: "396016913571",
  appId: "1:396016913571:web:475e4d103ff7b8190a8316",
};

// If apiKey is still blank, the config hasn't been filled in yet.
// Every page checks this flag before touching Firestore/Auth, so the
// site shows a friendly message instead of a JS error.
const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let db = null;
let auth = null;

if (isFirebaseConfigured) {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
}
