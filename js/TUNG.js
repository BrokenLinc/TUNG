(function($, app){
	var TUNG = namespace('TUNG');

	TUNG.gravity = 2;
	TUNG.ground_y = 130;
	TUNG.ether = new EventDispatcher();

	TUNG.game = function(spec) {
		var game_scene,
			that = new tarmac.game($.extend({
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
		that.start = function(){
			game_scene = TUNG.game_scene();
			that.addEntity(game_scene);
		};

		return that;
	};

	TUNG.game_scene = function() {
		//init
		var hero = TUNG.hero({ max_y: TUNG.ground_y - 60 }),
 			planet = TUNG.planet({ y: TUNG.ground_y }),
 			that = tarmac.scene({
 				entities:[planet, hero]
 			});

 		//custom event listeners
 		TUNG.ether.on('tongue-touch', function(e){
 			if(!TUNG.tongue_got_something) {
	 			planet.scale /= (1 + e.remove().mass/1000);
	 			TUNG.tongue_got_something = true;
	 		}
 		});

 		//overrides
 		that.adjust = function() {
 			//keyboard input
 			if(tarmac.keysDown[']']) planet.scale *= 1.05;
 			if(tarmac.keysDown['[']) planet.scale /= 1.05;
 			if(tarmac.keysDown['LEFT']) {
 				hero.isMirrored = true;
 				planet.rotate(0.01/planet.scale);
 			}
 			if(tarmac.keysDown['RIGHT']) {
 				hero.isMirrored = false;
 				planet.rotate(-0.01/planet.scale);
 			}
 		};

		return that;
	};

	TUNG.hero = function(spec) {
		//init
		var eyes = TUNG.tungy_eyes({ x:15, y:20 }),
			body = tarmac.sprite('body'),
			mouth = tarmac.sprite('mouth', { y:50 }),
			tongue = TUNG.tongue({ x: -16, y:50, visible:false }),
			that = tarmac.gameEntity($.extend({
				scale: 0.8,
				entities: [body, eyes, mouth, tongue]
			}, spec));

		that.dy = 0;
		that.max_y = spec.max_y || 0;

 		//keyboard input
 		tarmac.keysDown.on('UP', function(){
 			that.jump();
 		});
 		tarmac.keysDown.on('X', function(){
 			that.lick();
 		});

 		//methods
 		that.isGrounded = function() {
 			return that.y >= that.max_y;
 		};
 		that.jump = function() {
 			if(that.isGrounded()) that.dy = -20;
 		};
 		that.lick = function() {
 			TUNG.tongue_got_something = false;
 			mouth.frame  = { x:0, y:1 };
 			tongue.playOnce('tongue-lick', function(){
 				mouth.frame  = { x:0, y:0 };
 				tongue.visible = false;
 			}).visible = true;
 		};

 		//overrides
 		that.adjust = function() {
 			that.dy += TUNG.gravity;
 			that.y += that.dy;
 			if(that.y > that.max_y) {
 				that.y = that.max_y;
 				that.dy = 0;
 			}
 		};

		return that;
	};

	//TODO: fold animation config & logic into resources and tarmac.sprite
	TUNG.tungy_eyes = function(spec) {
		//init
		var blink = 0,
			blink_open = 3000/30,
			blink_closed = 3100/30,
			that = tarmac.sprite('eyes', spec);

		//overrides
		that.process = function() {
			blink += 1;
			if(blink<blink_open) {
				that.frame.y = 0;
			} else if(blink<blink_closed) {
				that.frame.y = 1;
			} else {
				blink = 0;
			}

			that.processChildren();
			return that;
		}

		return that;
	};

	TUNG.planet = function(spec) {
		//init
		var globe = TUNG.globe({ y: 1000 }),
			that = tarmac.gameEntity($.extend({
				entities:[globe]
			},spec));

		//methods
		that.rotate = function(deg) {
			globe.rotation += deg;
		};

		return that;
	};

	TUNG.globe = function(spec) {
		//init
		var that = tarmac.gameEntity($.extend({
				entities:[
					//TUNG.tungy_eyes({ y:-1000 }),
					tarmac.shapes.circle({ radius: spec.y })
				]
			},spec));

		//overrides
		that.start = function() {
			for(var i = 50; i > 0; i -= 1) {
				var mass = 2 + i * 1,
					rad = 1000 + mass,
					rot = Math.random() * Math.PI*2;
				that.addEntity(TUNG.rock({
					x: Math.cos(rot) * rad, 
					y: Math.sin(rot) * rad, 
					mass:mass,
					fill: '#'+Math.floor(Math.random()*16777215).toString(16)
				}));
			}
		};

		return that;
	};

	TUNG.rock = function(spec) {
		//init
		var test_points, 
			radius = Math.sqrt(spec.mass) * 10,
			that = tarmac.shapes.circle($.extend({
				radius:radius
			},spec));

		that.mass = spec.mass;

		//custom event listener
		TUNG.ether.on('tongue-zap', function(e) {
			test_points = e;
		});

		//overrides
		that.adjust = function() {
			if(test_points) {
				for(var i = 0; i < test_points.length; i += 1) {
					var test_point = test_points[i],
						p = app.mat.globalToLocal(test_point);
					//circle test
					if(pointsCloserThan(p, {x:0, y:0}, radius)) {
						TUNG.ether.trigger('tongue-touch', that); 
					}
					//TODO: rect test for other shapes
					test_point = null;
				}
			}
		};

		return that;
	};

	TUNG.tongue = function(spec) {
		//init
		var that = tarmac.sprite('tongue', spec);

		//overrides
		that.onAnimate = function() {
			var x = 60 + 25 * that.frame.y,
				c = [{x:0, y:0, r:15}];
			for(var i = x - 15; i > 0; i-=20) {
				var p = app.mat.localToGlobal({ x:i, y:0 });
				c.push({ x:p.x, y:p.y, r:15 });
			}
			TUNG.ether.trigger('tongue-zap', c);
		};

		return that;
	}

})(jQuery, tarmac);