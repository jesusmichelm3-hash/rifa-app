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

    // Datos del participante
    const [nombre, setNombre] = useState("");
    const [estado, setEstado] = useState("");

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

    // Elegir varios números al azar
    const elegirAleatorios = (cantidad: number) => {
        let disponibles = Array.from({ length: totalBoletos }, (_, i) => i + 1).filter(
            (n) => !vendidos.includes(n)
        );

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

Antes que nada, queremos agradecerte sinceramente por confiar en nosotros y participar en nuestra rifa. Tu apoyo nos permite seguir realizando más sorteos y ofreciendo premios increíbles. 🙏✨

Detalles de tu participación:

Números seleccionados: ${seleccionados.join(", ")}
Cantidad de boletos: ${seleccionados.length}
Monto a depositar: $${totalPagar} MXN (${precioBoleto} MXN por boleto)

Cuentas para realizar tu depósito:
Banco BBVA: 0123456789 a nombre de Jesús Moreno
Banco Santander: 9876543210 a nombre de Jesús Moreno

Estado del participante: ${estado}
`;

        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
            mensaje
        )}`;

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

            {/* Info Facebook */}
            <div className="bg-red-500 rounded-2xl p-5 text-center mb-8 max-w-3xl mx-auto">
                <h2 className="text-xl font-bold mb-2">
                    ¿Dónde se publican los ganadores?
                </h2>
                <p className="text-sm md:text-base">
                    En nuestra página oficial de Facebook <strong>Rifas501</strong>, donde puedes encontrar cada uno de nuestros sorteos anteriores, así como las transmisiones en vivo y la entrega de premios a los ganadores.
                </p>
            </div>

            {/* Formulario nombre y estado */}
            <div className="bg-red-700 p-4 rounded-xl mb-6 max-w-4xl mx-auto shadow-lg">
                <h2 className="font-bold text-xl mb-2">📝 Tus datos:</h2>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="text-white p-3 rounded mb-3 w-full font-semibold"
                />
                <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="text-white p-3 rounded mb-3 w-full font-semibold"
                >
                    <option value="">Selecciona tu estado</option>
                    {estadosMX.map((e) => (
                        <option key={e} value={e}>{e}</option>
                    ))}
                </select>
            </div>

            {/* Seleccionados */}
            <div className="bg-red-800 p-4 rounded-xl mb-6 max-w-4xl mx-auto shadow-lg">
                <h2 className="font-bold mb-2">🎟 Números seleccionados:</h2>
                <p>{seleccionados.length > 0 ? seleccionados.join(", ") : "Ninguno"}</p>
                <p className="mt-2 font-bold text-yellow-300">
                    Total a pagar: ${totalPagar} MXN
                </p>

                <button
                    onClick={enviarWhatsApp}
                    className="mt-3 bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-6 rounded-full shadow-lg"
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
                    className="bg-red-600 text-white p-2 rounded mr-2 w-20 text-center font-bold"
                />
                <button
                    onClick={() => elegirAleatorios(cantidadRandom)}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-6 rounded-full shadow-lg"
                >
                    🎲 Elegir números al azar
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