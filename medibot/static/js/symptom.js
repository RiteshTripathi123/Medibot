// Global Constants
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;
const apiKey = "AIzaSyBtCNXNBF0JGNG323shPQm_wjTpFSo9cUM"; // Add your Gemini API key here

// State
let lastSpecialistType = null;

// DOM Elements
const symptomInput = document.getElementById('symptomInput');
const analyzeButton = document.getElementById('analyzeButton');
const resultsArea = document.getElementById('resultsArea');
const aiResponseDiv = document.getElementById('aiResponse');
const loadingIndicator = document.getElementById('loadingIndicator');
const sourcesContainer = document.getElementById('sourcesContainer');
const sourcesList = document.getElementById('sourcesList');
const messageBox = document.getElementById('messageBox');
const messageTitle = document.getElementById('messageTitle');
const messageContent = document.getElementById('messageContent');
const nearbyDoctorButton = document.getElementById('nearbyDoctorButton');
const doctorResultsArea = document.getElementById('doctorResultsArea');
const doctorSearchResults = document.getElementById('doctorSearchResults');
const specialistTypeDisplay = document.getElementById('specialistTypeDisplay');

// Show message modal
function showMessage(title, content, isError = true) {
  messageTitle.textContent = title;
  messageContent.textContent = content;
  messageTitle.classList.toggle('text-red-600', isError);
  messageBox.classList.remove('hidden');
}

// Fetch helper with backoff
async function fetchWithBackoff(url, options, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 429 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000 + (Math.random() * 1000);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      const errorData = await response.json();
      throw new Error(errorData.error.message || `API failed: ${response.status}`);
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
    }
  }
}

// Analyze symptoms
async function analyzeSymptoms() {
  const symptoms = symptomInput.value.trim();
  if (symptoms.length < 10) {
    showMessage("Input Required", "Please describe your symptoms (at least 10 characters).", false);
    return;
  }

  analyzeButton.disabled = true;
  analyzeButton.textContent = "Analyzing...";
  resultsArea.classList.add('hidden');
  doctorResultsArea.classList.add('hidden');
  nearbyDoctorButton.classList.add('hidden');
  loadingIndicator.classList.remove('hidden');

  try {
    const systemPrompt = `You are an informational AI symptom checker and you will tell which type of doctor specialist should I see...`; // trimmed for brevity
    const userQuery = `My symptoms are: ${symptoms}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      tools: [{ "google_search": {} }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const response = await fetchWithBackoff(`${API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const candidate = result.candidates?.[0];

    if (candidate && candidate.content?.parts?.[0]?.text) {
      const text = candidate.content.parts[0].text;
      aiResponseDiv.innerHTML = renderMarkdown(text);

      const specialistMatch = text.match(/## Recommended Specialist Type\s*\n\s*(.*?)\n\s*##/i)
        || text.match(/## Recommended Specialist Type\s*\n\s*(.*)\s*$/i);
      if (specialistMatch && specialistMatch[1]) {
        lastSpecialistType = specialistMatch[1].trim().replace(/\*/g, '');
        nearbyDoctorButton.classList.remove('hidden');
      }

      const grounding = candidate.groundingMetadata?.groundingAttributions || [];
      sourcesList.innerHTML = '';
      if (grounding.length > 0) {
        sourcesContainer.classList.remove('hidden');
        grounding.forEach(src => {
          if (src.web?.uri && src.web?.title) {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${src.web.uri}" target="_blank" class="text-blue-600 hover:underline">${src.web.title}</a>`;
            sourcesList.appendChild(li);
          }
        });
      } else sourcesContainer.classList.add('hidden');

      resultsArea.classList.remove('hidden');
    } else {
      showMessage("Analysis Failed", "Could not generate a response. Please try again.");
    }
  } catch (error) {
    console.error(error);
    showMessage("System Error", error.message);
  } finally {
    loadingIndicator.classList.add('hidden');
    analyzeButton.disabled = false;
    analyzeButton.textContent = "Analyze Symptoms";
  }
}

// Find specialists
function findNearbySpecialists() {
  if (!lastSpecialistType) {
    showMessage("Error", "No specialist type found. Please analyze symptoms first.");
    return;
  }

  nearbyDoctorButton.disabled = true;
  nearbyDoctorButton.textContent = "Getting Location...";
  specialistTypeDisplay.textContent = lastSpecialistType;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => performDoctorSearch(pos.coords.latitude, pos.coords.longitude),
      err => {
        nearbyDoctorButton.disabled = false;
        nearbyDoctorButton.textContent = "Find Nearby Specialist";
        showMessage("Location Error", "Please enable location access to find nearby doctors.");
      }
    );
  } else {
    showMessage("Browser Error", "Geolocation not supported by your browser.");
  }
}

// Search doctors
async function performDoctorSearch(lat, lon) {
  nearbyDoctorButton.textContent = "Searching Doctors...";

  try {
    const loc = lat && lon ? `near latitude ${lat} and longitude ${lon}` : "near me";
    const searchPrompt = `Find ${lastSpecialistType} doctors ${loc}. Provide links to reviews or booking pages.`;
    const payload = {
      contents: [{ parts: [{ text: searchPrompt }] }],
      tools: [{ "google_search": {} }],
    };

    const response = await fetchWithBackoff(`${API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const sources = result.candidates?.[0]?.groundingMetadata?.groundingAttributions || [];

    if (sources.length > 0) {
      const ul = document.createElement('ul');
      ul.className = 'list-disc pl-5 space-y-2';
      sources.forEach(s => {
        if (s.web?.uri && s.web?.title) {
          const li = document.createElement('li');
          li.innerHTML = `<a href="${s.web.uri}" target="_blank" class="text-blue-700 hover:underline">${s.web.title}</a>`;
          ul.appendChild(li);
        }
      });
      doctorSearchResults.innerHTML = '';
      doctorSearchResults.appendChild(ul);
    } else {
      doctorSearchResults.innerHTML = `<p class="text-gray-600">No local results found for "${lastSpecialistType}".</p>`;
    }

    doctorResultsArea.classList.remove('hidden');
  } catch (error) {
    console.error(error);
    doctorSearchResults.innerHTML = `<p class="text-red-600">Search error. Please try again.</p>`;
  } finally {
    nearbyDoctorButton.disabled = false;
    nearbyDoctorButton.textContent = "Find Nearby Specialist";
  }
}

// Markdown renderer
function renderMarkdown(md) {
  let html = md.replace(/\n/g, '<br/>')
    .replace(/## (.*?)(<br\/>|$)/g, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
    .replace(/# (.*?)(<br\/>|$)/g, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/<br\/>\* (.*?)<br\/>/g, '<li>$1</li>')
    .replace(/\* (.*?)<br\/>/g, '<li>$1</li>');

  if (html.includes('<li>')) html = `<ul>${html}</ul>`;
  return html.replace(/<br\/><br\/>/g, '</p><p>');
}

// Event listeners
analyzeButton.addEventListener('click', analyzeSymptoms);
nearbyDoctorButton.addEventListener('click', findNearbySpecialists);
symptomInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    analyzeSymptoms();
  }
});
