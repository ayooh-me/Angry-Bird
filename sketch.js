// Example is based on examples from: http://brm.io/matter-js/, https://github.com/shiffman/p5-matter
// add also Benedict Gross credit
// explosive idea based on code from: https://editor.p5js.org/mtchl/sketches/S1Lfx04il, 
// https://observablehq.com/@timhau/playing-with-matter-js

var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Constraint = Matter.Constraint;
var Mouse = Matter.Mouse;
var MouseConstraint = Matter.MouseConstraint;
var Composites = Matter.Composites;

var engine;
var startTime, now, diff, timeLeft;
var propeller;
var boxes = [];
var birds = [];
var birdColors = [];
var colors = [];
var explosive;
var explosives = [];
var ground;
var slingshotBird, slingshotConstraint;
var slingshotColor;
var angle=0;
var angleSpeed=0;
var canvas;
var gameEnded=false;

var birdImg=[];
var birdCol=[];
var bird1;
var bird2;
var sbirdImg;
var bg;

var points=[];
var accel = 10;
var gravity = 0.4;

////////////////////////////////////////////////////////////////
function preload(){
  soundFormats('mp3','wav');
  gameOverSound = loadSound('assets/game_over.wav');
  gameWinSound = loadSound('assets/win.wav');
  newBirdSound = loadSound('assets/new_ball.wav');
  slingshotSound = loadSound('assets/slingshot.mp3');

  bg = loadImage('assets/bg.png');
  bird1 = loadImage('assets/redbird.png');
  bird2 = loadImage('assets/bluebird.png');
  sbirdImg = loadImage('assets/yellowbird.png');
}

////////////////////////////////////////////////////////////
function setup() {
  canvas = createCanvas(1000, 600);

  engine = Engine.create();  // create an engine

  birdImg.push(bird1,bird2);

  setUpTimer();

  setupGround();

  setupPropeller();

  setupTower();

  setupSlingshot();

  setupMouseInteraction();
  
}
////////////////////////////////////////////////////////////
function draw() {
  background(bg);

  Engine.update(engine);

  drawTimer();  
  
  drawInstructions();
  
  drawGround();

  drawPropeller();

  drawTower();

  drawBirds();

  drawSlingshot();

  checkGameState();

  setupExplosiveBirds()

  setupExplosionCollision();

  
  console.log("explosives: " + explosives.length + ". points: " + points.length);
  

}
////////////////////////////////////////////////////////////
//use arrow keys to control propeller
function keyPressed(){
  
  if (keyCode == LEFT_ARROW){
    //your code here
    angleSpeed-=0.01;
  }
  else if (keyCode == RIGHT_ARROW){
    //your code here
    angleSpeed+=0.01;
  }
}
////////////////////////////////////////////////////////////
function keyTyped(){
  //if 'b' create a new bird to use with propeller
  if (key==='b' || key=='B'){
    setupBird();
    newBirdSound.play();
  }

  //if 'r' reset the slingshot
  if (key==='r' || key=='R'){
    resetSlingshot();
  }

  if(key==='c' || key=='C'){
    for(var i=0; i<birds.length; i++){
      World.remove(engine.world, birds[i]);
    }
    birds = [];
  }

  if(key===' ' && gameEnded == true){
    location.reload();
  }
}

//**********************************************************************
//  HELPER FUNCTIONS - DO NOT WRITE BELOW THIS line
//**********************************************************************

//if mouse is released destroy slingshot constraint so that
//slingshot bird can fly off
function mouseReleased(){
  setTimeout(() => {
    slingshotConstraint.bodyB = null;
    slingshotConstraint.pointA = { x: 0, y: 0 };
  }, 100);    
  
}
////////////////////////////////////////////////////////////
//tells you if a body is off-screen
function isOffScreen(body){
  var pos = body.position;
  return (pos.y > height || pos.x<0 || pos.x>width);
}
////////////////////////////////////////////////////////////
//removes a body from the physics world
function removeFromWorld(body) {
  World.remove(engine.world, body);
}
////////////////////////////////////////////////////////////
function drawVertices(vertices) {
  beginShape();
  for (var i = 0; i < vertices.length; i++) {
    vertex(vertices[i].x, vertices[i].y);
  }
  endShape(CLOSE);
}
////////////////////////////////////////////////////////////
function drawConstraint(constraint) {
  push();
  var offsetA = constraint.pointA;
  var posA = {x:0, y:0};
  if (constraint.bodyA) {
    posA = constraint.bodyA.position;
  }
  var offsetB = constraint.pointB;
  var posB = {x:0, y:0};
  if (constraint.bodyB) {
    posB = constraint.bodyB.position;
  }
  strokeWeight(3);
  stroke(0);
  line(
    posA.x + offsetA.x,
    posA.y + offsetA.y,
    posB.x + offsetB.x,
    posB.y + offsetB.y
  );
  pop();
}
