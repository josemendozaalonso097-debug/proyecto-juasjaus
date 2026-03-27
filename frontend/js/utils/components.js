// js/utils/components.js
export async function loadComponent(id, path) {
    const container = document.getElementById(id);
    if (!container) return;
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        container.innerHTML = html;
        
        // Execute any script tags that were inserted
        const scripts = container.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    } catch (error) {
        console.error(`Error loading component from ${path}:`, error);
    }
}
