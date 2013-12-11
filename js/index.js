jQuery(function($){
	var TUNG_game = new TUNG.game({
		canvas: document.getElementById('game-canvas'),
		background: '#546',
		resourceContainer: document.getElementById('game-resources'),
		//TODO: convert to indexed names?
		resources: [{
		// 	key: '352-rings',
		// 	path: 'resources/352-rings.svg'
		// },{
			key: 'body',
			path: 'resources/body.svg',
			spriteMap: {x:2, y:2}
		},{
			key: 'eyes',
			path: 'resources/eyes.svg',
			spriteMap: {x:1, y:10}
		},{
			key: 'mouth',
			path: 'resources/mouth.svg',
			spriteMap: {x:1, y:10}
		},{
			key: 'tongue',
			path: 'resources/tongue.svg',
			spriteMap: {x:2, y:7},
			origin: {x:0.15, y:0.5}
		}],
		sprite_animations: [{
			key: 'tongue-lick',
			d: 60,
			keyframes:[
				{x:0, y:0},
				//{y:1},
				{y:2},
				//{y:3},
				{y:4},
				//{y:5},
				{y:6},
				{x:1, y:6},
				//{y:5},
				{y:4},
				//{y:3},
				{y:2},
				//{y:1},
				{y:0}
			]
		}]
	});
});