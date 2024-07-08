const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const planets = [];
let spaceship = { x: 0, y: 0, vx: 0, vy: 0, isBeingPlaced: false, isSelectingVector: false };
let initialPosition = { x: 0, y: 0 };
const maxSpeed = 5;
let isPlacingPlanet = false;

function drawBackground() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlanet(planet) {
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();
}

function drawSpaceship() {
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

document.getElementById('addPlanetButton').addEventListener('click', () => {
    isPlacingPlanet = true;
    isPlacingSpaceship = false;
    const planet = {
        x: 0, y: 0, radius: 20, isBeingPlaced: true, mass: Math.random() * 100 + 50 // Adding mass to the planets
    };
    planets.push(planet);
});

document.getElementById('launchSpaceshipButton').addEventListener('click', () => {
    spaceship.x = canvas.width / 2;
    spaceship.y = canvas.height / 2;
    spaceship.vx = (Math.random() - 0.5) * 2;
    spaceship.vy = (Math.random() - 0.5) * 2;
    spaceship.isBeingPlaced = false;
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
    if (!isPlacingPlanet) {
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
    for (let planet of planets) {
        const dx = planet.x - spaceship.x;
        const dy = planet.y - spaceship.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= planet.radius) {
            collision = true;
            break;
        }
        const force = (planet.mass) / (distance * distance);
        const angle = Math.atan2(dy, dx);
        spaceship.vx += force * Math.cos(angle);
        spaceship.vy += force * Math.sin(angle);
    }
    if (collision) {
        spaceship = { x: 0, y: 0, vx: 0, vy: 0, isBeingPlaced: true, isSelectingVector: false };
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

function update() {
    drawBackground();
    planets.forEach(drawPlanet);
    if (!spaceship.isBeingPlaced) {
        updateSpaceship();
    }
    drawSpaceship();
    drawTrajectory();
    requestAnimationFrame(update);
}

update();