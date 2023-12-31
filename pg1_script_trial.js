const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d",willReadFrequently=true);
const uiContainer = document.getElementById("ui-container");



canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const playerWidth = 71*1.25;
const playerHeight = 100 *1.25;
const playerSpeed = 20;
const player_sprite_count = 12;
const proximityDistance = 150
const collisionProximity = 20;

// const characterImages = {
//     up: new Image(),
//     down: new Image(),
//     left: new Image(),
//     right: new Image()
// };

// characterImages.up.src = "public/player/player_boy_1_.png"; // Update with character orientation images
// characterImages.down.src = "public/player/player_boy_0_.png";
// characterImages.left.src = "public/player/player_boy_2_.png";
// characterImages.right.src = "public/player/player_boy_3_.png";
// characterImages.up.src = "public/player/moving_animation.png"; // Update with character orientation images
// characterImages.down.src = "public/player/moving_animation.png";
// characterImages.left.src = "public/player/moving_animation.png";
// characterImages.right.src = "public/player/moving_animation.png";
const gender = 'boy';
const characterImage = new Image();
characterImage.src =`public/player/player_${gender}_sprite_transparent.png`;
const orientation_map ={
    'up': 1,
    'down': 0,
    'left': 3,
    'right' : 2
}
const no_of_frames = 3;
let currentOrientation = "up";
let previousOrientation = "up";
let movementCount = 0;


const backgroundImage = new Image();
backgroundImage.src = "public/maps/gamma/Hoenn_Secret_Base_Gamma.png"; // Replace with the path to your background image

const collisionMapImage = new Image();
collisionMapImage.src = "public/maps/gamma/collision_map_gamma.jpg"; // Replace with the path to your collision map image





// Define the screen's width and height (your sliding window dimensions)
const screenWidth = canvas.width;
const screenHeight = canvas.height;





let playerX = canvas.width / 2 - playerWidth / 2;
// let playerX = canvas.width / 2;

let playerY = canvas.height / 2 - playerHeight / 2;
// let playerY = canvas.height / 2;
// let screenX = 0;
// let screenY = 0;
const stopThreshold = 0;
const scale = 10;


//UI
function getUIPosition(uiElement) {
    const rect = uiElement.getBoundingClientRect();
    return {
        x: rect.left,
        y: rect.top,
    };
}

const exits =[];
const uiElementPositions = {};
    //elements position may seem relative to screen
    //but it is actually relative to the map
    //we need to set the position of the element relative to the map
    //and then draw it on the screen

// function drawChatBox(text) {
//     const chatbox_img = new Image();
//     const wpadding = 100;
//     const hpadding = 50;
//     const x = screenWidth - wpadding;
//     const y = screenHeight - hpadding;
//     const chatboxWidth = ScreenWidth - 2*wpadding;
//     const chatboxHeight = 100;
//     chatbox_img.src = 'public/pokemon_resources/chatbox.png';
//     chatbox_img.onload = () => {
//         ctx.drawImage(chatbox_img, x, y, chatboxWidth, chatboxHeight);
//         const text_x = x + wpadding/2;
//         const text_y = y + hpadding/2;
//         ctx.font = '18px Arial';
//         ctx.fillStyle = 'black';
//         ctx.fillText(text, text_x, text_y);
//     };
// }


// function interactTextUI(event, uiElement, interact_func=drawChatBox){
//     const filepath = uiElement.dataset.filepath;
//     const xhr = new XMLHttpRequest();
//     let counter = 0;
//     let lines = [];
//     // Your _interactTextUI function
//     const _interactTextUI = (event, lines) => {
//         console.log(lines);
//         if (event.key === 'x' && counter < lines.length) {
//             const line = lines[counter];
//             interact_func(line);
//             counter += 1;
//         }
//         else if (event.key === 'x' && counter >= lines.length) {
//             uiElement.removeEventListener("keydown", _interactTextUI); // Remove the event listener
//             uiElement.removeEventListener("keydown", interactTextUI); // Remove the event listener
            
//         }
//     };

//     xhr.open('GET', filepath, true);

