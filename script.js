const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const planets = [];
let spaceship = {};
let initialPosition = { x: 0, y: 0 };
const maxSpeed = 5;
let isPlacingPlanet = false;
let targetPlanet;

function drawBackground() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlanet(planet) {
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.fillStyle = planet.color || 'blue';
    ctx.fill();
}

function drawSpaceship() {
    if (spaceship.isBeingPlaced || spaceship.isSelectingVector || (spaceship.x !== 0 && spaceship.y !== 0)) {
        ctx.beginPath();
        ctx.arc(spaceship.x, spaceship.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        if (spaceship.isSelectingVector) {
            ctx.beginPath();
            ctx.moveTo(spaceship.x, spaceship.y);
            ctx.lineTo(initialPosition.x, initialPosition.y);
            ctx.strokeStyle = 'white';
            ctx.stroke();
        }
    }
}

function showWinScreen() {
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);

    setTimeout(() => {
        resetGame();
    }, 3000); // Show the win screen for 3 seconds before restarting the game
}

function resetGame() {
    planets.length = 0; // Clear all planets
    spaceship = { x: 0, y: 0, vx: 0, vy: 0, isBeingPlaced: false, isSelectingVector: false }; // Reset spaceship
    addTargetPlanet(); // Add a new target planet
}

document.getElementById('addPlanetButton').addEventListener('click', () => {
    isPlacingPlanet = true;
    isPlacingSpaceship = false;
    const planet = {
        x: 0, y: 0, radius: 20, isBeingPlaced: true, mass: Math.random() * 100 + 50, color: 'blue' // Adding mass and color to the planets
    };
    planets.push(planet);
});

document.getElementById('launchSpaceshipButton').addEventListener('click', () => {
    spaceship.x = canvas.width / 2;
    spaceship.y = canvas.height / 2;
    spaceship.vx = (Math.random() - 0.5) * 2;
    spaceship.vy = (Math.random() - 0.5) * 2;
    spaceship.isBeingPlaced = false;
    spaceship.isSelectingVector = false;
});

document.getElementById('placeSpaceshipButton').addEventListener('click', () => {
    isPlacingPlanet = false;
    isPlacingSpaceship = true;
    spaceship = { x: 0, y: 0, vx: 0, vy: 0, isBeingPlaced: true, isSelectingVector: false };
});

canvas.addEventListener('mousemove', (event) => {
    // Planets
    if (isPlacingPlanet) {
        const planet = planets[planets.length - 1];
        if (planet.isBeingPlaced) {
            planet.x = event.clientX;
            planet.y = event.clientY;
        }
    }

    // Spaceships
    if (isPlacingSpaceship) {
        if (spaceship.isBeingPlaced && !spaceship.isSelectingVector) {
            spaceship.x = event.clientX;
            spaceship.y = event.clientY;
        } else if (spaceship.isSelectingVector) {
            const dx = event.clientX - initialPosition.x;
            const dy = event.clientY - initialPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const speed = Math.min(distance / 20, maxSpeed); // Adjust the divisor to control speed scaling
            const angle = Math.atan2(dy, dx);
            spaceship.vx = speed * Math.cos(angle);
            spaceship.vy = speed * Math.sin(angle);
        }
    }
});

canvas.addEventListener('click', (event) => {
    // Planets
    if (isPlacingPlanet) {
        const planet = planets[planets.length - 1];
        if (planet.isBeingPlaced) {
            initialPosition = { x: event.clientX, y: event.clientY };
            planet.isBeingPlaced = false;
            isPlacingPlanet = false;
            return; // Exit early to avoid processing the spaceship logic
        }
    }

    // Spaceships
    if (isPlacingSpaceship) {
        if (spaceship.isBeingPlaced && !spaceship.isSelectingVector) {
            initialPosition = { x: event.clientX, y: event.clientY };
            spaceship.isSelectingVector = true;
        } else if (spaceship.isSelectingVector) {
            spaceship.isBeingPlaced = false;
            spaceship.isSelectingVector = false;
        }
    }
});

function updateSpaceship() {
    let collision = false;
    let win = false;
    for (let planet of planets) {
        const dx = planet.x - spaceship.x;
        const dy = planet.y - spaceship.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= planet.radius) {
            collision = true;
            if (planet === targetPlanet) {
                win = true;
            }
            break;
        }
        const force = (planet.mass) / (distance * distance);
        const angle = Math.atan2(dy, dx);
        spaceship.vx += force * Math.cos(angle);
        spaceship.vy += force * Math.sin(angle);
    }
    if (collision) {
        if (win) {
            showWinScreen();
            return;
        } else {
            spaceship = { x: 0, y: 0, vx: 0, vy: 0, isBeingPlaced: true, isSelectingVector: false };
        }
    } else {
        spaceship.x += spaceship.vx;
        spaceship.y += spaceship.vy;
    }
}

function drawTrajectory() {
    let tempX = spaceship.x;
    let tempY = spaceship.y;
    let tempVx = spaceship.vx;
    let tempVy = spaceship.vy;

    ctx.beginPath();
    ctx.moveTo(tempX, tempY);
    for (let i = 0; i < 100; i++) {
        for (let planet of planets) {
            const dx = planet.x - tempX;
            const dy = planet.y - tempY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= planet.radius) {
                ctx.lineTo(tempX, tempY);
                ctx.stroke();
                return; // Stop drawing the trajectory if it hits a planet
            }
            const force = (planet.mass) / (distance * distance);
            const angle = Math.atan2(dy, dx);
            tempVx += force * Math.cos(angle);
            tempVy += force * Math.sin(angle);
        }
        tempX += tempVx;
        tempY += tempVy;
        ctx.lineTo(tempX, tempY);
    }
    ctx.strokeStyle = 'white';
    ctx.stroke();
}

function addTargetPlanet() {
    const planet = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 20,
        mass: Math.random() * 100 + 50,
        color: 'green' // Target planet is green
    };
    planets.push(planet);
    targetPlanet = planet;
}

function update() {
    drawBackground();
    planets.forEach(drawPlanet);
    if (!spaceship.isBeingPlaced && spaceship.x !== 0 && spaceship.y !== 0) {
        updateSpaceship();
        drawSpaceship();
    }
    drawSpaceship();
    drawTrajectory();
    requestAnimationFrame(update);
}


addTargetPlanet(); // Add the target planet when the script is loaded
update();