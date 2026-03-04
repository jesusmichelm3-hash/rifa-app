"use client";

import { useState } from "react";

export default function Home() {
    const totalBoletos = 500;
    const precioBoleto = 20;
    const numeroWhatsApp = "526651502712";

    const [vendidos] = useState<number[]>([5, 12, 45, 78, 120, 222]);
    const [seleccionados, setSeleccionados] = useState<number[]>([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadRandom, setCantidadRandom] = useState(1);

    const boletosPorPagina = 100;
    const totalPaginas = totalBoletos / boletosPorPagina;

    const inicio = (paginaActual - 1) * boletosPorPagina;
    const fin = inicio + boletosPorPagina;

    const boletos = Array.from({ length: totalBoletos }, (_, i) => i + 1).slice(
        inicio,
        fin
    );

    const toggleSeleccion = (numero: number) => {
        if (vendidos.includes(numero)) return;

        if (seleccionados.includes(numero)) {
            setSeleccionados(seleccionados.filter((n) => n !== numero));
        } else {
            setSeleccionados([...seleccionados, numero]);
        }
    };

    const elegirAleatorios = (cantidad: number) => {
        let disponibles = Array.from({ length: totalBoletos }, (_, i) => i + 1)
            .filter((n) => !vendidos.includes(n));

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
        if (seleccionados.length === 0) return;

        const mensaje = `Hola, quiero apartar los boletos: ${seleccionados.join(
            ", "
        )} 🎟🔥
Total a pagar: $${totalPagar} MXN`;

        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
            mensaje
        )}`;

        window.open(url, "_blank");
    };

    return (
        <main className="min-h-screen bg-black text-white p-6">

            {/* Banner */}
            <div className="bg-red-600 rounded-3xl p-6 text-center shadow-2xl mb-6">
                <h1 className="text-4xl md:text-5xl font-extrabold">
                    🔥 RIFA DE 5 MIL PESOS 🔥
                </h1>
                <p className="text-xl mt-2 font-semibold">🎟 YA DISPONIBLES 🎟</p>
                <p className="text-lg mt-2 font-bold text-yellow-300">
                    💵 Costo por boleto: $20 MXN
                </p>
            </div>

            {/* Contador */}
            <div className="text-center mb-4">
                <p className="text-lg font-semibold">
                    Vendidos: {vendidos.length} / {totalBoletos}
                </p>
                <p className="text-red-400 font-bold animate-pulse">
                    ⚠️ ¡Se están vendiendo rápido!
                </p>
            </div>

            {/* Seleccionados */}
            <div className="bg-gray-900 p-4 rounded-xl mb-6 max-w-4xl mx-auto">
                <h2 className="font-bold mb-2">🎟 Números seleccionados:</h2>
                <p>{seleccionados.length > 0 ? seleccionados.join(", ") : "Ninguno"}</p>
                <p className="mt-2 font-bold text-green-400">
                    Total a pagar: ${totalPagar} MXN
                </p>

                <button
                    onClick={enviarWhatsApp}
                    className="mt-3 bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-6 rounded-full"
                >
                    Enviar por WhatsApp
                </button>
            </div>

            {/* Sistema Aleatorio */}
            <div className="text-center mb-6">
                <input
                    type="number"
                    min="1"
                    max="50"
                    value={cantidadRandom}
                    onChange={(e) => setCantidadRandom(Number(e.target.value))}
                    className="text-black p-2 rounded mr-2 w-20 text-center"
                />
                <button
                    onClick={() => elegirAleatorios(cantidadRandom)}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-6 rounded-full"
                >
                    🎲 Elegir al azar
                </button>
            </div>

            {/* Paginación */}
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                    <button
                        key={pagina}
                        onClick={() => setPaginaActual(pagina)}
                        className={`px-4 py-2 rounded ${pagina === paginaActual
                                ? "bg-red-600"
                                : "bg-gray-700 hover:bg-gray-600"
                            }`}
                    >
                        {pagina}
                    </button>
                ))}
            </div>

            {/* Grid boletos */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 max-w-6xl mx-auto">
                {boletos.map((numero) => {
                    const estaVendido = vendidos.includes(numero);
                    const estaSeleccionado = seleccionados.includes(numero);

                    return (
                        <button
                            key={numero}
                            onClick={() => toggleSeleccion(numero)}
                            disabled={estaVendido}
                            className={`rounded-full p-3 font-bold text-sm transition duration-300
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

            {/* Botón flotante */}
            <a
                href={`https://wa.me/${numeroWhatsApp}`}
                target="_blank"
                className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-6 rounded-full shadow-2xl"
            >
                💬 WhatsApp
            </a>
        </main>
    );
}