var canvas;
var gl;
var program;
var colorBuffer;
var vertices;
var cColors;
var cDeg = [0, 0, 0, 0, 0, 0, 0, 0];
var color;
var points;	
var buffer;
var aspect = 960/540; 
var rotation = 0;
var xmove = 0;
var zmove = 0;
var ymove = 0;
var yangle = 0;
var xangle = 0;
var crossH = true;
var fov = 50;
var dextral = true;
var modelViewMatrix;
var projectionMatrix;
var orthoProjectionMatrix;
var viewMatrix;
var movePos = 0;
var matArray = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
var deadMat = [false,false,false]
/*var positions = [
		vec3(-10, -10, -10),
		vec3(-10, -10, 10),
		vec3(-10, 10, -10),
		vec3(-10, 10, 10),
		vec3(10, -10, -10),
		vec3(10, -10, 10),
		vec3(10, 10, -10),
		vec3(10, 10, 10)
	]*/
	var doorPositions = [
	vec3(-10, 0, -9.6),
		vec3(10, 0, -9.6),
		vec3(0, 10, -9.6),
		vec3(0, -10, -9.6)
	]
	
	var positions = [
		vec3(-10, 7, -9.6),
		vec3(-10, 13, -9.6),
		vec3(-10, -7, -9.6),
		vec3(-10, -13, -9.6),
		vec3(10, 7, -9.6),
		vec3(10, 13, -9.6),
		vec3(10, -7, -9.6),
		vec3(10, -13, -9.6)
	]
	var envPositions = [
		vec3(-10, 10, 0),
		vec3(10, 10, 0),
		vec3(10, -10, 0),
		vec3(-10, -10, 0)
	]
var original = vec3(-10, -20, -8.6);
var too = vec3(-10, 0, -8.6);
var towards = vec3(0, 0, 1);


var shootProjectile = false;
var projectileExists = false;
var counter = 0;
var projectileMatrix;

window.onload = function init() {
	
	// create canvas (#2)
	canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);	
	if(!gl) {
		// if WebGL is unsupported
		alert("WebGL is not available!");
	}
	gl.viewport(0, 0, canvas.width, canvas.height); // set viewport
	gl.clearColor(0.0, 0.0, 0.0, 1.0); 
	gl.clearDepth(0); 
      gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.GREATER);

	// set up event listener
	// quaternions (EC #3)
	document.onkeydown = function(e) {
		e = e || window.event;
		if(e.keyCode===82) { // r reverts to original position
			viewMatrix = lookAt(original,too, towards);
            yangle = 0;
            xangle = 0;
			aspect = 960/540;
			rotation = 0;
			fov = 90;
			projectionMatrix = perspective(90, aspect, -1, 1);
		}
		else if(e.keyCode===37){ // (#8) four degree rotation
			yangle-=1;
			console.log(matArray[0][0]);
			console.log(matArray[0][1]);
			}
		else if(e.keyCode===32){ // (#8) four degree rotation
			shootProjectile = true;
			projectileExists = true;
		}
		else if(e.keyCode===39){ // (#8) four degree rotation
			yangle+=1;
			console.log(matArray[0][0]);
			console.log(matArray[0][1]);
			}
		else if(e.keyCode===38){
			xmove -= 2.5*Math.sin(radians(yangle));
            ymove -= 2.5*Math.cos(radians(yangle));}
		else if(window.event.shiftKey && e.keyCode===187)
			crossH = !crossH;
		else if(e.keyCode===73) { // move camera (#9)
			xmove -= 2.5*Math.sin(radians(yangle));
            ymove -= 2.5*Math.cos(radians(yangle));
		}
		else if(e.keyCode===78)// (#10) adjust fov
			fov--;
		else if(e.keyCode===87) // (#10) adjust fov
			fov++;
		else if(e.keyCode===77) { // move camera (#9)
			xmove += 2.5*Math.sin(radians(yangle));
            ymove += 2.5*Math.cos(radians(yangle));
		}
		else if(e.keyCode===75) { // move camera (#9)
			xmove -= 2.5*Math.cos(radians(yangle));
            ymove += 2.5*Math.sin(radians(yangle));
		}
		else if(e.keyCode===74) { // move camera (#9)
			 xmove += 2.5*Math.cos(radians(yangle));
            ymove -= 2.5*Math.sin(radians(yangle));
		}
		else if(e.keyCode===67) { // c cycles through color (#5)
			cycleColors(cColors);
		}

	};

	// 8 color vectors
	cColors = [
		vec4(Math.random(), Math.random(), Math.random(), 1.0), 
		vec4(Math.random(), Math.random(), Math.random(), 1.0), 
		vec4(Math.random(), Math.random(), Math.random(), 1.0), 
		vec4(Math.random(), Math.random(), Math.random(), 1.0), 
		vec4(Math.random(), Math.random(), Math.random(), 1.0), 
		vec4(Math.random(), Math.random(), Math.random(), 1.0),
		vec4(Math.random(), Math.random(), Math.random(), 1.0),
		vec4(Math.random(), Math.random(), Math.random(), 1.0),
		vec4(Math.random(), Math.random(), Math.random(), 1.0), 
		vec4(Math.random(), Math.random(), Math.random(), 1.0), 
		vec4(Math.random(), Math.random(), Math.random(), 1.0),
		vec4(Math.random(), Math.random(), Math.random(), 1.0),
		vec4(Math.random(), Math.random(), Math.random(), 1.0)  
	];

	// unit cube
	//use same geometry data for all cubes(EC #2)
	vertices = [
		vec3(-0.5, -0.5, 0.5),
		vec3(-0.5, 0.5, 0.5),
		vec3(0.5, 0.5, 0.5),
		vec3(0.5, -0.5, 0.5),
		vec3(-0.5, -0.5, -0.5),
		vec3(-0.5, 0.5, -0.5),
		vec3(0.5, 0.5, -0.5),
		vec3(0.5, -0.5, -0.5)

	];

	//use same geometry data for all cubes(EC #2)
	points = [];
	var indices = [1, 2, 0, 3, 
	1, 2, 5, 6, 
	6, 5, 7, 4, 
	4, 0, 7, 3, 
	3, 2, 7, 6, 
	4, 0, 7, 3,
	0, 1, 4, 5];
	for(var i=0; i<indices.length; i++) {
		points.push(vertices[indices[i]]);
	}
	
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
	buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

    	modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
	viewMatrix = lookAt(original,too, towards);
	
	render();
};

