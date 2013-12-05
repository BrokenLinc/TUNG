jQuery(function($){
	var TUNG_game = new TUNG.game({
		canvas: document.getElementById('game-canvas'),
		background: '#546',
		resourceContainer: document.getElementById('game-resources'),
		resources: [{
			key: '352-rings',
			path: 'resources/352-rings.svg',
			origin: {x: 0.5, y: 0.5}
		},{
			key: 'body',
			path: 'resources/body.svg',
			origin: {x: 0.6, y: 0.95},
			spriteMap: {x:2, y:2}
		},{
			key: 'eyes',
			path: 'resources/eyes.svg',
			origin: {x: 0.5, y: 0.5},
			spriteMap: {x:1, y:10}
		}]
	});
});