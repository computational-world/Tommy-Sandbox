var AM = new AssetManager();

function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

/*
Background
*/
/*
function Background(game, spritesheet, x, y, speed) {
    this.animation = new Animation(spritesheet, 3072, 1536, 1, 0.1, 1, true, 0.5);
    this.speed = speed;
    this.ctx = game.ctx;
    Entity.call(this, game, x, y);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Background.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}
*/

function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.left = x;
    this.top = y;
    this.right = this.left + width;
    this.bottom = this.top + height;
}

BoundingBox.prototype.collide = function (oth) {
    if (this.right > oth.left && this.left < oth.right && this.top < oth.bottom && this.bottom > oth.top) return true;
    return false;
}

/*
Platforms
*/
function Platform(game, spritesheet, x, y, width, height) {
    this.ctx = game.ctx;
    this.spritesheet = spritesheet;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    //this.unitsOfWidth = unitsOfWidth;
    this.boundingbox = new BoundingBox(x, y, width, height);
    Entity.call(this, game, x, y, width, height);
}

Platform.prototype = new Entity();
Platform.prototype.constructor = Platform;

Platform.prototype.draw = function () {
    /*
    for (var i = 0; i < this.unitsOfWidth; i++) {
        this.ctx.drawImage(this.spritesheet, this.x + (this.unitsOfWidth * this.width), this.y);
    }
    */
    this.ctx.drawImage(this.spritesheet, this.x /*+ (this.unitsOfWidth * this.width)*/, this.y);
    
    Entity.prototype.draw.call(this);
}
Platform.prototype.update = function () {
    //this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
    //Entity.prototype.update.call(this);
}

/*
Running Soldier
*/
function Soldier(game, spritesheet, x, y) {
    this.animation = new Animation(spritesheet, 50, 50, 8, 0.10, 8, true, 2);
    this.speed = 200;
    this.ctx = game.ctx;
    this.game = game;
    this.x = x;
    this.y = y;
    this.height = 50;
    this.falling = true;
    
    this.boundingbox = new BoundingBox(this.x, this.y+3, 50, 50);
    Entity.call(this, game, x, y);
}

Soldier.prototype = new Entity();
Soldier.prototype.constructor = Soldier;

Soldier.prototype.update = function () {
    this.lastBottom = this.boundingbox.bottom;
    this.boundingbox = new BoundingBox(this.x, this.y, 50, 50);

    if (this.falling) {
        this.y += this.game.clockTick * this.speed * 2;    
    }    

    for (var i = 0; i < this.game.platforms.length; i++) {
        var pf = this.game.platforms[i];
            
        if (this.boundingbox.collide(pf.boundingbox) && this.lastBottom < pf.boundingbox.top) {
            console.log("Collision!");
            this.falling = false;
            console.log("platform top: " + pf.boundingbox.top);
            console.log(this.y);
            this.y = pf.boundingbox.top - this.animation.frameHeight - 40;
            console.log(this.y);
        }
        
    }
    
    if (this.y > 700) this.y = -50;

    Entity.prototype.update.call(this);
}

Soldier.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

AM.queueDownload("./img/soldier.png");
AM.queueDownload("./img/layer1.png");
AM.queueDownload("./img/layer2.png");
AM.queueDownload("./img/layer3.png");
AM.queueDownload("./img/platform.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    var platforms = [];
    gameEngine.init(ctx);
    gameEngine.start();

    //gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer1.png"), 0, 0, 35));
//    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer1.png"), 1535, 0, 35));
    //gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer2.png"), 0, -50, 75));
//    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer2.png"), 1535, -50, 75));
    //gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer3.png"), 0, -50, 200));
    var testUnits = 5;
    for (var i = 0; i < testUnits; i++) {
        var pf = new Platform(gameEngine, AM.getAsset("./img/platform.png"), 0+(128*i), 500, 128, 128)
        gameEngine.addEntity(pf);
        platforms.push(pf);
    }
    gameEngine.platforms = platforms;
    
//    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer3.png"), 1535, -50, 200));
    gameEngine.addEntity(new Soldier(gameEngine, AM.getAsset("./img/soldier.png"), 300, 0));

    console.log("All Done!");
});

document.addEventListener('keydown', function(e){
          
          switch(e.keyCode) {
              case 39:
                  right = true;
                    
                  break;
              case 37:
                  
                  console.log("left");
                  
                  
                  break;
              case 38: 
    console.log("up");
                  break;
              case 40:
    console.log("down");
                  break;
          }
      });
      document.addEventListener('keyup', function(e){
          switch(e.keyCode) {
            case 38:

              break 
            
          }
      });