const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let playButton = document.getElementById("play-btn");
//info for play button and click/drag events sourced from w3schools.com
let playState = false;

let mousePos = null;

//slider info
let slider = document.getElementById("slider");
let sliderTxt = document.getElementById("slider-text");

//change text content on initial document load
sliderTxt.textContent = slider.value;
slider.oninput = () => {
    sliderTxt.textContent = slider.value;
    parseSliderValue(slider.value)
}

function parseSliderValue(sliderValue) {
    let tPercentage = sliderValue / 10;
    
    //sets speed to a fraction of slider value

    tPercentage = tPercentage * 0.1;
    ball.speed = tPercentage;
}

function playButtonText() {
    if(ball.x === points[3].x && ball.y === points[3].y){
        playButton.textContent = "Restart Animation";
        slider.disabled = false;
    }
}

let ball = {x:20,y:20,speed:0.1,t:0,radius:20};

let points = [
    {x:ball.x,y:ball.y},
    {x:40,y:280},
    {x:160,y:360},
    {x:400,y:250} 
]
let posRadius = 7;
let pointToMove = null;

let isClickDown = false; //variables are established to allow for points to be dragged

function moveBallInBezierCurve() {
    let [p0, p1, p2, p3] = points;
    //find coefficients based on balls current position
    let cx = 3 * (p1.x - p0.x);
    let bx = 3 * (p2.x - p1.x) - cx;
    let ax = p3.x - p0.x - cx - bx;

    let cy = 3 * (p1.y - p0.y);
    let by = 3 * (p2.y - p1.y) - cy;
    let ay = p3.y - p0.y - cy -by;

    let t = ball.t;

    //adjust for speed value
    ball.t += ball.speed;
    //find new x and y positions
    let xt = ax*(t*t*t) + bx*(t*t) + cx*t + p0.x;
    let yt = ay*(t*t*t) + by*(t*t) + cy*t + p0.y;

    if(ball.t > 1){
        ball.t=1;
    }

    //draw ball in desired location
    ball.x = xt;
    ball.y = yt;
    drawBall();
}

function moveBallBack() { //this method mirrors the previous method, but reverses some of the inputs to create a closed curve
    //this method 
    let [p3, p1, p2, p0] = points;
    //find coefficients based on balls current position
    let cx = 3 * (p1.y - p3.y);
    let bx = 3 * (p2.y - p1.y) - cx;
    let ax = p0.x - p3.x - cx - bx;

    let cy = 3 * (p1.x - p3.x);
    let by = 3 * (p2.x - p1.x) - cy;
    let ay = p0.y - p3.y - cy -by;

    let t = ball.t;

    //adjust for speed value
    ball.t += ball.speed;
    //find new x and y positions
    let xt = ax*(t*t*t) + bx*(t*t) + cx*t + p3.x;
    let yt = ay*(t*t*t) + by*(t*t) + cy*t + p3.y;

    if(ball.t > 1){
        ball.t=1;
    }

    //draw ball in desired location
    ball.x = xt;
    ball.y = yt;
    drawBall();
}

function drawBall() {
    ctx.fillStyle = "cornflowerblue";
    ctx.beginPath();
    ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI * 2,false);
    ctx.fill();
}

//NOTE: the ball is always drawn correctly on the first part of the piecewise cubic, but the ball sometimes deviates
//on the second part if the control points are in certain positions

//draws points and their coordinates to canvas
function drawPoints() {
    ctx.fillStyle = "brown";
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x,point.y,posRadius,0,Math.PI * 2,false);
        ctx.fill();
        //Deal with text
        ctx.font = "12px Montserrat";
        ctx.fillText(`(${point.x},${point.y})`,point.x,point.y+30);
    });
}

//assists in mouse detection
//clickdrag methods are aided by w3schools.com
function isMouseOverPoint(point) {
    let dx = mousePos.x-point.x;
    let dy = mousePos.y-point.y;
    return(dx*dx+dy*dy<posRadius*posRadius);
}

function checkIfCursorInPoint(){
    if(mousePos && isClickDown && !pointToMove){
        points.forEach(point => {
            if(isMouseOverPoint(point)){
                pointToMove = point;
            }
        })
    }
}

function movePoint() {
    if(pointToMove === points[0]){
        points[0].x = mousePos.x;
        points[0].y = mousePos.y;
        ball.x = mousePos.x;
        ball.y = mousePos.y;
        return
    }
    let pointIndex = points.indexOf(pointToMove);
    points[pointIndex].x = mousePos.x;
    points[pointIndex].y = mousePos.y;
}

function drawLine() {
    ctx.beginPath();
    ctx.setLineDash([2, 6]);
    ctx.moveTo(points[0].x,points[0].y);
    ctx.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
    ctx.stroke();
    ctx.moveTo(points[3].x,points[3].y);
    ctx.bezierCurveTo(points[2].y, points[2].x, points[1].y, points[1].x, points[0].x, points[0].y);
    ctx.stroke();
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    playButtonText();
    
    if(!playState){
        drawBall();
    }else{
        moveBallInBezierCurve();
        moveBallBack();
    }
    if(!slider.disabled) checkIfCursorInPoint();
    if(pointToMove) movePoint();
    if(!slider.disabled) drawLine();
    //draw points last so they will be above
    if(!slider.disabled) drawPoints();
}

animate();

//the following methods aid in the implementation of the button
//the button facilitates the start and restart of the animation
//I learned about the implementation of these methods from W3Schools.com

playButton.addEventListener("click", () => {
    playState = true;
    slider.disabled = true;
    if(ball.x === points[3].x && ball.y === points[3].y){
        ball.t = 0;
        ball.x = points[0].x;
        ball.y = points[0].y;
        playButton.textContent = "Play Animation";
    }
});

canvas.addEventListener("mousemove", e => {

    mousePos = {
        x: e.clientX - canvas.offsetLeft,
        y: (e.clientY - canvas.offsetTop) + scrollY
    }
});

canvas.addEventListener("mousedown", () => {
    isClickDown = true;
});

canvas.addEventListener("mouseup", () => {
    isClickDown = false;
    pointToMove = null;
});

parseSliderValue(slider.value); //set speed on load