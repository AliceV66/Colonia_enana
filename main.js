// --- CONFIGURACIÓN Y CONSTANTES ---
const WORLD_WIDTH = 40;  // Ancho del mundo en tiles
const WORLD_HEIGHT = 25; // Alto del mundo en tiles

// --- MODELO DE DATOS (DATA MODEL) ---

/**
 * Genera la estructura de datos para un nuevo mundo.
 * Por ahora, crea una habitación vacía con paredes de roca.
 * @returns {Array<Array<Object>>} Un array 2D de objetos "tile".
 */
function generateWorld() {
    const world = [];

    for (let y = 0; y < WORLD_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < WORLD_WIDTH; x++) {
            let tileType = 'floor'; // Por defecto, todo es suelo

            // Poner rocas en los bordes para crear las paredes
            if (x === 0 || x === WORLD_WIDTH - 1 || y === 0 || y === WORLD_HEIGHT - 1) {
                tileType = 'rock';
            }
            
            row.push({ type: tileType });
        }
        world.push(row);
    }
    console.log("Mundo generado en memoria:", world);
    return world;
}


// --- RENDERIZADO (VIEW) ---

/**
 * Dibuja el mundo en el DOM basándose en el modelo de datos.
 * @param {Array<Array<Object>>} worldData - El array 2D que representa el mundo.
 */
function renderWorld(worldData) {
    const worldContainer = document.getElementById('game-world');
    
    // Limpiamos el mundo anterior antes de dibujar el nuevo
    worldContainer.innerHTML = ''; 

    // Actualizamos las variables CSS para que la grilla coincida con el tamaño del mundo
    worldContainer.style.setProperty('--world-width', WORLD_WIDTH);
    worldContainer.style.setProperty('--world-height', WORLD_HEIGHT);

    // Iteramos sobre el modelo de datos para crear los elementos del DOM
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            const tileData = worldData[y][x];
            const tileElement = document.createElement('div');
            
            tileElement.classList.add('tile', `tile-${tileData.type}`);
            
            worldContainer.appendChild(tileElement);
        }
    }
    console.log("Renderizado del mundo completado.");
}


// --- INICIO DEL JUEGO ---

// Nos aseguramos de que el script se ejecute solo cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado. Iniciando simulación.");
    
    // 1. Generar los datos del mundo
    const worldData = generateWorld();
    
    // 2. Renderizar el mundo en la pantalla
    renderWorld(worldData);
});