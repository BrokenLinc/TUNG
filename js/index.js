jQuery(function($){
	var TUNG_game = new TUNG.game({
		canvas: document.getElementById('game-canvas'),
		background: '#546',
		resourceContainer: document.getElementById('game-resources'),
		resources: [{
			key: '352-rings',
			path: 'resources/352-rings.svg'
		},{
			key: 'body',
			path: 'resources/body.svg',
			spriteMap: {x:2, y:2}
		},{
			key: 'eyes',
			path: 'resources/eyes.svg',
			spriteMap: {x:1, y:10}
		}]
	});
});