function render() {
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	projectionMatrix = perspective(fov, aspect, -1, 1); //aspect ratio(#6)
	orthoProjectionMatrix = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
	projectionMatrix = mult(projectionMatrix, rotate(yangle, [0,1,0]));
    projectionMatrix = mult(projectionMatrix, rotate(xangle, [1,0,0]));
	color = gl.getUniformLocation(program, "color");
	viewMatrix = mult(viewMatrix, translate(xmove,ymove,zmove));
    	
	var transformM = mat4();
	if(dextral) {movePos += .05;}
	else movePos -= .05;

	if (Math.abs(movePos) > 9){
		dextral = !dextral;
	}
	// draw 8 cubes (#3)
	for(var i=0; i<8; i++) {
		//rotate and increase size(EC #4)
		if(!deadMat[i]){
		draww(i, transformM);}

	}
	for(var i=0; i<4; i++) {
		drawEnv(i, transformM);

	}
	for(var i=0; i<4; i++) {
		drawDoors(i);

	}
	if(projectileExists){
		draww2(0, transformM,counter);
		}
	// show crosshairs(#11)
	crosshairFunc()
	window.requestAnimFrame(render);
}
function crosshairFunc(){
	if(crossH) {
		var crosshairBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, crosshairBuffer);		
		gl.bufferData(gl.ARRAY_BUFFER, flatten([
		vec2(-0.5, 0),
		vec2(0.5, 0),
		vec2(0, -0.5),
		vec2(0, 0.5)]), gl.STATIC_DRAW);
		gl.vertexAttribPointer(gl.getAttribLocation(program, "vPosition"), 2, gl.FLOAT, false, 0, 0);
		transformM = mat4();
		transformM = mult(transformM, scale(vec3(0.2, 0.2, 0.2)));
		
		transformM = mult(transformM, orthoProjectionMatrix);
		gl.uniform4fv(color, flatten(vec4(1.0, 1.0, 1.0, 1.0)));
		gl.uniformMatrix4fv(modelViewMatrix, false, flatten(transformM));	
		gl.drawArrays(gl.LINES, 0, 4);
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.vertexAttribPointer(gl.getAttribLocation(program, "vPosition"), 3, gl.FLOAT, false, 0, 0);
	}
	xmove = 0;
	ymove = 0;
	zmove = 0;
}

