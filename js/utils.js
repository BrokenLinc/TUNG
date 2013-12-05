Function.prototype.method = function (name, func) {
	if (!this.prototype[name]) {
		this.prototype[name] = func;
		return this;
	}
};
Object.method('superior', function (name) {
	var that = this,
		method = that[name];
	return function () {
		return method.apply(that, arguments);
	};
});
Function.method('curry', function() {
	var args = arguments, that = this;
	return function() {
		return that.apply(null, args.concat(arguments));
	};
});
Array.dim = function(dimension, initial) {
	var a = [], i;
	for(i = 0; i < dimension; i += 1) {
		a[i] = initial;
	}
	return a;
};
Array.matrix = function (m, n, initial) {
	var a, i, j, mat = [];
	for(i = 0; i < m; i+= 1) {
		a = [];
		for(j = 0; j < n; j += 1) {
			a[j] = initial;
		}
		mat[i] = a;
	}
	return mat;
};
function namespace(namespaceString) {
    var parts = namespaceString.split('.'),
        parent = window,
        currentPart = '';    
        
    for(var i = 0, length = parts.length; i < length; i++) {
        currentPart = parts[i];
        parent[currentPart] = parent[currentPart] || {};
        parent = parent[currentPart];
    }
    
    return parent;
}
namespace('utils').memoizer = function(memo, formula) {
	var recur = function (n) {
		var result = memo[n];
		if (typeof result !== 'number') {
			result = formula(recur, n);
			memo[n] = result;
		}
		return result;
	};
	return recur;
};