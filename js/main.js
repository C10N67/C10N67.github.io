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

	// Año del pie -----------------------------------------------------------
	document.getElementById('year').textContent = new Date().getFullYear();
})();
