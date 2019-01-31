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

function Background(game, spritesheet, x, y, speed) {
    this.animation = new Animation(spritesheet, 3072, 1536, 1, 0.1, 1, true, 0.5);
    this.spritesheet = spritesheet;
    this.speed = speed;
    this.ctx = game.ctx;
	this.game = game;
    Entity.call(this, game, x, y);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
    if (this.game.Hero.moving) this.x -= this.game.clockTick * this.speed * this.game.Hero.direction;
    //if (this.x <= Camera.x - 1536) this.x = Camera.x + 1530;
    Entity.prototype.update.call(this);
}

Background.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
    //this.ctx.drawImage(this.spritesheet, this.x - Camera.x, this.y);
    Entity.prototype.draw.call(this);
}


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
    this.boundingbox = new BoundingBox(x, y+4, width, height-25);
    Entity.call(this, game, x, y, width, height);
}

Platform.prototype = new Entity();
Platform.prototype.constructor = Platform;

Platform.prototype.draw = function () {
	
    this.ctx.drawImage(this.spritesheet, this.x - Camera.x, this.y);
    //this.ctx.rect(this.x, this.y+4, this.width, this.height-25);
    //this.ctx.stroke();
    
    Entity.prototype.draw.call(this);
}
Platform.prototype.update = function () {
    Entity.prototype.update.call(this);
}

/*
Running Soldier
*/
function Soldier(game, spritesheet, x, y) {
    this.animation = new Animation(spritesheet, 50, 50, 8, 0.10, 8, true, 1);
    this.speed = 400;
    this.ctx = game.ctx;
    this.game = game;
    this.x = x;
    this.y = y;
    this.height = 50;
    this.width = 50;
    this.falling = true;
    this.jumping = false;
    this.jumpHeight = 100;
    this.moving = false;
	this.up = false;
    this.direction = 1;
    this.platform = game.platforms[0];
    
    this.boundingbox = new BoundingBox(this.x+2, this.y+2, this.width-7, this.height-3);
    Entity.call(this, game, x, y);
}

Soldier.prototype = new Entity();
Soldier.prototype.constructor = Soldier;

Soldier.prototype.update = function () {

    // moving
    if (this.moving) {
        this.x += this.game.clockTick * this.speed * this.direction;    
        Camera.x += this.game.clockTick * this.speed * this.direction;      
    }

    // free fall
    if (this.falling) {
        this.lastBottom = this.boundingbox.bottom-3;
        this.boundingbox = new BoundingBox(this.x+2, this.y+2, this.width-7, this.height-3);
    
        this.y += this.game.clockTick / this.animation.totalTime * 4 * this.jumpHeight;
        
        // check for platform
        for (var i = 0; i < this.game.platforms.length; i++) {
            var pf = this.game.platforms[i];
            
            // landed on top of platform
            if (this.boundingbox.collide(pf.boundingbox) && this.lastBottom < pf.boundingbox.top) {
                console.log("Collision!");
                this.falling = false;
                this.y = pf.boundingbox.top - this.height+3;
                this.platform = pf;
            }
        
        }
    }    
    // press jump
    if (this.up && !this.jumping && !this.falling) {
        this.jumping = true;
        this.base = this.y;
		this.up = false;
        
    }
    if (this.jumping) {
        var duration = this.animation.elapsedTime + this.game.clockTick;
        if (duration > this.animation.totalTime / 2) duration = this.animation.totalTime - duration;
            duration = duration / this.animation.totalTime;
            
        // parbolic jump
        height = (4 * duration - 4 * duration * duration) * this.jumpHeight;
        this.y = this.base - height;
        if (this.moving) this.x += this.game.clockTick * this.speed * this.direction;

        this.lastBottom = this.boundingbox.bottom-3;
        this.boundingbox = new BoundingBox(this.x+2, this.y+2, this.width-7, this.height-3);
                
        // check for platform
        for (var i = 0; i < this.game.platforms.length; i++) {
            var pf = this.game.platforms[i];
            
            // landed on top of platform            
            if (this.boundingbox.collide(pf.boundingbox) && this.lastBottom < pf.boundingbox.top) {
                console.log("Collision!");
                this.jumping = false;

                this.y = pf.boundingbox.top - this.height+3;
                this.platform = pf;
            }
        }
        this.space = null;
    }
    
    // walk off edge
    if (!this.jumping && !this.falling) {
        this.boundingbox = new BoundingBox(this.x+2, this.y+2, this.width-7, this.height-3);
        
        // walk off right edge
        if (this.boundingbox.left > this.platform.boundingbox.right) this.falling = true;
        // walk off left edge
        else if (this.boundingbox.right < this.platform.boundingbox.left) this.falling = true;
    }

    
    if (this.y > 700) this.y = -50;
    this.moving = false;
    Entity.prototype.update.call(this);
}

