(function () {

    // ── Constants ──────────────────────────────────────────────────────────────
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
        const cacheKey = `${specialty.toLowerCase()}|${location.toLowerCase()}`;
        if (searchCache.has(cacheKey)) {
            renderDoctorCards(searchCache.get(cacheKey));
            showLoading(false);
            return;
        }

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const response = await fetch('/api/doctor-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ specialty, location })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || `HTTP ${response.status}`);
                }

                const doctors = Array.isArray(data.doctors) ? data.doctors : [];
                if (doctors.length === 0) {
                    throw new Error('No doctor recommendations could be generated for your criteria. Please try a different specialty or location.');
                }

                searchCache.set(cacheKey, doctors);
                renderDoctorCards(doctors);
                if (sourcesContainer) sourcesContainer.classList.add('hidden');
                showLoading(false);
                return;
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error);
                if (attempt < MAX_RETRIES - 1) {
                    const retryAfter = error.retryAfter || 0;
                    await sleep(Math.max(retryAfter, BASE_DELAY_MS * Math.pow(2, attempt)));
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