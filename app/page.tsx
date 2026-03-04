"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function Home() {
    const totalBoletos = 500;
    const precioBoleto = 20;
    const numeroWhatsApp = "526651502712";

    const [vendidos, setVendidos] = useState<number[]>([]);
    const [seleccionados, setSeleccionados] = useState<number[]>([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadRandom, setCantidadRandom] = useState(1);

    const [nombre, setNombre] = useState("");
    const [estado, setEstado] = useState("");

    const boletosPorPagina = 100;
    const totalPaginas = Math.ceil(totalBoletos / boletosPorPagina);

    const inicio = (paginaActual - 1) * boletosPorPagina;
    const fin = inicio + boletosPorPagina;

    const boletos = Array.from({ length: totalBoletos }, (_, i) => i + 1).slice(
        inicio,
        fin
    );

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

    const toggleSeleccion = (numero: number) => {
        if (vendidos.includes(numero)) return;

        if (seleccionados.includes(numero)) {
            setSeleccionados(seleccionados.filter((n) => n !== numero));
        } else {
            setSeleccionados([...seleccionados, numero]);
        }
    };

    const elegirAleatorios = (cantidad: number) => {
        // eslint-disable-next-line prefer-const
        let disponibles = Array.from({ length: totalBoletos }, (_, i) => i + 1).filter(
            (n) => !vendidos.includes(n)
        );

        // eslint-disable-next-line prefer-const
        let nuevos: number[] = [];

        while (nuevos.length < cantidad && disponibles.length > 0) {
            const randomIndex = Math.floor(Math.random() * disponibles.length);
            nuevos.push(disponibles[randomIndex]);
            disponibles.splice(randomIndex, 1);
        }

        setSeleccionados(nuevos);
    };

    const totalPagar = seleccionados.length * precioBoleto;

    const enviarWhatsApp = () => {
        if (seleccionados.length === 0 || !nombre || !estado) {
            alert("Por favor completa tu nombre, estado y selecciona al menos un boleto.");
            return;
        }

        const mensaje = `
Confirmación de participación en nuestra rifa 🎉

¡Hola! ${nombre} 👋

Números seleccionados: ${seleccionados.join(", ")}
Cantidad de boletos: ${seleccionados.length}
Monto a depositar: $${totalPagar} MXN

Estado del participante: ${estado}
`;

        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
            mensaje
        )}`;

        window.open(url, "_blank");
    };

    // 🔥 FUNCIÓN TEMPORAL PARA CREAR 500 BOLETOS
    const crearBoletos = async () => {
        for (let i = 1; i <= totalBoletos; i++) {
            await setDoc(doc(db, "boletos", i.toString()), {
                vendido: false,
            });
        }

        alert("500 boletos creados 🔥");
    };

    const estadosMX = [
        "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
        "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
        "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "México",
        "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla",
        "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora",
        "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
    ];

    return (
        <main className="min-h-screen bg-black text-white p-6">

            {/* BOTÓN TEMPORAL */}
            <button
                onClick={crearBoletos}
                className="bg-blue-500 p-3 rounded mb-4"
            >
                Crear 500 boletos
            </button>

            <div className="bg-red-600 rounded-3xl p-6 text-center shadow-2xl mb-6">
                <h1 className="text-4xl font-extrabold">
                    🔥 RIFA DE 5 MIL PESOS 🔥
                </h1>
                <p className="text-lg mt-2 font-bold text-yellow-300">
                    💵 Costo por boleto: $20 MXN
                </p>
            </div>

            <div className="text-center mb-4">
                <p className="text-lg font-semibold">
                    Vendidos: {vendidos.length} / {totalBoletos}
                </p>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 max-w-6xl mx-auto">
                {boletos.map((numero) => {
                    const estaVendido = vendidos.includes(numero);
                    const estaSeleccionado = seleccionados.includes(numero);

                    return (
                        <button
                            key={numero}
                            onClick={() => toggleSeleccion(numero)}
                            disabled={estaVendido}
                            className={`rounded-full p-3 font-bold text-sm transition
                                ${estaVendido
                                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                    : estaSeleccionado
                                        ? "bg-green-500 scale-110"
                                        : "bg-red-600 hover:bg-red-400"
                                }
                            `}
                        >
                            {numero}
                        </button>
                    );
                })}
            </div>
        </main>
    );
}