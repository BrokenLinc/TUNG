(function($, app){
	var TUNG = namespace('TUNG');

	TUNG.game = function(spec) {
		var game_scene,
			that = new tarmac.game(spec);

		//init after resources are loaded
		that.init = function(){
			game_scene = TUNG.game_scene();
			that.entities.push(game_scene);
		};

		return that;
	};

	TUNG.game_scene = function() {
		var doJump, 
			hero_max_y = 60,
			hero = TUNG.hero({ y: -hero_max_y }),
 			planet = TUNG.planet({ y: hero_max_y+70 }),
 			that = tarmac.scene({
 				entities:[planet, hero]
 			});

 		tarmac.keysDown.on('UP', function(){
 			if(hero.y >= hero_max_y) hero.dy = -20;
 		});

 		that.adjust = function() {
 			//TODO: consider adding "gravity" behavior to gameEntities
 			//TODO: consider adding "jump" and "isGrounded" methods to hero
 			hero.dy += 2;
 			hero.y += hero.dy;
 			if(hero.y > hero_max_y) {
 				hero.y = hero_max_y;
 				hero.dy = 0;
 			}

 			//NEXT: determine how/when to detect tongue
 			//proximity of item center to end of tongue (circle)
 			//overlapping a hit area (rectange)

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
		var eyes = TUNG.tungy_eyes({ x:15, y:20 }),
			body = tarmac.sprite('body'),
			that = tarmac.gameEntity($.extend({
				scale: 0.8,
				entities: [body, eyes]
			}, spec));

		that.dy = 0;

		return that;
	};

	//TODO: fold animation config & logic into resources and tarmac.sprite
	TUNG.tungy_eyes = function(spec) {
		var blink = 0;
		var blink_open = 3000/30;
		var blink_closed = 3100/30;
		var that = tarmac.sprite('eyes', spec);

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
		var globe = TUNG.globe({ y: 1000 }),
			that = tarmac.gameEntity($.extend({
				entities:[globe]
			},spec));

		that.rotate = function(deg) {
			globe.rotation += deg;
		};

		return that;
	};

	TUNG.globe = function(spec) {
		var that = tarmac.gameEntity($.extend({
				entities:[
					tarmac.shapes.circle({ radius: spec.y }), 
					TUNG.tungy_eyes({ y:-1000 })]
			},spec));

		return that;
	};

})(jQuery, tarmac);