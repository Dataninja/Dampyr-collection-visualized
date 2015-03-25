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
	// ("Hello world!") viene dunque inserita come nodo testo all'interno del nodo selezionato ("h1").
	//
	var titolo = d3.select("body")
		.append("h1")
		.text("Hello world!");
};
