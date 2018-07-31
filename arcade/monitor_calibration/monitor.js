'use strict'

/* mlodato, 20171012 */

function monitorTestInit() {
    var root = document.getElementById('monitor-test-container')
    
    var requestFullscreen = (() => {
        var requestFullscreen = root.requestFullscreen
                             || root.mozRequestFullScreen
                             || root.msRequestFullscreen
                             || root.webkitRequestFullscreen
                             || (() => {})
        return requestFullscreen.bind(root)
    })()

    var canvas = document.getElementById('monitor-test-canvas')
    var draw = (() => {
        var ctx = canvas.getContext('2d')
        var f = () => {}

        function resize() {
            canvas.width  = canvas.clientWidth
            canvas.height = canvas.clientHeight
            f(ctx, canvas.width, canvas.height)
        }

        [
            'fullscreenchange',
            'mozfullscreenchange',
            'msfullscreenchange',
            'webkitfullscreenchange'
        ].forEach((event) => { document.addEventListener(event, resize) })
        resize()

        return (g, ...args) => {
            f = (ctx, w, h) => requestAnimationFrame(g.bind(undefined, ctx, w, h, ...args))
            f(ctx, canvas.width, canvas.height)
        }
    })()

    function displayPattern(ctx, w, h, mask, c0, c1, c) {
        var image = ctx.createImageData(128, 128)

        for (var i = 0; i < 128; ++i)
        for (var j = 0; j < 128; ++j) {
            var x = c[0]
            if (i < 64 != j < 64)
                x = ((i < 64) ? i : j) & 1 ? c0[0] : c1[0]
            var k = 4 * (128 * j + i)
            image.data[k + 0] = mask & 1 ? 255 * x : 0
            image.data[k + 1] = mask & 2 ? 255 * x : 0
            image.data[k + 2] = mask & 4 ? 255 * x : 0
            image.data[k + 3] = 255
        }

        createImageBitmap(image).then((bitmap) => {
            var pattern = ctx.createPattern(bitmap, 'repeat')
            
            ctx.fillStyle = pattern
            ctx.fillRect(0, 0, w, h)
        })
    }

    function withWheel(node, f, promise) {
        node.addEventListener('wheel', f)
        function detach() {
            node.removeEventListener('wheel', f)
        }
        promise.then(detach, detach)
        return promise
    }

    function onClick(node) {
        return new Promise(function (resolve, reject) {
            node.addEventListener('click', resolve, {once: true})
        })
    }
    
    function to_sRGB(c) {
        return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1/2.4) - 0.055
    }

    function from_sRGB(c) {
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    }

    function middleValue_sRGB(c0, c1) {
        return [to_sRGB((from_sRGB(c0[0]) + from_sRGB(c1[0])) / 2), (c0[1] + c1[1]) / 2]
    }
    
    function to_Rec2020(c) {
        return c <= 0.018 ? 4.5 * c : 1.099 * Math.pow(c, 0.45) - 0.099
    }

    function from_Rec2020(c) {
        return c <= 0.081 ? c / 4.5 : Math.pow((c + 0.099) / 1.099, 2.222)
    }
    
    function middleValue_Rec2020(c0, c1) {
        return [to_Rec2020((from_Rec2020(c0[0]) + from_Rec2020(c1[0])) / 2), (c0[1] + c1[1]) / 2]
    }

    function middleValue(mask, c0, c1) {
        var c = middleValue_sRGB(c0, c1)
        draw(displayPattern, mask, c0, c1, c)
        return new Promise((resolve, reject) => {
            withWheel(canvas, (ev) => {
                if (ev.deltaY < 0 && (c[0] -= 0.0039) < c0[0]) c[0] = c0[0]
                if (ev.deltaY > 0 && (c[0] += 0.0039) > c1[0]) c[0] = c1[0]
                draw(displayPattern, mask, c0, c1, c)
            }, onClick(canvas)).then(() => {
                resolve(c)
            })
        })
    }

    function sequential(f, ...fs) {
        if (!f)
            return Promise.resolve([])
        
        return new Promise((resolve, reject) => {
            f().then((x) => {
                if (fs.length > 0) {
                    sequential(...fs).then(([...xs]) => {
                        resolve([x, ...xs])
                    })
                } else
                    resolve([x])
            })
        })
    }

    function _curve(mask, c0, c1) {
        return new Promise((resolve, reject) => {
            middleValue(mask, c0, c1).then((c) => {
                if (c1[0] - c0[0] < 0.1 || c1[1] - c0[1] < 0.1)
                    resolve([c])
                else {
                    sequential(
                        _curve.bind(undefined, mask, c0, c),
                        _curve.bind(undefined, mask, c, c1)
                    ).then(([l, r]) => {
                        resolve([...l, c, ...r])
                    })
                }
            })
        })
    }
    
    function curve(mask) {
        return new Promise((resolve, reject) => {
            var c0 = [0, 0]
            var c1 = [1, 1]
            _curve(mask, c0, c1).then((c) => {
                resolve([mask, c0, ...c, c1])
            })
        })
    }

    function plot_curve(ctx, w, h, curve) {
        ctx.beginPath()
        var first = true
        curve.forEach((c) => {
            var x = (w - 1) * c[0]
            var y = (h - 1) * (1 - c[1])
            if (first)
                ctx.moveTo(x, y)
            else
                ctx.lineTo(x, y)

            first = false
        })

        ctx.stroke()
    }

    function plot_function(ctx, w, h, f) {
        ctx.beginPath()
        var first = true
        for (var i = 0; i < w; ++i) {
            var u = i / (w - 1)
            var x = i
            var y = (h - 1) * (1 - f(u))
            if (first)
                ctx.moveTo(x, y)
            else
                ctx.lineTo(x, y)

            first = false
        }

        ctx.stroke()
    }

    function plot_sRGB(ctx, w, h) {
        plot_function(ctx, w, h, from_sRGB)
    }
    
    function plot_Rec2020(ctx, w, h) {
        plot_function(ctx, w, h, from_Rec2020)
    }
    
    function show(node, value=true) {
        if (value) {
            if (node.classList.contains('hidden'))
                node.classList.remove('hidden')
        } else {
            if (!node.classList.contains('hidden'))
                node.classList.add('hidden')
        }
    }

    function hide(node) { show(node, false) }

    var startupUI = document.getElementById('monitor-test-startup-ui')
    var resultsUI = document.getElementById('monitor-test-results-ui')

    function start() {
        draw(displayPattern, 7, [0, 0], [1, 1], [0.73, 0.5])
        show(startupUI)
        hide(resultsUI)
    }
    
    document.getElementById('monitor-test-restart').addEventListener('click', start)
    document.getElementById('monitor-test-start').addEventListener('click', () => {
        hide(startupUI)
        
        var config = [
            ['w', 7],
            ['r', 1],
            ['g', 2],
            ['b', 4]
        ].filter(([k, _]) =>
            document.getElementById('monitor-test-' + k).checked
        )
        
        requestFullscreen()
        sequential(
            ...config.map(([_, mask]) => curve.bind(undefined, mask))
        ).then((results) => {
            draw((ctx, w, h) => {
                ctx.fillStyle = 'black'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                
                ctx.strokeStyle = '#ffc000'
                plot_sRGB(ctx, w, h)
                
                ctx.strokeStyle = '#00c0ff'
                plot_Rec2020(ctx, w, h)
    
                results.forEach(([mask, ...c]) => {
                    ctx.strokeStyle = {
                        1: '#ff0000',
                        2: '#00ff00',
                        4: '#0000ff',
                        7: '#ffffff'
                    }[mask]
                    plot_curve(ctx, w, h, c)
                })
            })
            show(resultsUI)
        })
    })

    start()
}