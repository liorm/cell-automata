import * as THREE from 'three';

let camera;
let scene;
let renderer;
let mouse;

let cubeGeo;
let cubeMaterial;

const cells: THREE.Object3D[][] = [];
const cellsNext: number[][] = [];

const TILES_X = 50;
const TILES_Y = 50;

const CELL_W = 5;
const CELL_H = 5;
const CELL_D = 5;

const EVOLUTION_INTERVAL_MS = 0;

let lastEvolutionTime = performance.now();

init()
render()

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  )
  camera.position.set(300, 400, 600)
  camera.lookAt(0, 0, 0)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  // cubes

  cubeGeo = new THREE.BoxBufferGeometry(CELL_W, CELL_H, CELL_D)
  cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xfeb74c,
    map: new THREE.TextureLoader().load('textures/square.png', () => render()),
  })

  // cells

  for (let x = 0; x < TILES_X; ++x) {
    const row: THREE.Object3D[] = [];
    const rowNext: number[] = [];

    for (let y = 0; y < TILES_Y; ++y) {
      const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
      voxel.position.set(x * CELL_W, y * CELL_H, 0);
      voxel.visible = false;
      scene.add(voxel);

      row.push(voxel);
      rowNext.push(0);
    }

    cells.push(row);
    cellsNext.push(rowNext);
  }

  cells[TILES_Y - 3][TILES_Y - 1].visible = true;
  cells[TILES_Y - 3][TILES_Y - 2].visible = true;
  cells[TILES_Y - 3][TILES_Y - 3].visible = true;
  cells[TILES_Y - 2][TILES_Y - 3].visible = true;
  cells[TILES_Y - 1][TILES_Y - 2].visible = true;

  mouse = new THREE.Vector2()

  // lights

  const ambientLight = new THREE.AmbientLight(0x606060);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);

  setTimeout( () => evolve());
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function render() {
  renderer.render(scene, camera)
}

function isCellAlive(x, y) {
  if ( x < 0 || y < 0 )
    return 0;

  if ( x >= TILES_X || y >= TILES_Y )
    return 0;

  return cells[x][y].visible ? 1 : 0;
}

function evolve() {
  const now = performance.now();

  for (let x = 0; x < TILES_X; ++x) {
    const rowNext = cellsNext[x];

    for (let y = 0; y < TILES_Y; ++y) {
      // Count friends
      const livingCells =
          isCellAlive(x - 1, y - 1) +
          isCellAlive(x - 1, y + 0) +
          isCellAlive(x - 1, y + 1) +
          isCellAlive(x + 0, y - 1) +
          isCellAlive(x + 0, y + 1) +
          isCellAlive(x + 1, y - 1) +
          isCellAlive(x + 1, y + 0) +
          isCellAlive(x + 1, y + 1);

      const isAlive = isCellAlive(x, y);

      if (livingCells < 2 || livingCells > 3)
        rowNext[y] = 0;

      if (livingCells === 3)
        rowNext[y] = 1;

      if (livingCells === 2 && isAlive)
        rowNext[y] = 1;
    }
  }

  // Apply next.
  for (let x = 0; x < TILES_X; ++x) {
    const row = cells[x];
    const rowNext = cellsNext[x];

    for (let y = 0; y < TILES_Y; ++y) {
      const cell = row[y];
      const cellNext = rowNext[y];

      cell.visible = cellNext !== 0;
    }
  }

  lastEvolutionTime = now;
  render();

  if (EVOLUTION_INTERVAL_MS === 0) {
    requestAnimationFrame(() => evolve());
  } else {
    setTimeout( () => evolve(), EVOLUTION_INTERVAL_MS);
  }
}
