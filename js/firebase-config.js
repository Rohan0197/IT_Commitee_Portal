/* ============================================================
   FIREBASE CONFIGURATION
   ============================================================

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

const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let db = null;
let auth = null;

if (isFirebaseConfigured) {
   firebase.initializeApp(firebaseConfig);
   db = firebase.firestore();
   auth = firebase.auth();
}
