const formulier = document.getElementById("opknap-formulier");
const fietsnaamVeld = document.getElementById("fietsnaam");
const inkoopprijsVeld = document.getElementById("inkoopprijs");
const onderdelenkostenVeld = document.getElementById("onderdelenkosten");
const verkoopprijsVeld = document.getElementById("verkoopprijs");
const reparatiesVeld = document.getElementById("reparaties");
const statusVeld = document.getElementById("status");
const spaarpotVeld = document.getElementById("spaarpotje");
const fietsenLijst = document.getElementById("fietsen-lijst");
let fietsen = JSON.parse(localStorage.getItem("opknapfietsen")) || [];

function bedragLezen(waarde) { return Number(waarde.trim().replace(",", ".")); }
function bedragTonen(bedrag) { return "€" + Number(bedrag || 0).toFixed(2).replace(".", ","); }
function fietsenOpslaan() { localStorage.setItem("opknapfietsen", JSON.stringify(fietsen)); }

function winstOpknapfiets(fiets) {
    if (fiets.verkoopprijs === null || fiets.verkoopprijs === undefined || fiets.verkoopprijs === "") return null;
    return Number(fiets.verkoopprijs || 0) - Number(fiets.inkoopprijs || 0) - Number(fiets.onderdelenkosten || 0);
}

function spaarpottenBerekenen() {
    const potten = { Onderdelen: 0, Gereedschap: 0, "Vrij geld": 0 };
    fietsen.forEach(function (fiets) {
        const winst = winstOpknapfiets(fiets);
        if (winst !== null && winst > 0) potten[fiets.spaarpotje || "Vrij geld"] += winst;
    });
    const reparatiefietsen = JSON.parse(localStorage.getItem("reparatiefietsen-v1")) || [];
    reparatiefietsen.forEach(function (fiets) {
        if (fiets.ontvangenBedrag === null || fiets.ontvangenBedrag === undefined || fiets.ontvangenBedrag === "") return;
        const winst = Number(fiets.ontvangenBedrag || 0) - Number(fiets.kosten || 0);
        if (winst > 0) potten[fiets.spaarpotje || "Vrij geld"] += winst;
    });
    document.getElementById("pot-onderdelen").textContent = bedragTonen(potten.Onderdelen);
    document.getElementById("pot-gereedschap").textContent = bedragTonen(potten.Gereedschap);
    document.getElementById("pot-vrij-geld").textContent = bedragTonen(potten["Vrij geld"]);
}

function financieelOverzichtBijwerken() {
    let totaleKosten = 0, totaleOmzet = 0, totaleWinst = 0, totaleVerlies = 0;
    fietsen.forEach(function (fiets) {
        const kosten = Number(fiets.inkoopprijs || 0) + Number(fiets.onderdelenkosten || 0);
        totaleKosten += kosten;
        const resultaat = winstOpknapfiets(fiets);
        if (resultaat !== null) {
            totaleOmzet += Number(fiets.verkoopprijs || 0);
            if (resultaat >= 0) totaleWinst += resultaat;
            else totaleVerlies += Math.abs(resultaat);
        }
    });
    document.getElementById("totale-kosten").textContent = bedragTonen(totaleKosten);
    document.getElementById("totale-omzet").textContent = bedragTonen(totaleOmzet);
    document.getElementById("totale-winst").textContent = bedragTonen(totaleWinst);
    document.getElementById("totale-verlies").textContent = bedragTonen(totaleVerlies);
}

function fietsenTonen() {
    fietsenLijst.innerHTML = "";
    financieelOverzichtBijwerken();
    spaarpottenBerekenen();
    if (fietsen.length === 0) {
        const melding = document.createElement("p");
        melding.textContent = "Er zijn nog geen opknapfietsen opgeslagen.";
        fietsenLijst.appendChild(melding);
        return;
    }
    fietsen.forEach(function (fiets) {
        const kaart = document.createElement("article");
        kaart.className = "fiets-kaart";
        const kosten = Number(fiets.inkoopprijs || 0) + Number(fiets.onderdelenkosten || 0);
        const resultaat = winstOpknapfiets(fiets);
        const titel = document.createElement("h3");
        titel.textContent = fiets.naam;
        kaart.appendChild(titel);
        const details = [
            "Inkoopprijs: " + bedragTonen(fiets.inkoopprijs),
            "Onderdelen: " + bedragTonen(fiets.onderdelenkosten),
            "Totale kosten: " + bedragTonen(kosten),
            resultaat === null ? "Verkoopprijs: nog niet ingevuld" : "Verkoopprijs: " + bedragTonen(fiets.verkoopprijs),
            resultaat === null ? "Winst: nog niet bekend" : (resultaat >= 0 ? "Winst: " : "Verlies: ") + bedragTonen(Math.abs(resultaat)),
            "Spaarpotje: " + (fiets.spaarpotje || "Vrij geld"),
            "Werkzaamheden: " + (fiets.reparaties || "Nog niet ingevuld"),
            "Status: " + (fiets.status || "Gekocht")
        ];
        details.forEach(function (tekst, index) {
            const regel = document.createElement("p");
            regel.textContent = tekst;
            if (index === 4 && resultaat !== null) regel.className = resultaat >= 0 ? "positieve-winst" : "negatieve-winst";
            kaart.appendChild(regel);
        });
        const verwijderKnop = document.createElement("button");
        verwijderKnop.textContent = "Verwijderen";
        verwijderKnop.className = "verwijder-knop";
        verwijderKnop.addEventListener("click", function () {
            fietsen = fietsen.filter(function (opgeslagenFiets) { return opgeslagenFiets.id !== fiets.id; });
            fietsenOpslaan(); fietsenTonen();
        });
        kaart.appendChild(verwijderKnop);
        fietsenLijst.appendChild(kaart);
    });
}

formulier.addEventListener("submit", function (gebeurtenis) {
    gebeurtenis.preventDefault();
    const naam = fietsnaamVeld.value.trim();
    const inkoopprijs = bedragLezen(inkoopprijsVeld.value);
    const onderdelenkosten = bedragLezen(onderdelenkostenVeld.value);
    let verkoopprijs = null;
    if (verkoopprijsVeld.value.trim() !== "") verkoopprijs = bedragLezen(verkoopprijsVeld.value);
    if (!naam) return alert("Vul een naam voor de fiets in.");
    if (Number.isNaN(inkoopprijs) || Number.isNaN(onderdelenkosten)) return alert("Controleer de inkoopprijs en onderdelenkosten.");
    if (verkoopprijs !== null && Number.isNaN(verkoopprijs)) return alert("Controleer de verkoopprijs.");
    fietsen.push({ id: Date.now(), naam, inkoopprijs, onderdelenkosten, verkoopprijs, reparaties: reparatiesVeld.value.trim() || "Nog niet ingevuld", status: statusVeld.value, spaarpotje: spaarpotVeld.value });
    fietsenOpslaan(); fietsenTonen(); formulier.reset();
    alert("De opknapfiets is opgeslagen!");
});

fietsenTonen();
