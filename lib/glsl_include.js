/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define({
	load: function (name, req, onLoad, config) {
		req(['lib/text!'+name], function (src) {
			var parts = src.split(/^\s*@(\w+)\s*\(([\s\S]*?)\)\s*$/gm);
			
			var results = []
			var i = 0;
			while (i < parts.length) {
				results.push(parts[i++]);
				
				if (i + 2 < parts.length) {
					var type = parts[i++];
					var args = parts[i++];
					
					if (type == 'comment')
						continue;
					
					args.split(',').map(function (arg) {
						var name  = arg.trim();
						var index = results.length;
						results.push(null);
						
						var path = null;
						switch (type) {
							case 'include':
								path = 'lib/glsl_include!' + name;
								break;
							case 'evaluate':
								path = name;
								break;
						}
						
						if (path) {
							req([path], function (index) {
								return function (result) {
									results[index] = result;
									
									var done = results.every(function (value) {
										return value !== null;
									});
									
									if (done)
										onLoad(results.join('\n'));
								};
							}(index));
						} else
							onLoad.error('invalid include type \"'+type+'\"');
					});
				}
			}
			
			if (results.length === 1)
				onLoad(results[0]);
		});
	}
});
