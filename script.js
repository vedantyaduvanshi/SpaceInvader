const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const enemiesContainer = document.getElementById('enemies');
const bossElement = document.getElementById('boss');
const levelDisplay = document.getElementById('level-display');
const scoreDisplay = document.getElementById('score-display');
const bossAnnouncement = document.getElementById('boss-announcement');

let playerX = window.innerWidth / 2 - 25; // Initial player position
let bullets = [];
let enemies = [];
let enemySpeed = 2;
let enemyDirection = 1;
let currentLevel = 1;
let bossHealth = 5;
let bossActive = false;
let score = 0;

// Create player
player.style.left = `${playerX}px`;

// Move player
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && playerX > 0) {
    playerX -= 10;
  } else if (e.key === 'ArrowRight' && playerX < window.innerWidth - 50) {
    playerX += 10;
  } else if (e.key === ' ') {
    shoot();
  }
  player.style.left = `${playerX}px`;
});

// Shoot bullet
function shoot() {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  bullet.style.left = `${playerX + 22.5}px`;
  bullet.style.bottom = '70px';
  gameContainer.appendChild(bullet);
  bullets.push(bullet);
}

// Move bullets
function moveBullets() {
  bullets.forEach((bullet, index) => {
    const bottom = parseInt(bullet.style.bottom);
    if (bottom > window.innerHeight) {
      bullet.remove();
      bullets.splice(index, 1);
    } else {
      bullet.style.bottom = `${bottom + 10}px`;
    }
  });
}

// Enemy types
const enemyTypes = [
  { class: 'enemy', speed: 2, pattern: 'horizontal' },
  { class: 'enemy-fast', speed: 4, pattern: 'horizontal' },
  { class: 'enemy-zigzag', speed: 3, pattern: 'zigzag' },
  { class: 'enemy-vertical', speed: 2, pattern: 'vertical' }
];

// Create enemies
function createEnemies() {
  enemiesContainer.innerHTML = ''; // Clear existing enemies
  enemies = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const enemy = document.createElement('div');
      enemy.classList.add('enemy', enemyType.class);
      enemy.style.left = `${col * 60 + 30}px`;
      enemy.style.top = `${row * 50 + 30}px`;
      enemiesContainer.appendChild(enemy);
      enemies.push({ element: enemy, type: enemyType });
    }
  }
}

// Move enemies
function moveEnemies() {
  enemies.forEach(enemy => {
    const enemyElement = enemy.element;
    const enemyType = enemy.type;

    if (enemyType.pattern === 'horizontal') {
      const left = parseInt(enemyElement.style.left);
      if (left <= 0 || left + 40 >= window.innerWidth) {
        enemyDirection *= -1;
        enemyElement.style.top = `${parseInt(enemyElement.style.top) + 20}px`;
      }
      enemyElement.style.left = `${left + enemyType.speed * enemyDirection}px`;
    } else if (enemyType.pattern === 'zigzag') {
      const left = parseInt(enemyElement.style.left);
      const top = parseInt(enemyElement.style.top);
      if (left <= 0 || left + 40 >= window.innerWidth) {
        enemyDirection *= -1;
      }
      enemyElement.style.left = `${left + enemyType.speed * enemyDirection}px`;
      enemyElement.style.top = `${top + Math.sin(left / 50) * 5}px`;
    } else if (enemyType.pattern === 'vertical') {
      const top = parseInt(enemyElement.style.top);
      if (top >= window.innerHeight - 40) {
        enemyElement.style.top = '0px';
      } else {
        enemyElement.style.top = `${top + enemyType.speed}px`;
      }
    }
  });
}

// Create boss
function createBoss() {
  bossElement.style.display = 'block';
  bossElement.style.left = `${window.innerWidth / 2 - 40}px`;
  bossElement.style.top = '50px';
  bossActive = true;
  bossHealth = 5; // Reset boss health
  announceBoss();
}

// Announce boss
function announceBoss() {
  bossAnnouncement.textContent = `BOSS FIGHT! Level ${currentLevel}`;
  bossAnnouncement.style.display = 'block';
  setTimeout(() => {
    bossAnnouncement.style.display = 'none';
  }, 3000); // Hide announcement after 3 seconds
}

// Move boss
function moveBoss() {
  if (bossActive) {
    const bossRect = bossElement.getBoundingClientRect();
    if (bossRect.left <= 0 || bossRect.right >= window.innerWidth) {
      enemyDirection *= -1;
    }
    bossElement.style.left = `${parseInt(bossElement.style.left) + enemySpeed * enemyDirection}px`;
  }
}

// Check collisions
function checkCollisions() {
  bullets.forEach((bullet, bulletIndex) => {
    const bulletRect = bullet.getBoundingClientRect();

    // Check collisions with enemies
    enemies.forEach((enemy, enemyIndex) => {
      const enemyRect = enemy.element.getBoundingClientRect();
      if (
        bulletRect.left < enemyRect.right &&
        bulletRect.right > enemyRect.left &&
        bulletRect.top < enemyRect.bottom &&
        bulletRect.bottom > enemyRect.top
      ) {
        bullet.remove();
        enemy.element.remove();
        bullets.splice(bulletIndex, 1);
        enemies.splice(enemyIndex, 1);
        score += 10; // Increase score
        scoreDisplay.textContent = `Score: ${score}`;
      }
    });

    // Check collisions with boss
    if (bossActive) {
      const bossRect = bossElement.getBoundingClientRect();
      if (
        bulletRect.left < bossRect.right &&
        bulletRect.right > bossRect.left &&
        bulletRect.top < bossRect.bottom &&
        bulletRect.bottom > bossRect.top
      ) {
        bullet.remove();
        bullets.splice(bulletIndex, 1);
        bossHealth--;
        if (bossHealth <= 0) {
          bossElement.style.display = 'none';
          bossActive = false;
          score += 100; // Bonus score for defeating boss
          scoreDisplay.textContent = `Score: ${score}`;
          currentLevel++;
          levelDisplay.textContent = `Level: ${currentLevel}`;
          createEnemies();
        }
      }
    }
  });
}

// Check level completion
function checkLevelCompletion() {
  if (enemies.length === 0 && !bossActive) {
    createBoss();
  }
}

// Game loop
function gameLoop() {
  moveBullets();
  moveEnemies();
  moveBoss();
  checkCollisions();
  checkLevelCompletion();
  requestAnimationFrame(gameLoop);
}

// Initialize game
createEnemies();
gameLoop();