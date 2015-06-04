window.TUNG = (function($, tarmac){
	var TUNG = {};

	var	gravity = 2,
		ground_y = 130,
		ether = new EventDispatcher(),
		tongue_got_something = false;

	TUNG.setup = function(spec) {
		tarmac.setup($.extend({
			//TODO: convert to indexed names?
			resources: [{
				path: 'body.svg',
				spriteMap: {x:2, y:2}
			},{
				path: 'eyes.svg',
				spriteMap: {x:1, y:10}
			},{
				path: 'mouth.svg',
				spriteMap: {x:1, y:10}
			},{
				path: 'tongue.svg',
				spriteMap: {x:2, y:7},
				origin: {x:0.10, y:0.5}
			}],
			sprite_animations: [{
				key: 'tongue-lick',
				d: 60,
				keyframes:[
					{x:0, y:0},
					{y:2},
					{y:4},
					{y:6},
					{x:1, y:6},
					{y:4},
					{y:2},
					{y:0}
				]
			}]
		},spec));

		//after resources are loaded
		tarmac.start = function(){
			tarmac.addEntity(new GameScene());
		};
	};

	

	function GameScene() {
		tarmac.Scene.call(this);

		var self = this;

		this.hero = new Hero({ max_y: ground_y - 60 });
 		this.planet = new Planet({ y: ground_y });

 		this.addEntity(this.planet);
 		this.addEntity(this.hero);

 		//custom event listeners
 		ether.on('tongue-touch', function(e){
 			if(!tongue_got_something) {
	 			self.planet.scale /= (1 + e.remove().mass/1000);
	 			tongue_got_something = true;
	 		}
 		});
 	}
	GameScene.prototype = new tarmac.Scene();
	GameScene.prototype.adjust = function() {
		//keyboard input
		if(tarmac.keysDown[']']) this.planet.scale *= 1.05;
		if(tarmac.keysDown['[']) this.planet.scale /= 1.05;
		if(tarmac.keysDown['LEFT']) {
			this.hero.isMirrored = true;
			this.planet.rotate(0.01/this.planet.scale);
		}
		if(tarmac.keysDown['RIGHT']) {
			this.hero.isMirrored = false;
			this.planet.rotate(-0.01/this.planet.scale);
		}
	};



	function Hero(spec) {
		tarmac.GameEntity.call(this, $.extend({
			scale: 0.8
		}, spec));

		var self = this;

		this.body = new tarmac.Sprite('body');
		this.eyes = new Eyes({ x:15, y:20 });
		this.mouth = new tarmac.Sprite('mouth', { y:50 });
		this.tongue = new Tongue({ x: -16, y:50, visible:false });

		this.dy = 0;
		this.max_y = spec.max_y || 0;

		this.addEntity(this.body);
		this.addEntity(this.eyes);
		this.addEntity(this.mouth);
		this.addEntity(this.tongue);

 		//keyboard input
 		tarmac.keysDown.on('UP', function(){
 			self.jump();
 		});
 		tarmac.keysDown.on('X', function(){
 			self.lick();
 		});
 	}
 	Hero.prototype = new tarmac.GameEntity();
	Hero.prototype.isGrounded = function() {
		return this.y >= this.max_y;
	};
	Hero.prototype.jump = function() {
		if(this.isGrounded()) this.dy = -20;
	};
	Hero.prototype.lick = function() {
		var self = this;

		tongue_got_something = false;
		this.mouth.frame  = { x:0, y:1 };
		this.tongue.playOnce('tongue-lick', function(){
			self.mouth.frame  = { x:0, y:0 };
			self.tongue.visible = false;
		}).visible = true;
	};
	Hero.prototype.adjust = function() {
		this.dy += gravity;
		this.y += this.dy;
		if(this.y > this.max_y) {
			this.y = this.max_y;
			this.dy = 0;
		}
	};



	//TODO: fold animation config & logic into resources and tarmac.Sprite
	function Eyes(spec) {
		tarmac.Sprite.call(this, 'eyes', spec);

		this.blink = 0,
		this.blink_open = 3000/30,
		this.blink_closed = 3100/30;
	}
	Eyes.prototype = new tarmac.Sprite();
	Eyes.prototype.process = function() {
		this.blink += 1;
		if(this.blink<this.blink_open) {
			this.frame.y = 0;
		} else if(this.blink<this.blink_closed) {
			this.frame.y = 1;
		} else {
			this.blink = 0;
		}

		this.processChildren();
		return this;
	}



	function Planet(spec) {
		tarmac.GameEntity.call(this, spec);

		this.globe = new Globe({ y: 1000 });
		this.addEntity(this.globe);
	}
	Planet.prototype = new tarmac.GameEntity();
	Planet.prototype.rotate = function(deg) {
		this.globe.rotation += deg;
	};



	function Globe(spec) {
		tarmac.GameEntity.call(this, spec);

		//this.addEntity(new Eyes({ y:-1000 }));
		this.addEntity(new tarmac.shapes.Circle({ radius: spec.y }));
	}
	Globe.prototype = new tarmac.GameEntity();
	Globe.prototype.start = function() {
		for(var i = 50; i > 0; i -= 1) {
			var mass = 2 + i * 1,
				rad = 1000 + mass,
				rot = Math.random() * Math.PI*2;
			this.addEntity(new Rock({
				x: Math.cos(rot) * rad, 
				y: Math.sin(rot) * rad, 
				mass:mass,
				fill: '#'+Math.floor(Math.random()*16777215).toString(16)
			}));
		}
	};



	function Rock(spec) {
		tarmac.shapes.Circle.call(this, $.extend({
			radius: Math.sqrt(spec.mass) * 10
		},spec));

		this.mass = spec.mass;

		var self = this;

		//custom event listener
		ether.on('tongue-zap', function(e) {
			self.test_points = e;
		});
	}
	Rock.prototype = new tarmac.shapes.Circle();
	Rock.prototype.adjust = function() {
		if(this.test_points) {
			for(var i = 0; i < this.test_points.length; i += 1) {
				var test_point = this.test_points[i],
					p = tarmac.mat.globalToLocal(test_point);
				//circle test
				if(pointsCloserThan(p, {x:0, y:0}, this.radius)) {
					ether.trigger('tongue-touch', this); 
				}
				//TODO: rect test for other shapes
				test_point = null;
			}
		}
	};



	function Tongue(spec) {
		tarmac.Sprite.call(this, 'tongue', spec);
	}
	Tongue.prototype = new tarmac.Sprite();
	Tongue.prototype.onAnimate = function() {
		var x = 60 + 25 * this.frame.y,
			c = [{x:0, y:0, r:15}];
		for(var i = x - 15; i > 0; i-=20) {
			var p = tarmac.mat.localToGlobal({ x:i, y:0 });
			c.push({ x:p.x, y:p.y, r:15 });
		}
		ether.trigger('tongue-zap', c);
	};



	return TUNG;

})(window.jQuery, window.tarmac);