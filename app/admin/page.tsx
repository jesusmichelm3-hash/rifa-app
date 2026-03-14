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

    // ================= CARGAR BOLETOS =================
    const cargarBoletos = async () => {
        try {
            const boletosRef = collection(db, "boletos");
            const snapshot = await getDocs(boletosRef);

            const lista: Boleto[] = [];

            snapshot.forEach((docu) => {
                const data = docu.data();

                lista.push({
                    id: docu.id,
                    nombre: data.nombre || "",
                    celular: data.celular || "",
                    estado: data.estado || "",
                    estadoPago: data.estadoPago || "disponible",
                });
            });

            setBoletos(lista);
        } catch (error) {
            console.error("Error cargando boletos:", error);
            alert("No se pudieron cargar los boletos desde Firebase");
        }
    };

    useEffect(() => {
        if (logueado) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            cargarBoletos();
        }
    }, [logueado]);

    // ================= CONFIRMAR PAGO =================
    const confirmarPago = async (ids: string[]) => {
        for (const id of ids) {
            const ref = doc(db, "boletos", id);

            await updateDoc(ref, {
                estadoPago: "pagado",
            });
        }

        cargarBoletos();
    };

    // ================= LIBERAR BOLETOS =================
    const liberarBoletos = async (ids: string[]) => {
        for (const id of ids) {
            const ref = doc(db, "boletos", id);

            await updateDoc(ref, {
                estadoPago: "disponible",
                nombre: "",
                celular: "",
                estado: "",
            });
        }

        cargarBoletos();
    };

    // ================= OCULTAR CELULAR =================
    const ocultarCelular = (numero?: string) => {
        if (!numero) return "";

        const inicio = numero.slice(0, 2);
        const final = numero.slice(-2);

        return inicio + "******" + final;
    };

    // ================= FILTRADO =================
    let filtrados = boletos;

    if (busqueda !== "") {
        const encontrados = boletos.filter(
            (b) =>
                (b.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
                (b.celular || "").includes(busqueda) ||
                (b.id || "").includes(busqueda)
        );

        const celulares = new Set(encontrados.map((b) => b.celular));

        filtrados = boletos.filter((b) => celulares.has(b.celular));
    }

    const agrupados: { [key: string]: Boleto[] } = {};

    filtrados.forEach((b) => {
        const key = b.celular ? b.celular : `sin-${b.id}`;

        if (!agrupados[key]) {
            agrupados[key] = [];
        }

        agrupados[key].push(b);
    });

    // ================= CONTADORES =================
    const disponibles = boletos.filter((b) => b.estadoPago === "disponible").length;
    const apartados = boletos.filter((b) => b.estadoPago === "apartado").length;
    const pagados = boletos.filter((b) => b.estadoPago === "pagado").length;

    const totalVendido = pagados * PRECIO_BOLETO;

    // ================= COPIAR BOLETOS =================
    const copiarBoletos = (grupo: Boleto[]) => {
        const numeros = grupo.map((b) => b.id).join(", ");

        navigator.clipboard.writeText(numeros);

        alert("Boletos copiados");
    };

    // ================= WHATSAPP COMPROBANTE =================
    const enviarWhatsApp = (grupo: Boleto[]) => {
        const cliente = grupo[0];

        if (!cliente.celular) return;

        const numeros = grupo.map((b) => b.id).join(", ");

        const ahora = new Date();

        const fecha = ahora.toLocaleDateString("es-MX");
        const hora = ahora.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
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

        const url = `https://api.whatsapp.com/send?phone=52${cliente.celular}&text=${encodeURIComponent(
            mensaje
        )}`;

        window.open(url, "_blank");
    };

    // ================= MENSAJE A TODOS LOS PAGADOS =================
    const enviarMensajePagados = () => {
        const pagados = boletos.filter(
            (b) => b.estadoPago === "pagado" && b.celular
        );

        const celularesUnicos = [...new Set(pagados.map((b) => b.celular))];

        const mensaje = `🎉 Sorteos501

Gracias por participar en nuestra rifa.

📅 El sorteo se realizará el 1 de mayo.

Si la meta se alcanza antes, el sorteo se hará en el sorteo próximo disponible.

📢 El resultado se publicará en nuestras páginas y recibirás un mensaje aquí.

¡Mucha suerte! 🍀`;

        celularesUnicos.forEach((cel, index) => {
            setTimeout(() => {
                const url = `https://api.whatsapp.com/send?phone=52${cel}&text=${encodeURIComponent(
                    mensaje
                )}`;

                window.open(url, "_blank");
            }, index * 800);
        });
    };

    // ================= LOGIN =================
    if (!logueado) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
                    <h1 className="text-3xl font-bold text-center mb-6">
                        Panel Administrador
                    </h1>

                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border rounded-lg p-3 mb-4"
                    />

                    <button
                        onClick={() => {
                            if (password === PASSWORD_ADMIN) {
                                setLogueado(true);
                            } else {
                                alert("Contraseña incorrecta");
                            }
                        }}
                        className="w-full bg-blue-600 text-white p-3 rounded-lg"
                    >
                        Iniciar sesión
                    </button>
                </div>
            </div>
        );
    }

    // ================= PANEL =================
    return (
        <div className={`${darkMode ? "dark" : ""}`}>
            <div className="bg-gray-100 dark:bg-gray-900 p-10 min-h-screen">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold dark:text-white">
                        Admin Sorteos501
                    </h1>

                    <div className="flex gap-3">
                        <button
                            onClick={enviarMensajePagados}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg"
                        >
                            Notificar pagados
                        </button>

                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                        >
                            🌙 Dark Mode
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-6 mb-10">
                    <div className="bg-green-100 p-5 rounded-xl text-center shadow">
                        <p>Disponibles</p>
                        <p className="text-3xl font-bold">{disponibles}</p>
                    </div>

                    <div className="bg-yellow-100 p-5 rounded-xl text-center shadow">
                        <p>Apartados</p>
                        <p className="text-3xl font-bold">{apartados}</p>
                    </div>

                    <div className="bg-blue-100 p-5 rounded-xl text-center shadow">
                        <p>Pagados</p>
                        <p className="text-3xl font-bold">{pagados}</p>
                    </div>

                    <div className="bg-purple-100 p-5 rounded-xl text-center shadow">
                        <p>Total vendido</p>
                        <p className="text-3xl font-bold">${totalVendido}</p>
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="Buscar..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="border p-3 rounded-lg w-full max-w-md mb-8"
                />

                <div>
                    {Object.values(agrupados).map((grupo, index) => {
                        const cliente = grupo[0];
                        const boletosCliente = grupo.map((b) => b.id).join(", ");

                        return (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-4"
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
                                            onClick={() => confirmarPago(grupo.map((b) => b.id))}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg"
                                        >
                                            Confirmar pago
                                        </button>
                                    )}

                                    {cliente.estadoPago !== "disponible" && (
                                        <button
                                            onClick={() => liberarBoletos(grupo.map((b) => b.id))}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                        >
                                            Liberar
                                        </button>
                                    )}

                                    <button
                                        onClick={() => copiarBoletos(grupo)}
                                        className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                                    >
                                        Copiar boletos
                                    </button>

                                    <button
                                        onClick={() => enviarWhatsApp(grupo)}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg"
                                    >
                                        WhatsApp
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
