(function () {

    // ── Constants ──────────────────────────────────────────────────────────────
    const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";
    const API_URL = window.ENV?.API_URL || "https://medibot-backend.onrender.com";
    console.log(apiKey); // !!! Insert your API key here !!!
    const MAX_RETRIES = 10;
    const BASE_DELAY_MS = 5000; // Start at 5 s (safer for free-tier limits)

    // Simple in-session cache: "specialty|location" → parsed doctors array
    const searchCache = new Map();

    // ── DOM References (deferred until DOMContentLoaded) ──────────────────────
    let specialtyInput, locationInput, searchButton, doctorList,
        loadingIndicator, errorContainer, errorText,
        sourcesContainer, sourcesList;

    function initDOMRefs() {
        specialtyInput    = document.getElementById('specialty');
        locationInput     = document.getElementById('location');
        searchButton      = document.getElementById('search-button');
        doctorList        = document.getElementById('doctor-list');
        loadingIndicator  = document.getElementById('loading');
        errorContainer    = document.getElementById('error-message');
        errorText         = document.getElementById('error-text');
        sourcesContainer  = document.getElementById('sources-container');
        sourcesList       = document.getElementById('sources-list');
    }

    // ── Utility ────────────────────────────────────────────────────────────────
    function showLoading(isLoading) {
        if (loadingIndicator) loadingIndicator.classList.toggle('hidden', !isLoading);
        if (searchButton) {
            searchButton.disabled = isLoading;
            searchButton.classList.toggle('opacity-50', isLoading);
        }
        const buttonText = document.getElementById('button-text');
        if (buttonText) buttonText.textContent = isLoading ? 'Searching...' : 'Find Doctors';
    }

    function showError(message) {
        if (errorText) errorText.textContent = message;
        if (errorContainer) errorContainer.classList.remove('hidden');
    }

    function clearResults() {
        if (errorContainer)   errorContainer.classList.add('hidden');
        if (sourcesContainer) sourcesContainer.classList.add('hidden');
        if (sourcesList)      sourcesList.innerHTML = '';
        if (doctorList)       doctorList.innerHTML = '';
    }

    // ── Renderer ───────────────────────────────────────────────────────────────
    function renderDoctorCards(doctors) {
        clearResults();
        if (!Array.isArray(doctors) || doctors.length === 0) {
            doctorList.innerHTML = `<p class="text-gray-500 italic p-4 bg-gray-800 rounded-lg">
                No doctor recommendations could be generated for your criteria.
                Please try a different specialty or location.
            </p>`;
            return;
        }

        doctorList.innerHTML = doctors.map(doctor => `
            <div class="doctor-card p-5 bg-gray-800 rounded-lg shadow-lg border border-gray-700 hover:border-blue-500 transition duration-300">
                <div class="flex items-center mb-3">
                    <i class="fas fa-user-md text-3xl text-blue-400 mr-4"></i>
                    <h4 class="text-xl font-bold text-white">${escapeHtml(doctor.Name  || 'Unknown Doctor')}</h4>
                </div>
                <div class="space-y-2 text-gray-300">
                    <p><i class="fas fa-star text-yellow-500 mr-2"></i>
                        <strong>Rating:</strong> ${escapeHtml(doctor.Rating  || 'N/A')}</p>
                    <p><i class="fas fa-map-marker-alt text-red-500 mr-2"></i>
                        <strong>Address:</strong> ${escapeHtml(doctor.Address || 'N/A')}</p>
                    <p><i class="fas fa-phone text-green-500 mr-2"></i>
                        <strong>Phone:</strong>
                        <a href="tel:${escapeHtml(doctor.Phone || '')}" class="text-green-400 hover:underline">
                            ${escapeHtml(doctor.Phone || 'N/A')}
                        </a>
                    </p>
                </div>
                <div class="mt-4 flex space-x-3">
                    <a href="#" class="btn-primary btn-sm">View Details</a>
                    <a href="#" class="btn-outline btn-sm">Book Appointment</a>
                </div>
            </div>
        `).join('');
    }

    // Prevent XSS when inserting user-influenced AI text into innerHTML
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── JSON Extractor ─────────────────────────────────────────────────────────
    // Robustly pulls a JSON array out of mixed model output
    function extractJsonArray(text) {
        if (!text) return null;

        // 1. Strip ```json … ``` fences
        let cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

        // 2. Try parsing the whole thing directly
        try { return JSON.parse(cleaned); } catch (_) { /* fall through */ }

        // 3. Extract first [...] block
        const start = cleaned.indexOf('[');
        const end   = cleaned.lastIndexOf(']');
        if (start !== -1 && end !== -1 && end > start) {
            try { return JSON.parse(cleaned.slice(start, end + 1)); } catch (_) { /* fall through */ }
        }

        return null;
    }

    // ── Main Search ────────────────────────────────────────────────────────────
    async function searchDoctors(specialty, location) {
        // Validate API key
        if (!apiKey || apiKey.trim() === "") {
            showError("API Configuration Error: Please insert your valid Gemini API key in doctormap.js.");
            showLoading(false);
            return;
        }

        // Check cache first
        const cacheKey = `${specialty.toLowerCase()}|${location.toLowerCase()}`;
        if (searchCache.has(cacheKey)) {
            renderDoctorCards(searchCache.get(cacheKey));
            showLoading(false);
            return;
        }

        // NOTE: google_search grounding and strict JSON output are incompatible —
        // the model embeds citations inside the text and breaks JSON parsing.
        // We use a plain request with a very explicit JSON-only prompt instead.
        const systemPrompt = `You are a medical search assistant. Return ONLY a valid JSON array — no markdown, no explanation, no extra text before or after.
Each element must have exactly these keys: "Name", "Rating", "Address", "Phone".
Example format:
[{"Name":"Dr. Jane Smith","Rating":"4.8/5","Address":"123 Main St, City","Phone":"(555) 123-4567"}]`;

        const userQuery = `List 4 top-rated ${specialty} doctors near ${location}. JSON only.`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                temperature: 0.2,       // Lower = more predictable / less hallucination
                maxOutputTokens: 1024,
            }
        };

        let delay = BASE_DELAY_MS;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const response = await fetch(`${API_BASE_URL}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                // Handle rate-limit specifically
                if (response.status === 429) {
                    const retryAfter = response.headers.get('Retry-After');
                    const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : delay;
                    console.warn(`Rate limited. Waiting ${waitMs / 1000}s before retry…`);
                    if (attempt < MAX_RETRIES - 1) {
                        await sleep(waitMs);
                        delay *= 2;
                        continue;
                    } else {
                        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
                    }
                }

                if (!response.ok) {
                    const body = await response.text().catch(() => '');
                    throw new Error(`HTTP ${response.status}: ${body.slice(0, 120)}`);
                }

                const result = await response.json();
                const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
                const doctors = extractJsonArray(rawText);

                if (!doctors || doctors.length === 0) {
                    throw new Error("Model returned an empty or unparseable response. Please try again.");
                }

                // Cache & render
                searchCache.set(cacheKey, doctors);
                renderDoctorCards(doctors);

                // Sources (only present when grounding is active — kept for future use)
                const grounding = result.candidates?.[0]?.groundingMetadata?.groundingAttributions || [];
                if (grounding.length > 0 && sourcesList && sourcesContainer) {
                    sourcesContainer.classList.remove('hidden');
                    sourcesList.innerHTML = '';
                    grounding.forEach(src => {
                        if (src.web?.uri && src.web?.title) {
                            const li = document.createElement('li');
                            li.innerHTML = `<a href="${escapeHtml(src.web.uri)}" target="_blank" rel="noopener noreferrer"
                                class="text-blue-400 hover:underline">${escapeHtml(src.web.title)}</a>`;
                            sourcesList.appendChild(li);
                        }
                    });
                } else if (sourcesContainer) {
                    sourcesContainer.classList.add('hidden');
                }

                showLoading(false);
                return; // ✅ Success — exit loop

            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error);
                if (attempt < MAX_RETRIES - 1) {
                    await sleep(delay);
                    delay *= 2; // Exponential back-off
                } else {
                    showError(`Search failed after ${MAX_RETRIES} attempts: ${error.message}`);
                    showLoading(false);
                }
            }
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ── Event Handler ──────────────────────────────────────────────────────────
    function handleSearch() {
        const specialty = specialtyInput?.value.trim();
        const location  = locationInput?.value.trim();

        if (!specialty || !location) {
            showError("Please enter both a Doctor Specialty and a Location.");
            clearResults();
            return;
        }

        clearResults();
        showLoading(true);
        searchDoctors(specialty, location);
    }

    // ── Init ───────────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        initDOMRefs();

        if (!searchButton || !doctorList) {
            console.error('doctormap.js: Required DOM elements not found.');
            return;
        }

        doctorList.innerHTML = `<p class="text-gray-500 italic p-4 bg-gray-800 rounded-lg">
            Enter your criteria above and click "Find Doctors" to begin your search.
        </p>`;

        searchButton.addEventListener('click', handleSearch);

        // Allow pressing Enter from either input field
        [specialtyInput, locationInput].forEach(input => {
            input?.addEventListener('keydown', e => {
                if (e.key === 'Enter') handleSearch();
            });
        });
    });

})();
