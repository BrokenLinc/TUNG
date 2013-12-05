(function($, tarmac){
	var TUNG = namespace('TUNG');

	TUNG.game = function(spec) {
		var that = new tarmac.game(spec);

		var game_scene;

		//scene stuff
		that.init = function(){
			game_scene = TUNG.tungy_scene().init();
			that.entities.push(game_scene);
		};

		return that;
	};

	TUNG.tungy_scene = function(spec) {
		var that = tarmac.gameEntity(spec),
			super_process = that.process,
			tungy;

		that.init = function(){
 			tungy = TUNG.tungy();
 			that.entities.push(tungy);

 			return that;
		};

		that.process = function() {
			//origin/scene-scaling
			var w = tarmac.canvas.width;
			var h = tarmac.canvas.height;
			that.x = w/2;
			that.y = h/2;
			that.scale = Math.min(w/800, h/450);
			return super_process();
		}

		return that;
	};

	TUNG.tungy = function(spec) {
		var eyes = TUNG.tungy_eyes(),
		that = tarmac.gameEntity({
				resource: tarmac.resourceManager.byKey('body'),
			scale: 0.8,
			y: 80,
			entities: [eyes]
			});

		return that;
	};

	TUNG.tungy_eyes = function(spec) {
		var blink = 0;
		var blink_open = 3000/30;
		var blink_closed = 3100/30;
		that = tarmac.gameEntity({
			resource: tarmac.resourceManager.byKey('eyes'),
			x:-6,
			y:-82
		}),
		super_process = that.process;

		that.process = function() {
			blink += 1;
			if(blink<blink_open) {
				that.spritePos.y = 0;
			} else if(blink<blink_closed) {
				that.spritePos.y = 1;
			} else {
				blink = 0;
			}
			return super_process();
		}

		return that;
	};

	// TUNG.crazy_spinner_scene = function(spec) {
	// 	var that = tarmac.gameEntity(spec);

	// 	var spinner;

	// 	that.init = function(){
	// 		$(tarmac.canvas).on('mousemove', function(e){
	// 			spinner.x = e.pageX;
	// 			spinner.y = e.pageY;
	// 		});
 // 			spinner = TUNG.crazy_spinner({num:1});
 // 			that.entities.push(spinner);

 // 			return that;
	// 	};

	// 	return that;
	// };

	// TUNG.crazy_spinner = function(spec) {
	// 	var entities = spec.num < 10? [TUNG.crazy_spinner({num:spec.num+1})] : null; 
	// 	var that = tarmac.gameEntity({
 // 				resource: tarmac.resourceManager.byKey('352-rings'),
	// 			scale: 0.7,
	// 			x: 210,
	// 			entities: entities
 // 			}),
	// 		super_process = that.process;

	// 	that.process = function() {
	// 		that.rotation += 0.01;
	// 		return super_process();
	// 	}

	// 	return that;
	// };

})(jQuery, tarmac);