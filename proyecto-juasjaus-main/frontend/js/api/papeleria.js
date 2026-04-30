// js/api/papeleria.js
export async function enviarPapeleria(datos) {
    // Aquí iría el fetch al backend en el futuro.
    // Por ahora solo simularemos la petición
    console.log('Enviando papelería al endpoint API...', datos);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ ok: true, json: async () => ({ status: 'success' }) });
        }, 1000);
    });
}
