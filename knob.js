import clamp from 'https://cdn.skypack.dev/pin/clamp@v1.0.1-SQElMzftvmkwMyt8XSi7/mode=imports,min/optimized/clamp.js'
import html  from 'https://cdn.skypack.dev/-/snabby@v4.2.4-lCS1XUfWAxhusPuX4Nud/dist=es2020,mode=imports/optimized/snabby.js';
        

const MIN_ANGLE = 36
const MAX_ANGLE = 324

const COLORS = {
    idle: {
        notch: '#d4b87b',
        cylinder: '#404040'
    },
    active: {
        notch: '#ffefa0',
        cylinder: '#308aff'
    }
}


function init (opts={}) {
    let value = opts.value || 0 // between 0 and 100
    value = clamp(value, 0, 100)

    const angle = (MAX_ANGLE - MIN_ANGLE) * (value / 100) + MIN_ANGLE

	return {
        status: 'idle',  // idle | active
        angle,
        value: 0, // between 0 and 100
        size: 128,
        handlers: {
            move: undefined
        }
    }
}


// Calculate the angle that the mouse cursor is from the center of the knob
function calcDegFromCoord (elm, cursorX, cursorY) {
	const bounds = elm.getBoundingClientRect()
	const top = bounds.top + window.pageYOffset
	const left = bounds.left + window.pageXOffset
	const centerX = left + (bounds.width / 2)
	const centerY = top + (bounds.height / 2)
	const x = cursorX - centerX
	const y = cursorY - centerY
	// the magical geometry expression to get degrees from coordinates
	let deg = Math.atan2(x, y) * 180 / Math.PI

	// convert from +/- 180 degrees to 0-360 scale
	if (deg < 0)
		deg += 360

	// make degrees calculated clockwise from the bottom middle
	deg = 360 - deg

	return deg
}


