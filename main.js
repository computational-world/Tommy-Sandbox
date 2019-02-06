var AM = new AssetManager();
const WINDOW_WIDTH = 800;
const DEBUG = false;

function arrayRemove(element) {
	
}

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

function CustomAnimation(spriteSheet, startX, startY, offset, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
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
	this.startX = startX;
	this.startY = startY;
	this.offset = offset;
}

CustomAnimation.prototype.drawFrame = function (tick, ctx, x, y) {
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
                 this.startX + (xindex * (this.frameWidth + this.offset)), this.startY + yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

CustomAnimation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

CustomAnimation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}


/*
Tile
*/

function Tile(game, spritesheet, sourceX, sourceY, width, height, x, y, numberOfXRepeats, numberOfYRepeats) {
    this.spritesheet = spritesheet;
    this.ctx = game.ctx;
	this.game = game;
	this.x = x;
	this.y = y;
	this.sourceX = sourceX;
	this.sourceY = sourceY;
	this.width = width;
	this.height = height;
	this.numberOfXRepeats = numberOfXRepeats;
	this.numberOfYRepeats = numberOfYRepeats;
	Entity.call(game, spritesheet, sourceX, sourceY, width, height, x, y, numberOfXRepeats, numberOfYRepeats);
}

Tile.prototype = new Entity();
Tile.prototype.constructor = Tile;

Tile.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Tile.prototype.draw = function () {
	for (var rows = 0; rows < this.numberOfYRepeats; rows++) {
		for (var i = 0; i < this.numberOfXRepeats; i++)  
			this.ctx.drawImage(this.spritesheet, this.sourceX, this.sourceY,
			this.width, this.height,
			Math.round(this.x - Camera.x + (this.width * i)), this.y + (this.height * rows),
			this.width, this.height);
	}
    
    Entity.prototype.draw.call(this);
}


/*
Background
*/

function Background(game, spritesheet, x, y, speed, numberOfRepeats) {
    this.animation = new Animation(spritesheet, 3072, 1536, 1, 0.1, 1, true, 0.5);
    this.spritesheet = spritesheet;
    this.speed = speed;
    this.ctx = game.ctx;
	this.game = game;
	this.numberOfRepeats = numberOfRepeats;
    Entity.call(this, game, x, y);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
    if (this.game.Hero.moving) this.x -= this.game.clockTick * this.speed * this.game.Hero.direction;
    Entity.prototype.update.call(this);
}

Background.prototype.draw = function () {
    for (var i = 0; i < this.numberOfRepeats; i++)  
		this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x + (i*this.animation.frameWidth/2), this.y);
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
Tile Platform
*/
function TilePlatform(game, spritesheet, sourceXTopLeft, sourceYTopLeft, sourceXTopMid, sourceYTopMid, sourceXTopRight, sourceYTopRight,
    sourceXLeft, sourceYLeft, sourceXMid, sourceYMid, sourceXRight, sourceYRight, x, y, width, height, numberOfTiles) {
    this.ctx = game.ctx;
	this.game = game;
    this.spritesheet = spritesheet;
    this.width = width;
    this.height = height;
	this.numberOfTiles = numberOfTiles;
    this.x = x;
    this.y = y;
    this.sourceXTopLeft = sourceXTopLeft;
    this.sourceYTopLeft = sourceYTopLeft;
    this.sourceXTopMid = sourceXTopMid;
    this.sourceYTopMid = sourceYTopMid;
    this.sourceXTopRight = sourceXTopRight;
    this.sourceYTopRight = sourceYTopRight;
	this.sourceXLeft = sourceXLeft;
	this.sourceYLeft = sourceYLeft;
	this.sourceXMid = sourceXMid;
	this.sourceYMid = sourceYMid;
	this.sourceXRight = sourceXRight;
	this.sourceYRight = sourceYRight;
    this.boundingbox = new BoundingBox(x, y, width*numberOfTiles, height);
    Entity.call(game, spritesheet, sourceXTopLeft, sourceYTopLeft, sourceXTopMid, sourceYTopMid, sourceXTopRight, sourceYTopRight,
    sourceXLeft, sourceYLeft, sourceXMid, sourceYMid, sourceXRight, sourceYRight, x, y, width, height, numberOfTiles);
}

