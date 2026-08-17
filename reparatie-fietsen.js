const formulier = document.getElementById("opknap-formulier");

const fietsnaamVeld = document.getElementById("fietsnaam");
const inkoopprijsVeld = document.getElementById("inkoopprijs");
const onderdelenkostenVeld =
    document.getElementById("onderdelenkosten");
const verkoopprijsVeld = document.getElementById("verkoopprijs");
const reparatiesVeld = document.getElementById("reparaties");
const statusVeld = document.getElementById("status");
const fietsenLijst = document.getElementById("fietsen-lijst");

let fietsen =
    JSON.parse(localStorage.getItem("opknapfietsen")) || [];

function bedragLezen(waarde) {
    return Number(waarde.trim().replace(",", "."));
}

function bedragTonen(bedrag) {
    return "€" + bedrag.toFixed(2).replace(".", ",");
}

function fietsenOpslaan() {
    localStorage.setItem(
        "opknapfietsen",
        JSON.stringify(fietsen)
    );
}

function fietsenTonen() {
    fietsenLijst.innerHTML = "";

    if (fietsen.length === 0) {
        const melding = document.createElement("p");
        melding.textContent =
            "Er zijn nog geen opknapfietsen opgeslagen.";

        fietsenLijst.appendChild(melding);
        return;
    }

    fietsen.forEach(function (fiets) {
        const kaart = document.createElement("article");
        kaart.className = "fiets-kaart";

        const inkoopprijs = Number(fiets.inkoopprijs) || 0;
        const onderdelenkosten =
            Number(fiets.onderdelenkosten) || 0;

        let verkoopprijs = null;

        if (
            fiets.verkoopprijs !== null &&
            fiets.verkoopprijs !== undefined &&
            fiets.verkoopprijs !== ""
        ) {
            verkoopprijs = Number(fiets.verkoopprijs);
        }

        const titel = document.createElement("h3");
        titel.textContent = fiets.naam;

        const inkoop = document.createElement("p");
        inkoop.textContent =
            "Inkoopprijs: " + bedragTonen(inkoopprijs);

        const onderdelen = document.createElement("p");
        onderdelen.textContent =
            "Onderdelen: " + bedragTonen(onderdelenkosten);

        const totaleKosten = document.createElement("p");
        totaleKosten.textContent =
            "Totale kosten: " +
            bedragTonen(inkoopprijs + onderdelenkosten);

        const verkoop = document.createElement("p");

        const winst = document.createElement("p");
        winst.className = "winst";

        if (verkoopprijs === null) {
            verkoop.textContent = "Verkoopprijs: nog niet ingevuld";
            winst.textContent = "Winst: nog niet bekend";
        } else {
            const berekendeWinst =
                verkoopprijs - inkoopprijs - onderdelenkosten;

            verkoop.textContent =
                "Verkoopprijs: " + bedragTonen(verkoopprijs);

            winst.textContent =
                "Winst: " + bedragTonen(berekendeWinst);

            if (berekendeWinst >= 0) {
                winst.classList.add("positieve-winst");
            } else {
                winst.classList.add("negatieve-winst");
            }
        }

        const werkzaamheden = document.createElement("p");
        werkzaamheden.textContent =
            "Werkzaamheden: " +
            (fiets.reparaties || "Nog niet ingevuld");

        const status = document.createElement("p");
        status.textContent =
            "Status: " + (fiets.status || "Gekocht");

        const verwijderKnop = document.createElement("button");
        verwijderKnop.textContent = "Verwijderen";
        verwijderKnop.className = "verwijder-knop";

        verwijderKnop.addEventListener("click", function () {
            fietsen = fietsen.filter(function (opgeslagenFiets) {
                return opgeslagenFiets.id !== fiets.id;
            });

            fietsenOpslaan();
            fietsenTonen();
        });

        kaart.append(
            titel,
            inkoop,
            onderdelen,
            totaleKosten,
            verkoop,
            winst,
            werkzaamheden,
            status,
            verwijderKnop
        );

        fietsenLijst.appendChild(kaart);
    });
}

formulier.addEventListener("submit", function (gebeurtenis) {
    gebeurtenis.preventDefault();

    const naam = fietsnaamVeld.value.trim();
    const reparaties = reparatiesVeld.value.trim();

    const inkoopprijs = bedragLezen(inkoopprijsVeld.value);
    const onderdelenkosten =
        bedragLezen(onderdelenkostenVeld.value);

    let verkoopprijs = null;

    if (verkoopprijsVeld.value.trim() !== "") {
        verkoopprijs = bedragLezen(verkoopprijsVeld.value);
    }

    if (naam === "") {
        alert("Vul een naam voor de fiets in.");
        return;
    }

    if (
        Number.isNaN(inkoopprijs) ||
        Number.isNaN(onderdelenkosten)
    ) {
        alert("Controleer de inkoopprijs en onderdelenkosten.");
        return;
    }

    if (
        verkoopprijs !== null &&
        Number.isNaN(verkoopprijs)
    ) {
        alert("Controleer de verkoopprijs.");
        return;
    }

    const nieuweFiets = {
        id: Date.now(),
        naam: naam,
        inkoopprijs: inkoopprijs,
        onderdelenkosten: onderdelenkosten,
        verkoopprijs: verkoopprijs,
        reparaties: reparaties || "Nog niet ingevuld",
        status: statusVeld.value
    };

    fietsen.push(nieuweFiets);

    fietsenOpslaan();
    fietsenTonen();
    formulier.reset();

    alert("De opknapfiets is opgeslagen!");
});

fietsenTonen();
