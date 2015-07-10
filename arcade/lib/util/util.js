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
	
	return {
		unique: unique
	};
});

