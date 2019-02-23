var AM = new AssetManager();
const WINDOW_WIDTH = 800;
const DEBUG = false;

function Sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    this.sound.volume = 0.7;
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}

var soundSong = new Sound("audio/track_1.wav");
soundSong.sound.volume = 0.5;

function dropPowerUp(entity) {
	if (entity.powerUpType === "shield") {
		power = new PowerUp(entity.game, AM.getAsset("./img/PowerUp/shield.png"), entity.x, entity.boundingbox.bottom - 38, 256, 256, 0.15, "shield");
		entity.game.addEntity(power);
		entity.game.powerups.push(power);
	} else if (entity.powerUpType === "health") {
		power = new PowerUp(entity.game, AM.getAsset("./img/PowerUp/health.png"), entity.x, entity.boundingbox.bottom - 35, 494, 443, 0.08, "health");
		entity.game.addEntity(power);
		entity.game.powerups.push(power);
	} else if (entity.powerUpType === "coin") {
		power = new PowerUp(entity.game, AM.getAsset("./img/PowerUp/coin.png"), entity.x, entity.boundingbox.bottom - 35, 494, 496, 0.07, "coin");
		entity.game.addEntity(power);
		entity.game.powerups.push(power);
	}
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
                        this.x - Camera.x, this.y + y,
                        this.width, this.height);
                } else {
                    this.ctx.drawImage(this.spritesheet,
                        this.sourceXLeft, this.sourceYLeft,  // source from sheet
                        this.width, this.height,
                        this.x - Camera.x, this.y + y,
                        this.width, this.height);
                }                
            } else if (i < this.numberOfTiles - 1) {
                if (y === 0) {
                    this.ctx.drawImage(this.spritesheet,
                     this.sourceXTopMid, this.sourceYTopMid,  // source from sheet
                     this.width, this.height,
                     this.x + (i * this.width) - Camera.x, this.y + y,
                     this.width, this.height);
                } else {
                    this.ctx.drawImage(this.spritesheet,
                     this.sourceXMid, this.sourceYMid,  // source from sheet
                     this.width, this.height,
                     this.x + (i * this.width) - Camera.x, this.y + y,
                     this.width, this.height);
                }               
            } else {
                if (y === 0) {
                    this.ctx.drawImage(this.spritesheet,
                     this.sourceXTopRight, this.sourceYTopRight,  // source from sheet
                     this.width, this.height,
                     this.x + (i * this.width) - Camera.x, this.y + y,
                     this.width, this.height);
                } else {
                    this.ctx.drawImage(this.spritesheet,
                     this.sourceXRight, this.sourceYRight,  // source from sheet
                     this.width, this.height,
                     this.x + (i * this.width) - Camera.x, this.y + y,
                     this.width, this.height);
                }
                
            }	
        }
    }
    
    Entity.prototype.draw.call(this);
}
TilePlatform.prototype.update = function () {
    Entity.prototype.update.call(this);
}


/******************************************************************************************************************
Waterfall
*/
function Waterfall(game, spritesheet, sourceXWater, sourceYWater, sourceXTopSplash, sourceYTopSplash, sourceXBotSplash, sourceYBotSplash, 
	x, y, width, height, waterfallWidth, waterfallHeight) {
	this.animationWater = new CustomAnimation(spritesheet, sourceXWater, sourceYWater, 4, width, height, 3, 7, 3, true, 1);
	this.animationSplashTop = new CustomAnimation(spritesheet, sourceXTopSplash, sourceYTopSplash, 2, 50, 14, 2, 1.5, 2, true, 1);
	this.animationSplashBot = new CustomAnimation(spritesheet, sourceXBotSplash, sourceYBotSplash, 2, 50, 14, 2, 1.5, 2, true, 1);
    this.ctx = game.ctx;
	this.game = game;
    this.spritesheet = spritesheet;
    this.width = width;
    this.height = height;
	this.waterfallWidth = waterfallWidth;
	this.waterfallHeight = waterfallHeight;
    this.x = x;
    this.y = y;
	this.sourceXWater = sourceXWater;
    this.sourceYWater = sourceYWater;
	this.sourceXTopSplash = sourceXTopSplash;
	this.sourceYTopSplash = sourceYTopSplash;
	this.sourceXBotSplash = sourceXBotSplash;
	this.sourceYBotSplash = sourceYBotSplash;
	this.active = false;
	
    Entity.call(game, spritesheet, sourceXWater, sourceYWater, sourceXTopSplash, sourceYTopSplash, sourceXBotSplash, sourceYBotSplash, 
	x, y, width, height, waterfallWidth, waterfallHeight);
}

Waterfall.prototype = new Entity();
Waterfall.prototype.constructor = Waterfall;

Waterfall.prototype.update = function () {
    if (this.x - this.game.Hero.x < 500) this.active = true;
	Entity.prototype.update.call(this);
}
Waterfall.prototype.draw = function () {
	if (this.active) {
		for (var y = 0; y < this.waterfallHeight; y++) {
			for (var i=0; i < this.waterfallWidth; i++) {
				this.animationWater.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x + (i*this.width), this.y+(y*this.height));	
				
				if (y === 0) this.animationSplashTop.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x + (i*this.width), this.y+(y*this.height) - 3);
				else if (y === this.waterfallHeight - 1) this.animationSplashBot.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x + (i*this.width), this.y+(y*this.height) + this.height - 9);
			}
		}	
	}
    
    
    Entity.prototype.draw.call(this);
}
//*****************************************************************************************************************



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
    
    Entity.prototype.draw.call(this);
}
Platform.prototype.update = function () {
    Entity.prototype.update.call(this);
}

