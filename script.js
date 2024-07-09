const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let planets = [];
let spaceship = {};
let initialPosition = { x: 0, y: 0 };
const maxSpeed = 5;
let isPlacingPlanet = false;
let isPlacingSpaceship = false;
let isSettingTrajectory = false;
let targetPlanet;
let animationFrameId = null;
let fireButton = document.getElementById('fireButton'); // Get the fire button
let cancelButton = document.getElementById('cancelButton'); // Get the fire button
let resetButton = document.getElementById('restartButton'); // Get the fire button


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
    cancelButton.style.display = 'none';
    resetButton.style.display = 'flex';  // Show restart button
}

function showLoseScreen() {
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('You Lost. Try again', canvas.width / 2, canvas.height / 2);
    cancelButton.style.display = 'none';
    resetButton.style.display = 'flex';  // Show restart button
}

function resetGame() {
    isPlacingPlanet = false;
    isPlacingSpaceship = false;
    isSettingTrajectory = false;
    planets.length = 0; // Clear all planets
    spaceship = { x: 0, y: 0, vx: 0, vy: 0, isBeingPlaced: false, isSelectingVector: false }; // Reset spaceship
    addTargetPlanet(); // Add a new target planet
    document.querySelector('.button-container').style.display = 'flex'; // Show buttons again
    cancelButton.style.display = 'none';
    resetButton.style.display = 'none';
    fireButton.style.display = 'none'; // Show buttons again
    update();
}

document.getElementById('addPlanetButton').addEventListener('click', () => {
    isPlacingPlanet = true;
    isPlacingSpaceship = false;
    const planet = {
        x: 0, y: 0, radius: 20, isBeingPlaced: true, mass: Math.random() * 100 + 50, color: 'blue' // Adding mass and color to the planets
    };
    planets.push(planet);
});

document.getElementById('placeSpaceshipButton').addEventListener('click', () => {
    document.querySelector('.button-container').style.display = 'none';
    isPlacingPlanet = false;
    isPlacingSpaceship = true;
    spaceship = { x: 0, y: 0, vx: 0, vy: 0, isBeingPlaced: true, isSelectingVector: false };
});

document.getElementById('restartButton').addEventListener('click', () => {
    resetGame();
});

document.getElementById('cancelButton').addEventListener('click', () => {
    spaceship = {};
    planets = planets.filter(p => p === targetPlanet);
    document.querySelector('.button-container').style.display = 'flex';
    cancelButton.style.display = 'none';
});

fireButton.addEventListener('click', () => {
    // Launch the spaceship
    spaceship.isBeingPlaced = false;
    spaceship.isSelectingVector = false;

    // Hide all buttons
    document.querySelector('.button-container').style.display = 'none';
    fireButton.style.display = 'none';
    cancelButton.style.display = 'flex'


    // Set a timer to show buttons again after 20 seconds unless a planet is hit
    setTimeout(() => {
        spaceship = {};
        document.querySelector('.button-container').style.display = 'flex';
        fireButton.style.display = 'none';
    }, 20000);
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
        } 
    }
    
    if(isSettingTrajectory) {
        if (spaceship.isSelectingVector) {
            const dx = event.clientX - initialPosition.x;
            const dy = event.clientY - initialPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const speed = Math.min(distance / 100, maxSpeed); // Adjust the divisor to control speed scaling
            const angle = Math.atan2(dy, dx);
            spaceship.vx = speed * Math.cos(angle);
            spaceship.vy = speed * Math.sin(angle);
        }
    }
    
});

canvas.addEventListener('click', (event) => {
    // Toggle spaceship vector selection
    if (isPlacingSpaceship && spaceship.isBeingPlaced) {
        initialPosition = { x: event.clientX, y: event.clientY };
        spaceship.isSelectingVector = true;
        isPlacingSpaceship = false;
        isSettingTrajectory = true;
        fireButton.style.display = 'none'; // Show the fire button when ready to set the trajectory
    } else if (isSettingTrajectory && spaceship.isSelectingVector) {
        isSettingTrajectory = false;
        fireButton.style.display = 'flex'; 
        cancelButton.style.display = 'none';
    }


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
            showLoseScreen();
            return;
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
    console.log('addTarget');

    const margin = 50 + 20; // 50 pixels from the edge plus the radius of the planet to prevent clipping
    const planet = {
        x: Math.random() * (canvas.width - 2 * margin) + margin,
        y: Math.random() * (canvas.height - 2 * margin) + margin,
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