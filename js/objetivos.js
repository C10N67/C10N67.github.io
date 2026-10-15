// Hoja de ruta del clúster: objetivos con tareas (data/homelab-objetivos.json).
// El estado de cada objetivo y el progreso total salen de las tareas.
(function () {
	var box = document.getElementById('hoja-de-ruta');
	if (!box) return;

	var resumen = box.querySelector('.road-summary');
	var lista = box.querySelector('.road-grid');

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

	var ESTADO = {
		hecho: { es: 'Hecho', en: 'Done', icono: '✓' },
		'en-curso': { es: 'En curso', en: 'In progress', icono: '' },
		pendiente: { es: 'Pendiente', en: 'To do', icono: '' }
	};

	function estadoDe(tareas) {
		var hechas = tareas.filter(function (t) { return t.estado === 'hecho'; }).length;
		if (tareas.length && hechas === tareas.length) return 'hecho';
		if (hechas || tareas.some(function (t) { return t.estado === 'en-curso'; })) return 'en-curso';
		return 'pendiente';
	}

	function medidor(hechas, total) {
		var m = document.createElement('span');
		m.className = 'meter road-meter';
		m.style.setProperty('--level', (total ? Math.round(hechas / total * 100) : 0) + '%');
		m.appendChild(document.createElement('span'));
		return m;
	}

	function render(data) {
		var objetivos = data.objetivos || [];
		var todas = [];
		objetivos.forEach(function (o) { todas = todas.concat(o.tareas || []); });
		var hechas = todas.filter(function (t) { return t.estado === 'hecho'; }).length;
		var enCurso = todas.filter(function (t) { return t.estado === 'en-curso'; }).length;

		// Resumen: progreso total
		resumen.textContent = '';
		var cifra = document.createElement('p');
		cifra.className = 'road-total';
		cifra.appendChild(span(hechas + ' / ' + todas.length, 'road-n'));
		cifra.appendChild(bi({
			es: ' tareas hechas · ' + enCurso + ' en curso',
			en: ' tasks done · ' + enCurso + ' in progress'
		}));
		resumen.appendChild(cifra);
		resumen.appendChild(medidor(hechas, todas.length));
		if (data.actualizado) {
			var act = document.createElement('p');
			act.className = 'muted road-updated';
			act.appendChild(bi({ es: 'Actualizado el ' + data.actualizado, en: 'Updated on ' + data.actualizado }));
			resumen.appendChild(act);
		}

		// Una tarjeta por objetivo
		lista.textContent = '';
		objetivos.forEach(function (o, i) {
			var tareas = o.tareas || [];
			var est = estadoDe(tareas);
			var n = tareas.filter(function (t) { return t.estado === 'hecho'; }).length;

			var li = document.createElement('li');
			li.className = 'road-card road-' + est;
			var head = document.createElement('div');
			head.className = 'road-head';
			head.appendChild(span(String(i + 1).padStart(2, '0'), 'road-num'));
			var h = document.createElement('h3');
			h.appendChild(bi(o));
			head.appendChild(h);
			head.appendChild(bi(ESTADO[est], 'road-chip'));
			li.appendChild(head);

			var prog = document.createElement('div');
			prog.className = 'road-prog';
			prog.appendChild(medidor(n, tareas.length));
			prog.appendChild(span(n + '/' + tareas.length, 'road-count'));
			li.appendChild(prog);

			if (o.nota) {
				var nota = document.createElement('p');
				nota.className = 'road-note muted';
				nota.appendChild(bi(o.nota));
				li.appendChild(nota);
			}

			var ul = document.createElement('ul');
			ul.className = 'road-tasks';
			tareas.forEach(function (t) {
				var e = ESTADO[t.estado] ? t.estado : 'pendiente';
				var tl = document.createElement('li');
				tl.className = 'road-task road-' + e;
				var ic = span(ESTADO[e].icono, 'road-icon');
				ic.setAttribute('aria-hidden', 'true');
				tl.appendChild(ic);
				var txt = document.createElement('span');
				txt.className = 'road-text';
				txt.appendChild(bi(t));
				// Estado en texto para lectores de pantalla (el icono es decorativo)
				var sr = document.createElement('span');
				sr.className = 'sr-only';
				sr.appendChild(bi({ es: ' (' + ESTADO[e].es.toLowerCase() + ')', en: ' (' + ESTADO[e].en.toLowerCase() + ')' }));
				txt.appendChild(sr);
				if (t.fecha && e === 'hecho') txt.appendChild(span(' · ' + t.fecha, 'road-date'));
				if (t.nota) {
					var tn = document.createElement('span');
					tn.className = 'road-tnote';
					tn.appendChild(bi(t.nota));
					txt.appendChild(tn);
				}
				tl.appendChild(txt);
				ul.appendChild(tl);
			});
			li.appendChild(ul);
			lista.appendChild(li);
		});
	}

	fetch(box.getAttribute('data-src'))
		.then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
		.then(render)
		.catch(function () {
			lista.textContent = '';
			lista.appendChild(bi({ es: 'No se ha podido cargar la hoja de ruta.', en: "Couldn't load the roadmap." }, 'muted'));
		});
})();
