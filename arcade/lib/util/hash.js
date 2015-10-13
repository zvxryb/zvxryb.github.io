/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([], function () {
	function Hash(seed) {
		this.hash = seed;
		this.bytes = 0;
	}
	
	Hash.prototype.clone = function () {
		return new Hash(this.hash);
	}
	
	Hash.prototype.word = function (k) {
		// an implementation of murmurhash3
		var c1 = 0xcc9e2d51;
		var c2 = 0x1b873593;
		var r1 = 15;
		var r2 = 13;
		var m  = 5;
		var n  = 0xe6546b64;
		
		var h = this.hash;
		
		k *= c1;
		k  = (k << r1) | (k >>> (32 - r1));
		k *= c2;
		
		h ^= k;
		h  = (h << r2) | (h >>> (32 - r2));
		h *= m + n;
		
		this.hash = h;
		this.bytes += 4;
		
		return this;
	}
	
	Hash.prototype.digest = function () {
		var h = this.hash;
		
		h ^= this.bytes;
		
		h ^= (h >>> 16);
		h *= 0x85ebca6b;
		h ^= (h >>> 13);
		h *= 0xc2b2ae35;
		h ^= (h >>> 16);
		
		return h;
	}
	
	return Hash;
});
