(function () {
	var root = document.documentElement;

	// Idioma (ES / EN) ------------------------------------------------------
	var langButtons = document.querySelectorAll('[data-set-lang]');

	function setLang(lang) {
		root.setAttribute('data-lang', lang);
		root.setAttribute('lang', lang);
		langButtons.forEach(function (btn) {
			btn.setAttribute('aria-pressed', String(btn.dataset.setLang === lang));
		});
		try { localStorage.setItem('lang', lang); } catch (e) {}
	}

	var saved = null;
	try { saved = localStorage.getItem('lang'); } catch (e) {}
	var browserLang = (navigator.language || 'es').slice(0, 2);
	setLang(saved || (browserLang === 'es' ? 'es' : 'en'));

	langButtons.forEach(function (btn) {
		btn.addEventListener('click', function () { setLang(btn.dataset.setLang); });
	});

	// Menú móvil ------------------------------------------------------------
	var toggle = document.querySelector('.nav-toggle');
	var links = document.getElementById('nav-links');

	function closeMenu() {
		links.classList.remove('open');
		toggle.setAttribute('aria-expanded', 'false');
	}

	toggle.addEventListener('click', function () {
		var open = links.classList.toggle('open');
		toggle.setAttribute('aria-expanded', String(open));
	});
	links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
	document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

	// Animación al hacer scroll + enlace activo en el menú ------------------
	var sections = document.querySelectorAll('.reveal');
	var navMap = {};
	links.querySelectorAll('a[href^="#"]').forEach(function (a) { navMap[a.getAttribute('href').slice(1)] = a; });

	if ('IntersectionObserver' in window) {
		var revealObs = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
					revealObs.unobserve(entry.target);
				}
			});
		}, { threshold: 0.08 });

		var activeObs = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				var link = navMap[entry.target.id];
				if (!link) return;
				if (entry.isIntersecting) {
					Object.keys(navMap).forEach(function (k) { navMap[k].classList.remove('active'); });
					link.classList.add('active');
				}
			});
		}, { rootMargin: '-45% 0px -50% 0px' });

		sections.forEach(function (s) {
			revealObs.observe(s);
			activeObs.observe(s);
		});
	} else {
		sections.forEach(function (s) { s.classList.add('visible'); });
	}

	// Bocadillos de tecnologías: de dónde sale cada una ----------------------
	var SOURCES = {
		t: { href: 'tfg.html', es: 'TFG · Núcleo 5G en Kubernetes', en: 'Thesis · 5G core on Kubernetes' },
		d: { href: '#exp-datatronics', es: 'Datatronics · soporte a la red 5G de VMO2', en: 'Datatronics · VMO2 5G network support' },
		h: { href: 'homelab.html', es: 'Homelab Polaris', en: 'Polaris homelab' },
		e: { href: '#formacion', es: 'Estudios · Grado en Telecomunicación (UC3M)', en: 'Studies · Telecom degree (UC3M)' }
	};
	var chips = document.querySelectorAll('.chips .chip');
	if (chips.length) {
		var pop = document.createElement('div');
		pop.className = 'chip-pop';
		pop.setAttribute('role', 'group');
		pop.hidden = true;
		document.body.appendChild(pop);
		var openChip = null;

		function closePop() {
			pop.hidden = true;
			if (openChip) openChip.setAttribute('aria-expanded', 'false');
			openChip = null;
		}

		function openPop(chip) {
			var l = root.getAttribute('data-lang') === 'en' ? 'en' : 'es';
			var keys = (chip.dataset.src || 'e').split(' ');
			pop.innerHTML = '';
			var title = document.createElement('p');
			title.className = 'chip-pop-title';
			title.textContent = l === 'en' ? 'Where I used it' : 'Dónde la he usado';
			var list = document.createElement('ul');
			keys.forEach(function (k) {
				var src = SOURCES[k];
				if (!src) return;
				var li = document.createElement('li');
				var a = document.createElement('a');
				a.href = src.href;
				a.textContent = src[l];
				a.addEventListener('click', closePop);
				li.appendChild(a);
				list.appendChild(li);
			});
			pop.appendChild(title);
			pop.appendChild(list);
			pop.setAttribute('aria-label', chip.textContent);
			pop.hidden = false;

			// Encima del chip si cabe; si no, debajo. Siempre dentro de la pantalla.
			var r = chip.getBoundingClientRect();
			var pw = pop.offsetWidth, ph = pop.offsetHeight;
			var side = r.top - ph - 14 > 70 ? 'top' : 'bottom';
			var left = r.left + r.width / 2 - pw / 2;
			left = Math.max(12, Math.min(left, document.documentElement.clientWidth - pw - 12));
			var top = side === 'top' ? r.top - ph - 12 : r.bottom + 12;
			pop.dataset.side = side;
			pop.style.left = (left + window.scrollX) + 'px';
			pop.style.top = (top + window.scrollY) + 'px';
			pop.style.setProperty('--arrow-x', (r.left + r.width / 2 - left) + 'px');

			if (openChip) openChip.setAttribute('aria-expanded', 'false');
			openChip = chip;
			chip.setAttribute('aria-expanded', 'true');
		}

		chips.forEach(function (chip) {
			chip.addEventListener('click', function (e) {
				e.stopPropagation();
				openChip === chip ? closePop() : openPop(chip);
			});
		});
		document.addEventListener('click', function (e) { if (!pop.contains(e.target)) closePop(); });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePop(); });
		// Solo al cambiar el ancho: en móvil, ocultar la barra del navegador también dispara resize
		var lastW = window.innerWidth;
		window.addEventListener('resize', function () {
			if (window.innerWidth !== lastW) { lastW = window.innerWidth; closePop(); }
		});
		langButtons.forEach(function (btn) { btn.addEventListener('click', closePop); });
	}

	// Año del pie -----------------------------------------------------------
	document.getElementById('year').textContent = new Date().getFullYear();
})();
