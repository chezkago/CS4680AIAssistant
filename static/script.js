const pricingForm = document.getElementById("pricing-form");
const results = document.getElementById("results");
const showFormula = document.getElementById("show-formula");
const profitInput = document.getElementById("profit");

const profitOptions = document.querySelectorAll(
    "input[name='use_profit']"
);

function getSelectedProfitOption() {
    return document.querySelector(
        "input[name='use_profit']:checked"
    ).value;
}

profitOptions.forEach((option) => {
    option.addEventListener("change", () => {
        const usingProfit = getSelectedProfitOption() === "yes";

        profitInput.disabled = !usingProfit;

        if (usingProfit) {
            profitInput.value = 20;
        } else {
            profitInput.value = 0;
        }
    });
});

pricingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const animal = document.getElementById("animal").value;
    const color = document.getElementById("color").value;
    const material = document.getElementById("material").value;

    const materialCost = Number(
        document.getElementById("material-cost").value
    );

    const hours = Number(
        document.getElementById("hours").value
    );

    const minutes = Number(
        document.getElementById("minutes").value
    );

    const hourlyWage = Number(
        document.getElementById("hourly-wage").value
    );

    const profitPercentage = Number(profitInput.value);

    const competitor1 = Number(
        document.getElementById("competitor-1").value
    );

    const competitor2 = Number(
        document.getElementById("competitor-2").value
    );

    const competitor3 = Number(
        document.getElementById("competitor-3").value
    );

    const totalHours = hours + minutes / 60;
    const laborCost = totalHours * hourlyWage;
    const baseCost = materialCost + laborCost;

    const recommendedPrice =
        baseCost * (1 + profitPercentage / 100);

    const competitorAverage =
        (competitor1 + competitor2 + competitor3) / 3;

    let formulaHTML = "";

    if (showFormula.checked) {
        formulaHTML = `
            <div class="formula-box">
                <h3>Pricing formula</h3>

                <p>
                    Labor cost =
                    ${totalHours.toFixed(2)} hours ×
                    $${hourlyWage.toFixed(2)} =
                    $${laborCost.toFixed(2)}
                </p>

                <p>
                    Base cost =
                    $${materialCost.toFixed(2)} +
                    $${laborCost.toFixed(2)} =
                    $${baseCost.toFixed(2)}
                </p>

                <p>
                    Recommended price =
                    $${baseCost.toFixed(2)} ×
                    ${1 + profitPercentage / 100} =
                    $${recommendedPrice.toFixed(2)}
                </p>
            </div>
        `;
    }

    results.innerHTML = `
        <h2>Your StitchWorth results</h2>

        <div class="result-grid">
            <div class="result-item">
                <span>Labor cost</span>
                <strong>$${laborCost.toFixed(2)}</strong>
            </div>

            <div class="result-item">
                <span>Base production cost</span>
                <strong>$${baseCost.toFixed(2)}</strong>
            </div>

            <div class="result-item">
                <span>Calculated price</span>
                <strong>$${recommendedPrice.toFixed(2)}</strong>
            </div>

            <div class="result-item">
                <span>Competitor average</span>
                <strong>$${competitorAverage.toFixed(2)}</strong>
            </div>
        </div>

        <div class="ai-section">
            <h3>StitchWorth AI analysis</h3>
            <p id="ai-status">Analyzing your crochet business data...</p>
            <div id="ai-response"></div>
        </div>

        ${formulaHTML}
    `;

    try {
        const response = await fetch("/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                animal: animal,
                color: color,
                material: material,
                material_cost: materialCost,
                hours: hours,
                minutes: minutes,
                hourly_wage: hourlyWage,
                profit_percentage: profitPercentage,
                competitor_1: competitor1,
                competitor_2: competitor2,
                competitor_3: competitor3
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "The AI request failed.");
        }

        document.getElementById("ai-status").textContent =
            "Analysis complete.";

        document.getElementById("ai-response").textContent =
            data.ai_response;

    } catch (error) {
        document.getElementById("ai-status").textContent =
            "The AI analysis could not be completed.";

        document.getElementById("ai-response").textContent =
            error.message;
    }
});