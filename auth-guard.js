import {
  initializeApp,
  getApps
} from "https://gstatic.com";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://gstatic.com";

import {
  getFirestore,
  doc,
  getDoc
} from "https://gstatic.com";

const firebaseConfig = {
  apiKey: "AIzaSyA9vLsY0D2ahTZ2sXWQXnqiIOt39uoOZmo",
  authDomain: "://firebaseapp.com",
  projectId: "dbd-pkm-bs2",
  storageBucket: "dbd-pkm-bs2.firebasestorage.app",
  messagingSenderId: "108593161566",
  appId: "1:108593161566:web:cacb600b556b2e8f079bcf",
  measurementId: "G-PCZP880K6Y"
};

const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }

  try {
    const ref = doc(db, "users", user.uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      await signOut(auth);
      window.location.replace("login.html");
      return;
    }

    const data = snapshot.data();

    if (!["admin", "petugas"].includes(data.role)) {
      await signOut(auth);
      window.location.replace("login.html");
      return;
    }

    window.pkmUser = {
      uid: user.uid,
      email: user.email,
      nama: data.nama,
      role: data.role
    };

    document.dispatchEvent(new Event("pkm-auth-ready"));

  } catch (error) {
    console.error("KESALAHAN AUTH:", error);
    alert("Gagal memeriksa hak akses: " + error.message);
  }
});
