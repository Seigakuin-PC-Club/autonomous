"use strict";

var vehicles = [];
var food = [];
var poison = [];
var debug;

function setup() {
  createCanvas(windowWidth, windowHeight - 20);

  // create vehicles on canvas
  for (var i = 0; i < 10; i++) {
    x = random(width);
    y = random(height);
    vehicles[i] = new Vehicle(x, y);
  }

  // make food on canvas
  for (var i = 0; i < 40; i++) {
    var x = random(width);
    var y = random(height);
    food.push(createVector(x, y));
  }

  // maake poison on canvas
  for (var i = 0; i < 20; i++) {
    var x = random(width);
    var y = random(height);
    poison.push(createVector(x, y));
  }
  debug = createCheckbox();
}

// add more vehicles on canvas
function mouseDragged() {
  vehicles.push(new Vehicle(mouseX, mouseY));
}
/**
 * DRAW FUNCTION
 **/
function draw() {
  background(51);
  fill(255);

  // add food randomly on canvas
  if (random(1) < 0.1) {
    // フレームごとに乱数を生成、0.1以下だったらfood生成
    var x = random(width);
    var y = random(height);
    food.push(createVector(x, y));
  }
  // フレームごとに乱数を生成、0.1以下だったらpoison生成
  if (random(1) < 0.01) {
    var x = random(width);
    var y = random(height);
    poison.push(createVector(x, y));
  }

  // foodをcanvasに描く
  for (let i = 0; i < food.length; i++) {
    fill(0, 255, 0);
    ellipse(food[i].x, food[i].y, 8, 8);
  }
  // poisonをcanvasに描く
  for (let i = 0; i < poison.length; i++) {
    fill(255, 0, 0);
    ellipse(poison[i].x, poison[i].y, 8, 8);
  }

  // forを逆ループにするのは、dead時にspliceするときに起こるエラーを回避するため
  for (var i = vehicles.length - 1; i >= 0; i--) {
    vehicles[i].boundaries();
    vehicles[i].behaviors(food, poison); // eatした時の行動
    vehicles[i].update();
    vehicles[i].display();

    // 条件が合えばcloneを生成
    var newVehicle = vehicles[i].clone();
    if (newVehicle != null) {
      vehicles.push(newVehicle);
    }

    // deadだったらspliceする
    if (vehicles[i].dead()) {
      var x = vehicles[i].position.x;
      var y = vehicles[i].position.y;
      food.push(createVector(x, y));
      vehicles.splice(i, 1);
    }
  }
}
