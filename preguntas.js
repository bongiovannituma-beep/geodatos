// Preguntas de Geoplay. Cada una se verifica con scripts/verificar-preguntas.mjs contra Wikipedia.
// P = punto en el mapa (lat/lon + escala en km). R = región (provincia o país) que hay que tocar.
// wiki = artículo del lugar (para chequear coordenadas). fuente/clave = artículo y palabra que respalda el dato curioso.
(function () {
  const L = [];
  const P = (sec, tema, q, r, lat, lon, esc, dato, wiki, clave, fuente) =>
    L.push({ sec, tema, tipo: 'punto', q, r, lat, lon, esc, dato, wiki, clave, fuente: fuente || wiki });
  const R = (sec, tema, tipo, q, zona, dato, wiki, clave, fuente) =>
    L.push({ sec, tema, tipo, q, r: zona, zona, esc: sec === 'ar' ? 250 : 1200, dato, wiki, clave, fuente: fuente || wiki });

  // ---------- ARGENTINA ----------
  const H = 'Lugares históricos', C = 'Ciudades', N = 'Naturaleza', F = 'Fútbol y deportes', T = 'Tradiciones y comidas';
  P('ar', H, '¿Dónde se declaró la Independencia en 1816?', 'San Miguel de Tucumán', -26.8309, -65.2038, 200, 'El 9 de julio de 1816 se declaró la Independencia en esta casa de Tucumán.', 'Casa Histórica de la Independencia', '1816');
  P('ar', H, '¿Dónde estaba el Cabildo desde donde se gestó la Revolución de Mayo de 1810?', 'Buenos Aires', -34.6086, -58.3727, 100, 'El Cabildo está frente a la Plaza de Mayo, en pleno centro porteño.', 'Cabildo de Buenos Aires', '1810');
  P('ar', H, '¿Dónde están las pinturas de manos de hace miles de años, en la Cueva de las Manos?', 'Cueva de las Manos, Santa Cruz', -47.1533, -70.6597, 250, 'Son manos pintadas con la mano apoyada en la pared, de hace más de 9.000 años.', 'Cueva de las Manos', 'manos');
  P('ar', H, '¿Dónde está el Monumento Nacional a la Bandera, creada por Belgrano?', 'Rosario', -32.9473, -60.6306, 100, 'Belgrano creó la bandera en Rosario, a orillas del Paraná.', 'Monumento Nacional a la Bandera', 'Belgrano');
  P('ar', H, '¿Dónde están las ruinas jesuíticas de San Ignacio Miní?', 'San Ignacio, Misiones', -27.2536, -55.5331, 150, 'Fue una misión de jesuitas y guaraníes, hoy Patrimonio de la Humanidad.', 'San Ignacio Miní', 'jesuit');
  P('ar', H, '¿Dónde desembarcaron en 1865 los colonos galeses que fundaron la Patagonia galesa?', 'Puerto Madryn', -42.7692, -65.0385, 200, 'Llegaron en el velero Mimosa y se instalaron en el valle del Chubut.', 'Puerto Madryn', 'gale');
  P('ar', H, '¿Dónde nació el General José de San Martín?', 'Yapeyú, Corrientes', -29.4667, -56.8167, 150, 'San Martín nació en Yapeyú, un pueblo sobre el río Uruguay.', 'Yapeyú', 'San Martín');
  P('ar', H, 'Las islas Malvinas son argentinas. ¿Dónde están?', 'Islas Malvinas', -51.75, -59.2, 300, 'Están en el Atlántico Sur, a unos 450 km de la costa patagónica.', 'Islas Malvinas', 'Malvinas');

  P('ar', C, '¿Dónde queda San Carlos de Bariloche, famosa por el chocolate y la nieve?', 'Bariloche', -41.1335, -71.3103, 150, 'Está a orillas del lago Nahuel Huapi, en plena cordillera.', 'San Carlos de Bariloche', 'chocolate');
  P('ar', C, '¿Dónde queda Ushuaia, la ciudad más austral del mundo?', 'Ushuaia', -54.8019, -68.303, 150, 'Es la capital de Tierra del Fuego, la más austral del mundo.', 'Ushuaia', 'austral');
  P('ar', C, '¿Dónde queda Mar del Plata, el gran balneario de la costa atlántica?', 'Mar del Plata', -38.0055, -57.5426, 150, 'Cada verano recibe millones de turistas.', 'Mar del Plata', 'turíst');
  P('ar', C, '¿Dónde queda la ciudad de Salta, conocida como «Salta la Linda»?', 'Salta', -24.7821, -65.4232, 150, 'Está en el Valle de Lerma, rodeada de cerros.', 'Ciudad de Salta', 'Linda');
  P('ar', C, '¿Dónde queda la ciudad de Mendoza, capital del vino?', 'Mendoza', -32.8908, -68.8272, 150, 'Está al pie de la cordillera, rodeada de viñedos.', 'Ciudad de Mendoza', 'vino');
  P('ar', C, '¿Dónde queda la ciudad de Córdoba, con la universidad más antigua del país?', 'Córdoba', -31.4201, -64.1888, 150, 'Su universidad es de 1613, una de las más antiguas de América.', 'Córdoba (Argentina)', '1613', 'Universidad Nacional de Córdoba');
  P('ar', C, '¿Dónde queda Resistencia, la «ciudad de las esculturas»?', 'Resistencia, Chaco', -27.4606, -58.9839, 150, 'Tiene cientos de esculturas en las calles y plazas.', 'Resistencia (Argentina)', 'escultura');
  P('ar', C, '¿Dónde queda Puerto Iguazú, donde se juntan Argentina, Brasil y Paraguay?', 'Puerto Iguazú, Misiones', -25.5991, -54.5736, 150, 'Ahí se encuentran los ríos Iguazú y Paraná, y los tres países.', 'Puerto Iguazú', 'Paraguay');

  R('ar', N, 'provincia', '¿En qué provincia está el glaciar Perito Moreno?', 'Santa Cruz', 'Es un glaciar que avanza y suelta enormes bloques de hielo al lago Argentino.', 'Glaciar Perito Moreno', 'Argentino');
  R('ar', N, 'provincia', '¿En qué provincia están las Cataratas del Iguazú?', 'Misiones', 'Tienen unos 275 saltos de agua.', 'Cataratas del Iguazú', '275');
  R('ar', N, 'provincia', '¿En qué provincia está el Aconcagua, el cerro más alto de América?', 'Mendoza', 'Mide casi 7.000 metros.', 'Cerro Aconcagua', 'América');
  R('ar', N, 'provincia', '¿En qué provincia está el Valle de la Luna (Ischigualasto), donde se hallaron dinosaurios muy antiguos?', 'San Juan', 'Allí aparecieron algunos de los dinosaurios más antiguos del mundo.', 'Parque provincial Ischigualasto', 'dinosaur');
  R('ar', N, 'provincia', '¿En qué provincia está Península Valdés, donde llegan las ballenas francas?', 'Chubut', 'Cada año llegan ballenas a reproducirse.', 'Península Valdés', 'ballena');
  R('ar', N, 'provincia', '¿En qué provincia están los Esteros del Iberá, un enorme humedal?', 'Corrientes', 'Es uno de los humedales más grandes de Sudamérica.', 'Esteros del Iberá', 'humedal');
  R('ar', N, 'provincia', '¿En qué provincia está el Parque Nacional Talampaya, de cañones rojos?', 'La Rioja', 'Sus paredes rojas son gigantescas y cambian de color con el sol.', 'Parque nacional Talampaya', 'Rioja');
  R('ar', N, 'provincia', '¿En qué provincia está el Cerro de los Siete Colores, en Purmamarca?', 'Jujuy', 'Sus capas de roca muestran siete tonos distintos.', 'Purmamarca', 'colores');

  P('ar', F, '¿Dónde está La Bombonera, la cancha de Boca Juniors?', 'La Boca, Buenos Aires', -34.6356, -58.3647, 60, 'Su forma de caja de bombones le dio el apodo.', 'Estadio Alberto J. Armando', 'Boca');
  P('ar', F, '¿Dónde se jugó la final del Mundial 1978 que ganó Argentina?', 'Estadio Monumental, Buenos Aires', -34.5453, -58.4498, 60, 'Argentina le ganó 3 a 1 a Países Bajos en la final.', 'Estadio Monumental Antonio Vespucio Liberti', '1978');
  P('ar', F, '¿Dónde está el estadio Mario Alberto Kempes, sede del Mundial 1978?', 'Córdoba', -31.3667, -64.2493, 100, 'Lleva el nombre del goleador de aquel Mundial.', 'Estadio Mario Alberto Kempes', 'Kempes');
  P('ar', F, '¿En qué ciudad nació Lionel Messi?', 'Rosario', -32.9442, -60.6505, 80, 'Messi nació en Rosario el 24 de junio de 1987.', 'Rosario (Argentina)', 'Rosario', 'Lionel Messi');
  P('ar', F, '¿Dónde está el estadio de Independiente, el «Rey de Copas»?', 'Avellaneda', -34.6704, -58.3703, 60, 'Ganó siete Copas Libertadores, más que ningún otro club.', 'Estadio Libertadores de América', 'Libertadores');
  P('ar', F, '¿Dónde está el «Estadio Único», sede de partidos de la Copa América?', 'La Plata', -34.9139, -57.9922, 100, 'Es uno de los estadios más modernos del país.', 'Estadio Ciudad de La Plata', 'Único');
  P('ar', F, '¿En qué ciudad del Gran Buenos Aires nació Diego Maradona?', 'Lanús', -34.7, -58.39, 60, 'Maradona nació en Lanús y creció en Villa Fiorito.', 'Lanús', 'Lanús', 'Diego Maradona');
  P('ar', F, '¿En qué ciudad costera está el estadio José María Minella, sede del Mundial 1978?', 'Mar del Plata', -38.0166, -57.5896, 100, 'Mar del Plata fue una de las sedes de aquel Mundial.', 'Estadio José María Minella', '1978');

  R('ar', T, 'provincia', '¿En qué provincia se produce la mayor parte del vino Malbec argentino?', 'Mendoza', 'Mendoza concentra la mayoría de los viñedos del país.', 'Ciudad de Mendoza', 'vino', 'Malbec');
  R('ar', T, 'provincia', '¿En qué provincia está Apóstoles, la Capital Nacional de la Yerba Mate?', 'Misiones', 'Misiones y Corrientes son las únicas provincias que producen yerba.', 'Apóstoles', 'yerba');
  R('ar', T, 'provincia', '¿De qué provincia es el chamamé, ritmo litoraleño que baila todo el Litoral?', 'Corrientes', 'Es Patrimonio Cultural Inmaterial de la Humanidad.', 'Ciudad de Corrientes', 'chamamé', 'Chamamé');
  P('ar', T, '¿Dónde se hace el Festival Nacional de Folklore, en enero?', 'Cosquín, Córdoba', -31.2453, -64.466, 80, 'Es uno de los festivales de folklore más famosos del país.', 'Cosquín', 'folklore');
  P('ar', T, '¿Dónde está Gualeguaychú, famosa por su carnaval?', 'Gualeguaychú, Entre Ríos', -33.0092, -58.5172, 80, 'Su carnaval es famoso en todo el país.', 'Gualeguaychú', 'carnaval');
  P('ar', T, '¿Dónde está Famaillá, sede de la Fiesta Nacional de la Empanada?', 'Famaillá, Tucumán', -27.0561, -65.4, 80, 'Tucumán es famosa por sus empanadas.', 'Famaillá', 'empanada');
  P('ar', T, '¿Dónde está San Antonio de Areco, cuna de la tradición gaucha?', 'San Antonio de Areco', -34.25, -59.4667, 80, 'Cada noviembre celebra el Día de la Tradición.', 'San Antonio de Areco', 'tradici');
  P('ar', T, '¿Dónde está Cafayate, famosa por su vino torrontés?', 'Cafayate, Salta', -26.0733, -65.9761, 100, 'Sus viñedos están entre los más altos del mundo.', 'Cafayate', 'torrontés');

  // ---------- MUNDO ----------
  const MH = 'Lugares históricos', MC = 'Capitales', MS = 'Ciencia y naturaleza', MF = 'Fútbol y deportes';
  R('mu', MH, 'pais', '¿En qué país está Machu Picchu, la ciudad de los incas?', 'Perú', 'Fue construida en lo alto de los Andes en el siglo XV.', 'Machu Picchu', 'inca');
  R('mu', MH, 'pais', '¿En qué país está el Taj Mahal?', 'India', 'Es un mausoleo de mármol blanco construido por amor.', 'Taj Mahal', 'Agra');
  R('mu', MH, 'pais', '¿En qué país está Petra, la ciudad tallada en la roca?', 'Jordania', 'La construyeron los nabateos.', 'Petra (Jordania)', 'nabate');
  R('mu', MH, 'pais', '¿En qué país está el templo de Angkor Wat?', 'Camboya', 'Es el monumento religioso más grande del mundo.', 'Angkor Wat', 'Camboya');
  R('mu', MH, 'pais', '¿En qué país está Chichén Itzá, la gran ciudad maya?', 'México', 'Su pirámide, El Castillo, se llama también templo de Kukulcán.', 'Chichén Itzá', 'maya');
  R('mu', MH, 'pais', '¿En qué país están las pirámides de Guiza?', 'Egipto', 'La más grande es la de Keops.', 'Necrópolis de Guiza', 'Keops');
  R('mu', MH, 'pais', '¿En qué país está la Acrópolis, con el Partenón?', 'Grecia', 'El Partenón está dedicado a la diosa Atenea.', 'Acrópolis de Atenas', 'Partenón');
  P('mu', MH, '¿Dónde está Stonehenge, el círculo de piedras gigantes?', 'Stonehenge, Inglaterra', 51.1789, -1.8262, 400, 'Tiene más de 4.000 años y nadie sabe bien para qué se usó.', 'Stonehenge', 'Wiltshire');

  P('mu', MC, '¿Cuál es la capital de Australia? (No es Sídney)', 'Canberra', -35.2809, 149.13, 800, 'Se eligió una ciudad nueva a mitad de camino entre Sídney y Melbourne.', 'Canberra', 'capital');
  P('mu', MC, '¿Cuál es la capital de Canadá?', 'Ottawa', 45.4215, -75.6972, 800, 'Está sobre el río Ottawa, en el límite de Ontario y Quebec.', 'Ottawa', 'capital');
  P('mu', MC, '¿Cuál es la capital de Brasil?', 'Brasilia', -15.7939, -47.8828, 800, 'Se inauguró en 1960, en el medio del país.', 'Brasilia', '1960');
  P('mu', MC, '¿Cuál es la capital de Turquía? (No es Estambul)', 'Ankara', 39.9334, 32.8597, 800, 'Es la capital desde 1923.', 'Ankara', 'capital');
  P('mu', MC, '¿Cuál es la capital de Nigeria? (No es Lagos)', 'Abuya', 9.0765, 7.3986, 800, 'Reemplazó a Lagos como capital en 1991.', 'Abuya', '1991');
  P('mu', MC, '¿Cuál es la capital de Nueva Zelanda?', 'Wellington', -41.2866, 174.7756, 800, 'Es una de las capitales más australes del mundo.', 'Wellington', 'capital');
  P('mu', MC, '¿Cuál es la capital de Marruecos?', 'Rabat', 34.0209, -6.8416, 800, 'Está sobre la costa atlántica.', 'Rabat', 'Marruecos');
  P('mu', MC, '¿Cuál es la capital de Suiza?', 'Berna', 46.948, 7.4474, 800, 'Muchos creen que es Zúrich o Ginebra, pero es Berna.', 'Berna', 'Suiza');

  P('mu', MS, '¿Dónde está el CERN, con el Gran Colisionador de Hadrones, entre Suiza y Francia?', 'Cerca de Ginebra', 46.233, 6.0557, 500, 'Su acelerador de partículas tiene 27 km de circunferencia.', 'CERN', 'Hadrones', 'Organización Europea para la Investigación Nuclear');
  P('mu', MS, '¿Dónde están las islas Galápagos, que inspiraron a Darwin?', 'Islas Galápagos', -0.9538, -90.9656, 700, 'Pertenecen a Ecuador y están en pleno Pacífico.', 'Islas Galápagos', 'Darwin');
  P('mu', MS, '¿Dónde está el Everest, la montaña más alta del planeta?', 'Monte Everest', 27.9881, 86.925, 500, 'Está en la frontera entre Nepal y China.', 'Monte Everest', 'Nepal');
  P('mu', MS, '¿Dónde está el desierto de Atacama, uno de los más secos de la Tierra?', 'Desierto de Atacama, Chile', -24.5, -69.25, 700, 'En algunos lugares casi nunca llueve.', 'Desierto de Atacama', 'desierto');
  P('mu', MS, '¿Dónde está la Gran Barrera de Coral, el mayor arrecife del mundo?', 'Gran Barrera de Coral, Australia', -18.2871, 147.6992, 900, 'Se ve incluso desde el espacio.', 'Great Barrier Reef', 'arrecife', 'Gran Barrera de Coral');
  P('mu', MS, '¿Dónde está el Centro Espacial Kennedy, desde donde parten cohetes de la NASA?', 'Cabo Cañaveral, Florida', 28.5729, -80.649, 500, 'De aquí salió el Apolo 11 rumbo a la Luna.', 'Centro espacial Kennedy', 'NASA');
  P('mu', MS, '¿Dónde está el cosmódromo de Baikonur, de donde despegó Gagarin en 1961?', 'Baikonur, Kazajistán', 45.9646, 63.3052, 700, 'Yuri Gagarin fue el primer ser humano en el espacio.', 'Baikonur Cosmodrome', 'Gagarin', 'Cosmódromo de Baikonur');
  P('mu', MS, '¿Dónde están las Cataratas Victoria, entre Zambia y Zimbabue?', 'Cataratas Victoria', -17.9243, 25.8572, 600, 'Los locales las llaman «el humo que truena».', 'Cataratas Victoria', 'Zambia');

  P('mu', MF, '¿Dónde se jugó la final del Mundial 2022, que ganó Argentina?', 'Estadio Lusail, Catar', 25.421, 51.49, 700, 'Argentina le ganó a Francia por penales.', 'Lusail Stadium', '2022');
  P('mu', MF, '¿Dónde está el Maracaná, donde Uruguay ganó el Mundial de 1950?', 'Río de Janeiro', -22.9121, -43.2302, 700, 'Aquel partido se conoce como «el Maracanazo».', 'Estadio Maracaná', '1950');
  P('mu', MF, '¿Dónde está el Camp Nou, el estadio del FC Barcelona?', 'Barcelona', 41.3809, 2.1228, 600, 'Es el estadio más grande de Europa.', 'Camp Nou', 'Barcelona');
  P('mu', MF, '¿Dónde está el Estadio Azteca, donde Maradona fue campeón en 1986?', 'Ciudad de México', 19.3029, -99.1505, 700, 'Fue sede de las finales de 1970 y 1986.', 'Estadio Azteca', '1986');
  P('mu', MF, '¿Dónde está el estadio de Wembley, donde juega la selección inglesa?', 'Londres', 51.556, -0.2796, 500, 'Su arco gigante se ve desde lejos.', 'Estadio de Wembley', 'Londres');
  P('mu', MF, '¿Dónde está Old Trafford, el «Teatro de los Sueños» del Manchester United?', 'Mánchester', 53.4631, -2.2913, 500, 'Es la cancha del Manchester United.', 'Old Trafford', 'Manchester United');
  P('mu', MF, '¿Dónde está Olimpia, donde nacieron los Juegos Olímpicos de la Antigüedad?', 'Olimpia, Grecia', 37.6379, 21.6298, 600, 'Los primeros Juegos se hicieron allí hace casi 3.000 años.', 'Olimpia (Grecia)', 'Juegos Olímpicos');
  P('mu', MF, '¿Dónde está el Estadio Centenario, sede de la primera final de un Mundial, en 1930?', 'Montevideo', -34.8946, -56.1527, 500, 'Uruguay le ganó 4 a 2 a Argentina.', 'Estadio Centenario', '1930');

  // ---------- Etapa 3: 54 preguntas más ----------
  P('ar', H, '¿Dónde está la Casa Rosada, sede del gobierno nacional?', 'Buenos Aires', -34.6081, -58.3702, 100, 'Desde su balcón hablaron muchos presidentes a la multitud en la Plaza de Mayo.', 'Casa Rosada', 'presidente');
  P('ar', H, '¿Dónde están las ruinas jesuíticas de San Ignacio Miní?', 'San Ignacio, Misiones', -27.2528, -55.5367, 200, 'Era una misión donde vivían guaraníes junto a los jesuitas, hace más de 300 años.', 'San Ignacio (Misiones)', 'jesuita', 'Misión jesuítica de San Ignacio Miní');
  P('ar', H, '¿Dónde está la Estancia Jesuítica de Alta Gracia, Patrimonio de la Humanidad?', 'Alta Gracia, Córdoba', -31.6536, -64.4264, 150, 'Forma parte de la Manzana y Estancias Jesuíticas de Córdoba, declaradas Patrimonio de la Humanidad.', 'Alta Gracia', 'Patrimonio');
  P('ar', H, '¿Dónde está el Monumento a la Bandera, donde Belgrano creó la bandera en 1812?', 'Rosario', -32.9477, -60.6305, 100, 'Está a orillas del río Paraná y tiene una torre de 70 metros.', 'Monumento Nacional a la Bandera', 'Belgrano');
  P('ar', H, '¿Dónde está Puerto Argentino, la capital de las Islas Malvinas?', 'Puerto Argentino, Malvinas', -51.6926, -57.859, 300, 'Las Malvinas son argentinas: allí se luchó en 1982.', 'Puerto Argentino/Stanley', '1982');
  P('ar', H, '¿Dónde está el Cementerio de la Recoleta, donde descansa Evita?', 'Buenos Aires', -34.5875, -58.3933, 100, 'Es uno de los cementerios más visitados del mundo por sus mausoleos.', 'Cementerio de la Recoleta', 'Duarte');

  P('ar', C, '¿Dónde queda Córdoba, la ciudad de las campanas y de una de las universidades más antiguas de América?', 'Córdoba', -31.4201, -64.1888, 150, 'Su universidad se fundó en 1613.', 'Córdoba (Argentina)', 'universidad');
  P('ar', C, '¿Dónde queda Rosario, la cuna de la bandera, sobre el río Paraná?', 'Rosario', -32.9442, -60.6505, 150, 'Es la ciudad más grande de Santa Fe y tiene un gran puerto.', 'Rosario (Argentina)', 'Paraná');
  P('ar', C, '¿Dónde queda Salta, «la Linda», donde nació el general Güemes?', 'Salta', -24.7821, -65.4232, 150, 'Es la puerta de entrada a los valles calchaquíes y a la Puna.', 'Salta (Argentina)', 'Güemes');
  P('ar', C, '¿Dónde queda Puerto Madryn, base para ver ballenas en la Patagonia?', 'Puerto Madryn', -42.7692, -65.0385, 150, 'Desde allí se sale a ver ballenas francas y pingüinos.', 'Puerto Madryn', 'ballena');
  P('ar', C, '¿Dónde queda Posadas, la capital de Misiones, sobre el río Paraná?', 'Posadas', -27.3671, -55.8961, 150, 'Del otro lado del río está Encarnación, en Paraguay.', 'Posadas (Argentina)', 'Paraná');
  P('ar', C, '¿Dónde queda El Calafate, la puerta de entrada al glaciar Perito Moreno?', 'El Calafate', -50.3375, -72.2648, 150, 'Está a orillas del lago Argentino.', 'El Calafate', 'Perito Moreno');

  R('ar', N, 'provincia', '¿En qué provincia está el cerro Fitz Roy, cerca de El Chaltén?', 'Santa Cruz', 'Sus paredes de granito atraen a escaladores de todo el mundo.', 'Monte Fitz Roy', 'Chaltén');
  R('ar', N, 'provincia', '¿En qué provincia está la Quebrada de Humahuaca, Patrimonio de la Humanidad?', 'Jujuy', 'Es un antiguo camino de los pueblos andinos, de montañas de colores.', 'Quebrada de Humahuaca', 'Humahuaca');
  R('ar', N, 'provincia', '¿En qué provincia está el volcán Lanín, que da nombre a un parque nacional?', 'Neuquén', 'Es un volcán nevado que se ve desde Chile y Argentina.', 'Parque nacional Lanín', 'volcán');
  R('ar', N, 'provincia', '¿En qué provincia está el Parque Nacional Tierra del Fuego, el más austral del país?', 'Tierra del Fuego', 'Allí termina la Ruta Nacional 3, en la bahía Lapataia.', 'Parque nacional Tierra del Fuego', 'Ushuaia');
  R('ar', N, 'provincia', '¿En qué provincia está el Cañón del Atuel, cerca de San Rafael?', 'Mendoza', 'El río Atuel talló paredes de roca de colores.', 'Cañón del Atuel', 'Atuel');
  R('ar', N, 'provincia', '¿En qué provincia está el Parque Nacional Quebrada del Condorito, donde viven cóndores?', 'Córdoba', 'Allí vive el cóndor andino, el ave voladora más grande del mundo.', 'Parque nacional Quebrada del Condorito', 'cóndor');

  P('ar', F, '¿Dónde está el estadio Monumental, la cancha de River Plate?', 'Núñez, Buenos Aires', -34.5453, -58.4498, 100, 'En el Monumental se jugó la final del Mundial de 1978.', 'Estadio Monumental Antonio Vespucio Liberti', 'River');
  P('ar', F, '¿Dónde está La Bombonera, la cancha de Boca Juniors?', 'La Boca, Buenos Aires', -34.6356, -58.3647, 100, 'Su forma de caja de bombones le dio el apodo.', 'Estadio Alberto J. Armando', 'Boca');
  P('ar', F, '¿Dónde está el estadio Mario Alberto Kempes, sede del Mundial 1978?', 'Córdoba', -31.3667, -64.2547, 150, 'Lleva el nombre del goleador de aquel Mundial.', 'Estadio Mario Alberto Kempes', '1978');
  P('ar', F, '¿En qué ciudad nació Lionel Messi?', 'Rosario', -32.9442, -60.6505, 150, 'Messi empezó a jugar en Newell\'s Old Boys, en Rosario.', 'Rosario (Argentina)', 'Rosario', 'Lionel Messi');
  P('ar', F, '¿Dónde está el Luna Park, el templo del boxeo argentino?', 'Buenos Aires', -34.6025, -58.3678, 100, 'Allí hubo famosas peleas y también conciertos y shows.', 'Estadio Luna Park', 'boxeo');
  P('ar', F, '¿Dónde está el autódromo Oscar y Juan Gálvez, donde se corrió el Gran Premio de Argentina?', 'Buenos Aires', -34.6933, -58.4592, 100, 'Aquí se corrieron carreras de Fórmula 1.', 'Autódromo Oscar y Juan Gálvez', 'Fórmula 1');

  R('ar', T, 'provincia', '¿En qué provincia se hace el Festival Nacional de Folklore de Cosquín?', 'Córdoba', 'Cada enero reúne a los mejores artistas del folklore argentino.', 'Cosquín', 'folklore');
  R('ar', T, 'provincia', '¿En qué provincia está Gualeguaychú, famosa por su Carnaval del País?', 'Entre Ríos', 'Sus comparsas desfilan en el corsódromo con plumas y brillos.', 'Gualeguaychú', 'carnaval');
  R('ar', T, 'provincia', '¿En qué provincia se hace la Fiesta Nacional del Poncho?', 'Catamarca', 'Se celebra en la capital provincial y homenajea al tejido artesanal.', 'San Fernando del Valle de Catamarca', 'Poncho');
  R('ar', T, 'provincia', '¿En qué provincia se hace la Fiesta Nacional de la Empanada, en Famaillá?', 'Tucumán', 'Ahí se hace «la empanada más grande» para festejar.', 'Famaillá', 'empanada');
  R('ar', T, 'provincia', '¿En qué provincia está San Antonio de Areco, capital de la tradición gaucha?', 'Buenos Aires', 'Cada noviembre se celebra el Día de la Tradición con desfiles gauchos.', 'San Antonio de Areco', 'gaucho');
  R('ar', T, 'provincia', '¿En qué provincia está Gaiman, donde se toma el té galés?', 'Chubut', 'Descendientes de galeses se instalaron allí en el siglo XIX.', 'Gaiman', 'galeses');

  R('mu', MH, 'pais', '¿En qué país está el Coliseo, donde peleaban los gladiadores?', 'Italia', 'Podía recibir a decenas de miles de espectadores.', 'Coliseo', 'gladiador');
  R('mu', MH, 'pais', '¿En qué país está Stonehenge, el círculo de piedras gigantes?', 'Reino Unido', 'Lo levantaron hace unos 4.000 o 5.000 años.', 'Stonehenge', 'piedra');
  R('mu', MH, 'pais', '¿En qué país está la Torre Eiffel?', 'Francia', 'Se inauguró en 1889 para una exposición universal.', 'Torre Eiffel', '1889');
  P('mu', MH, '¿Dónde está la Estatua de la Libertad?', 'Nueva York', 40.6892, -74.0445, 500, 'Fue un regalo de Francia y recibe a los barcos que llegan al puerto.', 'Estatua de la Libertad', 'Francia');
  R('mu', MH, 'pais', '¿En qué país está la Alhambra, el gran palacio de Granada?', 'España', 'Es una fortaleza y palacio de la época musulmana.', 'Alhambra', 'Granada');
  P('mu', MH, '¿Dónde está Santa Sofía, la antigua basílica de Constantinopla?', 'Estambul', 41.0086, 28.98, 500, 'Estuvo en pie casi 1.500 años.', 'Santa Sofía', 'Constantinopla');

  P('mu', MC, '¿Cuál es la capital de Brasil? (No es Río de Janeiro)', 'Brasilia', -15.7939, -47.8828, 800, 'Se construyó desde cero en los años 50 y se inauguró en 1960.', 'Brasilia', 'capital');
  P('mu', MC, '¿Cuál es la capital de Turquía? (No es Estambul)', 'Ankara', 39.9334, 32.8597, 800, 'Atatürk la eligió como capital en 1923.', 'Ankara', 'capital');
  P('mu', MC, '¿Cuál es la capital de Egipto?', 'El Cairo', 30.0444, 31.2357, 800, 'Está a orillas del río Nilo, cerca de las pirámides de Guiza.', 'El Cairo', 'Nilo');
  P('mu', MC, '¿Cuál es la capital de Kenia?', 'Nairobi', -1.2921, 36.8219, 800, 'Tiene un parque nacional con leones dentro de su territorio.', 'Nairobi', 'capital');
  P('mu', MC, '¿Cuál es la capital de Japón?', 'Tokio', 35.6762, 139.6503, 800, 'Es una de las ciudades más pobladas del mundo.', 'Tokio', 'capital');
  P('mu', MC, '¿Cuál es la capital de Nueva Zelanda? (No es Auckland)', 'Wellington', -41.2866, 174.7756, 800, 'Es la capital más austral del mundo.', 'Wellington', 'capital');

  P('mu', MS, '¿Dónde está el monte Everest, la montaña más alta del mundo?', 'Nepal y China', 27.9881, 86.925, 700, 'Mide casi 8.849 metros, en la cordillera del Himalaya.', 'Monte Everest', 'Himalaya');
  P('mu', MS, '¿Dónde está el Salar de Uyuni, el mayor desierto de sal del mundo?', 'Bolivia', -20.1338, -67.4891, 600, 'Cuando llueve se convierte en un enorme espejo.', 'Salar de Uyuni', 'litio');
  P('mu', MS, '¿Dónde está el Gran Cañón del Colorado?', 'Arizona, Estados Unidos', 36.1069, -112.1129, 600, 'El río Colorado lo fue cavando durante millones de años.', 'Gran Cañón del Colorado', 'Colorado');
  P('mu', MS, '¿Dónde está el Mar Muerto, tan salado que se flota sin esfuerzo?', 'Israel y Jordania', 31.5, 35.5, 600, 'Es uno de los lugares más bajos de la Tierra.', 'Mar Muerto', 'sal');
  P('mu', MS, '¿Dónde está el Kilimanjaro, la montaña más alta de África?', 'Tanzania', -3.0674, 37.3556, 600, 'Es un volcán cubierto de nieve cerca del ecuador.', 'Kilimanjaro', 'Tanzania');
  P('mu', MS, '¿Dónde cayó el meteorito de Chicxulub, que acabó con los dinosaurios?', 'Península de Yucatán, México', 21.4, -89.5, 700, 'El cráter está en parte bajo el mar, frente a la costa de México.', 'Cráter de Chicxulub', 'dinosaurio');

  P('mu', MF, '¿Dónde está el Santiago Bernabéu, el estadio del Real Madrid?', 'Madrid', 40.4531, -3.6883, 500, 'Fue sede de la final del Mundial 1982.', 'Estadio Santiago Bernabéu', 'Real Madrid');
  P('mu', MF, '¿Dónde está San Siro, el estadio del Milan y del Inter?', 'Milán', 45.4781, 9.124, 500, 'Dos clubes rivales comparten la misma cancha.', 'Estadio Giuseppe Meazza', 'Milan');
  P('mu', MF, '¿Dónde está el Allianz Arena, el estadio del Bayern Múnich?', 'Múnich', 48.2188, 11.6247, 500, 'Se ilumina por fuera de rojo, azul o blanco.', 'Allianz Arena', 'Bayern');
  P('mu', MF, '¿Dónde está el Estadio Olímpico donde se hicieron los Juegos de 1936?', 'Berlín', 52.5147, 13.2395, 500, 'Allí ganó cuatro medallas de oro el atleta Jesse Owens.', 'Estadio Olímpico de Berlín', '1936');
  P('mu', MF, '¿Dónde se juega Roland Garros, el torneo de tenis sobre polvo de ladrillo?', 'París', 48.8469, 2.253, 500, 'Es uno de los cuatro Grand Slam.', 'Stade Roland-Garros', 'París');
  P('mu', MF, '¿Dónde se juega Wimbledon, el torneo de tenis sobre césped?', 'Londres', 51.4344, -0.2142, 500, 'Es el torneo de tenis más antiguo del mundo.', 'All England Lawn Tennis and Croquet Club', 'Wimbledon');

  window.PREGUNTAS = L.map((p, i) => Object.assign({ id: i }, p));
})();
