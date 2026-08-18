const formulier = document.getElementById("reparatie-formulier");
const fietsnaamVeld = document.getElementById("fietsnaam");
const eigenaarVeld = document.getElementById("eigenaar");
const reparatiesVeld = document.getElementById("reparaties");
const kostenVeld = document.getElementById("kosten");
const ontvangenVeld = document.getElementById("ontvangen");
const statusVeld = document.getElementById("status");
const spaarpotVeld = document.getElementById("spaarpotje");
const fietsenLijst = document.getElementById("reparatie-lijst");
let fietsen = JSON.parse(localStorage.getItem("reparatiefietsen-v1")) || [];

function bedragLezen(waarde) { return Number(waarde.trim().replace(",", ".")); }
function bedragTonen(bedrag) { return "€" + Number(bedrag || 0).toFixed(2).replace(".", ","); }
function fietsenOpslaan() { localStorage.setItem("reparatiefietsen-v1", JSON.stringify(fietsen)); }
function resultaatReparatie(fiets) {
    if (fiets.ontvangenBedrag === null || fiets.ontvangenBedrag === undefined || fiets.ontvangenBedrag === "") return null;
    return Number(fiets.ontvangenBedrag || 0) - Number(fiets.kosten || 0);
}

function takenVanFiets(fiets) {
    if (Array.isArray(fiets.taken)) return fiets.taken;
    const oudeTekst = fiets.reparaties && fiets.reparaties !== "Nog niet ingevuld" ? fiets.reparaties : "";
    fiets.taken = oudeTekst.split(/\r?\n/).map(function (tekst) { return tekst.trim(); }).filter(Boolean).map(function (tekst) { return { tekst, klaar: false }; });
    return fiets.taken;
}

function checklistToevoegen(kaart, fiets) {
    const taken = takenVanFiets(fiets);
    const checklist = document.createElement("div");
    checklist.className = "checklist";
    const kop = document.createElement("h4");
    kop.textContent = "✅ Reparatiechecklist";
    checklist.appendChild(kop);
    if (taken.length === 0) {
        const leeg = document.createElement("p");
        leeg.textContent = "Geen taken opgegeven.";
        checklist.appendChild(leeg);
    }
    taken.forEach(function (taak, index) {
        const regel = document.createElement("label");
        regel.className = "checklist-item" + (taak.klaar ? " klaar" : "");
        const vinkje = document.createElement("input");
        vinkje.type = "checkbox";
        vinkje.checked = Boolean(taak.klaar);
        const tekst = document.createElement("span");
        tekst.textContent = taak.tekst;
        vinkje.addEventListener("change", function () {
            fiets.taken[index].klaar = vinkje.checked;
            fietsenOpslaan();
            fietsenTonen();
        });
        regel.append(vinkje, tekst);
        checklist.appendChild(regel);
    });
    if (taken.length > 0) {
        const klaar = taken.filter(function (taak) { return taak.klaar; }).length;
        const voortgang = document.createElement("p");
        voortgang.className = "checklist-voortgang";
        voortgang.textContent = klaar + " van " + taken.length + " taken klaar";
        checklist.appendChild(voortgang);
    }
    kaart.appendChild(checklist);
}

function financieelOverzichtBijwerken() {
    let kosten = 0, omzet = 0, winst = 0, verlies = 0;
    fietsen.forEach(function (fiets) {
        kosten += Number(fiets.kosten || 0);
        const resultaat = resultaatReparatie(fiets);
        if (resultaat !== null) {
            omzet += Number(fiets.ontvangenBedrag || 0);
            if (resultaat >= 0) winst += resultaat;
            else verlies += Math.abs(resultaat);
        }
    });
    document.getElementById("totale-reparatiekosten").textContent = bedragTonen(kosten);
    document.getElementById("totale-reparatieomzet").textContent = bedragTonen(omzet);
    document.getElementById("totale-reparatiewinst").textContent = bedragTonen(winst);
    document.getElementById("totale-reparatieverlies").textContent = bedragTonen(verlies);
}

