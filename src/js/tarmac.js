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

window.tarmac = (function($){

	//private utility methods
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

	// "Classes"
	var GameEntity = Class.extend({
		construct: function(spec) {
			spec = spec || {};

			this.x = spec.x || 0;
			this.y = spec.y || 0;
			this.resource = spec.resource;
			this.rotation = spec.rotation || 0;
			this.scale = spec.scale || 1;
			this.isMirrored = spec.isMirrored;
			this.isFlipped = spec.isFlipped;
			this.visible = (spec.visible == null)? true : spec.visible;
			this.entities = [];

			if(spec.entities) {
				for(var i = 0; i < spec.entities.length; i += 1) {
					this.addEntity(spec.entities[i]);
				}
			}
		},
		addEntity: function(e) {
			e.parent = this;
			this.entities.push(e);
			return this;
		},
		removeEntity: function(e) {
			var i = this.entities.indexOf(e);
			if(i >= 0) {
				e.parent = null;
				this.entities.splice(i, 1);
			}
			return this;
		},
		remove: function() {
			this.parent && this.parent.removeEntity(this);
			return this;
		},
		init: function() {
			this.start && this.start();
			this.initChildren();
			return this;
		},
		initChildren: function() {
			for(var i = 0; i < this.entities.length; i += 1) {
				this.entities[i].init();
			}
			return this;
		},
		process: function() {
			var transform_cache = {
				x:this.x, y:this.y, r:this.rotation,
				sx:this.scale * (this.isMirrored? -1 : 1),
				sy:this.scale * (this.isFlipped? -1 : 1)
			};

			add_transform(transform_cache, app.mat);
			this.adjust && this.adjust();
			this.processChildren();
			remove_transform(transform_cache, app.mat);

			return this;
		},
		processChildren: function() {
			for(var i = 0; i < this.entities.length; i += 1) {
				this.entities[i].process();
			}
			return this;
		},
		update: function() {
			var transform_cache = {
				x:this.x, y:this.y, r:this.rotation,
				sx:this.scale * (this.isMirrored? -1 : 1),
				sy:this.scale * (this.isFlipped? -1 : 1)
			};

			add_transform(transform_cache, app.ctx);
			if(this.visible) this.draw && this.draw();
			this.updateChildren();
			remove_transform(transform_cache, app.ctx);

			return this;
		},
		updateChildren: function() {
			for(var i = 0; i < this.entities.length; i += 1) {
				this.entities[i].update();
			}
			return this;
		}
	});

	var Scene = GameEntity.extend({
		construct: function(spec){
			this._super(spec);
		},
		process: function() {
			var w = app.canvas.width;
			var h = app.canvas.height;
			this.x = w/2;
			this.y = h/2;
			this.scale = Math.min(w/800, h/450);

			return this._super();
		}
	});

	var Sprite = GameEntity.extend({
		construct: function(key, spec){
			this._super(spec);
			this.resource = app.resourceManager.byKey(key);
			this.frame = spec && spec.frame || {x: 0, y:0};
		},
		adjust: function() {
			if(this.animation) {
				var keyframe = this.animation.keyframes[this.animation_keyframe_index];
				if((new Date()).getTime() - this.animation_keyframe_index_start_time > (keyframe.d || this.animation.d)) {
					this.animation_keyframe_index++;
					if(this.animation_keyframe_index >= this.animation.keyframes.length) {
						this.animation_times++;
						if(this.animation_repeat >= 0 && this.animation_times > this.animation_repeat) {
							this.animation_complete && this.animation_complete();
							this.stop();
						} else {
							this.animation_keyframe_index = 0;
						}
					}
					if(this.animation) keyframe = this.animation.keyframes[this.animation_keyframe_index];
				}
				if(this.animation) this.frame = $.extend(this.frame, keyframe)
				this.onAnimate && this.onAnimate();
			}
		},
		draw: function() {
			app.draw_resource(this.resource, this.frame);
		},
		play: function(animationKey, repeat, complete) {
			this.animation = app.spriteAnimationManager.byKey(animationKey);
			if(this.animation) {
				this.animation_times = 0;
				this.animation_repeat = repeat;
				this.animation_keyframe_index = 0;
				this.animation_complete = complete;
				this.animation_keyframe_index_start_time = (new Date()).getTime();
			}
			return this;
		},
		playOnce: function(animationKey, complete) {
			return this.play(animationKey, 0, complete);
		},
		stop: function() {
			this.animation = null;
			return this;
		}
	});

	var Circle = GameEntity.extend({
		construct: function(spec) {
			this._super(spec);
			var spec = spec || {};
			this.radius = spec.radius || 100;
			this.fill = spec.fill || '#888';
		},
		draw: function() {
			app.ctx.beginPath();
			app.ctx.lineWidth = 0;
			app.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI, false);
			app.ctx.fillStyle = this.fill;
			app.ctx.fill();
			// app.ctx.strokeStyle = '#003300';
			// app.ctx.stroke();

			return this;
		}
	});



	//Singleton App & Public Namespaces
	var app = new GameEntity();
	app.GameEntity = GameEntity;
	app.Scene = Scene;
	app.Sprite = Sprite;
	app.shapes = {
		Circle: Circle
	};
	app.setup = function(spec) {

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
				app.process();
				app.update();
			}
		};

		//begin
		start_game_loop();
		app.resourceManager.load(
			spec.resources, 
			spec.resourcePathPrefix, 
			function(){
				app.init();
				isPreloaded = true;
			}
		);
	};
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
	app.resourceManager = (function() {
		var that = {},
			resources = [],
			resources_loaded = 0;

		that.container = document.body;

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

	return app;

})(jQuery);