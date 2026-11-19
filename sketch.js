
let characterSprite;
let walkSprite;
let magicSprite;
let magicEffectSprite;
let bgImage;

// 角色狀態
let characterX;
let isWalking = false;
let facingDirection = 1;
let isCasting = false;
let magicStartFrame = 0;
let magicDirection = 1;
let spaceIsDown = false;
let activeEffects = [];

// 背景攝影機
let cameraX = 0;
let backgroundWidth = 0;
let worldWidth = 0;

const backgroundCount = 3;

// 動畫影格設定
const frameCountInSprite = 10;
const frameWidth = 139.5;
const frameHeight = 196;

const walkFrameCount = 9;
const walkFrameWidth = 1246 / 9;
const walkFrameHeight = 198;

const magicFrameCount = 4;
const magicFrameWidth = 1039 / 4;
const magicFrameHeight = 146;

const effectFrameCount = 5;
const effectFrameWidth = 740 / 5;
const effectFrameHeight = 19;

const framesPerStep = 8;

// ==================================
// 載入圖片
// ==================================

function preload() {
  bgImage = loadImage("bg/bg1.png");

  characterSprite = loadImage("1/stop/stop.png");
  walkSprite = loadImage("1/walk/walk.png");
  magicSprite = loadImage("1/magic/magic.png");

  magicEffectSprite = loadImage(
    "1/magic_effect/magic_effect.png"
  );
}

// ==================================
// 初始化
// ==================================

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  frameRate(60);

  backgroundWidth = width;
  worldWidth = backgroundWidth * backgroundCount;

  // 初始顯示中間背景
  cameraX = backgroundWidth;

  // 角色位於畫面 2/3
  characterX = cameraX + width * 2 / 3;
}

// ==================================
// 主程式
// ==================================

function draw() {
  updateMovement();
  updateCamera();

  drawBackground();
  drawCharacter();
  drawMagicEffects();
}

// ==================================
// 角色移動
// ==================================

function updateMovement() {
  const movingRight = keyIsDown(RIGHT_ARROW);
  const movingLeft = keyIsDown(LEFT_ARROW);

  isWalking = movingRight !== movingLeft;

  const movementStep = constrain(
    width * 0.004,
    2,
    8
  );

  // 取得角色目前動畫的原始尺寸
  const currentFrameWidth = isCasting
    ? magicFrameWidth
    : isWalking
    ? walkFrameWidth
    : frameWidth;

  const currentFrameHeight = isCasting
    ? magicFrameHeight
    : isWalking
    ? walkFrameHeight
    : frameHeight;

  // 角色高度固定為畫布 1/3
  const characterHeight = height / 3;

  // 寬度依照原始比例縮放
  const characterWidth =
    currentFrameWidth *
    (characterHeight / currentFrameHeight);

  // 向右移動
  if (movingRight && !movingLeft) {
    facingDirection = 1;
    characterX += movementStep;
  }

  // 向左移動
  if (movingLeft && !movingRight) {
    facingDirection = -1;
    characterX -= movementStep;
  }

  // 限制角色不能離開地圖
  characterX = constrain(
    characterX,
    characterWidth / 2,
    max(characterWidth / 2, worldWidth - characterWidth / 2)
  );
}

// ==================================
// 攝影機跟隨角色
// ==================================

function updateCamera() {
  // 角色在畫面中的固定位置
  const anchorX = width * 2 / 3;

  // 攝影機跟隨角色
  const targetCameraX = characterX - anchorX;

  // 攝影機只能在三張背景範圍內移動
  cameraX = constrain(
    targetCameraX,
    0,
    worldWidth - width
  );
}

// ==================================
// 繪製三張背景
// ==================================

function drawBackground() {
  push();

  imageMode(CORNER);

  for (let i = 0; i < backgroundCount; i++) {
    const bgX = i * backgroundWidth - cameraX;

    image(
      bgImage,
      bgX,
      0,
      backgroundWidth,
      height
    );
  }

  pop();
}

// ==================================
// 繪製角色
// ==================================

