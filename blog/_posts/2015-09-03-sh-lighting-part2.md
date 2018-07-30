---
layout: post
section: Blog
title: "Spherical Harmonics Lighting: Part II"
subtitle: Generating BRDF Lookup Tables & SH Lighting
---

# Bidirectional Reflectance Distribution Functions

A bidirectional reflectance distrubtion function is a function which relates incident irradiance to outgoing radiance.  The BRDF generally varies with view direction, light direction, wavelength, and material properties.

For the purposes of this post, I've chosen a microfacet model consisting of an Oren-Nayar diffuse term and Cook-Torrence specular term (GGX distribution).  It should be noted that these two terms are not strictly compatible -- they use different microfacet distributions and roughness values.  Alternative diffuse models include those by [Burly](#ref-burley) ("Disney diffuse") and [Gotanda](#ref-gotanda) (a numerically-integrated, curve-fitted microfacet model).

Rather than directly storing the BRDF <span class='math'>f_\text{r}</span>, we store the BRDF product function <span class='math'>f_\text{r}^*=f_\text{r}\cos\theta_i</span>, which takes into account the proportion of light received by a surface from a given angle.

<!--continue-->

## Storage

This distribution is isotropic, so we store values for view angles only in the xz-plane and transform our values as necessary.  This makes our lookup table effectively four-dimensional; a function of view angle (<span class='math'>\theta</span>), roughness (<span class='math'>\alpha</span>), metalness, and albedo (<span class='math'>\rho</span>, dielectrics) or reflectance at normal incidence (<span class='math'>R_0</span>, metals).

To make this work in WebGL, we need to pack this into a 2D texture.  Luckly, two dimensions are likely to be well approximated by simple linear blends.  Metalness is generally either 0 (pure dielectric) or 1 (pure metal), so we compute separate lookups for dielectrics and metals.  The other linear dimension is <span class='math'>\rho</span>/<span class='math'>R_0</span>,  For dielectric materials, <span class='math'>\rho</span> simply scales the diffuse term.  For metals, the reflection coefficient, <span class='math'>R(\theta_i)</span>, is computed by Schlick's approximation,

<div class='math displayMode'>R(\theta_i)=R_0+(1-R_0)(1-\cos\theta_i)^5\text{,}</div>

which, itself, is just a linear interoplation based on the value of <span class='math'>R_0</span>:

<div class='math displayMode'>R(\theta_i)=\text{lerp}\left([1-\cos\theta_i]^5,\; 1,\; R_0\right)\text{.}</div>

So we store four 2D lookups as functions of view angle and roughness:

1. Dielectric, <span class='math'>\rho = 0</span>
2. Dielectric, <span class='math'>\rho = 1</span>
3. Metal, <span class='math'>R_0 = 0</span>
4. Metal, <span class='math'>R_0 = 1</span>

Three bands of SH coefficients are stored.  Our BRDF product function is symmetrical along the y-axis because it is isotropic and viewed only from the xz-plane.  This allows us to drop the coefficients for <span class='math'>Y_{1,-1}</span>, <span class='math'>Y_{2,-2}</span>, and <span class='math'>Y_{2,-1}</span>, which introduce asymmetry to the y-axis.  The remaining coefficients can be stored in one two-channel texture and one four-channel texture (<code>gl.LUMINANCE_ALPHA</code> and <code>gl.RGBA</code>, respectively).

## Combined BRDF Product Function

**Symbols:**

* Incident light zenith angle, <span class='math'>\theta_i</span>
* Incident light azimuth angle, <span class='math'>\phi_i</span>
* Reflected light zenith angle, <span class='math'>\theta_r</span>
* Reflected light azimuth angle, <span class='math'>\phi_r</span>
* Surface albedo, <span class='math'>\phi</span>
* Roughness, GGX (RMS slope), <span class='math'>\alpha</span>
* Roughness, Oren-Nayar (standard deviation of angle), <span class='math'>\sigma</span>
* Surface normal, <span class='math'>\unitVec{n}</span>
* Light vector, <span class='math'>\unitVec{l} = \vecDef{\sin\theta_i\cos\phi_i,\; \sin\theta_i\sin\phi_i,\; \cos\theta_i}</span>
* View vector, <span class='math'>\unitVec{v} = \vecDef{\sin\theta_r\cos\phi_r,\; \sin\theta_r\sin\phi_r,\; \cos\theta_r}</span>
* Half-angle vector, <span class='math'>\unitVec{h} = \inlineNormalize{\unitVec{l} + \unitVec{v}}</span>

