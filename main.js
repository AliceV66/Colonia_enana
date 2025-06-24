// --- CONFIGURACIÓN Y CONSTANTES ---
const WORLD_WIDTH = 40;
const WORLD_HEIGHT = 25;

// --- MODELOS DE DATOS GLOBALES ---
let worldData = [];
const agents = [];
const taskQueue = [];

// --- LÓGICA DEL MODELO ---

function generateWorld() {
    const world = [];
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < WORLD_WIDTH; x++) {
            let tileType = 'floor';
            if (x === 0 || x === WORLD_WIDTH - 1 || y === 0 || y === WORLD_HEIGHT - 1) {
                tileType = 'rock';
            }
            row.push({ type: tileType });
        }
        world.push(row);
    }
    return world;
}

function createAgent(x, y) {
    const agent = {
        id: agents.length + 1,
        name: `Urist McEnano #${agents.length + 1}`,
        char: '@',
        color: '#ffeb3b',
        x: x,
        y: y,
        status: 'idle'
    };
    agents.push(agent);
}

function createTask(x, y, type) {
    
    if (taskQueue.some(task => task.x === x && task.y === y)) return;
    worldData[y][x].isTasked = true; // Marcamos el tile como "en cola"
    const task = { type, x, y };
    console.log(`Nueva tarea creada: ${type} en (${x}, ${y})`);
    taskQueue.push(task);
}

/**
 * --- NUEVO ---
 * Intenta mover un agente en una dirección, verificando colisiones.
 * @param {Object} agent - El agente a mover.
 * @param {Array<Array<Object>>} worldData - Los datos del mundo para la colisión.
 * @param {number} dx - El cambio en X.
 * @param {number} dy - El cambio en Y.
 */
function moveAgent(agent, world, dx, dy) {
    const newX = agent.x + dx;
    const newY = agent.y + dy;

    // Intento 1: Moverse en diagonal (si se requiere)
    if (dx !== 0 && dy !== 0) {
        if (world[newY][newX].type !== 'rock') {
            agent.x = newX;
            agent.y = newY;
            return; // Movimiento exitoso
        }
    }

    // Intento 2: Moverse horizontalmente (si se requiere)
    if (dx !== 0) {
        if (world[agent.y][newX].type !== 'rock') {
            agent.x = newX;
            return; // Movimiento exitoso
        }
    }
    
    // Intento 3: Moverse verticalmente (si se requiere)
    if (dy !== 0) {
        if (world[newY][agent.x].type !== 'rock') {
            agent.y = newY;
            return; // Movimiento exitoso
        }
    }
    
    // Si todos los intentos fallan, el agente no se mueve en este tick.
    console.log(`¡Auch! ${agent.name} está bloqueado y no se puede mover.`);
}

// --- LÓGICA DE AGENTES (IA) ---

function updateAgents(world, agentsData) {
    agentsData.forEach(agent => {
        runAgentAI(agent, world);
    });
}

function runAgentAI(agent, world) {
    switch (agent.status) {
        case 'idle':
            if (taskQueue.length > 0) {
                agent.task = taskQueue.shift();
                agent.status = 'walking-to-task';
                console.log(`${agent.name} ha aceptado la tarea: minar en (${agent.task.x}, ${agent.task.y})`);
            }
            break;

        case 'walking-to-task':
            if (!agent.task) { agent.status = 'idle'; return; }
            const task = agent.task;
            const distanceX = Math.abs(agent.x - task.x);
            const distanceY = Math.abs(agent.y - task.y);
            // 'isAdjacent' es verdadero si está en un radio de 1 casilla (incluyendo diagonales)
            const isAdjacent = distanceX <= 1 && distanceY <= 1;

            // La condición de llegada es si está adyacente Y el objetivo sigue siendo una roca
            const atDestination = isAdjacent && world[task.y][task.x].type === 'rock'
            
            if (atDestination) {
                agent.status = 'working';
            } else {
                const dx = Math.sign(task.x - agent.x);
                const dy = Math.sign(task.y - agent.y);
                moveAgent(agent, world, dx, dy);
            }
            break;

        case 'working':
            if (!agent.task) { agent.status = 'idle'; return; }
            console.log(`${agent.name} está minando en (${agent.task.x}, ${agent.task.y})`);
            
            const minedTile = world[agent.task.y][agent.task.x];
            if (minedTile.type === 'rock') {
                minedTile.type = 'floor';
                minedTile.isTasked = false; // Desmarcamos el tile
            
            }

            agent.task = null;
            agent.status = 'idle';
            break;
    }
}

// --- RENDERIZADO (VIEW) ---

function renderWorld(world, agentsData) {
    const worldContainer = document.getElementById('game-world');
    worldContainer.innerHTML = '';
    worldContainer.style.setProperty('--world-width', WORLD_WIDTH);
    worldContainer.style.setProperty('--world-height', WORLD_HEIGHT);

    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            const tileData = world[y][x];
            const tileElement = document.createElement('div');
            tileElement.classList.add('tile', `tile-${tileData.type}`);
            tileElement.dataset.x = x;
            tileElement.dataset.y = y;
            tileElement.textContent = '';

            if (tileData.isTasked) {
                tileElement.classList.add('tile-rock-tasked');
            }

            if (tileData.type === 'rock') {
                tileElement.textContent = '#';
            }

            const agent = agentsData.find(a => a.x === x && a.y === y);
            if (agent) {
                tileElement.textContent = agent.char;
                tileElement.style.color = agent.color;
                tileElement.style.fontWeight = 'bold';
            }
            worldContainer.appendChild(tileElement);
        }
    }
}

// --- INICIO DEL JUEGO ---

function updateGame() {
    updateAgents(worldData, agents);
    renderWorld(worldData, agents);
}

document.addEventListener('DOMContentLoaded', () => {
    worldData = generateWorld();
    createAgent(10, 5);
    renderWorld(worldData, agents);

    const worldContainer = document.getElementById('game-world');
    worldContainer.addEventListener('click', (event) => {
        const clickedTile = event.target;
        if (!clickedTile.classList.contains('tile')) return;
        const x = parseInt(clickedTile.dataset.x);
        const y = parseInt(clickedTile.dataset.y);
        if (worldData[y][x].type === 'rock') {
            createTask(x, y, 'mine');
        }
    });
    
    const gameLoop = setInterval(updateGame, 200);
});