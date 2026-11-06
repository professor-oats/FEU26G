const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;

const playerImage = new Image();
playerImage.src = "assets/shadow_dog.png";

// calc the spriteWidth from the full px width of the sprites reference / columns amount
// original width = 6876 and columns amount = 12
// in this tutorial last frame was little smaller so spriteWidth will be adjusted accordingly

// Thought: For animations I bet this spriteWidth can be set as let/var if we want
// animation that changes sprites appearance

// spriteHeight = spritesheetHeight / nRows
// 5230 / 10

const spriteWidth = 575;
const spriteHeight = 523;

let gameFrame = 0;
const staggerFrames = 5;
const spriteAnimations = [];
const animationStates = [
  {
    name: 'idle',
    frames: 7,
  },
  {
    name: 'jump',
    frames: 7,
  },
  {
    name: 'fall',
    frames: 7,
  },
  {
    name: 'run',
    frames: 9,
  },
  {
    name: 'dizzy',
    frames: 11,
  },
  {
    name: 'sit',
    frames: 5,
  },
  {
    name: 'roll',
    frames: 7,
  },
  {
    name: 'bite',
    frames: 7,
  },
  {
    name: 'ko',
    frames: 12,
  },
  {
    name: 'getHit',
    frames: 4,
  }
];

animationStates.forEach((state, index) => {
  let frames = {
    loc: [],
  }
  // Really smart parsing of the data array - cheers
  for (let j = 0; j < state.frames; j++) {
    let positionX = j * spriteWidth;
    let positionY = index * spriteHeight;
    frames.loc.push({x: positionX, y: positionY});
  }
  spriteAnimations[state.name] = frames; // ???
});
console.log(spriteAnimations);

// requestAnimationFrame runs a function once
// having it recursive creates the animation frame loop

/* drawImage with 9 parameters
   takes image - then makes a cutout on its source parameters,
   then ordinary canvas placement with destination position and width + height
   ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
 */

/*
   The frameX * spriteWidth and frameY * spriteHeight will let us cycle through the cut outs
   with offset chunks to be full width and height on where to start the cutout
   -> Offsetting from one full sprite to another
 */

function animate() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  let position = Math.floor(gameFrame / staggerFrames) % spriteAnimations['idle'].loc.length;  // ensure loaded frames are staggered and then we go up to 6 for amount of frames render
  let frameX = spriteWidth * position;
  let frameY = spriteAnimations['idle'].loc[position].y;
  ctx.drawImage(playerImage, frameX, frameY, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);

  gameFrame++;

  requestAnimationFrame(animate);
}

animate();