(function($){
	var app = namespace('tarmac');

	app.game = function(spec) {

		var that = {};

		var last_update;

		//global init
		app.background = spec.background;
		app.canvas = spec.canvas;
		app.ctx = app.canvas.getContext('2d');
		app.resourceManager.container = spec.resourceContainer;

		//canvas setup
		var fit_canvas_to = function(element) {
			app.canvas.width = $(element).width();
			app.canvas.height = $(element).height();
			app.origin = {
				x: app.canvas.width/2,
				y: app.canvas.height/2
			};
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
			if(last_update) app.fps = 1000/((new Date()).getTime() - last_update.getTime());
			game_loop();
			game_loop_timeout = setTimeout(start_game_loop, 30);	
			last_update = new Date();
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

	app.scene_old = function(spec) {
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

	app.gameEntity_old = function(spec) {
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

	app.scene = app.gameEntity = function(spec) {
		spec = spec || {};

		var that = {};
		that.x = spec.x || 0,
		that.y = spec.y || 0,
		that.resource = spec.resource,
		that.rotation = spec.rotation || 0,
		that.scale = spec.scale || 1;
		that.entities = (spec && spec.entities) || [];
		
		that.process = function() {
			that.processChildren();
			return that;
		}
		that.processChildren = function() {
			for(var i = 0; i < that.entities.length; i += 1) {
				that.entities[i].process();
			}
			return that;
		}
		that.update = function() {
			app.draw_game_entity(that);
			return that;
		};
		that.updateChildren = function() {
			for(var i = 0; i < that.entities.length; i += 1) {
				app.draw_game_entity(that.entities[i]);	
			}
			return that;
		}

		return that;
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

		app.ctx.translate(x, y);
		app.ctx.rotate(rotation);

		app.ctx.drawImage(res.img, 
			 - newWidth * o.x, - newHeight * o.y, 
			newWidth, newHeight);
		
		app.ctx.rotate(-rotation);
		app.ctx.translate(-x, -y);
	};
	app.draw_game_entity_old = function(e) {
		app.draw_resource(e.resource, e.x, e.y, e.scale, e.rotation);
	};
	app.draw_game_entity = function(e) {
		var res = e.resource, o, newWidth, newHeight;

		app.ctx.translate(e.x, e.y);
		app.ctx.rotate(e.rotation);
		app.ctx.scale(e.scale, e.scale);

		if(res) {
			o  = res.origin || {x:0, y:0};
			newWidth = res.img.width;//*e.scale;
			newHeight = res.img.height;//*e.scale;

			app.ctx.drawImage(res.img, 
				 - newWidth * o.x, - newHeight * o.y, 
				newWidth, newHeight);
		}

		//TODO: add scaling into transforms for children
		e.updateChildren();
		
		app.ctx.scale(1/e.scale, 1/e.scale);
		app.ctx.rotate(-e.rotation);
		app.ctx.translate(-e.x, -e.y);
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