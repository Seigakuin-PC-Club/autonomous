var mr = 0.01; // mutation rate - 1%の確率でdnaを変化

function Vehicle(x, y, dna) {
  this.acceleration = createVector(0, 0); // 加速
  this.velocity = createVector(0, -2); // 速さ
  this.position = createVector(x, y); // 場所
  this.r = 6; // vehicleの大きさ
  this.maxspeed = 3;
  this.maxforce = 0.3;

  this.health = 1; // 体力(health)の初期値　フレームごとに減衰

  //各vehicleが持っているDNA（性質）をArrayに設定
  this.dna = [];
  // dna=undefined - new Vehicle時にdnaが渡されなかったら
  // dna[]の初期値を設定
  if (dna === undefined) {
    // food weight - foodに向かうベクトル(steerG)強さ
    this.dna[0] = random(-2, 2);
    // poison weight - poisionに向かうベクトル(steerB)強さ
    this.dna[1] = random(-2, 2);
    // food perception - foodが見える範囲(視界)
    this.dna[2] = random(0, 100);
    // poison perception - perceptionが見える範囲(視界)
    this.dna[3] = random(0, 100);
  } else {
    // すでにdnaを持っている(cloneされた new Vehicle)場合
    // 各dna値をコピーする
    // その際、mr(mutation rate)に応じた突然変異を起こす
    this.dna[0] = dna[0];
    if (random(1) < mr) {
      this.dna[0] += random(-0.1, 0.1);
    }
    this.dna[1] = dna[1];
    if (random(1) < mr) {
      this.dna[1] += random(-0.1, 0.1);
    }
    this.dna[2] = dna[2];
    if (random(2) < mr) {
      this.dna[0] += random(-10, 10);
    }
    this.dna[3] = dna[3];
    if (random(3) < mr) {
      this.dna[1] += random(-10, 10);
    }
  }

  /**
   * UPDATE FUNC
   **/
  // Method to update location
  this.update = function() {
    this.health -= 0.01; // フレームごとに0.01 healthが減衰

    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset accelerationelertion to 0 each cycle
    this.acceleration.mult(0);
  };

  /**
   * BEHAVIORS Func
   * vehicleがeatした時のbehavior(action)を設定
   **/
  this.behaviors = function(good, bad) {
    // good = food Array / bad = poison Array
    // 0.3 = nutrition(栄養)  - healthに足される nutritionの量
    // dna[2] = food perception(food視界)をeat渡す
    var steerG = this.eat(good, 0.3, this.dna[2]);
    var steerB = this.eat(bad, -0.7, this.dna[3]);

    steerG.mult(this.dna[0]);
    steerB.mult(this.dna[1]);

    this.applyForce(steerG);
    this.applyForce(steerB);
  };

  this.applyForce = function(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  };

  /**
   * CLONE
   **/
  this.clone = function() {
    if (random(1) < 0.005) {
      // フレームごとに0.5%の確率でクローンを生成
      return new Vehicle(this.position.x, this.position.y, this.dna);
    } else {
      return null;
    }
  };

  /**
   * EAT Func
   **/
  this.eat = function(list, nutrition, perception) {
    var record = Infinity;
    var closest = null;
    for (var i = list.length - 1; i >= 0; i--) {
      // d = vehicleからfood/positionの距離(distance)
      var d = this.position.dist(list[i]);

      // d(distance)がmaxspeed以下(エラー回避のため)
      if (d < this.maxspeed) {
        list.splice(i, 1); // food/poisonを消す(eatする)
        this.health += nutrition; // food/poison値がhealthの増減に影響
      } else {
        if (d < record && d < perception) {
          record = d;
          closest = list[i];
        }
      }
    }

    // This is the moment of eating
    if (closest != null) {
      return this.seek(closest);
    }

    return createVector(0, 0);
  };

  /**
   * SEEK FUNC
   **/
  // A method that calculates a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  this.seek = function(target) {
    var desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target

    // Scale to maximum speed
    desired.setMag(this.maxspeed);

    // Steering = Desired minus velocity
    var steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force

    return steer;
    // this.applyForce(steer);
  };

  this.dead = function() {
    return this.health < 0;
  };

  /**
   * DISPLAY FUNC
   **/
  this.display = function() {
    // 三角形を描画
    var theta = this.velocity.heading() + PI / 2; // 三角形の向きを調整

    push();
    translate(this.position.x, this.position.y);
    rotate(theta);

    if (debug.checked()) {
      // 緑の線(poison weight)を引く
      strokeWeight(3);
      stroke(0, 255, 0); //緑
      noFill();
      line(0, 0, 0, -this.dna[0] * 25); //線を引く
      ellipse(0, 0, this.dna[2] * 2, this.dna[2] * 2); // perspective(視界)の丸を描く
      // 赤い線(food weight)を引く
      strokeWeight(2);
      stroke(255, 0, 0); //赤
      line(0, 0, 0, -this.dna[1] * 25);
      ellipse(0, 0, this.dna[3] * 2, this.dna[3] * 2); // perspective(視界)の丸を描く
    }

    // health値によってvehicleの色設定
    var gr = color(0, 255, 0); //緑
    var rd = color(255, 0, 0); // 赤
    //lerpColorは rd から gr に this.healthの値によってmixする
    var col = lerpColor(rd, gr, this.health);

    fill(col);
    stroke(col);
    strokeWeight(1);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);

    pop();
  };

  /**
   * BOUNDARIES FUNC
   * 画面外に出てしまったときの対処
   **/
  this.boundaries = function() {
    var desired = null; // 壁を避ける向きのベクトル(強さ)
    var d = 25; // d = edgeからのdistance

    if (this.position.x < d) {
      // もし左端に近づいたら
      desired = createVector(this.maxspeed, this.velocity.y);
    } else if (this.position.x > width - d) {
      //もし右端に近づいたら
      desired = createVector(-this.maxspeed, this.velocity.y);
    }

    if (this.position.y < d) {
      // もし画面上に近づいたら
      desired = createVector(this.velocity.x, this.maxspeed);
    } else if (this.position.y > height - d) {
      // もし画面下に近づいたら
      desired = createVector(this.velocity.x, -this.maxspeed);
    }

    // 上記の条件(画面端)にいた場合
    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxspeed);
      var steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxforce);
      this.applyForce(steer);
    }
  };
}
