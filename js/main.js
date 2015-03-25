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
	container.append("div")
		.attr("class","row header")
		.append("h1") // Inserito come figlio del div precedente
		.append("a") // Figlio di "h1"
		.attr("href","http://www.sergiobonelli.it/sezioni/18/dampyr")
		.attr("target","_blank")
		.append("img") // Figlio di "a" (e nipote di "h1")
		.attr("class","img-responsive center-block")
		.attr("src","http://www.sergiobonelli.it/images/personaggi/principali/dampyr_personaggio.png")
		.attr("alt","Dampyr");

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
		// Assicuriamoci poi che tutto sia ordinato per numero di albo (e quindi per data di uscita)
		// e per ora limitiamoci ai primi 20 albi per non sovraccaricare di richieste il server della Bonelli
		// (le immagini sono linkate direttamente dal sito ufficiale).
		//
		var albi = container.append("div")
			.attr("class","row body") // Dopo l'header, un altra "row", ma con classe "body"
			.selectAll("div") // La selezione dei "div" contenitori viene assegnata alla variabile "albi" e poi riutilizzata successivamente.	
			.data(data.sort(function(a,b) { // Il metodo sort() passa alla callback una coppia di elementi
				// Bisogna indicare dei due elementi quale viene prima e quale dopo,
				// in questo ci aiuta un metodo di d3 già predisposto allo scopo per semplici ordinamenti.
				// 
				// Ovviamente dobbiamo confrontare il valore degli attributi "Numero" degli oggetti "a" e "b" e non gli oggetti in sé
				// e prima di farlo li convertiamo a interi (inizialmente sono letti come stringhe) anteponendo un "+".
				return d3.ascending(+a["Numero"],+b["Numero"]); 
			}).slice(0,20)) // Il metodo slice() applicato a un array prende 20 elementi consecutivi a partire dal numero 0 (il primo)
			.enter()
			.append("div")
			.attr("class","comics-container col-lg-2 col-md-3 col-sm-4 col-xs-6") // Associamo una classe ai div contenitori degli albi per sfruttare la grid di bootstrap che ci assicura la responsiveness
			.append("div") // Perché due div uno dentro l'altro? Perché vogliamo il bordo di ogni elemento e una certa distanza tra l'uno e l'altro
			.attr("class","comics");
		
		// Da qui in poi tutti gli elementi vanno creati all'interno dei div contenitori creati precedentemente.
		// La variabile "albi" è un array e tutti i metodi invocati si applicano a tutti gli elementi dell'array.
		// Noi lo scriviamo una sola volta, ma il tutto è eseguito per tutti gli elementi, tanti quanti sono i dati.
		albi.append("p")
			.attr("class","number")
			.text(function(d) {
				return "Dampyr n. "+d["Numero"]; // Concatenazione di stringhe, sempre con il "+".
			});

		albi.append("h4") // Titolo di quarto livello, sempre figlio del div, ma fratello del paragrafo precedente
			.attr("class","title")
			.text(function(d) {
				return d["Titolo"];
			});

		albi.append("a") // Questa volta inseriamo nel DOM un link alla scheda dell'albo sul sito ufficiale
			.attr("href", function(d) { // L'URL del link va inserita nell'attributo "href" mediante il metodo "attr"
				return d["Scheda"];
			})
			.attr("target","_blank") // Il link si apre in un'altra finestra
			.append("img") // Ora l'append è consecutivo al precedente, quindi agisce su "a" (non su "div"), inserendo al suo interno un'immagine
			.attr("class","cover img-responsive center-block") // Associamo la classe "cover" e alcune classi utili definite da bootstrap
			.attr("src", function(d) { // La sua URL va inserita nell'attributo "src" mediante il metodo "attr"
				return d["Copertina"];
			})
			.attr("alt", function(d) {
				return d["Titolo"];
			});

		albi.append("p")
			.attr("class","date")
			.text(function(d) {
				return "Uscito il "+d["Data di uscita"];
			});

		// E infine un footer a chiudere
		container.append("div")
			.attr("class","row footer")
			.append("a")
			.attr("href","http://www.sergiobonelli.it/")
			.attr("target","_blank")
			.append("img")
			.attr("class","img-responsive center-block")
			.attr("src","http://www.sergiobonelli.it/images/sergio_bonelli_editore.png")
			.attr("alt","Sergio Bonelli Editore");

	});
};
