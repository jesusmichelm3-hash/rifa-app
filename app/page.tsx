export default function Home() {
    return (
        <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
            <h1 className="text-4xl font-bold mb-4 text-center">
                🎉 Gran Rifa Oficial 🎉
            </h1>

            <p className="text-lg text-gray-700 mb-6 text-center">
                Participa y gana una increíble freidora de aire.
            </p>

            <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md text-center">
                <h2 className="text-2xl font-semibold mb-2">Precio por boleto</h2>
                <p className="text-3xl font-bold text-green-600 mb-4">$50 MXN</p>

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition">
                    Seleccionar boleto
                </button>
            </div>
        </main>
    );
}