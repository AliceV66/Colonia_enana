// --- CONFIGURACIÓN Y CONSTANTES ---
const WORLD_WIDTH = 40;  // Ancho del mundo en tiles
const WORLD_HEIGHT = 25; // Alto del mundo en tiles

// --- NUEVO: Contenedor para los Agentes ---
const agents = []; 

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

/**
 * --- NUEVO: Crea un nuevo agente (enano) y lo añade a la lista de agentes.
 * @param {number} x - Posición inicial en el eje X.
 * @param {number} y - Posición inicial en el eje Y.
 */
function createAgent(x, y) {
    console.log(`Creando enano en la posición <span class="math-inline">\{x\},</span>{y}`);
    const agent = {
        id: agents.length + 1, // ID único
        name: `Urist McEnano #${agents.length + 1}`,
        char: '@', // El caracter que lo representa
        color: '#ffeb3b', // Un color amarillo para que destaque
        x: x,
        y: y,
        status: 'idle'
    };
    agents.push(agent);
}
/**
 * --- NUEVO ---
 * Intenta mover un agente en una dirección, verificando colisiones.
 * @param {Object} agent - El agente a mover.
 * @param {Array<Array<Object>>} worldData - Los datos del mundo para la colisión.
 * @param {number} dx - El cambio en X (-1 para izq, 1 para der, 0 si no hay mov).
 * @param {number} dy - El cambio en Y (-1 para arriba, 1 para abajo, 0 si no hay mov).
 */
function moveAgent(agent, worldData, dx, dy) {
    const newX = agent.x + dx;
    const newY = agent.y + dy;

    // Verificación de límites del mundo (nunca debería pasar con las paredes, pero es buena práctica)
    if (newX < 0 || newX >= WORLD_WIDTH || newY < 0 || newY >= WORLD_HEIGHT) {
        return; 
    }

    // Detección de Colisiones
    const targetTile = worldData[newY][newX];
    if (targetTile.type !== 'rock') {
        // Si no es una roca, actualizamos la posición del agente
        agent.x = newX;
        agent.y = newY;
    } else {
        console.log(`¡Auch! ${agent.name} se chocó contra una pared.`);
    }
}


// --- RENDERIZADO (VIEW) ---

/**
 * Dibuja el mundo en el DOM basándose en el modelo de datos.
 * @param {Array<Array<Object>>} worldData - El array 2D que representa el mundo.
 * @param {Array<Object>} agentsData - El array de agentes.
 */

function renderWorld(worldData, agentsData) {
    const worldContainer = document.getElementById('game-world');
    worldContainer.innerHTML = ''; 
    worldContainer.style.setProperty('--world-width', WORLD_WIDTH);
    worldContainer.style.setProperty('--world-height', WORLD_HEIGHT);

    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            const tileData = worldData[y][x];
            const tileElement = document.createElement('div');
            tileElement.classList.add('tile', `tile-${tileData.type}`);

            // --- LÓGICA DE RENDERIZADO MEJORADA ---
            // Por defecto, un tile no tiene texto.
            tileElement.textContent = ''; 

            // Si el tile es una roca, le ponemos su símbolo.
            if (tileData.type === 'rock') {
                tileElement.textContent = '#';
            }

            // Buscamos si hay un agente en esta coordenada (x, y).
            const agent = agentsData.find(a => a.x === x && a.y === y);
            if (agent) {
                // Si hay un agente, dibujamos su caracter y le damos su color.
                tileElement.textContent = agent.char;
                tileElement.style.color = agent.color;
                tileElement.style.fontWeight = 'bold'; // Lo ponemos en negrita
            }

            worldContainer.appendChild(tileElement);
        }
    }
    console.log("Renderizado del mundo y agentes completado.");
}


// --- INICIO DEL JUEGO ---

// Nos aseguramos de que el script se ejecute solo cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado. Iniciando simulación.");
    
    // 1. Generar los datos del mundo
    const worldData = generateWorld();
    
    // 2. Crear nuestro primer agente ---
    createAgent(10, 5); // Lo creamos en la posición (10, 5)

    // 3. Renderizar todo en la pantalla
    renderWorld(worldData, agents);
    
    document.addEventListener('keydown', (event) => {
        const player = agents[0];
        if (!player) return;
    
        // Definimos el movimiento basado en la tecla
        let dx = 0, dy = 0;
        switch (event.key) {
            case 'ArrowUp':    dy = -1; break;
            case 'ArrowDown':  dy = 1;  break;
            case 'ArrowLeft':  dx = -1; break;
            case 'ArrowRight': dx = 1;  break;
            default: return; // Si no es una tecla de flecha, no hacer nada
        }
    
        // 1. Intentar mover el agente (actualizar el modelo de datos)
        moveAgent(player, worldData, dx, dy);
    
        // 2. Volver a dibujar todo el mundo con la nueva posición (actualizar la vista)
        renderWorld(worldData, agents);
    });
});