TilePlatform.prototype = new Entity();
TilePlatform.prototype.constructor = TilePlatform;

TilePlatform.prototype.draw = function () {
	
    for (var y = 0; y < 700-this.y; y+=this.height) {
        for (var i=0; i < this.numberOfTiles; i++) {
            if (i === 0) {
                if (y === 0) {
                    this.ctx.drawImage(this.spritesheet,
                        this.sourceXTopLeft, this.sourceYTopLeft,  // source from sheet
                        this.width, this.height,
                        Math.round(this.x - Camera.x), this.y + y,
                        this.width, this.height);
                } else {
                    this.ctx.drawImage(this.spritesheet,
                        this.sourceXLeft, this.sourceYLeft,  // source from sheet
                        this.width, this.height,
                        Math.round(this.x - Camera.x), this.y + y,
                        this.width, this.height);
                }                
            } else if (i < this.numberOfTiles - 1) {
                if (y === 0) {
                    this.ctx.drawImage(this.spritesheet,
                     this.sourceXTopMid, this.sourceYTopMid,  // source from sheet
                     this.width, this.height,
                     Math.round(this.x + (i * this.width) - Camera.x), this.y + y,
                     this.width, this.height);
                } else {
                    this.ctx.drawImage(this.spritesheet,
                     this.sourceXMid, this.sourceYMid,  // source from sheet
                     this.width, this.height,
                     Math.round(this.x + (i * this.width) - Camera.x), this.y + y,
                     this.width, this.height);
                }               
            } else {
                if (y === 0) {
                    this.ctx.drawImage(this.spritesheet,
                     this.sourceXTopRight, this.sourceYTopRight,  // source from sheet
                     this.width, this.height,
                     Math.round(this.x + (i * this.width) - Camera.x), this.y + y,
                     this.width, this.height);
                } else {
                    this.ctx.drawImage(this.spritesheet,
                     this.sourceXRight, this.sourceYRight,  // source from sheet
                     this.width, this.height,
                     Math.round(this.x + (i * this.width) - Camera.x), this.y + y,
                     this.width, this.height);
                }
                
            }	
        }
    }

	
    
    //this.ctx.rect(this.x, this.y+4, this.width, this.height-25);
    //this.ctx.stroke();
    
    Entity.prototype.draw.call(this);
}
TilePlatform.prototype.update = function () {
    Entity.prototype.update.call(this);
}


/*
Platforms
*/
function Platform(game, spritesheet, x, y, width, height, numberOfPlatforms) {
    this.ctx = game.ctx;
    this.spritesheet = spritesheet;
    this.width = width;
    this.height = height;
	this.numberOfPlatforms = numberOfPlatforms;
    this.x = x;
    this.y = y;
    this.boundingbox = new BoundingBox(x, y+4, width*numberOfPlatforms, height-25);
    Entity.call(this, game, x, y, width, height);
}

Platform.prototype = new Entity();
Platform.prototype.constructor = Platform;

Platform.prototype.draw = function () {
	
	for (var i=0; i < this.numberOfPlatforms; i++) {
		this.ctx.drawImage(this.spritesheet, this.x - Camera.x + (this.width*i), this.y);	
	}
    
    //this.ctx.rect(this.x, this.y+4, this.width, this.height-25);
    //this.ctx.stroke();
    
    Entity.prototype.draw.call(this);
}
Platform.prototype.update = function () {
    Entity.prototype.update.call(this);
}

/*
PowerUp
*/
function PowerUp(game, spritesheet, x, y, width, height, scale, type) {
	if (type === "shield") this.animation = new Animation(spritesheet, width, height, 1, 0.5, 1, true, scale);
	else this.animation = new Animation(spritesheet, width, height, 8, 0.08, 8, true, scale);
    this.ctx = game.ctx;
	this.game = game;
    this.spritesheet = spritesheet;
	this.type = type;
    this.width = width * scale;
    this.height = height * scale;
    this.x = x;
    this.y = y;
	this.basey = y;
    this.boundingbox = new BoundingBox(x, y, this.width * scale, this.height * scale);
	this.floatHeight = 10;
    Entity.call(this, game, x, y, width, height, scale, type);
}

