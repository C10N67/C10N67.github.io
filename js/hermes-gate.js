/* Puerta oculta a Hermes (/hermes/).
   - Escribe «hermes» en cualquier parte de la página (fuera de los campos de texto).
   - O haz 5 clics/toques seguidos en un elemento con el atributo data-hermes-gate. */
(function () {
	"use strict";
	var TARGET = "/hermes/";
	var WORD = "hermes";
	var buf = "", taps = 0, last = 0, going = false, overlay = null;

	function go() {
		if (going) return;
		going = true;
		var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
		var o = overlay = document.createElement("div");
		o.setAttribute("aria-hidden", "true");
		o.style.cssText = "position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;pointer-events:none;" +
			"background:radial-gradient(circle,rgba(27,23,20,0),rgba(27,23,20,.85));opacity:0;transition:opacity .35s";
		o.innerHTML = reduce ? "" : '<svg viewBox="0 6 64 40" width="160" height="100" style="transition:transform .45s cubic-bezier(.5,0,.8,.4),opacity .35s .1s">' +
			'<defs><linearGradient id="hg-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2c98a"/><stop offset="1" stop-color="#c97b4a"/></linearGradient></defs>' +
			'<g fill="url(#hg-g)"><path id="hg-w" d="M27.5 31C21 22.5 13 16 3 12c1.4 6.6 4.6 11.4 8.6 14.4-2.6.4-4.8 1.2-6.6 2.8 3.6 2.8 8 4.2 12.6 4.4-2 1.4-3.6 3.2-4.6 5.4 5.2 1.4 10.6 1 15.8-1.4z"/>' +
			'<use href="#hg-w" transform="matrix(-1 0 0 1 64 0)"/><circle cx="32" cy="35" r="7.2"/></g></svg>';
		document.body.appendChild(o);
		var wings = o.firstChild;
		requestAnimationFrame(function () {
			o.style.opacity = "1";
			if (wings) setTimeout(function () { wings.style.transform = "translateY(-70vh) scale(.6)"; wings.style.opacity = "0"; }, 150);
		});
		// Se cambia de página cuando las alas ya se han ido (150 ms + 450 ms de vuelo):
		// así el navegador no se queda con ellas congeladas en pantalla mientras carga Hermes.
		setTimeout(function () { if (wings) wings.remove(); location.href = TARGET; }, reduce ? 150 : 650);
	}

	// Al volver con «atrás», el navegador restaura la página de memoria: quitar el velo y las alas.
	window.addEventListener("pageshow", function () {
		if (overlay) { overlay.remove(); overlay = null; }
		going = false; buf = ""; taps = 0;
	});

	document.addEventListener("keydown", function (e) {
		if (e.ctrlKey || e.metaKey || e.altKey || !e.key || e.key.length !== 1) return;
		var t = e.target;
		if (t && t.closest && t.closest("input, textarea, select, [contenteditable]")) return;
		buf = (buf + e.key.toLowerCase()).slice(-WORD.length);
		if (buf === WORD) go();
	});

	document.addEventListener("click", function (e) {
		if (!e.target.closest || !e.target.closest("[data-hermes-gate]")) return;
		var now = Date.now();
		taps = now - last < 700 ? taps + 1 : 1;
		last = now;
		if (taps >= 5) { e.preventDefault(); go(); }
	}, true);
})();
