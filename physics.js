////////////////////////////////////////////////////////////////
function setupGround(){
  ground = Bodies.rectangle(500, 600, 1000, 40, {isStatic: true, angle: 0});
  World.add(engine.world, [ground]);
}

////////////////////////////////////////////////////////////////
function drawGround(){
  push();
  fill(128);
  drawVertices(ground.vertices);
  pop();
}
////////////////////////////////////////////////////////////
function setUpTimer(){
  startTime = new Date().getTime();
}
////////////////////////////////////////////////////////////
function drawTimer(){
  now = new Date().getTime();
  diff = now - startTime;
  timeLeft = 59 - (Math.floor(diff%(1000*60)/1000));
  textSize(40); 
  fill(0);
  text("Time left: " + timeLeft + " sec", 10, 40);
}
////////////////////////////////////////////////////////////
function drawInstructions(){
  textSize(20);
  fill(0);
  text("B to insert new bird", width-200, 40);
  text("C to clear all birds", width-200, 70);
  text("R to reset slingshot", width-200, 100);
  text("Boxes left: " + boxes.bodies.length, width-200, 130);
}
////////////////////////////////////////////////////////////////
function checkGameState(){
  if(timeLeft==0){
    gameOver();
    gameOverSound.play();
  }
  if(boxes.bodies.length==0){
    gameWin();
    gameWinSound.play();
  }
}
////////////////////////////////////////////////////////////////
function gameOver(){
  textSize(40); 
  fill(180,120);
  noStroke();
  rect(width/2-230,height/2-50,470,130);
  fill(0,0,204);
  text("GAME OVER",width/2-140,height/2);
  text("Press Space to continue",width/2-210,height/2+50);
  gameEnded = true;
  noLoop(); //stops the draw loop
}
////////////////////////////////////////////////////////////////
function gameWin(){
  textSize(40); 
  fill(180,80);
  noStroke();
  rect(width/2-230,height/2-50,470,130);
  fill(255,102,178);
  text("LEVEL COMPLETE!",width/2-180,height/2);
  text("Press Space to continue",width/2-210,height/2+50);
  gameEnded = true;
  noLoop(); //stops the draw loop
}
////////////////////////////////////////////////////////////////
function setupPropeller(){
  // your code here
  propeller = Bodies.rectangle(150,480,200,15,{isStatic:true, angle:angle});
  World.add(engine.world,[propeller]);
}
////////////////////////////////////////////////////////////////
//updates and draws the propeller
function drawPropeller(){
  push();
  // your code here
  Body.setAngle(propeller,angle);
  Body.setAngularVelocity(propeller,angleSpeed);
  angle = angle + angleSpeed;
  fill(0,80,200);
  drawVertices(propeller.vertices);
  pop();
}
////////////////////////////////////////////////////////////////
function setupBird(){
  var bird = Bodies.circle(mouseX, mouseY, 25, {friction: 0, restitution: 0.95 });
  Matter.Body.setMass(bird, bird.mass*10);
  World.add(engine.world, [bird]);
  birds.push(bird);
  for(var i=0; i<birds.length; i++){ //pick a random bird image for the new bird
    birdCol.push(random(birdImg));
  }
}
////////////////////////////////////////////////////////////////
function drawBirds(){
  
  push();
  //your code here
  for(var i=0; i<birds.length; i++){
    noFill();
    noStroke();
    drawVertices(birds[i].vertices);
    //place an image over where the body is at
    imageMode(CENTER);
    image(birdCol[i],birds[i].position.x,birds[i].position.y,70,65);
   
    if(isOffScreen(birds[i])){
      removeFromWorld(birds[i]);
      birds.splice(i,1);
      birdCol.splice(i,1);
      i--;
    }
  }
  pop();
}
////////////////////////////////////////////////////////////////
function setupExplosionCollision(){
  var bx,by,br=27;
  var tx,ty,tw=80,th=80;

  bx=slingshotBird.position.x;
  by=slingshotBird.position.y;
    
  //check if sling shot bird hits tower boxes
  for(var j=0; j<boxes.bodies.length; j++){
    tx=boxes.bodies[j].position.x;
    ty=boxes.bodies[j].position.y;

    var hitBox = checkExplosionCollision(bx,by,br,tx,ty,tw,th);
    
    //bird explodes and resets upon collision with tower boxes
    if(hitBox){
      resetSlingshot();
      drawExplosiveBirds(bx,by);
    }
  }

  var hitGround = checkExplosionCollision(bx,by,br,500,600,1000,40);
  var hitPropeller = checkExplosionCollision(bx,by,br,propeller.position.x,propeller.position.y,200,15);
  
  //bird explodes and resets upon collision with ground or propeller
  if(hitGround||hitPropeller){
    resetSlingshot();
    drawExplosiveBirds(bx,by);
  }

}
// ////////////////////////////////////////////////////////////////
function checkExplosionCollision(bx,by,br,tx,ty,tw,th){
  var br = br;

  //rect bodies are drawn with x,y being the center
  var tw2=tw/2;
  var th2=th/2;

  //top left corner
  var x1 = tx-tw2;
  var y1 = ty-th2;

  //bottom right corner
  var x2 = tx+tw2;
  var y2 = ty+th2;

  //check if the ball is inside the tower boxes
  var c1 = bx + br >= x1;
  var c2 = bx + br <= x2;
  var c3 = by + br >= y1;
  var c4 = by + br <= y2;

  if(c1 && c2 && c3 && c4){
    return true;
  }
  return false;
}