PowerUp.prototype = new Entity();
PowerUp.prototype.constructor = PowerUp;

PowerUp.prototype.update = function () {
	var duration;
		 
	duration = this.animation.elapsedTime + this.game.clockTick;
	if (duration > this.animation.totalTime / 2) duration = this.animation.totalTime - duration;
	duration = duration / this.animation.totalTime;
		
	// float effect
	height = (4 * duration - 4 * duration * duration) * this.floatHeight;
	this.y = this.basey - height;
		
    this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
	
	// check for hero collision
	if (this.type === "health") {
		if (this.game.Hero.health <= this.game.Hero.maxHealth - 1) {
			if (this.boundingbox.collide(this.game.Hero.boundingbox)) {
					if (DEBUG) console.log("Hero got " + this.type + " power up!");
					this.game.Hero.health++;
					this.removeFromWorld = true;
			}	
		}	
	}
	else if (this.type === "coin") {
		if (this.boundingbox.collide(this.game.Hero.boundingbox)) {
					if (DEBUG) console.log("Hero got " + this.type + " power up!");
					this.game.Hero.coins++;
					this.removeFromWorld = true;
		}
	}
	else if (this.type === "shield") {
		if (this.boundingbox.collide(this.game.Hero.boundingbox)) {
					if (DEBUG) console.log("Hero got " + this.type + " power up!");
					this.game.Hero.shield += 3;
					this.removeFromWorld = true;
		}
	}
	
		
	Entity.prototype.update.call(this);
}

PowerUp.prototype.draw = function () {
	
	this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
	
	if (DEBUG) {
		this.ctx.strokeStyle = "red";
		this.ctx.strokeRect(this.x - Camera.x, this.y, this.width, this.height);
		this.ctx.strokeStyle = "green";
		this.ctx.strokeRect(this.x - Camera.x, this.y, this.width, this.height);
	}
    
    Entity.prototype.draw.call(this);
}


/*
Blue Monster
*/
function BlueMonster(game, spritesheet, x, y, width, height, powerUp, powerUpType) {
//	this.animation = new Animation(spritesheet, 25, 25, 8, 0.10, 10, true, 1);
    this.ctx = game.ctx;
    this.spritesheet = spritesheet;
    this.game = game;
	this.width = width;
    this.height = height;
	this.speed = 50;
    this.x = x;
    this.y = y;
	this.hitPoints = 3;
	this.active = false;
	this.powerUp = powerUp;
	this.powerUpType = powerUpType;
    this.boundingbox = new BoundingBox(x, y, width, height);
    Entity.call(this, game, x, y, width, height);
}

BlueMonster.prototype = new Entity();
BlueMonster.prototype.constructor = BlueMonster;

BlueMonster.prototype.update = function () {
    // monster dead
	if (this.hitPoints <= 0) {
	    this.game.Hero.score += 100;
        // drop powerUp
	    if (this.powerUp) {
	        if (this.powerUpType === "shield") {
	            power = new PowerUp(this.game, AM.getAsset("./img/PowerUp/shield.png"), this.x, this.boundingbox.bottom-38, 256, 256, 0.15, "shield");
	            this.game.addEntity(power);
	            this.game.powerups.push(power);
	        } else if (this.powerUpType === "health") {
	            power = new PowerUp(this.game, AM.getAsset("./img/PowerUp/health.png"), this.x, this.boundingbox.bottom - 35, 494, 443, 0.08, "health");
	            this.game.addEntity(power);
	            this.game.powerups.push(power);
	        } else if (this.powerUpType === "coin") {
	            power = new PowerUp(this.game, AM.getAsset("./img/PowerUp/coin.png"), this.x, this.boundingbox.bottom - 35, 496, 496, 0.07, "coin");
	            this.game.addEntity(power);
	            this.game.powerups.push(power);
	        }
	        
	    }
		this.removeFromWorld = true;
	}

	this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
	if (this.x - this.game.Hero.x < 500) {
		this.active = true;
	}
	if (this.active) {
		// move to left
		this.x -= this.game.clockTick * this.speed;
		
		// check for bullet
		for (var i = 0; i < this.game.bullets.length; i++) {
			var bullet = this.game.bullets[i];
			
			// hit by bullet            
			if (this.boundingbox.collide(bullet.boundingbox)) {
				if (DEBUG) console.log("hit!");
				this.hitPoints -= 1;
				bullet.x += 1000;
			}
		}
		
		// check for Hero collide
		if (this.boundingbox.collide(this.game.Hero.boundingbox)) {
			if (DEBUG) console.log("collide with hero!");
			if (this.game.Hero.shield > 0) this.game.Hero.shield--;
			else this.game.Hero.health--;
			this.removeFromWorld = true;
		}	
	
	}
	
	Entity.prototype.update.call(this);
}

