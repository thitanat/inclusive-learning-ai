import axios from 'axios';

export async function classifyUserRequest(prompt) {
    const classificationPrompt = `
        Classify the following user request into one of two categories: "json" or "text".
        - If the user is asking for structured data or JSON output, return "json".
        - If the user is just asking a normal question, return "text".
        Only return "json" or "text" as output. 
        User request: "${prompt}"`;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: classificationPrompt }],
                max_tokens: 5
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
        console.error("Error classifying request:", error.message);
        return "text"; // Default fallback
    }
}
