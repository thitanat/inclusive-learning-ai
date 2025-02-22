import { NextResponse } from 'next/server';
import axios from 'axios';
import { classifyUserRequest } from './classifyRequest';

export async function POST(req) {
    try {
        const { prompt } = await req.json();

        if (!prompt || prompt.trim() === "") {
            return NextResponse.json({ error: "Prompt cannot be empty.", type: "error" }, { status: 400 });
        }

        // Step 1: Classify request
        const responseType = await classifyUserRequest(prompt);
        const isJsonRequest = responseType === "json";

        console.log(`Classification Result: ${responseType}`);
        
        // Step 2: Generate response
        const responsePrompt = `You are Eva, a helpful assistant. Always introduce yourself as Eva. 
                                Respond in ${isJsonRequest ? "JSON" : "plain text"} format. 
                                User input: "${prompt}"`;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: responsePrompt }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const messageContent = response.data.choices[0].message.content;

        if (isJsonRequest) {
            try {
                const jsonResponse = JSON.parse(messageContent);
                return NextResponse.json({ type: "json", response: jsonResponse }, { status: 200 });
            } catch (error) {
                console.error("Invalid JSON response from OpenAI:", messageContent);
                return NextResponse.json({
                    error: "OpenAI returned an invalid JSON response.",
                    type: "error",
                    rawResponse: messageContent
                }, { status: 500 });
            }
        }

        return NextResponse.json({ type: "text", response: messageContent }, { status: 200 });

    } catch (error) {
        console.error('Error with OpenAI API:', error.message);
        return NextResponse.json({
            error: 'Failed to fetch response from OpenAI',
            details: error.message,
            type: "error"
        }, { status: 500 });
    }
}