BlueMonster.prototype.draw = function () {
	this.ctx.drawImage(this.spritesheet, this.x - Camera.x, this.y);
	if (DEBUG) {
		this.ctx.strokeStyle = "red";
		this.ctx.strokeRect(this.x - Camera.x, this.y, this.width, this.height);
		this.ctx.strokeStyle = "green";
		this.ctx.strokeRect(this.x - Camera.x, this.y, this.width, this.height);
	}
}


/*
Wolf Boss
*/
function Boss1(game, spritesheet, x, y, width, height) {
	this.animation = new Animation(spritesheet, width, height, 100, 0.03, 30, true, 0.25);
    this.ctx = game.ctx;
    this.spritesheet = spritesheet;
    this.game = game;
	this.width = width * 0.25;
    this.height = height * 0.25;
	this.speed = 50;
    this.x = x;
    this.y = y;
	this.hitPoints = 5;
	this.active = false;
    this.boundingbox = new BoundingBox(x, y, width, height);
    Entity.call(this, game, x, y, width, height);
}

Boss1.prototype = new Entity();
Boss1.prototype.constructor = Boss1;

Boss1.prototype.update = function () {
    // monster dead
	if (this.hitPoints <= 0) {
		this.game.Hero.score += 2000;
		this.removeFromWorld = true;
	}
	
	this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
	this.lastLeft = this.boundingbox.left + 5;
	if (this.x - this.game.Hero.x < 500) {
		this.active = true;
	}
	if (this.active) {
		// move to left
//		this.x -= this.game.clockTick * this.speed;
		
		// check for bullet
		for (var i = 0; i < this.game.bullets.length; i++) {
			var bullet = this.game.bullets[i];
			
			// hit by bullet            
			if (this.boundingbox.collide(bullet.boundingbox)) {
				console.log("hit!");
				this.hitPoints -= 1;
				bullet.x += 1000;
			}
		}
		
		// check for Hero collide
/*		if (this.boundingbox.collide(this.game.Hero.boundingbox)) {
			console.log("collide with hero!");
			this.game.Hero.health -= 1;
			this.removeFromWorld = true;
		}	
	*/
	}
	
	Entity.prototype.update.call(this);
}

Boss1.prototype.draw = function () {

	this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);

	if (DEBUG) {
		this.ctx.strokeStyle = "red";
		this.ctx.strokeRect(this.x - Camera.x, this.y, this.width, this.height);
		this.ctx.strokeStyle = "green";
		this.ctx.strokeRect(this.x - Camera.x, this.y, this.width, this.height);
	}
}