function drawCharacter() {
  const targetCharacterHeight = height / 3;

  // 施法結束判斷
  if (
    isCasting &&
    frameCount - magicStartFrame >=
    magicFrameCount * framesPerStep
  ) {
    isCasting = false;

    const baseWidth =
      frameWidth *
      (targetCharacterHeight / frameHeight);

    activeEffects.push({
      x: characterX +
        magicDirection * baseWidth / 2,

      y: height -
        targetCharacterHeight * 0.58,

      direction: magicDirection
    });
  }

  // 選擇動畫
  const activeSprite = isCasting
    ? magicSprite
    : isWalking
    ? walkSprite
    : characterSprite;

  const activeFrameCount = isCasting
    ? magicFrameCount
    : isWalking
    ? walkFrameCount
    : frameCountInSprite;

  const activeFrameWidth = isCasting
    ? magicFrameWidth
    : isWalking
    ? walkFrameWidth
    : frameWidth;

  const activeFrameHeight = isCasting
    ? magicFrameHeight
    : isWalking
    ? walkFrameHeight
    : frameHeight;

  // 固定高度，保持原始比例
  const characterScale =
    targetCharacterHeight / activeFrameHeight;

  const activeWidth =
    activeFrameWidth * characterScale;

  const activeHeight =
    targetCharacterHeight;

  // 計算動畫影格
  const elapsedMagicFrames =
    frameCount - magicStartFrame;

  const frameIndex = isCasting
    ? min(
        magicFrameCount - 1,
        floor(elapsedMagicFrames / framesPerStep)
      )
    : floor(frameCount / framesPerStep) %
      activeFrameCount;

  const sourceX =
    frameIndex * activeFrameWidth;

  // 角色的螢幕位置
  const screenX = characterX - cameraX;

  // 底部對齊畫布
  const characterY =
    height - activeHeight / 2;

  push();

  translate(screenX, characterY);

  // 左右翻轉
  scale(
    isCasting ? magicDirection : facingDirection,
    1
  );

  image(
    activeSprite,
    0,
    0,
    activeWidth,
    activeHeight,
    sourceX,
    0,
    activeFrameWidth,
    activeFrameHeight
  );

  pop();
}

// ==================================
// 魔法特效
// ==================================

function drawMagicEffects() {
  const targetCharacterHeight = height / 3;

  const effectScale =
    targetCharacterHeight / frameHeight;

  const effectWidth =
    effectFrameWidth * effectScale;

  const effectHeight =
    effectFrameHeight * effectScale;

  const effectSpeed = max(
    6,
    width * 0.008
  );

  for (
    let i = activeEffects.length - 1;
    i >= 0;
    i--
  ) {
    const effect = activeEffects[i];

    effect.x += effect.direction * effectSpeed;

    if (effect.x > worldWidth || effect.x < 0) {
      activeEffects.splice(i, 1);
      continue;
    }

    const screenX = effect.x - cameraX;

    const effectFrameIndex =
      floor(frameCount / framesPerStep) %
      effectFrameCount;

    push();

    translate(screenX, effect.y);

    scale(effect.direction, 1);

    image(
      magicEffectSprite,
      0,
      0,
      effectWidth,
      effectHeight,
      effectFrameIndex * effectFrameWidth,
      0,
      effectFrameWidth,
      effectFrameHeight
    );

    pop();
  }
}

// ==================================
// 鍵盤按下
// ==================================

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    facingDirection = 1;
    return false;
  }

  if (keyCode === LEFT_ARROW) {
    facingDirection = -1;
    return false;
  }

  // 空白鍵施法
  if (keyCode === 32) {
    if (!spaceIsDown && !isCasting) {
      isCasting = true;
      magicStartFrame = frameCount;
      magicDirection = facingDirection;
    }

    spaceIsDown = true;
    return false;
  }
}

// ==================================
// 鍵盤放開
// ==================================

function keyReleased() {
  if (keyCode === 32) {
    spaceIsDown = false;
  }
}

// ==================================
// 視窗大小改變
// ==================================

function windowResized() {
  const oldWorldWidth = worldWidth;

  const characterProgress =
    oldWorldWidth > 0
      ? characterX / oldWorldWidth
      : 0.5;

  resizeCanvas(windowWidth, windowHeight);

  backgroundWidth = width;
  worldWidth = backgroundWidth * backgroundCount;

  characterX = constrain(
    characterProgress * worldWidth,
    0,
    worldWidth
  );

  // 重新計算攝影機位置
  updateCamera();

  activeEffects = [];
}
