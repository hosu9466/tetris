const scoreDom = document.querySelector(".score");
const timeDom = document.querySelector(".time");
const nextBlockDom = document.querySelector(".nextBlock");
const palyGroundDom = document.querySelector(".palyGround");
const mapDom = document.querySelector(".map");
const gameOverDo = document.querySelector(".gameOver");
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
let score = 0;
let time = 0;
let nextBlockLi = nextBlockDom.querySelectorAll("li");
let mapBlockLi = mapDom.querySelectorAll("li");
let nextBlock;
let mapBlock;
var gameOver = false;
var timeIdentifier;

alert(
`PC버전
    방향키로 블록 제어
    위쪽: 회전, 아래쪽: 가속, 왼쪽: 왼쪽 이동, 오른쪽: 오른쪽 이동
    스페이스: 아래로 바닥까지 블록 이동

모바일버전(안드로이드 크롬)
    화면을 기울여 블록 제어
    앞쪽: 회전, 뒤쪽: 가속, 왼쪽: 왼쪽 이동, 오른쪽: 오른쪽 이동`);

init();


//키보드 입력 이벤트 핸들러
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
            if(!moveBlock(0,1)) makeNextBlock();
            break;
        case 32: //space
            dropBlock();
            break;
    }
}


//게임 시작시 초기화
function init(){
    score = 0;
    scoreDom.innerHTML = `${score} 점`;
    time = 0;
    timeDom.innerHTML = `${time} 초`;
    while ( nextBlockDom.hasChildNodes() ) { nextBlockDom.removeChild( nextBlockDom.firstChild ); }
    while ( mapDom.hasChildNodes() ) { mapDom.removeChild( mapDom.firstChild ); }
    
    for(let i = 0; i<nextBlockSize; i++){
        let li = document.createElement("li");
        nextBlockDom.appendChild(li);
    }
    for(let i = 0; i<mapBlockSize; i++){
        let li = document.createElement("li");
        mapDom.appendChild(li);
    }
    nextBlockLi = nextBlockDom.querySelectorAll("li");
    mapBlockLi = mapDom.querySelectorAll("li");
}


//랜덤하게 블록을 만든다.
function makeBlock(){
    return {
        'color' : "#" + Math.round(0x100000 + Math.random() * 0xefffff).toString(16),
        'xPos' : 3,
        'yPos' : 0,
        'form' : blockForms[Math.floor(Math.random()*blockForms.length)]
    };
}


//다음 블록에 오는 블록을 새 블록으로 바꾸어 랜더링
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

//block객체의 정보대로 map에 랜더링
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


//map에서 해당 블록을 제거한 후 랜더링
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

//block이 map에서 다른 블록이랑 겹치는지 체크. 만약 겹치면 false리턴
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


function deepCopy(block) { 
    let result = []; 
    for (let b of block) result.push(b);
    return result; 
}


//block을 시계방향으로 회전한 후 랜더링
function rotateBlock(){
    removeRenderOnMap(mapBlock);
    let preForm = deepCopy(mapBlock['form']);
    mapBlock['form'] = mapBlock['form'][0].map((_, colIndex) => mapBlock['form'].map(row => row[colIndex]).reverse());
    if(!checkNextPosition(mapBlock)) mapBlock['form'] = preForm;
    blockRenderOnMap(mapBlock);
}


//block을 xPos만큼 cloumn을 바꾸고 yPos만큼 row를 바꾸어 랜더링
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


//block을 바닥까지 내려보낸다.
function dropBlock(){
    while(moveBlock(0,1)){}
    makeNextBlock();
}


//현재 블록이 더 움직일 여자기 없을 경우 움직일 블록으로 다음 블록을 불러온다.
function makeNextBlock(){
    if(gameOver) return;
    mapBlock = nextBlock;
    checkRowFull();
    nextBlock = makeBlock();
    nextBlockChange(nextBlock);
    if(!checkNextPosition(mapBlock)) {
        gameOver = true;
        gameOverDo.style.display = "block";
        clearTimeout(timeIdentifier);
    }
    else blockRenderOnMap(mapBlock);
}


//map에서 가득찬 row가 있는지 체크하고 있으면 제거한 후 위 블록을 한칸씩 당긴다.
function checkRowFull(){
    let cnt;
    for(let i=0; i<mapBlockLi.length; i++){
        if(i%mapColumnSize===0) cnt = 0;
        if (mapBlockLi[i].style.backgroundColor!=='white'&&mapBlockLi[i].style.backgroundColor){
            cnt++;
        }
        if(cnt===mapColumnSize){
            score += mapColumnSize;
            for(let j=i; j>mapColumnSize; j--){
                mapBlockLi[j].style.backgroundColor=mapBlockLi[j-mapColumnSize].style.backgroundColor
            }
            scoreDom.innerHTML = score+' 점';
        }
    }
}

//시작 버튼에 대응하는 함수
function gameStart(){
    init();
    gameOverDo.style.display = "none";
    gameOver = false;
    console.log("start");
    nextBlock = makeBlock();
    nextBlockChange(nextBlock);
    mapBlock = makeBlock();
    setInterval(()=>{
        if(!moveBlock(0,1)) makeNextBlock();
        time++;
        timeDom.innerHTML = `${time} 초`;
    },1000);
    blockRenderOnMap(mapBlock);
}