/*
PowerUp
*/
function PowerUp(game, spritesheet, x, y, width, height, scale, type) {
	if (type === "shield" || type === "grenade") this.animation = new Animation(spritesheet, width, height, 1, 0.5, 1, true, scale);
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
	this.soundCoin = new Sound("audio/coin.wav");
	this.soundHealth = new Sound("audio/health.wav");
	this.soundShield = new Sound("audio/shield.wav");
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
					this.soundHealth.play();
					this.game.Hero.health++;
					this.removeFromWorld = true;
			}	
		}	
	}
	else if (this.type === "coin") {
		if (this.boundingbox.collide(this.game.Hero.boundingbox)) {
					if (DEBUG) console.log("Hero got " + this.type + " power up!");
					this.game.Hero.coins++;
					this.soundCoin.play();
					this.removeFromWorld = true;
		}
	}
	else if (this.type === "shield") {
		if (this.boundingbox.collide(this.game.Hero.boundingbox)) {
					if (DEBUG) console.log("Hero got " + this.type + " power up!");
					this.game.Hero.shield += 3;
					this.soundShield.play();
					this.removeFromWorld = true;
		}
	}
	else if (this.type === "grenade") {
		if (this.boundingbox.collide(this.game.Hero.boundingbox)) {
					if (DEBUG) console.log("Hero got " + this.type + " power up!");
					this.game.Hero.specials.push("grenade");
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
		this.ctx.strokeRect(this.boundingbox.left - Camera.x, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
	}
    
    Entity.prototype.draw.call(this);
}


/*
Flying Robot
*/
function FlyingRobot(game, spritesheet, x, y, width, height, powerUp, powerUpType) {
    this.animation = new CustomAnimation(spritesheet, 149, 619, 1, 50, 50, 2, 0.25, 2, true, 1);
	this.animationDie = new Animation(AM.getAsset("./img/explosion.png"), 128, 128, 4, 0.03, 16, false, 0.4);
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
	this.soundDeath = new Sound("audio/death-enemy.wav");
    this.boundingbox = new BoundingBox(x, y, width, height);
    Entity.call(game, spritesheet, x, y, width, height, powerUp, powerUpType);
}

FlyingRobot.prototype = new Entity();
FlyingRobot.prototype.constructor = FlyingRobot;

FlyingRobot.prototype.update = function () {
	
    // monster dead
	if (this.animationDie.isDone()) {
	    this.game.Hero.score += 100;
        // drop powerUp
	    if (this.powerUp) dropPowerUp(this);
	        
		this.soundDeath.play();
		this.removeFromWorld = true;
	}

	this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
	if (this.x - this.game.Hero.x < 405) {
		this.active = true;
	}
	if (this.active) {
		// move to left
		this.x -= this.game.clockTick * this.speed;
		
		// check for bullet
		for (var i = 0; i < this.game.bullets.length; i++) {
			var bullet = this.game.bullets[i];
			
			// hit by bullet            
			if (!bullet.hit && this.boundingbox.collide(bullet.boundingbox)) {
				if (DEBUG) console.log("hit!");
				this.hitPoints -= 1;
				bullet.hit = true;
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

FlyingRobot.prototype.draw = function () {
	
	if (this.hitPoints <= 0) {	
		if (this.animationDie.elapsedTime === 0) this.soundDeath.play();

		if (this.animationDie.isDone()) {
			for( var i = 0; i < this.game.monsters.length; i++){ 
				if ( this.game.monsters[i] === this) {
					this.game.monsters.splice(i, 1);				
					this.removeFromWorld = true;
				}
			}	
		}
		else this.animationDie.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);		
	}
    else this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
    //this.ctx.drawImage(this.spritesheet, this.x - Camera.x, this.y);
	if (DEBUG) {
		this.ctx.strokeStyle = "red";
		this.ctx.strokeRect(this.x - Camera.x, this.y, this.width, this.height);
		this.ctx.strokeStyle = "green";
		this.ctx.strokeRect(this.boundingbox.left - Camera.x, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
	}
}


/*
Turret
*/
function Turret(game, spritesheet, x, y, width, height, powerUp, powerUpType) {
    this.animation = new CustomAnimation(spritesheet, 47, 159, 1, 50, 50, 1, 1.75, 1, false, 1);
	this.animationShoot = new CustomAnimation(spritesheet, 47, 159, 1, 50, 50, 2, 0.20, 2, false, 1);
	this.animationDie = new Animation(AM.getAsset("./img/explosion.png"), 128, 128, 4, 0.03, 16, false, 0.4);
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
    this.shooting = false;
	this.soundDeath = new Sound("audio/death-enemy.wav");
    this.boundingbox = new BoundingBox(x, y+20, width, height-20);
    Entity.call(game, spritesheet, x, y, width, height, powerUp, powerUpType);
}

Turret.prototype = new Entity();
Turret.prototype.constructor = Turret;

Turret.prototype.update = function () {
    // monster dead
    if (this.animationDie.isDone()) {
        this.game.Hero.score += 250;
        // drop powerUp
        if (this.powerUp) dropPowerUp(this);
    }

    this.boundingbox = new BoundingBox(this.x, this.y+20, this.width, this.height-20);
    if (this.x - this.game.Hero.x < 405) {
        this.active = true;
    }
    if (this.active) {

        // check for bullet
        for (var i = 0; i < this.game.bullets.length; i++) {
            var bullet = this.game.bullets[i];

            // hit by bullet            
            if (!bullet.hit && this.boundingbox.collide(bullet.boundingbox)) {
                if (DEBUG) console.log("hit!");
				bullet.hit = true;
                this.hitPoints -= 1;
            }
        }

        // check for Hero collide
        if (this.boundingbox.collide(this.game.Hero.boundingbox)) {
            if (DEBUG) console.log("collide with hero!");
            if (this.game.Hero.shield > 0) this.game.Hero.shield--;
            else this.game.Hero.health--;
            this.removeFromWorld = true;
        }

		// shooting
		if (this.animationShoot.elapsedTime + this.game.clockTick > this.animationShoot.totalTime) {
				this.animationShoot.elapsedTime = 0;
				this.animation.elapsedTime = 0;
				this.shooting = false;
				
				var bullet = new Cannonball(this.game, this.x - 7, this.y + 29, -1);
				this.game.addEntity(bullet);
				this.game.bulletsBad.push(bullet);
				
		}
		// idle
		else if (this.animation.elapsedTime + this.game.clockTick > this.animation.totalTime) {
		        this.animationShoot.elapsedTime = 0;
				this.animation.elapsedTime = 0;
				this.shooting = true;
		}
    }
		
    Entity.prototype.update.call(this);
}

Turret.prototype.draw = function () {

	// dead
	if (this.hitPoints <= 0) {	
		if (this.animationDie.elapsedTime === 0) this.soundDeath.play();

		if (this.animationDie.isDone()) {
			for( var i = 0; i < this.game.monsters.length; i++){ 
				if ( this.game.monsters[i] === this) {
					this.game.monsters.splice(i, 1);				
					this.removeFromWorld = true;
				}
			}	
		}
		else this.animationDie.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);		
	} else {
		if (this.shooting) { 
			this.animationShoot.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
		} else {
			this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
		}
	}
	
    if (DEBUG) {
        this.ctx.strokeStyle = "red";
        this.ctx.strokeRect(this.x - Camera.x, this.y, this.width, this.height);
        this.ctx.strokeStyle = "green";
        this.ctx.strokeRect(this.boundingbox.left - Camera.x, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
    }
}


/*
Mech
*/
function Mech(game, spritesheet, x, y, width, height, powerUp, powerUpType) {
    this.animation = new CustomAnimation(spritesheet, 136, 155, 1, 140, 108, 1, 1.5, 1, false, 0.75);
	this.animationShoot = new CustomAnimation(spritesheet, 136, 267, 1, 140, 108, 2, 0.20, 2, false, 0.75);
	this.animationJump = new CustomAnimation(spritesheet, 136, 379, 1, 140, 108, 1, 0.50, 1, false, 0.75);
	this.animationDie = new Animation(AM.getAsset("./img/explosion.png"), 128, 128, 4, 0.03, 16, false, 0.84);
    this.ctx = game.ctx;
    this.spritesheet = spritesheet;
    this.game = game;
    this.width = width * 0.75;
    this.height = height * 0.75;
    this.speed = 100;
    this.x = x;
    this.y = y;
    this.hitPoints = 8;
    this.active = false;
    this.powerUp = powerUp;
    this.powerUpType = powerUpType;
    this.shooting = true;
	this.jumping = false;
	this.idle = false;
	this.jumpHeight = 25;
	this.baseY = y;
	this.baseX = x;
	this.soundDeath = new Sound("audio/death-enemy.wav");
    this.boundingbox = new BoundingBox(x+27, y, this.width-35, this.height);
    Entity.call(game, spritesheet, x, y, width, height, powerUp, powerUpType);
}

Mech.prototype = new Entity();
Mech.prototype.constructor = Mech;

Mech.prototype.update = function () {
    this.boundingbox = new BoundingBox(this.x+27, this.y, this.width-35, this.height);
	// monster dead
    if (this.animationDie.isDone()) {
        this.game.Hero.score += 500;
        // drop powerUp
        if (this.powerUp) dropPowerUp(this);
    }

    
    if (this.x - this.game.Hero.x < 405) {
        this.active = true;
    }
	
	//console.log("jumping=" + this.jumping);
	//console.log("shooting=" + this.shooting);
    if (this.active) {

        // check for bullet
        for (var i = 0; i < this.game.bullets.length; i++) {
            var bullet = this.game.bullets[i];

            // hit by bullet            
            if (!bullet.hit && this.boundingbox.collide(bullet.boundingbox)) {
                if (DEBUG) console.log("hit!");
				bullet.hit = true;
                this.hitPoints -= 1;
            }
        }

        // check for Hero collide
        if (this.boundingbox.collide(this.game.Hero.boundingbox)) {
            if (DEBUG) console.log("collide with hero!");
            if (this.game.Hero.shield > 0) this.game.Hero.shield -= 3;
            else this.game.Hero.health -= 3;
            this.removeFromWorld = true;
        }

		// jumping movement
		if (this.jumping) {
			var duration;
			duration = this.animationJump.elapsedTime + this.game.clockTick;
			if (duration > this.animationJump.totalTime / 2) duration = this.animationJump.totalTime - duration;
			duration = duration / this.animationJump.totalTime;

			// parbolic jump
			var height = (4 * duration - 4 * duration * duration) * this.jumpHeight;
			this.y = this.baseY - height;
			this.x -= Math.round(this.game.clockTick * this.speed);
		}
		
		
		// shooting
		if ( this.shooting && this.animationShoot.elapsedTime + this.game.clockTick > this.animationShoot.totalTime) {
				this.animationShoot.elapsedTime = 0;
				this.animation.elapsedTime = 0;
				this.animationJump.elapsedTime = 0;
				this.shooting = false;
				this.idle = true;
				
				var bullet = new Cannonball(this.game, this.x - 7, this.y + 33, -1);
				this.game.addEntity(bullet);
				this.game.bulletsBad.push(bullet);
				
		}
		
		// jumping
		else if (this.jumping && this.animationJump.elapsedTime + this.game.clockTick > this.animationJump.totalTime) {
				this.animationShoot.elapsedTime = 0;
				this.animation.elapsedTime = 0;
				this.animationJump.elapsedTime = 0;
				this.jumping = false;
				this.shooting = true;
		}
		
		// idle
		else if (this.idle && this.animation.elapsedTime + this.game.clockTick > this.animation.totalTime) {
		        this.animationShoot.elapsedTime = 0;
				this.animation.elapsedTime = 0;
				this.animationJump.elapsedTime = 0;
				this.jumping = true;
		} 
    }
		
    Entity.prototype.update.call(this);
}

Mech.prototype.draw = function () {
	if (this.hitPoints <= 0) {	
		if (this.animationDie.elapsedTime === 0) this.soundDeath.play();

		if (this.animationDie.isDone()) {
			this.soundDeath.play();
			for( var i = 0; i < this.game.monsters.length; i++){ 
				if ( this.game.monsters[i] === this) {
					this.game.monsters.splice(i, 1);				
					this.removeFromWorld = true;
				}
			}	
		}
		else this.animationDie.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);		
	} else {
		if (this.shooting) { 
			this.animationShoot.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
		} else if (this.jumping) {
			this.animationJump.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
		} else if (this.idle) {
			this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
		}
	}
	


    if (DEBUG) {
        this.ctx.strokeStyle = "red";
        this.ctx.strokeRect(this.x - Camera.x, this.y, this.width, this.height);
        this.ctx.strokeStyle = "green";
        this.ctx.strokeRect(this.boundingbox.left - Camera.x, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
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
			if (!bullet.hit && this.boundingbox.collide(bullet.boundingbox)) {
				console.log("hit!");
				this.hitPoints -= 1;
				bullet.hit = true;
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
		this.ctx.strokeRect(this.boundingbox.left - Camera.x, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
	}
}

/*
Running Soldier
*/
function Soldier(game, spritesheet, x, y) {
    //CustomAnimation(spriteSheet, startX, startY, offset, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale)
    this.animationRight = new CustomAnimation(AM.getAsset("./img/hero.png"), 24, 315, 1, 50, 50, 8, 0.10, 8, true, 1);
	this.animationRightDown = new CustomAnimation(AM.getAsset("./img/hero.png"), 454, 856, 1, 50, 57, 8, 0.10, 8, true, 1);
    this.animationRightUp = new CustomAnimation(AM.getAsset("./img/hero.png"), 25, 856, 1, 50, 57, 8, 0.10, 8, true, 1);
	this.animationLeft = new CustomAnimation(AM.getAsset("./img/hero.png"), 24, 375, 1, 50, 50, 8, 0.10, 8, true, 1);
    this.animationLeftDown = new CustomAnimation(AM.getAsset("./img/hero.png"), 454, 994, 1, 50, 57, 8, 0.10, 8, true, 1);
	this.animationLeftUp = new CustomAnimation(AM.getAsset("./img/hero.png"), 25, 994, 1, 50, 57, 8, 0.10, 8, true, 1);
	//this.animationJumpRight = new CustomAnimation(AM.getAsset("./img/hero.png"), 126, 143, 1, 50, 50, 1, 0.68, 1, false, 1);
    //this.animationJumpLeft = new CustomAnimation(AM.getAsset("./img/hero.png"), 126, 200, 1, 50, 50, 1, 0.68, 1, false, 1);
	this.animationJumpRight = new CustomAnimation(AM.getAsset("./img/hero2.png"), 56, 175, 1, 50, 50, 4, 0.17, 4, false, 1);
    this.animationJumpLeft = new CustomAnimation(AM.getAsset("./img/hero2.png"), 56, 230, 1, 50, 50, 4, 0.17, 4, false, 1);
	this.animationLand = new Animation(AM.getAsset("./img/dust.png"), 258, 52, 1, 0.10, 5, true, 0.5);
	this.animationShield = new CustomAnimation(AM.getAsset("./img/shields.png"), 6, 153, 3, 48, 48, 9, 0.10, 9, true, 1);
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
	this.down = false;
	this.jump = false;
	this.shoot = false;
	this.special = false;
    this.direction = 1;
	this.score = 0;
	this.maxHealth = 3;
	this.shield = 0;
	this.health = this.maxHealth;
	this.coins = 0;
    this.platform = game.platforms[0];
	this.specials = [];
//	this.specials.push("grenade");
	this.currentSpecial = this.specials[0];
	this.shootElapsedTime = 10;
	this.weapon = "basic";
	this.soundDamage = new Sound("audio/damage.wav");
	this.soundJump = new Sound("audio/jump.wav");
    this.boundingbox = new BoundingBox(this.x+2, this.y+2, this.width-7, this.height);
	
    Entity.call(this, game, x, y);
}

Soldier.prototype = new Entity();
Soldier.prototype.constructor = Soldier;

Soldier.prototype.update = function () {
	this.shootElapsedTime += this.game.clockTick;
	this.lastboundingbox = this.boundingbox;
	
	// check for enemy bullets
	for (var i = 0; i < this.game.bulletsBad.length; i++) {
		var bullet = this.game.bulletsBad[i];

		// hit by bullet            
		if (!bullet.hit && this.boundingbox.collide(bullet.boundingbox)) {
			this.soundDamage.play();
			if (DEBUG) console.log("hit!");
			bullet.hit = true;
			if (this.shield > 0) this.shield--;
			else this.health --;
		}
	}

    // moving
    if (this.moving) {
		if (this.direction === 1) this.boundingbox = new BoundingBox(this.x+14, this.y, this.width-13, this.height);
		else this.boundingbox = new BoundingBox(this.x+5, this.y, this.width-17, this.height);

		var moveTick = Math.round(this.game.clockTick * this.speed * this.direction);
		if (this.x + moveTick >= -5 && this.x + moveTick <= 7400) this.x += moveTick;
		if ((Camera.x + moveTick >= 0 && this.x - Camera.x >= 400 && this.x + moveTick <= 7057 && this.direction === 1) 
			|| (Camera.x + moveTick >= 0 && this.x - Camera.x <= 400 && this.x + moveTick <= 6650 && this.direction === -1) ) Camera.x += moveTick;	
		 
	}
		
    // shoot
    if (this.shoot) {
		
		// 0.35 second cooldown
		if (this.shootElapsedTime > 0.35) {
			var compensate = 37;
			var compensateY = 12;
			//var dir = 1;
			var aimY;
			if (this.direction === -1) {
				//dir = -1;
				compensate = -7;
			}
			if (this.up) {
				aimY = 1;
				compensateY -= 13;
			}
			else if (this.down) {
				aimY = -1;
				compensateY += 13;
			}
			else aimY = 0;
			
			var bullet = new Bullet(this.game, AM.getAsset("./img/bullet.png"), this.x + compensate, this.y + compensateY, this.direction, aimY);
			this.game.addEntity(bullet);
			this.game.bullets.push(bullet);
			this.shootElapsedTime = 0; 
		} 
        
    }
	
	// use special
	if (this.special) {
		if (this.specials.length > 0) {
			if (this.currentSpecial === "grenade") {
				// 0.35 second cooldown
				if (this.shootElapsedTime > 0.35) {
					var compensate = 37;
					var compensateY = 12;
					//var dir = 1;
					var aimY;
					if (this.direction === -1) {
						//dir = -1;
						compensate = -7;
					}
					if (this.up) {
						aimY = 1;
						compensateY -= 13;
					}
					else if (this.down) {
						aimY = -1;
						compensateY += 13;
					}
					else aimY = 0;
					
					var grenade = new Grenade(this.game, AM.getAsset("./img/powerUp/grenade.png"), this.x + compensate, this.y + compensateY, this.direction, aimY);
					this.game.addEntity(grenade);
//					this.game.bullets.push(grenade);
					this.soundShoot.play();
					this.shootElapsedTime = 0; 
				} 
			}

			this.specials.splice(this.currentSpecial, 1);

		}
		
	}

    // press up (jump)
    if (this.jump && !this.jumping && !this.falling) {
        this.jumping = true;
        this.basey = this.y;
		this.soundJump.play();
    }
	
    // free fall
    if (this.falling) {
		this.boundingbox = new BoundingBox(this.x+2, this.y+2, this.width-7, this.height);
    
        this.y += this.game.clockTick / this.animationJumpRight.totalTime * 4 * this.jumpHeight;
        
        // check for platform
        for (var i = 0; i < this.game.platforms.length; i++) {
            var pf = this.game.platforms[i];
            
            // landed on top of platform
            if (this.boundingbox.collide(pf.boundingbox) && this.lastboundingbox.bottom < pf.boundingbox.top) {
                if (DEBUG) console.log("Collision!");
                this.falling = false;
                this.y = pf.boundingbox.top - this.height;
                this.platform = pf;
				break;
            }  
        
        }
    }    

	// jumping
     else if (this.jumping) {

		var duration;

        duration = this.animationJumpRight.elapsedTime + this.animationJumpLeft.elapsedTime + this.game.clockTick;
        if (duration > this.animationJumpRight.totalTime / 2) duration = this.animationJumpRight.totalTime - duration;
        duration = duration / this.animationJumpRight.totalTime;

        // parbolic jump
        height = (4 * duration - 4 * duration * duration) * this.jumpHeight;
        this.y = this.basey - height;

        this.lastBottom = this.boundingbox.bottom;
        this.boundingbox = new BoundingBox(this.x+2, this.y+2, this.width-7, this.height);
                
        // check for platform
        for (var i = 0; i < this.game.platforms.length; i++) {
            var pf = this.game.platforms[i];
            
            // landed on top of platform            
            if (this.boundingbox.collide(pf.boundingbox) && this.lastBottom < pf.boundingbox.top) {
                if (DEBUG) console.log("Landed on a platform!");
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
	
	// running
	if (this.moving && !this.jumping && !this.falling) {
		
		// running while aiming down
		if (this.down) {
			if (this.direction === 1) this.animationRightDown.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y-7);
			else this.animationLeftDown.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y-7);
			
		// running while aiming up
		} else if (this.up) {
			if (this.direction === 1) this.animationRightUp.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y-7);
			else this.animationLeftUp.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y-7);
		}
		
		// running while aiming straight
		else {
			if (this.direction === 1) this.animationRight.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
			else this.animationLeft.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);	
		}
		
	}
	
	// jumping
	else if (this.jumping) {
		
		// jumping right
		if (this.direction === 1) {
		    this.animationJumpRight.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
		    if (this.animationJumpRight.isDone()) {
		        this.animationJumpRight.elapsedTime = 0;
				this.jumping = false;
				this.falling = true;
			}	
		}
		
		// jumping left
		else {
		    this.animationJumpLeft.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
		    if (this.animationJumpLeft.isDone()) {
		        this.animationJumpLeft.elapsedTime = 0;
		        this.jumping = false;
				this.falling = true;
			}
		}
		
	}
	
	// falling
	else if (this.falling) {
	    if (this.direction === 1) this.ctx.drawImage(AM.getAsset("./img/hero.png"), 126, 143, 50, 50, this.x - Camera.x, this.y, 50, 50);
		else this.ctx.drawImage(AM.getAsset("./img/hero.png"), 126, 200, 50, 50, this.x - Camera.x, this.y, 50, 50);
	}
	
	// idle
	else if (!this.moving) {
		// aiming down
		if (this.down) {
			if (this.direction === 1) this.ctx.drawImage(AM.getAsset("./img/hero.png"), 25, 739, 50, 57, this.x - Camera.x, this.y-7, 50, 57);
			else this.ctx.drawImage(AM.getAsset("./img/hero.png"), 305, 739, 50, 57, this.x - Camera.x, this.y-7, 50, 57);	
		}

		// aiming up
		else if (this.up) {
			if (this.direction === 1) this.ctx.drawImage(AM.getAsset("./img/hero.png"), 25, 676, 50, 57, this.x - Camera.x, this.y-7, 50, 57);
			else this.ctx.drawImage(AM.getAsset("./img/hero.png"), 305, 676, 50, 57, this.x - Camera.x, this.y-7, 50, 57);	
		}
		
		// aim straight
		else {
			if (this.direction === 1) this.ctx.drawImage(AM.getAsset("./img/hero.png"), 24, 143, 50, 50, this.x - Camera.x, this.y, 50, 50);
			else this.ctx.drawImage(AM.getAsset("./img/hero.png"), 24, 200, 50, 50, this.x - Camera.x, this.y, 50, 50);	
		}
	    
	}
	
	// shielded
	if (this.shield > 0) {
	    this.animationShield.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x + 1, this.y + 3);
	}
	
	// draw UI
	this.drawUI();
	
	// bounding box
	if (DEBUG) {
		this.ctx.strokeStyle = "red";
		this.ctx.strokeRect(this.x - Camera.x, this.y, this.width, this.height);
		this.ctx.strokeStyle = "green";
		this.ctx.strokeRect(this.boundingbox.left - Camera.x, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
	}
	Entity.prototype.draw.call(this);
}


Soldier.prototype.drawUI = function () {
	this.ctx.font = "bold 30px Arial";
	
	// Level
	this.ctx.fillText("Level: 1", 350, 30);
	
	// Score
	if (this.score === 0) this.ctx.fillText("Score: " + this.score, 675, 30);
	else this.ctx.fillText("Score: " + this.score, 675 - ((Math.log10(this.score) + 1) * 10), 30);
	
    // Health
	this.ctx.drawImage(AM.getAsset("./img/hero.png"), 24, 143, 50, 50, 0, 0, 50, 50);
	for (var i = 0; i < this.maxHealth; i++) {
	    if (i < this.health) this.ctx.drawImage(AM.getAsset("./img/heart.png"), 50 + (i * 35), 10, 35, 35);
	    else this.ctx.drawImage(AM.getAsset("./img/heartEmpty.png"), 50 + (i * 35), 10, 35, 35);
	}

	// Shield
	for (var i = 0; i < this.shield; i++) this.ctx.drawImage(AM.getAsset("./img/PowerUp/shield.png"), 50 + (this.maxHealth * 35) + (i * 35), 10, 35, 35);
	
	// Weapons
	this.ctx.drawImage(AM.getAsset("./img/weaponBackground.png"), 145, 0, 148, 106, 0, 50, 79, 53);
	this.ctx.drawImage(AM.getAsset("./img/weaponBackground.png"), 0, 0, 148, 106, 80, 50, 79, 53);
	if (this.weapon === "basic") this.ctx.drawImage(AM.getAsset("./img/bullet.png"), 0, 0, 14, 14, 20, 55, 42, 42);
	if (this.specials.length > 0) {
		this.ctx.drawImage(AM.getAsset("./img/PowerUp/grenade.png"), 0, 0, 512, 512, 105, 61, 30, 30);
	}
	// context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
	
	// Coins
	if (this.coins === 0) this.ctx.drawImage(AM.getAsset("./img/PowerUp/coinIcon.png"), 730, 40, 35, 35);
	else {
		this.ctx.drawImage(AM.getAsset("./img/PowerUp/coinIcon.png"), 740 - (Math.log10(this.coins) + 1) * 10, 40, 35, 35);
		this.ctx.fillText(this.coins, 785 - (Math.log10(this.coins) + 1) * 10, 70);	
	}
		
}

/*
Bullet
*/
function Bullet(game, spritesheet, x, y, direction, aimY) {
    this.animation = new Animation(spritesheet, 14, 14, 8, 1, 8, true, 1);
    this.animationExplosion = new CustomAnimation(AM.getAsset("./img/explosions.png"), 641, 79, 5, 15, 15, 6, .05, 6, false, 1);
    this.speed = 500;
    this.ctx = game.ctx;
	this.game = game;
    this.x = x;
    this.y = y;
	this.width = 14;
	this.height = 14;
	this.startX = x;
	this.direction = direction;
	this.aimY = aimY;
	this.hit = false;
	this.soundShoot = new Sound("audio/shoot-1.wav");
	this.soundHit = new Sound("audio/hit.wav");
	this.soundShoot.play();
	this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
    Entity.call(this, game, this.x, this.y);
}

Bullet.prototype = new Entity();
Bullet.prototype.constructor = Bullet;

Bullet.prototype.update = function () {
	if (!this.hit) {
		this.x += this.game.clockTick * this.speed * this.direction;
		this.y -= this.game.clockTick * this.speed * this.aimY/2;
		this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
		
		var distance = Math.abs(this.x - this.startX);
		if (distance > 400) {
			if (DEBUG) console.log("Bullet removed.");	
			for( var i = 0; i < this.game.bullets.length; i++){ 
				if ( this.game.bullets[i] === this) {
					this.game.bullets.splice(i, 1); 
					this.removeFromWorld = true;
				}
			}
		}
    }
	
    Entity.prototype.update.call(this);
}

Bullet.prototype.draw = function () {
	if (this.hit) {
		
		if (this.animationExplosion.elapsedTime === 0) this.soundHit.play();
		
		this.animationExplosion.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
		if (this.animationExplosion.isDone()) {
			for( var i = 0; i < this.game.bullets.length; i++){ 
				if ( this.game.bullets[i] === this) {
					this.game.bullets.splice(i, 1);				
					this.removeFromWorld = true;
				}
			}	
		}
		
	}
    else this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
	
	/*
	ctx.save();
    ctx.translate(x + this.width / 2, y + this.height / 2);
    ctx.rotate(this.angle * Math.PI / 180);
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height,
                            -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
	*/
    Entity.prototype.draw.call(this);
}


/*
Grenade
*/
function Grenade(game, spritesheet, x, y, direction, aimY) {
    this.animation = new Animation(spritesheet, 512, 512, 8, 1, 8, true, 0.25);
    this.animationExplosion = new CustomAnimation(AM.getAsset("./img/explosions.png"), 641, 79, 5, 15, 15, 6, .05, 6, false, 1);
    this.speed = 500;
    this.ctx = game.ctx;
	this.game = game;
    this.x = x;
    this.y = y;
	this.width = 512;
	this.height = 512;
	this.startX = x;
	this.direction = direction;
	this.aimY = aimY;
	this.hit = false;
	this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
    Entity.call(this, game, this.x, this.y);
}

Grenade.prototype = new Entity();
Grenade.prototype.constructor = Grenade;

Grenade.prototype.update = function () {
	if (!this.hit) {
		this.x += this.game.clockTick * this.speed * this.direction;
		this.y -= this.game.clockTick * this.speed * this.aimY/2;
		this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
		
		var distance = Math.abs(this.x - this.startX);
		if (distance > 400) {
			if (DEBUG) console.log("Bullet removed.");	
			for( var i = 0; i < this.game.bullets.length; i++){ 
				if ( this.game.bullets[i] === this) {
					this.game.bullets.splice(i, 1); 
					this.removeFromWorld = true;
				}
			}
		}
    }
	
    Entity.prototype.update.call(this);
}

Grenade.prototype.draw = function () {
	if (this.hit) {
		this.animationExplosion.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
		if (this.animationExplosion.isDone()) {
			for( var i = 0; i < this.game.bullets.length; i++){ 
				if ( this.game.bullets[i] === this) {
					this.game.bullets.splice(i, 1);
					this.removeFromWorld = true;
				}
			}	
		}
		
	}
    else this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
	
	/*
	ctx.save();
    ctx.translate(x + this.width / 2, y + this.height / 2);
    ctx.rotate(this.angle * Math.PI / 180);
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height,
                            -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
	*/
    Entity.prototype.draw.call(this);
}


/*
Cannonball
*/
function Cannonball(game, x, y, direction) {
    this.animation = new CustomAnimation(AM.getAsset("./img/robots.png"), 162, 187, 0, 6, 6, 1, 1, 1, true, 2);
    this.animationExplosion = new CustomAnimation(AM.getAsset("./img/explosions.png"), 641, 367, 5, 15, 15, 6, .05, 6, false, 1);
    this.speed = 250;
    this.ctx = game.ctx;
	this.game = game;
    this.x = x;
    this.y = y;
	this.width = 12;
	this.height = 12;
	this.startX = x;
	this.direction = direction;
	this.hit = false;
	this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
    Entity.call(this, game, this.x, this.y);
}

Cannonball.prototype = new Entity();
Cannonball.prototype.constructor = Cannonball;

Cannonball.prototype.update = function () {
	if (!this.hit) {
		this.x += this.game.clockTick * this.speed * this.direction;
		this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
		
		var distance = Math.abs(this.x - this.startX);
		if (distance > 900) {
			if (DEBUG) console.log("Cannonball removed.");	
			for( var i = 0; i < this.game.bulletsBad.length; i++){ 
				if ( this.game.bulletsBad[i] === this) {
					this.game.bulletsBad.splice(i, 1); 
					this.removeFromWorld = true;
				}
			}
		}
    }
	
    Entity.prototype.update.call(this);
}

Cannonball.prototype.draw = function () {
	if (this.hit) {
		this.animationExplosion.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
		if (this.animationExplosion.isDone()) {
			for( var i = 0; i < this.game.bulletsBad.length; i++){ 
				if ( this.game.bulletsBad[i] === this) {
					this.game.bulletsBad.splice(i, 1);
					this.removeFromWorld = true;
				}
			}	
		}
		
	}
    else this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - Camera.x, this.y);
    Entity.prototype.draw.call(this);
}

var Camera = {
    x: 0,
	//x: 5600,
    width: WINDOW_WIDTH
};

AM.queueDownload("./img/hero.png");
AM.queueDownload("./img/hero2.png");
AM.queueDownload("./img/layer1.png");
AM.queueDownload("./img/layer2.png");
AM.queueDownload("./img/bullet.png");
AM.queueDownload("./img/explosions.png");
AM.queueDownload("./img/robots.png");
AM.queueDownload("./img/mechs.png");
AM.queueDownload("./img/heart.png");
AM.queueDownload("./img/weaponBackground.png");
AM.queueDownload("./img/heartEmpty.png");
AM.queueDownload("./img/wolf.png");
AM.queueDownload("./img/ForestTiles.png");
AM.queueDownload("./img/dust.png");
AM.queueDownload("./img/shields.png");
AM.queueDownload("./img/explosion.png");
// powerups
AM.queueDownload("./img/PowerUp/health.png");
AM.queueDownload("./img/PowerUp/coin.png");
AM.queueDownload("./img/PowerUp/coinIcon.png");
AM.queueDownload("./img/PowerUp/shield.png");
AM.queueDownload("./img/PowerUp/grenade.png");


AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

	var gameEngine = new GameEngine();
    var platforms = [];
    gameEngine.platforms = platforms;
    var bullets = [];
	gameEngine.bullets = bullets;
	var bulletsBad = [];
	gameEngine.bulletsBad = bulletsBad;
	var powerups = [];
	gameEngine.powerups = powerups;
	var monsters = [];
	gameEngine.monsters = monsters;
	
    gameEngine.init(ctx);
    gameEngine.start();

	// Backgrounds (gameEngine, spritesheet, x, y, speed, numberOfRepeats)
	gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer1.png"), -1535, 0, 35, 7));
	gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/layer2.png"), -1535, -50, 75, 8));
	
	// Waterfall(game, spritesheet, sourceXWater, sourceYWater, sourceXTopSplash, sourceYTopSplash, sourceXBotSplash, sourceYBotSplash, 
	// x, y, width, height, waterfallWidth, waterfallHeight)
	// waterfall
	
	gameEngine.addEntity(new Waterfall(gameEngine, AM.getAsset("./img/ForestTiles.png"), 318, 679, 490, 679, 490, 716, 
	6650, 300, 50, 50, 16, 6));
	
	// TilePlatform(game, spritesheet, sourceXLeft, sourceYLeft, sourceXMid, sourceYMid, sourceXRight, sourceYRight, x, y, width, height, numberOfTiles) {
	var pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 0, 500, 50, 50, 18);
	gameEngine.addEntity(pf);
	platforms.push(pf);

	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 1000, 500, 50, 50, 3);
	gameEngine.addEntity(pf);
	platforms.push(pf);

	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 2300, 200, 50, 50, 18);
	gameEngine.addEntity(pf);
	platforms.push(pf);

	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 2150, 300, 50, 50, 6);
	gameEngine.addEntity(pf);
	platforms.push(pf);

	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 2300, 500, 50, 50, 8);
	gameEngine.addEntity(pf);
	platforms.push(pf);	
	
	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 2850, 500, 50, 50, 2);
	gameEngine.addEntity(pf);
	platforms.push(pf);
	
	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 1400, 400, 50, 50, 18);
	gameEngine.addEntity(pf);
	platforms.push(pf);
	
	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 1250, 500, 50, 50, 9);
	gameEngine.addEntity(pf);
	platforms.push(pf);
	
	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 3300, 500, 50, 50, 18);
	gameEngine.addEntity(pf);
	platforms.push(pf);
	
	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 4250, 400, 50, 50, 13);
	gameEngine.addEntity(pf);
	platforms.push(pf);
	
	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 5000, 400, 50, 50, 13);
	gameEngine.addEntity(pf);
	platforms.push(pf);

	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 5700, 300, 50, 50, 19);
	gameEngine.addEntity(pf);
	platforms.push(pf);
	
	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 6650, 450, 50, 50, 3);
	gameEngine.addEntity(pf);
	platforms.push(pf);

	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 7300, 450, 50, 50, 3);
	gameEngine.addEntity(pf);
	platforms.push(pf);
	
	pf = new TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 23, 201, 77, 201, 131, 201, 23, 255, 77, 255, 131, 255, 6650, 550, 50, 50, 16);
	gameEngine.addEntity(pf);
	platforms.push(pf);
	
    // dark platform
    //TilePlatform(gameEngine, AM.getAsset("./img/ForestTiles.png"), 19, 406, 73, 406, 127, 406, 19, 460, 73, 460, 127, 460, 3000, 500, 50, 50, 20)

    // Tile(game, spritesheet, sourceX, sourceY, width, height, x, y, numberOfXRepeats, numberOfYRepeats)
    // water
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 318, 788, 50, 50, 0, 600, 200, 2) );

    // rocks
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 74, 866, 30, 16, 100, 500-16, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 74, 866, 30, 16, 650, 500-16, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 38, 867, 30, 15, 1500, 400 - 15, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 38, 867, 30, 15, 2000, 400 - 15, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 38, 867, 30, 15, 2700, 200 - 15, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 38, 867, 30, 15, 3500, 500 - 15, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 38, 867, 30, 15, 4050, 500 - 15, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 38, 867, 30, 15, 4650, 400 - 15, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 38, 867, 30, 15, 5550, 400 - 15, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 38, 867, 30, 15, 5900, 300 - 15, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 38, 867, 30, 15, 6100, 300 - 15, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 38, 867, 30, 15, 6550, 300 - 15, 1, 1) );

    // small trees
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 77, 692, 28, 39, 400, 500 - 39, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 77, 692, 28, 39, 1700, 400 - 39, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 77, 692, 28, 39, 2400, 200 - 39, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 77, 692, 28, 39, 2900, 200 - 39, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 77, 692, 28, 39, 4400, 400 - 39, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 77, 692, 28, 39, 5200, 400 - 39, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 77, 692, 28, 39, 6450, 300 - 39, 1, 1) );
	
	// plant 4 (108, 72, 20, 43)
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 108, 782, 20, 43, 2600, 500 - 43, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 108, 782, 20, 43, 3800, 500 - 43, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 108, 782, 20, 43, 5400, 400 - 43, 1, 1) );
	gameEngine.addEntity(new Tile(gameEngine, AM.getAsset("./img/ForestTiles.png"), 108, 782, 20, 43, 6300, 300 - 43, 1, 1) );
	
	// Hero
    //var Hero = new Soldier(gameEngine, AM.getAsset("./img/soldierRight.png"), 6000, 0);
	var Hero = new Soldier(gameEngine, AM.getAsset("./img/soldierRight.png"), 200, 0);
    gameEngine.addEntity(Hero);
	gameEngine.Hero = Hero;
	
	// Power Ups
	
	power = new PowerUp(gameEngine, AM.getAsset("./img/PowerUp/coin.png"), 1050, 500 - (0.07 * 496), 494, 496, 0.07, "coin");
    gameEngine.addEntity(power);
	powerups.push(power);
	
	power = new PowerUp(gameEngine, AM.getAsset("./img/PowerUp/shield.png"), 2875, 500 - (0.15 * 256), 256, 256, 0.15, "shield");
    gameEngine.addEntity(power);
	powerups.push(power);
	

	// Monsters
	
	monster = new FlyingRobot(gameEngine, AM.getAsset("./img/robots.png"), 2150, 350, 50, 50, false, "none");
	gameEngine.addEntity(monster);
	monsters.push(monster);
	
	monster = new FlyingRobot(gameEngine, AM.getAsset("./img/robots.png"), 2800, 150, 50, 50, false, "none");
	gameEngine.addEntity(monster);
	monsters.push(monster);
	
	/*
	monster = new FlyingRobot(gameEngine, AM.getAsset("./img/robots.png"), 3000, 150, 50, 50, true, "health");
	gameEngine.addEntity(monster);
	monsters.push(monster);
	*/
	
	monster = new Turret(gameEngine, AM.getAsset("./img/robots.png"), 1650, 450, 50, 50, true, "coin");
	gameEngine.addEntity(monster); 
	monsters.push(monster);

	monster = new Turret(gameEngine, AM.getAsset("./img/robots.png"), 3150, 150, 50, 50, true, "coin");
	gameEngine.addEntity(monster);
	monsters.push(monster);
	
	monster = new Mech(gameEngine, AM.getAsset("./img/mechs.png"), 4000, 500-81, 140, 108, true, "coin");
	gameEngine.addEntity(monster);
	monsters.push(monster);
	
	monster = new FlyingRobot(gameEngine, AM.getAsset("./img/robots.png"), 4850, 350, 50, 50, false, "none");
	gameEngine.addEntity(monster);
	monsters.push(monster);
	
	monster = new Turret(gameEngine, AM.getAsset("./img/robots.png"), 5600, 350, 50, 50, true, "coin");
	gameEngine.addEntity(monster);
	monsters.push(monster);
	
	monster = new FlyingRobot(gameEngine, AM.getAsset("./img/robots.png"), 6150, 250, 50, 50, false, "none");
	gameEngine.addEntity(monster);
	monsters.push(monster);
	
	monster = new Turret(gameEngine, AM.getAsset("./img/robots.png"), 6600, 250, 50, 50, true, "health");
	gameEngine.addEntity(monster);
	monsters.push(monster);
	
	// Boss 1
	//var Boss = new Boss1(gameEngine, AM.getAsset("./img/wolf.png"), 3700, 500-108, 140, 108);
	//gameEngine.addEntity(Boss);
	//monsters.push(Boss);
	
	soundSong.play();
	
	// Key Listener
    document.addEventListener('keydown', function(e){

		e.preventDefault();
		switch(e.keyCode) {
			// Spacebar
			case 32:
			    Hero.space = true;
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
				
			// Down
            case 40:
                Hero.down = true;
                break;
				
			// X
            case 88:
                Hero.jump = true;
                break;
				
			// C
            case 67:
                Hero.shoot = true;
                break;
				
			// Z
            case 90:
                Hero.special = true;
                break;
				
		}
      });
	document.addEventListener('keyup', function(e){
		
		e.preventDefault();
		switch (e.keyCode) {
		    // space
		    case 32:
		        Hero.space = false;
		        break;

			// left
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
				
			//down
			case 40:
			    Hero.down = false;
			    break;
				
			// X
            case 88:
                Hero.jump = false;
                break;
				
			// C
            case 67:
                Hero.shoot = false;
                break;
				
			// Z
            case 90:
                Hero.special = false;
                break;
		}
	});
    
	console.log("All Done!");
});