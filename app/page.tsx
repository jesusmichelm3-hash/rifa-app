"use client";

import { useState } from "react";

export default function Home() {
    const totalBoletos = 500;

    const [vendidos] = useState<number[]>([5, 12, 45, 78, 120, 222]); // puedes cambiar estos

    const boletos = Array.from({ length: totalBoletos }, (_, i) => i + 1);

    const numeroWhatsApp = "526651502712";

    const apartarPorWhatsApp = (numero: number) => {
        const mensaje = `Hola, quiero apartar el boleto #${numero} de la RIFA DE 5 MIL PESOS 🔥`;
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
            mensaje
        )}`;
        window.open(url, "_blank");
    };

    return (
        <main className="min-h-screen bg-black text-white p-6">

            {/* Banner principal */}
            <div className="bg-red-600 rounded-3xl p-6 text-center shadow-2xl mb-6">
                <h1 className="text-4xl md:text-5xl font-extrabold">
                    🔥 RIFA DE 5 MIL PESOS 🔥
                </h1>
                <p className="text-xl mt-2 font-semibold">
                    🎟 YA DISPONIBLES 🎟
                </p>
            </div>

            {/* Info Facebook */}
            <div className="bg-red-500 rounded-2xl p-5 text-center mb-8 max-w-3xl mx-auto">
                <h2 className="text-xl font-bold mb-2">
                    ¿Dónde se publican los ganadores?
                </h2>
                <p className="text-sm md:text-base">
                    En nuestra página oficial de Facebook <strong>Rifas501</strong>,
                    donde puedes encontrar cada uno de nuestros sorteos anteriores,
                    así como las transmisiones en vivo y la entrega de premios
                    a los ganadores.
                </p>
            </div>

            {/* Grid de boletos */}
            <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 gap-3 max-w-6xl mx-auto">
                {boletos.map((numero) => {
                    const estaVendido = vendidos.includes(numero);

                    return (
                        <button
                            key={numero}
                            onClick={() => !estaVendido && apartarPorWhatsApp(numero)}
                            className={`
                rounded-full p-3 font-bold text-sm transition duration-300
                ${estaVendido
                                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-400 hover:scale-110"
                                }
              `}
                            disabled={estaVendido}
                        >
                            {numero}
                        </button>
                    );
                })}
            </div>

            {/* Leyenda */}
            <div className="text-center mt-8">
                <p className="text-green-400 font-semibold">🟢 Disponible</p>
                <p className="text-gray-400 font-semibold">⚫ Vendido</p>
            </div>

        </main>
    );
}