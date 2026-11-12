/* Contador de visitas (GoatCounter: gratis, sin cookies, no rastrea a nadie).

   Tus propias visitas NO cuentan:
   - en cualquier navegador donde hayas entrado al panel de Aracne (tiene tu token guardado);
   - en cualquier navegador donde hayas abierto la web una vez con «#soy-yo» al final de la
     dirección (p. ej. https://c10n67.github.io/#soy-yo). «#no-soy-yo» lo deshace.

   Las estadísticas se ven en https://hermes2121.goatcounter.com (con tu cuenta). */
(function () {
	"use strict";
	var CODIGO = "hermes2121";   // cuenta de GoatCounter: estadísticas en https://hermes2121.goatcounter.com

	var KEY = "visitas.yo";
	function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
	function set(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

	function aviso(texto) {
		var t = document.createElement("div");
		t.setAttribute("role", "status");
		t.textContent = texto;
		t.style.cssText = "position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:2147483647;" +
			"background:#2b2421;color:#efe6dc;font:14px/1.4 system-ui,sans-serif;padding:10px 18px;border-radius:999px;" +
			"box-shadow:0 10px 30px -10px rgba(0,0,0,.6);max-width:calc(100% - 32px);text-align:center";
		(document.body || document.documentElement).appendChild(t);
		setTimeout(function () { t.remove(); }, 4000);
	}
	function limpiarHash() { history.replaceState(null, "", location.pathname + location.search); }

	function marca(alCargar) {
		var msg = null;
		if (location.hash === "#soy-yo") { set(KEY, "1"); msg = "Hecho: tus visitas desde este navegador ya no cuentan"; }
		else if (location.hash === "#no-soy-yo") { set(KEY, null); msg = "Este navegador vuelve a contar como visita"; }
		if (!msg) return;
		limpiarHash();
		if (alCargar && document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { aviso(msg); });
		else aviso(msg);
	}
	marca(true);
	// Si la página ya estaba abierta y solo cambias el final de la dirección, no se recarga: escuchar el cambio
	addEventListener("hashchange", function () { marca(false); });

	var soyYo = get(KEY) === "1" || !!get("aracne.token") || !!get("hermes.token");
	if (!CODIGO || soyYo) return;

	var s = document.createElement("script");
	s.async = true;
	s.src = "https://gc.zgo.at/count.js";
	s.setAttribute("data-goatcounter", "https://" + CODIGO + ".goatcounter.com/count");
	document.head.appendChild(s);
})();
