//TODO: move background and resources into TUNG, keep resourcepathprefix out here

jQuery(function($){
	var TUNG_game = new TUNG.game({
		canvas: document.getElementById('game-canvas'),
		background: '#546',
		resourceContainer: document.getElementById('game-resources'),
		resourcePathPrefix:'resources/'
	});
});