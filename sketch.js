
let characterSprite; // 角色一站立精靈圖
let walkSprite; // 角色一走路精靈圖
let magicSprite; // 角色一施法精靈圖
let magicEffectSprite; // 魔法特效精靈圖

let characterX;
let isWalking = false;
let facingDirection = 1;
let isCasting = false;
let magicStartFrame = 0;
let magicDirection = 1;
let spaceIsDown = false;
let activeEffects = [];

// 站立動畫
const frameCountInSprite = 10;
const frameWidth = 139.5;
const frameHeight = 196;

// 走路動畫
const walkFrameCount = 9;
const walkFrameWidth = 1246 / walkFrameCount;
const walkFrameHeight = 198;

// 施法動畫
const magicFrameCount = 4;
const magicFrameWidth = 1039 / magicFrameCount;
const magicFrameHeight = 146;

// 魔法特效
const effectFrameCount = 5;
const effectFrameWidth = 740 / effectFrameCount;
const effectFrameHeight = 19;

// 動畫播放速度
const framesPerStep = 8;

// 載入圖片
function preload() {
  characterSprite = loadImage("1/stop/stop.png");
  walkSprite = loadImage("1/walk/walk.png");
  magicSprite = loadImage("1/magic/magic.png");
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png");
}

// 初始化畫布
function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);

  // 角色初始位置在畫布寬度的 2/3
  characterX = (width * 2) / 3;

  frameRate(60);
}

// 主程式
function draw() {
  background("#87CEEB");

  // 偵測左右方向鍵
  const movingRight = keyIsDown(RIGHT_ARROW);
  const movingLeft = keyIsDown(LEFT_ARROW);

  isWalking = movingRight || movingLeft;

  // 角色移動速度
  const movementStep = constrain(width * 0.004, 2, 8);

  if (movingRight) {
    isWalking = true;
    facingDirection = 1;
    characterX += movementStep;
  } else if (movingLeft) {
    isWalking = true;
    facingDirection = -1;
    characterX -= movementStep;
  }

  // ==================================
  // 角色一尺寸設定
  // 高度固定為整個畫布的 1/3
  // 寬度依照圖片原始比例自動調整
  // ==================================

  const targetCharacterHeight = height / 3;

  // 判斷施法動畫是否結束
  if (
    isCasting &&
    frameCount - magicStartFrame >=
      magicFrameCount * framesPerStep
  ) {
    isCasting = false;

    const effectStartWidth =
      frameWidth * (targetCharacterHeight / frameHeight);

    activeEffects.push({
      x: characterX + magicDirection * effectStartWidth / 2,
      y: height - targetCharacterHeight * 0.58,
      direction: magicDirection
    });
  }

  // 選擇目前角色動畫
  const activeSprite = isCasting
    ? magicSprite
    : isWalking
    ? walkSprite
    : characterSprite;

  // 取得目前動畫影格數
  const activeFrameCount = isCasting
    ? magicFrameCount
    : isWalking
    ? walkFrameCount
    : frameCountInSprite;

  // 取得目前動畫圖片寬度
  const activeFrameWidth = isCasting
    ? magicFrameWidth
    : isWalking
    ? walkFrameWidth
    : frameWidth;

  // 取得目前動畫圖片高度
  const activeFrameHeight = isCasting
    ? magicFrameHeight
    : isWalking
    ? walkFrameHeight
    : frameHeight;

  // ==================================
  // 等比例縮放角色
  // ==================================

  // 根據目前圖片高度計算縮放比例
  const characterScale =
    targetCharacterHeight / activeFrameHeight;

  // 根據原始寬高比例計算顯示寬度
  const activeWidth =
    activeFrameWidth * characterScale;

  // 顯示高度固定為畫布高度的 1/3
  const activeHeight = targetCharacterHeight;

  // 防止角色超出畫布左右邊界
  characterX = constrain(
    characterX,
    activeWidth / 2,
    max(activeWidth / 2, width - activeWidth / 2)
  );

  // ==================================
  // 計算動畫影格
  // ==================================

  const elapsedMagicFrames =
    frameCount - magicStartFrame;

  const frameIndex = isCasting
    ? floor(elapsedMagicFrames / framesPerStep)
    : floor(frameCount / framesPerStep) % activeFrameCount;

  const sourceX = frameIndex * activeFrameWidth;

  // 角色底部對齊畫布底部
  const characterY = height - activeHeight / 2;

  // ==================================
  // 繪製角色
  // ==================================

  push();

  translate(characterX, characterY);

  // 依照移動方向翻轉角色
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

  // ==================================
  // 魔法特效設定
  // ==================================

  const effectScale =
    targetCharacterHeight / frameHeight;

  const effectWidth =
    effectFrameWidth * effectScale;

  const effectHeight =
    effectFrameHeight * effectScale;

  const effectSpeed = max(6, width * 0.008);

  // 更新魔法特效
  for (
    let effectIndex = activeEffects.length - 1;
    effectIndex >= 0;
    effectIndex--
  ) {
    const effect = activeEffects[effectIndex];

    // 魔法依照方向飛行
    effect.x += effect.direction * effectSpeed;

    // 魔法飛出畫布後移除
    if (effect.x > width || effect.x < 0) {
      activeEffects.splice(effectIndex, 1);
      continue;
    }

    // 計算魔法特效影格
    const effectFrameIndex =
      floor(frameCount / framesPerStep) % effectFrameCount;

    push();

    translate(effect.x, effect.y);

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
// 鍵盤控制
// ==================================

function keyPressed() {

  // 向右移動
  if (keyCode === RIGHT_ARROW) {
    isWalking = true;
    facingDirection = 1;
    return false;
  }

  // 向左移動
  if (keyCode === LEFT_ARROW) {
    isWalking = true;
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

// 放開按鍵
function keyReleased() {
  if (keyCode === 32) {
    spaceIsDown = false;
  }
}

// ==================================
// 視窗大小改變時自動調整
// ==================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  characterX = constrain(
    characterX,
    1,
    width - 1
  );
}
