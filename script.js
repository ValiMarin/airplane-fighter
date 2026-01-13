const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const seconds = document.getElementById("seconds");
const avoidedObjects = document.getElementById("avoidedObjects");
const destroyedObjects = document.getElementById("destroyedObjects");

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.7;

let player,
  playerBox,
  obstacles,
  projectiles,
  clounds = [],
  cloundsInterval,
  avoidedObjectsCounter,
  difficulty,
  secondsAliveInterval,
  secondsAlive,
  isReloading,
  destroyedObjectsCounter,
  stopSpawn,
  playerFireLength,
  playerFireInterval;

const difficultyLevels = [
  { limit: 2600, decrease: 100 },
  { limit: 2300, decrease: 80 },
  { limit: 1700, decrease: 40 },
  { limit: 1200, decrease: 20 },
  { limit: 800, decrease: 5 },
  { limit: 500, decrease: 2 },
  { limit: 200, decrease: 1 },
];

const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function newGame(time) {
  setTimeout(() => {
    secondsAliveInterval = setInterval(() => {
      ++secondsAlive;
      seconds.textContent = "Seconds: " + secondsAlive;
    }, 1000);

    playerFireInterval = setInterval(() => {
      playerFireLength = Math.random() * (24 - 15) + 15;
    }, 200);

    obstacles = [];
    projectiles = [];
    secondsAlive = 0;
    destroyedObjectsCounter = 0;
    avoidedObjectsCounter = 0;
    seconds.textContent = "Seconds: 0";
    avoidedObjects.textContent = "Avoided objects: 0";
    destroyedObjects.textContent = "Destroyed objects: 0";
    difficulty = 3000;
    isReloading = false;
    stopSpawn = false;

    setInitialPlayerPosition();
    spawnerObstacle();
    spawnerClouds();
    update();
  }, time);
}

function setInitialPlayerPosition() {
  player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    color: "rgba(30, 76, 228, 1)",
    speed: 3,
  };

  const playerBoxOffsetX = player.x - 55;
  const playerBoxOffsetY = player.y - 50;
  const playerBoxWidth = 110;
  const playerBoxHeight = 50;

  playerBox = {
    x: playerBoxOffsetX,
    y: playerBoxOffsetY,
    width: playerBoxWidth,
    height: playerBoxHeight,
  };
}

function spawnerObstacle() {
  setTimeout(() => {
    spawnObstacle();

    for (let i = difficultyLevels.length - 1; i >= 0; --i) {
      if (difficulty > difficultyLevels[i].limit) {
        difficulty -= difficultyLevels[i].decrease;
        break;
      }
    }

    if (!stopSpawn) spawnerObstacle();
  }, difficulty);
}

function spawnObstacle() {
  const width = random(70, 200);
  const height = random(70, 200);
  const colors = ["red", "green", "blue", "yellow", "pink", "white"];

  obstacles.push({
    x: Math.random() * (canvas.width - width - 30) + 15,
    y: -height,
    width: width,
    height: height,
    color: colors[Math.floor(random(0, colors.length))],
    speed: random(0.3, 1.5),
  });
}

function spawnerClouds() {
  cloundsInterval = setInterval(() => {
    spawnCloud();
  }, 2000);
}

function spawnCloud() {
  const width = random(70, 500);
  const height = random(70, 500);

  clounds.push({
    x: random(15, canvas.width - width - 15),
    y: -height,
    width: width,
    height: height,
    speed: 0.5,
  });
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function update() {
  if (keys[" "] && reload()) {
    shooting();
  }

  if (!draw()) return;

  requestAnimationFrame(update);
}

function reload() {
  if (isReloading === false) {
    setTimeout(() => {
      isReloading = false;
    }, 1000);

    isReloading = true;
    return true;
  }

  return false;
}

function shooting() {
  spawnProjectile(player.x + 43);
  spawnProjectile(player.x - 53);
}

function spawnProjectile(xPosition) {
  projectiles.push({
    x: xPosition,
    y: player.y - 65,
    width: 10,
    height: 20,
    speed: 3,
  });
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(0, 0, 0, 0.6)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawProjectiles();
  drawPlayer();
  if (!drawObstacles()) return false;
  drawClouds();

  return true;
}

function drawClouds() {
  for (let i = clounds.length - 1; i >= 0; --i) {
    clounds[i].y += clounds[i].speed;

    context.fillStyle = "rgba(255, 255, 255, 0.26)";
    context.fillRect(
      clounds[i].x,
      clounds[i].y,
      clounds[i].width,
      clounds[i].height
    );

    if (clounds[i].y > canvas.height) clounds.splice(i, 1);
  }
}

function drawProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; --i) {
    projectiles[i].y -= projectiles[i].speed;

    context.fillStyle = "orange";
    context.fillRect(
      projectiles[i].x,
      projectiles[i].y,
      projectiles[i].width,
      projectiles[i].height
    );

    if (projectiles[i].y < 0) projectiles.splice(i, 1);
  }
}

