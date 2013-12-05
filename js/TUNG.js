(function($, tarmac){
	var TUNG = namespace('TUNG');

	TUNG.game = function(spec) {
		var that = new tarmac.game(spec);

		var game_scene;

		//scene stuff
		that.init = function(){
			game_scene = TUNG.tungy_scene().init();
		};
		that.process = function() {
			game_scene.process();
		}
		that.update = function() {
			game_scene.update();	
		};


		return that;
	};

	TUNG.tungy_scene = function(spec) {
		var that = tarmac.gameEntity(spec),
			super_process = that.process;

		var tungy;

		that.init = function(){
 			tungy = tarmac.gameEntity({
 				resource: tarmac.resourceManager.byKey('tungy'),
 				scale: 0.8,
 				y: 80
 			});
 			that.entities.push(tungy);

 			return that;
		};

		that.process = function() {
			var w = tarmac.canvas.width;
			var h = tarmac.canvas.height;
			that.x = w/2;
			that.y = h/2;
			that.scale = Math.min(w/800, h/450);
			return super_process();
		}

		return that;
	};

	TUNG.crazy_spinner_scene = function(spec) {
		var that = tarmac.gameEntity(spec);

		var spinner;

		that.init = function(){
			$(tarmac.canvas).on('mousemove', function(e){
				spinner.x = e.pageX;
				spinner.y = e.pageY;
			});
 			spinner = TUNG.crazy_spinner({num:1});
 			that.entities.push(spinner);

 			return that;
		};

		return that;
	};

	TUNG.crazy_spinner = function(spec) {
		var entities = spec.num < 10? [TUNG.crazy_spinner({num:spec.num+1})] : null; 
		var that = tarmac.gameEntity({
 				resource: tarmac.resourceManager.byKey('352-rings'),
				scale: 0.7,
				x: 210,
				entities: entities
 			}),
			super_process = that.process;

		that.process = function() {
			that.rotation += 0.01;
			return super_process();
		}

		return that;
	};

})(jQuery, tarmac);