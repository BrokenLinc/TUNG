(function($){
	var app = namespace('tarmac');

	app.game = function(spec) {

		var that = tarmac.gameEntity();

		var last_update;

		//global init
		app.background = spec.background;
		app.canvas = spec.canvas;
		app.ctx = app.canvas.getContext('2d');
		app.mat = new Transform();
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

		//begin
		start_game_loop();
		app.resourceManager.load(spec.resources, function(){
			that.init();
			isPreloaded = true;
		});

		return that;
	};

	app.gameEntity = function(spec) {
		spec = spec || {};

		var that = {};
		that.x = spec.x || 0,
		that.y = spec.y || 0,
		that.resource = spec.resource,
		that.rotation = spec.rotation || 0,
		that.scale = spec.scale || 1;
		that.isMirrored = spec.isMirrored;
		that.isFlipped = spec.isFlipped;
		that.entities = (spec && spec.entities) || [];
		
		var add_transform = function(transform, target) {
			target.translate(transform.x, transform.y);
			target.rotate(transform.r);
			target.scale(transform.sx, transform.sy);
		};
		var remove_transform = function(transform, target) {
			target.scale(1/transform.sx, 1/transform.sy);
			target.rotate(-transform.r);
			target.translate(-transform.x, -transform.y);
		};

		that.process = function() {
			var transform_cache = {
				x:that.x, y:that.y, r:that.rotation,
				sx:that.scale * (that.isMirrored? -1 : 1),
				sy:that.scale * (that.isFlipped? -1 : 1)
			};

			add_transform(transform_cache, app.mat);
			that.adjust && that.adjust();
			that.processChildren();
			remove_transform(transform_cache, app.mat);

			return that;
		}
		that.processChildren = function() {
			for(var i = 0; i < that.entities.length; i += 1) {
				that.entities[i].process();
			}
			return that;
		}
		that.update = function() {
			var transform_cache = {
				x:that.x, y:that.y, r:that.rotation,
				sx:that.scale * (that.isMirrored? -1 : 1),
				sy:that.scale * (that.isFlipped? -1 : 1)
			};

			add_transform(transform_cache, app.ctx);
			that.draw && that.draw();
			that.updateChildren();
			remove_transform(transform_cache, app.ctx);

			return that;
		};
		that.updateChildren = function() {
			for(var i = 0; i < that.entities.length; i += 1) {
				that.entities[i].update();
			}
			return that;
		}

		return that;
	};

	app.scene = function(spec) {
		var that = app.gameEntity(spec),
			super_process = that.process;

		that.process = function() {
			var w = tarmac.canvas.width;
			var h = tarmac.canvas.height;
			that.x = w/2;
			that.y = h/2;
			that.scale = Math.min(w/800, h/450);

			return super_process();
		};

		return that;
	};

	app.sprite = function(key, spec) {
		var that = app.gameEntity(spec),
			resource = app.resourceManager.byKey(key);
		that.frame = spec && spec.frame || {x: 0, y:0};
		
		that.draw = function() {
			app.draw_resource(resource, that.frame);
		};

		return that;
	};

	//drawing methods
	app.clear_canvas = function() {
		app.ctx.fillStyle = app.background;
		app.ctx.fillRect(0, 0, app.canvas.width, app.canvas.height);
	};
	app.draw_resource = function(res, spritePos) {
		var o, w, h;
		o = res.origin || {x:0.5, y:0.5};
		w = res.img.width/res.spriteMap.x;
		h = res.img.height/res.spriteMap.y;

		app.ctx.drawImage(res.img,
			spritePos.x * w, spritePos.y * h,
			w, h, 
			- w * o.x, - h * o.y, 
			w, h);
	};

	//TODO: transformManager({ctx: ctx}) //optional, 
	//.scale(), .rotate() //cache and apply to ctx if present, return values if no args
	//.getMousePosition()
	//use for updateTransformManager (app.ctx_tf) and processTransformManager (app.proc_tf)

	//applies current matrix and returns new point
	var transformPoint = function(p, m) {
		var x = p.x*m[0] + p.y*m[2] + m[4];
		var y = p.x*m[1] + p.y*m[3] + m[5];
		return {x:x, y:y};
	}

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

	app.keysDown = (function(){
		var that = new EventDispatcher();

		var indices = {
			37: 'LEFT',
			38: 'UP',
			39: 'RIGHT',
			40: 'DOWN',
			219: '[',
			221: ']'
		};

		$(window).on('keydown', function(e){
			var key = indices[e.which];
			that[key] = true;
			that.trigger(key);
		}).on('keyup', function(e){
			that[indices[e.which]] = false;
		});

		return that;
	}());

})(jQuery);

(function($){
	var shapes = namespace('tarmac.shapes');

	shapes.circle = function(spec) {
		var spec = spec || {},
			that = tarmac.gameEntity(spec);

		that.radius = spec.radius || 100;
		that.fill = spec.fill || '#888';

		that.draw = function() {
			tarmac.ctx.beginPath();
			tarmac.ctx.lineWidth = 0;
			tarmac.ctx.arc(0, 0, that.radius, 0, 2 * Math.PI, false);
			tarmac.ctx.fillStyle = that.fill;
			tarmac.ctx.fill();
			// tarmac.ctx.strokeStyle = '#003300';
			// tarmac.ctx.stroke();

			return that;
		};

		return that;
	};

})(jQuery);