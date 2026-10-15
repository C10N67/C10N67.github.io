// Evolución del homelab: RAM usada por nodo en cada momento, con los hitos encima.
// Los datos viven en data/homelab-evolucion.json; este script solo los pinta.
(function () {
	var fig = document.getElementById('evo-chart');
	if (!fig) return;

	var root = document.documentElement;
	var SVG = 'http://www.w3.org/2000/svg';
	var plot = fig.querySelector('.evo-plot');
	var legend = fig.querySelector('.evo-legend');
	var hitosList = fig.querySelector('.evo-hitos');
	var table = fig.querySelector('.evo-table');
	var tip = fig.querySelector('.evo-tip');

	// Geometría (unidades del viewBox)
	var BAR = 18, GAP = 2, SLOT_PAD = 28;
	var PAD_L = 44, PAD_R = 16, TOP = 52, PLOT_H = 200, AXIS_H = 46;

	function lang() { return root.getAttribute('data-lang') === 'en' ? 'en' : 'es'; }

	// 55.5 -> "55,5" en español
	function fmt(v, l) { return l === 'es' ? String(v).replace('.', ',') : String(v); }
	function fmtBi(v, suf) { return { es: fmt(v, 'es') + (suf || ''), en: fmt(v, 'en') + (suf || '') }; }

	function el(name, attrs, text) {
		var n = document.createElementNS(SVG, name);
		for (var k in attrs) n.setAttribute(k, attrs[k]);
		if (text != null) n.textContent = text;
		return n;
	}

	// Texto bilingüe: un nodo por idioma, el CSS oculta el que no toca
	function bi(make, obj) {
		var frag = document.createDocumentFragment();
		['es', 'en'].forEach(function (l) {
			var n = make(obj[l] != null ? obj[l] : obj.es);
			n.setAttribute('lang', l);
			frag.appendChild(n);
		});
		return frag;
	}

	function span(text) { var s = document.createElement('span'); s.textContent = text; return s; }

	// Barra con la punta redondeada (4px) y la base recta
	function barPath(x, y, w, h) {
		var r = Math.min(4, h, w / 2);
		return 'M' + x + ',' + (y + h) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y +
			'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h) + 'Z';
	}

	// Valores de cada medida. Un nodo sin dato nuevo repite su último valor conocido,
	// marcado con 'desde' (la fecha de la que viene) para pintarlo atenuado
	function valores(entradas, nodos) {
		var ultimo = {};
		return entradas.map(function (e) {
			if (!e.ram) return null;
			var vals = {};
			nodos.forEach(function (n) {
				if (e.ram[n.id] != null) {
					ultimo[n.id] = { v: Number(e.ram[n.id]), fecha: e.fecha };
					vals[n.id] = { v: Number(e.ram[n.id]) };
				} else if (ultimo[n.id]) {
					vals[n.id] = { v: ultimo[n.id].v, desde: ultimo[n.id].fecha || '?' };
				}
			});
			return vals;
		});
	}

	function render(data) {
		var nodos = data.nodos || [];
		var entradas = data.entradas || [];
		var medidas = valores(entradas, nodos);
		// Se dibuja a tamaño real (sin escalar): los huecos se reparten el ancho disponible
		// y, si no caben, el gráfico se desplaza en horizontal
		var minSlot = Math.max(110, nodos.length * (BAR + GAP) + SLOT_PAD * 2);
		var avail = (plot.clientWidth || 600) - PAD_L - PAD_R;
		var slotW = Math.max(minSlot, Math.min(220, avail / Math.max(1, entradas.length)));
		var W = Math.max(plot.clientWidth || 0, PAD_L + entradas.length * slotW + PAD_R);
		var H = TOP + PLOT_H + AXIS_H;
		var y0 = TOP + PLOT_H;
		var yOf = function (v) { return y0 - (v / 100) * PLOT_H; };

		// Última entrada con medidas: la única con valores rotulados
		var ultima = -1;
		medidas.forEach(function (m, i) { if (m) ultima = i; });

		var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-labelledby': 'evo-title' });
		var title = el('title', { id: 'evo-title' });
		title.textContent = 'RAM usada (%) por nodo en cada momento del homelab, con los hitos numerados encima.';
		svg.appendChild(title);

		// Rejilla y eje Y
		[0, 25, 50, 75, 100].forEach(function (v) {
			var y = yOf(v);
			svg.appendChild(el('line', { class: v === 0 ? 'evo-base' : 'evo-grid', x1: PAD_L, x2: W - PAD_R, y1: y, y2: y }));
			svg.appendChild(el('text', { class: 'evo-tick', x: PAD_L - 8, y: y + 4, 'text-anchor': 'end' }, v + ' %'));
		});

		var nHito = 0;
		entradas.forEach(function (e, i) {
			var x0 = PAD_L + i * slotW;
			var cx = x0 + slotW / 2;
			var g = el('g', { class: 'evo-slot', tabindex: '0' });
			g.appendChild(el('rect', { class: 'evo-hover', x: x0 + 4, y: TOP - 6, width: slotW - 8, height: PLOT_H + 6, rx: 8 }));

			var vals = medidas[i];
			if (vals) {
				var conDato = nodos.filter(function (n) { return vals[n.id]; });
				var groupW = conDato.length * (BAR + GAP) - GAP;
				conDato.forEach(function (n, j) {
					var v = Math.max(0, Math.min(100, vals[n.id].v));
					var x = cx - groupW / 2 + j * (BAR + GAP);
					var y = yOf(v);
					var cls = 'evo-bar s-' + nodos.indexOf(n) + (vals[n.id].desde ? ' evo-bar-old' : '');
					g.appendChild(el('path', { class: cls, d: barPath(x, y, BAR, y0 - y) }));
					if (i === ultima) {
						// Redondeado para que no se pisen; el decimal está en el tooltip y en la tabla
						g.appendChild(el('text', { class: 'evo-val', x: x + BAR / 2, y: y - 6, 'text-anchor': 'middle' }, String(Math.round(v))));
					}
				});
			} else {
				g.appendChild(bi(function (t) {
					return el('text', { class: 'evo-empty', x: cx, y: y0 - 12, 'text-anchor': 'middle' }, t);
				}, { es: 'sin medidas', en: 'no data' }));
			}

			// Hitos: insignias numeradas encima del momento en que ocurrieron
			var hitos = e.hitos || [];
			hitos.forEach(function (h, k) {
				nHito++;
				var bx = cx + (k - (hitos.length - 1) / 2) * 26;
				g.appendChild(el('circle', { class: 'evo-badge', cx: bx, cy: 22, r: 10 }));
				g.appendChild(el('text', { class: 'evo-badge-n', x: bx, y: 26, 'text-anchor': 'middle' }, String(nHito)));
			});
			if (hitos.length) g.appendChild(el('line', { class: 'evo-stem', x1: cx, x2: cx, y1: 34, y2: TOP - 6 }));

			// Eje X: momento y fecha
			g.appendChild(bi(function (t) {
				return el('text', { class: 'evo-x', x: cx, y: y0 + 20, 'text-anchor': 'middle' }, t);
			}, e));
			if (e.fecha) g.appendChild(el('text', { class: 'evo-x-sub', x: cx, y: y0 + 37, 'text-anchor': 'middle' }, e.fecha));

			bindTip(g, e, vals, nodos);
			svg.appendChild(g);
		});

		plot.textContent = '';
		plot.appendChild(svg);
		// Si no cabe, se abre mostrando lo más reciente
		plot.scrollLeft = plot.scrollWidth;

		// Leyenda
		legend.textContent = '';
		nodos.forEach(function (n, j) {
			var li = document.createElement('li');
			var sw = document.createElement('span');
			sw.className = 'evo-swatch s-' + j;
			li.appendChild(sw);
			li.appendChild(span(n.nombre));
			var sub = document.createElement('span');
			sub.className = 'muted';
			sub.appendChild(bi(span, n));
			li.appendChild(sub);
			legend.appendChild(li);
		});

		// Lista de hitos numerada
		hitosList.textContent = '';
		entradas.forEach(function (e) {
			(e.hitos || []).forEach(function (h) {
				var li = document.createElement('li');
				li.appendChild(bi(span, h));
				// Un hito puede llevar su propia fecha si no coincide con la de la medida
				var fh = h.fecha || e.fecha;
				if (fh) {
					var f = document.createElement('span');
					f.className = 'muted mono';
					f.textContent = ' · ' + fh;
					li.appendChild(f);
				}
				hitosList.appendChild(li);
			});
		});

		// Tabla equivalente
		table.textContent = '';
		var thead = table.createTHead().insertRow();
		[{ es: 'Fecha', en: 'Date' }, { es: 'Momento', en: 'Moment' }].forEach(function (h) {
			var th = document.createElement('th'); th.appendChild(bi(span, h)); thead.appendChild(th);
		});
		nodos.forEach(function (n) { var th = document.createElement('th'); th.textContent = n.nombre; thead.appendChild(th); });
		var thH = document.createElement('th'); thH.appendChild(bi(span, { es: 'Hitos', en: 'Milestones' })); thead.appendChild(thH);
		var tbody = table.createTBody();
		entradas.forEach(function (e, i) {
			var vals = medidas[i];
			var tr = tbody.insertRow();
			tr.insertCell().textContent = e.fecha || '—';
			tr.insertCell().appendChild(bi(span, e));
			nodos.forEach(function (n) {
				var td = tr.insertCell();
				td.className = 'num';
				if (vals && vals[n.id]) {
					td.appendChild(bi(span, fmtBi(vals[n.id].v, ' %')));
					if (vals[n.id].desde) {
						var d = document.createElement('span');
						d.className = 'muted evo-desde';
						d.appendChild(bi(span, { es: ' (sin cambios desde ' + vals[n.id].desde + ')', en: ' (unchanged since ' + vals[n.id].desde + ')' }));
						td.appendChild(d);
					}
				} else td.textContent = '—';
			});
			var tdH = tr.insertCell();
			(e.hitos || []).forEach(function (h, k) {
				if (k) tdH.appendChild(document.createTextNode(' · '));
				tdH.appendChild(bi(span, h));
				if (h.fecha && h.fecha !== e.fecha) tdH.appendChild(document.createTextNode(' (' + h.fecha + ')'));
			});
		});
	}

	function bindTip(g, e, vals, nodos) {
		function show() {
			var l = lang();
			tip.textContent = '';
			var head = document.createElement('p');
			head.className = 'evo-tip-head';
			head.textContent = (e[l] || e.es) + (e.fecha ? ' · ' + e.fecha : '');
			tip.appendChild(head);
			if (vals) {
				nodos.forEach(function (n, j) {
					if (!vals[n.id]) return;
					var row = document.createElement('p');
					var key = document.createElement('span');
					key.className = 'evo-key s-' + j;
					var val = document.createElement('strong');
					val.textContent = fmt(vals[n.id].v, l) + ' %';
					row.appendChild(key);
					row.appendChild(val);
					row.appendChild(span(' ' + n.nombre));
					if (vals[n.id].desde) {
						var d = span((l === 'en' ? ' · unchanged since ' : ' · sin cambios desde ') + vals[n.id].desde);
						d.className = 'muted';
						row.appendChild(d);
					}
					tip.appendChild(row);
				});
			} else {
				var none = document.createElement('p');
				none.className = 'muted';
				none.textContent = l === 'en' ? 'No RAM data for this moment' : 'Sin medidas de RAM en este momento';
				tip.appendChild(none);
			}
			tip.hidden = false;
			var fr = fig.getBoundingClientRect();
			var gr = g.getBoundingClientRect();
			// Al lado de las barras, nunca encima: a la derecha si cabe, si no a la izquierda
			var mid = gr.left - fr.left + gr.width / 2;
			var left = mid + 52;
			if (left + tip.offsetWidth > fr.width - 8) left = mid - 52 - tip.offsetWidth;
			tip.style.left = Math.max(8, left) + 'px';
			tip.style.top = (gr.top - fr.top + TOP + 10) + 'px';
		}
		function hide() { tip.hidden = true; }
		g.addEventListener('pointerenter', show);
		g.addEventListener('pointerleave', hide);
		g.addEventListener('focus', show);
		g.addEventListener('blur', hide);
	}

	var datos = null, ancho = 0, pendiente = null;
	window.addEventListener('resize', function () {
		clearTimeout(pendiente);
		pendiente = setTimeout(function () {
			if (datos && plot.clientWidth !== ancho) { ancho = plot.clientWidth; render(datos); }
		}, 150);
	});

	fetch(fig.getAttribute('data-src'))
		.then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
		.then(function (d) { datos = d; ancho = plot.clientWidth; render(d); })
		.catch(function () {
			plot.textContent = '';
			var p = document.createElement('p');
			p.className = 'muted';
			p.appendChild(bi(span, { es: 'No se han podido cargar los datos de evolución.', en: "Couldn't load the evolution data." }));
			plot.appendChild(p);
		});
})();
