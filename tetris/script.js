const scoreQuery = document.querySelector(".score");
const timeQuery = document.querySelector(".time");
const nextBlockQuery = document.querySelector(".nextBlock");
const palyGroundQuery = document.querySelector(".palyGround");
const mapQuery = document.querySelector(".map");
const gameOverQuery = document.querySelector(".gameOver");
const nextBlockSize = 16;
const mapLowSize = 15;
const mapColumnSize = 10;
const mapBlockSize = mapLowSize*mapColumnSize;
const blockForms = [
    [[1,1,0],[0,1,1]],
    [[0,1,1],[1,1,0]],
    [[1,1,1],[0,0,1]],
    [[1,1,1],[1,0,0]],
    [[1,1],[1,1]],
    [[0,1,0],[1,1,1]],
    [[1,1,1,1]],
];
let nextBlockLi = nextBlockQuery.querySelectorAll("li");
let mapBlockLi = mapQuery.querySelectorAll("li");
let nextBlock;
let mapBlock;
let gameOver = false;
let timeIdentifier;
init();

window.onkeydown = (e) => {
    console.log(e);
    if(!mapBlock||gameOver) return;
    switch(e.keyCode){
        case 38: //up
            rotateBlock();
            break;
        case 37: //left
            moveBlock(-1,0);
            break;
        case 39: //right
            moveBlock(1,0);
            break;
        case 40: //down
            dropBlock();
            break;
    }
}

function init(){
    while ( nextBlockQuery.hasChildNodes() ) { nextBlockQuery.removeChild( nextBlockQuery.firstChild ); }
    while ( mapQuery.hasChildNodes() ) { mapQuery.removeChild( mapQuery.firstChild ); }
    
    for(let i = 0; i<nextBlockSize; i++){
        let li = document.createElement("li");
        nextBlockQuery.appendChild(li);
    }
    for(let i = 0; i<mapBlockSize; i++){
        let li = document.createElement("li");
        mapQuery.appendChild(li);
    }
    nextBlockLi = nextBlockQuery.querySelectorAll("li");
    mapBlockLi = mapQuery.querySelectorAll("li");
}

function makeBlock(){
    return {
        'color' : "#" + Math.round(0x100000 + Math.random() * 0xefffff).toString(16),
        'xPos' : 3,
        'yPos' : 0,
        'form' : blockForms[Math.floor(Math.random()*blockForms.length)]
    };
}

function nextBlockChange(block){
    let index = 0;
    let rowIndex = 0;
    for(let i=0; i<16; i++){
        nextBlockLi[i].style.backgroundColor = 'white'
    }
    for(let low of block["form"]){
        index = rowIndex*4;
        for(let isFull of low){
            if (isFull===1){
                nextBlockLi[index].style.backgroundColor = block['color'];
            }
            index += 1;
        }
        rowIndex += 1;
    }
}
function blockRenderOnMap(block){
    let index = 0;
    let rowIndex = 0;
    let flag = true;
    for(let low of block["form"]){
        index = block['xPos']+mapColumnSize*(block['yPos']+rowIndex);
        for(let isFull of low){
            if (isFull===1){
                if (mapBlockLi[index].style.backgroundColor!=='white'&&mapBlockLi[index].style.backgroundColor) flag = false;
                mapBlockLi[index].style.backgroundColor = block['color'];
            }
            index += 1;
        }
        rowIndex += 1;
    }
    return flag;
}

function removeRenderOnMap(block){
    let index = 0;
    let rowIndex = 0;
    for(let low of block["form"]){
        index = block['xPos']+mapColumnSize*(block['yPos']+rowIndex);
        for(let isFull of low){
            if (isFull===1){
                mapBlockLi[index].style.backgroundColor = 'white';
            }
            index += 1;
        }
        rowIndex += 1;
    }
}
function checkNextPosition(block){
    let index = 0;
    let rowIndex = 0;
    let flag = true;
    for(let low of block["form"]){
        index = block['xPos']+mapColumnSize*(block['yPos']+rowIndex);
        for(let isFull of low){
            if (isFull===1&&mapBlockLi[index].style.backgroundColor!=='white'&&mapBlockLi[index].style.backgroundColor) flag = false;
            index += 1;
        }
        rowIndex += 1;
    }
    return flag;
}


function rotateBlock(){
    removeRenderOnMap(mapBlock);
    console.log(mapBlock['form'] );
    mapBlock['form'] = mapBlock['form'][0].map((_, colIndex) => mapBlock['form'].map(row => row[colIndex]).reverse());
    console.log(mapBlock['form'] );
    blockRenderOnMap(mapBlock);
}

function moveBlock(xPos,yPos){
    let prePosition = [mapBlock['xPos'],mapBlock['yPos']];
    let flag = true;
    removeRenderOnMap(mapBlock);
    if(mapBlock['xPos']+xPos>=0 && mapBlock['xPos']+xPos<=mapColumnSize-mapBlock['form'][0].length){
        mapBlock['xPos'] = mapBlock['xPos']+xPos;
    }
    if(mapBlock['yPos']+yPos>=0 && mapBlock['yPos']+yPos<=mapLowSize-mapBlock['form'].length){
        mapBlock['yPos'] = mapBlock['yPos']+yPos;
    }
    else flag = false;
    if(!checkNextPosition(mapBlock)){
        flag = false;
        mapBlock['xPos'] = prePosition[0];
        mapBlock['yPos'] = prePosition[1];
    }
    blockRenderOnMap(mapBlock);
    return flag;
}

function dropBlock(){
    while(moveBlock(0,1)){}
    makeNextBlock();
}


function makeNextBlock(){
    if(gameOver) return;
    mapBlock = nextBlock;
    checkRowFull();
    nextBlock = makeBlock();
    nextBlockChange(nextBlock);
    if(!checkNextPosition(mapBlock)) {
        gameOver = true;
        gameOverQuery.style.display = "block";
        clearTimeout(timeIdentifier);
    }
    else blockRenderOnMap(mapBlock);
}

function checkRowFull(){
    let cnt;
    for(let i=0; i<mapBlockLi.length; i++){
        if(i%mapColumnSize===0) cnt = 0;
        if (mapBlockLi[i].style.backgroundColor!=='white'&&mapBlockLi[i].style.backgroundColor){
            cnt++;
        }
        if(cnt===mapColumnSize){
            for(let j=i; j>mapColumnSize; j--){
                mapBlockLi[j].style.backgroundColor=mapBlockLi[j-mapColumnSize].style.backgroundColor
            }
        }
    }
}

function gameStart(){
    init();
    gameOverQuery.style.display = "none";
    gameOver = false;
    console.log("start");
    nextBlock = makeBlock();
    console.log(nextBlock);
    nextBlockChange(nextBlock);
    mapBlock = makeBlock();
    setInterval(()=>{
        if(!moveBlock(0,1)) makeNextBlock();
    },1000);
    console.log(mapBlock);
    console.log(blockRenderOnMap(mapBlock));
}