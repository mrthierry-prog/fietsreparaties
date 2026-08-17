const formulier = document.getElementById("reparatie-formulier");
const fietsnaamVeld = document.getElementById("fietsnaam");
const eigenaarVeld = document.getElementById("eigenaar");
const reparatiesVeld = document.getElementById("reparaties");
const kostenVeld = document.getElementById("kosten");
const statusVeld = document.getElementById("status");
const fietsenLijst = document.getElementById("reparatie-lijst");

let fietsen =
    JSON.parse(localStorage.getItem("reparatiefietsen-v1")) || [];

function fietsenOpslaan() {
    localStorage.setItem(
        "reparatiefietsen-v1",
        JSON.stringify(fietsen)
    );
}

function fietsenTonen() {
    fietsenLijst.innerHTML = "";

    if (fietsen.length === 0) {
        const melding = document.createElement("p");
        melding.textContent =
            "Er zijn nog geen reparatiefietsen opgeslagen.";

        fietsenLijst.appendChild(melding);
        return;
    }

    fietsen.forEach(function (fiets) {
        const kaart = document.createElement("article");
        kaart.className = "fiets-kaart";

        const titel = document.createElement("h3");
        titel.textContent = fiets.naam;

        const eigenaar = document.createElement("p");
        eigenaar.textContent = "Eigenaar: " + fiets.eigenaar;

        const reparaties = document.createElement("p");
        reparaties.textContent =
            "Reparatie: " + fiets.reparaties;

        const kosten = document.createElement("p");
        kosten.textContent =
            "Onderdelen: €" +
            fiets.kosten.toFixed(2).replace(".", ",");

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
            eigenaar,
            reparaties,
            kosten,
            status,
            verwijderKnop
        );

        fietsenLijst.appendChild(kaart);
    });
}

formulier.addEventListener("submit", function (gebeurtenis) {
    gebeurtenis.preventDefault();

    const naam = fietsnaamVeld.value.trim();
    const eigenaar = eigenaarVeld.value.trim();
    const reparaties = reparatiesVeld.value.trim();
    const kostenTekst = kostenVeld.value.trim().replace(",", ".");
    const kosten = Number(kostenTekst);

    if (naam === "" || eigenaar === "") {
        alert("Vul de fiets en een voornaam of bijnaam in.");
        return;
    }

    if (kostenTekst === "" || Number.isNaN(kosten)) {
        alert("Vul geldige kosten in.");
        return;
    }

    const nieuweFiets = {
        id: Date.now(),
        naam: naam,
        eigenaar: eigenaar,
        reparaties: reparaties || "Nog niet ingevuld",
        kosten: kosten,
        status: statusVeld.value
    };

    fietsen.push(nieuweFiets);
    fietsenOpslaan();
    fietsenTonen();
    formulier.reset();

    alert("De reparatiefiets is opgeslagen!");
});

fietsenTonen();
