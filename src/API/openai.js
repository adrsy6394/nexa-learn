//fetching data in openai APIs components
export async function fetchExplanation({ subject, topic, language }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const prompt = `Explain ${topic} in ${language} under the subject ${subject}.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("OpenAI Error:", errorData);
    throw new Error("OpenAI API Error: " + response.statusText);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No explanation received.";
}
