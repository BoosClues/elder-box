+191
-0

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const overlay = document.getElementById('overlay');
const glyphGrid = document.getElementById('glyphGrid');

/**
 * Simple sound manager with placeholder assets.
 */
class SoundManager {
  constructor() {
    this.sounds = {
      valve: new Audio('assets/sounds/valve.mp3'),
      click: new Audio('assets/sounds/click.mp3'),
      telescope: new Audio('assets/sounds/telescope.mp3'),
    };
  }
  play(name) {
    const s = this.sounds[name];
    if (s) s.cloneNode(true).play();
  }
}

const sound = new SoundManager();

/**
 * Core puzzle game controller handling sequential stages.
 */
class PuzzleGame {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.stage = 0;
    this.requiredGlyphs = ['moon','bat','child','blood','vampire'];
    this.inputGlyphs = [];
    this.initBox();
    this.setNarration('A dark pedestal holds an obsidian box. Your blood will wake it.');
  }

  initBox() {
    const tex = new THREE.TextureLoader().load('assets/textures/obsidian_placeholder.png');
    const geom = new THREE.BoxGeometry(1,1,1);
    const mat = new THREE.MeshStandardMaterial({map:tex});
    this.box = new THREE.Mesh(geom,mat);
    this.scene.add(this.box);

    // pop-up telescope placeholder
    const cyl = new THREE.CylinderGeometry(0.05,0.05,0.2,32);
    const cylMat = new THREE.MeshStandardMaterial({color:0x888888});
    this.telescope = new THREE.Mesh(cyl,cylMat);
    this.telescope.position.set(0,0.6,0);
    this.telescope.visible = false; // hidden until activated
    this.scene.add(this.telescope);
  }

  setNarration(text) {
    overlay.textContent = text;
  }

  nextStage() {
    this.stage++;
    switch(this.stage) {
      case 1: this.stage1(); break;
      case 2: this.stage2(); break;
      case 3: this.stage3(); break;
      case 4: this.stage4(); break;
      case 5: this.stage5(); break;
      case 6: this.stage6(); break;
      case 7: this.stage7(); break;
      default: this.setNarration('The box falls silent.');
    }
  }

  // 1. Prick your finger to start the blood flow.
  stage1() {
    this.setNarration('Stage 1: Prick your finger. Click the box to bleed.');
    this.box.cursor = 'pointer';
    const handler = () => {
      sound.play('click');
      this.box.removeEventListener('click', handler);
      this.setNarration('Blood drips into hidden veins.');
      this.nextStage();
    };
    this.box.addEventListener('click', handler);
  }

  // 2. Increase the blood pressure using knobs and valves and gauges.
  stage2() {
    this.setNarration('Stage 2: Adjust valves to raise pressure. (Placeholder knob)');
    sound.play('valve');
    // TODO: interactive valve puzzle
    setTimeout(()=>this.nextStage(),1000);
  }

  // 3. Rearrange 5 IV tubes.
  stage3() {
    this.setNarration('Stage 3: Connect the IV tubes. (Placeholder)');
    // TODO: drag-drop tube puzzle
    setTimeout(()=>{
      this.setNarration('A stanza glows upon the box.');
      this.nextStage();
    },1000);
  }

  // 4. Riddle glyph grid.
  stage4() {
    this.setNarration('Stage 4: Decode the glowing riddle.');
    glyphGrid.innerHTML = '';
    glyphGrid.style.display = 'block';
    const glyphs = ['moon','bat','child','blood','vampire','walrus','oyster','bird','sun'];
    glyphs.forEach(g => {
      const img = document.createElement('img');
      img.src = `assets/glyphs/${g}.png`;
      img.alt = g;
      img.addEventListener('click', () => this.handleGlyph(g));
      glyphGrid.appendChild(img);
    });
  }

  handleGlyph(g) {
    this.inputGlyphs.push(g);
    sound.play('click');
    if (this.inputGlyphs.length === this.requiredGlyphs.length) {
      glyphGrid.style.display = 'none';
      if (this.requiredGlyphs.every((v,i)=>v===this.inputGlyphs[i])) {
        this.setNarration('Glyphs align; a hidden panel slides open.');
        this.nextStage();
      } else {
        this.setNarration('Wrong order. The glyphs reset.');
        this.inputGlyphs = [];
        this.stage4();
      }
    }
  }

  // 5. Vampire head orientation puzzle.
  stage5() {
    this.setNarration('Stage 5: Daylight approaches. Rotate the vampire head upside down.');
    // TODO: 3D model of vampire head with rotation interaction
    setTimeout(()=>{
      this.setNarration('The vampire sleeps inverted, revealing a key.');
      this.nextStage();
    },1000);
  }

  // 6. Multi-tier ring maze.
  stage6() {
    this.setNarration('Stage 6: Align the blood rings to continue the flow.');
    // TODO: ring puzzle logic where rotating affects others
    setTimeout(()=>{
      this.setNarration('The blood forms the outline of a key.');
      this.nextStage();
    },1000);
  }

  // 7. Hardened obsidian key and final unlock.
  stage7() {
    this.telescope.visible = true; // show telescope for cool mechanic
    sound.play('telescope');
    this.setNarration('Stage 7: Forge the key and reveal the artifact.');
    // TODO: animate blood solidifying into key, allow user to unlock box
  }
}

// basic Three.js scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.HemisphereLight(0xffffff,0x444444,1);
scene.add(light);

const game = new PuzzleGame(scene,camera);

game.nextStage(); // start at stage 1

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
