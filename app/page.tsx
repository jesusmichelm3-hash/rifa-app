/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

type Boleto = {
    numero: string;
    nombre: string;
    celular: string;
    estadoPago: "disponible" | "apartado" | "pagado";
};

type ResultadoBusqueda = {
    nombre: string;
    estado: string;
    celular: string;
    boletos: string[];
    pagados: number;
    pendientes: number;
};

import { useState, useEffect } from "react";
import { collection, doc, updateDoc, getDoc, getDocs, query, where, onSnapshot, runTransaction } from "firebase/firestore";
import { db } from "../firebaseConfig";


export default function Home() {
    const [animarAvisos, setAnimarAvisos] = useState(false);
    const avisos = [
  
        "🎟️ ¡Bienvenido a Sorteos501! Participa en nuestra Gran Rifa y gana $20,000 MXN en efectivo con solo $20 por boleto.",
        "📅 La fecha del sorteo se anunciará una vez que se vendan todos los boletos.",
        "📩 Después de realizar tu pago, envía tu comprobante para confirmar tu boleto.",
        "⏳ Los boletos no pagados se liberarán automáticamente después de 24 horas.",
        "📢 El ganador se publicará en nuestra página y en Facebook Sorteos501.",
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
    const numeroWhatsApp = "8147932982";



    const [vendidos, setVendidos] = useState<number[]>([]);
    const [seleccionados, setSeleccionados] = useState<number[]>([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadRandom, setCantidadRandom] = useState(1);

    const [nombre, setNombre] = useState("");
    const [estado, setEstado] = useState("");
    const [celular, setCelular] = useState("");
    const [mostrarTerminos, setMostrarTerminos] = useState(false);
    const [mostrarPrivacidad, setMostrarPrivacidad] = useState(false);
    const [mostrarAvisosPagina, setMostrarAvisosPagina] = useState(false);

    const [busquedaCelular, setBusquedaCelular] = useState("");
    const [resultadoBusqueda, setResultadoBusqueda] = useState<ResultadoBusqueda[] | null>(null);
    const [mostrarReglas, setMostrarReglas] = useState(false);



    const buscarPorCelular = async () => {

        if (!busquedaCelular) return;

        try {

            const q = query(
                collection(db, "boletos"),
                where("celular", "==", busquedaCelular)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setResultadoBusqueda(null);
                alert("No se encontraron boletos con ese número");
                return;
            }

            const boletos = snapshot.docs.map((doc) => {
                const data = doc.data() as {
                    estadoPago: string;
                    nombre: string;
                    estado: string;
                    celular: string;

                };

                return {
                    numero: doc.id,
                    nombre: data.nombre,
                    estado: data.estado,
                    celular: data.celular,
                    estadoPago: data.estadoPago
                };
            });

            const datos = {
                nombre: boletos[0].nombre,
                estado: boletos[0].estado,
                celular: boletos[0].celular,
                boletos: boletos.map(b => b.numero),
                pagados: boletos.filter(b => b.estadoPago === "pagado").length,
                pendientes: boletos.filter(b => b.estadoPago === "apartado").length
            };

            setResultadoBusqueda([datos]);

        } catch (error) {

            console.error(error);
            alert("Hubo un error al buscar los datos.");

        }
    };

    const boletosPorPagina = 100;
    const totalPaginas = Math.ceil(totalBoletos / boletosPorPagina);

    const inicio = (paginaActual - 1) * boletosPorPagina;
    const fin = inicio + boletosPorPagina;

    const boletos = Array.from({ length: totalBoletos }, (_, i) => i).slice(inicio, fin);

    useEffect(() => {

        const q = query(
            collection(db, "boletos"),
            where("estadoPago", "in", ["apartado", "pagado"])
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {

            const vendidosTemp: number[] = [];

            querySnapshot.forEach((documento) => {
                const data = documento.data();

                if (data.estadoPago === "apartado" || data.estadoPago === "pagado") {
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

🎫 Números seleccionados:
${seleccionados.join(", ")}

📦 Cantidad de boletos: ${seleccionados.length}

💵 Total a pagar: $${totalPagar} MXN

📍 Estado: ${estado}
📱 Celular: ${celular}

‼️ IMPORTANTE ‼️

Tienes 24hrs para realizar el pago de tus boletos.

💳 Cuenta bancaria para pagos

Banco: SANTANDER
Titular: Jesus Michel Moreno Escobar
CLABE: 014020200149334649

Banco: BBVA
Titular: Ali Jassir Gaxiola Escobar
CLABE: 012180015548269167

📌 Concepto de pago: Tu nombre completo.

📸 Una vez realizado el pago, envía tu comprobante por este mismo chat de WhatsApp para confirmar tus boletos.

⚠️ Importante: No olvides agregar el concepto o referencia del pago, ya que con ese dato podremos verificar que el depósito corresponde a tu compra.

En cuanto confirmemos el pago, tus boletos quedarán registrados y asegurados. 🎟️✅

¡Mucha suerte! 🍀
`;

        const url = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensaje)}`;

        try {

            await runTransaction(db, async (transaction) => {

                const refs = seleccionados.map(numero =>
                    doc(db, "boletos", numero.toString().padStart(4, "0"))
                );

                const snapshots = [];

                for (const ref of refs) {
                    const snap = await transaction.get(ref);
                    snapshots.push(snap);
                }

                // Verificar primero todos
                for (let i = 0; i < snapshots.length; i++) {

                    const data = snapshots[i].data();

                    if (!snapshots[i].exists()) {
                        throw new Error("Error con un boleto.");
                    }

                    if (data?.estadoPago !== "disponible") {
                        throw new Error("Uno de los boletos ya fue tomado por otro usuario.");
                    }

                }

                // Luego actualizar todos
                for (let i = 0; i < snapshots.length; i++) {

                    transaction.update(refs[i], {
                        estadoPago: "apartado",
                        nombre: nombre,
                        estado: estado,
                        celular: celular
                    });

                }

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

        <main className="min-h-screen bg-gray-100 text-gray-800 p-6 led-frame">



            {/* ====================== BANNER ANIMADO PROMOCIONAL ====================== */}
            <div className="w-full bg-blue-500 text-white py-2 overflow-hidden relative mb-6">
                <div className="promo-marquee whitespace-nowrap font-bold text-sm sm:text-base">
                    📣 Síguenos en nuestra página de Facebook:{" "}
                    <a href="https://www.facebook.com/tuPagina" target="_blank" className="underline">
                        facebook.com/tuPagina
                    </a>{" "}
                    📣
                </div>
            </div>
            {/* ====================== FIN BANNER ====================== */}



            {/* AQUÍ EMPIEZAN TUS BLOQUES EXISTENTES */}

            <div className="text-center mb-10">

            <div className="text-center mb-10">

                <div className="w-full flex justify-center mb-8">
                    <img
                        src="/banner1.jpeg"
                        className="w-full max-w-7xl mx-auto rounded-3xl shadow-xl"
                        alt="Banner"
                    />
                </div>
                </div>

                <div className="text-center mt-6 leading-tight">

                    <h1 className="text-[#6b6a5a] text-4xl md:text-6xl font-extrabold tracking-wide mb-3 animate-pulse">
                      🎉  GRAN RIFA 🎉
                    </h1>

                    <p className="text-[#6b6a5a] text-3xl md:text-5xl font-extrabold mb-2">
                        $20,000 PESOS
                    </p>

                    <p className="text-[#6b6a5a] text-lg md:text-xl font-semibold">
                        Boletos disponibles del <span className="font-bold">0000</span> al <span className="font-bold">1999</span>
                    </p>

                    <p className="text-[#6b6a5a] text-xl md:text-2xl font-bold mt-2">
                        Solo $20 MXN por boleto
                    </p>

                    <p className="text-[#6b6a5a] text-sm opacity-80 mt-2">
                        Aparta tus números antes de que se agoten
                    </p>

                </div>

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



    <div className="max-w-4xl mx-auto mt-6 bg-white rounded-2xl shadow-lg overflow-hidden border">
    <button
      onClick={() => setMostrarReglas(!mostrarReglas)}
      className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition"
    >
      <span className="text-[#6b6a5a] font-bold text-lg flex items-center gap-2">
        🎯 Reglas de Juego – Sorteos501
      </span>

      <span className="text-[#6b6a5a] font-bold text-lg">
        {mostrarReglas ? "▲" : "▼"}
      </span>
    </button>

    {mostrarReglas && (
      <div className="px-6 pb-6 text-[#6b6a5a] text-sm space-y-3 border-t">
        <p>
          <strong>1. Rango de boletos:</strong> La rifa consta de boletos numerados del 0000 al 1999.
        </p>
        <p>
         <strong>2. Selección del ganador:</strong>   El número ganador se determinará usando las últimas cifras del premio mayor de la Lotería Nacional.
        </p>
        <p>
          <strong>3. Regla de ajuste de números:</strong> Si el número ganador está fuera del rango 0000–1999, se aplica la resta de 2,000 repetidamente hasta obtener un número dentro del rango.
        </p>
        <p>
          <strong>Ejemplo de cálculo:</strong><br />
          Si el número ganador es 5601 → 5601 − 2000 = 3601 → 3601 − 2000 = 1601.<br />
          ✅ El boleto ganador sería el 1601.
        </p>
        <p>
          <strong>4. Posibilidades adicionales:</strong><br />
          Cada número de boleto tiene <strong>hasta 4 posibilidades más de ganar</strong> debido a la regla de resta de 2,000.<br />
          Por ejemplo, si compras el boleto <strong>1500</strong>, tus números “derivados” serían: <strong>3500, 5500, 7500 y 9500</strong>.<br />
          Todos estos números, al aplicar la regla, se reducen a tu boleto original (1500), aumentando tus oportunidades de ganar.
        </p>
        <p>
          <strong>5. Participación:</strong> Todos los boletos validados antes del sorteo participan automáticamente.
        </p>
      </div>
    )}
  </div>

</div>



                  

                </div>
                {/* BLOQUE MEJORADO: Buscar mis boletos */}
                <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl mb-8">

                    {/* Título */}
                    <h2 className="text-[#6b6a5a] text-2xl font-bold mb-4 text-center">
                        🔍 Buscar mis boletos con número celular
                    </h2>

                    {/* Input y botón */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                        <input
                            type="tel"
                            placeholder="Ingresa tu número de celular"
                            value={busquedaCelular}
                            onChange={(e) => setBusquedaCelular(e.target.value)}
                            className="text-[#6b6a5a] p-3 rounded-xl w-full sm:flex-1 border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:outline-none transition"
                        />

                        <button
                            onClick={buscarPorCelular}
                            className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-6 rounded-full shadow-md transition transform hover:scale-105"
                        >
                            Buscar
                        </button>
                    </div>

                    {/* Resultados */}
                    {resultadoBusqueda && (
                        <div className="space-y-4">
                            {resultadoBusqueda.map((dato, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 p-4 rounded-xl shadow hover:shadow-lg border border-gray-200 transition"
                                >
                                    <p><strong>Nombre:</strong> {dato.nombre}</p>
                                    <p><strong>Estado:</strong> {dato.estado}</p>
                                    <p><strong>Celular:</strong> {dato.celular}</p>
                                    <p><strong>Boletos:</strong> {dato.boletos.join(", ")}</p>
                                    <p className="text-green-600 font-bold">✅ Pagados: {dato.pagados}</p>
                                    {dato.pendientes > 0 && (
                                        <p className="text-red-500 font-bold">⏳ Pendientes de pago: {dato.pendientes}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

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
                    className="bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold py-2 px-6 rounded-full transition transform hover:scale-105"
                >
                    🎲 Elegir números al azar
                </button>



            </div>

            {/* PAGINADOR APP RESPONSIVE */}

            <div className="flex justify-center items-center gap-2 my-8 flex-nowrap">

                <button
                    onClick={() => setPaginaActual(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-3 py-2 text-sm rounded-lg bg-[#1877F2] text-white font-semibold hover:bg-[#166FE5] disabled:opacity-40 transition whitespace-nowrap"
                >
                    Anterior
                </button>

                <span className="px-3 py-2 text-sm bg-white text-black rounded-lg font-bold whitespace-nowrap">
                    Página {paginaActual}/{totalPaginas}
                </span>

                <button
                    onClick={() => setPaginaActual(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-2 text-sm rounded-lg bg-[#1877F2] text-white font-semibold hover:bg-[#166FE5] disabled:opacity-40 transition whitespace-nowrap"
                >
                    Siguiente
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
                            className={`w-16 sm:w-20 h-14 sm:h-16 rounded-xl font-bold text-sm border flex items-center justify-center
    transition-all duration-200 transform shadow-sm
    ${estaVendido
                                    ? "bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600"
                                    : estaSeleccionado
                                        ? "bg-blue-500 text-white scale-110 shadow-xl border-blue-300"
                                        : "bg-white text-black border-gray-300 hover:bg-blue-50 hover:scale-105 hover:shadow-md"
                                }`}
                        >
                            {numero.toString().padStart(4, "0")}
                        </button>
                        

                    );

                })}

         

            </div>
            {/* Términos y Condiciones */}
            <div className="max-w-4xl mx-auto mt-12 bg-white rounded-2xl shadow-lg overflow-hidden border">

                <button
                    onClick={() => setMostrarTerminos(!mostrarTerminos)}
                    className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition"
                >
                    <span className="text-[#6b6a5a] font-bold text-lg flex items-center gap-2">
                        📄 Términos y Condiciones – Sorteos501
                    </span>

                    <span className="text-[#6b6a5a] font-bold text-lg">
                        {mostrarTerminos ? "▲" : "▼"}
                    </span>
                </button>

                {mostrarTerminos && (
                    <div className="px-6 pb-6 text-[#6b6a5a] text-sm space-y-3 border-t">
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
                        <p><strong>11. Comprar boleto</strong><br />Al momento de comprar sus boletos acepta términos y condiciones.</p>
                    </div>
                )}

            </div>


            {/* Política de Privacidad */}
            <div className="max-w-4xl mx-auto mt-6 bg-white rounded-2xl shadow-lg overflow-hidden border">

                <button
                    onClick={() => setMostrarPrivacidad(!mostrarPrivacidad)}
                    className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition"
                >
                    <span className="text-[#6b6a5a] font-bold text-lg flex items-center gap-2">
                        🔒 Política de Privacidad – Sorteos501
                    </span>

                    <span className="text-[#6b6a5a] font-bold text-lg">
                        {mostrarPrivacidad ? "▲" : "▼"}
                    </span>
                </button>

                {mostrarPrivacidad && (
                    <div className="px-6 pb-6 text-[#6b6a5a] text-sm space-y-3 border-t">

                        <p><strong>1. Datos que recopilamos</strong></p>
                        <ul className="list-disc ml-6">
                            <li>Nombre</li>
                            <li>Número de teléfono</li>
                            <li>Estado o lugar de residencia</li>
                        </ul>

                        <p><strong>2. Uso de la información</strong></p>
                        <ul className="list-disc ml-6">
                            <li>Registrar la participación en la rifa</li>
                            <li>Confirmar pagos y boletos</li>
                            <li>Contactar al ganador</li>
                            <li>Informar resultados del sorteo</li>
                        </ul>

                        <p><strong>3. Protección de datos</strong><br />
                            Sorteos501 se compromete a proteger la información personal de los participantes y no compartirla, venderla ni distribuirla a terceros.</p>

                        <p><strong>4. Almacenamiento de información</strong><br />
                            Los datos se almacenarán únicamente durante el tiempo necesario para la realización de la rifa.</p>

                        <p><strong>5. Derechos del participante</strong><br />
                            El participante podrá solicitar la eliminación de sus datos una vez finalizada la rifa.</p>

                        <p><strong>6. Aceptación</strong><br />
                            Al participar en la rifa, el usuario acepta esta política de privacidad.</p>

                    </div>
                )}

            </div>
            {/* Banner Facebook */}
            <div className="max-w-4xl mx-auto mt-12 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 rounded-2xl shadow-2xl p-6 text-center transform hover:scale-105 transition duration-300">

                <h2 className="text-white text-2xl md:text-3xl font-extrabold mb-2">
                    📣 Síguenos en Facebook
                </h2>
            
                <p className="text-white mb-4 text-sm md:text-base">
                    Aquí publicaremos al ganador, avances de la rifa y próximos sorteos.
                </p>

                <a
                    href="https://www.facebook.com/share/1AhAcWLDaZ/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-blue-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-200 transition"
                >
                    🔵 Ir a Facebook Sorteos501
                </a>

            </div>

            {/* Copyright */}
            <div className="text-center text-gray-400 text-sm mt-12 pb-4">
                © 2026 Sorteos501 – Todos los derechos reservados.
            </div>
        </main>

    );

}