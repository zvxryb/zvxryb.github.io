---
layout: post
section: WebApps
title: Strafe Jump Trainer
---
Strafe jumping is a movement technique developed in some of the earliest first-person 
games which involves continuously adjusting your angle of acceleration to bypass in-game 
speed limits.  Originally considered a bug or defect, it has been adopted by both
players and game developers to provide an additional element of skill and depth to these
games.  Strafe jumping may be considered an early example of emergent gameplay in modern
3D games.

This web application enables any player to learn this skill quickly and easily.

<!--continue-->

## Application

[Fullscreen, Direct Link](/strafe-jump-trainer/) (Recommended!)

<iframe width="800" height="800" allow="fullscreen" src="/strafe-jump-trainer/">
</iframe>

[Source](https://github.com/zvxryb/strafe-jump-trainer)

## Browser Support

Firefox and Chrome are suppported.  Firefox does not allow fullscreen through iframes,
so it is recommended to view the full-screen version by the direct link given above.

Edge is currently missing a required API (TextEncoder/TextDecoder), but is expected to
be supported when the Chromium-based rewrite is available.

Internet Explorer is unsupported.

Other browsers may work but are untested.

Strafe Jump Trainer necessarily requires a mouse and keyboard and is unlikely to work on Mobile.

## Technologies

Built using Rust and WebAssembly, using the [wasm-bindgen + web-sys](https://github.com/rustwasm/wasm-bindgen) stack with the wasm32-unknown-unknown target.