function setupexpbirds(bx,by){
  var explosive = Bodies.circle(bx,by, 15, {friction: 0, restitution: 0.99});
  Matter.Body.setMass(explosive, explosive.mass*5);
  //apply force so that the exploded pieces can shoot out with force
  var forceMagnitude = 0.025 * explosive.mass;
  Matter.Body.applyForce(explosive, explosive.position, {
    x:(forceMagnitude + Matter.Common.random() * forceMagnitude) * Matter.Common.choose([1, -1]),
    y: -forceMagnitude + Matter.Common.random() * -forceMagnitude
  });
  World.add(engine.world, [explosive]);
  explosives.push(explosive);
}
////////////////////////////////////////////////////////////////
function setupExplosiveBirds(){
  push();
  for(var i=0; i<points.length; i++){
  	var p = points[i]; 
    var alpha = map (p.age,1500,0,255,0);

    for(var j=0; j<explosives.length;j++){
      fill(255,250,73,alpha);
      noStroke();
      drawVertices(explosives[j].vertices);

      if(p.age==0){
        removeFromWorld(explosives[j]);
        explosives.splice(j,1);
        points.splice(i,1);
        j--
        i--
      }
      p.age-=1;
    }
  }
  pop();
}
////////////////////////////////////////////////////////////////
function drawExplosiveBirds(xpos,ypos){
  for(var i=0; i<7; i++){
    var newpoint = {
      x: xpos+random(-3,3),
      y: ypos+random(-3,3),
      age: 1500
    };
    points.push(newpoint);
    setupexpbirds(newpoint.x,newpoint.y);
  }
}
////////////////////////////////////////////////////////////////
//creates a tower of boxes
function setupTower(){
  //your code here
  boxes = Composites.stack(500,180,3,5,0,0,createOneTowerBrick);
  
  for(var i=0; i<boxes.bodies.length; i++){
    var g = random(55,255);
    boxes.bodies[i].render.fillStyle=color(0,g,0);
  }

  World.add(engine.world,[boxes]);
}

function createOneTowerBrick(x,y){
  var brickStyle = {fillStyle:"green", strokeStyle:"black"};
  var body = Bodies.rectangle(x,y,80,80,{render:brickStyle});

  return body;
}

////////////////////////////////////////////////////////////////
//draws tower of boxes
function drawTower(){
  push();
  //your code here
  for(var i=0; i<boxes.bodies.length; i++){
    fill(boxes.bodies[i].render.fillStyle);
    stroke(boxes.bodies[i].render.strokeStyle);
    drawVertices(boxes.bodies[i].vertices);

    if(isOffScreen(boxes.bodies[i])){
      removeFromWorld(boxes.bodies[i]);
      boxes.bodies.splice(i,1);
      i--;
    }
  }
  pop();
}
////////////////////////////////////////////////////////////////
function setupSlingshot(){
  //your code here
  slingshotBird = Bodies.circle(250,230,25,{restitution:0.95, friction:0, mass:10});
  var constraint_prop={pointA: {x:235, y:200},
                      bodyB: slingshotBird,
                      pointB: {x:0, y:0},
                      stiffness: 0.01,
                      damping: 0.0001};
  slingshotConstraint = Constraint.create(constraint_prop);
  World.add(engine.world,[slingshotBird,slingshotConstraint]);
}
////////////////////////////////////////////////////////////////
//draws slingshot bird and its constraint
function drawSlingshot(){
  push();
  // your code here
  drawConstraint(slingshotConstraint);
  
  noFill();
  noStroke();

  //adds a bird image over where the bird body is at
  imageMode(CENTER);
  drawVertices(slingshotBird.vertices);
  image(sbirdImg,slingshotBird.position.x,slingshotBird.position.y,70,65);

  if(isOffScreen(slingshotBird)){
    resetSlingshot();
  }
  pop();
}
/////////////////////////////////////////////////////////////////
function resetSlingshot(){
  removeFromWorld(slingshotBird);
  removeFromWorld(slingshotConstraint);
  setupSlingshot();
  slingshotSound.play();
}
/////////////////////////////////////////////////////////////////
function setupMouseInteraction(){
  var mouse = Mouse.create(canvas.elt);
  var mouseParams = {
    mouse: mouse,
    constraint: { stiffness: 0.05 }
  }
  mouseConstraint = MouseConstraint.create(engine, mouseParams);
  mouseConstraint.mouse.pixelRatio = pixelDensity();
  World.add(engine.world, mouseConstraint);
}