/*
Running Soldier
*/
function Soldier(game, spritesheet, x, y) {
    this.animationRight = new Animation(spritesheet, 50, 50, 8, 0.10, 8, true, 1);
	this.animationLeft = new Animation(AM.getAsset("./img/soldierLeft.png"), 50, 50, 8, 0.10, 8, true, 1);
    this.animationJumpRight = new Animation(AM.getAsset("./img/soldierJumpRight.png"), 50, 50, 8, 0.10, 8, true, 1);
	this.animationJumpLeft = new Animation(AM.getAsset("./img/soldierJumpLeft.png"), 50, 50, 8, 0.10, 8, true, 1);
	this.animationLand = new Animation(AM.getAsset("./img/dust.png"), 258, 52, 1, 0.10, 5, true, 0.5);
	this.animationShield = new Animation(AM.getAsset("./img/barrier.png"), 86.5, 87, 4, 0.10, 8, true, 0.75);
	this.speed = 300;
    this.ctx = game.ctx;
    this.game = game;
    this.x = x;
    this.y = y;
    this.height = 50;
    this.width = 50;
    this.falling = true;
    this.jumping = false;
    this.jumpHeight = 115;
    this.moving = false;
	this.up = false;
    this.direction = 1;
	this.score = 0;
	this.maxHealth = 3;
	this.shield = 0;
	this.health = this.maxHealth;
	this.coins = 0;
    this.platform = game.platforms[0];    
    this.boundingbox = new BoundingBox(this.x+2, this.y+2, this.width-7, this.height-3);
	
    Entity.call(this, game, x, y);
}

Soldier.prototype = new Entity();
Soldier.prototype.constructor = Soldier;

Soldier.prototype.update = function () {

	this.lastboundingbox = this.boundingbox;

    // moving
    if (this.moving) {
		this.boundingbox = new BoundingBox(this.x+2, this.y+2, this.width-7, this.height-3);

		this.x += this.game.clockTick * this.speed * this.direction;    
        Camera.x += this.game.clockTick * this.speed * this.direction;     
		
		// check for platform
        //for (var i = 0; i < this.game.platforms.length; i++) {
        //    var pf = this.game.platforms[i];
		//	if (pf === this.platform) continue;
            
            // collide with left side
//            if (this.boundingbox.collide(pf.boundingbox) /*&& this.lastboundingbox.right < pf.boundingbox.left*/) {
 //               console.log("test");
 //               this.x = pf.boundingbox.left - this.width - 5;
//            }
        
		//}
	}
		
    // press jump
    if (this.up && !this.jumping && !this.falling) {
        this.jumping = true;
        this.basey = this.y;
        this.basex = this.x;
		this.baseCamera = Camera.x;
    }
	
    // free fall
    if (this.falling) {
		this.boundingbox = new BoundingBox(this.x+2, this.y+2, this.width-7, this.height-3);
    
        this.y += this.game.clockTick / this.animationRight.totalTime * 4 * this.jumpHeight;
        
        // check for platform
        for (var i = 0; i < this.game.platforms.length; i++) {
            var pf = this.game.platforms[i];
            
            // landed on top of platform
            if (this.boundingbox.collide(pf.boundingbox) && this.lastboundingbox.bottom < pf.boundingbox.top) {
                console.log("Collision!");
                this.falling = false;
                this.y = pf.boundingbox.top - this.height;
                this.platform = pf;
				break;
            }  
            
            // collide with left side
//            else if (this.boundingbox.collide(pf.boundingbox) /*&& this.lastboundingbox.right < pf.boundingbox.left*/) {
//                console.log("test");
//                this.x = pf.boundingbox.left - this.width - 5;
//            }
        
        
        }
    }    

	// jumping
     else if (this.jumping && !this.moving) {

		var duration;
		var durationx;
        if (this.direction === 1) {
			duration = this.animationJumpRight.elapsedTime + this.game.clockTick;
			durationx = this.animationJumpRight.elapsedTime + this.game.clockTick;
			if (duration > this.animationJumpRight.totalTime / 2) duration = this.animationJumpRight.totalTime - duration;
			duration = duration / this.animationJumpRight.totalTime;
		} else {
			duration = this.animationJumpLeft.elapsedTime + this.game.clockTick;
			durationx = this.animationJumpLeft.elapsedTime + this.game.clockTick;
			if (duration > this.animationJumpLeft.totalTime / 2) duration = this.animationJumpLeft.totalTime - duration;
			duration = duration / this.animationJumpLeft.totalTime;	
		}
		
        // parbolic jump
        height = (4 * duration - 4 * duration * duration) * this.jumpHeight;
        this.y = this.basey - height;
		//this.x = this.basex + (durationx * this.speed) * this.direction;
		//Camera.x = this.baseCamera + (durationx * this.speed) * this.direction;
		
		//if (this.moving) this.x += this.game.clockTick * this.speed * this.direction;

        this.lastBottom = this.boundingbox.bottom;
        this.boundingbox = new BoundingBox(this.x+2, this.y+2, this.width-7, this.height);
                
        // check for platform
        for (var i = 0; i < this.game.platforms.length; i++) {
            var pf = this.game.platforms[i];
            
            // landed on top of platform            
            if (this.boundingbox.collide(pf.boundingbox) && this.lastBottom < pf.boundingbox.top) {
                console.log("Landed on a platform!");
                this.jumping = false;
				this.animationJumpLeft.elapsedTime = 0;
				this.animationJumpRight.elapsedTime = 0;

                this.y = pf.boundingbox.top - this.height;
                this.platform = pf;
				break;
            }
        }

    }
    
    // walk off edge
    else if (!this.jumping && !this.falling) {
        this.boundingbox = new BoundingBox(this.x+2, this.y+2, this.width-7, this.height);
        
        // walk off right edge
        if (this.boundingbox.left > this.platform.boundingbox.right) this.falling = true;
        // walk off left edge
        else if (this.boundingbox.right < this.platform.boundingbox.left) this.falling = true;
    }

    
    if (this.y > 700) {
		this.health -= 1;
		this.y = -50;
	}
    Entity.prototype.update.call(this);
}

