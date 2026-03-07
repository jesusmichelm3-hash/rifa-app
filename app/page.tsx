"use client";

import { useState, useEffect } from "react";
import { collection, doc, updateDoc, getDoc, query, where, onSnapshot } from "firebase/firestore";
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

    const boletos = Array.from({ length: totalBoletos }, (_, i) => i).slice(inicio, fin);

    useEffect(() => {

        const q = query(
            collection(db, "boletos"),
            where("vendido", "==", true)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {

            const vendidosTemp: number[] = [];

            querySnapshot.forEach((documento) => {

                const data = documento.data();

                if (data.vendido === true) {
                    vendidosTemp.push(Number(documento.id));
                }

            });

            setVendidos(vendidosTemp);

        });

        return () => unsubscribe();

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

        const disponibles = Array.from({ length: totalBoletos }, (_, i) => i)
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

    const enviarWhatsApp = async () => {

        if (seleccionados.length === 0 || !nombre || !estado || !celular) {
            alert("Por favor completa tu nombre, estado, celular y selecciona al menos un boleto.");
            return;
        }

        const mensaje = `🎉 Confirmación de participación en nuestra rifa 🎉

Hola ${nombre} 👋  
Gracias por participar.

🎟 Números seleccionados:
${seleccionados.join(", ")}

📦 Cantidad de boletos: ${seleccionados.length}

💵 Total a pagar: $${totalPagar} MXN

📍 Estado: ${estado}
📱 Celular: ${celular}

⏳ IMPORTANTE
Tienes 30 minutos para realizar el pago de tus boletos.

¡Mucha suerte! 🍀
`;

        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

        try {

            for (const numero of seleccionados) {

                const ref = doc(db, "boletos", numero.toString().padStart(4, "0"));
                const snapshot = await getDoc(ref);

                if (!snapshot.exists()) {
                    alert("Error con el boleto " + numero);
                    return;
                }

                const data = snapshot.data();

                if (data.vendido === true) {
                    alert("El boleto " + numero + " ya fue vendido.");
                    return;
                }

                await updateDoc(ref, {
                    vendido: true,
                    nombre: nombre,
                    estado: estado,
                    celular: celular
                });

            }

            setVendidos([...vendidos, ...seleccionados]);

            window.location.href = url;

            setSeleccionados([]);

        } catch (error) {

            console.error(error);
            alert("Hubo un error al registrar los boletos.");

        }

    };

    const estadosMX = [
        "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
        "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Guanajuato",
        "Guerrero", "Hidalgo", "Jalisco", "México", "Michoacán", "Morelos", "Nayarit",
        "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
        "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
    ];

    return (

        <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-6">

            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-8 text-center shadow-2xl mb-8">

                <h1 className="text-4xl md:text-6xl font-extrabold tracking-wide animate-pulse">
                    🔥 RIFA DE 20 MIL PESOS 🔥
                </h1>

                <p className="text-xl mt-3 font-semibold">🎟 YA DISPONIBLES 🎟</p>

                <p className="text-2xl mt-3 font-bold text-white-300">
                    💵 $20 MXN POR BOLETO
                </p>

            </div>

            <div className="max-w-4xl mx-auto mb-6 text-center font-bold text-lg">
                🎟 Boletos vendidos: {vendidos.length} de {totalBoletos}
            </div>

            <div className="bg-red-500 rounded-2xl p-5 text-center mb-8 max-w-3xl mx-auto">

                <h2 className="text-xl font-bold mb-2">
                    ¿Dónde se publican los ganadores?
                </h2>

                <p className="text-sm md:text-base">
                    En nuestra página oficial de Facebook <strong>Rifas501</strong>, donde puedes encontrar cada uno de nuestros sorteos anteriores, así como las transmisiones en vivo y la entrega de premios a los ganadores.
                </p>

            </div>

            <div className="bg-red-700 p-5 rounded-xl mb-6 max-w-4xl mx-auto shadow-lg">

                <h2 className="font-bold text-xl mb-3">📝 Tus datos</h2>

                <input
                    type="text"
                    placeholder="Nombre Completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="text-white p-3 rounded mb-3 w-full"
                />

                <input
                    type="tel"
                    placeholder="Número de celular"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    className="text-white p-3 rounded mb-3 w-full"
                />

                <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="text-white p-3 rounded mb-3 w-full"
                >

                    <option value="">Selecciona tu estado</option>

                    {estadosMX.map((e) => (
                        <option key={e} value={e}>{e}</option>
                    ))}

                </select>

            </div>

            <div className="bg-red-800 p-4 rounded-xl mb-6 max-w-4xl mx-auto shadow-lg text-center">

                <h2 className="font-bold mb-2">🎟 Números seleccionados</h2>

                <p className="mb-2">{seleccionados.length > 0 ? seleccionados.join(", ") : "Ninguno"}</p>

                <p className="font-bold text-yellow-300 text-lg">
                    Total: ${totalPagar} MXN
                </p>

                <button
                    onClick={enviarWhatsApp}
                    className="mt-3 bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105"
                >
                    Confirmar boletos por WhatsApp
                </button>

            </div>

            <div className="text-center mb-6">

                <input
                    type="number"
                    min="1"
                    max="50"
                    value={cantidadRandom}
                    onChange={(e) => setCantidadRandom(Number(e.target.value))}
                    className="bg-red-600 text-white p-2 rounded mr-2 w-20 text-center"
                />

                <button
                    onClick={() => elegirAleatorios(cantidadRandom)}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-6 rounded-full transition transform hover:scale-105"
                >
                    🎲 Elegir números al azar
                </button>

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
                            className={`rounded-full p-3 font-bold text-sm transition transform duration-200 ${estaVendido
                                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                : estaSeleccionado
                                    ? "bg-green-500 scale-110 shadow-lg"
                                    : "bg-red-600 hover:bg-red-400 hover:scale-105"
                                }`}
                        >

                            {numero.toString().padStart(4, "0")}

                        </button>

                    );

                })}

            </div>

        </main>

    );

}