function cycleColors(array) {
	var first = array[0]; 
	for(var i=0; i<array.length-1; i++)
		array[i] = array[i+1];
	array[array.length-1] = first;
}
function draww(num, transformM) {
	axisData = [0,1,0];
	cDeg[num] += 2.4;
	var modelVieww =mat4();
	transformM = mat4();
    	transformM = mult(transformM, projectionMatrix);
	modelVieww = mult(modelVieww, viewMatrix);
	modelVieww = mult(modelVieww, rotate(rotation, axisData));
	modelVieww = mult(modelVieww, translate(positions[num]));
	modelVieww = mult(modelVieww, translate(vec3(num%2?movePos:-movePos, 0, 0)));
	//modelVieww = mult(modelVieww, rotate(cDeg[num], axisData));
	matArray[num][0]=modelVieww[0][3];
	matArray[num][1]=modelVieww[2][3];
	transformM = mult(transformM, modelVieww);
	for(var i=0;i<27;i+=4){
		gl.uniform4fv(color, flatten(cColors[i%11]));
    	gl.uniformMatrix4fv(modelViewMatrix, false, flatten(transformM));
	// single triangle strip (EC #2)
	gl.drawArrays(gl.TRIANGLE_STRIP, i, 3);
	gl.drawArrays(gl.TRIANGLE_STRIP, i+1, 3);
	}

	//draw outlines in white(#4)
	gl.uniform4fv(color, flatten(vec4(1.0, 1.0, 1.0, 1.0)));
	gl.drawArrays(gl.LINE_STRIP, 0, 24);
}
function drawDoors(num) {
	axisData = [0,1,0];
	cDeg[num] += 2.4;
	var modelVieww =mat4();
	transformM = mat4();
    	transformM = mult(transformM, projectionMatrix);
	modelVieww = mult(modelVieww, viewMatrix);
	modelVieww = mult(modelVieww, translate(doorPositions[num]));
	modelVieww = mult(modelVieww, scale([2.999,2.999,2.999]));
	//modelVieww = mult(modelVieww, rotate(cDeg[num], axisData));
	transformM = mult(transformM, modelVieww);
	for(var i=0;i<27;i+=4){
		gl.uniform4fv(color, flatten(vec4(0, 0, 0, 1.0)));
    	gl.uniformMatrix4fv(modelViewMatrix, false, flatten(transformM));
	// single triangle strip (EC #2)
	gl.drawArrays(gl.TRIANGLE_STRIP, i, 3);
	gl.drawArrays(gl.TRIANGLE_STRIP, i+1, 3);
	}
}
function drawEnv(num, transformM) {
	axisData = [0,1,0];
	cDeg[num] += 2.4;
	var modelVieww =mat4();
	transformM = mat4();
    	transformM = mult(transformM, projectionMatrix);
	modelVieww = mult(modelVieww, viewMatrix);
	modelVieww = mult(modelVieww, rotate(rotation, axisData));
	modelVieww = mult(modelVieww, translate(envPositions[num]));
	modelVieww = mult(modelVieww, scale([19.999,19.999,19.999]));
	//modelVieww = mult(modelVieww, rotate(cDeg[num], axisData));
	transformM = mult(transformM, modelVieww);
	for(var i=0;i<27;i+=4){
		gl.uniform4fv(color, flatten(cColors[i%11]));
    	gl.uniformMatrix4fv(modelViewMatrix, false, flatten(transformM));
	// single triangle strip (EC #2)
	gl.drawArrays(gl.TRIANGLE_STRIP, i, 3);
	gl.drawArrays(gl.TRIANGLE_STRIP, i+1, 3);
	}

	//draw outlines in white(#4)
	gl.uniform4fv(color, flatten(vec4(1.0, 1.0, 1.0, 1.0)));
	gl.drawArrays(gl.LINE_STRIP, 0, 24);
}
function draww2(num, transformM,timerr) {
	axisData = [0,1,0];
	cDeg[num] += 2.4;
	transformM = mat4();
	projectileMatrix = mat4();
    transformM = mult(transformM, projectionMatrix);

	//transformM = mult(transformM, rotate(rotation, axisData));
	if (shootProjectile){
		projectileMatrix = viewMatrix;
		counter = 0;
		shootProjectile = false;
	}
	else {counter+=10;
	
	projectileMatrix = mult(projectileMatrix, rotate(-yangle, [0,1,0]));
    projectileMatrix = mult(projectileMatrix, rotate(-xangle, [1,0,0]));
	projectileMatrix = mult(projectileMatrix, translate(vec3(0, -1.5, -.25*counter)));
	transformM = mult(transformM, projectileMatrix);
	}
	//transformM = mult(transformM, translate(positions[num]));
	transformM = mult(transformM, scale([1.1,1.1,1.1]));
	transformM = mult(transformM, rotate(cDeg[num], axisData));
	gl.uniform4fv(color, flatten(cColors[num]));
	//console.log(inverse(transformM));
	/*if(!(counter%1000)){
	console.log(projectileMatrix[0][3]);
	console.log(projectileMatrix[1][3]);
	console.log(projectileMatrix[2][3]);}*/
    	gl.uniformMatrix4fv(modelViewMatrix, false, flatten(transformM));
	// single triangle strip (EC #2)	
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 24);

	//draw outlines in white(#4)
	gl.uniform4fv(color, flatten(vec4(1.0, 1.0, 1.0, 1.0)));
	gl.drawArrays(gl.LINE_STRIP, 0, 24);
	for(var i=0; i<8; i++) {
		if(Math.sqrt(Math.pow(matArray[i][0]-projectileMatrix[0][3],2)+Math.pow(matArray[i][1]-projectileMatrix[2][3],2))<=1.5){
			console.log(matArray[i][0]);
			console.log(projectileMatrix[0][3]);
			console.log(matArray[i][1]);
			console.log(projectileMatrix[2][3]);
			deadMat[i] = true;
		}

	}
}
