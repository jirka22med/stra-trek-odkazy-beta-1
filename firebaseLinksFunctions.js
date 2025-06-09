// firebaseLinksFunctions.js

// 1. Firebase Konfigurace - ZDE VLOŽ SVÉ KLÍČE Z FIREBASE CONSOLE
// (Počkej na tvůj input pro doplnění tohoto objektu)
const firebaseConfig = {
    apiKey: "AIzaSyBdsU71bo-BBUNinMctWM73jX8fX7mXz60",
    authDomain: "star-trek-odkazy.firebaseapp.com",
    projectId: "star-trek-odkazy",
    storageBucket: "star-trek-odkazy.firebasestorage.app",
    messagingSenderId: "1009898907428",
    appId: "1:1009898907428:web:07297e8b8d76ff2654b5b1"
    //measurementId: "G-K8HSJK2XGD"
};

// Globální proměnné pro Firebase a Firestore (budou inicializovány funkcí)
let app = null;
let db = null;

// Funkce pro inicializaci Firebase aplikace pro odkazy
window.initializeFirebaseLinksApp = async function() {
    console.log("firebaseLinksFunctions.js: Spuštěna inicializace Firebase aplikace pro databázi odkazů.");
    try {
        if (typeof firebase === 'undefined' || !firebase.initializeApp) {
            console.error("firebaseLinksFunctions.js: Chyba: Firebase SDK není načteno. Ujistěte se, že firebase-app-compat.js a firebase-firestore-compat.js jsou načteny PŘED tímto skriptem.");
            return false;
        }

        if (!app) { // Inicializovat pouze jednou
            app = firebase.initializeApp(firebaseConfig, "linksApp"); // Použijeme jiný název pro aplikaci než "audioApp"
            console.log("firebaseLinksFunctions.js: Firebase aplikace inicializována.");
        } else {
            console.log("firebaseLinksFunctions.js: Firebase aplikace již byla inicializována.");
        }

        if (!db) { // Inicializovat Firestore pouze jednou
            if (typeof firebase.firestore === 'undefined') {
                console.error("firebaseLinksFunctions.js: Chyba: Firestore SDK není načteno. Ujistěte se, že firebase-firestore-compat.js je načteno.");
                return false;
            }
            db = firebase.firestore(app); // Získat instanci Firestore z konkrétní aplikace
            console.log("firebaseLinksFunctions.js: Firestore databáze připravena pro databázi odkazů.");
            // Povolit offline persistenci, pokud chcete, aby data byla dostupná i offline
              try {
                  await db.enablePersistence();
                 console.log("firebaseLinksFunctions.js: Offline persistence povolena pro databázi odkazů.");
              } catch (err) {
                 if (err.code === 'failed-precondition') {
                     console.warn("firebaseLinksFunctions.js: Offline persistence není podporována v tomto prohlížeči nebo už se používá na jiném tabu.");
              } else if (err.code === 'unimplemented') {
                      console.warn("firebaseLinksFunctions.js: Prohlížeč nepodporuje offline persistence.");
                 } else {
                     console.error("firebaseLinksFunctions.js: Chyba při povolování offline persistence:", err);
                 }
              }
        }

        console.log("firebaseLinksFunctions.js: Konfigurační objekt Firebase načten a připraven.");
        return true;

    } catch (error) {
        console.error("firebaseLinksFunctions.js: Chyba při inicializaci Firebase:", error);
        return false;
    }
};

// Funkce pro přidání nového odkazu do Firestore
window.addLinkToFirestore = async function(linkName, linkUrl) {
    if (!db) {
        console.error("addLinkToFirestore: Firestore databáze není inicializována.");
        return false;
    }
    try {
        await db.collection('links').add({ // 'links' bude název tvé kolekce
            name: linkName,
            url: linkUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Přidá čas vytvoření
        });
        console.log(`addLinkToFirestore: Odkaz "${linkName}" úspěšně přidán do Firestore.`);
        return true;
    } catch (error) {
        console.error("addLinkToFirestore: Chyba při přidávání odkazu do Firestore:", error);
        return false;
    }
};

// Funkce pro načtení všech odkazů z Firestore
window.getLinksFromFirestore = async function() {
    if (!db) {
        console.error("getLinksFromFirestore: Firestore databáze není inicializována.");
        return [];
    }
    try {
        const snapshot = await db.collection('links').orderBy('timestamp', 'asc').get(); // Seřadit podle času vytvoření
        const links = snapshot.docs.map(doc => ({
            id: doc.id, // ID dokumentu Firebase je důležité pro mazání/úpravu
            ...doc.data()
        }));
        console.log(`getLinksFromFirestore: Úspěšně načteno ${links.length} odkazů z Firestore.`);
        return links;
    } catch (error) {
        console.error("getLinksFromFirestore: Chyba při načítání odkazů z Firestore:", error);
        return [];
    }
};

// Funkce pro smazání odkazu z Firestore (pro budoucí použití)
window.deleteLinkFromFirestore = async function(linkId) {
    if (!db) {
        console.error("deleteLinkFromFirestore: Firestore databáze není inicializována.");
        return false;
    }
    try {
        await db.collection('links').doc(linkId).delete();
        console.log(`deleteLinkFromFirestore: Odkaz s ID "${linkId}" úspěšně smazán z Firestore.`);
        return true;
    } catch (error) {
        console.error("deleteLinkFromFirestore: Chyba při mazání odkazu z Firestore:", error);
        return false;
    }
};

// Funkce pro aktualizaci odkazu ve Firestore (pro budoucí použití)
window.updateLinkInFirestore = async function(linkId, newName, newUrl) {
    if (!db) {
        console.error("updateLinkInFirestore: Firestore databáze není inicializována.");
        return false;
    }
    try {
        await db.collection('links').doc(linkId).update({
            name: newName,
            url: newUrl,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp() // Můžeš přidat čas aktualizace
        });
        console.log(`updateLinkInFirestore: Odkaz s ID "${linkId}" úspěšně aktualizován v Firestore.`);
        return true;
    } catch (error) {
        console.error("updateLinkInFirestore: Chyba při aktualizaci odkazu v Firestore:", error);
        return false;
    }
};
