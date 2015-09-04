---
layout: post
section: Blog
title: "Spherical Harmonics Lighting: Part II"
subtitle: Generating BRDF Lookup Tables & SH Lighting
---

#Bidirectional Reflectance Distribution Functions

A bidirectional reflectance distrubtion function is a function which relates incident irradiance to outgoing radiance.  The BRDF generally varies with view direction, light direction, wavelength, and material properties.

For the purposes of this post, I've chosen a microfacet model consisting of an Oren-Nayar diffuse term and Cook-Torrence specular term (GGX distribution).  It should be noted that these two terms are not strictly compatible -- they use different microfacet distributions and roughness values.  Alternative diffuse models include those by [Burly](#ref-burley) ("Disney diffuse") and [Gotanda](#ref-gotanda) (a numerically-integrated, curve-fitted microfacet model).

Rather than directly storing the BRDF $$f_\text{r}$$, we store the BRDF product function $$f_\text{r}^*=f_\text{r}\cos\theta_i$$, which takes into account the proportion of light received by a surface from a given angle.

<!--continue-->

##Storage

This distribution is isotropic, so we store values for view angles only in the xz-plane and transform our values as necessary.  This makes our lookup table effectively four-dimensional; a function of view angle ($$\theta$$), roughness ($$\alpha$$), metalness, and albedo ($$\rho$$, dielectrics) or reflectance at normal incidence ($$R_0$$, metals).

To make this work in WebGL, we need to pack this into a 2D texture.  Luckly, two dimensions are likely to be well approximated by simple linear blends.  Metalness is generally either 0 (pure dielectric) or 1 (pure metal), so we compute separate lookups for dielectrics and metals.  The other linear dimension is $$\rho$$/$$R_0$$,  For dielectric materials, $$\rho$$ simply scales the diffuse term.  For metals, the reflection coefficient, $$R(\theta_i)$$, is computed by Schlick's approximation,

$$R(\theta_i)=R_0+(1-R_0)(1-\cos\theta_i)^5\text{,}$$

which, itself, is just a linear interoplation based on the value of $$R_0$$:

$$R(\theta_i)=\text{lerp}\left([1-\cos\theta_i]^5,\; 1,\; R_0\right)\text{.}$$

So we store four 2D lookups as functions of view angle and roughness:

1. Dielectric, $$\rho = 0$$
2. Dielectric, $$\rho = 1$$
3. Metal, $$R_0 = 0$$
4. Metal, $$R_0 = 1$$

Three bands of SH coefficients are stored.  Our BRDF product function is symmetrical along the y-axis because it is isotropic and viewed only from the xz-plane.  This allows us to drop the coefficients for $$Y_{1,-1}$$, $$Y_{2,-2}$$, and $$Y_{2,-1}$$, which introduce asymmetry to the y-axis.  The remaining coefficients can be stored in one two-channel texture and one four-channel texture (<code>gl.LUMINANCE_ALPHA</code> and <code>gl.RGBA</code>, respectively).

##Combined BRDF Product Function

**Symbols:**

* Incident light zenith angle, $$\theta_i$$
* Incident light azimuth angle, $$\phi_i$$
* Reflected light zenith angle, $$\theta_r$$
* Reflected light azimuth angle, $$\phi_r$$
* Surface albedo, $$\phi$$
* Roughness, GGX (RMS slope), $$\alpha$$
* Roughness, Oren-Nayar (standard deviation of angle), $$\sigma$$
* Surface normal, $$\unitVec{n}$$
* Light vector, $$\unitVec{l} = \vecDef{\sin\theta_i\cos\phi_i,\; \sin\theta_i\sin\phi_i,\; \cos\theta_i}$$
* View vector, $$\unitVec{v} = \vecDef{\sin\theta_r\cos\phi_r,\; \sin\theta_r\sin\phi_r,\; \cos\theta_r}$$
* Half-angle vector, $$\unitVec{h} = \inlineNormalize{\unitVec{l} + \unitVec{v}}$$