function drawPlayer() {
  if (keys.ArrowLeft && player.x > 70) {
    player.x -= player.speed;
    playerBox.x -= player.speed;
  }

  if (keys.ArrowRight && player.x < canvas.width - 70) {
    player.x += player.speed;
    playerBox.x += player.speed;
  }

  drawplayerWeapons();
  drawPlayerFire();
  drawPlayerBody();
}

function drawPlayerBody() {
  context.fillStyle = player.color;
  context.beginPath();
  context.moveTo(player.x, player.y - 100);
  context.lineTo(player.x + 15, player.y - 20);
  context.lineTo(player.x + 40, player.y - 20);
  context.lineTo(player.x + 40, player.y - 30);
  context.lineTo(player.x + 55, player.y - 30);
  context.lineTo(player.x + 55, player.y);
  context.lineTo(player.x - 55, player.y);
  context.lineTo(player.x - 55, player.y - 30);
  context.lineTo(player.x - 40, player.y - 30);
  context.lineTo(player.x - 40, player.y - 20);
  context.lineTo(player.x - 15, player.y - 20);
  context.closePath();
  context.fill();
}

function drawPlayerFire() {
  context.fillStyle = "rgba(255, 179, 0, 1)";
  context.fillRect(player.x - 3, player.y + 3, 6, playerFireLength);
  context.fillRect(player.x + 5, player.y + 3, 4, playerFireLength - 7);
  context.fillRect(player.x - 9, player.y + 3, 4, playerFireLength - 7);
}

function drawplayerWeapons() {
  context.fillStyle = "rgba(255, 0, 0, 0.74)";
  context.fillRect(player.x + 45, player.y - 45, 6, 15);
  context.fillRect(player.x - 50, player.y - 45, 6, 15);
}

function drawObstacles() {
  let playerDestroyed = false;

  for (let i = obstacles.length - 1; i >= 0; --i) {
    obstacles[i].y += obstacles[i].speed;

    context.fillStyle = obstacles[i].color;
    context.fillRect(
      obstacles[i].x,
      obstacles[i].y,
      obstacles[i].width,
      obstacles[i].height
    );

    if (obstacles[i].y > canvas.height) {
      avoidedObjects.textContent = "Avoided Objects " + ++avoidedObjectsCounter;
      obstacles.splice(i, 1);
      continue;
    }

    if (checkPlayerCollision(i)) playerDestroyed = true;

    if (playerDestroyed) return false;

    checkProjectileCollision(i);
  }

  return true;
}

function checkPlayerCollision(obstacle) {
  if (checkCollision(playerBox, obstacles[obstacle])) {
    clearInterval(secondsAliveInterval);
    clearInterval(playerFireInterval);
    clearInterval(cloundsInterval);
    stopSpawn = true;
    newGame(3000);
    return true;
  }
  return false;
}

function checkProjectileCollision(obstacle) {
  for (let j = projectiles.length - 1; j >= 0; --j) {
    if (checkCollision(projectiles[j], obstacles[obstacle])) {
      obstacles.splice(obstacle, 1);
      projectiles.splice(j, 1);

      ++destroyedObjectsCounter;
      destroyedObjects.textContent =
        "Destroyed objects: " + destroyedObjectsCounter;
      break;
    }
  }
}

function checkCollision(playerOrProjectile, obstacle) {
  return (
    playerOrProjectile.x < obstacle.x + obstacle.width &&
    playerOrProjectile.x + playerOrProjectile.width > obstacle.x &&
    playerOrProjectile.y < obstacle.y + obstacle.height &&
    playerOrProjectile.y + playerOrProjectile.height > obstacle.y
  );
}

newGame(0);
