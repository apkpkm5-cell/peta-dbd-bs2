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

const firebaseConfig = {
  apiKey: "AIzaSyA9vLsY0D2ahTZ2sWQXnqiIOt39uoOZmo",
  authDomain: "dbd-pkm-bs2.firebaseapp.com",
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

let pemeriksaanBerjalan = false;

onAuthStateChanged(auth, async (user) => {
  if (pemeriksaanBerjalan) return;

  pemeriksaanBerjalan = true;

  if (!user) {
    console.warn("AUTH KOSONG");

    document.dispatchEvent(
      new CustomEvent("pkm-auth-error", {
        detail: {
          message: "AUTH KOSONG: sesi login belum terbaca."
        }
      })
    );

    pemeriksaanBerjalan = false;
    return;
  }

  try {
    console.log("Login terdeteksi:", user.uid);

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await signOut(auth);

      document.dispatchEvent(
        new CustomEvent("pkm-auth-error", {
          detail: {
            message: "Dokumen akun tidak ditemukan."
          }
        })
      );

      return;
    }

    const data = userSnap.data();

    if (
      data.role !== "admin" &&
      data.role !== "petugas"
    ) {
      await signOut(auth);

      document.dispatchEvent(
        new CustomEvent("pkm-auth-error", {
          detail: {
            message: "Role akun tidak dikenali."
          }
        })
      );

      return;
    }

    window.pkmUser = {
      uid: user.uid,
      email: user.email || "",
      nama: data.nama || "",
      role: data.role
    };

    console.log("Hak akses berhasil:", data.role);

    document.dispatchEvent(
      new Event("pkm-auth-ready")
    );

  } catch (error) {
    console.error("KESALAHAN FIREBASE:", error);

    document.dispatchEvent(
      new CustomEvent("pkm-auth-error", {
        detail: {
          message:
            "Gagal memeriksa akun: " +
            (error.code || error.message)
        }
      })
    );

  } finally {
    pemeriksaanBerjalan = false;
  }
});