//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4 && xhr.status === 200) {
//             const fileContent = xhr.responseText;
//             // Split the content by the delimiter (e.g., newline)
//             lines = fileContent.split('\n');
//             // Process each line
//             counter = 0;
//             window.addEventListener("keydown", _interactTextUI);
//         }
//     }
//     xhr.send();
// }

// Iterate through the UI elements in the uiContainer
Array.from(uiContainer.children).forEach((uiElement) => {
    const uiPosition = getUIPosition(uiElement);
    if(uiElement.value && uiElement.value === 'exit'){
        exits.push(uiElement.id);
    }
    // Store the UI element's position in the object with the element's id as the key
    uiElementPositions[uiElement.id] = uiPosition;
});

function pngToScreen(x, y, imageScale=scale, screenWidth=screenWidth, screenHeight=screenHeight) {
    // Calculate the scaled coordinates
    const scaledX = x * imageScale;
    const scaledY = y * imageScale;

    // Calculate the position on the screen
    const screenX = (screenWidth - scaledX) / 2;
    const screenY = (screenHeight - scaledY) / 2;

    // Return the screen coordinates as an object
    return { x: screenX, y: screenY };
}

//TEXT UI
let texts = [];
let text_counter = 0;
let isInteractingWithText = false;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


//USE TO SET PLAYER Initial Position wrt to map. Used to define drawX and drawY, where to draw the (0,0) 
//background image. so desired_ref_point = drawX, drawY
//since init_screen_player_pos = canvas.width/2 - playerWidth / 2, canvas.height/2 - playerHeigth / 2
//if exit is at img_coord = (x,y) in map, and we want exit to be at init_screen_player_pos
//then x = canvas.width/2 - playerWidth / 2 - img_coord.x, y = canvas.height/2 - playerHeigth / 2 - img_coord.y
const defaultSpawnPoint = uiElementPositions[exits[0]];
console.log(defaultSpawnPoint);
let spawnID = 'exit';

const defaultSpawnPointWidth = () =>{
    const uiElement = document.getElementById(exits[0]);
    return uiElement.offsetWidth;
}


const defaultSpawnPointHeight = () =>{
    const uiElement = document.getElementById(exits[0]);
    return uiElement.offsetHeight;
}


let initXUIRefPoint = defaultSpawnPoint.x;
let initYUIRefPoint =  defaultSpawnPoint.y;
let xUIRefPoint = initXUIRefPoint;
let yUIRefPoint = initYUIRefPoint;


//reupdate locations of ui wrt center of screen
for(const id in uiElementPositions){
    const pos = uiElementPositions[id];
    const uiElement = document.getElementById(id);
    
    const percentageShiftX = ((pos.x-xUIRefPoint) / (backgroundImage.width * scale));
    const percentageShiftY = ((pos.y- yUIRefPoint) / (backgroundImage.height * scale));
    console.log(`percentage : ${percentageShiftX}% ${percentageShiftY}%`)
    const offsetX = backgroundImage.width * scale * percentageShiftX;
    const offsetY = backgroundImage.height * scale * percentageShiftY;
    console.log(offsetX, offsetY);
    // const offsetX = pos.x - xUIRefPoint;
    // const offsetY = pos.y - yUIRefPoint;
    //edit this
    uiElementPositions[id] = {
        x : offsetX + canvas.width/2 - playerWidth/2,
        y :  offsetY + canvas.height/2 + playerHeight/2 //l
    }    

}

