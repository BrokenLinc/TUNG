window.GAME = (function($, tarmac){
	var ether = new tarmac.EventDispatcher();

	// utility methods
	function pointsCloserThan(p, q, d) {
		return Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2) < Math.pow(d,2);
	}
	
	// main scene
	var GameScene = tarmac.Scene.extend({
		//classProperty: 3.14,
		construct: function() {
			this._super();

			var self = this;

			//instatiate child entities here
			var circle = new BetterCircle();

			//then add them
	 		this.addEntity(circle);

	 		//create custom event listeners
	 		ether.on('EVENT_NAME', function(e){
	 		});
		},
		//override process lifecycle function (useful for logic-driven sprite animation)
		//process: function() {
		//	this.processChildren();
		//}
		adjust: function() {
			//check for keyboard input on every frame
			if(tarmac.keysDown['LEFT']) {
			}
		}
	});

	//extend a basic shape
	var BetterCircle = tarmac.shapes.Circle.extend({
		construct: function(spec) {
			this._super(spec);
		},
		//add a startup funciton to any game entity
		start: function() {
		}
	});

	//create a sprite
	var CustomSprite = tarmac.Sprite.extend({
		construct: function(spec) {
			//select the SVG to use
			this._super('resource-name', spec);
		},
		//do something when the sprite frame changes
		onAnimate: function() {
		}
	});

	return {
		setup: function(spec) {
			//after resources are loaded
			tarmac.start = function(){
				tarmac.addEntity(new GameScene());
			};

			tarmac.setup($.extend({
				resources: {
					// sounds:[{
					// 	path: 'sound.mp3'
					// }],
					// images: [{
					// 	path: 'graphic.svg',
					// 	spriteMap: {x:1, y:1}, //default
					// 	origin: {x:0.5, y:0.5} //default
					// }]
				},
				sprite_animations: [{
					key: 'animation-name',
					d: 60, //delay between frames, in milliseconds
					keyframes:[
						{x:0, y:0}, //column, row
						{y:1}, //only need to supply changes per frame
						{y:2, d:90} //custom duration per frame
					]
				}]
			},spec));
		}
	};

})(window.jQuery, window.tarmac);