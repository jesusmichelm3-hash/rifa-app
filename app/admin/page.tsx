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

    const [logueado, setLogueado] = useState(false);
    const [password, setPassword] = useState("");

    const PASSWORD_ADMIN = "XHanLc3dfdKWtQ9";

    const [boletos, setBoletos] = useState<Boleto[]>([]);
    const [busqueda, setBusqueda] = useState("");

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

    const filtrados = boletos.filter((b) =>
        (b.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (b.celular || "").includes(busqueda)
    );

    // AGRUPAR POR CELULAR
    const agrupados: { [key: string]: Boleto[] } = {};

    filtrados.forEach((b) => {

        const key = b.celular || "sin";

        if (!agrupados[key]) {
            agrupados[key] = [];
        }

        agrupados[key].push(b);

    });

    const disponibles = boletos.filter(b => b.estadoPago === "disponible").length;
    const apartados = boletos.filter(b => b.estadoPago === "apartado").length;
    const pagados = boletos.filter(b => b.estadoPago === "pagado").length;

    const generarComprobante = (grupo: Boleto[]) => {

        const cliente = grupo[0];

        const numeros = grupo.map(b => b.id).join(", ");

        const texto = `
COMPROBANTE SORTEOS501

Nombre: ${cliente.nombre}

Boletos:
${numeros}

Estado de pago: ${cliente.estadoPago}

Gracias por participar
`;

        alert(texto);

    };

    const enviarWhatsApp = (grupo: Boleto[]) => {

        const cliente = grupo[0];

        if (!cliente.celular) return;

        const numeros = grupo.map(b => b.id).join(", ");

        const mensaje = `🎉 Pago confirmado

Tus boletos para la rifa son:

${numeros}

¡Mucha suerte! 🍀
Sorteos501`;

        const url = `https://wa.me/52${cliente.celular}?text=${encodeURIComponent(mensaje)}`;

        window.open(url, "_blank");

    };

    if (!logueado) {

        return (

            <div style={{ padding: "40px" }}>

                <h1>Panel Administrador</h1>

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: "10px", marginTop: "20px" }}
                />

                <br />

                <button
                    onClick={() => {

                        if (password === PASSWORD_ADMIN) {
                            setLogueado(true);
                        } else {
                            alert("Contraseña incorrecta");
                        }

                    }}
                    style={{ marginTop: "20px" }}
                >
                    Entrar
                </button>

            </div>

        )

    }

    return (

        <div style={{ padding: "40px" }}>

            <h1>Panel Administrador Sorteos501</h1>

            <h3>Estadísticas</h3>

            <p>Disponibles: {disponibles}</p>
            <p>Apartados: {apartados}</p>
            <p>Pagados: {pagados}</p>

            <input
                type="text"
                placeholder="Buscar por nombre o celular"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ padding: "10px", marginTop: "20px", width: "300px" }}
            />

            <div style={{ marginTop: "30px" }}>

                {Object.values(agrupados).map((grupo, index) => {

                    const cliente = grupo[0];
                    const boletosCliente = grupo.map(b => b.id).join(", ");

                    return (

                        <div
                            key={index}
                            style={{
                                border: "1px solid #ccc",
                                padding: "20px",
                                marginBottom: "15px"
                            }}
                        >

                            <p><b>Nombre:</b> {cliente.nombre}</p>
                            <p><b>Celular:</b> {ocultarCelular(cliente.celular)}</p>

                            <p>
                                <b>Boletos:</b> {boletosCliente}
                            </p>

                            <p><b>Estado:</b> {cliente.estadoPago}</p>

                            {cliente.estadoPago === "apartado" && (

                                <button
                                    onClick={() => confirmarPago(grupo.map(b => b.id))}
                                    style={{ marginRight: "10px" }}
                                >
                                    Confirmar pago
                                </button>

                            )}

                            {cliente.estadoPago !== "disponible" && (

                                <button
                                    onClick={() => liberarBoletos(grupo.map(b => b.id))}
                                    style={{ marginRight: "10px" }}
                                >
                                    Liberar boletos
                                </button>

                            )}

                            <button
                                onClick={() => generarComprobante(grupo)}
                                style={{ marginRight: "10px" }}
                            >
                                Comprobante
                            </button>

                            <button
                                onClick={() => enviarWhatsApp(grupo)}
                            >
                                WhatsApp
                            </button>

                        </div>

                    )

                })}

            </div>

        </div>

    )

}