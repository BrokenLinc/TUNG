(function($){
	var app = namespace('tarmac');

	app.game = function(spec) {

		var that = {};

		//global init
		app.background = spec.background;
		app.canvas = spec.canvas;
		app.ctx = app.canvas.getContext('2d');
		app.resourceManager.container = spec.resourceContainer;

		//canvas setup
		var fit_canvas_to = function(element) {
			app.canvas.width = $(element).width();
			app.canvas.height = $(element).height();
		};
		var game_loop_timeout,
			doResizeCanvas = false;
		$(window).on('resize', function(){
			doResizeCanvas = true;
		}).trigger('resize');

		//preloader
		var isPreloaded = false;

		//game loopage
		var start_game_loop = function() {
			game_loop();
			game_loop_timeout = setTimeout(start_game_loop, 30);	
		};
		var game_loop = function() {
			if(doResizeCanvas) {
				fit_canvas_to('body');
				doResizeCanvas = false;
			}
			app.clear_canvas();

			if(isPreloaded) {
				that.process();
				that.update();
			}
		};

		//override us!
		that.init = function(){
		};
		that.process = function() {
		}
		that.update = function() {
		};

		//begin
		start_game_loop();
		app.resourceManager.load(spec.resources, function(){
			that.init();
			isPreloaded = true;
		});

		return that;
	};

	app.scene = function(spec) {
		var that = {};
		that.entities = (spec && spec.entities) || [];
		
		that.init = function(){
			return that;
		};
		that.process = function() {
			return that;
		}
		that.update = function(ctx) {
			for(var i = 0; i < that.entities.length; i += 1) {
				app.draw_game_entity(that.entities[i]);	
			}

			return that;
		};

		return that;
	};

	app.gameEntity = function(spec) {
		var x = spec.x || 0,
			y = spec.y || 0,
			resource = spec.resource,
			rotation = spec.rotation || 0,
			scale = spec.scale || 1;

		return {
			x: x,
			y: y,
			resource: resource,
			rotation: rotation,
			scale: scale
		};
	};

	//drawing methods
	app.clear_canvas = function() {
		app.ctx.fillStyle = app.background;
		app.ctx.fillRect(0, 0, app.canvas.width, app.canvas.height);
	};
	app.draw_resource = function(res, x, y, scale, rotation) {
		scale = scale || 1;
		rotation = rotation || 0;
		var o  = res.origin || {x:0, y:0},
			newWidth = res.img.width*scale,
			newHeight = res.img.height*scale;
		app.ctx.save();
		app.ctx.translate(x, y);
		app.ctx.rotate(rotation);
		app.ctx.drawImage(res.img, 
			 - newWidth * o.x, - newHeight * o.y, 
			newWidth, newHeight);
		app.ctx.restore();
	};
	app.draw_game_entity = function(e) {
		app.draw_resource(e.resource, e.x, e.y, e.scale, e.rotation);
	};

	//Singleton
	app.resourceManager = (function() {
		var that = {},
			resources = [],
			resources_loaded = 0;

		that.container = $('body');

		var byKey = function(key) {
			for(i in resources) {
				if(resources[i].key == key) return resources[i];
			}
		};
		var load = function(sources, complete) {
			//TODO: skip duplicates

			var inc = function() {
				resources_loaded += 1;
				if(resources_loaded >= resources.length) {
					complete && complete();
				}
			};

			for(var i = 0; i< sources.length; i += 1) {
				var res = $.extend({}, sources[i], {img: new Image()});
				resources.push(res);
				$(res.img)
					.appendTo(that.container)
					.on('load', inc)
					.attr('src', res.path);
			}
		}


		that.byKey = byKey;
		that.load = load;

		return that;
	}());

})(jQuery);