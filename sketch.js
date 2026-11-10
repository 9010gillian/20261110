let idleSprite; // 儲存角色待機動畫的精靈圖
let walkSprite; // 儲存角色走路動畫的精靈圖
let attackSprite; // 儲存角色發功動畫的精靈圖
const idleFrameCount = 10; // 設定待機精靈圖包含十張影格
const idleFrameWidth = 1395 / idleFrameCount; // 計算待機精靈圖的單格寬度
const idleFrameHeight = 196; // 設定待機精靈圖的單格高度
const walkFrameCount = 9; // 設定走路精靈圖包含九張影格
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路精靈圖的單格寬度
const walkFrameHeight = 198; // 設定走路精靈圖的單格高度
const attackFrameCount = 15; // 設定發功精靈圖包含十五張影格
const attackFrameWidth = 3625 / attackFrameCount; // 計算發功精靈圖的單格寬度
const attackFrameHeight = 176; // 設定發功精靈圖的單格高度
let currentFrame = 0; // 記錄目前播放的影格編號
let characterX = 0; // 記錄角色中心的水平座標
let facingDirection = 1; // 記錄角色朝向，正值向右、負值向左
let wasWalking = false; // 記錄上一畫格是否正在走路
let attackActive = false; // 記錄角色是否正在播放單次發功動畫
let spaceHeld = false; // 記錄空白鍵是否仍按住以避免重複觸發
let lastAnimationState = "idle"; // 記錄上一畫格的角色動畫狀態
function preload() { // 在建立畫布前載入待機與走路精靈圖
  idleSprite = loadImage("停止/停止.png"); // 載入十格待機精靈圖
  walkSprite = loadImage("走路/走路.png"); // 載入九格走路精靈圖
  attackSprite = loadImage("發功/發功.png"); // 載入十五格發功精靈圖
} // 結束圖片預載函式
function setup() { // 初始化全螢幕動畫畫布
  createCanvas(windowWidth, windowHeight); // 建立符合瀏覽器視窗大小的畫布
  frameRate(10); // 設定動畫每秒更新十次
  imageMode(CORNER); // 使用圖片左上角作為繪製座標
  noSmooth(); // 保留精靈圖像素邊緣清晰
  characterX = width * 2 / 3; // 將角色初始位置放在畫布寬度的三分之二
} // 結束畫布初始化函式
function draw() { // 每個動畫影格更新角色位置並重繪畫面
  background(135, 206, 235); // 使用天空藍填滿全螢幕背景
  const movingRight = keyIsDown(RIGHT_ARROW); // 偵測右方向鍵目前是否按住
  const movingLeft = keyIsDown(LEFT_ARROW); // 偵測左方向鍵目前是否按住
  const isWalking = !attackActive && movingRight !== movingLeft; // 發功時停止移動並判斷是否只按住一側方向鍵
  const animationState = attackActive ? "attack" : isWalking ? "walk" : "idle"; // 決定目前顯示發功、走路或待機動畫
  if (animationState !== lastAnimationState) { // 當角色動畫狀態切換時重設影格
    currentFrame = 0; // 從新動畫的第一格開始播放
    lastAnimationState = animationState; // 記錄目前動畫狀態供下一畫格比較
  } // 結束動畫狀態切換判斷
  const activeSprite = attackActive ? attackSprite : isWalking ? walkSprite : idleSprite; // 依目前狀態選擇發功、走路或待機精靈圖
  const activeFrameCount = attackActive ? attackFrameCount : isWalking ? walkFrameCount : idleFrameCount; // 取得目前動畫的影格總數
  const activeFrameWidth = attackActive ? attackFrameWidth : isWalking ? walkFrameWidth : idleFrameWidth; // 取得目前精靈圖的單格寬度
  const activeFrameHeight = attackActive ? attackFrameHeight : isWalking ? walkFrameHeight : idleFrameHeight; // 取得目前精靈圖的單格高度
  const displayScale = min(height * 0.68 / idleFrameHeight, width * 0.32 / idleFrameWidth); // 依角色標準尺寸計算各動作共用的等比例縮放值
  const displayWidth = activeFrameWidth * displayScale; // 計算角色縮放後的顯示寬度
  const displayHeight = activeFrameHeight * displayScale; // 計算角色縮放後的顯示高度
  const movementSpeed = max(3, width * 0.012); // 依畫布寬度調整每畫格的移動距離
  if (!attackActive && movingRight && !movingLeft) { // 非發功狀態且只按住右鍵時才向右移動
    facingDirection = 1; // 設定角色面向右方
    characterX += movementSpeed; // 將角色往畫布右側移動
  } else if (!attackActive && movingLeft && !movingRight) { // 非發功狀態且只按住左鍵時才向左移動
    facingDirection = -1; // 設定角色面向左方
    characterX -= movementSpeed; // 將角色往畫布左側移動
  } // 結束方向鍵移動判斷
  characterX = constrain(characterX, displayWidth / 2, width - displayWidth / 2); // 限制角色完整停留在畫布左右邊界內
  const sourceX = (currentFrame % activeFrameCount) * activeFrameWidth; // 計算目前影格在精靈圖中的水平位置
  push(); // 暫存畫布座標狀態以設定角色朝向
  translate(characterX, height); // 將繪圖原點移到角色中心與畫布底端
  scale(facingDirection, 1); // 依移動方向水平翻轉角色圖片
  image(activeSprite, -displayWidth / 2, -displayHeight, displayWidth, displayHeight, sourceX, 0, activeFrameWidth, activeFrameHeight); // 裁切並繪製目前的縮放角色影格
  pop(); // 還原畫布座標狀態供後續繪圖使用
  if (attackActive) { // 確認目前是否正在播放單次發功動畫
    currentFrame += 1; // 前進至下一張發功影格
    if (currentFrame >= attackFrameCount) { // 確認十五張發功影格是否已播放完畢
      attackActive = false; // 結束本次發功動畫
      currentFrame = 0; // 將角色影格重設以便切回走路或待機動畫
    } // 結束發功動畫完成判斷
  } else { // 角色未發功時持續循環走路或待機動畫
    currentFrame = (currentFrame + 1) % activeFrameCount; // 切換到下一格並循環目前精靈圖影格
  } // 結束角色動畫影格更新
} // 結束動畫繪製函式
function keyPressed() { // 處理方向鍵以避免瀏覽器捲動畫面
  if (keyCode === 32) { // 偵測使用者是否按下空白鍵
    if (!spaceHeld) { // 確保按住空白鍵不會重複觸發發功
      spaceHeld = true; // 記錄空白鍵已按下
      if (!attackActive) { // 只在沒有播放發功動畫時開始新的一次發功
        attackActive = true; // 啟動單次發功動畫
        currentFrame = 0; // 從第一張發功影格開始播放
      } // 結束發功啟動判斷
    } // 結束空白鍵首次按下判斷
    return false; // 阻止空白鍵觸發瀏覽器預設捲動
  } // 結束空白鍵處理
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) { // 檢查是否按下左右方向鍵
    return false; // 阻止方向鍵觸發瀏覽器預設捲動
  } // 結束方向鍵預設行為處理
} // 結束鍵盤按下函式
function keyReleased() { // 處理按鍵放開狀態以允許下一次發功
  if (keyCode === 32) { // 確認放開的是空白鍵
    spaceHeld = false; // 清除空白鍵按住狀態
    return false; // 阻止空白鍵觸發瀏覽器預設行為
  } // 結束空白鍵放開處理
} // 結束鍵盤放開函式
function windowResized() { // 瀏覽器視窗尺寸改變時重新調整畫布
  const horizontalProgress = width > 0 ? characterX / width : 2 / 3; // 記錄角色在畫布中的相對水平位置
  resizeCanvas(windowWidth, windowHeight); // 讓畫布持續填滿整個視窗
  characterX = horizontalProgress * width; // 依新畫布寬度還原角色相對位置
} // 結束視窗尺寸調整函式
