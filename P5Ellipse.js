//CREDIT: week 7 demo 4 is referenced for camera implementation
//CREDIT: my own P4 is implemented in 3D
function setup() {
    var cameraCanvas = document.getElementById('cameraCanvas');
    var cameraContext = cameraCanvas.getContext('2d');
    var slider1 = document.getElementById('slider1');
    slider1.value = 0;
    var slider2 = document.getElementById('slider2');
    slider2.value = 15;

    var context = cameraContext; 

    function moveToTx(loc,Tx)
        {var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.moveTo(res[0],res[1]);}
    
    function lineToTx(loc,Tx)
        {var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.lineTo(res[0],res[1]);}

    let ball = {x:20,y:20,speed:0.1,t:0,radius:20};
      
    function draw3DAxes(color,TxU,scale) {
        var Tx = mat4.clone(TxU);
        mat4.scale(Tx,Tx,[scale,scale,scale]);

        context.strokeStyle=color;
	    context.beginPath();
	    // Axes
	    moveToTx([1.2,0,0],Tx);lineToTx([0,0,0],Tx);lineToTx([0,1.2,0],Tx);
        moveToTx([0,0,0],Tx);lineToTx([0,0,1.2],Tx);
	    // Arrowheads
	    moveToTx([1.1,.05,0],Tx);lineToTx([1.2,0,0],Tx);lineToTx([1.1,-.05,0],Tx);
	    moveToTx([.05,1.1,0],Tx);lineToTx([0,1.2,0],Tx);lineToTx([-.05,1.1,0],Tx);
      	moveToTx([.05,0,1.1],Tx);lineToTx([0,0,1.2],Tx);lineToTx([-.05,0,1.1],Tx);
	    // X-label
	    moveToTx([1.3,-.05,0],Tx);lineToTx([1.4,.05,0],Tx);
	    moveToTx([1.3,.05,0],Tx);lineToTx([1.4,-.05,0],Tx);
        // Y-label
        moveToTx([-.05,1.4,0],Tx);lineToTx([0,1.35,0],Tx);lineToTx([.05,1.4,0],Tx);
        moveToTx([0,1.35,0],Tx);lineToTx([0,1.28,0],Tx);
	    // Z-label
	    moveToTx([0,-.05,1.3],Tx);
	    lineToTx([0,.05,1.3],Tx);
	    lineToTx([0,-.05,1.4],Tx);
	    lineToTx([0,.05,1.4],Tx);

	    context.stroke();
	}

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    var Hermite = function(t) {
	    return [
		2*t*t*t-3*t*t+1,
		t*t*t-2*t*t+t,
		-2*t*t*t+3*t*t,
		t*t*t-t*t
	    ];
	}

    var HermiteDerivative = function(t) {
        return [
        6*t*t-6*t,
        3*t*t-4*t+1,
        -6*t*t+6*t,
        3*t*t-2*t
        ];
    }

	function Cubic(basis,P,t){
	    var b = basis(t);
	    var result=vec3.create();
	    vec3.scale(result,P[0],b[0]);
	    vec3.scaleAndAdd(result,result,P[1],b[1]);
	    vec3.scaleAndAdd(result,result,P[2],b[2]);
	    vec3.scaleAndAdd(result,result,P[3],b[3]);
	    return result;
	}

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    const pointCanvas = document.getElementById("pointCanvas");
    var ctx = pointCanvas.getContext("2d");

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

    let points = [
        {x:ball.x,y:ball.y},
        {x:40,y:280},
        {x:160,y:360},
        {x:300,y:250} 
    ]
    let posRadius = 7;
    let pointToMove = null;

    let isClickDown = false; 

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
        ctx.fillStyle = "green";
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
        ctx.stroke();
        ctx.moveTo(points[3].x,points[3].y);
        ctx.bezierCurveTo(points[2].y, points[2].x, points[1].y, points[1].x, points[0].x, points[0].y);
        ctx.stroke();
    }

    var p0=[points[0].x,points[0].y, 0];
    var d0=[points[1].x, points[1].y,0];
    var p1=[points[3].x,points[3].y,0];
    var d1=[points[2].x, points[2].y,0];
    var p2=[points[0].x,points[0].y, 0];
    var d2=[points[1].x, points[1].y,0];

    var P0 = [p0,d0,p1,d1]; 
    var P1 = [p1,d1,p2,d2]; 

    var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
    var C1 = function(t_) {return Cubic(Hermite,P1,t_);};

    var C0prime = function(t_) {return Cubic(HermiteDerivative,P0,t_);};
    var C1prime = function(t_) {return Cubic(HermiteDerivative,P1,t_);};

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0,0,pointCanvas.width,pointCanvas.height);
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

        var p0=[points[0].x,points[0].y, 0];
        var d0=[points[1].x, points[1].y,0];
        var p1=[points[3].x,points[3].y,0];
        var d1=[points[2].x, points[2].y,0];
        var p2=[points[0].x,points[0].y, 0];
        var d2=[points[1].x, points[1].y,0];
    
        var P0 = [p0,d0,p1,d1]; 
        var P1 = [p1,d1,p2,d2]; 
    
        var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
        var C1 = function(t_) {return Cubic(Hermite,P1,t_);};
    
        var C0prime = function(t_) {return Cubic(HermiteDerivative,P0,t_);};
        var C1prime = function(t_) {return Cubic(HermiteDerivative,P1,t_);};

        if(!slider.disabled) drawPoints();
    }

    var Ccomp = function(t) {
        if (t<1){
            var u = t;
            return C0(u);
        } else {
            var u = t-1.0;
            return C1(u);
        }          
	}

    var Ccomp_tangent = function(t) {
        if (t<1){
            var u = t;
            return C0prime(u);
        } else {
            var u = t-1.0;
            return C1prime(u);
        }          
	}

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

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

    pointCanvas.addEventListener("mousemove", e => {

        mousePos = {
            x: e.clientX - pointCanvas.offsetLeft,
            y: (e.clientY - pointCanvas.offsetTop) + scrollY
        }
    });

    pointCanvas.addEventListener("mousedown", () => {
        isClickDown = true;
    });

    pointCanvas.addEventListener("mouseup", () => {
        isClickDown = false;
        pointToMove = null;
    });

    parseSliderValue(slider.value); //set speed on load

    function draw() {
      
        cameraCanvas.width = cameraCanvas.width;
        var tParam = slider1.value*0.01;
        var viewAngle = slider2.value*0.02*Math.PI;
    
        var p0=[points[0].x,points[0].y, 0];
        var d0=[points[1].x, points[1].y,0];
        var p1=[points[3].x,points[3].y,0];
        var d1=[points[2].x, points[2].y,0];
        var p2=[points[0].x,points[0].y, 0];
        var d2=[points[1].x, points[1].y,0];
    
        var P0 = [p0,d0,p1,d1]; 
        var P1 = [p1,d1,p2,d2]; 
    
        var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
        var C1 = function(t_) {return Cubic(Hermite,P1,t_);};
    
        var C0prime = function(t_) {return Cubic(HermiteDerivative,P0,t_);};
        var C1prime = function(t_) {return Cubic(HermiteDerivative,P1,t_);};

        var CameraCurve = function(angle) {
            var distance = 120.0;
            var eye = vec3.create();
            eye[0] = distance*Math.sin(viewAngle);
            eye[1] = 10;
            eye[2] = distance*Math.cos(viewAngle);  
            return [eye[0],eye[1],eye[2]];
        }
    
        function drawTrajectory(t_begin,t_end,intervals,C,Tx,color) {
            context.strokeStyle=color;
            context.beginPath();
            moveToTx(C(t_begin),Tx);
            for(var i=1;i<=intervals;i++){
                var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
                lineToTx(C(t),Tx);
            }
            context.stroke();
        }
    
        var eyeCamera = CameraCurve(viewAngle);
        var targetCamera = vec3.fromValues(0,0,0); 
        var upCamera = vec3.fromValues(0,100,0); 
        var TlookAtCamera = mat4.create();
        mat4.lookAt(TlookAtCamera, eyeCamera, targetCamera, upCamera);
          
        var Tviewport = mat4.create();
        mat4.fromTranslation(Tviewport,[400,300,0]); 
        mat4.scale(Tviewport,Tviewport,[100,-100,1]); 
    
        context = cameraContext;
    
        var TprojectionCamera = mat4.create();
        mat4.ortho(TprojectionCamera,-100,100,-100,100,-1,1);
    
        var tVP_PROJ_VIEW_Camera = mat4.create();
        mat4.multiply(tVP_PROJ_VIEW_Camera,Tviewport,TprojectionCamera);
        mat4.multiply(tVP_PROJ_VIEW_Camera,tVP_PROJ_VIEW_Camera,TlookAtCamera);
          
        var Tmodel = mat4.create();
        mat4.fromTranslation(Tmodel,Ccomp(tParam));
        var tangent = Ccomp_tangent(tParam);
        var angle = Math.atan2(tangent[1],tangent[0]);
        mat4.rotateZ(Tmodel,Tmodel,angle);
    
        var tVP_PROJ_VIEW_MOD_Camera = mat4.create();
        mat4.multiply(tVP_PROJ_VIEW_MOD_Camera, tVP_PROJ_VIEW_Camera, Tmodel);
        var TlookFromCamera = mat4.create();
        mat4.invert(TlookFromCamera,TlookAtCamera);
    
        function drawObject(color,TxU,scale) {
            var Tx = mat4.clone(TxU);
            mat4.scale(Tx,Tx,[scale,scale,scale]);
            context.beginPath();
            context.fillStyle = "yellow";
            moveToTx([.120,.120, 0],Tx);
            lineToTx([0,.120, 0],Tx);
            lineToTx([.105,.030, 0],Tx);
            lineToTx([.060,.180, 0],Tx);
            lineToTx([.015,.030, 0],Tx);
            lineToTx([.120,.120, 0],Tx);
            context.closePath();
            context.fill();
        }

        cameraContext.fillStyle='black';
        cameraContext.fillRect(0,0,cameraCanvas.width,cameraCanvas.height);
        context = cameraContext;
        draw3DAxes("white",tVP_PROJ_VIEW_Camera,200.0);
        drawTrajectory(0.0,1.0,100,C0,tVP_PROJ_VIEW_Camera,"red");
        drawTrajectory(0.0,1.0,100,C1,tVP_PROJ_VIEW_Camera,"blue");
        drawObject("green",tVP_PROJ_VIEW_MOD_Camera,100.0);
        animate();
        //drawTrajectory(0.0,1.0,100,C0,tVP_PROJ_VIEW_Camera,"red");
        //drawTrajectory(0.0,1.0,100,C1,tVP_PROJ_VIEW_Camera,"blue");

    
    }
    
  
    slider1.addEventListener("input",draw);
    slider2.addEventListener("input",draw);
    
    draw();
    
}
window.onload = setup;