function view (model, update) {

	const _pointerdown = function () {
        model.status = 'active'
        model.handlers.move = function (ev) {
        	const elm = ev.target
        	const deg = clamp(calcDegFromCoord(elm, ev.pageX, ev.pageY), MIN_ANGLE, MAX_ANGLE)
        	if (deg !== model.angle) {
				model.angle = deg
				model.value = Math.floor((deg - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE) * 100)
				update()
				elm.dispatchEvent(new CustomEvent('input', { detail: { value: model.value } }))
			}
		}

		document.body.addEventListener('pointermove', model.handlers.move, { passive: true })

        update()
    }

    const _pointerup = function () {
        if (!model.handlers.move)
        	return
        document.body.removeEventListener('pointermove', model.handlers.move, { passive: true })
        model.handlers.move = undefined
    }

    const _focus = function () {
  		model.status = 'active'
    	update()
    }

    const _blur = function () {
    	model.status = 'idle'
    	update()
    }

    const _keydown = function (ev) {
    	let deg = model.angle

    	if (ev.key === 'ArrowUp' || ev.key === 'ArrowRight')
			deg += 1

		if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown')
			deg -= 1

		deg = clamp(deg, MIN_ANGLE, MAX_ANGLE)
    	if (deg !== model.angle) {
			model.angle = deg
			model.value = Math.floor((deg - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE) * 100)
			update()
			ev.target.dispatchEvent(new CustomEvent('input', { detail: { value: model.value } }))
		}
    }

    return html`<svg viewBox="0 0 128 128"
                     style="box-sizing: border-box; margin: 0px; padding: 0px; overflow: hidden; user-select: none; background-color: #111; cursor: pointer;"
                     tabindex="0"
                     @style:touch-action=${model.status === 'active' ? 'none' : ''	}
                     @style:width=${model.size + 'px'}
                     @style:height=${model.size + 'px'}
                     @on:pointerdown=${_pointerdown}
                     @on:pointerup=${_pointerup}
                     @on:focus=${_focus}
                     @on:blur=${_blur}
                     @on:keydown=${_keydown}

                     tab-index="0"
                     xmlns="http://www.w3.org/2000/svg">
            <g class="knob" style="transform: rotateZ(${model.angle}deg); transform-origin: center;">
                <circle class="cylinder" cx="64" cy="64" r="34" fill="${COLORS[model.status].cylinder}" stroke="rgba(0,0,0,0.3)" stroke-width="8" style="pointer-events: none;"></circle>
                <circle class="bevel" cx="64" cy="64" r="41" stroke="rgba(0,0,0,0.1)" stroke-width="7" fill="none" style="pointer-events: none;"></circle>
                <path class="notch" d="M 64 89 L 64 84" stroke="${COLORS[model.status].notch}" stroke-width="4" fill="none" stroke-linecap="round" style="pointer-events: none;"></path>
            </g>
            <path class="markers" stroke="#d4b87b" stroke-width="2" fill="none" stroke-linecap="round" stroke-opacity="0.5"style="pointer-events: none;"
                d="M38.13744889913117 99.59674775249769 L40.488589908301066 96.36067977499789 M32.8873016277919 95.11269837220809 L35.71572875253809 92.2842712474619 M28.40325224750231 89.86255110086881 L31.639320225002095 87.51141009169892 M24.795712935711805 83.97558198854006 L28.359739032465278 82.15961998958187 M22.15351328301324 77.59674775249768 L25.957739348193854 76.36067977499789 M20.54171301381394 70.88311646177014 L24.492466376194486 70.25737860160923 M20 63.99999999999999 L24 63.99999999999999 M20.54171301381394 57.116883538229835 L24.492466376194493 57.74262139839076 M22.153513283013247 50.40325224750231 L25.95773934819386 51.639320225002095 M24.79571293571182 44.024418011459936 L28.359739032465285 45.84038001041812 M28.403252247502316 38.13744889913117 L31.63932022500211 40.488589908301066 M32.88730162779191 32.8873016277919 L35.7157287525381 35.71572875253809 M38.137448899131186 28.40325224750231 L40.48858990830108 31.639320225002102 M44.02441801145994 24.795712935711812 L45.84038001041813 28.359739032465285 M50.40325224750232 22.15351328301324 L51.63932022500211 25.957739348193854 M57.11688353822985 20.54171301381394 L57.74262139839077 24.492466376194486 M64 20 L64 24 M70.88311646177016 20.54171301381394 L70.25737860160923 24.492466376194493 M77.59674775249769 22.153513283013247 L76.3606797749979 25.95773934819386 M83.97558198854006 24.79571293571182 L82.15961998958187 28.359739032465285 M89.86255110086883 28.403252247502316 L87.51141009169893 31.63932022500211 M95.11269837220809 32.88730162779191 L92.2842712474619 35.7157287525381 M99.59674775249769 38.137448899131186 L96.36067977499789 40.48858990830108 M103.2042870642882 44.02441801145994 L99.64026096753472 45.84038001041813 M105.84648671698676 50.403252247502316 L102.04226065180615 51.63932022500211 M107.45828698618607 57.11688353822984 L103.50753362380551 57.74262139839077 M108 64 L104 64 M107.45828698618607 70.88311646177016 L103.50753362380551 70.25737860160923 M105.84648671698676 77.59674775249769 L102.04226065180615 76.36067977499789 M103.20428706428818 83.97558198854006 L99.64026096753472 82.15961998958187 M99.59674775249769 89.86255110086881 L96.36067977499789 87.51141009169893 M95.11269837220809 95.11269837220809 L92.2842712474619 92.2842712474619 M89.86255110086881 99.59674775249769 L87.51141009169893 96.36067977499789 "></path>
        </svg>`
}


function destroy (model) {
	if (model.handlers.move) {
        document.body.removeEventListener('pointermove', model.handlers.move, { passive: true })
        model.handlers.move = undefined
    }
}


export default { init, view, destroy }