function spaarpottenBerekenen() {
    const potten = { Onderdelen: 0, Gereedschap: 0, "Vrij geld": 0 };
    const opknapfietsen = JSON.parse(localStorage.getItem("opknapfietsen")) || [];
    opknapfietsen.forEach(function (fiets) {
        if (fiets.verkoopprijs === null || fiets.verkoopprijs === undefined || fiets.verkoopprijs === "") return;
        const winst = Number(fiets.verkoopprijs || 0) - Number(fiets.inkoopprijs || 0) - Number(fiets.onderdelenkosten || 0);
        if (winst > 0) potten[fiets.spaarpotje || "Vrij geld"] += winst;
    });
    fietsen.forEach(function (fiets) {
        const winst = resultaatReparatie(fiets);
        if (winst !== null && winst > 0) potten[fiets.spaarpotje || "Vrij geld"] += winst;
    });
    document.getElementById("pot-onderdelen").textContent = bedragTonen(potten.Onderdelen);
    document.getElementById("pot-gereedschap").textContent = bedragTonen(potten.Gereedschap);
    document.getElementById("pot-vrij-geld").textContent = bedragTonen(potten["Vrij geld"]);
}

function fietsenTonen() {
    fietsenLijst.innerHTML = "";
    financieelOverzichtBijwerken(); spaarpottenBerekenen();
    if (fietsen.length === 0) {
        const melding = document.createElement("p");
        melding.textContent = "Er zijn nog geen reparatiefietsen opgeslagen.";
        fietsenLijst.appendChild(melding);
        return;
    }
    fietsen.forEach(function (fiets) {
        const kaart = document.createElement("article");
        kaart.className = "fiets-kaart";
        const resultaat = resultaatReparatie(fiets);
        const titel = document.createElement("h3");
        titel.textContent = fiets.naam;
        kaart.appendChild(titel);
        const details = [
            "Eigenaar: " + fiets.eigenaar,
            "Onderdelenkosten: " + bedragTonen(fiets.kosten),
            resultaat === null ? "Ontvangen: nog niet ingevuld" : "Ontvangen: " + bedragTonen(fiets.ontvangenBedrag),
            resultaat === null ? "Winst: nog niet bekend" : (resultaat >= 0 ? "Winst: " : "Verlies: ") + bedragTonen(Math.abs(resultaat)),
            "Spaarpotje: " + (fiets.spaarpotje || "Vrij geld"),
            "Status: " + fiets.status
        ];
        details.forEach(function (tekst, index) {
            const regel = document.createElement("p");
            regel.textContent = tekst;
            if (index === 3 && resultaat !== null) regel.className = resultaat >= 0 ? "positieve-winst" : "negatieve-winst";
            kaart.appendChild(regel);
        });
        checklistToevoegen(kaart, fiets);
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
    const eigenaar = eigenaarVeld.value.trim();
    const kosten = bedragLezen(kostenVeld.value);
    const ontvangenBedrag = bedragLezen(ontvangenVeld.value);
    if (!naam || !eigenaar) return alert("Vul de fiets en een voornaam of bijnaam in.");
    if (Number.isNaN(kosten) || Number.isNaN(ontvangenBedrag)) return alert("Controleer de kosten en het ontvangen bedrag.");
    const taken = reparatiesVeld.value.split(/\r?\n/).map(function (tekst) { return tekst.trim(); }).filter(Boolean).map(function (tekst) { return { tekst, klaar: false }; });
    fietsen.push({ id: Date.now(), naam, eigenaar, reparaties: reparatiesVeld.value.trim() || "Nog niet ingevuld", taken, kosten, ontvangenBedrag, status: statusVeld.value, spaarpotje: spaarpotVeld.value });
    fietsenOpslaan(); fietsenTonen(); formulier.reset();
    alert("De reparatiefiets is opgeslagen!");
});

fietsenTonen();
