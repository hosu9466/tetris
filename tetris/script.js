const scoreQuery = document.querySelector(".score");
const timeQuery = document.querySelector(".time");
const nextBlockQuery = document.querySelector(".nextBlock");
const palyGroundQuery = document.querySelector(".palyGround");
const mapQuery = document.querySelector(".map");
const nextBlockSize = 16;
const mapLowSize = 10;
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

init();

window.onkeydown = (e) => {
    console.log(e);
    switch(e.keyCode){
        case 32: //space
            rotateBlock();
            break;
        case 37: //left
            moveBlock(-1);
            break;
        case 39: //right
            moveBlock(1);
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
    for(let low of block["form"]){
        index = rowIndex*4;
        for(let isFull of low){
            if (isFull===1){
                nextBlockLi[index].style.backgroundColor = block['color'];
            }
            else{
                nextBlockLi[index].style.backgroundColor = 'white';
            }
            index += 1;
        }
        rowIndex += 1;
    }
}
function blockRenderOnMap(block){
    let index = 0;
    let rowIndex = 0;
    for(let low of block["form"]){
        index = block['xPos']+mapColumnSize*(block['yPos']+rowIndex);
        for(let isFull of low){
            if (isFull===1){
                if (mapBlockLi[index].style.backgroundColor!=='white') gameOver = true;
                mapBlockLi[index].style.backgroundColor = block['color'];
            }
            index += 1;
        }
        rowIndex += 1;
    }
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


function rotateBlock(){
    removeRenderOnMap(mapBlock);
    mapBlock['form'] = mapBlock['form'].map((_, colIndex) => mapBlock['form'].map(row => row[3-colIndex]));
    blockRenderOnMap(mapBlock);
}

function moveBlock(xPos){
    removeRenderOnMap(mapBlock);
    mapBlock['xPos'] = Math.max(1,mapBlock['xPos']+xPos);
    mapBlock['xPos'] = Math.min(mapColumnSize-4,mapBlock['xPos']+xPos);
    
    blockRenderOnMap(mapBlock);
}


function gameStart(){
    init();
    console.log("start");
    nextBlock = makeBlock();
    console.log(nextBlock);
    nextBlockChange(nextBlock);
    mapBlock = makeBlock();
    console.log(mapBlock);
    console.log(blockRenderOnMap(mapBlock));
}