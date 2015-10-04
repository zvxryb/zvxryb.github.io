/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * all rights reserved */

requirejs.config({
	baseUrl: '/',
	paths: {
		require: 'lib/require',
		math:    'lib/math.min',
		jmat:    'lib/jmat.min',
		arcade:  'arcade/lib'
	},
	shim: {
		jmat: { exports: 'Jmat' }
	}
});
