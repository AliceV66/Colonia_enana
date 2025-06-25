// --- CONFIGURACIÓN Y CONSTANTES ---
const WORLD_WIDTH = 40;
const WORLD_HEIGHT = 25;

// --- MODELOS DE DATOS GLOBALES ---
let worldData = [];
const agents = [];
const taskQueue = [];
const resources = {
    rock: 0
};

// --- LÓGICA DEL MODELO ---
// Genera el mundo inicial con rocas y suelo
function generateWorld() {
    const world = [];
    const ROCK_CHANCE = 0.15; // Probabilidad de roca en el interior
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < WORLD_WIDTH; x++) {
            let tileType;
            // Bordes siempre roca
            if (x === 0 || x === WORLD_WIDTH - 1 || y === 0 || y === WORLD_HEIGHT - 1) {
                tileType = 'rock';
            } else {
                if (Math.random() < ROCK_CHANCE) {
                    tileType = 'rock';
                } else {
                    tileType = 'floor';
                }
            }
            row.push({ type: tileType, isTasked: false });
        }
        world.push(row);
    }
    return world;
}

// Renderiza los paneles de UI de recursos y agentes
function renderUI(agentsData, resourcesData) {
    const resourcesPanel = document.getElementById('resources-panel');
    resourcesPanel.innerHTML = `Piedra: ${resourcesData.rock}`;
    const agentsPanel = document.getElementById('agents-panel');
    agentsPanel.innerHTML = '';
    agentsData.forEach(agent => {
        let statusText = agent.status;
        if ((agent.status === 'walking-to-task' || agent.status === 'working') && agent.task) {
            statusText += ` (${agent.task.type} en ${agent.task.x},${agent.task.y})`;
        }
        const agentLi = document.createElement('li');
        agentLi.innerHTML = `<strong>${agent.name}:</strong> ${statusText}`;
        agentsPanel.appendChild(agentLi);
    });
}

// Crea un nuevo agente en la posición indicada
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

// Crea una tarea de minado si no existe ya en esa posición
function createTask(x, y, type) {
    if (taskQueue.some(task => task.x === x && task.y === y)) return;
    worldData[y][x].isTasked = true;
    const task = { type, x, y };
    taskQueue.push(task);
}

/**
 * Intenta mover un agente en una dirección, evitando rocas.
 * @param {Object} agent - El agente a mover.
 * @param {Array<Array<Object>>} world - Datos del mundo.
 * @param {number} dx - Cambio en X.
 * @param {number} dy - Cambio en Y.
 */
function moveAgent(agent, world, dx, dy) {
    const newX = agent.x + dx;
    const newY = agent.y + dy;
    if (dx !== 0 && dy !== 0) {
        if (world[newY][newX].type !== 'rock') {
            agent.x = newX;
            agent.y = newY;
            return;
        }
    }
    if (dx !== 0) {
        if (world[agent.y][newX].type !== 'rock') {
            agent.x = newX;
            return;
        }
    }
    if (dy !== 0) {
        if (world[newY][agent.x].type !== 'rock') {
            agent.y = newY;
            return;
        }
    }
}

// --- LÓGICA DE AGENTES (IA) ---
// Actualiza el estado de todos los agentes
function updateAgents(world, agentsData) {
    agentsData.forEach(agent => {
        runAgentAI(agent, world);
    });
}

// Lógica de comportamiento de cada agente
function runAgentAI(agent, world) {
    switch (agent.status) {
        case 'idle':
            if (taskQueue.length > 0) {
                agent.task = taskQueue.shift();
                agent.status = 'walking-to-task';
            }
            break;
        case 'walking-to-task':
            if (!agent.task) { agent.status = 'idle'; return; }
            const task = agent.task;
            const distanceX = Math.abs(agent.x - task.x);
            const distanceY = Math.abs(agent.y - task.y);
            const isAdjacent = distanceX <= 1 && distanceY <= 1;
            const atDestination = isAdjacent && world[task.y][task.x].type === 'rock';
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
            const minedTile = world[agent.task.y][agent.task.x];
            if (minedTile.type === 'rock') {
                minedTile.type = 'floor';
                minedTile.isTasked = false;
                resources.rock++;
            }
            agent.task = null;
            agent.status = 'idle';
            break;
    }
}

// --- RENDERIZADO (VIEW) ---
// Dibuja el mundo y los agentes en pantalla
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
// Inicializa el mundo y los agentes, y arranca el bucle principal
function updateGame() {
    updateAgents(worldData, agents);
    renderWorld(worldData, agents);
    renderUI(agents, resources);
}

document.addEventListener('DOMContentLoaded', () => {
    worldData = generateWorld();
    for (let i = 0; i < 3; i++) {
        createAgent(10 + i, 5);
    }
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
    setInterval(updateGame, 200);
});