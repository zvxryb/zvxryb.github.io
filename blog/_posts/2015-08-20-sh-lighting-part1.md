---
layout: post
section: Blog
title: "Spherical Harmonics Lighting: Part I"
subtitle: Intro. & Projecting Environment Maps
---
In my [earlier post](/blog/2015/07/10/atmosphere), I outlined the process for generating an environment map for radiance due to atmospheric scatter (i.e. drawing skies).  This isn't particularly useful on its own, so in the next few posts I'll explore spherical harmonics lighting.

#Advantages and Limitations

The primary advantage of spherical harmonics is that it greatly simplifies evaluation of environmental lighting.  SH lighting reduces the lighting integral (convolution of radiance with a BRDF) to a single dot product.  Spherical harmonics are also a very compact storage format for radiance, irradiance, occlusion, distribution functions, etc. and an essential building block for more sophisticated indirect lighting algorithms, such as Precomputed Radiance Transfer (PRT) or Light Propagation Volumes.

The trade-off is a reduction in precision for low-order SH representations and ringing artifacts.  Some common operations also become more difficult in spherical harmonics.  Multiplication, for example, becomes more complex, making it more difficult to apply visiblity to a SH environment or gather occlusion from multiple SH sources.

<!--continue-->

#Projecting Radiance into Spherical Harmonics

SH coefficients are obtained by (from Wikipedia)

$$f_l^m = \int_\Omega f\left(\theta,\phi\right)Y_l^{m*}\left(\theta,\phi\right)d\Omega\text{.}$$

Because we are only concerned with real values, we can replace the complex conjugate of the spherical harmonics basis $$Y_l^{m*}\left(\theta,\phi\right)$$ with the real spherical harmonics $$Y_{l,m}\left(\theta,\phi\right)$$ to obtain a SH expansion of radiance, $$L$$,

$$L_{l,m} = \int_\Omega L\left(\theta,\phi\right)Y_{l,m}\left(\theta,\phi\right)d\Omega\text{,}$$

which can be converted to a discrete form and rewritten in terms of a normalized view vector, $$\boldsymbol{\hat{\omega}}$$,

$$L_{l,m} = \sum_\Omega L\left(\boldsymbol{\hat{\omega}}\right)Y_{l,m}\left(\boldsymbol{\hat{\omega}}\right)d\Omega\text{.}$$

The differential solid angle, $$d\Omega$$, is generally defined in spherical coordinates as $$d\theta d\phi \sin\theta$$.  However, since we're not working in spherical coordinates, we need to find a solution for cartesian coordinates.

$$d\Omega$$ represents the surface area of a unit sphere subtended by a single pixel.  We can obtain an approximation of the arc subtended by a pixel in the x- and y- directions by finding the change in the normalized view vector, $$\boldsymbol{\omega}_x$$, $$\boldsymbol{\omega}_y$$.  The solid angle, then, is approximated by the area of the resulting parallelogram,

$$d\Omega = \left\lVert\boldsymbol{\omega}_x\times\boldsymbol{\omega}_y\right\rVert\text{,}$$

which makes the full equation

$$L_{l,m} = \sum_\Omega L\left(\boldsymbol{\hat{\omega}}\right)Y_{l,m}\left(\boldsymbol{\hat{\omega}}\right)\left\lVert\boldsymbol{\omega}_x\times\boldsymbol{\omega}_y\right\rVert\text{.}$$

##Implementation
To implement this on the GPU, we perform the integration for each SH basis function separately.

1. Render a texture representing the product $$L\left(\boldsymbol{\hat{\omega}}\right)Y_{l,m}\left(\boldsymbol{\hat{\omega}}\right)\left\lVert\boldsymbol{\omega}_x\times\boldsymbol{\omega}_y\right\rVert$$ from the environmental radiance map.
2. Compute the total by parallel reduction (see [GPU Gems 37.2.1](#ref-buck-purcell)), downsampling the texture iteratively and writing the total value of sub-samples in each pass.
3. When size is sufficiently small, read results to the CPU and compute final total.

It *may* be possible to optimize step 2-3 on *some* hardware by using <code>generateMipmap()</code> and reading back the highest mip level, multiplying the result by the total number of pixels.  Computing the total manually is safer in the general case and allows us to use arbitrary encodings (such as RGBE).

###Fragment shader to compute product

{% include source.html id='sh-env-project-shader' path='arcade/shader/sh-env-project.frag' language='glsl' %}

*Note: The 'harmonics' uniform array will contain a coefficient of one for the current basis function and a value of zero for all others.  It may be more efficient to compile a separate program for each basis function.*

*Additionally, manual calculation of derivatives may be replaced with <code>dFdx()</code> and <code>dFdy()</code> when the OES_standard_derivatives extension is supported*

###Fragment shader to compute total

{% include source.html id='total4x-shader' path='arcade/shader/total4x-rgbe-signed.frag' language='glsl' %}

*Potential optimization: If bilinear interpolation is available, we may sample four texels at once by choosing our coordinates carefully and multiplying the sampled value by four (see [Efficient Gaussian Blur with Linear Sampling](#ref-rakos)).*

##Results

The following demo shows the radiance from an environment map (above) and spherical harmonics representation (below).  Second order (9-coefficient) spherical harmonics are used.  While high-frequency features are lost, the reconstructed lighting should still be sufficient for diffuse illumination.

<div id='sh-lighting1-demo'></div>
<script>
	require(['arcade/demo/sh-lighting1'], function (init) {
		init('sh-lighting1-demo');
	});
</script>

#References and Further Reading
* <span id='ref-sloan'>*Stupid Spherical Harmonics (SH) Tricks* by P.-P. Sloan</span>
* <span id='ref-ramamoorthi-hanrahan'>*An Efficient Representation for Irradiance Environment Maps* by R. Ramamoorthi and P. Hanrahan</span>
* <span id='ref-buck-purcell'>*[GPU Gems, Chapter 37: A Toolkit for Computation on GPUs](https://developer.nvidia.com/gpugems/GPUGems/gpugems_ch37.html)* by I. Buck and T. Purcell</span>
* <span id='ref-rakos'>*[Efficient Gaussian Blur with Linear Sampling](http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/)* by D. Rakos</span>