Our diffuse term is given by the [Oren-Nayar model](#ref-oren-nayar) (rewritten as a BRDF),

$$f_\text{r, diffuse} = \frac{\rho}{\pi}\left(A+B\max\left[0,\cos\left(\phi_r-\phi_i\right)\right]\sin\alpha\tan\beta\right)\text{,}$$

$$A=1.0-0.5\frac{\sigma^2}{\sigma^2+0.33}\text{, }B=0.45\frac{\sigma^2}{\sigma^2+0.09}\text{,}$$

$$\alpha=\max(\theta_i, \theta_r)\text{, }\beta=\min(\theta_i, \theta_r)\text{.}$$

In vector notation,

$$\cos\left(\phi_r-\phi_i\right) = \normalize{\unitVec{l} - (\NdotL)\unitVec{n}}\cdot\normalize{\unitVec{v} - (\NdotV)\unitVec{n}}\text{,}$$

$$\sin\alpha = \sqrt{1-\min(\NdotL, \NdotV)^2}\text{,}$$

$$\tan\beta = \frac{\sqrt{1-\max(\NdotL, \NdotV)^2}}{\max(\NdotL, \NdotV)}\text{.}$$

The specular reflectance term is given by [Cook-Torrance](#ref-cook-torrance), with some slight variations.  The $$\inlineFraction{1}{\pi}$$ coefficient is moved to the distribution term, $$D$$, and we scale the whole formula by $$\inlineFraction{1}{4}$$ to match the formulation given in the GGX paper.  We also drop the Fresnel term, which will included in the combined result,

$$f_\text{r, specular}=\frac{DG}{4(\NdotL)(\NdotV)}\text{,}$$

with the [GGX facet distribution](#ref-walter-et-al),

$$D=\frac{\alpha^2{\large \chi}^+\!\left(\unitVec{m}\cdot\unitVec{n}\right)}
{\pi\cos^4\theta_m\left(\alpha^2+\tan^2\theta_m\right)^2}\text{,}\quad
{\large \chi}^+\!\left(a\right) = \begin{cases}
1 & \text{if $a > 0$}\\
0 & \text{if $a \le 0$}
\end{cases}
\text{.}$$

This equation introduces a new variable, the "microfacet" normal, $$\unitVec{m}$$, which differs from the macroscopic "surface" normal that we have defined earlier.  The microfacet normal is the normal of the microscopic facet which is reflecting light towards the viewer.  We already know this vector, since we've defined it earlier with a different name; *the half-angle vector*, $$\unitVec{h}$$, a unit vector halfway between the light vector and the view vector.  The angle $$\theta_m$$ is just the angle between the microfacet/half-angle vector and the macroscopic surface normal.  Making the necessary subtitutions,

$$\cos\theta_m = \NdotH\text{,}$$

$$\tan\theta_m = \frac{\sqrt{1-(\NdotH)^2}}{\NdotH}\text{,}$$

$$D = \frac{\alpha^2{\large \chi}^+(\NdotH)}{\pi (\NdotH)^4\left[\alpha^2+(\NdotH)^{-2}-1\right]^2}\text{.}$$

The matching Smith geometry attenuation (shadowing/masking) function,

$$G(\unitVec{l}, \unitVec{v}, \unitVec{h}) \approx G_1(\unitVec{l}, \unitVec{h}) G_1(\unitVec{v}, \unitVec{h})\text{,}$$

$$G_1(\unitVec{v}, \unitVec{m})={\large \chi}^+\!\left(\frac{\unitVec{v}\cdot\unitVec{m}}{\unitVec{v}\cdot\unitVec{n}}\right)\frac{2}{1+\sqrt{1+\alpha^2\tan^2\theta_v}}\text{.}$$

Rewritten for our coordinate system,

$$\tan\theta_v = \frac{\sqrt{1-(\NdotV)^2}}{\NdotV}\text{,}$$

$$G_1(\unitVec{v}, \unitVec{h})={\large \chi}^+\!\left(\frac{\VdotH}{\NdotV}\right)\frac{2}{1 + \sqrt{1 + \alpha^2\left[(\NdotV)^{-2} - 1\right]}}\text{.}$$

An approximate conversion from Beckmann/GGX roughness is given in [Moving Frostbite to Physically Based Rendering](#ref-lagarde-rousiers), however their conclusion is that "there is no good conversion between GGX and Oren-Nayar roughness".  Whatever error it introduces is likely to be outweighed by the error of a low-order SH representation, so it should be good enough here;

$$\sigma = \frac{1}{\sqrt{2}}\arctan{\alpha}\text{.}$$

The full BRDF product function is then,

$$f_\text{r}^*\!\left(\unitVec{l}, \unitVec{v}\right) = \max\!\left(0,\; \NdotL\right)\,\text{lerp}\!\left( f_\text{r, diffuse}\!\left(\unitVec{l}, \unitVec{v}\right)\!,\; f_\text{r, specular}\!\left(\unitVec{l}, \unitVec{v}\right)\!,\; R\left(\VdotH\right) \right)\text{.}$$

This function is projected into spherical harmonics using the same method we used to project environmental lighting (see [Part I](/blog/2015/08/20/sh-lighting-part1/)).

#Lighting with Spherical Harmonics

In order for us to apply our BRDF to our environmental lighting, both must be represented in the same space.  Our environmental lighting is already represented in world space, but the result of our BRDF lookup is in a per-fragment local tangent space.  The method I use to rotate the BRDF into world space is given in [Simple and Fast Spherichal Harmonic Rotation](#ref-hable).  The rotation is given by a tangent-space matrix.

Many graphics programmers will be familiar with tangent-space (or TBN) matrices from tangent-space normal mapping.  The idea is to generate a rotation matrix from the surface tangent, bitangent, and normal, which will be used to transform tangent-space coordinates into object/global/eye space.  When working with normal maps, the tangent and bitangent are chosen with respect to texture coordinate axes, as tangent space normal maps store their x- and y- components in the u- and v- texture coordinate directions.  In our case, the choice of tangents will be a bit different.  Our BRDF is stored for view directions in the xz-plane, meaning the y-axis should be directed perpendicular to the viewer.  Since our z-axis is the surface normal direction, this just leaves the x-axis, which should be perpendicular to both the y- and z- axes.  For a right-handed coordinate system,

$$\unitVec{t_y} = \vecDef{t_{y,x}, t_{y,y}, t_{y,z}} = \normalize{\unitVec{n} \times \unitVec{v}}\text{,}$$

$$\unitVec{t_x} = \vecDef{t_{x,x}, t_{x,y}, t_{x,z}} = \normalize{\unitVec{t_y} \times \unitVec{n}}\text{,}$$

$$\boldsymbol{R_{TBN}} = \left[\begin{array}{ccc}
	t_{x,x} & t_{y,x} & n_x \\
	t_{x,y} & t_{y,y} & n_z \\
	t_{x,z} & t_{y,z} & n_z
\end{array}\right]\text{.}$$

After rotation, our lighting is computed simply as the dot product of our SH BRDF product function with our SH environmental radiance,

$$L_\text{r} = \boldsymbol{f_\text{r}^*} \cdot \boldsymbol{L_\text{i}}\text{.}$$

#Results

This scene consists of two rows of spheres, one row of dielectrics and one row of metals, with roughness varying from 0.1 to 1.0, illuminated using a combination of direct lighting and our new spherical harmonics environmental lighting.

<div id='sh-lighting2-demo'></div>
<script>
	require(['arcade/demo/sh-lighting2'], function (init) {
		init('sh-lighting2-demo');
	});
</script>

#References and Further Reading
* <span id='ref-kautz-sloan-snyder'>*Fast, Arbitrary BRDF Shading for Low-Frequency Lighting Using Spherical Harmonics* by J. Kautz, P.-P. Sloan, & J. Snyder</span>
* <span id='ref-oren-nayar'>*Generalization of Lambert's Reflectance Model* by M. Oren and S. Nayar</span>
* <span id='ref-cook-torrance'>*A Reflectance Model for Computer Graphics* by R. Cook and K. Torrance</span>
* <span id='ref-walter-et-al'>*Microfacet Models for Refraction through Rough Surfaces* by B. Walter, et al.</span>
* <span id='ref-schlick'>*An Inexpensive BRDF Model for Physically-based Rendering* by C. Schlick</span>
* <span id='ref-lagarde-rousiers'>*Moving Frostbite to Physically Based Rendering* by S. Lagarde and C. de Rousiers</span>
* <span id='ref-alamia'>*[Physically Based Rendering - Cook-Torrance](http://www.codinglabs.net/article_physically_based_rendering_cook_torrance.aspx)* by M. Alamia</span>
* <span id='ref-burley'>*Physically-Based Shading at Disney* by Brent Burley</span>
* <span id='ref-gotanda'>*Designing Reflectance Models for New Consoles* by Y. Gotanda</span>
* <span id='ref-hable'>*[Simple and Fast Spherical Harmonic Rotation](http://www.filmicworlds.com/2014/07/02/simple-and-fast-spherical-harmonic-rotation/)* by J. Hable</span>
