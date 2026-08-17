const formulier = document.getElementById("opknap-formulier");
const fietsnaamVeld = document.getElementById("fietsnaam");
const inkoopprijsVeld = document.getElementById("inkoopprijs");
const reparatiesVeld = document.getElementById("reparaties");
const statusVeld = document.getElementById("status");
const fietsenLijst = document.getElementById("fietsen-lijst");

let fietsen = JSON.parse(localStorage.getItem("opknapfietsen")) || [];

function fietsenOpslaan() {
    localStorage.setItem("opknapfietsen", JSON.stringify(fietsen));
}

function fietsenTonen() {
    fietsenLijst.innerHTML = "";

    if (fietsen.length === 0) {
        const melding = document.createElement("p");
        melding.textContent = "Er zijn nog geen opknapfietsen opgeslagen.";
        fietsenLijst.appendChild(melding);
        return;
    }

    fietsen.forEach(function (fiets) {
        const kaart = document.createElement("article");
        kaart.className = "fiets-kaart";

        const titel = document.createElement("h3");
        titel.textContent = fiets.naam;

        const prijs = document.createElement("p");
        prijs.textContent =
            "Inkoopprijs: €" + fiets.inkoopprijs.toFixed(2).replace(".", ",");

        const werkzaamheden = document.createElement("p");
        werkzaamheden.textContent =
            "Werkzaamheden: " + fiets.reparaties;

        const status = document.createElement("p");
        status.textContent = "Status: " + fiets.status;

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
            prijs,
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
    const prijsTekst = inkoopprijsVeld.value.trim().replace(",", ".");
    const inkoopprijs = Number(prijsTekst);
    const reparaties = reparatiesVeld.value.trim();

    if (naam === "") {
        alert("Vul een naam voor de fiets in.");
        return;
    }

    if (prijsTekst === "" || Number.isNaN(inkoopprijs)) {
        alert("Vul een geldige inkoopprijs in.");
        return;
    }

    const nieuweFiets = {
        id: Date.now(),
        naam: naam,
        inkoopprijs: inkoopprijs,
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
