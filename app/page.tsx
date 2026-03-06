"use client";

import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {

    const [boletos, setBoletos] = useState<number[]>([]);

    useEffect(() => {
        cargarBoletos();
    }, []);

    const cargarBoletos = async () => {

        const querySnapshot = await getDocs(collection(db, "boletos"));

        const lista: number[] = [];

        querySnapshot.forEach((doc) => {
            const numero = parseInt(doc.id);
            lista.push(numero);
        });

        lista.sort((a, b) => a - b);

        setBoletos(lista);
    };

    return (
        <main style={{ padding: "40px", textAlign: "center" }}>

            <h1>Rifa 501</h1>

            <p>
                Bienvenido a nuestra rifa. Aquí puedes elegir tu número de la suerte.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(10, 1fr)",
                    gap: "10px",
                    marginTop: "40px",
                }}
            >
                {boletos.map((numero) => (
                    <div
                        key={numero}
                        style={{
                            padding: "10px",
                            border: "1px solid black",
                            borderRadius: "5px",
                        }}
                    >
                        {numero.toString().padStart(4, "0")}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "50px" }}>
                <p>
                    En nuestra página oficial de Facebook <strong>Rifas501</strong>,
                    puedes encontrar nuestros sorteos anteriores, transmisiones en vivo
                    y la entrega de premios a los ganadores.
                </p>
            </div>

        </main>
    );
}