"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function Home() {
    const totalBoletos = 2000;
    const precioBoleto = 20;
    const numeroWhatsApp = "526651502712";

    const [vendidos, setVendidos] = useState<number[]>([]);
    const [seleccionados, setSeleccionados] = useState<number[]>([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadRandom, setCantidadRandom] = useState(1);

    const [nombre, setNombre] = useState("");
    const [estado, setEstado] = useState("");
    const [celular, setCelular] = useState("");

    const boletosPorPagina = 100;
    const totalPaginas = Math.ceil(totalBoletos / boletosPorPagina);

    const inicio = (paginaActual - 1) * boletosPorPagina;
    const fin = inicio + boletosPorPagina;

    const boletos = Array.from({ length: totalBoletos }, (_, i) => i + 1).slice(inicio, fin);

    // 🔥 LEER BOLETOS DESDE FIREBASE
    useEffect(() => {
        const obtenerBoletos = async () => {
            const querySnapshot = await getDocs(collection(db, "boletos"));
            const vendidosTemp: number[] = [];

            querySnapshot.forEach((documento) => {
                const data = documento.data();
                if (data.vendido === true) {
                    vendidosTemp.push(Number(documento.id));
                }
            });

            setVendidos(vendidosTemp);
        };

        obtenerBoletos();
    }, []);

    // 🔥 GENERAR BOLETOS 0000 - 1999
    const generarBoletos = async () => {

        for (let i = 0; i <= 1999; i++) {

            const numero = i.toString().padStart(4, "0");

            await setDoc(doc(db, "boletos", numero), {
                vendido: false,
                nombre: "",
                celular: "",
                estado: ""
            });

        }

        alert("2000 boletos creados correctamente");
    };

    const toggleSeleccion = (numero: number) => {
        if (vendidos.includes(numero)) return;

        if (seleccionados.includes(numero)) {
            setSeleccionados(seleccionados.filter((n) => n !== numero));
        } else {
            setSeleccionados([...seleccionados, numero]);
        }
    };

    const elegirAleatorios = (cantidad: number) => {
        const disponibles = Array.from({ length: totalBoletos }, (_, i) => i + 1)
            .filter((n) => !vendidos.includes(n));

        const nuevos: number[] = [];

        while (nuevos.length < cantidad && disponibles.length > 0) {
            const randomIndex = Math.floor(Math.random() * disponibles.length);
            nuevos.push(disponibles[randomIndex]);
            disponibles.splice(randomIndex, 1);
        }

        setSeleccionados(nuevos);
    };

    const totalPagar = seleccionados.length * precioBoleto;

    const enviarWhatsApp = () => {
        if (seleccionados.length === 0 || !nombre || !estado || !celular) {
            alert("Por favor completa tu nombre, estado, celular y selecciona al menos un boleto.");
            return;
        }

        const mensaje = `
Confirmación de participación en nuestra rifa 🎉

¡Hola! ${nombre} 👋

Números seleccionados: ${seleccionados.join(", ")}
Cantidad de boletos: ${seleccionados.length}
Monto a depositar: $${totalPagar} MXN

Estado: ${estado}
Celular: ${celular}
`;

        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
    };

    const estadosMX = [
        "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Ciudad de México",
        "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "México", "Michoacán", "Morelos",
        "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora",
        "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
    ];

    return (
        <main className="min-h-screen bg-black text-white p-6">

            <div className="bg-red-600 rounded-3xl p-6 text-center shadow-2xl mb-6">
                <h1 className="text-4xl md:text-5xl font-extrabold">
                    🔥 RIFA DE 20 MIL PESOS 🔥
                </h1>
                <p className="text-xl mt-2 font-semibold">🎟 YA DISPONIBLES 🎟</p>
                <p className="text-lg mt-2 font-bold text-yellow-300">
                    💵 Costo por boleto: $20 MXN
                </p>
            </div>

            {/* BOTON TEMPORAL */}
            <div className="text-center mb-6">
                <button
                    onClick={generarBoletos}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded"
                >
                    GENERAR 2000 BOLETOS
                </button>
            </div>

            <div className="text-center mb-4">
                <p className="text-lg font-semibold">
                    Vendidos: {vendidos.length} / {totalBoletos}
                </p>
                <p className="text-red-400 font-bold animate-pulse">
                    ⚠️ ¡Se están vendiendo rápido!
                </p>
            </div>

        </main>
    );
}