//TODO: move background and resources into TUNG, keep resourcepathprefix out here

jQuery(function($){
	TUNG.setup({
		canvas: document.getElementById('game-canvas'),
		background: '#546',
		resourceContainer: document.getElementById('game-resources'),
		resourcePathPrefix:'resources/'
	});
});