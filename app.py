import os

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from groq import Groq

load_dotenv()

app = Flask(__name__)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY was not found in the .env file.")

client = Groq(api_key=api_key)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    animal = data["animal"]
    color = data["color"]
    material = data["material"]

    material_cost = float(data["material_cost"])
    hours = float(data["hours"])
    minutes = float(data["minutes"])
    hourly_wage = float(data["hourly_wage"])
    profit_percentage = float(data["profit_percentage"])

    competitor_1 = float(data["competitor_1"])
    competitor_2 = float(data["competitor_2"])
    competitor_3 = float(data["competitor_3"])

    total_hours = hours + minutes / 60
    labor_cost = total_hours * hourly_wage
    base_cost = material_cost + labor_cost

    recommended_price = base_cost * (
        1 + profit_percentage / 100
    )

    competitor_average = (
        competitor_1 + competitor_2 + competitor_3
    ) / 3

    prompt = f"""
You are StitchWorth, a concise and professional pricing consultant
for handmade crochet businesses.

Help sellers price amigurumi animals using material cost, labor cost,
profit percentage, and competitor prices. Give practical advice in
simple language.

Few-shot example:

Input:
Product: Crochet bear
Base cost: $30.00
Calculated price: $36.00
Competitor average: $32.00

Output:
Recommended Price Range: $35.00-$40.00
Competitor Comparison: The calculated price is close to the competitor average.
Pricing Explanation: The price covers production costs and includes a 20% profit.
Product Description: A short two-sentence product description.
Business Suggestion: One practical suggestion.

Now analyze this product:

Product: Crochet {animal}
Color: {color}
Material: {material}
Material cost: ${material_cost:.2f}
Labor cost: ${labor_cost:.2f}
Base production cost: ${base_cost:.2f}
Profit percentage: {profit_percentage:.2f}%
Calculated price: ${recommended_price:.2f}
Competitor prices: ${competitor_1:.2f}, ${competitor_2:.2f}, ${competitor_3:.2f}
Competitor average: ${competitor_average:.2f}

Return exactly these five sections:

Recommended Price Range:
Competitor Comparison:
Pricing Explanation:
Product Description:
Business Suggestion:

Rules:
- Keep the entire response under 150 words.
- Use plain text only.
- Do not use asterisks, Markdown, tables, or long lists.
- Use no more than two sentences per section.
- Make the product description exactly two sentences.
- Give only one business suggestion.
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4
        )

        return jsonify({
            "ai_response": response.choices[0].message.content,
            "labor_cost": labor_cost,
            "base_cost": base_cost,
            "recommended_price": recommended_price,
            "competitor_average": competitor_average
        })

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)