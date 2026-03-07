"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, getDoc, arrayUnion, onSnapshot } from "firebase/firestore";
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

    useEffect(() => {

        const ref = doc(db, "rifa", "numeros");

        const unsubscribe = onSnapshot(ref, (snapshot) => {

            if (snapshot.exists()) {
                const data = snapshot.data();
                setVendidos(data.vendidos || []);
            }

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
Si el pago no se realiza dentro de ese tiempo, los números serán liberados.

🏦 Cuentas para realizar el pago:

BANAMEX  
Nombre: Ali Gaxiola  
Cuenta: 1221 1212 1212 1212

SANTANDER  
Nombre: Dali Gaxiola  
Cuenta: 1212 1212 1212 1212

📸 Una vez realizado el pago envía tu comprobante por este mismo chat.

¡Mucha suerte! 🍀
`;

        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

        try {

            const ref = doc(db, "rifa", "numeros");

            const snapshot = await getDoc(ref);

            if (!snapshot.exists()) {
                alert("Error al acceder a los boletos.");
                return;
            }

            const data = snapshot.data();
            const vendidosActuales = data.vendidos || [];

            for (const numero of seleccionados) {

                if (vendidosActuales.includes(numero)) {
                    alert("El boleto " + numero + " ya fue vendido.");
                    return;
                }

            }

            await updateDoc(ref, {
                vendidos: arrayUnion(...seleccionados)
            });

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

            <div className="text-center mb-4">

                <p className="text-lg font-semibold">
                    Vendidos: {vendidos.length} / {totalBoletos}
                </p>

                <p className="text-red-400 font-bold animate-pulse">
                    ⚠️ ¡Se están vendiendo rápido!
                </p>

            </div>

            <div className="bg-red-700 p-4 rounded-xl mb-6 max-w-4xl mx-auto shadow-lg">

                <h2 className="font-bold text-xl mb-2">📝 Tus datos:</h2>

                <input
                    type="text"
                    placeholder="Nombre Completo"
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

                <input
                    type="tel"
                    placeholder="Número de celular"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    className="text-white p-3 rounded mb-3 w-full font-semibold"
                />

            </div>

        </main>

    );

}