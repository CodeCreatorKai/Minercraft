/**
 * ChronoCraft: Natural Exploration & Steady Gravity
 */

// World dimensions (Expanded for natural biomes and exploration)
const WORLD_WIDTH = 80;
const WORLD_DEPTH = 80;
const WORLD_HEIGHT = 44;
const SEA_LEVEL = 13;

const BLOCKS = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  COBBLE: 4,
  OAK_LOG: 5,
  OAK_LEAVES: 6,
  OAK_PLANKS: 7,
  DIAMOND_ORE: 8,
  GOLD_ORE: 9,
  IRON_ORE: 10,
  COAL_ORE: 11,
  GLASS: 12,
  WATER: 13,
  SAND: 14,
  TNT: 15,
  OBSIDIAN: 16,
  GLOWSTONE: 17,
  BEDROCK: 18,
  CRAFTING_TABLE: 19
};

const ITEMS = {
  STICK: 100,
  WOODEN_PICKAXE: 101,
  STONE_PICKAXE: 102,
  DIAMOND: 103,
  COAL: 104,
  RAW_IRON: 105,
  RAW_GOLD: 106
};

const ITEM_NAMES = {
  [BLOCKS.GRASS]: "Grass Block",
  [BLOCKS.DIRT]: "Dirt",
  [BLOCKS.STONE]: "Stone",
  [BLOCKS.COBBLE]: "Cobblestone",
  [BLOCKS.OAK_LOG]: "Oak Log",
  [BLOCKS.OAK_LEAVES]: "Oak Leaves",
  [BLOCKS.OAK_PLANKS]: "Oak Planks",
  [BLOCKS.DIAMOND_ORE]: "Diamond Ore",
  [BLOCKS.GOLD_ORE]: "Gold Ore",
  [BLOCKS.IRON_ORE]: "Iron Ore",
  [BLOCKS.COAL_ORE]: "Coal Ore",
  [BLOCKS.GLASS]: "Glass",
  [BLOCKS.WATER]: "Water",
  [BLOCKS.SAND]: "Sand",
  [BLOCKS.TNT]: "TNT",
  [BLOCKS.OBSIDIAN]: "Obsidian",
  [BLOCKS.GLOWSTONE]: "Glowstone",
  [BLOCKS.BEDROCK]: "Bedrock",
  [BLOCKS.CRAFTING_TABLE]: "Crafting Table",
  [ITEMS.STICK]: "Stick",
  [ITEMS.WOODEN_PICKAXE]: "Wooden Pickaxe",
  [ITEMS.STONE_PICKAXE]: "Stone Pickaxe",
  [ITEMS.DIAMOND]: "Diamond Gem",
  [ITEMS.COAL]: "Coal",
  [ITEMS.RAW_IRON]: "Raw Iron",
  [ITEMS.RAW_GOLD]: "Raw Gold"
};

const BLOCK_PROPERTIES = {
  [BLOCKS.DIRT]: { hardness: 0.5, tool: 'any', drop: BLOCKS.DIRT },
  [BLOCKS.GRASS]: { hardness: 0.6, tool: 'any', drop: BLOCKS.DIRT },
  [BLOCKS.SAND]: { hardness: 0.5, tool: 'any', drop: BLOCKS.SAND },
  [BLOCKS.OAK_LOG]: { hardness: 1.5, tool: 'any', drop: BLOCKS.OAK_LOG },
  [BLOCKS.OAK_PLANKS]: { hardness: 1.2, tool: 'any', drop: BLOCKS.OAK_PLANKS },
  [BLOCKS.OAK_LEAVES]: { hardness: 0.2, tool: 'any', drop: null },
  [BLOCKS.COBBLE]: { hardness: 2.0, tool: 'pickaxe', minTier: 1, drop: BLOCKS.COBBLE },
  [BLOCKS.STONE]: { hardness: 2.0, tool: 'pickaxe', minTier: 1, drop: BLOCKS.COBBLE },
  [BLOCKS.COAL_ORE]: { hardness: 3.0, tool: 'pickaxe', minTier: 1, drop: ITEMS.COAL },
  [BLOCKS.IRON_ORE]: { hardness: 3.5, tool: 'pickaxe', minTier: 2, drop: ITEMS.RAW_IRON },
  [BLOCKS.GOLD_ORE]: { hardness: 3.5, tool: 'pickaxe', minTier: 2, drop: ITEMS.RAW_GOLD },
  [BLOCKS.DIAMOND_ORE]: { hardness: 4.5, tool: 'pickaxe', minTier: 2, drop: ITEMS.DIAMOND },
  [BLOCKS.OBSIDIAN]: { hardness: 10.0, tool: 'pickaxe', minTier: 3, drop: BLOCKS.OBSIDIAN },
  [BLOCKS.TNT]: { hardness: 0.1, tool: 'any', drop: BLOCKS.TNT },
  [BLOCKS.GLOWSTONE]: { hardness: 0.4, tool: 'any', drop: BLOCKS.GLOWSTONE },
  [BLOCKS.CRAFTING_TABLE]: { hardness: 1.5, tool: 'any', drop: BLOCKS.CRAFTING_TABLE }
};