Our diffuse term is given by the [Oren-Nayar model](#ref-oren-nayar) (rewritten as a BRDF),

<div class='math displayMode'>f_\text{r, diffuse} = \frac{\rho}{\pi}\left(A+B\max\left[0,\cos\left(\phi_r-\phi_i\right)\right]\sin\alpha\tan\beta\right)\text{,}</div>

<div class='math displayMode'>A=1.0-0.5\frac{\sigma^2}{\sigma^2+0.33}\text{, }B=0.45\frac{\sigma^2}{\sigma^2+0.09}\text{,}</div>

<div class='math displayMode'>\alpha=\max(\theta_i, \theta_r)\text{, }\beta=\min(\theta_i, \theta_r)\text{.}</div>

In vector notation,

<div class='math displayMode'>\cos\left(\phi_r-\phi_i\right) = \normalize{\unitVec{l} - (\NdotL)\unitVec{n}}\cdot\normalize{\unitVec{v} - (\NdotV)\unitVec{n}}\text{,}</div>

<div class='math displayMode'>\sin\alpha = \sqrt{1-\min(\NdotL, \NdotV)^2}\text{,}</div>

<div class='math displayMode'>\tan\beta = \frac{\sqrt{1-\max(\NdotL, \NdotV)^2}}{\max(\NdotL, \NdotV)}\text{.}</div>

The specular reflectance term is given by [Cook-Torrance](#ref-cook-torrance), with some slight variations.  The <span class='math'>\inlineFraction{1}{\pi}</span> coefficient is moved to the distribution term, <span class='math'>D</span>, and we scale the whole formula by <span class='math'>\inlineFraction{1}{4}</span> to match the formulation given in the GGX paper.  We also drop the Fresnel term, which will included in the combined result,

<div class='math displayMode'>f_\text{r, specular}=\frac{DG}{4(\NdotL)(\NdotV)}\text{,}</div>

with the [GGX facet distribution](#ref-walter-et-al),

<div class='math displayMode'>
D=\frac{\alpha^2{\large \chi}^+\!\left(\unitVec{m}\cdot\unitVec{n}\right)}
{\pi\cos^4\theta_m\left(\alpha^2+\tan^2\theta_m\right)^2}\text{,}\quad
{\large \chi}^+\!\left(a\right) = \begin{cases}
1 & \text{if $a > 0$}\\
0 & \text{if $a \le 0$}
\end{cases}
\text{.}
</div>

This equation introduces a new variable, the "microfacet" normal, <span class='math'>\unitVec{m}</span>, which differs from the macroscopic "surface" normal that we have defined earlier.  The microfacet normal is the normal of the microscopic facet which is reflecting light towards the viewer.  We already know this vector, since we've defined it earlier with a different name; *the half-angle vector*, <span class='math'>\unitVec{h}</span>, a unit vector halfway between the light vector and the view vector.  The angle <span class='math'>\theta_m</span> is just the angle between the microfacet/half-angle vector and the macroscopic surface normal.  Making the necessary subtitutions,

<div class='math displayMode'>\cos\theta_m = \NdotH\text{,}</div>

<div class='math displayMode'>\tan\theta_m = \frac{\sqrt{1-(\NdotH)^2}}{\NdotH}\text{,}</div>

<div class='math displayMode'>D = \frac{\alpha^2{\large \chi}^+(\NdotH)}{\pi (\NdotH)^4\left[\alpha^2+(\NdotH)^{-2}-1\right]^2}\text{.}</div>

The matching Smith geometry attenuation (shadowing/masking) function,

<div class='math displayMode'>G(\unitVec{l}, \unitVec{v}, \unitVec{h}) \approx G_1(\unitVec{l}, \unitVec{h}) G_1(\unitVec{v}, \unitVec{h})\text{,}</div>

<div class='math displayMode'>G_1(\unitVec{v}, \unitVec{m})={\large \chi}^+\!\left(\frac{\unitVec{v}\cdot\unitVec{m}}{\unitVec{v}\cdot\unitVec{n}}\right)\frac{2}{1+\sqrt{1+\alpha^2\tan^2\theta_v}}\text{.}</div>

Rewritten for our coordinate system,

<div class='math displayMode'>\tan\theta_v = \frac{\sqrt{1-(\NdotV)^2}}{\NdotV}\text{,}</div>

<div class='math displayMode'>G_1(\unitVec{v}, \unitVec{h})={\large \chi}^+\!\left(\frac{\VdotH}{\NdotV}\right)\frac{2}{1 + \sqrt{1 + \alpha^2\left[(\NdotV)^{-2} - 1\right]}}\text{.}</div>

An approximate conversion from Beckmann/GGX roughness is given in [Moving Frostbite to Physically Based Rendering](#ref-lagarde-rousiers), however their conclusion is that "there is no good conversion between GGX and Oren-Nayar roughness".  Whatever error it introduces is likely to be outweighed by the error of a low-order SH representation, so it should be good enough here;

<div class='math displayMode'>\sigma = \frac{1}{\sqrt{2}}\arctan{\alpha}\text{.}</div>

The full BRDF product function is then,

<div class='math displayMode'>f_\text{r}^*\!\left(\unitVec{l}, \unitVec{v}\right) = \max\!\left(0,\; \NdotL\right)\,\text{lerp}\!\left( f_\text{r, diffuse}\!\left(\unitVec{l}, \unitVec{v}\right)\!,\; f_\text{r, specular}\!\left(\unitVec{l}, \unitVec{v}\right)\!,\; R\left(\VdotH\right) \right)\text{.}</div>

This function is projected into spherical harmonics using the same method we used to project environmental lighting (see [Part I](/blog/2015/08/20/sh-lighting-part1/)).

# Lighting with Spherical Harmonics

In order for us to apply our BRDF to our environmental lighting, both must be represented in the same space.  Our environmental lighting is already represented in world space, but the result of our BRDF lookup is in a per-fragment local tangent space.  The method I use to rotate the BRDF into world space is given in [Simple and Fast Spherichal Harmonic Rotation](#ref-hable).  The rotation is given by a tangent-space matrix.

Many graphics programmers will be familiar with tangent-space (or TBN) matrices from tangent-space normal mapping.  The idea is to generate a rotation matrix from the surface tangent, bitangent, and normal, which will be used to transform tangent-space coordinates into object/global/eye space.  When working with normal maps, the tangent and bitangent are chosen with respect to texture coordinate axes, as tangent space normal maps store their x- and y- components in the u- and v- texture coordinate directions.  In our case, the choice of tangents will be a bit different.  Our BRDF is stored for view directions in the xz-plane, meaning the y-axis should be directed perpendicular to the viewer.  Since our z-axis is the surface normal direction, this just leaves the x-axis, which should be perpendicular to both the y- and z- axes.  For a right-handed coordinate system,

<div class='math displayMode'>\unitVec{t_y} = \vecDef{t_{y,x}, t_{y,y}, t_{y,z}} = \normalize{\unitVec{n} \times \unitVec{v}}\text{,}</div>

<div class='math displayMode'>\unitVec{t_x} = \vecDef{t_{x,x}, t_{x,y}, t_{x,z}} = \normalize{\unitVec{t_y} \times \unitVec{n}}\text{,}</div>

<div class='math displayMode'>
\boldsymbol{R_{TBN}} = \left[\begin{array}{ccc}
	t_{x,x} & t_{y,x} & n_x \\
	t_{x,y} & t_{y,y} & n_y \\
	t_{x,z} & t_{y,z} & n_z
\end{array}\right]\text{.}
</div>

After rotation, our lighting is computed simply as the dot product of our SH BRDF product function with our SH environmental radiance,

<div class='math displayMode'>L_\text{r} = \boldsymbol{f_\text{r}^*} \cdot \boldsymbol{L_\text{i}}\text{.}</div>

# Results

This scene consists of two rows of spheres, one row of dielectrics and one row of metals, with roughness varying from 0.1 to 1.0, illuminated using a combination of direct lighting and our new spherical harmonics environmental lighting.

<div id='sh-lighting2-demo'></div>
<script>
	require(['arcade/demo/sh-lighting2'], function (init) {
		init('sh-lighting2-demo');
	});
</script>

# References and Further Reading
* <a name='ref-kautz-sloan-snyder'></a>*Fast, Arbitrary BRDF Shading for Low-Frequency Lighting Using Spherical Harmonics* by J. Kautz, P.-P. Sloan, & J. Snyder
* <a name='ref-oren-nayar'></a>*Generalization of Lambert's Reflectance Model* by M. Oren and S. Nayar
* <a name='ref-cook-torrance'></a>*A Reflectance Model for Computer Graphics* by R. Cook and K. Torrance
* <a name='ref-walter-et-al'></a>*Microfacet Models for Refraction through Rough Surfaces* by B. Walter, et al.
* <a name='ref-schlick'></a>*An Inexpensive BRDF Model for Physically-based Rendering* by C. Schlick
* <a name='ref-lagarde-rousiers'></a>*Moving Frostbite to Physically Based Rendering* by S. Lagarde and C. de Rousiers
* <a name='ref-alamia'></a>*[Physically Based Rendering - Cook-Torrance](http://www.codinglabs.net/article_physically_based_rendering_cook_torrance.aspx)* by M. Alamia
* <a name='ref-burley'></a>*Physically-Based Shading at Disney* by Brent Burley
* <a name='ref-gotanda'></a>*Designing Reflectance Models for New Consoles* by Y. Gotanda
* <a name='ref-hable'></a>*[Simple and Fast Spherical Harmonic Rotation](http://www.filmicworlds.com/2014/07/02/simple-and-fast-spherical-harmonic-rotation/)* by J. Hable
