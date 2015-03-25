/*
 *  Codice javascript per l'applicazione
 */

// All'interno del file index.html il luogo migliore per inserire ed eseguire il codice javascript
// è l'header della pagina, all'interno del tag <head>. Ma effettuare subito operazioni sul DOM all'interno
// del tag <body> prima ancora che sia caricato interamente non è una buona idea...
// 
// Inseriamo quindi tutto il codice in una funzione di callback e l'assegnamo al metodo onload dell'oggetto window.
// La nostra funzione sarà così eseguita automaticamente non appena il caricamento della pagina sarà completato
// e il DOM pronto per essere manipolato.
//
window.onload = function() {

	// La libreria d3 espone un oggetto accessibile globalmente: d3.
	// L'uso della libreria d3 richiede quindi l'esecuzione opportuna dei metodi dell'oggetto d3.
	// 
	// In questo caso il metodo select([selettore]) seleziona l'elemento in base al selettore passato ("body")
	// e ritorna un oggetto "selezione" (assegnato alla variabile "titolo").
	//
	// Una selezione d3 a sua volta possiede il metodo append([tag]) che crea un nuovo
	// nodo del tipo specificato ("h1") nel DOM all'interno del nodo selezionato in precedenza ("body").
	//
	// Anche append() torna una selezione (questa volta "h1", non più "body"), 
	// per cui è possibile accedere immediatamente al metodo text([string])
	// sfruttando un pattern di programmazione noto con il nome di chaining. La stringa passata come argomento
	// ("Dampyr") viene dunque inserita come nodo testo all'interno del nodo selezionato ("h1").
	//
	var titolo = d3.select("body")
		.append("h1")
		.text("Dampyr");

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

		// Qui uno dei pilastri concettuali della libreria d3:
		// selezioniamo il "body" come prima, poi selezioniamo tutti gli elementi "p"
		// in esso contenuti con il metodo selectAll([selettore]). 
		// Inizialmente non ce ne sono, quindi la selezione è vuota, ma esiste.
		//
		// A questa selezione (vuota) associamo il nostro array per posizione con il metodo data([array]): 
		// il primo oggetto con il primo paragrafo (che non esiste), 
		// il secondo oggetto con il secondo paragrafo (che sempre non esiste), ecc.
		//
		// Il metodo enter() opera la magia: esegue tutto ciò che viene dopo tante volte quanti sono i dati
		// che non sono stati assegnati ad alcun elemento del DOM, nel nostro caso tutti. Per cui append("p")
		// viene eseguito per tutti i dati e così vengono creati nel DOM tanti paragrafi quanti sono i dati
		// e a essi vengono associati in ordine i dati uno a uno.
		//
		// Il metodo append("p") torna una selezione, per cui possiamo subito impostare il testo dei paragrafi,
		// che non è fisso, ma dipende dai dati: la funzione di callback, infatti, viene eseguita passandole
		// il dato associato all'elemento corrente: "d" è un oggetto che rappresenta una riga del dataset originario
		// (una riga del file tsv), con le chiavi uguali ai nomi delle colonne e i valori quelli delle celle della riga.
		//
		// Questa funzione di callback deve ritornare un valore compatibile con il metodo che l'ha chiamata: nel nostro caso
		// una stringa da inserire all'interno del paragrafo appena creato.
		//
		/*
		 * var titoli_albi = d3.select("body") // Selezione del body (che esiste)
			.selectAll("p") // Selezione di tutti i paragrafi figli (che non esistono)
			.data(data) // Associazione dei dati ai paragrafi (che ancora non esistono)
			.enter() // Entriamo e agiamo nella selezione vuota in base ai dati associati...
			.append("p") // Creazione di un paragrafo per ogni riga del dataset originario
			.text(function(d) { // Al nuovo paragrafo è associata una riga del dataset, in ordine
				return d["Titolo"]; // Scriviamo all'interno del paragrafo il contenuto della colonna "Titolo"
			});
		 */

		// Rendiamo più accattivante la pagina mostrando quattro elementi per ogni albo:
		// il numero, il titolo, la copertina e la data di uscita nelle edicole.
		//
		// Assicuriamoci poi che tutto sia ordinato per numero di albo (e quindi per data di uscita)
		// e per ora limitiamoci ai primi 20 albi per non sovraccaricare di richieste il server della Bonelli
		// (le immagini sono linkate direttamente dal sito ufficiale).
		//
		var albi = d3.select("body") // La selezione dei "div" contenitori viene assegnata alla variabile "albi" e poi riutilizzata successivamente.
			.selectAll("div")
			.data(data.sort(function(a,b) { // Il metodo sort() passa alla callback una coppia di elementi
				// Bisogna indicare dei due elementi quale viene prima e quale dopo,
				// in questo ci aiuta un metodo di d3 già predisposto allo scopo per semplici ordinamenti.
				// 
				// Ovviamente dobbiamo confrontare il valore degli attributi "Numero" degli oggetti "a" e "b" e non gli oggetti in sé
				// e prima di farlo li convertiamo a interi (inizialmente sono letti come stringhe) anteponendo un "+".
				return d3.ascending(+a["Numero"],+b["Numero"]); 
			}).slice(0,20)) // Il metodo slice() applicato a un array prende 20 elementi consecutivi a partire dal numero 0 (il primo)
			.enter()
			.append("div");
		// Da qui in poi tutti gli elementi vanno creati all'interno dei div contenitori creati precedentemente.
		// La variabile "albi" è un array e tutti i metodi invocati si applicano a tutti gli elementi dell'array.
		// Noi lo scriviamo una sola volta, ma il tutto è eseguito per tutti gli elementi, tanti quanti sono i dati.
		albi.append("p") 
			.text(function(d) {
				return "Dampyr n. "+d["Numero"]; // Concatenazione di stringhe, sempre con il "+".
			});

		albi.append("h2") // Titolo di secondo livello, sempre figlio del div, ma fratello del paragrafo precedente
			.text(function(d) {
				return d["Titolo"];
			});

		albi.append("a") // Questa volta inseriamo nel DOM un link alla scheda dell'albo sul sito ufficiale
			.attr("href", function(d) { // L'URL del link va inserita nell'attributo "href" mediante il metodo "attr"
				return d["Scheda"];
			})
			.attr("target","_blank") // Il link si apre in un'altra finestra
			.append("img") // Ora l'append è consecutivo al precedente, quindi agisce su "a" (non su "div"), inserendo al suo interno un'immagine
			.attr("src", function(d) { // La sua URL va inserita nell'attributo "src" mediante il metodo "attr"
				return d["Copertina"];
			});

		albi.append("p")
			.text(function(d) {
				return "Uscito il "+d["Data di uscita"];
			});

	});
};
