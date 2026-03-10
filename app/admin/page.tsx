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

    const [logueado, setLogueado] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");

    const PASSWORD_ADMIN = "sorteos501admin";

    const [boletos, setBoletos] = useState<Boleto[]>([]);
    const [busqueda, setBusqueda] = useState<string>("");

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

    const confirmarPago = async (id: string) => {

        const ref = doc(db, "boletos", id);

        await updateDoc(ref, {
            estadoPago: "pagado"
        });

        cargarBoletos();

    };

    const liberarBoleto = async (id: string) => {

        const ref = doc(db, "boletos", id);

        await updateDoc(ref, {
            estadoPago: "disponible",
            nombre: "",
            celular: "",
            estado: ""
        });

        cargarBoletos();

    };

    const ocultarCelular = (numero?: string) => {

        if (!numero) return "";

        const inicio = numero.slice(0, 2);
        const final = numero.slice(-2);

        return inicio + "******" + final;

    };

    const generarComprobante = (b: Boleto) => {

        const texto = `
COMPROBANTE SORTEOS501

Boleto: ${b.id}
Nombre: ${b.nombre}
Celular: ${ocultarCelular(b.celular)}

Estado de pago: ${b.estadoPago}

Gracias por participar
`;

        alert(texto);

    };

    const enviarWhatsApp = (b: Boleto) => {

        if (!b.celular) return;

        const mensaje = `Pago confirmado 🎉

Tus boletos para la rifa son:

${b.id}

Gracias por participar en Sorteos501 🍀`;

        const url = `https://wa.me/52${b.celular}?text=${encodeURIComponent(mensaje)}`;

        window.open(url, "_blank");

    };

    const filtrados = boletos.filter((b) =>
        (b.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (b.celular || "").includes(busqueda)
    );

    const disponibles = boletos.filter(b => b.estadoPago === "disponible").length;
    const apartados = boletos.filter(b => b.estadoPago === "apartado").length;
    const pagados = boletos.filter(b => b.estadoPago === "pagado").length;

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

                {filtrados.map((b) => (

                    <div
                        key={b.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "15px",
                            marginBottom: "10px"
                        }}
                    >

                        <p><b>Boleto:</b> {b.id}</p>
                        <p><b>Nombre:</b> {b.nombre}</p>
                        <p><b>Celular:</b> {ocultarCelular(b.celular)}</p>
                        <p><b>Estado:</b> {b.estado}</p>
                        <p><b>Pago:</b> {b.estadoPago}</p>

                        {b.estadoPago === "apartado" && (

                            <button
                                onClick={() => confirmarPago(b.id)}
                                style={{ marginRight: "10px" }}
                            >
                                Confirmar pago
                            </button>

                        )}

                        {b.estadoPago !== "disponible" && (

                            <button
                                onClick={() => liberarBoleto(b.id)}
                                style={{ marginRight: "10px" }}
                            >
                                Liberar boleto
                            </button>

                        )}

                        <button
                            onClick={() => generarComprobante(b)}
                            style={{ marginRight: "10px" }}
                        >
                            Comprobante
                        </button>

                        <button
                            onClick={() => enviarWhatsApp(b)}
                        >
                            WhatsApp
                        </button>

                    </div>

                ))}

            </div>

        </div>

    )

}