Soldier.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
    //this.ctx.rect(this.x+2, this.y+2, this.width-7, this.height-3);
    //this.ctx.stroke();
    Entity.prototype.draw.call(this);
}

/*
Bullet
*/
function Bullet(game, spritesheet, x, y) {
    this.animation = new Animation(spritesheet, 14, 14, 8, 1, 8, true, 1);
    this.speed = 500;
    this.ctx = game.ctx;
    this.x = x;
    this.y = y;
    Entity.call(this, game, this.x, this.y);
}

Bullet.prototype = new Entity();
Bullet.prototype.constructor = Bullet;

Bullet.prototype.update = function () {
    this.x += this.game.clockTick * this.speed;
    /*
    if (this.x > Camera.x + 800) {
        this.removeFromWorld();
        console.log("bullet removed");
    }
    */
    Entity.prototype.update.call(this);
}

Bullet.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
    Entity.prototype.draw.call(this);
}

var Camera = {
    x: 0,
    width: 800
};

AM.queueDownload("./img/soldier.png");
AM.queueDownload("./img/layer1.png");
AM.queueDownload("./img/layer2.png");
AM.queueDownload("./img/layer3.png");
AM.queueDownload("./img/platform.png");
AM.queueDownload("./img/bullet.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

	var gameEngine = new GameEngine();
    var platforms = [];
    var bullets = [];
    gameEngine.init(ctx);
    gameEngine.start();

	gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer1.png"), -1535, 0, 35));
    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer1.png"), 0, 0, 35));
    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer1.png"), 1535, 0, 35));
	gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer2.png"), -1535, -50, 75));
    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer2.png"), 0, -50, 75));
    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer2.png"), 1535, -50, 75));
	gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer3.png"), -1535, -50, 200));
    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer3.png"), 0, -50, 200));
    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer3.png"), 1535, -50, 200)); 
 
    var platformwidth = 7;
    for (var i = 0; i < platformwidth; i++) {
        var pf = new Platform(gameEngine, AM.getAsset("./img/platform.png"), 0+(128*i), 500, 128, 128)
        gameEngine.addEntity(pf);
        platforms.push(pf);
    }
    
    var pf = new Platform(gameEngine, AM.getAsset("./img/platform.png"), (128*8), 500, 128, 128)
        gameEngine.addEntity(pf);
        platforms.push(pf);
    
    var pf = new Platform(gameEngine, AM.getAsset("./img/platform.png"), (128*7), 300, 128, 128)
		gameEngine.addEntity(pf);
        platforms.push(pf);
    
    gameEngine.platforms = platforms;
    
    var Hero = new Soldier(gameEngine, AM.getAsset("./img/soldier.png"), 400, 0);
    gameEngine.addEntity(Hero);
	gameEngine.Hero = Hero;

    document.addEventListener('keydown', function(e){
          
		switch(e.keyCode) {
			// Spacebar
			case 32:
				var bullet = new Bullet(gameEngine, AM.getAsset("./img/bullet.png"), Hero.x + 37, Hero.y + 18);
				gameEngine.addEntity(bullet);
				bullets.push(bullet);
			break;
                       
            // Left
            case 37:
                Hero.moving = true;
                Hero.direction = -1;          
				break;
             
             // Up
             case 38:
                Hero.up = true;
				break;
             
             // Right
				case 39:
                Hero.moving = true;
                Hero.direction = 1;
                 break;
		}
      });
	document.addEventListener('keyup', function(e){
		switch(e.keyCode) {
            case 38:
			break;
		}
	});
    
	console.log("All Done!");
});

