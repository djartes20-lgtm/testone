// firebase/config.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAa-Yukkr__Qi9JsmSAgGCZmrKudBAZ5Y8",
  authDomain: "gothamplay-c2f22.firebaseapp.com",
  databaseURL: "https://gothamplay-c2f22-default-rtdb.firebaseio.com",
  projectId: "gothamplay-c2f22",
  storageBucket: "gothamplay-c2f22.appspot.com",
  messagingSenderId: "828839311796",
  appId: "1:828839311796:web:13ef45211490b197a1dae1"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);


