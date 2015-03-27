/*
 *  Codice javascript per l'applicazione
 */

// All'interno del file index.html il luogo migliore per inserire ed eseguire il codice javascript
// è l'header della pagina, all'interno del tag <head>. Ma effettuare subito operazioni sul DOM all'interno
// del tag <body> prima ancora che sia caricato interamente non è una buona idea...
// 
// Inseriamo quindi tutto il codice in una funzione di callback e passiamola come argomento alla funzione speciale di jQuery, "$()".
// La nostra funzione sarà così eseguita automaticamente non appena il caricamento della pagina sarà completato
// e il DOM pronto per essere manipolato.
//
$(function() {

	// La libreria d3 espone un oggetto accessibile globalmente: d3.
	// L'uso della libreria d3 richiede quindi l'esecuzione opportuna dei metodi dell'oggetto d3.
	// 
	// In questo caso il metodo select([selettore]) seleziona l'elemento in base al selettore passato ("body")
	// e ritorna un oggetto "selezione" (assegnato alla variabile "container").
	//
	// Una selezione d3 a sua volta possiede il metodo append([tag]) che crea un nuovo
	// nodo del tipo specificato ("div") nel DOM all'interno del nodo selezionato in precedenza ("body").
	//
	// Anche append() torna una selezione (questa volta "div", non più "body"), 
	// per cui è possibile accedere immediatamente al metodo attr([string],[string])
	// sfruttando un pattern di programmazione noto con il nome di chaining. La stringa passata come secondo argomento
	// ("container-fluid") viene dunque inserita come classe all'interno dell'attributo "class" del nodo selezionato ("div").
	//
	// Creiamo subito un contenitore della pagina, figlio del body per usare al meglio bootstrap.
	// 
	var container = d3.select("body")
		.append("div")
		.attr("class","container-fluid");

	// Inseriamo il titolo in un contenitore che funga da "header" con classe "row", sempre per sfruttare bootstrap.
	var header = container.append("header") // Definiamo semanticamente le parti della pagina con i nuovi tag dell'HTML5
		.attr("class","row page-header");
		
	header.append("figure") // HTML5
		.append("a") // Figlio di "h1"
		.attr("href","http://www.sergiobonelli.it/sezioni/18/dampyr")
		.attr("target","_blank")
		.append("img") // Figlio di "a" (e nipote di "h1")
		.attr("class","img-responsive center-block")
		.attr("src","http://www.sergiobonelli.it/images/personaggi/principali/dampyr_personaggio.png")
		.attr("alt","Dampyr");

	// Rendiamo il tutto ricercabile mediante shufflejs attraverso un campo di input testuale
	header.append("nav")
		.append("input")
		.attr("id","search")
		.attr("class","center-block input-lg")
		.attr("placeholder","Cerca per autore...")
		.attr("value","");

	// Abbiamo ora bisogno di dati memorizzati in un file tsv (Tab-separated values),
	// per cui dobbiamo recuperarli con una chiamata AJAX. Il metodo tsv([url], callback) di d3
	// pensa a tutto: chiamata asincrona, gestione della risposta (evetuali errori in "error" e parsing dei dati testuali
	// dal tsv a un array di oggetti (passato in "data").
	// 
	d3.tsv("data/Bonelli-Collezione-Dampyr-Marzo-2015.tsv", function(error, data) {

		// Gestione di eventuali errori (es. file non trovato, ecc.),
		// se c'è qualche problema l'esecuzione si blocca e viene notificato un messaggio in console.
		if (error) {
			throw "Error in loading data...";
		}

		// Assicuriamoci che tutto sia ordinato per numero di albo (e quindi per data di uscita)
		// e per ora limitiamoci ai primi 20 albi per non sovraccaricare di richieste il server della Bonelli
		// (le immagini sono linkate direttamente dal sito ufficiale).
		//
		data = data.sort(function(a,b) { // Il metodo sort() passa alla callback una coppia di elementi
				// Bisogna indicare dei due elementi quale viene prima e quale dopo,
				// in questo ci aiuta un metodo di d3 già predisposto allo scopo per semplici ordinamenti.
				// 
				// Ovviamente dobbiamo confrontare il valore degli attributi "Numero" degli oggetti "a" e "b" e non gli oggetti in sé
				// e prima di farlo li convertiamo a interi (inizialmente sono letti come stringhe) anteponendo un "+".
				return d3.ascending(+a["Numero"],+b["Numero"]); 
			}).slice(0,25); // Il metodo slice() applicato a un array prende 20 elementi consecutivi a partire dal numero 0 (il primo)

		// Per aggiungere la funzionalità di autocomplete al form di ricerca,
		// ricaviamo la lista dei nomi di tutti gli autori degli albi.
		// Soggetto        Sceneggiatura   Disegni Copertina
		var authors = _.uniq(_.flatten(data.map(function(el) { 
				var groups = [];
				return groups
					.concat(el["Soggetto"].split(","))
					.concat(el["Sceneggiatura"].split(","))
					.concat(el["Disegni"].split(","))
					.concat(el["Copertina"].split(","));
			})));


		// Aggiungiamo una timeline in testa alla grid che mostri una timeline delle uscite,
		// anno per anno: un cerchio per ogni anno, con raggio proporzionale al numero di albi per anno,
		// che reagisca al filtro dell'utente, in modo da mostrare l'apporto annuale degli autori alla serie.
		// 
		var timeline = container.append("section")
			.attr("id","timeline")
			.attr("class","row page-viz");

		var width = $("#timeline").width(),
			height = 125,
			margin = { top: 10, right: 10, bottom: 10, left: 10 };
				
		var svg = timeline.append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform","translate("+margin.left+","+margin.top+")");

		var years = _.uniq(data.map(function(el) { var date = new Date(el["Data di uscita"]); return date.getFullYear(); })),
			pivot = _.pairs(_.reduce(data, function(m,n) { 
				var date = new Date(n["Data di uscita"]);
				m[date.getFullYear()]++;
				return m;
			}, _.object(years.map(function(el) { return [el,0]; }))));

		var x = d3.scale.ordinal()
			.domain(years)
			.rangePoints([0,width-margin.right],1.0);

		var r = d3.scale.linear()
			.range([5,d3.min([width/years.length/2,height/3-margin.top])])
			.domain([0,Math.sqrt(data.length/years.length)]);

		svg.selectAll("circle")
			.data(pivot)
			.enter()
			.append("circle")
			.attr("cx", function(d) {
				return x(+d[0]);
			})
			.attr("cy", height/3)
			.attr("r", function(d) {
				return r(Math.sqrt(d[1]));
			})
			.append("title")
			.text(function(d) {
				return d[0]+": "+d[1];
			});

		svg.append("g")
			.attr("transform","translate(0,"+(height/2-margin.bottom)+")")
			.attr("class","x axis")
			.call(d3.svg.axis().scale(x).innerTickSize(height/2-2*margin.bottom));

		// Qui uno dei pilastri concettuali della libreria d3:
		// prendiamo la variabile container (è una selezione del div contenitore globale), poi selezioniamo tutti gli elementi "div"
		// in esso contenuti con il metodo selectAll([selettore]). 
		// Inizialmente non ce ne sono, quindi la selezione è vuota, ma esiste.
		//
		// A questa selezione (vuota) associamo il nostro array per posizione con il metodo data([array]): 
		// il primo oggetto con il primo div (che non esiste), 
		// il secondo oggetto con il secondo div (che sempre non esiste), ecc.
		//
		// Il metodo enter() opera la magia: esegue tutto ciò che viene dopo tante volte quanti sono i dati
		// che non sono stati assegnati ad alcun elemento del DOM, nel nostro caso tutti. Per cui append("div")
		// viene eseguito per tutti i dati e così vengono creati nel DOM tanti paragrafi quanti sono i dati
		// e a essi vengono associati in ordine i dati uno a uno.
		//
		// Il metodo append("div") torna una selezione, per cui possiamo subito impostare gli attributi e i contenuti dei div,
		// che non sono fissi, ma dipendono dai dati: la funzione di callback, infatti, viene eseguita passandole
		// il dato associato all'elemento corrente: "d" è un oggetto che rappresenta una riga del dataset originario
		// (una riga del file tsv), con le chiavi uguali ai nomi delle colonne e i valori quelli delle celle della riga.
		//
		// Questa funzione di callback deve ritornare un valore compatibile con il metodo che l'ha chiamata: nel nostro caso
		// per lo più stringhe con cui valorizzare gli attributi nominati.
		//
		var albi = container.append("section")
			.attr("id","grid")
			.attr("class","row page-body") // Dopo l'header, un'altra "row", ma con classe "body"
			.selectAll("div") // La selezione dei "div" contenitori viene assegnata alla variabile "albi" e poi riutilizzata successivamente.	
			.data(data)
			.enter()
			.append("div")
			.attr("class","comics-container col-lg-2 col-md-3 col-sm-4 col-xs-6") // Associamo una classe ai div contenitori degli albi per sfruttare la grid di bootstrap che ci assicura la responsiveness
			.attr("data-groups", function(d) { // Shufflejs effettua il filtro su categorie personalizzate che vanno definite nell'attributo data-groups
				var groups = [];
				// Nel nostro caso le categorie sono i nomi degli autori e devono comparire come json di un array di stringhe: ["nome1","nome2",...]
				// Sappiamo però che nelle nostre colonne ci possono essere più nomi, che divideremo in un array con split() usando la virgola come separatore.
				// Non possiamo tornare però un array, perché l'attributo si aspetta una stringa, per cui... stringify, non prima di aver eliminato dall'array
				// gli elementi duplicati.
				return JSON.stringify(_.uniq(groups.concat(d["Soggetto"].split(",")).concat(d["Sceneggiatura"].split(",")).concat(d["Disegni"].split(",")).concat(d["Copertina"].split(",")))).replace(/"/g,"'");
			})
			.attr("data-title", function(d) { // Perché allora non inserire tutte e informazioni negli attributi data-?
				return d["Titolo"].replace(/"/g,"");
			})
			.attr("data-summary", function(d) {
				return d["Sinossi"].replace(/"/g,"");
			})
			.append("article") // Perché due div uno dentro l'altro? Perché vogliamo il bordo di ogni elemento e una certa distanza tra l'uno e l'altro
			.attr("class","comics");
		
		// Da qui in poi tutti gli elementi vanno creati all'interno dei div contenitori creati precedentemente.
		// La variabile "albi" è un array e tutti i metodi invocati si applicano a tutti gli elementi dell'array.
		// Noi lo scriviamo una sola volta, ma il tutto è eseguito per tutti gli elementi, tanti quanti sono i dati.
		var header_albi = albi.append("header");
		
		header_albi.append("p")
			.attr("class","number")
			.text(function(d) {
				return "Dampyr n. "+d["Numero"]; // Concatenazione di stringhe, sempre con il "+".
			});

		header_albi.append("h4") // Titolo di quarto livello, sempre figlio del div, ma fratello del paragrafo precedente
			.attr("class","title")
			.text(function(d) {
				return d["Titolo"];
			});

		albi.append("figure")
			.append("a") // Questa volta inseriamo nel DOM un link alla scheda dell'albo sul sito ufficiale
			.attr("href", function(d) { // L'URL del link va inserita nell'attributo "href" mediante il metodo "attr"
				return d["Immagine"];
				//return d["Scheda"];
			})
			.attr("target","_blank") // Il link si apre in un'altra finestra
			.attr("data-lightbox","cover")
			.attr("data-title", function(d) {
				return d["Sinossi"].replace(/"/g,"");
			})
			.append("img") // Ora l'append è consecutivo al precedente, quindi agisce su "a" (non su "div"), inserendo al suo interno un'immagine
			.attr("class","cover img-responsive center-block") // Associamo la classe "cover" e alcune classi utili definite da bootstrap
			.attr("src", function(d) { // La sua URL va inserita nell'attributo "src" mediante il metodo "attr"
				return d["Immagine"];
			})
			.attr("alt", function(d) {
				return d["Titolo"];
			});

		albi.append("footer")
			.append("p")
			.attr("class","date")
			.html(function(d) {
				return 'Uscito il <a href="'+d["Scheda"]+'" target="_blank">'+d["Data di uscita"]+'</a>';
			});

		// E infine un footer a chiudere la pagina
		container.append("footer")
			.attr("class","row page-footer")
			.append("figure")
			.append("a")
			.attr("href","http://www.sergiobonelli.it/")
			.attr("target","_blank")
			.append("img")
			.attr("class","img-responsive center-block")
			.attr("src","http://www.sergiobonelli.it/images/sergio_bonelli_editore.png")
			.attr("alt","Sergio Bonelli Editore");

		//
		// Il DOM è pronto con tutti gli elementi
		// Ora possiamo agire su quegli elementi, inizializzando la grid dei comics con shufflejs
		//
		$("#grid").shuffle({
			itemSelector: ".comics-container"
		});

		// Attacchiamo una funzione di callback a un evento del form di input: viene eseguita ogni volta che il contenuto cambia
		// a causa della digitazione di un testo all'interno da parte dell'utente
		$("#search").on('keyup change', function() { // Eventi "rilascio di un pulsante della tastiera" e "cambio del contenuto"
			// Effettuando una ricerca in data-groups è necessario ripulire un po' sia le stringa di ricerca
			// (ignorando per esempio le maiuscole e altri caratteri non letterali) che quella in cui viene effettuata
			// la ricerca (che è il json di un array di stringhe)
			var val = this.value.toLowerCase().replace(/[^a-z] /g,""); // Il valore digitato corrente
			$('#grid').shuffle('shuffle', function($el, shuffle) {
				// La funzione viene valutata per ogni elemento della grid:
				// se vera l'elemento viene tenuto, altrimenti viene nascosto
			 	return $el.data('groups').toLowerCase().indexOf(val) > -1;
			});
		});

		$("#search").autocomplete({
			source: authors
		});

	});
});
