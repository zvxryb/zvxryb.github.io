/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([], function () {
	function unique(items) {
		return items.slice().sort().filter(function(item, index, array) {
			if (index <= 0)
				return true;
			return item !== array[index-1];
		});
	}
	
	function range(n) {
		var result = new Array(n);
		for (var i = 0; i < n; ++i)
			result[i] = i;
		return result;
	}
	
	return {
		unique: unique,
		range: range
	};
});