Soldier.prototype.draw = function () {
	
	if (this.moving && !this.falling) {
		
		if (this.direction === 1) {
			this.animationRight.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
		}
		else {
			this.animationLeft.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
		}
	}
	else if (this.jumping) {
		if (this.direction === 1) {
			this.animationJumpRight.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
			if (this.animationJumpRight.isDone()) {
				this.animationJumpRight.elapsedTime = 0;
				this.jumping = false;
				this.falling = true;
			}	
		}
		else {
			this.animationJumpLeft.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
			if (this.animationJumpLeft.isDone()) {
				this.animationJumpLeft.elapsedTime = 0;
				this.jumping = false;
				this.falling = true;
			}
		}
		
	}
	else if (this.falling) {
		if (this.direction === 1) this.ctx.drawImage(AM.getAsset("./img/soldier.png"), 311, 11, 48, 49, this.x - Camera.x, this.y, 50, 50);
		else 
			this.ctx.drawImage(AM.getAsset("./img/soldier.png"), 361, 11, 49, 49, this.x - Camera.x, this.y, 50, 50);
	}
	else if (!this.moving) {
		if (this.direction === 1) this.ctx.drawImage(AM.getAsset("./img/soldierStandRight.png"), this.x - Camera.x, this.y, 50, 50);
		else 
		    this.ctx.drawImage(AM.getAsset("./img/soldier.png"), 60, 11, 47, 49, this.x - Camera.x, this.y, 50, 50);
	}
	
	if (this.shield > 0) {
		this.animationShield.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x - 8, this.y - 5);
	}
	
	// draw UI
	this.drawUI();
	
	// bounding box
	if (DEBUG) {
		this.ctx.strokeStyle = "red";
		this.ctx.strokeRect(this.x - Camera.x, this.y, this.width, this.height);
		this.ctx.strokeStyle = "green";
		this.ctx.strokeRect(this.x - Camera.x + 5, this.y, this.width - 10, this.height);
	}
	Entity.prototype.draw.call(this);
}


Soldier.prototype.drawUI = function () {
	this.ctx.font = "bold 30px Arial";
	
	// Level
	this.ctx.fillText("Level: 1", 350, 30);
	
	// Score
	if (this.score === 0) this.ctx.fillText("Score: " + this.score, 675, 30);
	else this.ctx.fillText("Score: " + this.score, this.x - Camera.x + 275 - ((Math.log10(this.score) + 1) * 14), 30);
	
	// Health
	this.ctx.drawImage(AM.getAsset("./img/soldierStandRight.png"), this.x - Camera.x - 400, 00, 50, 50);
	for (var i = 0; i < this.health; i++) this.ctx.drawImage(AM.getAsset("./img/heart.png"), 50 + (i * 35), 10, 35, 35);
	
	// Shield
	for (var i = 0; i < this.shield; i++) this.ctx.drawImage(AM.getAsset("./img/PowerUp/shield.png"), 50 + (this.health * 35) + (i * 35), 10, 35, 35);
	
	// Coins
	this.ctx.drawImage(AM.getAsset("./img/PowerUp/coinIcon.png"), this.x - Camera.x + 275, 40, 35, 35);
	this.ctx.fillText(this.coins, this.x - Camera.x + 320, 70);
	
}

