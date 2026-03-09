const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function actualizarBoletos() {

    const boletosRef = db.collection("boletos");
    const snapshot = await boletosRef.get();

    const batch = db.batch();

    snapshot.forEach((doc) => {

        const data = doc.data();

        const estadoPago = data.vendido === true ? "pagado" : "disponible";

        batch.update(doc.ref, {
            estadoPago: estadoPago
        });

    });

    await batch.commit();

    console.log("✅ Los 2000 boletos fueron actualizados correctamente");

}

actualizarBoletos();