// links.js

// Zde bude tvé pole s počátečními odkazy.
// DŮLEŽITÉ: PŘEDTÍM, NEŽ TOTO POUŽIJEŠ, MUSÍŠ RUČNĚ PŘEPSAT VŠECHNY 'file:///' ODKAZY NA FUNKČNÍ HTTPS URL,
// JINAK BUDOU IMPORTovány NEFUNKČNÍ ODKAZY DO FIREBASE!
const initialLinks = [
    { name: 'Starfleet Command', url: 'https://www.startrek.com' },
    { name: 'Vincentka Sirup', url: 'https://www.benu.cz/vincentka-sirup-s-jitrocelem-a-materidouskou-200ml' },
    { name: 'Star Trek Universe', url: 'https://jirka22med.github.io/star-trek-universe/' },
    { name: 'QR Kód Generátor', url: 'https://jirka22med.github.io/qr-kod-generato-novy/' },
    { name: 'ST Hudební přehrávač (mobil)', url: 'https://jirka22med.github.io/Star-Trek-audio-prehravac-novy-2/' },
    { name: 'ST Hudební přehrávač v.2.1', url: 'https://jirka22med.github.io/Star-Trek-Hudebni-prehravac/' },
    { name: 'Star Trek Hudební Přehravač 3', url: 'https://jirka22med.github.io/-jirka22med-star-trek-audio-player-v.3/' },
    { name: 'Můj osobní web (Genesis)', url: 'https://jirka22med.github.io/jirikuv-projekt-genesis/index.html' },
    { name: 'Pokročilý váhový tracker', url: 'https://jirka22med.github.io/moje-vaha-log-beta-2/' },
    { name: 'Jirkův váhový tracker', url: 'https://jirka22med.github.io/jirikuv-vahovy-tracker/' },
    { name: 'audio prehravac test', url: 'https://jirka22med.github.io/-jirka22med-star-trek-audio-player-v.3/' }, // Duplicitní URL, ale OK, pokud to tak chceš
    { name: 'prehravac', url: 'https://jirka22med.github.io/star-trek-hudebni-prehravac-2/' }, // Duplicitní URL, ale OK, pokud to tak chceš
    { name: 'firebase-synced-player', url: 'https://jirka22med.github.io/firebase-synced-player/' },
    { name: 'Star Trek: Kapitoly', url: 'https://jirka22med.github.io/Pribehy-posadek-Enerprise/' },
    { name: 'Můj osobní web', url: 'https://jirka22med.github.io/muj-osobni-web/' },
    { name: 'Example Link 8', url: 'https://example.com/link8' }, 
    { name: 'Example Link 9', url: 'https://example.com/link9' },
    { name: 'Example Link 10', url: 'https://example.com/link10' },
    { name: 'Example Link 11', url: 'https://example.com/link11' },
    { name: 'Example Link 12', url: 'https://example.com/link12' },
    { name: 'Example Link 13', url: 'https://example.com/link13' },
    { name: 'Example Link 14', url: 'https://example.com/link14' },
    { name: 'Example Link 15', url: 'https://example.com/link15' },
    { name: 'Example Link 16', url: 'https://example.com/link16' },
    { name: 'Example Link 17', url: 'https://example.com/link17' },
    { name: 'Example Link 18', url: 'https://example.com/link18' },
];


// Získání odkazů na HTML elementy
const linksTableBody = document.getElementById('linksTableBody');
const addLinkButton = document.getElementById('addLinkButton');
const linkNameInput = document.getElementById('linkName');
const linkUrlInput = document.getElementById('linkUrl');
const syncStatusMessageElement = document.getElementById('syncStatusMessage');

// Funkce pro zobrazení/skrytí zprávy o synchronizaci
function toggleSyncMessage(show) {
    if (syncStatusMessageElement) {
        syncStatusMessageElement.style.display = show ? 'block' : 'none';
    }
}

