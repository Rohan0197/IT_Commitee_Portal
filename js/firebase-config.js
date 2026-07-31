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
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
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
