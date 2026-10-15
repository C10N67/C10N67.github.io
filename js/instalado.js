// Qué hay instalado en el clúster en cada momento. Los datos son una lista de cambios
// por fecha (data/homelab-instalado.json); el estado se calcula aplicándolos en orden.
(function () {
	var box = document.getElementById('instalado');
	if (!box) return;

	var botones = box.querySelector('.res-dates');
	var lista = box.querySelector('.inst-grid');
	var cambiosEl = box.querySelector('.inst-cambios');
	var resumen = box.querySelector('.inst-resumen');

	function span(text, cls) {
		var s = document.createElement('span');
		if (cls) s.className = cls;
		s.textContent = text;
		return s;
	}

	// Texto bilingüe: un nodo por idioma, el CSS oculta el que no toca
	function bi(obj, cls) {
		var frag = document.createDocumentFragment();
		['es', 'en'].forEach(function (l) {
			var s = span(obj[l] != null ? obj[l] : obj.es, cls);
			s.setAttribute('lang', l);
			frag.appendChild(s);
		});
		return frag;
	}

	var ETIQUETA = {
		instala: { es: 'Nuevo', en: 'New' },
		actualiza: { es: 'Actualizado', en: 'Updated' },
		mueve: { es: 'Movido', en: 'Moved' },
		quita: { es: 'Retirado', en: 'Removed' }
	};
	var SIGNO = { instala: '+', actualiza: '↑', mueve: '→', quita: '−' };

	// Estado tras cada momento: { nombre: componente } más los cambios de ese momento
	function estados(momentos) {
		var actual = {};
		var orden = [];
		return momentos.map(function (m) {
			var detalle = [];
			(m.cambios || []).forEach(function (c) {
				var antes = actual[c.nombre];
				if (c.accion === 'quita') {
					if (antes) { detalle.push({ c: c, antes: antes }); delete actual[c.nombre]; }
					return;
				}
				var nuevo = {};
				for (var k in antes || {}) nuevo[k] = antes[k];
				['categoria', 'version', 'donde', 'nota'].forEach(function (k) { if (c[k] != null) nuevo[k] = c[k]; });
				nuevo.nombre = c.nombre;
				actual[c.nombre] = nuevo;
				if (orden.indexOf(c.nombre) < 0) orden.push(c.nombre);
				detalle.push({ c: c, antes: antes, despues: nuevo });
			});
			var copia = orden.filter(function (n) { return actual[n]; }).map(function (n) { return actual[n]; });
			return { m: m, comps: copia, detalle: detalle };
		});
	}

	function render(data) {
		var cats = data.categorias || [];
		var pasos = estados(data.momentos || []);
		if (!pasos.length) return;

		function mostrar(i) {
			var p = pasos[i];
			var cambiado = {};
			p.detalle.forEach(function (d) { cambiado[d.c.nombre] = d.c.accion; });

			// Componentes por categoría
			lista.textContent = '';
			var usadas = cats.concat([{ id: null, es: 'Otros', en: 'Other' }]);
			usadas.forEach(function (cat) {
				var comps = p.comps.filter(function (c) {
					return cat.id ? c.categoria === cat.id : !cats.some(function (k) { return k.id === c.categoria; });
				});
				if (!comps.length) return;
				var grupo = document.createElement('div');
				grupo.className = 'inst-cat';
				var h = document.createElement('h4');
				h.appendChild(bi(cat));
				grupo.appendChild(h);
				var ul = document.createElement('ul');
				comps.forEach(function (c) {
					var li = document.createElement('li');
					var a = cambiado[c.nombre];
					if (a) li.className = 'inst-' + a;
					var top = document.createElement('div');
					top.className = 'inst-top';
					top.appendChild(span(c.nombre, 'inst-name'));
					if (c.version) top.appendChild(span(c.version, 'inst-ver'));
					if (a) top.appendChild(bi(ETIQUETA[a], 'inst-badge'));
					li.appendChild(top);
					var sub = document.createElement('div');
					sub.className = 'inst-sub';
					if (c.donde) sub.appendChild(span(c.donde));
					if (c.nota) { if (c.donde) sub.appendChild(span(' · ')); sub.appendChild(bi(c.nota)); }
					li.appendChild(sub);
					ul.appendChild(li);
				});
				grupo.appendChild(ul);
				lista.appendChild(grupo);
			});

			// Qué cambió en este momento
			cambiosEl.textContent = '';
			p.detalle.forEach(function (d) {
				var li = document.createElement('li');
				li.className = 'inst-' + d.c.accion;
				li.appendChild(span(SIGNO[d.c.accion] || '·', 'inst-sign'));
				li.appendChild(bi(ETIQUETA[d.c.accion] || { es: d.c.accion, en: d.c.accion }, 'inst-what'));
				li.appendChild(span(': ' + d.c.nombre, 'inst-name'));
				var extra = '';
				if (d.c.accion === 'actualiza' && d.antes) extra = (d.antes.version || '?') + ' → ' + (d.despues.version || '?');
				else if (d.c.accion === 'mueve' && d.antes) extra = (d.antes.donde || '?') + ' → ' + (d.despues.donde || '?');
				else if (d.c.accion === 'instala' && d.despues) extra = [d.despues.version, d.despues.donde].filter(Boolean).join(' · ');
				if (extra) li.appendChild(span(' · ' + extra, 'muted'));
				cambiosEl.appendChild(li);
			});

			resumen.textContent = '';
			var n = p.comps.length;
			resumen.appendChild(bi({
				es: n + ' componentes · ' + p.detalle.length + ' cambios el ' + p.m.fecha,
				en: n + ' components · ' + p.detalle.length + ' changes on ' + p.m.fecha
			}));

			botones.querySelectorAll('button').forEach(function (b, j) { b.setAttribute('aria-pressed', String(j === i)); });
		}

		botones.textContent = '';
		pasos.forEach(function (p, i) {
			var b = document.createElement('button');
			b.type = 'button';
			b.appendChild(bi(p.m));
			if (p.m.fecha) {
				var f = document.createElement('small');
				f.textContent = p.m.fecha;
				b.appendChild(f);
			}
			b.addEventListener('click', function () { mostrar(i); });
			botones.appendChild(b);
		});
		botones.hidden = false;
		mostrar(pasos.length - 1);
	}

	fetch(box.getAttribute('data-src'))
		.then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
		.then(render)
		.catch(function () {
			lista.textContent = '';
			lista.appendChild(bi({ es: 'No se han podido cargar los datos.', en: "Couldn't load the data." }, 'muted'));
		});
})();
