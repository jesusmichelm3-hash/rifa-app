"use client";

import { useState, useEffect } from "react";
import { collection, doc, updateDoc, getDoc, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function Home() {
    const [animarAvisos, setAnimarAvisos] = useState(false);
    const avisos = [
        "🎟️ Bienvenido a Sorteos501. Participa en nuestra Gran Rifa de $20,000 pesos en efectivo y gana con solo $20 pesos.",
        "🔢 Los números disponibles van del 0000 al 1999.",
        "📅 La fecha del sorteo se anunciará una vez que se vendan todos los boletos.",
        "🏆 El número ganador se determinará usando las últimas cifras del resultado de la Lotería Nacional.",
        "📩 Después de realizar tu pago debes enviar tu comprobante para confirmar tu boleto.",
        "📊 En la página puedes ver los boletos vendidos en tiempo real.",
        "🔓 Los boletos no pagados se liberarán nuevamente despues de 24hrs.",
        "📢 El ganador se publicará en la página y en Facebook Sorteos501.",
        " ‼️ Si el número ganador supera el rango de los boletos(0000–1999), se restarán 2,000 sucesivamente hasta obtener un número dentro del rango de los boletos disponibles ‼️.",
        "Ejemplo",
        "Si el número ganador es 5601",

        "5601 − 2000 = 3601",
        "3601 − 2000 = 1601",

        "El ganador sería el boleto 1601✅ "
    ];

    const [avisoActual, setAvisoActual] = useState(0);

    useEffect(() => {
        const intervalo = setInterval(() => {
            setAnimarAvisos(true);

            setTimeout(() => {
                setAnimarAvisos(false);
            }, 1000);

        }, 20000);

        return () => clearInterval(intervalo);
    }, []);

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
    const [mostrarTerminos, setMostrarTerminos] = useState(false);
    const [mostrarPrivacidad, setMostrarPrivacidad] = useState(false);

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

           

            <div className="bg-white rounded-3xl p-8 text-center shadow-2xl mb-8">

                <div className="w-full flex justify-center my-8">
                    <img
                        src="/banner1.jpeg"
                        className="w-[120%] max-w-6xl object-contain rounded-2xl shadow-2xl animate-bounce [animation-duration:3s]"
                        alt="Banner"
                    />
                </div>


                <h1 className="text-[#6b6a5a] text-4xl md:text-6xl font-extrabold tracking-wide animate-pulse">
                    ¡¡RIFA DE 20 MIL PESOS!!
                </h1>

                <p className="text-[#6b6a5a] text-xl mt-3 font-semibold">
                    🎟 YA DISPONIBLES 🎟
                </p>

                <p className="text-[#6b6a5a] text-2xl mt-3 font-bold">
                    💵 $20 MXN POR BOLETO
                </p>
               
            </div>

            <div className="text-white-500 max-w-4xl mx-auto mb-6 text-center font-bold text-lg">
                🎟 Boletos vendidos: {vendidos.length} de {totalBoletos}
            </div>

            <div className="bg-white rounded-2xl p-5 text-center mb-8 max-w-3xl mx-auto shadow-xl">
                <div className="bg-white rounded-2xl p-5 text-center mb-8 max-w-3xl mx-auto shadow-xl">

                    <h2 className="text-[#6b6a5a] text-xl font-bold mb-4">
                        📢 Avisos de la rifa
                    </h2>

                    <div className={`space-y-2 text-[#6b6a5a] text-sm md:text-base transition-all duration-700 ${animarAvisos ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>

                        {avisos.map((aviso, index) => (
                            <p key={index}>{aviso}</p>
                        ))}

                    </div>

                </div>
               

            </div>

            <div className="bg-white p-5 rounded-xl mb-6 max-w-4xl mx-auto shadow-lg">

                <h2 className="text-[#6b6a5a] font-bold text-xl mb-3">📝 Tus datos</h2>

                <input
                    type="text"
                    placeholder="Nombre Completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="text-[#6b6a5a] p-3 rounded mb-3 w-full"
                />

                <input
                    type="tel"
                    placeholder="Número de celular"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    className="text-[#6b6a5a] p-3 rounded mb-3 w-full"
                />

                <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="text-[#6b6a5a] p-3 rounded mb-3 w-full"
                >

                    <option value="">Selecciona tu estado</option>

                    {estadosMX.map((e) => (
                        <option key={e} value={e}>{e}</option>
                    ))}

                </select>

            </div>

            <div className="bg-white p-4 rounded-xl mb-6 max-w-4xl mx-auto shadow-lg text-center">

                <h2 className="text-[#6b6a5a] font-bold mb-2">🎟 Números seleccionados</h2>

                <p className="text-[#6b6a5a] mb-2">
                    {seleccionados.length > 0 ? seleccionados.join(", ") : "Ninguno"}
                </p>

                <p className="text-[#6b6a5a] font-bold text-lg">
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
                    className="bg-white text-[#6b6a5a] p-2 rounded mr-2 w-20 text-center"
                />

                <button
                    onClick={() => elegirAleatorios(cantidadRandom)}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-6 rounded-full transition transform hover:scale-105"
                >
                    🎲 Elegir números al azar
                </button>



            </div>

            {/* PAGINADOR */}

            <div className="flex justify-center items-center gap-2 mb-6 flex-wrap">

                <button
                    onClick={() => setPaginaActual(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-3 py-2 bg-white text-black rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
                >
                    ◀
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter(p =>
                        p === 1 ||
                        p === totalPaginas ||
                        (p >= paginaActual - 2 && p <= paginaActual + 2)
                    )
                    .map((pagina, index, array) => {

                        const prev = array[index - 1];

                        return (
                            <span key={pagina} className="flex items-center">

                                {prev && pagina - prev > 1 && (
                                    <span className="px-2 text-gray-400">...</span>
                                )}

                                <button
                                    onClick={() => setPaginaActual(pagina)}
                                    className={`px-4 py-2 rounded-lg font-bold border border-gray-300 ${paginaActual === pagina
                                            ? "bg-white text-black"
                                            : "bg-white text-black hover:bg-gray-200"
                                        }`}
                                >
                                    {pagina}
                                </button>

                            </span>
                        );

                    })}

                <button
                    onClick={() => setPaginaActual(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-2 bg-white text-black border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-200"
                >
                    ▶
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
                                        ? "bg-blue text-white scale-110 shadow-lg"
                                        : "bg-white text-black hover:bg-gray-200 hover:scale-105"
                                }`}
                        >

                            {numero.toString().padStart(4, "0")}

                        </button>

                    );

                })}

            </div>
            {/* Bloque de Términos y Condiciones */}
            <div className="max-w-4xl mx-auto mt-12 bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-[#6b6a5a] font-bold text-xl mb-3">
                    📄 Términos y Condiciones – Sorteos501
                </h2>

                <button
                    onClick={() => setMostrarTerminos(!mostrarTerminos)}
                    className="font-bold text-black underline mb-4"
                >
                    {mostrarTerminos ? "Ver menos ▲" : "Ver más ▼"}
                </button>

                {mostrarTerminos && (
                    <div className="text-[#6b6a5a] text-sm space-y-3 text-left">
                        <p><strong>1. Organizador</strong><br />La rifa es organizada por Sorteos501.</p>
                        <p><strong>2. Rifa privada</strong><br />Sorteos501 es una rifa privada organizada de manera independiente.</p>
                        <p><strong>3. Cantidad de boletos</strong><br />La rifa consta de 2000 boletos numerados del 0000 al 1999.</p>
                        <p><strong>4. Precio del boleto</strong><br />El precio del boleto será el indicado en la página oficial de la rifa.</p>
                        <p><strong>5. Método para elegir ganador</strong><br />El ganador se determinará con base en el resultado del premio mayor de la Lotería Nacional.</p>
                        <p><strong>6. No afiliación</strong><br />Sorteos501 no está afiliado a la Lotería Nacional.</p>
                        <p><strong>7. Forma de pago</strong><br />El participante deberá enviar comprobante de pago.</p>
                        <p><strong>8. Validación de boletos</strong><br />El pago debe confirmarse para validar el boleto.</p>
                        <p><strong>9. Comprobantes falsos</strong><br />Serán cancelados inmediatamente.</p>
                        <p><strong>10. Entrega del premio</strong><br />El ganador será anunciado en redes sociales oficiales.</p>
                    </div>
                )}
            </div>

            {/* Bloque de Política de Privacidad */}
            <div className="max-w-4xl mx-auto mt-12 bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-[#6b6a5a] font-bold text-xl mb-3">
                    🔒 Política de Privacidad – Sorteos501
                </h2>

                <button
                    onClick={() => setMostrarPrivacidad(!mostrarPrivacidad)}
                    className="font-bold text-black underline mb-4"
                >
                    {mostrarPrivacidad ? "Ver menos ▲" : "Ver más ▼"}
                </button>

                {mostrarPrivacidad && (
                    <div className="text-[#6b6a5a] text-sm space-y-3 text-left">
                        <p><strong>1. Datos que recopilamos</strong><br />
                            Para participar en nuestras rifas se podrán solicitar los siguientes datos personales:
                        </p>
                        <ul className="list-disc list-inside ml-4">
                            <li>Nombre</li>
                            <li>Número de teléfono</li>
                            <li>Estado o lugar de residencia</li>
                        </ul>

                        <p><strong>2. Uso de la información</strong><br />
                            Los datos recopilados serán utilizados únicamente para:
                        </p>
                        <ul className="list-disc list-inside ml-4">
                            <li>Registrar la participación en la rifa</li>
                            <li>Confirmar pagos y boletos</li>
                            <li>Contactar al ganador</li>
                            <li>Informar resultados del sorteo</li>
                        </ul>

                        <p><strong>3. Protección de datos</strong><br />
                            Sorteos501 se compromete a proteger la información personal de los participantes y no compartirla, venderla ni distribuirla a terceros sin autorización.
                        </p>

                        <p><strong>4. Almacenamiento de información</strong><br />
                            Los datos podrán ser almacenados únicamente durante el tiempo necesario para la realización y verificación de la rifa.
                        </p>

                        <p><strong>5. Derechos del participante</strong><br />
                            El participante podrá solicitar la eliminación de sus datos personales una vez finalizada la rifa.
                        </p>

                        <p><strong>6. Aceptación de la política</strong><br />
                            Al participar en la rifa, el usuario acepta el uso de sus datos personales conforme a esta política de privacidad.
                        </p>
                    </div>
                )}
            </div>

            {/* Copyright */}
            <div className="text-center text-gray-400 text-sm mt-12 pb-4">
                © 2026 Sorteos501 – Todos los derechos reservados.
            </div>
        </main>

    );

}