jQuery(function($){
	var TUNG_game = new TUNG.game({
		canvas: document.getElementById('game-canvas'),
		background: 'black',
		resourceContainer: document.getElementById('game-resources'),
		resources: [{
			key: '352-rings',
			path: 'resources/352-rings.svg',
			origin: {x: 0.5, y: 0.5}
		}]
	});
});