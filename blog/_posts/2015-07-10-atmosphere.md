---
layout: post
section: Blog
title: Drawing Skies in WebGL
---
This will (hopefully) be the first post in a series documenting my implementation of a physically-based renderer in WebGL.  I am not a physicist, so what follows is my best attempt at an informal overview for graphics programmers.  Corrections are welcome.

Also consider skipping to [the results]({{page.url}}#results) :D

#Background

Perhaps the most important aspect of photorealistic rendering in games and other real-time applications is plausable environmental lighting.  Simple ambient lighting, which is constant in color and intensity for all directions, fails to capture subtle lighting cues present in the real world.  The first step, then, in producing photorealistic results is often the creation or acquisition of environment maps.  For dynamic outdoor scenes, this necessitates a parametric model of atmospheric scattering which can be adjusted based on time of day.

The appearence of Earth's sky is due to the scattering of light within the atmosphere.  Light from the sun travels through the Earth's atmosphere where it has some probability of scattering.  Some of this light is scattered towards the observer.  Two types of scattering occur; Rayleigh scattering, due to small particles or 'dry air' (nitrogen/oxygen), and Mie scattering, due to larger particulates such as water vapor.  Rayleigh scattering gives the sky its color due to its strong wavelength dependence (proportional to $$\lambda^{-4}$$).  Blue light scatters more quickly than red light, causing the sky to appear blue.  Mie scattering is also dependent on the ratio of wavelength to particle size, but water vapor particles have enough size variation that this wavelength dependence becomes negligible for our purposes.  Mie scattering appears as atmospheric haze.

<!--continue-->

#Implementation

As stated in <a href='#ref-hoffman-preetham'>Rendering Outdoor Light Scattering in Real Time</a>, we can model light scattering by applying two processes at each step.  *Inscattering*, which determines how much light is accumulated by scattering, and *extinction*, which determines how much light is lost due to outscattering and absorption.

The constant $$\beta$$ represents the total scattering in all directions.  When we accumulate inscatter, we are only interested in light which is specifically scattered towards the observer.  This is given by the "phase function", $$\Phi(\theta)$$, which determines the distribution of scattered light.

In the shader, we step through the atmosphere and calculate the following at each step:

$$L_{i+1} = L_i\overbrace{e^{-(\beta_R + \beta_M)\Delta x}}^\text{extinction}+\overbrace{E_{sun}\underbrace{e^{-(\beta_R + \beta_M)x_{sun}}}_\text{extinction}\underbrace{\left[\beta_R\Phi_R(\theta) + \beta_M\Phi_M(\theta)\right]}_\text{directional scatter}\Delta x}^\text{inscatter}$$

* $$E_{sun}$$ is the solar irradiance at Earth
* $$x$$ is distance to the edge of the atmosphere in the current view direction
* $$x_{sun}$$ is the distance from current point to the edge of the atmosphere in the sun's direction
* $$\theta$$ is the angle between the view direction and the light direction
* $$\beta_R$$ is the Rayleigh scattering coefficient
* $$\beta_M$$ is the Mie scattering coefficient
* $$\Phi_R(\theta)$$ is the Rayleigh phase function
* $$\Phi_M(\theta)$$ is the Mie phase function

##Simplifications

To simplify the calculations, I assume uniform atmospheric density at all altitudes.  Non-uniform density can be implemented by supplying a particle scattering cross-section $$\sigma$$ to the shader and computing the scattering coefficient at each step by $$\beta(x) = \sigma\rho(x)$$, where $$\rho$$ is the number of particles per unit volume.  The advantage of using constant density is that we can approximate outscatter as $$e^{-\beta x}$$ rather than $$\exp\left[-\sigma\int\rho(x)dx\right]$$, which greatly reduces the computational cost of the shader.

This model does not include absorption.  An absorption coefficient, $$\beta_{Ab.}$$, could be added to each extinction term so that $$F_{Ex.}=e^{-\beta_{Ex.}x}=e^{-(\beta_R + \beta_M + \beta_{Ab.})x}$$

##Paraboloid Environment Mapping

Paraboloid environment mapping projects a hemisphere of the environment by modeling the reflection of view rays by a parabolic surface.  This surface is defined by $$z = \frac{1}{2} - \frac{1}{2}\left(x^2 + y^2\right)$$ for $$x$$ and $$y$$ within the unit circle.

For this application, we want the view ray for any given pixel.  This is found by calculating the normalized vector from the origin to the pixel's location on the parabola.

$$\vec{v}_{surface} = \left\langle x, y, \frac{1}{2} - \frac{1}{2}\left(x^2 + y^2\right) \right\rangle$$

$$\vec{v}_{view} = \frac{\vec{v}_{coord}}{\left\lVert\vec{v}_{coord}\right\rVert}$$

##High-Dynamic Range

The resulting image covers a wide range of values which cannot be represented in an 8-bit value.  WebGL has a very limited selection of texture formats and none of them are suitable for HDR use without extra encoding.  The easiest method for storing HDR values in an 8-bit/channel buffer is to use an RGBE (RGB with a shared exponent) encoding.  The exponent is calculated from the largest absolute value of the three color channels.  Zero must be handled as a special case because $$log2(0)$$ is undefined.

*Compatibility note: The WebGL specification does not require gl.RGBA textures to be stored as 8-bit unsigned values.*

Encode (unsigned):

$$\vec{c}_{RGB} = \left\langle r, g, b \right\rangle$$

$$x = \max\left(|r|, |g|, |b|\right)$$

$$y = \left\lceil\log_2{x}\right\rceil$$

$$
\vec{c}_{RGBE} = \begin{cases}
	\left\langle 2^{-y}\vec{c}_{RGB}, (y+128)/255\right\rangle & x > 0 \\
	\left\langle 0, 0, 0, 0 \right\rangle & x <= 0
\end{cases}
$$

Decode (unsigned):

$$\vec{c}_{RGBE} = \left\langle r, g, b, e \right\rangle$$

$$\vec{c}_{RGB} = 2^{255e - 128}\left\langle r, g, b \right\rangle$$

The demo uses the Reinhard tonemapping operator and sRGB curve for display.

##Code

The following fragment shader is used to draw a full screen quad to an RGBA (RGBE encoded) framebuffer.  The result is a paraboloid environment map for a hemisphere centered directly upwards.

{% include source.html id='atmosphere-shader' path='arcade/shader/atmosphere.frag' language='glsl' %}

#Results

<div id='atmosphere-demo'></div>
<script>
	require(['arcade/demo/atmosphere'], function(init) {
		init('atmosphere-demo');
	});
</script>

#Further Reading

* <span id='ref-hoffman-preetham'>*Rendering Outdoor Light Scattering in Real Time* by N. Hoffman and A. J. Preetham</span>
* <span id='ref-oneil'>*<a href='https://developer.nvidia.com/gpugems/GPUGems2/gpugems2_chapter16.html'>GPU Gems 2, Chapter 16: Accurate Atmospheric Scattering
</a>* by S. O'Neil<br/></span>
* <span id='ref-boesch'>*<a href='http://codeflow.org/entries/2011/apr/13/advanced-webgl-part-2-sky-rendering/'>Advanced WebGL - Part 2: Sky Rendering</a>*</span> by F. Boesch
* <span id='ref-heidrich-seidel'>*View-indepdendent Environment Maps* by W. Heidrich and H.-P. Seidel</span>

