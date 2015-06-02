// game
//	canvas 				(DOM element)
//	background 			(CSS color)
//	resourceContainer	(DOM element)
//	resources			(Array/Resource)
//	sprite_animations	(Array/SpriteAnimation)
//	resourcePathPrefix	(String)

// gameEntity
//	x					(Number) // default 0
//	y					(Number) // default 0
//	resource			(String/ResourceKey)
//	scale				(Number) // default 1
//	rotate				(Number) // default 0
//	isMirrored			(Boolean)
//	isFlipped			(Boolean)
//	visible				(Boolean)
//	entities			(Array)

// start --> adjust --> draw

// Resource
//		path			(String)
//		key				(String) // optional, defaults to filename
//		spriteMap		(Object)
//			x			(Number)
//			y			(Number)
//		origin			(Object)
//			x			(Number) // default 0.5
//			y			(Number) // default 0.5

// SpriteAnimation
//	key					(String)
//	d					(Number) // Default duration of each frame
//	keyframes			(Array/SpriteFrame)

// SpriteFrame
//	x					(Number) // optional, only if changed
//	y					(Number) // optional, only if changed
//	d					(Number) // optional, only if non-default

// Gameloop Overrides & [Events]
//	gameEntity: start --> adjust --> draw
//	sprite: 	start --> adjust --> [onAnimate] --> draw

(function($){
	var app = namespace('tarmac');

	app.game = function(spec) {

		var that = tarmac.gameEntity();

		var last_update;

		//global init
		app.background = spec.background || '#000';
		app.canvas = spec.canvas;
		app.ctx = app.canvas.getContext('2d');
		app.mat = new Transform();
		app.resourceManager.container = spec.resourceContainer;
		app.spriteAnimationManager.load(spec.sprite_animations);

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
		app.resourceManager.load(
			spec.resources, 
			spec.resourcePathPrefix, 
			function(){
				that.init();
				isPreloaded = true;
			}
		);

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
		that.visible = (spec.visible == null)? true : spec.visible;
		that.entities = [];
		
		that.addEntity = function(e) {
			e.parent = that;
			that.entities.push(e);
			return that;
		};
		that.removeEntity = function(e) {
			var i = that.entities.indexOf(e);
			if(i >= 0) {
				e.parent = null;
				that.entities.splice(i, 1);
			}
			return that;
		};
		that.remove = function() {
			that.parent && that.parent.removeEntity(that);
			return that;
		};

		if(spec.entities) {
			for(var i = 0; i < spec.entities.length; i += 1) {
				that.addEntity(spec.entities[i]);
			}
		}

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

		that.init = function() {
			that.start && that.start();
			that.initChildren();
			return that;
		};
		that.initChildren = function() {
			for(var i = 0; i < that.entities.length; i += 1) {
				that.entities[i].init();
			}
			return that;
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
			if(that.visible) that.draw && that.draw();
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
			resource = app.resourceManager.byKey(key),
			animation, 
			animation_times,
			animation_repeat, 
			animation_complete, 
			animation_keyframe_index,
			animation_keyframe_index_start_time;
		that.frame = spec && spec.frame || {x: 0, y:0};
		
		that.adjust = function() {
			if(animation) {
				var keyframe = animation.keyframes[animation_keyframe_index];
				if((new Date()).getTime() - animation_keyframe_index_start_time > (keyframe.d || animation.d)) {
					animation_keyframe_index++;
					if(animation_keyframe_index >= animation.keyframes.length) {
						animation_times++;
						if(animation_repeat >= 0 && animation_times > animation_repeat) {
							animation_complete && animation_complete();
							that.stop();
						} else {
							animation_keyframe_index = 0;
						}
					}
					if(animation) keyframe = animation.keyframes[animation_keyframe_index];
				}
				if(animation) that.frame = $.extend(that.frame, keyframe)
				that.onAnimate && that.onAnimate();
			}
		};

		that.draw = function() {
			app.draw_resource(resource, that.frame);
		};

		that.play = function(animationKey, repeat, complete) {
			animation = app.spriteAnimationManager.byKey(animationKey);
			if(animation) {
				animation_times = 0;
				animation_repeat = repeat;
				animation_keyframe_index = 0;
				animation_complete = complete;
				animation_keyframe_index_start_time = (new Date()).getTime();
			}
			return that;
		};
		that.playOnce = function(animationKey, complete) {
			return that.play(animationKey, 0, complete);
		}
		that.stop = function() {
			animation = null;
			return that;
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
		w = $(res.img).width()/res.spriteMap.x;
		h = $(res.img).height()/res.spriteMap.y;

		app.ctx.drawImage(res.img,
			spritePos.x * w, spritePos.y * h,
			w, h, 
			- w * o.x, - h * o.y, 
			w, h);
	};

	//Singleton
	app.resourceManager = (function() {
		var that = {},
			resources = [],
			resources_loaded = 0;

		that.container = $('body');

		that.byKey = function(key) {
			for(i in resources) {
				if(resources[i].key == key) return resources[i];
			}
		};
		that.load = function(sources, pathPrefix, complete) {
			//TODO: skip duplicates

			var inc = function() {
				resources_loaded += 1;
				if(resources_loaded >= resources.length) {
					complete && complete();
				}
			};

			for(var i = 0; i< sources.length; i += 1) {
				var res = $.extend({}, sources[i], {img: new Image()});
				if(!res.key) res.key = res.path.split('.')[0];
				resources.push(res);
				$(res.img)
					.appendTo(that.container)
					.on('load', inc)
					.attr('src', (pathPrefix || '') + res.path);
			}
		}

		return that;
	}());

	//Singleton
	app.spriteAnimationManager = (function() {
		var that = {},
			animations = [];

		that.byKey = function(key) {
			for(i in animations) {
				if(animations[i].key == key) return animations[i];
			}
		};
		that.load = function(sources) {
			animations = sources;
		}

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
			var key = indices[e.which] || String.fromCharCode(e.which);
			that[key] = true;
			that.trigger(key);
		}).on('keyup', function(e){
			that[indices[e.which] || String.fromCharCode(e.which)] = false;
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