//main functions
characterImage.onload = () =>{ 
    backgroundImage.onload = () => {
        collisionMapImage.onload = () => {
            
            function drawBackground() {
                const zoomScale = scale;
                // Calculate the position and size of the zoomed background image
                const zoomedWidth = backgroundImage.width * zoomScale;
                const zoomedHeight = backgroundImage.height * zoomScale;

                // Calculate the position of the zoomed background image center
                //the addition and minus of player Width on exit kinda depends on the oreintation
                //but this is very expected behvaiour so we can hard code this
                const zoomedCenterX = xUIRefPoint + playerWidth /2;
                const zoomedCenterY = yUIRefPoint - playerHeight/2;
                
            
                // Calculate the draw position on the canvas to center the zoomed background image
                const drawX = canvas.width / 2 - zoomedCenterX;
                const drawY = canvas.height / 2 - zoomedCenterY;
                // Draw the zoomed background image
                    //backgroundImage: This is the image you want to draw. It should be an HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement.
                    // 0, 0: These two values specify the source position within the backgroundImage where the image data should be taken from. In this case, it starts from the top-left corner (coordinates 0,0) of the backgroundImage.
                    // backgroundImage.width, backgroundImage.height: These values specify the width and height of the source image region to be drawn. In your code, it means the entire backgroundImage will be used as the source.
                    // drawX, drawY: These are the destination coordinates on the canvas where the top-left corner of the source image will be drawn. drawX is the x-coordinate, and drawY is the y-coordinate.
                    // zoomedWidth, zoomedHeight: These values determine the width and height of the drawn image on the canvas. If these values are different from the source image's width and height, it can lead to scaling or resizing of the image when drawn on the canvas.
                ctx.drawImage(
                    backgroundImage, 
                    0, 0, 
                    backgroundImage.width, backgroundImage.height,
                    drawX, drawY, 
                    zoomedWidth, zoomedHeight);
                    
                // const prevStyle = ctx.fillStyle;
                // ctx.fillStyle = "black";
                // if(drawX <= canvas.height){
                //     ctx.fillRect(0, 0, drawX, canvas.height);

                // }
                // else{
                // ctx.fillRect(0, 0, canvas.height, drawX);

                // }
                // if(drawY <= canvas.width){
                //     ctx.fillRect(0, 0, drawY, canvas.width);

                // }
                // else{
                // ctx.fillRect(0, 0, canvas.width, drawY);

                // }
                // ctx.fillRect(0, 0, drawX, canvas.height);
                // ctx.fillRect(0, 0, canvas.width,drawY);
                // ctx.fillStyle = prevStyle;
                // const gridSize = 10;
                // for (let y = 0; y < canvas.height; y += gridSize) {
                //     ctx.moveTo(0, y);
                //     ctx.lineTo(canvas.width, y);
                //   }
                  
                //   // Draw vertical grid lines
                //   for (let x = 0; x < canvas.width; x += gridSize) {
                //     ctx.moveTo(x, 0);
                //     ctx.lineTo(x, canvas.height);
                //   }
                  
            }

            function drawCollisionMap(){
                const zoomScale = scale;

                // Calculate the position and size of the zoomed background image
                const zoomedWidth = collisionMapImage.width * zoomScale;
                const zoomedHeight = collisionMapImage.height * zoomScale;
            
                // Calculate the position of the zoomed background image center
                //the addition and minus of player Width on exit kinda depends on the oreintation
                //but this is very expected behvaiour so we can hard code this
                const zoomedCenterX = xUIRefPoint + playerWidth /2;
                const zoomedCenterY = yUIRefPoint - playerHeight/2;
                
            
                // Calculate the draw position on the canvas to center the zoomed background image
                const drawX = canvas.width / 2 - zoomedCenterX;
                const drawY = canvas.height / 2 - zoomedCenterY;
                // const drawX = initXUIRefPoint - zoomedCenterX;
                // const drawY = initYUIRefPoint - zoomedCenterY;
            
                // Draw the zoomed background image
                ctx.drawImage(
                    collisionMapImage, 
                    0, 0, 
                    collisionMapImage.width, collisionMapImage.height, 
                    drawX, drawY, 
                    zoomedWidth, zoomedHeight,
                    willReadFrequently=true,
                    );

            }

            function updateUIpositions(reverse = false) {
                for(let i = 0; i < uiContainer.children.length; i++){
                    if(!(uiContainer.children[i].id in uiElementPositions)){
                        const uiElement = uiContainer.children[i];
                        const uiPosition = getUIPosition(uiElement);
                        uiElementPositions[uiElement.id] = uiPosition;
                    }
                    else if(reverse){
                        const uiElement = uiContainer.children[i];
                        const _uiPosition = uiElementPositions[uiElement.id];
                        switch(currentOrientation){
                            case 'up':
                                _uiPosition.y -= playerSpeed;
                                break;
                            case 'down':
                                _uiPosition.y += playerSpeed;
                                break;
                            case 'left':
                                _uiPosition.x -= playerSpeed;
                                break;
                            case 'right':
                                _uiPosition.x += playerSpeed;
                                break;
                        }
                        uiElementPositions[uiElement.id] = _uiPosition;
                    }
                    else{
                        const uiElement = uiContainer.children[i];
                        const _uiPosition = uiElementPositions[uiElement.id];
                        switch(currentOrientation){
                            case 'up':
                                _uiPosition.y += playerSpeed;
                                break;
                            case 'down':
                                _uiPosition.y -= playerSpeed;
                                break;
                            case 'left':
                                _uiPosition.x += playerSpeed;
                                break;
                            case 'right':
                                _uiPosition.x -= playerSpeed;
                                break;
                        }
                        uiElementPositions[uiElement.id] = _uiPosition;
                    }
                }
            }   

            function drawUIElement(uiElement, x, y) {
                const img = new Image();
                img.src = uiElement.src;
                //current position of ui
                const width = uiElement.offsetWidth;
                const height = uiElement.offsetHeight;

                uiElement.style.top = `${y}px`;
                uiElement.style.left = `${x}px`;

                
                img.onload = () => {
                    ctx.drawImage(img, y, x, width, height);
                };
            }

            function drawUI() {
                // console.log('draw');
                const uiElements = uiContainer.children; //for now
                if (uiElements.length === 0) {
                    return; // No UI elements to draw
                }
                for(let i = 0; i < uiElements.length; i++){
                    const uiElement = uiElements[i];
                    const uiPosition = uiElementPositions[uiElement.id];
                    drawUIElement(uiElement, uiPosition.x, uiPosition.y);
                }
            }

            function drawChatBox(text) {
                const chatbox_img = new Image();
                const wpadding = 100;
                const hpadding = 50;
                const x = wpadding;
                const chatboxHeight = screenHeight/5;
                const chatboxWidth = screenWidth - 2*wpadding;
                const y = screenHeight - hpadding - chatboxHeight;
                chatbox_img.src = 'public/pokemon_resources/chatbox.png';
                chatbox_img.onload = () => {
                    ctx.drawImage(chatbox_img, x, y, chatboxWidth, chatboxHeight);
                    const text_x = x + wpadding/2;
                    const text_y = y + hpadding/2;
                    ctx.font = '48px MyCustomFontv1';
                    ctx.fillStyle = 'black';
                    ctx.fillText(text, text_x, text_y);
                };
                ctx.drawImage(chatbox_img, x, y, chatboxWidth, chatboxHeight);
                const text_x = x + wpadding;
                const text_y = y + hpadding*2;
                ctx.font = 'MyCustomFontv1';
                ctx.fillStyle = 'black';
                ctx.fillText(text, text_x, text_y);
            }


            function drawTextInChatBox(text) {
                const wpadding = 100;
                const hpadding = 50;
                const x = screenWidth - wpadding;
                const y = screenHeight - hpadding;
                const text_x = x + wpadding/2;
                const text_y = y + hpadding/2;
                ctx.font = 'Arial';
                ctx.fillStyle = 'black';
                ctx.fillText(text, text_x, text_y);
            }
            
            function drawPlayer() {
                // calculate offset for sprite
                const orientation = orientation_map[currentOrientation];
                const spriteWidth = characterImage.width / player_sprite_count;
                const spriteHeight = characterImage.height;
                const spriteX = spriteWidth * (orientation * 3 + movementCount) ;
                const spriteY = 0;
                ctx.drawImage(characterImage, spriteX, spriteY, spriteWidth, spriteHeight, playerX, playerY, playerWidth, playerHeight);
                var x1 = playerX;
                var y1 = playerY;
                var x2 = playerX + playerWidth;
                var y2 = playerY + playerHeight;
                // Define the stroke color
                ctx.strokeStyle = "blue"; // You can use other CSS color values
          
                // Define the line width
                ctx.lineWidth = 2;
          
                // Draw the rectangular border
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                // ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                // ctx.drawImage(characterImage, spriteX, spriteY, spriteWidth, spriteHeight, xUIRefPoint, yUIRefPoint, playerWidth, playerHeight);
            }

            function clearCanvas() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            // let lastFrameTime = 0;
            function updateGameArea(timestamp) {
                // if (timestamp - lastFrameTime >= frameDelay) {
                clearCanvas();
                    
                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                
                drawBackground(); // Draw the background image first
                
                ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                drawCollisionMap();

                ctx.globalCompositeOperation = "source-over"; // Set composite operation back to "source-over" for drawing the player
                // drawPlayer(); // Draw the player on top of the collision map
                drawUI();                
                // Draw the player
                drawPlayer();
                if(isInteractingWithText && text_counter < texts.length){
                    drawChatBox(texts[text_counter]);
                    // console.log(texts[text_counter]);
                }

                    // lastFrameTime = timestamp;
                // }
                requestAnimationFrame(updateGameArea);
                // setTimeout(updateGameArea, frameDelay);
            }

            function hit_Exit(x,y, proximityRange = collisionProximity ){
                    // Check collision with UI elements
                if (exits.length === 0) {
                    return false; // No UI elements to check for collision with
                }
                for (const id of exits) {
                    const uiElement = document.getElementById(id);
                    // const uiPosition = uiElementPositions[uiElement.id];
                    const uiPosition = getUIPosition(uiElement);
                    const uiLeft = uiPosition.x;
                    const uiRight = uiPosition.x + uiElement.offsetWidth;
                    const uiTop = uiPosition.y;
                    const uiBottom = uiPosition.y + uiElement.offsetHeight;
                    
                    const playerL = x;
                    const playerR = x + playerWidth;
                    const playerT = y;
                    const playerB = y + playerHeight;
                    // Define the proximity range for UI collision
                    const proximity = proximityRange;
                    console.log('ui : ',uiLeft,uiTop, uiRight, uiBottom);
                    console.log('player : ', playerL, playerT, playerR, playerB)
            
                    // Check if the player's bounding box overlaps with the UI element considering proximity
                    switch (currentOrientation) {
                        case 'up':
                          // Check if the player's top border collides with the UI's bottom border and they are aligned horizontally
                          if (playerT - proximity <= uiBottom && playerT >= uiBottom && playerL >= uiLeft && playerR <= uiRight) {
                            return true; // Collision detected
                          }
                          return false;
                      
                        case 'down':
                          // Check if the player's bottom border collides with the UI's top border and they are aligned horizontally
                          if (playerB + proximity >= uiTop && playerB <= uiTop && playerL >= uiLeft && playerR <= uiRight) {
                            return true; // Collision detected
                          }
                          return false;
                      
                        case 'left':
                          // Check if the player's left border collides with the UI's right border and they are aligned vertically
                          if (playerL - proximity <= uiRight && playerL >= uiRight && playerT >= uiTop && playerB <= uiBottom) {
                            return true; // Collision detected
                          }
                          return false;
                      
                        case 'right':
                          // Check if the player's right border collides with the UI's left border and they are aligned vertically
                          if (playerR + proximity >= uiLeft && playerR <= uiLeft && playerT >= uiTop && playerB <= uiBottom) {
                            return true; // Collision detected
                          }
                          return false;
                      
                        default:
                          return false;
                      }
                }
                return false; // No 
            }

            function isCollision(x, y, width, height) {
                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                drawCollisionMap();
                
                ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                drawBackground(); // Draw the background image first
                switch(currentOrientation){
                    case 'up':
                        //check collision of upper border
                        for(let i =0; i < width; i++){
                            const pixelData = ctx.getImageData(x + i, y, 1, 1).data;
                            // Customize this check based on the color of your walls in the collision map image
                            if (pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0) {
                                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                    
                                drawBackground(); // Draw the background image first
                                
                                ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                                drawCollisionMap(); // Draw the collision map on top of the background image
    
                                ctx.globalCompositeOperation = "source-over"; // Set composite operation back to "source-over" for drawing the player
                                drawPlayer(); // Draw the player on top of the collision map
                                return true; // Collision detected at any point within the player's area
                            }
                        }
                        ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                
                        drawBackground(); // Draw the background image first
                        
                        ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                        drawCollisionMap();
                        return false;

                    case 'down':
                        //check collision of lower border
                        for(let i =0; i < width; i++){
                            const pixelData = ctx.getImageData(x + i, y + height , 1, 1).data;
                            // Customize this check based on the color of your walls in the collision map image
                            if (pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0) {
                                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                    
                                drawBackground(); // Draw the background image first
                                
                                ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                                drawCollisionMap(); // Draw the collision map on top of the background image
    
                                ctx.globalCompositeOperation = "source-over"; // Set composite operation back to "source-over" for drawing the player
                                drawPlayer(); // Draw the player on top of the collision map
                                return true; // Collision detected at any point within the player's area
                            }
                        }
                        ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
            
                        drawBackground(); // Draw the background image first
                        
                        ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                        drawCollisionMap();
                        return false;

                    case 'left':
                        //check collision of upper border
                        for(let i = 0; i < height; i++){
                            const pixelData = ctx.getImageData(x, y + i, 1, 1).data;
                            // Customize this check based on the color of your walls in the collision map image
                            if (pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0) {
                                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                    
                                drawBackground(); // Draw the background image first
                                
                                ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                                drawCollisionMap(); // Draw the collision map on top of the background image
    
                                ctx.globalCompositeOperation = "source-over"; // Set composite operation back to "source-over" for drawing the player
                                drawPlayer(); // Draw the player on top of the collision map
                                return true; // Collision detected at any point within the player's area
                            }
                        }
                        ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
        
                        drawBackground(); // Draw the background image first
                        
                        ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                        drawCollisionMap();

                        return false;
                    
                    case 'right':
                        //check collision of upper border
                        for(let i = 0; i < height; i++){
                            const pixelData = ctx.getImageData(x + width, y + i, 1, 1).data;
                            // Customize this check based on the color of your walls in the collision map image
                            if (pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0) {
                                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                    
                                drawBackground(); // Draw the background image first
                                
                                ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                                drawCollisionMap(); // Draw the collision map on top of the background image
    
                                ctx.globalCompositeOperation = "source-over"; // Set composite operation back to "source-over" for drawing the player
                                drawPlayer(); // Draw the player on top of the collision map
                                return true; // Collision detected at any point within the player's area
                            }
                        }
                        ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
        
                        drawBackground(); // Draw the background image first
                        
                        ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                        drawCollisionMap();

                        return false;
                    
                    default:
                        return false;
                }
            }

            function calculateScreenPosition() {
                const zoomScale = scale;
                screenX = yUIRefPoint - canvas.width / (2 * zoomScale); // Adjust for zoom
                screenY = xUIRefPoint - canvas.height / (2 * zoomScale); // Adjust for zoom
                
                // screenX = yUIRefPoint - initYUIRefPoint / (2*zoomScale);
                // screenY = xUIRefPoint = initXUIRefPoint / (2*zoomScale)
                // // Adjust the boundaries for stopping the window
                // if (screenX <= stopThreshold) {
                //     screenX = 0;
                // }
                // if (screenX >= backgroundImage.width * 2 - screenWidth - stopThreshold) {
                //     screenX = backgroundImage.width * 2 - screenWidth;
                // }
                // if (screenY <= stopThreshold) {
                //     screenY = 0;
                // }
                // if (screenY >= backgroundImage.height - screenHeight - stopThreshold) {
                //     screenY = backgroundImage.height - screenHeight;
                // }
            }

            window.addEventListener("keydown", async (event) => {

                

                let newX = xUIRefPoint;
                let newY = yUIRefPoint;
                let _movement_count = movementCount;
                // if player interacting with text
                if (isInteractingWithText && event.key === 'x') {
            
                    if (text_counter < texts.length) {
                        text_counter += 1;
                    } else {
                        // Reset the text interaction state
                        isInteractingWithText = false;
                        text_counter = 0;
                        texts = [];
                    }
                }
                else if (event.key === "ArrowLeft") {
                    newX -= playerSpeed;
                    currentOrientation = "left";
                    if(previousOrientation !== currentOrientation){
                        _movement_count = 0;
                    }

                } else if (event.key === "ArrowRight") {
                    newX += playerSpeed;
                    currentOrientation = "right";
                    if(previousOrientation !== currentOrientation){
                        _movement_count = 0;
                    }

                } else if (event.key === "ArrowUp") {
                    newY -= playerSpeed;
                    currentOrientation = "up";
                    if(previousOrientation !== currentOrientation){
                        _movement_count = 0;
                    }
                } else if (event.key === "ArrowDown") {
                    newY += playerSpeed;
                    currentOrientation = "down";
                    if(previousOrientation !== currentOrientation){
                        _movement_count = 0;
                    }

                }
                else if (event.key === 'x') {
                    await sleep(300);

                    // Loop through the children of the UI container and check if the player is facing them and within proximity
                    playerPosition = {x : playerX, y : playerY};
                    for (let i = 0; i < uiContainer.children.length; i++) {
                        const uiElement = uiContainer.children[i];
                        const uiPosition = getUIPosition(uiElement);
                        const xDistance = playerPosition.x - uiPosition.x;
                        const yDistance = playerPosition.y - uiPosition.y;
                        
                        // Calculate the absolute values of xDistance and yDistance
                        const absXDistance = Math.abs(xDistance);
                        const absYDistance = Math.abs(yDistance);
                        
                        // Determine if the UI is to the left/right/up/down of the player
                        let uiDirection = '';
                        if (absXDistance > absYDistance) {
                            if (xDistance < 0) {
                                uiDirection = 'right';
                            } else {
                                uiDirection = 'left';
                            }
                        } else {
                            if (yDistance < 0) {
                                uiDirection = 'down';
                            } else {
                                uiDirection = 'up';
                            }
                        }

                        // Check if the player is facing the UI
                        if (currentOrientation === uiDirection && 
                            absXDistance <= proximityDistance && 
                            absYDistance <= proximityDistance) {
                            


                            // Perform the interaction for the UI element
                            // interactTextUI(event, uiElement);
                            const filepath = uiElement.dataset.filepath;
                            if(filepath){
                                const xhr = new XMLHttpRequest();

                                xhr.open('GET', filepath, true);
                    
                                xhr.onreadystatechange = function () {
                                    if (xhr.readyState === 4 && xhr.status === 200) {
                                        const fileContent = xhr.responseText;
                                        // Split the content by the delimiter (e.g., newline)
                                        const lines = fileContent.split('\n');
                                        for(let i = 0; i < lines.length; i++){
                                            if(lines[i] !== ''){
                                                texts.push(lines[i]);
                                            }
                                        }
                                        isInteractingWithText = true;
                                        text_counter = 0;
                                    }
                                };
                                xhr.send();
                        }
                    }
                    }
                }
                else{
                    return;
                }
                calculateScreenPosition();
                previousOrientation = currentOrientation;
                
                //handle exit
                const exit = hit_Exit(playerX, playerY);
                console.log(exit);
                if(exit){
                    // console.log('hit exit');
                    window.location.href = './page2.html';

                }
                
                
                //handle collision
                const collision = isCollision(playerX, playerY,playerWidth,playerHeight);
                    (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight')
                const moved = (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight');
                if (!collision && moved ) {
                    updateUIpositions();
                    xUIRefPoint = newX;
                    yUIRefPoint = newY;
                    movementCount = _movement_count;
                    movementCount += 1;
                    movementCount %= no_of_frames;
                    updateGameArea();
                }

                else if(collision && moved){ //handle collision
                    updateUIpositions(reverse = true);
                    switch(currentOrientation){
                        case 'up':
                            yUIRefPoint += playerSpeed;
                            updateGameArea();
                            break;
                        case 'down':
                            yUIRefPoint -= playerSpeed;
                            updateGameArea();

                            break;
                        case 'left':
                            xUIRefPoint += playerSpeed;
                            updateGameArea();

                            break;
                        case 'right':
                            xUIRefPoint -= playerSpeed;
                            updateGameArea();

                            break;
                        default:
                            break;
                    }
                    
                }

            });

            requestAnimationFrame(updateGameArea);
        };
    };
}


