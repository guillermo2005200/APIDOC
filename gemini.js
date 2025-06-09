const axios = require('axios');

const GEMINI_API_KEY = 'AIzaSyA_lAL4Owfaivy4vSnGHe2PycdmiJu9QhE';

async function llamarGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const data = {
        contents: [
            {
                
                 parts: [
                { text: "Eres Ingeniero de software senior y tienes que realizar una documentación detallada sobre este código, indicando recomendaciones y cada parte del mismo." },
                { text: prompt }
            ]
            }
        ]
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // El resultado está aquí
        return response.data.candidates[0]?.content?.parts[0]?.text || null;

    } catch (error) {
        console.error('Error al llamar a Gemini:', error.response?.data || error.message);
        return null;
    }
}

module.exports = llamarGemini;
