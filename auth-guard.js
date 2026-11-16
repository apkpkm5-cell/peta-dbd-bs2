import {
  initializeApp,
  getApps
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// KONFIGURASI FIREBASE
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9vLsY0D2ahTZ2sXWQXnqiIOt39uoOZmo",
  authDomain: "dbd-pkm-bs2.firebaseapp.com",
  projectId: "dbd-pkm-bs2",
  storageBucket: "dbd-pkm-bs2.firebasestorage.app",
  messagingSenderId: "108593161566",
  appId: "1:108593161566:web:cacb600b556b2e8f079bcf",
  measurementId: "G-PCZP880K6Y"
};

// Gunakan Firebase App yang sudah ada
const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

// PERIKSA STATUS LOGIN
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.replace("login.html");
    return;
  }

  try {

    console.log("Login terdeteksi:", user.uid);

    // Periksa dokumen pengguna
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("Dokumen pengguna tidak ditemukan di Firestore.");
      await signOut(auth);
      window.location.replace("login.html");
      return;
    }

    const data = userSnap.data();

    console.log("Data pengguna:", data);

    // Periksa hak akses
    if (
      data.role !== "admin" &&
      data.role !== "petugas"
    ) {
      alert("Role pengguna tidak dikenali.");
      await signOut(auth);
      window.location.replace("login.html");
      return;
    }

    // Simpan informasi pengguna
    window.pkmUser = {
      uid: user.uid,
      email: user.email,
      nama: data.nama || "",
      role: data.role
    };

    console.log("Hak akses berhasil:", data.role);

    // Beri sinyal kepada index.html
    document.dispatchEvent(
      new Event("pkm-auth-ready")
    );

  } catch (error) {

    console.error("KESALAHAN FIREBASE:", error);

    alert(
      "Gagal menghubungkan ke Cloud: " +
      error.code +
      "\n" +
      error.message
    );

  }

});
