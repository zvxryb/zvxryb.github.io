/* copyright 2015 by mike lodato (zvxryb@gmail.com)
 * this work is subject to the terms of the MIT license */

define([], function () {
	function addText(node, value) {
		var text = document.createTextNode(value);
		node.appendChild(text);
		return text;
	}
	
	function addFormattedText(node, text) {
		var lastToken = null;
		text.split(/(_|\^)\{(.+?)\}/).forEach(function (token) {
			switch (lastToken) {
				case '^':
					addElement(node, 'sup', function () {
						addText(this, token);
					});
					break;
				case '_':
					addElement(node, 'sub', function () {
						addText(this, token);
					});
					break;
				default:
					if (token !== '^' && token !== '_')
						addText(node, token);
					break;
			}
			lastToken = token;
		});
	}
	
	function addElement(node, elementName, callback) {
		var element = document.createElement(elementName);
		if (callback)
			callback.call(element);
		node.appendChild(element);
		return element;
	}
	
	return {
		addText: addText,
		addFormattedText: addFormattedText,
		addElement: addElement
	};
});
