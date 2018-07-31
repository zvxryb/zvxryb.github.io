---
layout: post
section: WebApps
title: Display Transfer Curve Tester
---
A small application to determine a display's approximate transfer curve using a series of test patterns.

Scroll up or down to match brightness, then click to move onto the next pattern.

Results will be displayed in a graph with ideal sRGB and Rec. 709/2020 curves for reference.

<!--continue-->

<div id='monitor-test-container'>
    <canvas id='monitor-test-canvas'></canvas>
    <div id='monitor-test-overlay'>
        <div id='monitor-test-startup-ui'>
            <h1>Instructions</h1>
            <p>Measure a monitor's <i>approximate</i> response curve using a series of test patterns.</p>
            <p>
                The test patterns must be viewed at native resolution with any "sharpness" adjustments disabled.
                Results have not been validated against a ground-truth (i.e. a properly calibrated colorimeter).
            </p>
            <p><b>Scroll up/down to match color, then click to advance to the next pattern, repeat.</b></p>
            <h2>Select test patterns</h2>
            <label><input type='checkbox' id='monitor-test-r'><span class='toggle fa fa-lg'></span> Red</label>
            <label><input type='checkbox' id='monitor-test-g'><span class='toggle fa fa-lg'></span> Green</label>
            <label><input type='checkbox' id='monitor-test-b'><span class='toggle fa fa-lg'></span> Blue</label>
            <label><input type='checkbox' id='monitor-test-w' checked><span class='toggle fa fa-lg'></span> Grayscale</label>
            <input type='button' id='monitor-test-start' value='Begin Measurement'>
        </div>
        <div id='monitor-test-results-ui'>
            <input type='button' id='monitor-test-restart' value='Restart'>
            <h1>Key</h1>
            <span style='color:#ffc000;'>sRGB</span><br>
            <span style='color:#00c0ff;'>Rec.709 / Rec. 2020</span><br>
            <span style='color:#ff0000;'>Monitor Red</span><br>
            <span style='color:#00ff00;'>Monitor Green</span><br>
            <span style='color:#0000ff;'>Monitor Blue</span><br>
            <span style='color:#ffffff;'>Monitor Grayscale</span><br>
        </div>
    </div>
    <script src='/arcade/monitor_calibration/monitor.js'></script>
    <script>
        let css = document.createElement('link')
        css.rel = 'stylesheet'
        css.href = '/arcade/monitor_calibration/monitor.css'
        css.addEventListener('load', event => monitorTestInit())
        document.head.appendChild(css)
    </script>
</div>