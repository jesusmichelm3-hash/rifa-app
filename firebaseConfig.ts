import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCHWBU87WkWi6N4fusuoFTieix1HOtazDs",
    authDomain: "rifa-501-7ac90.firebaseapp.com",
    projectId: "rifa-501-7ac90",
    storageBucket: "rifa-501-7ac90.firebasestorage.app",
    messagingSenderId: "776432814730",
    appId: "1:776432814730:web:ecc1ebf1245a7593a9fb73"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);