const fetch = require("node-fetch");

exports.handleBargain = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing");

            return res.status(500).json({
                status: "rejected",
                finalPrice: 0,
                message: "Server configuration error: API key missing."
            });
        }

        const {
            productName,
            storePrice,
            userOffer,
            lang
        } = req.body;


        if (!productName || !storePrice || !userOffer) {
            return res.status(400).json({
                status: "rejected",
                finalPrice: storePrice || 0,
                message: "Missing product information."
            });
        }


        const selectedLanguage =
            lang === "mm"
                ? "Myanmar language"
                : "English";


        const prompt = `
You are NaNb AI Bargaining Assistant.

Store:
NaNb streetwear shop in Mandalay.

Product:
${productName}

Original Store Price:
${storePrice} MMK

Customer Offer:
${userOffer} MMK


Rules:
- Minimum acceptable price is 80% of original price.
- If offer is acceptable, approve.
- If offer is slightly low, give counter offer.
- If offer is too low, reject politely.
- Use MMK currency only.

Reply language:
${selectedLanguage}


IMPORTANT:
Return ONLY JSON.
Do not use markdown.
Do not add explanation.

JSON format:

{
 "status": "approved",
 "finalPrice": 0,
 "message": "friendly customer message"
}
`;


        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.5,
                        maxOutputTokens: 250
                    }
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            console.error(
                "Gemini API Error:",
                JSON.stringify(data)
            );

            return res.status(response.status).json({
                status: "rejected",
                finalPrice: storePrice,
                message:
                    "AI service unavailable. Please try again."
            });
        }


        let aiResponse =
            data.candidates?.[0]
            ?.content
            ?.parts?.[0]
            ?.text;


        if (!aiResponse) {
            throw new Error(
                "Gemini returned empty response"
            );
        }


        aiResponse = aiResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();


        const result = JSON.parse(aiResponse);


        return res.json(result);


    } catch (error) {

        console.error(
            "Gemini Bargain API Error:",
            error.message
        );


        return res.status(500).json({
            status: "rejected",
            finalPrice:
                req.body?.storePrice || 0,

            message:
                req.body?.lang === "mm"
                    ? "AI စနစ်တွင် အမှားရှိနေပါသည်။ ထပ်မံကြိုးစားပါ။"
                    : "AI system error. Please try again."
        });
    }
};