// Funkce pro dynamické plnění tabulky
function populateLinksTable(links) {
    linksTableBody.innerHTML = ''; 

    if (links.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `<td colspan="4" style="text-align: center; color: #888;">Žádné odkazy v Hvězdné databázi.</td>`;
        linksTableBody.appendChild(noDataRow);
        return;
    }

    links.forEach((link, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${link.name}</td>
            <td><a href="${link.url}" target="_blank" title="${link.url}">${link.url.length > 50 ? link.url.substring(0, 47) + '...' : link.url}</a></td>
            <td>
                <div class="action-buttons">
                    <button class="delete-link-button" data-id="${link.id}">🗑️</button>
                </div>
            </td>
        `;
        linksTableBody.appendChild(row);

        row.querySelector('.delete-link-button').addEventListener('click', async (e) => {
            const linkIdToDelete = e.target.dataset.id;
            if (confirm('Opravdu chcete smazat tento odkaz z Hvězdné databáze? Tato akce je nevratná.')) {
                toggleSyncMessage(true); 
                const success = await window.deleteLinkFromFirestore(linkIdToDelete);
                if (success) {
                    await loadAndDisplayLinks(); 
                } else {
                    alert('Chyba při mazání odkazu. Zkuste to prosím znovu.');
                }
                toggleSyncMessage(false); 
            }
        });
    });
}

// NOVÁ FUNKCE: Jednorázový import počátečních odkazů do Firebase
async function importInitialLinksToFirebase() {
    console.log("links.js: Detekována prázdná databáze. Spouštím import počátečních odkazů.");
    toggleSyncMessage(true);
    let successCount = 0;
    for (const link of initialLinks) {
        const success = await window.addLinkToFirestore(link.name, link.url);
        if (success) {
            successCount++;
        } else {
            console.error(`links.js: Chyba při importu odkazu: ${link.name}`);
        }
    }
    console.log(`links.js: Import dokončen. Úspěšně importováno ${successCount} z ${initialLinks.length} odkazů.`);
    toggleSyncMessage(false);
    // Po importu znovu načteme a zobrazíme odkazy (už z Firebase)
    await loadAndDisplayLinks(); 
}


// Funkce pro načtení a zobrazení odkazů
async function loadAndDisplayLinks() {
    toggleSyncMessage(true); 

    const firebaseInitialized = await window.initializeFirebaseLinksApp();
    if (!firebaseInitialized) {
        console.error("Chyba: Firebase pro odkazy nebylo inicializováno.");
        linksTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #dc3545;">Chyba: Nelze se připojit k databázi odkazů. Zkontrolujte připojení a Firebase konzoli.</td></tr>';
        toggleSyncMessage(false); 
        return;
    }

    let links = await window.getLinksFromFirestore();
    
    // ZDE JE TA LOGIKA "POČÁTEČNÍHO OSIVA"
    if (links.length === 0 && initialLinks.length > 0) {
        console.log("links.js: Firebase databáze odkazů je prázdná, ale initialLinks obsahuje data.");
        // Pouze pokud v Firebase nic není A máme nějaké počáteční odkazy
        await importInitialLinksToFirebase();
        // Po importu znovu načteme odkazy, tentokrát už z Firebase
        links = await window.getLinksFromFirestore();
    }

    populateLinksTable(links);
    
    toggleSyncMessage(false); 
}

// Obsluha přidání odkazu
if (addLinkButton) {
    addLinkButton.addEventListener('click', async () => {
        const linkName = linkNameInput.value.trim();
        const linkUrl = linkUrlInput.value.trim();

        if (linkName && linkUrl) {
            toggleSyncMessage(true); 
            const success = await window.addLinkToFirestore(linkName, linkUrl);
            if (success) {
                linkNameInput.value = ''; 
                linkUrlInput.value = '';
                await loadAndDisplayLinks(); 
            } else {
                alert('Chyba při přidávání odkazu. Zkuste to prosím znovu.');
            }
            toggleSyncMessage(false); 
        } else {
            alert('Prosím, zadejte název i URL odkazu.');
        }
    });
}

// Inicializace: Načtení a zobrazení odkazů při načtení stránky
document.addEventListener('DOMContentLoaded', loadAndDisplayLinks);