/*
Bullet
*/
function Bullet(game, spritesheet, x, y, direction) {
    this.animation = new Animation(spritesheet, 14, 14, 8, 1, 8, true, 1);
    this.speed = 500;
    this.ctx = game.ctx;
	this.game = game;
    this.x = x;
    this.y = y;
	this.width = 14;
	this.height = 14;
	this.startX = x;
	this.direction = direction;
	this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
    Entity.call(this, game, this.x, this.y);
}

Bullet.prototype = new Entity();
Bullet.prototype.constructor = Bullet;

Bullet.prototype.update = function () {
    this.x += this.game.clockTick * this.speed * this.direction;
	this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
	var distance = Math.abs(this.x - this.startX);
    if (distance > 400) {
		if (DEBUG) console.log("Bullet removed.");
        this.removeFromWorld = true;
		for( var i = 0; i < this.game.bullets.length; i++){ 
			if ( this.game.bullets[i] === this) {
				this.game.bullets.splice(i, 1); 
		}
}
    }
    
    Entity.prototype.update.call(this);
}

Bullet.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
    Entity.prototype.draw.call(this);
}

var Camera = {
    x: 0,
    width: WINDOW_WIDTH
};

AM.queueDownload("./img/soldier.png");
AM.queueDownload("./img/soldierLeft.png");
AM.queueDownload("./img/soldierRight.png");
AM.queueDownload("./img/soldierJumpRight.png");
AM.queueDownload("./img/soldierJumpLeft.png");
AM.queueDownload("./img/soldierStandRight.png");
AM.queueDownload("./img/layer1.png");
AM.queueDownload("./img/layer2.png");
AM.queueDownload("./img/bullet.png");
AM.queueDownload("./img/BlueMonster.png");
AM.queueDownload("./img/heart.png");
AM.queueDownload("./img/wolf.png");
AM.queueDownload("./img/ForestTiles.png");
AM.queueDownload("./img/dust.png");
AM.queueDownload("./img/barrier.png");
// powerups
AM.queueDownload("./img/PowerUp/health.png");
AM.queueDownload("./img/PowerUp/coin.png");
AM.queueDownload("./img/PowerUp/coinIcon.png");
AM.queueDownload("./img/PowerUp/shield.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

	var gameEngine = new GameEngine();
    var platforms = [];
    gameEngine.platforms = platforms;
    var bullets = [];
	gameEngine.bullets = bullets;
	var powerups = [];
	gameEngine.powerups = powerups;
	var monsters = [];
	gameEngine.monsters = monsters;
	

    gameEngine.init(ctx);
    gameEngine.start();

	// Backgrounds (gameEngine, spritesheet, x, y, speed, numberOfRepeats)
	gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer1.png"), -1535, 0, 35, 5));
	gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer2.png"), -1535, -50, 75, 5));
		
	// TilePlatform(game, spritesheet, sourceXLeft, sourceYLeft, sourceXMid, sourceYMid, sourceXRight, sourceYRight, x, y, width, height, numberOfTiles) {
	var pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 19, 406, 73, 406, 127, 406, 19, 460, 73, 460, 127, 460, 0, 500, 50, 50, 18);
	gameEngine.addEntity(pf);
	platforms.push(pf);
    
	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 19, 406, 73, 406, 127, 406, 19, 460, 73, 460, 127, 460, 1000, 500, 50, 50, 3);
	gameEngine.addEntity(pf);
	platforms.push(pf);

	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 2300, 200, 50, 50, 18);
	gameEngine.addEntity(pf);
	platforms.push(pf);

	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 2150, 300, 50, 50, 6);
	gameEngine.addEntity(pf);
	platforms.push(pf);

	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 1400, 400, 50, 50, 18);
	gameEngine.addEntity(pf);
	platforms.push(pf);

	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 19, 406, 73, 406, 127, 406, 19, 460, 73, 460, 127, 460, 1250, 500, 50, 50, 7);
	gameEngine.addEntity(pf);
	platforms.push(pf);

	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 3850, 200, 50, 50, 6);
	gameEngine.addEntity(pf);
	platforms.push(pf);

	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 19, 406, 73, 406, 127, 406, 19, 460, 73, 460, 127, 460, 3000, 500, 50, 50, 20);
	gameEngine.addEntity(pf);
	platforms.push(pf);

    // Tile(game, spritesheet, sourceX, sourceY, width, height, x, y, numberOfXRepeats, numberOfYRepeats)
    // water
	var tile = new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 318, 788, 50, 50, 0, 600, 90, 2);
	gameEngine.addEntity(tile);

    // rocks
