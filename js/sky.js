/* Cielo animado de la portada: las estrellas giran lentamente y se recolocan
   alternando constelaciones reales y logos del stack (Simple Icons, CC0). */
(function () {
	var wrap = document.querySelector('.hero-wrap');
	if (!wrap) return;
	var canvas = wrap.querySelector('.hero-sky');
	var anchor = wrap.querySelector('.hero-sky-anchor');
	var ctx = canvas.getContext('2d');
	var lightMq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : { matches: false };
	function starColor() { return lightMq.matches ? '#1e3a8a' : '#cfe6ff'; }

	// Coordenadas normalizadas (0..1, y hacia abajo) y aristas de cada constelación
	var CONSTELLATIONS = [
		{ es: 'Osa Mayor', en: 'Ursa Major',
			pts: [[.10, .38], [.14, .62], [.36, .70], [.40, .46], [.58, .40], [.74, .36], [.92, .48]],
			mag: [3, 2.6, 2.2, 1.8, 2.8, 2.6, 2.6],
			edges: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]] },
		{ es: 'Orión', en: 'Orion',
			pts: [[.46, .06], [.28, .22], [.68, .26], [.40, .52], [.50, .50], [.60, .48], [.34, .86], [.74, .82]],
			mag: [1.6, 3.2, 2.4, 2.2, 2.4, 2.2, 2, 3.2],
			edges: [[0, 1], [0, 2], [1, 3], [2, 5], [3, 4], [4, 5], [3, 6], [5, 7]] },
		{ es: 'Casiopea', en: 'Cassiopeia',
			pts: [[.06, .34], [.28, .62], [.48, .40], [.70, .64], [.94, .30]],
			mag: [2.4, 2.8, 3, 2.4, 2.2],
			edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
		{ es: 'Cisne', en: 'Cygnus',
			pts: [[.52, .06], [.50, .40], [.48, .92], [.26, .48], [.08, .62], [.74, .32], [.92, .22]],
			mag: [3.2, 2.6, 2.2, 2.2, 1.8, 2.2, 1.8],
			edges: [[0, 1], [1, 2], [1, 3], [3, 4], [1, 5], [5, 6]] },
		{ es: 'Osa Menor · Polaris', en: 'Ursa Minor · Polaris',
			pts: [[.08, .14], [.26, .24], [.40, .36], [.52, .50], [.68, .56], [.74, .76], [.56, .78]],
			mag: [3.6, 1.8, 1.8, 2, 2, 2.6, 3],
			edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] }
	];

	// Rutas de 24x24 de Simple Icons y color (aclarado si el oficial es muy oscuro)
	var LOGO_PATHS = {
		kubernetes: 'M10.204 14.35l.007.01-.999 2.413a5.171 5.171 0 0 1-2.075-2.597l2.578-.437.004.005a.44.44 0 0 1 .484.606zm-.833-2.129a.44.44 0 0 0 .173-.756l.002-.011L7.585 9.7a5.143 5.143 0 0 0-.73 3.255l2.514-.725.002-.009zm1.145-1.98a.44.44 0 0 0 .699-.337l.01-.005.15-2.62a5.144 5.144 0 0 0-3.01 1.442l2.147 1.523.004-.002zm.76 2.75l.723.349.722-.347.18-.78-.5-.623h-.804l-.5.623.179.779zm1.5-3.095a.44.44 0 0 0 .7.336l.008.003 2.134-1.513a5.188 5.188 0 0 0-2.992-1.442l.148 2.615.002.001zm10.876 5.97l-5.773 7.181a1.6 1.6 0 0 1-1.248.594l-9.261.003a1.6 1.6 0 0 1-1.247-.596l-5.776-7.18a1.583 1.583 0 0 1-.307-1.34L2.1 5.573c.108-.47.425-.864.863-1.073L11.305.513a1.606 1.606 0 0 1 1.385 0l8.345 3.985c.438.209.755.604.863 1.073l2.062 8.955c.108.47-.005.963-.308 1.34zm-3.289-2.057c-.042-.01-.103-.026-.145-.034-.174-.033-.315-.025-.479-.038-.35-.037-.638-.067-.895-.148-.105-.04-.18-.165-.216-.216l-.201-.059a6.45 6.45 0 0 0-.105-2.332 6.465 6.465 0 0 0-.936-2.163c.052-.047.15-.133.177-.159.008-.09.001-.183.094-.282.197-.185.444-.338.743-.522.142-.084.273-.137.415-.242.032-.024.076-.062.11-.089.24-.191.295-.52.123-.736-.172-.216-.506-.236-.745-.045-.034.027-.08.062-.111.088-.134.116-.217.23-.33.35-.246.25-.45.458-.673.609-.097.056-.239.037-.303.033l-.19.135a6.545 6.545 0 0 0-4.146-2.003l-.012-.223c-.065-.062-.143-.115-.163-.25-.022-.268.015-.557.057-.905.023-.163.061-.298.068-.475.001-.04-.001-.099-.001-.142 0-.306-.224-.555-.5-.555-.275 0-.499.249-.499.555l.001.014c0 .041-.002.092 0 .128.006.177.044.312.067.475.042.348.078.637.056.906a.545.545 0 0 1-.162.258l-.012.211a6.424 6.424 0 0 0-4.166 2.003 8.373 8.373 0 0 1-.18-.128c-.09.012-.18.04-.297-.029-.223-.15-.427-.358-.673-.608-.113-.12-.195-.234-.329-.349-.03-.026-.077-.062-.111-.088a.594.594 0 0 0-.348-.132.481.481 0 0 0-.398.176c-.172.216-.117.546.123.737l.007.005.104.083c.142.105.272.159.414.242.299.185.546.338.743.522.076.082.09.226.1.288l.16.143a6.462 6.462 0 0 0-1.02 4.506l-.208.06c-.055.072-.133.184-.215.217-.257.081-.546.11-.895.147-.164.014-.305.006-.48.039-.037.007-.09.02-.133.03l-.004.002-.007.002c-.295.071-.484.342-.423.608.061.267.349.429.645.365l.007-.001.01-.003.129-.029c.17-.046.294-.113.448-.172.33-.118.604-.217.87-.256.112-.009.23.069.288.101l.217-.037a6.5 6.5 0 0 0 2.88 3.596l-.09.218c.033.084.069.199.044.282-.097.252-.263.517-.452.813-.091.136-.185.242-.268.399-.02.037-.045.095-.064.134-.128.275-.034.591.213.71.248.12.556-.007.69-.282v-.002c.02-.039.046-.09.062-.127.07-.162.094-.301.144-.458.132-.332.205-.68.387-.897.05-.06.13-.082.215-.105l.113-.205a6.453 6.453 0 0 0 4.609.012l.106.192c.086.028.18.042.256.155.136.232.229.507.342.84.05.156.074.295.145.457.016.037.043.09.062.129.133.276.442.402.69.282.247-.118.341-.435.213-.71-.02-.039-.045-.096-.065-.134-.083-.156-.177-.261-.268-.398-.19-.296-.346-.541-.443-.793-.04-.13.007-.21.038-.294-.018-.022-.059-.144-.083-.202a6.499 6.499 0 0 0 2.88-3.622c.064.01.176.03.213.038.075-.05.144-.114.28-.104.266.039.54.138.87.256.154.06.277.128.448.173.036.01.088.019.13.028l.009.003.007.001c.297.064.584-.098.645-.365.06-.266-.128-.537-.423-.608zM16.4 9.701l-1.95 1.746v.005a.44.44 0 0 0 .173.757l.003.01 2.526.728a5.199 5.199 0 0 0-.108-1.674A5.208 5.208 0 0 0 16.4 9.7zm-4.013 5.325a.437.437 0 0 0-.404-.232.44.44 0 0 0-.372.233h-.002l-1.268 2.292a5.164 5.164 0 0 0 3.326.003l-1.27-2.296h-.01zm1.888-1.293a.44.44 0 0 0-.27.036.44.44 0 0 0-.214.572l-.003.004 1.01 2.438a5.15 5.15 0 0 0 2.081-2.615l-2.6-.44-.004.005z',
		helm: 'M12.337 0c-.475 0-.861 1.016-.861 2.269 0 .527.069 1.011.183 1.396a8.514 8.514 0 0 0-3.961 1.22 5.229 5.229 0 0 0-.595-1.093c-.606-.866-1.34-1.436-1.79-1.43a.381.381 0 0 0-.217.066c-.39.273-.123 1.326.596 2.353.267.381.559.705.84.948a8.683 8.683 0 0 0-1.528 1.716h1.734a7.179 7.179 0 0 1 5.381-2.421 7.18 7.18 0 0 1 5.382 2.42h1.733a8.687 8.687 0 0 0-1.32-1.53c.35-.249.735-.643 1.078-1.133.719-1.027.986-2.08.596-2.353a.382.382 0 0 0-.217-.065c-.45-.007-1.184.563-1.79 1.43a4.897 4.897 0 0 0-.676 1.325 8.52 8.52 0 0 0-3.899-1.42c.12-.39.193-.887.193-1.429 0-1.253-.386-2.269-.862-2.269zM1.624 9.443v5.162h1.358v-1.968h1.64v1.968h1.357V9.443H4.62v1.838H2.98V9.443zm5.912 0v5.162h3.21v-1.108H8.893v-.95h1.64v-1.142h-1.64v-.84h1.853V9.443zm4.698 0v5.162h3.218v-1.362h-1.86v-3.8zm4.706 0v5.162h1.364v-2.643l1.357 1.225 1.35-1.232v2.65h1.365V9.443h-.614l-2.1 1.914-2.109-1.914zm-11.82 7.28a8.688 8.688 0 0 0 1.412 1.548 5.206 5.206 0 0 0-.841.948c-.719 1.027-.985 2.08-.596 2.353.39.273 1.289-.338 2.007-1.364a5.23 5.23 0 0 0 .595-1.092 8.514 8.514 0 0 0 3.961 1.219 5.01 5.01 0 0 0-.183 1.396c0 1.253.386 2.269.861 2.269.476 0 .862-1.016.862-2.269 0-.542-.072-1.04-.193-1.43a8.52 8.52 0 0 0 3.9-1.42c.121.4.352.865.675 1.327.719 1.026 1.617 1.637 2.007 1.364.39-.273.123-1.326-.596-2.353-.343-.49-.727-.885-1.077-1.135a8.69 8.69 0 0 0 1.202-1.36h-1.771a7.174 7.174 0 0 1-5.227 2.252 7.174 7.174 0 0 1-5.226-2.252z',
		prometheus: 'M12 0C5.373 0 0 5.372 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.628-5.373-12-12-12zm0 22.46c-1.885 0-3.414-1.26-3.414-2.814h6.828c0 1.553-1.528 2.813-3.414 2.813zm5.64-3.745H6.36v-2.046h11.28v2.046zm-.04-3.098H6.391c-.037-.043-.075-.086-.111-.13-1.155-1.401-1.427-2.133-1.69-2.879-.005-.025 1.4.287 2.395.511 0 0 .513.119 1.262.255-.72-.843-1.147-1.915-1.147-3.01 0-2.406 1.845-4.508 1.18-6.207.648.053 1.34 1.367 1.387 3.422.689-.951.977-2.69.977-3.755 0-1.103.727-2.385 1.454-2.429-.648 1.069.168 1.984.894 4.256.272.854.237 2.29.447 3.201.07-1.892.395-4.652 1.595-5.605-.529 1.2.079 2.702.494 3.424.671 1.164 1.078 2.047 1.078 3.716a4.642 4.642 0 01-1.11 2.996c.792-.149 1.34-.283 1.34-.283l2.573-.502s-.374 1.538-1.81 3.019z',
		grafana: 'M23.02 10.59a8.578 8.578 0 0 0-.862-3.034 8.911 8.911 0 0 0-1.789-2.445c.337-1.342-.413-2.505-.413-2.505-1.292-.08-2.113.4-2.416.62-.052-.02-.102-.044-.154-.064-.22-.089-.446-.172-.677-.247-.231-.073-.47-.14-.711-.197a9.867 9.867 0 0 0-.875-.161C14.557.753 12.94 0 12.94 0c-1.804 1.145-2.147 2.744-2.147 2.744l-.018.093c-.098.029-.2.057-.298.088-.138.042-.275.094-.413.143-.138.055-.275.107-.41.166a8.869 8.869 0 0 0-1.557.87l-.063-.029c-2.497-.955-4.716.195-4.716.195-.203 2.658.996 4.33 1.235 4.636a11.608 11.608 0 0 0-.607 2.635C1.636 12.677.953 15.014.953 15.014c1.926 2.214 4.171 2.351 4.171 2.351.003-.002.006-.002.006-.005.285.509.615.994.986 1.446.156.19.32.371.488.548-.704 2.009.099 3.68.099 3.68 2.144.08 3.553-.937 3.849-1.173a9.784 9.784 0 0 0 3.164.501h.08l.055-.003.107-.002.103-.005.003.002c1.01 1.44 2.788 1.646 2.788 1.646 1.264-1.332 1.337-2.653 1.337-2.94v-.058c0-.02-.003-.039-.003-.06.265-.187.52-.387.758-.6a7.875 7.875 0 0 0 1.415-1.7c1.43.083 2.437-.885 2.437-.885-.236-1.49-1.085-2.216-1.264-2.354l-.018-.013-.016-.013a.217.217 0 0 1-.031-.02c.008-.092.016-.18.02-.27.011-.162.016-.323.016-.48v-.253l-.005-.098-.008-.135a1.891 1.891 0 0 0-.01-.13c-.003-.042-.008-.083-.013-.125l-.016-.124-.018-.122a6.215 6.215 0 0 0-2.032-3.73 6.015 6.015 0 0 0-3.222-1.46 6.292 6.292 0 0 0-.85-.048l-.107.002h-.063l-.044.003-.104.008a4.777 4.777 0 0 0-3.335 1.695c-.332.4-.592.84-.768 1.297a4.594 4.594 0 0 0-.312 1.817l.003.091c.005.055.007.11.013.164a3.615 3.615 0 0 0 .698 1.82 3.53 3.53 0 0 0 1.827 1.282c.33.098.66.14.971.137.039 0 .078 0 .114-.002l.063-.003c.02 0 .041-.003.062-.003.034-.002.065-.007.099-.01.007 0 .018-.003.028-.003l.031-.005.06-.008a1.18 1.18 0 0 0 .112-.02c.036-.008.072-.013.109-.024a2.634 2.634 0 0 0 .914-.415c.028-.02.056-.041.085-.065a.248.248 0 0 0 .039-.35.244.244 0 0 0-.309-.06l-.078.042c-.09.044-.184.083-.283.116a2.476 2.476 0 0 1-.475.096c-.028.003-.054.006-.083.006l-.083.002c-.026 0-.054 0-.08-.002l-.102-.006h-.012l-.024.006c-.016-.003-.031-.003-.044-.006-.031-.002-.06-.007-.091-.01a2.59 2.59 0 0 1-.724-.213 2.557 2.557 0 0 1-.667-.438 2.52 2.52 0 0 1-.805-1.475 2.306 2.306 0 0 1-.029-.444l.006-.122v-.023l.002-.031c.003-.021.003-.04.005-.06a3.163 3.163 0 0 1 1.352-2.29 3.12 3.12 0 0 1 .937-.43 2.946 2.946 0 0 1 .776-.101h.06l.07.002.045.003h.026l.07.005a4.041 4.041 0 0 1 1.635.49 3.94 3.94 0 0 1 1.602 1.662 3.77 3.77 0 0 1 .397 1.414l.005.076.003.075c.002.026.002.05.002.075 0 .024.003.052 0 .07v.065l-.002.073-.008.174a6.195 6.195 0 0 1-.08.639 5.1 5.1 0 0 1-.267.927 5.31 5.31 0 0 1-.624 1.13 5.052 5.052 0 0 1-3.237 2.014 4.82 4.82 0 0 1-.649.066l-.039.003h-.287a6.607 6.607 0 0 1-1.716-.265 6.776 6.776 0 0 1-3.4-2.274 6.75 6.75 0 0 1-.746-1.15 6.616 6.616 0 0 1-.714-2.596l-.005-.083-.002-.02v-.056l-.003-.073v-.096l-.003-.104v-.07l.003-.163c.008-.22.026-.45.054-.678a8.707 8.707 0 0 1 .28-1.355c.128-.444.286-.872.473-1.277a7.04 7.04 0 0 1 1.456-2.1 5.925 5.925 0 0 1 .953-.763c.169-.111.343-.213.524-.306.089-.05.182-.091.273-.135.047-.02.093-.042.138-.062a7.177 7.177 0 0 1 .714-.267l.145-.045c.049-.015.098-.026.148-.041.098-.029.197-.052.296-.076.049-.013.1-.02.15-.033l.15-.032.151-.028.076-.013.075-.01.153-.024c.057-.01.114-.013.171-.023l.169-.021c.036-.003.073-.008.106-.01l.073-.008.036-.003.042-.002c.057-.003.114-.008.171-.01l.086-.006h.023l.037-.003.145-.007a7.999 7.999 0 0 1 1.708.125 7.917 7.917 0 0 1 2.048.68 8.253 8.253 0 0 1 1.672 1.09l.09.077.089.078c.06.052.114.107.171.159.057.052.112.106.166.16.052.055.107.107.159.164a8.671 8.671 0 0 1 1.41 1.978c.012.026.028.052.04.078l.04.078.075.156c.023.051.05.1.07.153l.065.15a8.848 8.848 0 0 1 .45 1.34.19.19 0 0 0 .201.142.186.186 0 0 0 .172-.184c.01-.246.002-.532-.024-.856z',
		proxmox: 'M4.928 1.825c-1.09.553-1.09.64-.07 1.78 5.655 6.295 7.004 7.782 7.107 7.782.139.017 7.971-8.542 8.058-8.801.034-.07-.208-.312-.519-.536-.415-.312-.864-.433-1.712-.467-1.59-.104-2.144.242-4.115 2.455-.899 1.003-1.66 1.833-1.66 1.833-.017 0-.76-.813-1.642-1.798S8.473 2.1 8.127 1.91c-.796-.45-2.421-.484-3.2-.086zM1.297 4.367C.45 4.695 0 5.007 0 5.248c0 .121 1.331 1.678 2.94 3.459 1.625 1.78 2.939 3.268 2.939 3.302 0 .035-1.331 1.522-2.94 3.303C1.314 17.11.017 18.683.035 18.822c.086.467 1.504 1.055 2.541 1.055 1.678-.018 2.058-.312 5.603-4.202 1.78-1.954 3.233-3.614 3.233-3.666 0-.069-1.435-1.694-3.199-3.63-2.3-2.508-3.423-3.632-3.96-3.874-.812-.398-2.126-.467-2.956-.138zm18.467.12c-.502.26-1.764 1.505-3.943 3.891-1.763 1.937-3.199 3.562-3.199 3.631 0 .07 1.453 1.712 3.234 3.666 3.544 3.89 3.925 4.184 5.602 4.202 1.038 0 2.455-.588 2.542-1.055.017-.156-1.28-1.712-2.905-3.493-1.608-1.78-2.94-3.285-2.94-3.32 0-.034 1.332-1.539 2.94-3.32C22.72 6.91 24.017 5.352 24 5.214c-.087-.45-1.366-.968-2.473-1.038-.795-.034-1.21.035-1.763.312zM7.954 16.973c-2.144 2.369-3.908 4.374-3.943 4.46-.034.07.208.312.52.537.414.311.864.432 1.711.467 1.574.103 2.161-.26 4.15-2.508.864-.968 1.608-1.78 1.625-1.78s.761.812 1.643 1.798c2.023 2.248 2.559 2.576 4.132 2.49.848-.035 1.297-.156 1.712-.467.311-.225.553-.467.519-.536-.087-.26-7.92-8.819-8.058-8.801-.069 0-1.867 1.954-4.011 4.34z',
		debian: 'M13.88 12.685c-.4 0 .08.2.601.28.14-.1.27-.22.39-.33a3.001 3.001 0 01-.99.05m2.14-.53c.23-.33.4-.69.47-1.06-.06.27-.2.5-.33.73-.75.47-.07-.27 0-.56-.8 1.01-.11.6-.14.89m.781-2.05c.05-.721-.14-.501-.2-.221.07.04.13.5.2.22M12.38.31c.2.04.45.07.42.12.23-.05.28-.1-.43-.12m.43.12l-.15.03.14-.01V.43m6.633 9.944c.02.64-.2.95-.38 1.5l-.35.181c-.28.54.03.35-.17.78-.44.39-1.34 1.22-1.62 1.301-.201 0 .14-.25.19-.34-.591.4-.481.6-1.371.85l-.03-.06c-2.221 1.04-5.303-1.02-5.253-3.842-.03.17-.07.13-.12.2a3.551 3.552 0 012.001-3.501 3.361 3.362 0 013.732.48 3.341 3.342 0 00-2.721-1.3c-1.18.01-2.281.76-2.651 1.57-.6.38-.67 1.47-.93 1.661-.361 2.601.66 3.722 2.38 5.042.27.19.08.21.12.35a4.702 4.702 0 01-1.53-1.16c.23.33.47.66.8.91-.55-.18-1.27-1.3-1.48-1.35.93 1.66 3.78 2.921 5.261 2.3a6.203 6.203 0 01-2.33-.28c-.33-.16-.77-.51-.7-.57a5.802 5.803 0 005.902-.84c.44-.35.93-.94 1.07-.95-.2.32.04.16-.12.44.44-.72-.2-.3.46-1.24l.24.33c-.09-.6.74-1.321.66-2.262.19-.3.2.3 0 .97.29-.74.08-.85.15-1.46.08.2.18.42.23.63-.18-.7.2-1.2.28-1.6-.09-.05-.28.3-.32-.53 0-.37.1-.2.14-.28-.08-.05-.26-.32-.38-.861.08-.13.22.33.34.34-.08-.42-.2-.75-.2-1.08-.34-.68-.12.1-.4-.3-.34-1.091.3-.25.34-.74.54.77.84 1.96.981 2.46-.1-.6-.28-1.2-.49-1.76.16.07-.26-1.241.21-.37A7.823 7.824 0 0017.702 1.6c.18.17.42.39.33.42-.75-.45-.62-.48-.73-.67-.61-.25-.65.02-1.06 0C15.082.73 14.862.8 13.8.4l.05.23c-.77-.25-.9.1-1.73 0-.05-.04.27-.14.53-.18-.741.1-.701-.14-1.431.03.17-.13.36-.21.55-.32-.6.04-1.44.35-1.18.07C9.6.68 7.847 1.3 6.867 2.22L6.838 2c-.45.54-1.96 1.611-2.08 2.311l-.131.03c-.23.4-.38.85-.57 1.261-.3.52-.45.2-.4.28-.6 1.22-.9 2.251-1.16 3.102.18.27 0 1.65.07 2.76-.3 5.463 3.84 10.776 8.363 12.006.67.23 1.65.23 2.49.25-.99-.28-1.12-.15-2.08-.49-.7-.32-.85-.7-1.34-1.13l.2.35c-.971-.34-.57-.42-1.361-.67l.21-.27c-.31-.03-.83-.53-.97-.81l-.34.01c-.41-.501-.63-.871-.61-1.161l-.111.2c-.13-.21-1.52-1.901-.8-1.511-.13-.12-.31-.2-.5-.55l.14-.17c-.35-.44-.64-1.02-.62-1.2.2.24.32.3.45.33-.88-2.172-.93-.12-1.601-2.202l.15-.02c-.1-.16-.18-.34-.26-.51l.06-.6c-.63-.74-.18-3.102-.09-4.402.07-.54.53-1.1.88-1.981l-.21-.04c.4-.71 2.341-2.872 3.241-2.761.43-.55-.09 0-.18-.14.96-.991 1.26-.7 1.901-.88.7-.401-.6.16-.27-.151 1.2-.3.85-.7 2.421-.85.16.1-.39.14-.52.26 1-.49 3.151-.37 4.562.27 1.63.77 3.461 3.011 3.531 5.132l.08.02c-.04.85.13 1.821-.17 2.711l.2-.42M9.54 13.236l-.05.28c.26.35.47.73.8 1.01-.24-.47-.42-.66-.75-1.3m.62-.02c-.14-.15-.22-.34-.31-.52.08.32.26.6.43.88l-.12-.36m10.945-2.382l-.07.15c-.1.76-.34 1.511-.69 2.212.4-.73.65-1.541.75-2.362M12.45.12c.27-.1.66-.05.95-.12-.37.03-.74.05-1.1.1l.15.02M3.006 5.142c.07.57-.43.8.11.42.3-.66-.11-.18-.1-.42m-.64 2.661c.12-.39.15-.62.2-.84-.35.44-.17.53-.2.83'
	};
	var LOGOS = [
		{ key: 'kubernetes', name: 'Kubernetes', color: '#4f86ff' },
		{ key: 'helm', name: 'Helm', color: '#7f8cff' },
		{ key: 'prometheus', name: 'Prometheus', color: '#ff6a3d' },
		{ key: 'grafana', name: 'Grafana', color: '#ff8a1f' },
		{ key: 'proxmox', name: 'Proxmox', color: '#ff8a26' },
		{ key: 'debian', name: 'Debian', color: '#ff4f7b' }
	];

	var N_STARS = 140;
	var LOGO_POINTS = 104;
	var MORPH = 2.4;   // s que tarda en recolocarse
	var HOLD = 4.6;    // s que se mantiene cada figura
	var SPIN = 0.018;  // rad/s de giro del cielo
	var SWIRL = 1.1;   // rad extra de remolino durante la transición

	// Muestrea puntos a lo largo del contorno de un logo
	function sampleLogo(d, n) {
		var ns = 'http://www.w3.org/2000/svg';
		var svg = document.createElementNS(ns, 'svg');
		svg.setAttribute('width', '0');
		svg.setAttribute('height', '0');
		svg.style.position = 'absolute';
		var path = document.createElementNS(ns, 'path');
		path.setAttribute('d', d);
		svg.appendChild(path);
		document.body.appendChild(svg);
		var len = path.getTotalLength();
		var step = len / n;
		var pts = [], edges = [];
		for (var i = 0; i < n; i++) {
			var p = path.getPointAtLength(i * step);
			pts.push([p.x / 24, p.y / 24]);
			if (i > 0) {
				var q = pts[i - 1];
				// Une puntos consecutivos salvo cuando hay un salto entre subtrazados
				if (Math.hypot(p.x / 24 - q[0], p.y / 24 - q[1]) < (step / 24) * 1.6) edges.push([i - 1, i]);
			}
		}
		document.body.removeChild(svg);
		return { pts: pts, edges: edges };
	}

	// Secuencia: constelación, logo, constelación, logo...
	var shapes = [];
	var logoShapes = LOGOS.map(function (l) {
		var s = sampleLogo(LOGO_PATHS[l.key], LOGO_POINTS);
		return { kind: 'logo', es: l.name, en: l.name, color: l.color, pts: s.pts, edges: s.edges, mag: null, scale: 0.78 };
	});
	var longest = Math.max(CONSTELLATIONS.length, logoShapes.length);
	for (var i = 0; i < longest; i++) {
		if (CONSTELLATIONS[i]) shapes.push(Object.assign({ kind: 'const', color: null }, CONSTELLATIONS[i]));
		if (logoShapes[i]) shapes.push(logoShapes[i]);
	}

	// Estrellas: posición en coordenadas del cielo (unidad = tamaño de la figura, centro = 0)
	function rand(a, b) { return a + Math.random() * (b - a); }
	// Radio (en unidades del cielo) que cubre todo el lienzo aunque gire
	var skyRadius = 1.3;
	function randomSkyPoint() {
		var r = skyRadius * Math.sqrt(Math.random()), t = Math.random() * Math.PI * 2;
		return [r * Math.cos(t), r * Math.sin(t)];
	}
	var stars = [];
	for (var s = 0; s < N_STARS; s++) {
		var p0 = randomSkyPoint();
		stars.push({ x: p0[0], y: p0[1], fx: p0[0], fy: p0[1], tx: p0[0], ty: p0[1],
			size: rand(.5, 1.2), fsize: 0, tsize: rand(.5, 1.2), lit: 0, flit: 0, tlit: 0,
			tw: rand(0, Math.PI * 2), tws: rand(.8, 2.2) });
	}

	var W = 0, H = 0, DPR = 1, S = 1, CX = 0, CY = 0, mobile = false, fixed = false;

	// Centro del planeta en images/space-bg.jpg (335 × 597), en fracción de la imagen,
	// y su radio en fracción del ancho
	var PLANET = [0.757, 0.524], PLANET_R = 0.1, BG_W = 335, BG_H = 597, BG_BLEED = 24;
	// Dónde cae en pantalla: el fondo (body::before) es fijo, sobresale 24px por cada
	// lado y usa background-size: cover centrado
	function planeta(w, h) {
		var bw = w + BG_BLEED * 2, bh = h + BG_BLEED * 2;
		var k = Math.max(bw / BG_W, bh / BG_H);
		var iw = BG_W * k, ih = BG_H * k;
		return [-BG_BLEED + (bw - iw) / 2 + PLANET[0] * iw, -BG_BLEED + (bh - ih) / 2 + PLANET[1] * ih, PLANET_R * iw];
	}
	function resize() {
		var r = canvas.getBoundingClientRect();
		DPR = Math.min(window.devicePixelRatio || 1, 2);
		W = r.width; H = r.height;
		canvas.width = Math.round(W * DPR);
		canvas.height = Math.round(H * DPR);
		var a = anchor && anchor.offsetParent ? anchor.getBoundingClientRect() : null;
		mobile = !a || a.width < 40;
		// En escritorio el lienzo es fijo (fondo de toda la página): la figura se queda
		// donde está la columna derecha de la portada sin scroll
		fixed = getComputedStyle(canvas).position === 'fixed';
		if (mobile) {
			// En móvil las figuras quedan de fondo, detrás del texto
			S = Math.min(W * 0.92, H * 0.6);
			CX = W * 0.5;
			CY = H * 0.42;
		} else {
			// En escritorio se forman en la columna derecha, junto al texto
			S = Math.min(a.width, a.height) * 0.86;
			CX = a.left - r.left + a.width / 2;
			CY = a.top - r.top + a.height * 0.46;
			if (fixed) {
				// Fondo fijo: la figura se centra en el planeta de la imagen de fondo y
				// mide lo mismo que su diámetro, así mantiene la proporción con él
				var pl = planeta(W, H);
				CX = pl[0];
				CY = pl[1];
				S = pl[2] * 2;
			}
		}
		skyRadius = Math.hypot(Math.max(CX, W - CX), Math.max(CY, H - CY)) / S + 0.1;
	}

	// Sprites de brillo precalculados por color
	var sprites = {};
	function sprite(color) {
		var key = color + (lightMq.matches ? 'L' : 'D');
		if (sprites[key]) return sprites[key];
		var c = document.createElement('canvas');
		c.width = c.height = 64;
		var g = c.getContext('2d');
		var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
		grad.addColorStop(0, lightMq.matches ? color : '#ffffff');
		grad.addColorStop(0.18, color);
		grad.addColorStop(0.45, hexA(color, 0.25));
		grad.addColorStop(1, hexA(color, 0));
		g.fillStyle = grad;
		g.fillRect(0, 0, 64, 64);
		return (sprites[key] = c);
	}
	function hexA(hex, a) {
		var n = parseInt(hex.slice(1), 16);
		return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
	}

	var current = -1, phaseStart = 0, angle = 0, lastT = 0;

	// Asigna los puntos de la nueva figura (girados para que se vean derechos a mitad de exposición)
	function goTo(index, now) {
		current = index;
		phaseStart = now;
		var shape = shapes[index];
		var aMid = angle + SPIN * (MORPH + HOLD / 2);
		var ca = Math.cos(-aMid), sa = Math.sin(-aMid);
		var k = shape.pts.length;
		for (var i = 0; i < stars.length; i++) {
			var st = stars[i];
			st.fx = st.x; st.fy = st.y; st.fsize = st.size; st.flit = st.lit;
			if (i < k) {
				var sc = shape.scale || 1;
				var px = (shape.pts[i][0] - 0.5) * sc, py = (shape.pts[i][1] - 0.5) * sc;
				st.tx = px * ca - py * sa;
				st.ty = px * sa + py * ca;
				st.tsize = shape.mag ? shape.mag[i] * 0.85 : 1.35;
				st.tlit = 1;
			} else {
				var q = randomSkyPoint();
				st.tx = q[0]; st.ty = q[1];
				st.tsize = rand(.45, 1.1);
				st.tlit = 0;
			}
		}
	}

	function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

	function update(now) {
		var dt = lastT ? Math.min((now - lastT) / 1000, 0.05) : 0;
		lastT = now;
		angle += SPIN * dt;
		var elapsed = (now - phaseStart) / 1000;
		if (current < 0 || elapsed > MORPH + HOLD) {
			goTo((current + 1) % shapes.length, now);
			elapsed = 0;
		}
		var m = ease(Math.min(elapsed / MORPH, 1));
		var swirl = SWIRL * Math.sin(Math.PI * m);
		for (var i = 0; i < stars.length; i++) {
			var st = stars[i];
			// Interpolación en polares con un remolino que se suma y se deshace
			var r0 = Math.hypot(st.fx, st.fy), r1 = Math.hypot(st.tx, st.ty);
			var a0 = Math.atan2(st.fy, st.fx), a1 = Math.atan2(st.ty, st.tx);
			var da = a1 - a0;
			if (da > Math.PI) da -= Math.PI * 2;
			if (da < -Math.PI) da += Math.PI * 2;
			var r = r0 + (r1 - r0) * m;
			var a = a0 + da * m + swirl;
			st.x = r * Math.cos(a);
			st.y = r * Math.sin(a);
			st.size = st.fsize + (st.tsize - st.fsize) * m;
			st.lit = st.flit + (st.tlit - st.flit) * m;
		}
		return elapsed;
	}

	function draw(now, elapsed) {
		ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
		ctx.clearRect(0, 0, W, H);
		var shape = shapes[current];
		var ca = Math.cos(angle), sa = Math.sin(angle);
		function toScreen(st) {
			return [CX + (st.x * ca - st.y * sa) * S, CY + (st.x * sa + st.y * ca) * S];
		}

		// Líneas de la figura: aparecen tras la transición y se apagan antes de la siguiente
		var lineA = 0;
		if (elapsed > MORPH) {
			var h = elapsed - MORPH;
			lineA = Math.min(h / 0.7, 1, (HOLD - h) / 0.6);
		}
		if (lineA > 0 && shape) {
			ctx.lineWidth = shape.kind === 'logo' ? 1.1 : 1;
			ctx.strokeStyle = hexA(shape.color || starColor(), (shape.kind === 'logo' ? 0.55 : 0.45) * lineA * (mobile ? 0.7 : 1));
			ctx.beginPath();
			for (var e = 0; e < shape.edges.length; e++) {
				var p = toScreen(stars[shape.edges[e][0]]), q = toScreen(stars[shape.edges[e][1]]);
				ctx.moveTo(p[0], p[1]);
				ctx.lineTo(q[0], q[1]);
			}
			ctx.stroke();
		}

		// Estrellas
		var t = now / 1000;
		var base = sprite(starColor());
		var tint = shape && shape.color ? sprite(shape.color) : base;
		var dim = mobile ? 0.75 : 1;
		for (var i = 0; i < stars.length; i++) {
			var st = stars[i];
			var pos = toScreen(st);
			if (pos[0] < -10 || pos[0] > W + 10 || pos[1] < -10 || pos[1] > H + 10) continue;
			var twinkle = 0.7 + 0.3 * Math.sin(t * st.tws + st.tw);
			var alpha = (0.35 + 0.65 * st.lit * dim) * twinkle;
			var size = st.size * (2.6 + 2.4 * st.lit);
			ctx.globalAlpha = alpha;
			ctx.drawImage(st.lit > 0.5 ? tint : base, pos[0] - size, pos[1] - size, size * 2, size * 2);
		}
		ctx.globalAlpha = 1;
	}

	var running = false, visible = true, raf = 0;
	function frame(now) {
		if (!running) return;
		var elapsed = update(now);
		draw(now, elapsed);
		raf = requestAnimationFrame(frame);
	}
	function start() {
		if (running || !visible) return;
		running = true;
		lastT = 0;
		raf = requestAnimationFrame(frame);
	}
	function stop() {
		running = false;
		cancelAnimationFrame(raf);
	}

	resize();
	window.addEventListener('resize', function () {
		resize();
		var wr = wrap.getBoundingClientRect();
		visible = fixed || (wr.bottom > 0 && wr.top < window.innerHeight);
		visible ? start() : stop();
		if (!running) { var e = update(performance.now()); draw(performance.now(), e); }
	});

	if ('IntersectionObserver' in window) {
		new IntersectionObserver(function (entries) {
			// Si es el fondo fijo, se ve siempre aunque la portada salga de pantalla
			visible = fixed || entries[0].isIntersecting;
			visible ? start() : stop();
		}).observe(wrap);
	}
	document.addEventListener('visibilitychange', function () {
		document.hidden ? stop() : start();
	});
	start();
})();
