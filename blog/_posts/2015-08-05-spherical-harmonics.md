---
layout: post
section: Blog
title: Spherical Harmonics Viewer
---
*Spherical Harmonics* are a set of basis functions over the unit sphere.  Much like the Fourier or cosine transforms, spherical harmonics allow us to represent a function in terms of its frequency components.

The following is an interactive visualization of the first three bands of *real* spherical harmonics.
<!--continue-->

<div id='sh-viewer-demo'></div>
<script>
	require(['arcade/demo/sh-viewer'], function(init) {
		init('sh-viewer-demo');
	});
</script>

*Spherical harmonics obtained from [Wikipedia](https://en.wikipedia.org/wiki/Table_of_spherical_harmonics#Real_spherical_harmonics)*