//	tile = new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 74, 866, 31, 16, 80, 500-16, 1, 1);
//	gameEngine.addEntity(tile);


	// Hero
    var Hero = new Soldier(gameEngine, AM.getAsset("./img/soldierRight.png"), 400, 0);
    gameEngine.addEntity(Hero);
	gameEngine.Hero = Hero;
	
	// Power Ups
	/*
	var power = new PowerUp(gameEngine, AM.getAsset("./img/PowerUp/health.png"), 500, 500 - (0.08 * 496), 494, 443, 0.08, "health");
    gameEngine.addEntity(power);
	powerups.push(power);
	*/
	
	power = new PowerUp(gameEngine, AM.getAsset("./img/PowerUp/coin.png"), 1050, 500 - (0.07 * 496), 494, 496, 0.07, "coin");
    gameEngine.addEntity(power);
	powerups.push(power);
	
	power = new PowerUp(gameEngine, AM.getAsset("./img/PowerUp/coin.png"), 1550, 500 - (0.07 * 496), 494, 496, 0.07, "coin");
    gameEngine.addEntity(power);
	powerups.push(power);
	
    /*
	power = new PowerUp(gameEngine, AM.getAsset("./img/PowerUp/shield.png"), 800, 500 - (0.15 * 256), 256, 256, 0.15, "shield");
    gameEngine.addEntity(power);
	powerups.push(power);
	*/

	// Monsters
	var monster = new BlueMonster(gameEngine, AM.getAsset("./img/BlueMonster.png"), 128*15, 375, 26, 27, true, "coin");
	gameEngine.addEntity(monster);
	monsters.push(monster);
	
	monster = new BlueMonster(gameEngine, AM.getAsset("./img/BlueMonster.png"), 128*17, 375, 26, 27, true, "shield");
	gameEngine.addEntity(monster);
	monsters.push(monster);
	
	monster = new BlueMonster(gameEngine, AM.getAsset("./img/BlueMonster.png"), 128*24, 175, 26, 27, true, "coin");
	gameEngine.addEntity(monster);
	monsters.push(monster);
	
	monster = new BlueMonster(gameEngine, AM.getAsset("./img/BlueMonster.png"), 128*25, 175, 26, 27, true, "health");
	gameEngine.addEntity(monster);
	monsters.push(monster);
	
	// Boss 1
	var Boss = new Boss1(gameEngine, AM.getAsset("./img/wolf.png"), 128*29, 400, 424, 457);
	gameEngine.addEntity(Boss);
	monsters.push(Boss);
	
	// Key Listener
    document.addEventListener('keydown', function(e){

		e.preventDefault();
		switch(e.keyCode) {
			// Spacebar
			case 32:
			var compensate = 37;
			var dir = 1;
			if (Hero.direction === -1) {
				dir = -1;
				compensate = -10;
			}
				var bullet = new Bullet(gameEngine, AM.getAsset("./img/bullet.png"), Hero.x + compensate, Hero.y + 18, dir);
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
		
		e.preventDefault();
		switch(e.keyCode) {
			//left
			case 37:
			Hero.moving = false;
			break;
			
			// right
			case 39:
			Hero.moving = false;
			break;
			
			//up
			case 38:
			Hero.up = false;
			break;
		}
	});
    
	console.log("All Done!");
});