// =============================================================================
// PROCEDURAL SOUND ENGINE
// =============================================================================
class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playStep() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80 + Math.random() * 30, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  playBreak() {
    if (!this.ctx) return;
    const bufSize = this.ctx.sampleRate * 0.1;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.3));

    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    noise.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playPlace() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playPickup() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.11);
  }

  playGravitySlowWhoosh(isInverted) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const start = isInverted ? 120 : 380;
    const end = isInverted ? 380 : 120;
    osc.frequency.setValueAtTime(start, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(end, this.ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.82);
  }

  playRewindTick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600 + Math.random() * 200, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
}

const sounds = new SoundEngine();

// =============================================================================
// PROCEDURAL TEXTURE GENERATION
// =============================================================================
function createPixelTexture(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');

  function noise(hex, variance) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const delta = (Math.random() * 2 - 1) * variance;
        ctx.fillStyle = `rgb(${Math.min(255, Math.max(0, r + delta)) | 0},${Math.min(255, Math.max(0, g + delta)) | 0},${Math.min(255, Math.max(0, b + delta)) | 0})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  switch (type) {
    case BLOCKS.GRASS:
      noise('#5b8e32', 20);
      break;
    case BLOCKS.DIRT:
      noise('#866043', 25);
      break;
    case BLOCKS.STONE:
      noise('#7a7a7a', 20);
      break;
    case BLOCKS.COBBLE:
      noise('#5c5c5c', 35);
      for (let i = 0; i < 16; i += 4) {
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(0, i, 16, 1);
        ctx.fillRect(i, 0, 1, 16);
      }
      break;
    case BLOCKS.OAK_LOG:
      noise('#685332', 20);
      ctx.fillStyle = '#47361b';
      for (let x = 3; x < 16; x += 4) ctx.fillRect(x, 0, 1, 16);
      break;
    case BLOCKS.OAK_LEAVES:
      noise('#3a7a28', 35);
      break;
    case BLOCKS.OAK_PLANKS:
      noise('#9c7f4e', 18);
      ctx.fillStyle = '#5c4520';
      for (let y = 3; y < 16; y += 4) ctx.fillRect(0, y, 16, 1);
      break;
    case BLOCKS.DIAMOND_ORE:
      noise('#7a7a7a', 15);
      ctx.fillStyle = '#4dedf4';
      ctx.fillRect(3, 4, 2, 2); ctx.fillRect(9, 3, 2, 2); ctx.fillRect(5, 10, 2, 2);
      break;
    case BLOCKS.GOLD_ORE:
      noise('#7a7a7a', 15);
      ctx.fillStyle = '#fcee4b';
      ctx.fillRect(4, 3, 2, 2); ctx.fillRect(10, 5, 2, 2);
      break;
    case BLOCKS.IRON_ORE:
      noise('#7a7a7a', 15);
      ctx.fillStyle = '#d8af93';
      ctx.fillRect(2, 5, 2, 2); ctx.fillRect(11, 4, 2, 2);
      break;
    case BLOCKS.COAL_ORE:
      noise('#7a7a7a', 15);
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(3, 3, 3, 2); ctx.fillRect(9, 8, 2, 3);
      break;
    case BLOCKS.GLASS:
      ctx.fillStyle = 'rgba(210, 240, 255, 0.35)';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 2, 2, 2);
      break;
    case BLOCKS.WATER:
      ctx.fillStyle = 'rgba(30, 90, 220, 0.65)';
      ctx.fillRect(0, 0, 16, 16);
      break;
    case BLOCKS.SAND:
      noise('#dbcf9c', 18);
      break;
    case BLOCKS.TNT:
      noise('#c43224', 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 6, 16, 4);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 4px sans-serif';
      ctx.fillText('TNT', 4, 9.5);
      break;
    case BLOCKS.OBSIDIAN:
      noise('#1a1228', 25);
      break;
    case BLOCKS.GLOWSTONE:
      noise('#fadc6a', 30);
      break;
    case BLOCKS.BEDROCK:
      noise('#222222', 45);
      break;
    case BLOCKS.CRAFTING_TABLE:
      noise('#9c7f4e', 18);
      ctx.fillStyle = '#5c3e1e';
      ctx.fillRect(2, 2, 12, 12);
      break;
    default:
      noise('#ff00ff', 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

const materials = {};
Object.values(BLOCKS).forEach(id => {
  if (id === BLOCKS.AIR) return;
  const isTransparent = id === BLOCKS.GLASS || id === BLOCKS.WATER;
  materials[id] = new THREE.MeshLambertMaterial({
    map: createPixelTexture(id),
    transparent: isTransparent,
    opacity: isTransparent ? (id === BLOCKS.WATER ? 0.65 : 0.4) : 1.0
  });
});

// =============================================================================
// NATURAL VOXEL WORLD (Procedural Biomes & Ruins)
// =============================================================================
class VoxelWorld {
  constructor(scene) {
    this.scene = scene;
    this.blocks = new Uint8Array(WORLD_WIDTH * WORLD_HEIGHT * WORLD_DEPTH);
    this.meshInstances = {};
    this.maxInstances = 45000;
    this.initInstancing();
  }

  getIndex(x, y, z) {
    if (x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT || z < 0 || z >= WORLD_DEPTH) return -1;
    return x + y * WORLD_WIDTH + z * WORLD_WIDTH * WORLD_HEIGHT;
  }

  getBlock(x, y, z) {
    const idx = this.getIndex(x, y, z);
    return idx === -1 ? BLOCKS.AIR : this.blocks[idx];
  }

  setBlockInternal(x, y, z, blockType) {
    const idx = this.getIndex(x, y, z);
    if (idx !== -1) this.blocks[idx] = blockType;
  }

  initInstancing() {
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    Object.keys(materials).forEach(id => {
      const instancedMesh = new THREE.InstancedMesh(boxGeo, materials[id], this.maxInstances);
      instancedMesh.count = 0;
      instancedMesh.castShadow = true;
      instancedMesh.receiveShadow = true;
      this.meshInstances[id] = instancedMesh;
      this.scene.add(instancedMesh);
    });
  }

  generateWorld() {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      for (let z = 0; z < WORLD_DEPTH; z++) {
        this.setBlockInternal(x, 0, z, BLOCKS.BEDROCK);

        // Smooth multi-octave rolling plains & hills
        const baseH = 12;
        const hill1 = Math.sin(x * 0.06) * Math.cos(z * 0.06) * 5;
        const hill2 = Math.sin((x + z) * 0.03) * 3;
        const height = Math.floor(baseH + hill1 + hill2);

        for (let y = 1; y < WORLD_HEIGHT; y++) {
          if (y < height - 3) {
            let block = BLOCKS.STONE;
            const r = Math.random();
            if (r < 0.012 && y < 14) block = BLOCKS.DIAMOND_ORE;
            else if (r < 0.02 && y < 18) block = BLOCKS.GOLD_ORE;
            else if (r < 0.04) block = BLOCKS.IRON_ORE;
            else if (r < 0.06) block = BLOCKS.COAL_ORE;
            this.setBlockInternal(x, y, z, block);
          } else if (y < height) {
            this.setBlockInternal(x, y, z, BLOCKS.DIRT);
          } else if (y === height) {
            this.setBlockInternal(x, y, z, height <= SEA_LEVEL + 1 ? BLOCKS.SAND : BLOCKS.GRASS);
          } else if (y <= SEA_LEVEL) {
            this.setBlockInternal(x, y, z, BLOCKS.WATER);
          }
        }

        // Natural tree placement
        if (x > 5 && x < WORLD_WIDTH - 5 && z > 5 && z < WORLD_DEPTH - 5) {
          if (height > SEA_LEVEL + 1 && Math.random() < 0.018) {
            this.buildTree(x, height + 1, z);
          }
        }
      }
    }

    // Procedural Natural Structures (Ruins & Outposts for exploration)
    this.buildRuins(20, 20);
    this.buildRuins(55, 60);
    this.buildWatchtower(60, 25);
    this.buildWatchtower(25, 65);

    this.rebuildAllMeshes();
  }

  buildTree(x, y, z) {
    for (let i = 0; i < 4; i++) this.setBlockInternal(x, y + i, z, BLOCKS.OAK_LOG);
    for (let lx = -2; lx <= 2; lx++) {
      for (let lz = -2; lz <= 2; lz++) {
        for (let ly = 2; ly <= 4; ly++) {
          if (Math.abs(lx) === 2 && Math.abs(lz) === 2 && ly === 4) continue;
          if (this.getBlock(x + lx, y + ly, z + lz) === BLOCKS.AIR) {
            this.setBlockInternal(x + lx, y + ly, z + lz, BLOCKS.OAK_LEAVES);
          }
        }
      }
    }
  }

  buildRuins(rx, rz) {
    const groundY = this.getHighestSolidY(rx, rz);
    for (let x = rx - 2; x <= rx + 2; x++) {
      for (let z = rz - 2; z <= rz + 2; z++) {
        this.setBlockInternal(x, groundY, z, BLOCKS.COBBLE);
        if (Math.random() < 0.4) {
          const wallH = Math.floor(Math.random() * 3) + 1;
          for (let h = 1; h <= wallH; h++) {
            this.setBlockInternal(x, groundY + h, z, BLOCKS.COBBLE);
          }
        }
      }
    }
  }

  buildWatchtower(wx, wz) {
    const groundY = this.getHighestSolidY(wx, wz);
    // 4 Corner pillars
    for (let h = 1; h <= 6; h++) {
      this.setBlockInternal(wx - 1, groundY + h, wz - 1, BLOCKS.OAK_LOG);
      this.setBlockInternal(wx + 1, groundY + h, wz - 1, BLOCKS.OAK_LOG);
      this.setBlockInternal(wx - 1, groundY + h, wz + 1, BLOCKS.OAK_LOG);
      this.setBlockInternal(wx + 1, groundY + h, wz + 1, BLOCKS.OAK_LOG);
    }
    // Floor platform
    for (let x = wx - 2; x <= wx + 2; x++) {
      for (let z = wz - 2; z <= wz + 2; z++) {
        this.setBlockInternal(x, groundY + 7, z, BLOCKS.OAK_PLANKS);
      }
    }
    this.setBlockInternal(wx, groundY + 8, wz, BLOCKS.GLOWSTONE);
  }

  isBlockOccluded(x, y, z) {
    const neighbors = [
      this.getBlock(x + 1, y, z),
      this.getBlock(x - 1, y, z),
      this.getBlock(x, y + 1, z),
      this.getBlock(x, y - 1, z),
      this.getBlock(x, y, z + 1),
      this.getBlock(x, y, z - 1)
    ];
    return neighbors.every(n => n !== BLOCKS.AIR && n !== BLOCKS.WATER && n !== BLOCKS.GLASS);
  }

  rebuildAllMeshes() {
    const counts = {};
    Object.keys(materials).forEach(id => counts[id] = 0);
    const dummy = new THREE.Object3D();

    for (let x = 0; x < WORLD_WIDTH; x++) {
      for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let z = 0; z < WORLD_DEPTH; z++) {
          const type = this.getBlock(x, y, z);
          if (type === BLOCKS.AIR) continue;
          if (this.isBlockOccluded(x, y, z)) continue;

          const mesh = this.meshInstances[type];
          if (mesh && counts[type] < this.maxInstances) {
            dummy.position.set(x + 0.5, y + 0.5, z + 0.5);
            dummy.updateMatrix();
            mesh.setMatrixAt(counts[type], dummy.matrix);
            counts[type]++;
          }
        }
      }
    }

    Object.keys(materials).forEach(id => {
      const mesh = this.meshInstances[id];
      mesh.count = counts[id];
      mesh.instanceMatrix.needsUpdate = true;
    });
  }

  setBlock(x, y, z, type) {
    this.setBlockInternal(x, y, z, type);
    this.rebuildAllMeshes();
  }

  getHighestSolidY(x, z) {
    for (let y = WORLD_HEIGHT - 1; y >= 0; y--) {
      const b = this.getBlock(x, y, z);
      if (b !== BLOCKS.AIR && b !== BLOCKS.WATER) return y;
    }
    return 12;
  }
}

// =============================================================================
// DROPPED ITEMS
// =============================================================================
class DropItemManager {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.boxGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
  }

  spawnDrop(x, y, z, itemId) {
    const mat = materials[itemId] || new THREE.MeshLambertMaterial({ color: 0xffaa00 });
    const mesh = new THREE.Mesh(this.boxGeo, mat);
    mesh.position.set(x, y + 0.2, z);
    this.scene.add(mesh);

    this.items.push({
      id: itemId,
      mesh,
      pos: mesh.position,
      vel: new THREE.Vector3((Math.random() - 0.5) * 1.5, 3.0, (Math.random() - 0.5) * 1.5),
      rotSpeed: Math.random() * 2 + 1
    });
  }

  update(delta, player, world) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.vel.y -= 14.0 * delta;
      item.pos.y += item.vel.y * delta;
      const bx = Math.floor(item.pos.x);
      const by = Math.floor(item.pos.y);
      const bz = Math.floor(item.pos.z);

      if (world.getBlock(bx, by, bz) !== BLOCKS.AIR) {
        item.pos.y = by + 1.12;
        item.vel.y = 0;
      }

      item.mesh.rotation.y += item.rotSpeed * delta;

      const d = item.pos.distanceTo(player.pos);
      if (d < 2.0) {
        const pull = new THREE.Vector3().subVectors(player.pos, item.pos).normalize().multiplyScalar(5 * delta);
        item.pos.add(pull);

        if (d < 0.8) {
          player.pickupItem(item.id, 1);
          sounds.playPickup();
          this.scene.remove(item.mesh);
          this.items.splice(i, 1);
        }
      }
    }
  }
}

// =============================================================================
// PLAYER CONTROLLER (Calibrated Physics & Slow Gravity Shift)
// =============================================================================
class MinecraftPlayer {
  constructor(camera, world, drops, scene) {
    this.camera = camera;
    this.world = world;
    this.drops = drops;
    this.scene = scene;

    this.hw = 0.3;
    this.hh = 0.9;
    this.pos = new THREE.Vector3(40.5, 20, 40.5);
    this.vel = new THREE.Vector3(0, 0, 0);

    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.targetRoll = 0;
    this.onGround = false;

    // Twist 1: Slow Gravitational Inversion
    this.gravityDir = 1.0;       // Target gravity direction (1 = down, -1 = up)
    this.currentGravity = 1.0;   // Smoothly interpolated gravity multiplier

    // Stats
    this.health = 20;
    this.hunger = 20;
    this.isSprinting = false;
    this.isSneaking = false;
    this.armSwing = 0;
    this.walkBob = 0;

    // Fresh Survival Inventory
    this.hotbar = new Array(9).fill(null);
    this.backpack = new Array(27).fill(null);
    this.activeSlot = 0;

    // Twist 2: Chrono Timeline
    this.timeline = [];
    this.maxTimeline = 200;

    this.keys = {};
    this.createPlayerArm();
    this.setupListeners();
    this.respawnAtSurface();
  }

  createPlayerArm() {
    this.armGroup = new THREE.Group();
    const armGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2);
    const armMat = new THREE.MeshLambertMaterial({ color: 0xc89870 });
    this.arm = new THREE.Mesh(armGeo, armMat);
    this.arm.position.set(0.35, -0.3, -0.5);
    this.armGroup.add(this.arm);
    this.camera.add(this.armGroup);
    this.scene.add(this.camera);
  }

  respawnAtSurface() {
    const groundY = this.world.getHighestSolidY(40, 40);
    this.pos.set(40.5, groundY + 2.0, 40.5);
    this.vel.set(0, 0, 0);
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code >= 'Digit1' && e.code <= 'Digit9') {
        this.activeSlot = parseInt(e.code.replace('Digit', '')) - 1;
        updateHotbarUI();
      }

      // Slow Gravity Toggle
      if (e.code === 'KeyG') this.toggleGravity();
      if (e.code === 'KeyE') toggleInventory();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('wheel', (e) => {
      if (e.deltaY > 0) this.activeSlot = (this.activeSlot + 1) % 9;
      else this.activeSlot = (this.activeSlot + 8) % 9;
      updateHotbarUI();
    });

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        const sens = 0.0022;
        this.yaw -= e.movementX * sens;
        this.pitch -= e.movementY * sens;
        this.pitch = Math.max(-Math.PI / 2.05, Math.min(Math.PI / 2.05, this.pitch));
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (!document.pointerLockElement) return;
      this.armSwing = 1.0;
      if (e.button === 0) this.raycastMine();
      if (e.button === 2) this.raycastPlace();
    });
  }

  toggleGravity() {
    this.gravityDir *= -1;
    this.targetRoll = this.gravityDir === -1 ? Math.PI : 0;
    sounds.playGravitySlowWhoosh(this.gravityDir === -1);
    document.getElementById('grav-mode').innerText = this.gravityDir === -1 ? 'INVERTING...' : 'NORMALIZING...';
  }

  pickupItem(id, count) {
    for (let i = 0; i < 9; i++) {
      if (this.hotbar[i] && this.hotbar[i].id === id && this.hotbar[i].count < 64) {
        this.hotbar[i].count += count;
        updateHotbarUI();
        return;
      }
    }
    for (let i = 0; i < 9; i++) {
      if (!this.hotbar[i]) {
        this.hotbar[i] = { id, count };
        updateHotbarUI();
        return;
      }
    }
    for (let i = 0; i < 27; i++) {
      if (this.backpack[i] && this.backpack[i].id === id && this.backpack[i].count < 64) {
        this.backpack[i].count += count;
        return;
      }
    }
    for (let i = 0; i < 27; i++) {
      if (!this.backpack[i]) {
        this.backpack[i] = { id, count };
        return;
      }
    }
  }

  raycastMine() {
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const start = this.camera.position.clone();
    const dir = ray.ray.direction;

    for (let d = 0; d < 45; d++) {
      const p = start.clone().addScaledVector(dir, d * 0.1);
      const bx = Math.floor(p.x);
      const by = Math.floor(p.y);
      const bz = Math.floor(p.z);
      const block = this.world.getBlock(bx, by, bz);

      if (block !== BLOCKS.AIR && block !== BLOCKS.WATER) {
        if (block === BLOCKS.BEDROCK) return;

        const prop = BLOCK_PROPERTIES[block] || { drop: block };
        this.world.setBlock(bx, by, bz, BLOCKS.AIR);
        sounds.playBreak();

        if (prop.drop) {
          this.drops.spawnDrop(bx + 0.5, by + 0.5, bz + 0.5, prop.drop);
        }

        if (this.timeline.length > 0) {
          this.timeline[this.timeline.length - 1].blockEdits.push({
            x: bx, y: by, z: bz, oldType: block, newType: BLOCKS.AIR
          });
        }
        return;
      }
    }
  }

  raycastPlace() {
    const item = this.hotbar[this.activeSlot];
    if (!item || item.count <= 0) return;

    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const start = this.camera.position.clone();
    const dir = ray.ray.direction;

    for (let d = 0; d < 45; d++) {
      const p = start.clone().addScaledVector(dir, d * 0.1);
      const bx = Math.floor(p.x);
      const by = Math.floor(p.y);
      const bz = Math.floor(p.z);
      const block = this.world.getBlock(bx, by, bz);

      if (block !== BLOCKS.AIR && block !== BLOCKS.WATER) {
        const prev = start.clone().addScaledVector(dir, (d - 1) * 0.1);
        const pbx = Math.floor(prev.x);
        const pby = Math.floor(prev.y);
        const pbz = Math.floor(prev.z);

        if (Math.abs(this.pos.x - (pbx + 0.5)) < (this.hw + 0.5) &&
            Math.abs(this.pos.y - (pby + 0.5)) < (this.hh + 0.5) &&
            Math.abs(this.pos.z - (pbz + 0.5)) < (this.hw + 0.5)) {
          return;
        }

        if (item.id < 100) {
          this.world.setBlock(pbx, pby, pbz, item.id);
          sounds.playPlace();
          item.count--;
          if (item.count <= 0) this.hotbar[this.activeSlot] = null;
          updateHotbarUI();

          if (this.timeline.length > 0) {
            this.timeline[this.timeline.length - 1].blockEdits.push({
              x: pbx, y: pby, z: pbz, oldType: BLOCKS.AIR, newType: item.id
            });
          }
        }
        return;
      }
    }
  }

  update(delta) {
    // Twist 2: Chrono Rewind
    if (this.keys['KeyR'] && this.timeline.length > 1) {
      document.getElementById('rewind-overlay').style.display = 'flex';
      sounds.playRewindTick();
      const snap = this.timeline.pop();

      this.pos.copy(snap.pos);
      this.vel.set(0, 0, 0);
      this.health = snap.health;
      this.gravityDir = snap.gravityDir;
      this.targetRoll = this.gravityDir === -1 ? Math.PI : 0;

      snap.blockEdits.forEach(b => {
        this.world.setBlockInternal(b.x, b.y, b.z, b.oldType);
      });
      if (snap.blockEdits.length > 0) this.world.rebuildAllMeshes();
      updateStatusHUD();
      return;
    } else {
      document.getElementById('rewind-overlay').style.display = 'none';
    }

    // Save timeline state
    this.timeline.push({
      pos: this.pos.clone(),
      health: this.health,
      gravityDir: this.gravityDir,
      blockEdits: []
    });
    if (this.timeline.length > this.maxTimeline) this.timeline.shift();
    document.getElementById('rewind-time').innerText = (this.timeline.length * 0.05).toFixed(1) + 's';

    // Slow, readable camera roll (gentle lerp over ~1 full second)
    this.roll = THREE.MathUtils.lerp(this.roll, this.targetRoll, delta * 2.5);

    // Smoothly shift gravity value
    this.currentGravity = THREE.MathUtils.lerp(this.currentGravity, this.gravityDir, delta * 2.0);
    if (Math.abs(this.currentGravity - this.gravityDir) < 0.05) {
      document.getElementById('grav-mode').innerText = this.gravityDir === -1 ? 'INVERTED (CEILING)' : 'NORMAL';
    }

    // =========================================================================
    // CALIBRATED MOVEMENT (Prevents accidental launch / flying)
    // =========================================================================
    this.isSprinting = !!this.keys['ControlLeft'];
    this.isSneaking = !!this.keys['ShiftLeft'];

    const speed = this.isSprinting ? 6.2 : (this.isSneaking ? 2.2 : 4.3);
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();
    const wishDir = new THREE.Vector3();

    if (this.keys['KeyW']) wishDir.add(forward);
    if (this.keys['KeyS']) wishDir.sub(forward);
    if (this.keys['KeyD']) wishDir.add(right);
    if (this.keys['KeyA']) wishDir.sub(right);
    if (wishDir.lengthSq() > 0) wishDir.normalize();

    // Controlled acceleration
    if (this.onGround) {
      this.vel.x = wishDir.x * speed;
      this.vel.z = wishDir.z * speed;
    } else {
      // Gentle air steering, strictly clamped to avoid flight momentum
      this.vel.x += wishDir.x * speed * 2.5 * delta;
      this.vel.z += wishDir.z * speed * 2.5 * delta;
      const hSpeed = Math.hypot(this.vel.x, this.vel.z);
      if (hSpeed > speed) {
        this.vel.x = (this.vel.x / hSpeed) * speed;
        this.vel.z = (this.vel.z / hSpeed) * speed;
      }
    }

    // Gravity calculation
    const gravityAccel = 26.0 * this.currentGravity;
    this.vel.y -= gravityAccel * delta;

    // Terminal velocity clamping
    this.vel.y = Math.max(-28, Math.min(28, this.vel.y));

    // Jump Impulse
    if (this.keys['Space'] && this.onGround) {
      this.vel.y = 8.5 * Math.sign(this.gravityDir);
      this.onGround = false;
      sounds.playStep();
    }

    // Move with Swept AABB
    this.moveWithAABB(delta);

    // Eye Height (1.62 normal, 1.28 sneaking)
    const eyeH = this.isSneaking ? 1.28 : 1.62;
    this.camera.position.set(
      this.pos.x,
      this.pos.y + (this.gravityDir === 1 ? eyeH - 0.9 : -eyeH + 0.9),
      this.pos.z
    );
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.set(this.pitch, this.yaw, this.roll);

    // Walking arm bob
    if (this.onGround && wishDir.lengthSq() > 0) {
      this.walkBob += delta * (this.isSprinting ? 12 : 8);
      if (Math.sin(this.walkBob) < -0.9) sounds.playStep();
    } else {
      this.walkBob = THREE.MathUtils.lerp(this.walkBob, 0, delta * 6);
    }
    this.armSwing = Math.max(0, this.armSwing - delta * 4);
    this.arm.position.y = -0.3 + Math.sin(this.walkBob) * 0.025;
    this.arm.rotation.x = 0.2 + Math.sin(this.armSwing * Math.PI) * 0.8;

    // Void guard
    if (this.pos.y < -4 || this.pos.y > WORLD_HEIGHT + 10) {
      this.respawnAtSurface();
    }
  }

  moveWithAABB(delta) {
    // X Axis
    this.pos.x += this.vel.x * delta;
    if (this.collides()) {
      if (this.onGround) {
        this.pos.y += 0.6;
        if (this.collides()) {
          this.pos.y -= 0.6;
          this.pos.x -= this.vel.x * delta;
          this.vel.x = 0;
        }
      } else {
        this.pos.x -= this.vel.x * delta;
        this.vel.x = 0;
      }
    }

    // Z Axis
    this.pos.z += this.vel.z * delta;
    if (this.collides()) {
      if (this.onGround) {
        this.pos.y += 0.6;
        if (this.collides()) {
          this.pos.y -= 0.6;
          this.pos.z -= this.vel.z * delta;
          this.vel.z = 0;
        }
      } else {
        this.pos.z -= this.vel.z * delta;
        this.vel.z = 0;
      }
    }

    // Y Axis
    this.onGround = false;
    this.pos.y += this.vel.y * delta;
    if (this.collides()) {
      if (this.gravityDir === 1 && this.vel.y < 0) this.onGround = true;
      if (this.gravityDir === -1 && this.vel.y > 0) this.onGround = true;
      this.pos.y -= this.vel.y * delta;
      this.vel.y = 0;
    }
  }

  collides() {
    const minX = Math.floor(this.pos.x - this.hw);
    const maxX = Math.floor(this.pos.x + this.hw);
    const minY = Math.floor(this.pos.y - this.hh);
    const maxY = Math.floor(this.pos.y + this.hh);
    const minZ = Math.floor(this.pos.z - this.hw);
    const maxZ = Math.floor(this.pos.z + this.hw);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const b = this.world.getBlock(x, y, z);
          if (b !== BLOCKS.AIR && b !== BLOCKS.WATER) return true;
        }
      }
    }
    return false;
  }
}

// =============================================================================
// CRAFTING & RECIPES
// =============================================================================
function setupCraftingHandlers(player) {
  document.querySelectorAll('.recipe-btn').forEach(btn => {
    btn.onclick = () => {
      const type = btn.getAttribute('data-craft');

      if (type === 'planks') {
        const slot = player.hotbar.find(s => s && s.id === BLOCKS.OAK_LOG && s.count >= 1);
        if (slot) {
          slot.count--;
          if (slot.count <= 0) player.hotbar[player.hotbar.indexOf(slot)] = null;
          player.pickupItem(BLOCKS.OAK_PLANKS, 4);
          sounds.playPlace();
          updateHotbarUI();
        }
      } else if (type === 'sticks') {
        const slot = player.hotbar.find(s => s && s.id === BLOCKS.OAK_PLANKS && s.count >= 2);
        if (slot) {
          slot.count -= 2;
          if (slot.count <= 0) player.hotbar[player.hotbar.indexOf(slot)] = null;
          player.pickupItem(ITEMS.STICK, 4);
          sounds.playPlace();
          updateHotbarUI();
        }
      } else if (type === 'wooden_pickaxe') {
        const pSlot = player.hotbar.find(s => s && s.id === BLOCKS.OAK_PLANKS && s.count >= 3);
        const sSlot = player.hotbar.find(s => s && s.id === ITEMS.STICK && s.count >= 2);
        if (pSlot && sSlot) {
          pSlot.count -= 3;
          if (pSlot.count <= 0) player.hotbar[player.hotbar.indexOf(pSlot)] = null;
          sSlot.count -= 2;
          if (sSlot.count <= 0) player.hotbar[player.hotbar.indexOf(sSlot)] = null;
          player.pickupItem(ITEMS.WOODEN_PICKAXE, 1);
          sounds.playPlace();
          updateHotbarUI();
        }
      }
    };
  });
}

// =============================================================================
// HUD & INTERFACE
// =============================================================================
function updateStatusHUD() {
  const healthBar = document.getElementById('health-bar');
  const hungerBar = document.getElementById('hunger-bar');

  healthBar.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const el = document.createElement('div');
    el.className = 'stat-icon';
    el.style.background = i * 2 < player.health ? '#ff2222' : '#330000';
    el.style.border = '1px solid #000';
    healthBar.appendChild(el);
  }

  hungerBar.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const el = document.createElement('div');
    el.className = 'stat-icon';
    el.style.background = i * 2 < player.hunger ? '#d88b2d' : '#2b1b08';
    el.style.border = '1px solid #000';
    hungerBar.appendChild(el);
  }
}

function updateHotbarUI() {
  const hotbarEl = document.getElementById('hotbar');
  hotbarEl.innerHTML = '';

  player.hotbar.forEach((slot, idx) => {
    const slotEl = document.createElement('div');
    slotEl.className = `hotbar-slot ${idx === player.activeSlot ? 'active' : ''}`;

    if (slot && slot.count > 0) {
      const name = ITEM_NAMES[slot.id] || "Item";
      slotEl.title = name;
      const label = document.createElement('span');
      label.innerText = name.split(' ')[0].substring(0, 4);
      label.style.fontSize = '9px';
      label.style.color = '#fff';
      label.style.textShadow = '1px 1px 0 #000';
      slotEl.appendChild(label);

      const count = document.createElement('span');
      count.className = 'slot-count';
      count.innerText = slot.count;
      slotEl.appendChild(count);
    }

    slotEl.onclick = () => {
      player.activeSlot = idx;
      updateHotbarUI();
    };
    hotbarEl.appendChild(slotEl);
  });
}

function toggleInventory() {
  const gui = document.getElementById('inventory-gui');
  if (gui.classList.contains('hidden')) {
    gui.classList.remove('hidden');
    document.exitPointerLock();
  } else {
    gui.classList.add('hidden');
    document.body.requestPointerLock();
  }
}

document.getElementById('close-inv-btn').onclick = toggleInventory;

// =============================================================================
// MAIN INITIALIZATION & GAME LOOP
// =============================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.FogExp2(0x87ceeb, 0.012);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.getElementById('game-container').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfffaed, 0.85);
sunLight.position.set(50, 80, 40);
sunLight.castShadow = true;
scene.add(sunLight);

const world = new VoxelWorld(scene);
world.generateWorld();

const drops = new DropItemManager(scene);
const player = new MinecraftPlayer(camera, world, drops, scene);
setupCraftingHandlers(player);

document.getElementById('btn-play').onclick = () => {
  sounds.init();
  document.body.requestPointerLock();
};

document.addEventListener('pointerlockchange', () => {
  const pauseScreen = document.getElementById('pause-screen');
  if (document.pointerLockElement) {
    pauseScreen.classList.add('hidden');
  } else {
    if (document.getElementById('inventory-gui').classList.contains('hidden')) {
      pauseScreen.classList.remove('hidden');
    }
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let lastTime = performance.now();

function animate(currentTime) {
  requestAnimationFrame(animate);

  const delta = Math.min(0.1, (currentTime - lastTime) / 1000);
  lastTime = currentTime;

  player.update(delta);
  drops.update(delta, player, world);

  renderer.render(scene, camera);
}

updateStatusHUD();
updateHotbarUI();
requestAnimationFrame(animate);
