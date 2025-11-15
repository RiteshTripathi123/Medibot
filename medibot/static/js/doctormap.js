// =================================================================
// doctormap.js - AI Doctor Search (JSON Structured Output FIX)
// =================================================================

(function() {
    
    // Global Constants (Scoped by IIFE)
    // Using stable model gemini-2.5-flash.
    const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    const apiKey = "AIzaSyBtCNXNBF0JGNG323shPQm_wjTpFSo9cUM"; // !!! Insert your API key here !!!
    const MAX_RETRIES = 3;

    // 1. DOM Element References
    const specialtyInput = document.getElementById('specialty');
    const locationInput = document.getElementById('location');
    const searchButton = document.getElementById('search-button');
    const doctorList = document.getElementById('doctor-list');
    const loadingIndicator = document.getElementById('loading');
    const errorContainer = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const sourcesContainer = document.getElementById('sources-container');
    const sourcesList = document.getElementById('sources-list');

    if (!searchButton || !doctorList) return; 

    // 2. Utility Functions
    function showLoading(isLoading) {
        loadingIndicator.classList.toggle('hidden', !isLoading);
        searchButton.disabled = isLoading;
        const buttonText = document.getElementById('button-text');
        if (buttonText) {
            buttonText.textContent = isLoading ? 'Searching...' : 'Find Doctors';
        }
        searchButton.classList.toggle('opacity-50', isLoading);
    }

    function showError(message) {
        errorText.textContent = message;
        errorContainer.classList.remove('hidden');
    }

    function clearResults() {
        errorContainer.classList.add('hidden');
        sourcesContainer.classList.add('hidden');
        sourcesList.innerHTML = '';
        doctorList.innerHTML = ''; 
    }

    // 3. Renderer for Structured Results (Builds attractive cards)
    function renderDoctorCards(doctors) {
        clearResults();
        if (!Array.isArray(doctors) || doctors.length === 0) {
            doctorList.innerHTML = `<p class="text-gray-500 italic p-4 bg-gray-800 rounded-lg">No doctor recommendations could be generated for your criteria. Please try a different specialty or location.</p>`;
            return;
        }

        // Generate the HTML for the doctor cards
        const cardsHtml = doctors.map(doctor => `
            <div class="doctor-card p-5 bg-gray-800 rounded-lg shadow-lg border border-gray-700 hover:border-blue-500 transition duration-300">
                <div class="flex items-center mb-3">
                    <i class="fas fa-user-md text-3xl text-blue-400 mr-4"></i>
                    <h4 class="text-xl font-bold text-white">${doctor.Name || 'Unknown Doctor'}</h4>
                </div>
                <div class="space-y-2 text-gray-300">
                    <p><i class="fas fa-star text-yellow-500 mr-2"></i> <strong>Rating:</strong> ${doctor.Rating || 'N/A'}</p>
                    <p><i class="fas fa-map-marker-alt text-red-500 mr-2"></i> <strong>Address:</strong> ${doctor.Address || 'N/A'}</p>
                    <p><i class="fas fa-phone text-green-500 mr-2"></i> <strong>Phone:</strong> <a href="tel:${doctor.Phone}" class="text-green-400 hover:underline">${doctor.Phone || 'N/A'}</a></p>
                </div>
                <div class="mt-4 flex space-x-3">
                    <a href="#" class="btn-primary btn-sm">View Details</a>
                    <a href="#" class="btn-outline btn-sm">Book Appointment</a>
                </div>
            </div>
        `).join('');

        doctorList.innerHTML = cardsHtml;
    }

    // 4. Main Search Function
    async function searchDoctors(specialty, location) {
        clearResults();
        showLoading(true);

        const systemPrompt = `You are a professional medical search assistant. Your task is to find the top-rated doctors in the specified specialty and location. You MUST return an array of 3-5 doctor objects in JSON format. Each object MUST contain the following fields: 'Name', 'Address', 'Rating' (as a string, e.g., "4.5/5" or "Excellent"), and 'Phone' (with a local area code, even if a placeholder like 'N/A' is used if not found). DO NOT include any text, markdown, or explanation outside the JSON block. The response must be a single, valid JSON array of doctor objects.`;
        
        const userQuery = `Find top-rated ${specialty} doctors near ${location}.`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            tools: [{ "google_search": {} }],
            // Removed responseMimeType/responseSchema to fix 400 error
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        let delay = 1000;

        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                if (apiKey === "YOUR_ACTUAL_GEMINI_API_KEY_HERE" || apiKey === "") {
                    showError("API Configuration Error: Please insert your valid Gemini API key in doctormap.js.");
                    showLoading(false);
                    return;
                }
                
                const response = await fetch(`${API_BASE_URL}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                const candidate = result.candidates?.[0];
                const rawJsonText = candidate.content?.parts?.[0]?.text;
                
                if (rawJsonText) {
                    // Try to clean up the text just in case the model adds '```json'
                    const jsonString = rawJsonText.replace(/```json\s*|```/g, '').trim();
                    
                    const doctors = JSON.parse(jsonString);
                    renderDoctorCards(doctors);

                    // Extract and display grounding sources (unchanged)
                    const grounding = candidate.groundingMetadata?.groundingAttributions || [];
                    sourcesList.innerHTML = '';
                    if (grounding.length > 0) {
                        sourcesContainer.classList.remove('hidden');
                        grounding.forEach(src => {
                            if (src.web?.uri && src.web?.title) {
                                const li = document.createElement('li');
                                li.innerHTML = `<a href="${src.web.uri}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${src.web.title}</a>`;
                                sourcesList.appendChild(li);
                            }
                        });
                    } else sourcesContainer.classList.add('hidden');

                    showLoading(false);
                    return; 
                } else {
                    throw new Error("No valid data generated by the model. Response may have been filtered.");
                }

            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                if (i < MAX_RETRIES - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; 
                } else {
                    showError(`Failed to fetch doctor information after ${MAX_RETRIES} attempts. Error: ${error.message}.`);
                    showLoading(false);
                }
            }
        }
    }

    // 5. Event Handler
    function handleSearch() {
        const specialty = specialtyInput.value.trim();
        const location = locationInput.value.trim();

        if (!specialty || !location) {
            showError("Please enter both a Doctor Specialty and a Location.");
            renderDoctorCards([]); 
            return;
        }

        errorContainer.classList.add('hidden');
        searchDoctors(specialty, location);
    }

    // 6. Initialization
    document.addEventListener('DOMContentLoaded', () => {
        if (doctorList) {
            doctorList.innerHTML = '<p class="text-gray-500 italic p-4 bg-gray-800 rounded-lg">Enter your criteria above and click "Find Doctors" to begin your search.</p>';
        }
        
        if (searchButton) {
            searchButton.addEventListener('click', handleSearch);
        }
    });

})();