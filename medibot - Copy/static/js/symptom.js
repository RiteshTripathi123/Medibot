(() => {

    // ── Constants ──────────────────────────────────────────────────────────────
    const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";
    const API_URL = window.ENV?.API_URL || "https://medibot-backend.onrender.com";
    console.log(apiKey); // !!! Insert your Gemini API key here !!!
    const MAX_RETRIES = 10;
    const BASE_DELAY_MS = 5000;

    // ── State ──────────────────────────────────────────────────────────────────
    let lastSpecialistType = null;

    // ── DOM References ─────────────────────────────────────────────────────────
    const symptomInput         = document.getElementById('symptomInput');
    const symptomDuration      = document.getElementById('symptomDuration');
    const symptomSeverity      = document.getElementById('symptomSeverity');
    const existingDiseases     = document.getElementById('existingDiseases');
    const currentMedications   = document.getElementById('currentMedications');
    const analyzeButton        = document.getElementById('analyzeButton');
    const resultsArea          = document.getElementById('resultsArea');
    const aiResponseDiv        = document.getElementById('aiResponse');
    const loadingIndicator     = document.getElementById('loadingIndicator');
    const sourcesContainer     = document.getElementById('sourcesContainer');
    const sourcesList          = document.getElementById('sourcesList');
    const messageBox           = document.getElementById('messageBox');
    const messageTitle         = document.getElementById('messageTitle');
    const messageContent       = document.getElementById('messageContent');
    const nearbyDoctorButton   = document.getElementById('nearbyDoctorButton');
    const doctorResultsArea    = document.getElementById('doctorResultsArea');
    const doctorSearchResults  = document.getElementById('doctorSearchResults');
    const specialistTypeDisplay = document.getElementById('specialistTypeDisplay');

    // Guard — bail out if essential elements missing
    if (!symptomInput || !analyzeButton || !resultsArea || !aiResponseDiv ||
        !nearbyDoctorButton || !doctorResultsArea || !doctorSearchResults) {
        console.error('symptom-checker.js: Required DOM elements not found.');
        return;
    }

    // ── Utilities ──────────────────────────────────────────────────────────────
    function showMessage(title, content, isError = true) {
        if (messageBox && messageTitle && messageContent) {
            messageTitle.textContent = title;
            messageContent.textContent = content;
            messageTitle.classList.toggle('text-red-600', isError);
            messageBox.classList.remove('hidden');
        } else {
            window.alert(`${title}: ${content}`);
        }
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ── Fetch with exponential back-off ────────────────────────────────────────
    async function fetchWithBackoff(url, options) {
        let delay = BASE_DELAY_MS;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            const response = await fetch(url, options);

            if (response.ok) return response;

            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                const headerMs   = retryAfter ? parseInt(retryAfter) * 1000 : 0;
                const waitMs     = Math.max(headerMs, delay, 10000);
                console.warn(`Rate limited. Waiting ${waitMs / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})…`);
                if (attempt < MAX_RETRIES - 1) {
                    await sleep(waitMs);
                    delay *= 2;
                    continue;
                }
                throw new Error("Rate limit exceeded. Please wait a moment and try again.");
            }

            // Any other HTTP error — read body and throw
            const body = await response.text().catch(() => '');
            let message = `HTTP ${response.status}`;
            try { message = JSON.parse(body).error?.message || message; } catch (_) {}
            throw new Error(message);
        }
    }

    // ── JSON extractor (handles ```json fences and mixed text) ─────────────────
    function extractJsonObject(text) {
        if (!text) return null;
        let cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
        try { return JSON.parse(cleaned); } catch (_) {}
        const start = cleaned.indexOf('{');
        const end   = cleaned.lastIndexOf('}');
        if (start !== -1 && end > start) {
            try { return JSON.parse(cleaned.slice(start, end + 1)); } catch (_) {}
        }
        return null;
    }

    // ── Render structured analysis cards ──────────────────────────────────────
    function renderAnalysis(data) {
        const urgency    = (data.urgency    || 'medium').toLowerCase();
        const confidence = (data.confidence || 'medium').toLowerCase();

        const urgencyColor = urgency === 'emergency' ? '#ef4444'
            : urgency === 'high'   ? '#f97316'
            : urgency === 'medium' ? '#f59e0b'
            : '#10b981';

        const confidenceColor = confidence === 'high'   ? '#10b981'
            : confidence === 'medium' ? '#f59e0b'
            : '#ef4444';

        const listItems = arr =>
            (Array.isArray(arr) && arr.length > 0)
                ? arr.map(i => `<li>${escapeHtml(i)}</li>`).join('')
                : '<li>N/A</li>';

        aiResponseDiv.innerHTML = `
            <div class="medical-response">
                <h4><i class="fas fa-notes-medical"></i> Summary</h4>
                <p>${escapeHtml(data.summary || 'Basic analysis completed.')}</p>

                <h5><i class="fas fa-user-md"></i> Recommended Specialist Type</h5>
                <p><strong>${escapeHtml(data.specialistType || 'General Physician')}</strong></p>

                <h5><i class="fas fa-exclamation-circle"></i> Urgency</h5>
                <p><strong style="color:${urgencyColor};">${urgency.toUpperCase()}</strong></p>

                <h5><i class="fas fa-bullseye"></i> Confidence</h5>
                <p><strong style="color:${confidenceColor};">${confidence.toUpperCase()}</strong></p>

                <h5><i class="fas fa-microscope"></i> Possible Conditions</h5>
                <ul>${listItems(data.possibleConditions)}</ul>

                <h5><i class="fas fa-check-circle"></i> Recommended Steps</h5>
                <ul>${listItems(data.recommendations)}</ul>

                <h5><i class="fas fa-triangle-exclamation"></i> Seek urgent care if you notice</h5>
                <ul>${listItems(data.redFlags)}</ul>
            </div>
        `;
    }

    // ── Analyze Symptoms ───────────────────────────────────────────────────────
    async function analyzeSymptoms() {
        const symptoms = symptomInput.value.trim();
        if (symptoms.length < 5) {
            showMessage('Input Required', 'Please describe your symptoms with a bit more detail.', false);
            return;
        }

        if (!apiKey || apiKey.trim() === '') {
            showMessage('API Key Missing', 'Please add your Gemini API key in symptom-checker.js.', true);
            return;
        }

        // Reset UI
        analyzeButton.disabled = true;
        analyzeButton.textContent = 'Analyzing...';
        resultsArea.classList.add('hidden');
        doctorResultsArea.classList.add('hidden');
        nearbyDoctorButton.classList.add('hidden');
        if (loadingIndicator) loadingIndicator.classList.remove('hidden');

        try {
            // Pull extra context fields if present
            const duration    = symptomDuration?.value?.trim()    || 'unknown';
            const severity    = symptomSeverity?.value?.trim()    || 'unknown';
            const diseases    = existingDiseases?.value?.trim()   || 'none';
            const medications = currentMedications?.value?.trim() || 'none';

            const systemPrompt = `You are a professional AI medical assistant for informational purposes only.
Analyze the patient's symptoms and return ONLY a valid JSON object — no markdown, no explanation, no extra text.
The JSON must have exactly these keys:
- "summary": string (2-3 sentence overview)
- "specialistType": string (e.g. "Cardiologist", "General Physician")
- "urgency": one of "low" | "medium" | "high" | "emergency"
- "confidence": one of "low" | "medium" | "high"
- "possibleConditions": array of strings (3-5 items)
- "recommendations": array of strings (3-5 actionable steps)
- "redFlags": array of strings (warning signs requiring immediate care)

Always end with a disclaimer that this is not a substitute for professional medical advice.`;

            const userQuery = `Patient symptoms: ${symptoms}
Duration: ${duration}
Severity: ${severity}
Existing conditions: ${diseases}
Current medications: ${medications}

Return JSON only.`;

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
            };

            const response = await fetchWithBackoff(`${API_BASE_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result  = await response.json();
            const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            const data    = extractJsonObject(rawText);

            if (!data) {
                throw new Error('Could not parse AI response. Please try again.');
            }

            renderAnalysis(data);
            lastSpecialistType = data.specialistType || 'General Physician';
            if (specialistTypeDisplay) specialistTypeDisplay.textContent = lastSpecialistType;

            // Grounding sources (if any)
            const grounding = result.candidates?.[0]?.groundingMetadata?.groundingAttributions || [];
            if (sourcesContainer && sourcesList) {
                sourcesList.innerHTML = '';
                if (grounding.length > 0) {
                    sourcesContainer.classList.remove('hidden');
                    grounding.forEach(src => {
                        if (src.web?.uri && src.web?.title) {
                            const li = document.createElement('li');
                            li.innerHTML = `<a href="${escapeHtml(src.web.uri)}" target="_blank" rel="noopener"
                                class="text-blue-600 hover:underline">${escapeHtml(src.web.title)}</a>`;
                            sourcesList.appendChild(li);
                        }
                    });
                } else {
                    sourcesContainer.classList.add('hidden');
                }
            }

            nearbyDoctorButton.classList.remove('hidden');
            resultsArea.classList.remove('hidden');

        } catch (error) {
            console.error('analyzeSymptoms error:', error);
            showMessage('System Error', error.message || 'Symptom analysis failed. Please try again.');
        } finally {
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
            analyzeButton.disabled = false;
            analyzeButton.textContent = 'Analyze Symptoms';
        }
    }

    // ── Doctor Search ──────────────────────────────────────────────────────────
    async function performDoctorSearch(lat, lon) {
        nearbyDoctorButton.disabled = true;
        nearbyDoctorButton.textContent = 'Searching Doctors...';

        try {
            const location = (lat && lon)
                ? `near latitude ${lat.toFixed(4)}, longitude ${lon.toFixed(4)}`
                : 'near me';

            const systemPrompt = `You are a medical search assistant. Return ONLY a valid JSON array — no markdown, no explanation.
Each element must have: "Name", "Rating", "Address", "Phone".
Example: [{"Name":"Dr. Jane Smith","Rating":"4.8/5","Address":"123 Main St","Phone":"(555) 123-4567"}]`;

            const userQuery = `List 4 top-rated ${lastSpecialistType} doctors ${location}. JSON only.`;

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
            };

            const response = await fetchWithBackoff(`${API_BASE_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result  = await response.json();
            const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;

            // Try structured JSON first
            let doctors = null;
            if (rawText) {
                const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
                try { doctors = JSON.parse(cleaned); } catch (_) {}
                if (!doctors) {
                    const s = cleaned.indexOf('['), e = cleaned.lastIndexOf(']');
                    if (s !== -1 && e > s) {
                        try { doctors = JSON.parse(cleaned.slice(s, e + 1)); } catch (_) {}
                    }
                }
            }

            if (Array.isArray(doctors) && doctors.length > 0) {
                doctorSearchResults.innerHTML = `
                    <ul class="space-y-3">
                        ${doctors.map(doc => `
                            <li class="p-3 bg-gray-800 rounded-lg border border-gray-700">
                                <strong class="text-white">${escapeHtml(doc.Name || 'Doctor')}</strong><br/>
                                <span class="text-gray-400 text-sm">
                                    <i class="fas fa-star text-yellow-500 mr-1"></i>${escapeHtml(doc.Rating || 'N/A')} &nbsp;|&nbsp;
                                    <i class="fas fa-map-marker-alt text-red-400 mr-1"></i>${escapeHtml(doc.Address || 'N/A')} &nbsp;|&nbsp;
                                    <i class="fas fa-phone text-green-400 mr-1"></i>
                                    <a href="tel:${escapeHtml(doc.Phone || '')}" class="text-green-400 hover:underline">${escapeHtml(doc.Phone || 'N/A')}</a>
                                </span>
                            </li>`).join('')}
                    </ul>`;
            } else {
                doctorSearchResults.innerHTML = `<p class="text-gray-500 italic">No specialist recommendations found. Try again later.</p>`;
            }

            doctorResultsArea.classList.remove('hidden');

        } catch (error) {
            console.error('performDoctorSearch error:', error);
            doctorSearchResults.innerHTML = `<p class="text-red-500">Search error: ${escapeHtml(error.message)}</p>`;
            doctorResultsArea.classList.remove('hidden');
        } finally {
            nearbyDoctorButton.disabled = false;
            nearbyDoctorButton.textContent = 'Find Nearby Specialist';
        }
    }

    // ── Geolocation + Doctor Trigger ───────────────────────────────────────────
    function findNearbySpecialists() {
        if (!lastSpecialistType) {
            showMessage('Error', 'Please run symptom analysis first.');
            return;
        }

        if (navigator.geolocation) {
            nearbyDoctorButton.textContent = 'Getting Location...';
            navigator.geolocation.getCurrentPosition(
                pos => performDoctorSearch(pos.coords.latitude, pos.coords.longitude),
                ()  => performDoctorSearch(null, null),
                { timeout: 6000 }
            );
        } else {
            performDoctorSearch(null, null);
        }
    }

    // ── Event Listeners ────────────────────────────────────────────────────────
    analyzeButton.addEventListener('click', analyzeSymptoms);
    nearbyDoctorButton.addEventListener('click', findNearbySpecialists);
    symptomInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            analyzeSymptoms();
        }
    });

})();
