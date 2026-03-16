"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

type Boleto = {
    id: string;
    nombre?: string;
    celular?: string;
    estado?: string;
    estadoPago?: string;
};

export default function Admin() {

    const PASSWORD_ADMIN = "XHanLc3dfdKWtQ9";

    const [password, setPassword] = useState("");
    const [logueado, setLogueado] = useState(false);
    const [boletos, setBoletos] = useState<Boleto[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [darkMode, setDarkMode] = useState(false);

    const PRECIO_BOLETO = 20;

    const cargarBoletos = async () => {

        const snapshot = await getDocs(collection(db, "boletos"));

        const data: Boleto[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Boleto, "id">)
        }));

        setBoletos(data);

    };

    useEffect(() => {

        if (logueado) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            cargarBoletos();
        }

    }, [logueado]);

    const confirmarPago = async (ids: string[]) => {

        for (const id of ids) {

            const ref = doc(db, "boletos", id);

            await updateDoc(ref, {
                estadoPago: "pagado"
            });

        }

        cargarBoletos();

    };

    const liberarBoletos = async (ids: string[]) => {

        for (const id of ids) {

            const ref = doc(db, "boletos", id);

            await updateDoc(ref, {
                estadoPago: "disponible",
                nombre: "",
                celular: "",
                estado: ""
            });

        }

        cargarBoletos();

    };

    const ocultarCelular = (numero?: string) => {

        if (!numero) return "";

        const inicio = numero.slice(0, 2);
        const final = numero.slice(-2);

        return inicio + "******" + final;

    };

    let filtrados = boletos;

    if (busqueda !== "") {

        const encontrados = boletos.filter((b) =>
            (b.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
            (b.celular || "").includes(busqueda) ||
            (b.id || "").includes(busqueda)
        );

        const celulares = new Set(encontrados.map(b => b.celular));

        filtrados = boletos.filter(b => celulares.has(b.celular));

    }

    const agrupados: { [key: string]: Boleto[] } = {};

    filtrados.forEach((b) => {
        // Si hay celular lo usamos, si no usamos "id" para que no se pierda
        const key = b.celular ? b.celular : `sin-${b.id}`;

        if (!agrupados[key]) {
            agrupados[key] = [];
        }

        agrupados[key].push(b);
    });

    const disponibles = boletos.filter(b => b.estadoPago === "disponible").length;
    const apartados = boletos.filter(b => b.estadoPago === "apartado").length;
    const pagados = boletos.filter(b => b.estadoPago === "pagado").length;

    const totalVendido = pagados * PRECIO_BOLETO;

    const copiarBoletos = (grupo: Boleto[]) => {

        const numeros = grupo.map(b => b.id).join(", ");

        navigator.clipboard.writeText(numeros);

        alert("Boletos copiados");

    };

    const enviarWhatsApp = (grupo: Boleto[]) => {

        const cliente = grupo[0];

        if (!cliente.celular) return;

        // limpiar número (quitar +, espacios, guiones, etc)
        let numero = cliente.celular.replace(/\D/g, "");

        // si es número mexicano de 10 dígitos agregar 52
        if (numero.length === 10) {
            numero = "52" + numero;
        }

        const numeros = grupo.map(b => b.id).join(", ");

        const ahora = new Date();

        const fecha = ahora.toLocaleDateString("es-MX");
        const hora = ahora.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit"
        });

        const total = grupo.length * PRECIO_BOLETO;

        const idCompra = "SR501-" + Math.floor(Math.random() * 100000);

        const mensaje = `🧾 COMPROBANTE DE COMPRA

ID: ${idCompra}
Fecha: ${fecha}
Hora: ${hora}

Cliente: ${cliente.nombre || ""}

🎟 Boletos: ${numeros}
💰 Total pagado: $${total} MXN

Estado: ✅ CONFIRMADO

Sorteos501`;

        // enlace nuevo de WhatsApp
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

        window.open(url, "_blank");

    };

    if (!logueado) {

        return (

            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition">

                <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl w-full max-w-md">

                    <h1 className="text-3xl font-bold text-center mb-6 dark:text-white">
                        Panel Administrador
                    </h1>

                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border rounded-lg p-3 mb-4 dark:bg-gray-700 dark:text-white"
                    />

                    <button
                        onClick={() => {
                            if (password === PASSWORD_ADMIN) {
                                setLogueado(true);
                            } else {
                                alert("Contraseña incorrecta");
                            }
                        }}
                        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Iniciar sesión
                    </button>

                </div>

            </div>

        );

    }

    return (

        <div className={`${darkMode ? "dark" : ""}`}>

            <div className="h-auto bg-gray-100 dark:bg-gray-900 p-10 transition">

                <div className="flex justify-between items-center mb-10">

                    <h1 className="text-3xl font-bold dark:text-white">
                        Admin Sorteos501
                    </h1>

                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                    >
                        🌙 Dark Mode
                    </button>

                </div>

                <div className="grid grid-cols-4 gap-6 mb-10">

                    <div className="bg-green-100 p-5 rounded-xl text-center shadow">
                        <p className="text-gray-700 font-medium">Disponibles</p>
                        <p className="text-3xl font-bold text-gray-900">{disponibles}</p>
                    </div>

                    <div className="bg-yellow-100 p-5 rounded-xl text-center shadow">
                        <p className="text-gray-700 font-medium">Apartados</p>
                        <p className="text-3xl font-bold text-gray-900">{apartados}</p>
                    </div>

                    <div className="bg-blue-100 p-5 rounded-xl text-center shadow">
                        <p className="text-gray-700 font-medium">Pagados</p>
                        <p className="text-3xl font-bold text-gray-900">{pagados}</p>
                    </div>

                    <div className="bg-purple-100 p-5 rounded-xl text-center shadow">
                        <p className="text-gray-700 font-medium">Total vendido</p>
                        <p className="text-3xl font-bold text-gray-900">${totalVendido}</p>
                    </div>


                </div>


            </div>

            <input
                type="text"
                placeholder="Buscar por numero de boletos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="border p-3 rounded-lg w-full max-w-md mb-8"
            />

            <div>

                {Object.values(agrupados).map((grupo, index) => {

                    const cliente = grupo[0];
                    const boletosCliente = grupo.map(b => b.id).join(", ");

                    return (

                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-4 transition hover:scale-[1.01]"
                        >

                            <p className="dark:text-white">
                                <b>Nombre:</b> {cliente.nombre}
                            </p>

                            <p className="dark:text-white">
                                <b>Celular:</b> {ocultarCelular(cliente.celular)}
                            </p>

                            <p className="dark:text-white">
                                <b>Boletos:</b> {boletosCliente}
                            </p>

                            <p className="dark:text-white mb-4">
                                <b>Estado:</b> {cliente.estadoPago}
                            </p>

                            <div className="flex flex-wrap gap-2">

                                {cliente.estadoPago === "apartado" && (

                                    <button
                                        onClick={() => confirmarPago(grupo.map(b => b.id))}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                    >
                                        Confirmar pago
                                    </button>

                                )}

                                {cliente.estadoPago !== "disponible" && (

                                    <button
                                        onClick={() => liberarBoletos(grupo.map(b => b.id))}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                    >
                                        Liberar
                                    </button>

                                )}

                                <button
                                    onClick={() => copiarBoletos(grupo)}
                                    className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                                >
                                    Copiar boletos
                                </button>

                                <button
                                    onClick={() => enviarWhatsApp(grupo)}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                >
                                    WhatsApp
                                </button>

                            </div>

                        </div>

                    );

                })}

            </div>

        </div>



    );

}
