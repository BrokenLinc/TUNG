(function($, tarmac){
	var TUNG = namespace('TUNG');

	TUNG.game = function(spec) {
		var that = new tarmac.game(spec);

		var game_scene;

		//scene stuff
		that.init = function(){
			game_scene = TUNG.crazy_spinner_scene().init();
		};
		that.process = function() {
			game_scene.process();
		}
		that.update = function() {
			game_scene.update();	
		};


		return that;
	};

	TUNG.crazy_spinner_scene = function(spec) {
		var that = tarmac.scene(spec);

		var spinner;

		that.init = function(){
			$(tarmac.canvas).on('mousemove', function(e){
				spinner.x = e.pageX;
				spinner.y = e.pageY;
			});
 			spinner = tarmac.gameEntity({resource: tarmac.resourceManager.byKey('352-rings')});
 			that.entities.push(spinner);

 			return that;
		};
		that.process = function() {
			spinner.rotation += 0.1;
			spinner.scale = 0.2;

			return that;
		}

		return that;
	};

})(jQuery, tarmac);