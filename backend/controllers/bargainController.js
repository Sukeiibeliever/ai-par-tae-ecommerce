exports.handleBargain = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing");
            return res.status(500).json({ 
                status: "rejected", 
                finalPrice: 0, 
                message: "Server environment error: API Key missing." 
            });
        }

        const { productName, storePrice, userOffer, lang } = req.body;

        const systemPrompt = `
You are an intelligent AI bargaining assistant for a streetwear store in Mandalay named 'NaNb'.

EXCHANGE RATE & CURRENCY RULE:
- Strict Exchange Rate: Always use 1 USD = 4500 MMK for any currency conversions. Ignore official bank rates.

TASK:
1. Search and estimate the current online/resell market price for '${productName}' in USD or MMK.
2. Convert any USD market prices to MMK using EXACTLY 1 USD = 4500 MMK.
3. Compare Our Store Price (${storePrice} MMK) with this calculated market value.
4. Evaluate Customer Offer (${userOffer} MMK):
   - If Customer Offer is reasonable relative to the item value, APPROVE it.
   - If Customer Offer is moderately lower, propose a COUNTER OFFER.
   - If Customer Offer is far too low, REJECT it politely.

CRITICAL INSTRUCTION:
Your entire response MUST be a valid, raw JSON object ONLY. Do NOT wrap in markdown, codeblocks (\`\`\`json), or extra text.

JSON Schema:
{
  "status": "approved" | "counter" | "rejected",
  "finalPrice": number,
  "message": "Friendly response mentioning live market price context using 1 USD = 4500 MMK in ${lang === 'mm' ? 'Myanmar Language' : 'English'}"
}
`;

        // 503 တက်ပါက သုံးမည့် Fallback models များ
        const modelsToTry = ["gemini-2.5-flash-lite"];
        let data = null;
        let lastError = null;

        for (const modelName of modelsToTry) {
            // 503 တက်ရင် ခဏစောင့်ပြီး 2 ကြိမ်အထိ အော်တို Retry လုပ်မည့် logic
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
        contents: [
            {
                parts: [
                    {
                        text: systemPrompt
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 250
        }
    })
});

                    data = await response.json();
                    
                    if (response.ok) {
                        lastError = null;
                        break;
                    }

                    lastError = data.error?.message || `Status: ${response.status}`;
                    console.warn(`[Attempt ${attempt}] Model ${modelName} returned ${response.status}. Retrying...`);
                    
                    // 503 ဆိုရင် 1 စက္ကန့် စောင့်ပြီးမှ ပြန်ခေါ်မည်
                    if (response.status === 503) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        break; // 404, 400 စသည့် အခြား error ဆိုလျှင် စောင့်မနေဘဲ နောက် model သို့ ကူးမည်
                    }
                } catch (err) {
                    lastError = err.message;
                }
            }

            if (data && data.candidates) break;
        }

        if (!data || !data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error(lastError || "All available Gemini models are currently overloaded.");
        }

        let responseText = data.candidates[0].content.parts[0].text.trim();
        responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        
        const decision = JSON.parse(responseText);
        return res.json(decision);

    } catch (error) {
        console.error("Gemini Bargain API Error:", error.message || error);
        return res.status(500).json({ 
            status: "rejected", 
            finalPrice: 0, 
            message: req.body?.lang === 'mm' 
                ? "အင်တာနက် စျေးနှုန်း စစ်ဆေးရာတွင် အမှားအယွင်းရှိပါသဖြင့် ပြန်လည် စမ်းသပ်ပါ။" 
                : "Error checking live market prices. Please try again." 
        });
    }
};
