/* Niebla densa de fondo (la misma que Hermes), para cualquier página.

   <script src="/js/fog.js" defer></script>

   Opciones con atributos en la etiqueta <script>:
     data-density="1"              más (>1) o menos (<1) densa
     data-dark="150,135,120"       color RGB en modo oscuro
     data-light="252,248,242"      color RGB en modo claro
     data-alpha-dark=".26"  data-alpha-light=".6"   opacidad base

   Va en una capa fija detrás del contenido (z-index -1): nunca tapa textos ni botones.
   Deriva despacio, sigue un poco al ratón (paralaje) y se remueve suave donde pasa el
   cursor. Quieta si el sistema pide reducir animaciones. */
(function () {
	"use strict";
	var me = document.currentScript;
	var opt = function (k, d) { return (me && me.dataset[k]) || d; };
	var density = parseFloat(opt("density", "1")) || 1;
	var dark = matchMedia("(prefers-color-scheme: dark)");
	var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

	function colors() {
		return dark.matches
			? { rgb: opt("dark", "150,135,120"), a: parseFloat(opt("alphaDark", ".26")) }
			: { rgb: opt("light", "252,248,242"), a: parseFloat(opt("alphaLight", ".6")) };
	}

	function start() {
		var layers = ["fog-back", "fog-front"].map(function (id) {
			var c = document.createElement("canvas");
			c.className = "site-fog"; c.setAttribute("aria-hidden", "true");
			c.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:-1";
			document.body.insertBefore(c, document.body.firstChild);
			return { c: c, ctx: c.getContext("2d") };
		});
		var W = 0, H = 0, puffs = [], wisps = [], sprite = null, last = 0;
		var mouse = { x: 0, y: 0, vx: 0, vy: 0, px: null, py: null, on: false };
		var par = { x: 0, y: 0 };

		addEventListener("pointermove", function (e) {
			if (mouse.px != null) { mouse.vx += e.clientX - mouse.px; mouse.vy += e.clientY - mouse.py; }
			mouse.px = mouse.x = e.clientX; mouse.py = mouse.y = e.clientY; mouse.on = true;
		}, { passive: true });
		document.addEventListener("pointerleave", function () { mouse.on = false; mouse.px = mouse.py = null; });

		function makeSprite() {
			var col = colors(), c = document.createElement("canvas");
			c.width = c.height = 256;
			var g = c.getContext("2d"), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
			gr.addColorStop(0, "rgba(" + col.rgb + ",1)"); gr.addColorStop(.35, "rgba(" + col.rgb + ",.75)");
			gr.addColorStop(.7, "rgba(" + col.rgb + ",.25)"); gr.addColorStop(1, "rgba(" + col.rgb + ",0)");
			g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
			return { c: c, a: col.a };
		}
		function rnd(a, b) { return a + Math.random() * (b - a); }
		function puff(front) {
			var m = Math.max(W, H);
			var y = H * (front ? rnd(.55, 1.1) : Math.pow(Math.random(), .6) * 1.15 - .05);
			return { x: rnd(-.2, 1.2) * W, y: y, r: m * (front ? rnd(.16, .3) : rnd(.18, .42)),
				vx: rnd(1.5, 5) * (Math.random() < .5 ? -1 : 1) * (front ? 1.5 : 1), vy: rnd(-.6, .6),
				a: front ? rnd(.35, .7) : rnd(.35, 1), ph: rnd(0, 6.28), ox: 0, oy: 0, kx: 0, ky: 0 };
		}
		function size() {
			W = innerWidth; H = innerHeight;
			layers.forEach(function (l) {
				l.c.width = Math.ceil(W / 2); l.c.height = Math.ceil(H / 2);   // la niebla es borrosa: media resolución basta
				l.ctx.setTransform(.5, 0, 0, .5, 0, 0);
			});
			var n = Math.round(Math.min(70, Math.max(26, W * H / 26000)));
			puffs = []; wisps = [];
			for (var i = 0; i < n; i++) puffs.push(puff(false));
			for (i = 0; i < Math.round(n / 3); i++) wisps.push(puff(true));
			sprite = makeSprite();
		}
		function step(list, dt, stir) {
			var spring = Math.min(1, dt * .6), damp = Math.pow(.2, dt);
			list.forEach(function (p) {
				p.x += p.vx * dt; p.y += p.vy * dt;
				if (p.x - p.r > W * 1.2) p.x = -p.r; else if (p.x + p.r < -W * .2) p.x = W + p.r;
				if (mouse.on && (mouse.vx || mouse.vy)) {
					var d = Math.hypot(p.x + p.ox - mouse.x, p.y + p.oy - mouse.y);
					if (d < p.r) { var f = (1 - d / p.r) * stir; p.kx += mouse.vx * f; p.ky += mouse.vy * f; }
				}
				p.kx *= damp; p.ky *= damp;
				p.ox += (p.kx - p.ox * .9) * spring; p.oy += (p.ky - p.oy * .9) * spring;
			});
		}
		function paint(l, list, t, k, depth) {
			var ctx = l.ctx, sx = par.x * depth, sy = par.y * depth;
			ctx.clearRect(0, 0, W, H);
			list.forEach(function (p) {
				ctx.globalAlpha = Math.min(1, sprite.a * p.a * k * density * (0.88 + 0.12 * Math.sin(p.ph + t / 6000)));
				ctx.drawImage(sprite.c, p.x + p.ox + sx - p.r, p.y + p.oy + sy - p.r, p.r * 2, p.r * 2);
			});
			ctx.globalAlpha = 1;
		}
		var lastPaint = -1e9;
		function frame(t) {
			// 30 fotogramas por segundo bastan para algo tan lento: la mitad de trabajo (y de batería)
			if (!reduce && t - lastPaint < 31) { requestAnimationFrame(frame); return; }
			lastPaint = t;
			var dt = Math.min(.1, (t - (last || t)) / 1000); last = t;
			if (!reduce) {
				var tx = mouse.on ? (mouse.x / W - .5) * -26 : 0, ty = mouse.on ? (mouse.y / H - .5) * -18 : 0;
				var e = Math.min(1, dt * .9);
				par.x += (tx - par.x) * e; par.y += (ty - par.y) * e;
				step(puffs, dt, .05); step(wisps, dt, .08);
				mouse.vx = mouse.vy = 0;
			}
			paint(layers[0], puffs, t, 1.6, .6);
			paint(layers[1], wisps, t, 1, 1.2);
			if (!reduce) requestAnimationFrame(frame);
		}
		addEventListener("resize", function () { size(); if (reduce) frame(0); });
		if (dark.addEventListener) dark.addEventListener("change", function () { sprite = makeSprite(); if (reduce) frame(0); });
		size(); requestAnimationFrame(frame);
	}

	if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
