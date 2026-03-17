class MedibotPortal {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentTheme = this.getInitialTheme();
        this.currentLanguage = localStorage.getItem('medibot-language') || 'hi';
        this.sidebarOpen = window.innerWidth > 1024;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.charts = {};
        this.notifications = [];
        // Prevent duplicate chat sends from overlapping handlers
        this._lastSend = { text: '', time: 0 };
        this.chatFullscreen = localStorage.getItem('medibot-chat-fullscreen') !== 'off';
        this.autoSpeakResponses = localStorage.getItem('medibot-chat-voice') !== 'off';
        this.continuousConversation = localStorage.getItem('medibot-chat-continuous') !== 'off';
        this.voiceLocale = 'hi-IN';
        this.pushToTalkActive = false;
        this.voiceConversationActive = false;
        this.voiceStatusText = 'शुरू करें दबाएं और डॉ. असिस्टेंट से आवाज़ में बात करें।';
        this.wakeWordEnabled = localStorage.getItem('medibot-wake-word') !== 'off';
        this.awaitingWakeWord = this.wakeWordEnabled;
        this.wakeWordPhrases = ['hello doctor', 'hello dr', 'doctor ji', 'doctor sahab'];
        this.lastSpeechError = '';

        // Authentication state
        this.isAuthenticated = localStorage.getItem('medibot-authenticated') === 'true';
        this.currentUser = JSON.parse(localStorage.getItem('medibot-user')) || null;
        this.currentAuthTab = 'login';
        this.currentAppointmentsTab = 'upcoming';
        this.records = [];
        this.healthReports = [];

        // Document sharing state
        this.uploadedDocuments = [];
        this.analysisDocuments = [];
        this.currentAnalysisStep = 1;
        this.analysisData = {
            symptoms: '',
            history: '',
            age: '',
            priority: 'routine'
        };

        // Symptom tracking data
        this.symptoms = this.loadSymptoms();
        this.symptomCategories = {
            pain: { name: 'Pain', icon: 'fas fa-exclamation-circle', color: '#ff4757' },
            respiratory: { name: 'Respiratory', icon: 'fas fa-lungs', color: '#3742fa' },
            digestive: { name: 'Digestive', icon: 'fas fa-stomach', color: '#2ed573' },
            neurological: { name: 'Neurological', icon: 'fas fa-brain', color: '#ffa502' },
            skin: { name: 'Skin', icon: 'fas fa-hand-paper', color: '#ff6b6b' },
            other: { name: 'Other', icon: 'fas fa-plus', color: '#747d8c' }
        };

        this.translations = this.loadTranslations();

        this.init();
    }

    getInitialTheme() {
        const saved = localStorage.getItem('medibot-theme');
        if (saved) return saved;
        const hour = new Date().getHours();
        return (hour >= 6 && hour < 18) ? 'light' : 'dark';
    }

    loadTranslations() {
        return {
            en: {
                dashboard: "Dashboard",
                chat: "AI Assistant",
                appointments: "Appointments",
                records: "Medical Records",
                symptoms: "Symptom Tracker",
                doctors: "Find Doctors",
                pharmacy: "Pharmacy",
                reports: "Health Reports",
                emergency: "Emergency",
                search: "Search symptoms, doctors, medicines...",
                bookAppointment: "Book Appointment",
                askAI: "Ask AI Assistant",
                symptomCheck: "Symptom Checker",
                findDoctor: "Find Doctor",
                doctorAssistantTitle: "Dr. AI Assistant",
                doctorAssistantSubtitle: "Online • Ready to help",
                voiceModeTitle: "Voice Doctor Mode",
                voiceStatusIdle: "Tap start and talk to Dr. Assistant in voice.",
                voiceStatusWake: "Say Hello Doctor to begin.",
                voiceStatusListening: "Listening... ask your question.",
                voiceStatusWakeDetected: "Yes, tell me. I'm listening.",
                voiceStatusHeard: "You said: {text}",
                voiceStatusProcessing: "Processing your question...",
                voiceStatusPermission: "Please allow microphone permission, then try again.",
                voiceStatusError: "There was a voice input issue. Please try again.",
                voiceStatusUnsupported: "Voice input is not supported in this browser.",
                voiceStatusNoSpeech: "I could not hear clearly. Please speak again.",
                voiceStatusReplying: "Dr. Assistant is speaking...",
                voiceStatusReadyNext: "Ready to hear your next question.",
                voiceStatusContinuousStopped: "Continuous mode off. Voice doctor mode stopped.",
                voiceConversationStart: "Start Voice Conversation",
                voiceConversationStop: "Stop Voice Conversation",
                wakeWordToggle: "Wake word (Hello Doctor)",
                chatPlaceholder: "Type your symptoms or questions..."
            },
            hi: {
                dashboard: "डैशबोर्ड",
                chat: "AI असिस्टेंट",
                appointments: "अपॉइंटमेंट",
                records: "मेडिकल रिकॉर्ड",
                symptoms: "लक्षण ट्रैकर",
                doctors: "डॉक्टर खोजें",
                pharmacy: "फार्मेसी",
                reports: "स्वास्थ्य रिपोर्ट",
                emergency: "आपातकाल",
                search: "लक्षण, डॉक्टर, दवाएं खोजें...",
                bookAppointment: "अपॉइंटमेंट बुक करें",
                askAI: "AI असिस्टेंट से पूछें",
                symptomCheck: "लक्षण जांच",
                findDoctor: "डॉक्टर खोजें",
                doctorAssistantTitle: "डॉ. एआई सहायक",
                doctorAssistantSubtitle: "ऑनलाइन • मदद के लिए तैयार",
                voiceModeTitle: "वॉइस डॉक्टर मोड",
                voiceStatusIdle: "शुरू करें दबाएं और डॉ. असिस्टेंट से आवाज़ में बात करें।",
                voiceStatusWake: "शुरू करने के लिए Hello Doctor बोलें।",
                voiceStatusListening: "सुन रहा हूँ... अपना सवाल बोलिए।",
                voiceStatusWakeDetected: "जी, बताइए। मैं सुन रहा हूँ।",
                voiceStatusHeard: "आपने कहा: {text}",
                voiceStatusProcessing: "आपका सवाल प्रोसेस किया जा रहा है...",
                voiceStatusPermission: "माइक्रोफोन permission allow करें, फिर दोबारा कोशिश करें।",
                voiceStatusError: "वॉइस इनपुट में समस्या आई। दोबारा कोशिश करें।",
                voiceStatusUnsupported: "इस browser में voice input support नहीं है।",
                voiceStatusNoSpeech: "आवाज़ साफ़ नहीं मिली। कृपया फिर से बोलें।",
                voiceStatusReplying: "डॉ. असिस्टेंट बोल रहा है...",
                voiceStatusReadyNext: "आपका अगला सवाल सुनने के लिए तैयार हूँ।",
                voiceStatusContinuousStopped: "Continuous mode बंद है। Voice doctor mode रोक दिया गया है।",
                voiceConversationStart: "वॉइस बातचीत शुरू करें",
                voiceConversationStop: "वॉइस बातचीत बंद करें",
                wakeWordToggle: "वेक वर्ड (Hello Doctor)",
                chatPlaceholder: "अपने लक्षण या सवाल लिखें या बोलें..."
            },
            es: {
                dashboard: "Panel",
                chat: "Asistente IA",
                appointments: "Citas",
                records: "Registros Médicos",
                symptoms: "Rastreador de Síntomas",
                doctors: "Buscar Doctores",
                pharmacy: "Farmacia",
                reports: "Reportes de Salud",
                emergency: "Emergencia",
                search: "Buscar síntomas, doctores, medicinas...",
                bookAppointment: "Agendar Cita",
                askAI: "Preguntar a IA",
                symptomCheck: "Verificador de Síntomas",
                findDoctor: "Buscar Doctor"
            },
            fr: {
                dashboard: "Tableau de bord",
                chat: "Assistant IA",
                appointments: "Rendez-vous",
                records: "Dossiers Médicaux",
                symptoms: "Suivi des Symptômes",
                doctors: "Trouver des Médecins",
                pharmacy: "Pharmacie",
                reports: "Rapports de Santé",
                emergency: "Urgence",
                search: "Rechercher symptômes, médecins, médicaments...",
                bookAppointment: "Prendre Rendez-vous",
                askAI: "Demander à l'IA",
                symptomCheck: "Vérificateur de Symptômes",
                findDoctor: "Trouver un Médecin"
            }
        };
    }

    init() {
        try {
            console.log('🚀 Initializing Enhanced Medibot Portal...');
            if (!localStorage.getItem('medibot-language')) {
                localStorage.setItem('medibot-language', this.currentLanguage);
            }
            this.setupTheme();
            this.setupEventListeners();
            this.createBackgroundEffects();
            this.setupCharts();
            this.setupSpeechRecognition();
            this.setupVoiceSynthesis();
            this.updateUITexts();
            this.initializeNotifications();
            this.startHealthSimulation();
            this.checkAuthenticationStatus();
            this.setupModernEnhancements();
            this.hideLoadingScreen();

            // Add chat debugging
            this.debugChatSetup();

            // Ensure appointment modal is always ready
            this.ensureAppointmentModalReady();
            this.setupMobileVoiceFab();

            console.log('✅ Enhanced Medibot Portal initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing portal:', error);
            // Force hide loading screen even if there's an error
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }
    }

    debugChatSetup() {
        console.log('🔍 Debug: Checking chat elements...');
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-message');
        const chatMessages = document.getElementById('chat-messages');

        console.log('Chat Input:', chatInput ? '✅ Found' : '❌ Missing');
        console.log('Send Button:', sendButton ? '✅ Found' : '❌ Missing');
        console.log('Chat Messages:', chatMessages ? '✅ Found' : '❌ Missing');

        // Add a manual test function to window
        window.testChat = () => {
            console.log('🧪 Manual chat test...');
            if (window.medibotPortal) {
                window.medibotPortal.addChatMessage('Test message from user', 'user');
                setTimeout(() => {
                    window.medibotPortal.addChatMessage('Test AI response! 🤖', 'bot');
                }, 1000);
            }
        };

        // Add manual send function
        window.testSend = (msg) => {
            console.log('🧪 Manual send test...');
            if (window.medibotPortal) {
                window.medibotPortal.sendChatMessage();
            }
        };

        console.log('💡 Type "testChat()" in console to test chat manually');
    }

    setupModernEnhancements() {
        // Smooth scrolling for navigation
        this.setupSmoothScrolling();

        // Enhanced hover effects
        this.setupHoverEffects();

        // Particle system for background
        this.setupParticleSystem();

        // Enhanced loading animations
        this.setupLoadingAnimations();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Auto-save functionality
        this.setupAutoSave();

        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    setupSmoothScrolling() {
        // Smooth scroll to sections
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupHoverEffects() {
        // Enhanced hover effects for cards and buttons
        const cards = document.querySelectorAll('.stat-card, .doctor-card, .hospital-card, .medicine-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                gsap.to(card, {
                    duration: 0.3,
                    y: -8,
                    scale: 1.02,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                });
            });

            card.addEventListener('mouseleave', (e) => {
                gsap.to(card, {
                    duration: 0.3,
                    y: 0,
                    scale: 1,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                });
            });
        });
    }

    setupParticleSystem() {
        // Create floating particles for enhanced visual appeal
        const particleContainer = document.createElement('div');
        particleContainer.id = 'floating-particles';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: ${Math.random() > 0.5 ? 'rgba(14, 165, 233, 0.3)' : 'rgba(236, 72, 153, 0.3)'};
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 10}s linear infinite;
            `;
            particleContainer.appendChild(particle);
        }

        document.body.appendChild(particleContainer);
    }

    setupLoadingAnimations() {
        // Enhanced loading animations for better UX
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                }
            });
        });

        document.querySelectorAll('.stat-card, .doctor-card, .hospital-card').forEach(card => {
            observer.observe(card);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('global-search');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }

            // Alt + D for dashboard
            if (e.altKey && e.key === 'd') {
                e.preventDefault();
                this.navigateToPage('dashboard');
            }

            // Alt + E for emergency
            if (e.altKey && e.key === 'e') {
                e.preventDefault();
                this.navigateToPage('emergency');
            }
        });
    }

    setupAutoSave() {
        // Auto-save form data
        let autoSaveTimer;
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                clearTimeout(autoSaveTimer);
                autoSaveTimer = setTimeout(() => {
                    const formData = this.collectFormData();
                    localStorage.setItem('medibot-autosave', JSON.stringify(formData));
                    this.showAutoSaveIndicator();
                }, 1000);
            }
        });
    }

    setupPerformanceMonitoring() {
        // Monitor performance and show optimizations
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData.loadEventEnd - perfData.loadEventStart > 3000) {
                        console.log('⚡ Performance tip: Consider optimizing loading times');
                    }
                }, 1000);
            });
        }
    }

    collectFormData() {
        const formData = {};
        document.querySelectorAll('input, textarea, select').forEach(element => {
            if (element.id) {
                formData[element.id] = element.value;
            }
        });
        return formData;
    }

    showAutoSaveIndicator() {
        let indicator = document.getElementById('autosave-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'autosave-indicator';
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--accent-success);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
                z-index: 1000;
            `;
            indicator.textContent = '💾 Auto-saved';
            document.body.appendChild(indicator);
        }

        indicator.style.opacity = '1';
        indicator.style.transform = 'translateY(0)';

        setTimeout(() => {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateY(20px)';
        }, 2000);
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.classList.remove('modal-open');
    }

    checkAuthenticationStatus() {
        fetch('/api/me', { credentials: 'same-origin' })
            .then(response => response.json().then(data => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                if (ok && data.authenticated && data.user) {
                    this.authenticateUser({
                        ...data.user,
                        avatar: data.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${data.user.firstName || 'Guest'} ${data.user.lastName || ''}`.trim())}&background=00d4ff&color=fff`,
                        plan: data.user.plan || 'Patient Account'
                    }, false);
                    localStorage.setItem('medibotUser', JSON.stringify(data.user));
                    localStorage.setItem('medibot_user', JSON.stringify({
                        ...data.user,
                        name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim(),
                        isLoggedIn: true,
                        userType: 'patient'
                    }));
                    return;
                }

                const fallbackRaw = localStorage.getItem('medibot-user') || localStorage.getItem('medibotUser') || localStorage.getItem('medibot_user');
                if (!fallbackRaw) {
                    console.log('👤 No user authentication found - showing guest mode');
                    return;
                }

                try {
                    const fallbackUser = JSON.parse(fallbackRaw);
                    this.authenticateUser({
                        ...fallbackUser,
                        firstName: fallbackUser.firstName || fallbackUser.name?.split(' ')[0] || 'Guest',
                        lastName: fallbackUser.lastName || '',
                        avatar: fallbackUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackUser.firstName || fallbackUser.name || 'Guest')}&background=00d4ff&color=fff`,
                        plan: fallbackUser.plan || 'Patient Account'
                    }, false);
                } catch (error) {
                    console.error('Error parsing fallback auth data:', error);
                }
            })
            .catch(error => {
                console.error('Authentication status check failed:', error);
            });
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    console.log('✅ Loading screen hidden successfully');
                }, 300);
            }
        }, 800); // Reduced from 2000ms to 800ms
    }

    setupTheme() {
        console.log(`🎨 Setting up theme: ${this.currentTheme}`);

        // Set data-theme attribute on document
        document.documentElement.setAttribute('data-theme', this.currentTheme);

        // Update body class for additional styling
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${this.currentTheme}-theme`);

        // Update theme toggle button
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            const icon = themeBtn.querySelector('i');
            if (icon) {
                icon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }

            // Update button tooltip
            themeBtn.title = `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} mode`;
        }

        console.log(`✅ Theme setup complete: ${this.currentTheme}`);
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');

        // Sidebar toggle - with null checks
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Language change
        const languageSelect = document.getElementById('portal-language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
        }

        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.getAttribute('data-action');
                console.log('🎯 Quick action triggered:', action);
                this.handleQuickAction(action);
            });
        });

        // Chat functionality - with comprehensive null checks
        const sendButton = document.getElementById('send-message');
        const chatInput = document.getElementById('chat-input');
        const voiceInput = document.getElementById('voice-input');

        if (sendButton) {
            sendButton.addEventListener('click', () => {
                console.log('📤 Send button clicked');
                this.sendChatMessage();
            });
        } else {
            console.warn('⚠️ Send button not found - will try again later');
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('⌨️ Enter key pressed');
                    this.sendChatMessage();
                }
            });
        } else {
            console.warn('⚠️ Chat input not found - will try again later');
        }

        if (voiceInput) {
            voiceInput.addEventListener('click', () => {
                console.log('🎤 Voice input clicked');
                this.toggleVoiceInput();
            });
        } else {
            console.warn('⚠️ Voice input not found');
        }

        // Document sharing functionality
        const uploadDocumentsBtn = document.getElementById('upload-documents');
        if (uploadDocumentsBtn) {
            uploadDocumentsBtn.addEventListener('click', () => {
                const docInput = document.getElementById('document-input');
                if (docInput) docInput.click();
            });
        }

        const aiAnalysisBtn = document.getElementById('ai-analysis');
        if (aiAnalysisBtn) {
            aiAnalysisBtn.addEventListener('click', () => this.openAnalysisModal());
        }

        // Analysis modal events - ALL WITH NULL CHECKS
        const analysisUploadArea = document.getElementById('analysis-upload-area');
        if (analysisUploadArea) {
            analysisUploadArea.addEventListener('click', () => {
                const fileInput = document.getElementById('analysis-file-input');
                if (fileInput) fileInput.click();
            });
        }

        const analysisFileInput = document.getElementById('analysis-file-input');
        if (analysisFileInput) {
            analysisFileInput.addEventListener('change', (e) => {
                this.handleAnalysisUpload(e.target.files);
            });
        }

        const nextStepButton = document.getElementById('next-step');
        if (nextStepButton) {
            nextStepButton.addEventListener('click', () => this.nextAnalysisStep());
        }

        const prevStepButton = document.getElementById('prev-step');
        if (prevStepButton) {
            prevStepButton.addEventListener('click', () => this.prevAnalysisStep());
        }

        const startAnalysisButton = document.getElementById('start-analysis');
        if (startAnalysisButton) {
            startAnalysisButton.addEventListener('click', () => this.startAIAnalysis());
        }

        // Drag and drop for analysis - with null check
        const uploadArea = document.getElementById('analysis-upload-area');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                this.handleAnalysisUpload(e.dataTransfer.files);
            });
        }

        // Drag and drop for chat file upload
        const chatUploadArea = document.getElementById('chat-file-upload-area');
        if (chatUploadArea) {
            chatUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                chatUploadArea.classList.add('dragover');
            });

            chatUploadArea.addEventListener('dragleave', (e) => {
                if (!chatUploadArea.contains(e.relatedTarget)) {
                    chatUploadArea.classList.remove('dragover');
                }
            });

            chatUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                chatUploadArea.classList.remove('dragover');
                this.handleChatFileUpload(e.dataTransfer.files);
            });

            // File input for chat
            const chatFileInput = document.getElementById('chat-file-input');
            if (chatFileInput) {
                chatFileInput.addEventListener('change', (e) => {
                    this.handleChatFileUpload(e.target.files);
                });
            }

            // Upload button click handler
            const uploadButton = chatUploadArea.querySelector('.upload-btn');
            if (uploadButton && chatFileInput) {
                uploadButton.addEventListener('click', () => chatFileInput.click());
            }

            // Analyze reports button
            const analyzeButton = document.getElementById('analyze-reports-btn');
            if (analyzeButton) {
                analyzeButton.addEventListener('click', () => {
                    this.analyzeUploadedReports();
                });
            }
        }

        // Appointment booking
        const bookAppointmentBtn = document.getElementById('book-new-appointment');
        if (bookAppointmentBtn) {
            bookAppointmentBtn.addEventListener('click', () => {
                console.log('📅 Book new appointment button clicked');
                this.openAppointmentModal();
            });
        } else {
            console.warn('⚠️ Book appointment button not found');
        }

        // Modal handlers
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('✖️ Modal close button clicked');
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Global search
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }

        // Responsive handling
        window.addEventListener('resize', () => this.handleResize());

        // Emergency button
        const emergencyBtn = document.querySelector('.btn-emergency');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', () => this.handleEmergency());
        }

        // Authentication events
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.openAuthModal('login'));
        }

        const signupBtn = document.getElementById('signup-btn');
        if (signupBtn) {
            signupBtn.addEventListener('click', () => this.openAuthModal('signup'));
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Auth tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabType = e.target.getAttribute('data-tab');
                this.switchAuthTab(tabType);
            });
        });

        // Auth form submissions
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e);
            });
        }

        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup(e);
            });
        }

        // Appointment form submission
        // Appointment form submission
        const appointmentForm = document.getElementById('appointment-form');
        if (appointmentForm) {
            console.log('✅ Appointment form found, adding submit listener');
            appointmentForm.addEventListener('submit', (e) => {
                console.log('📋 Appointment form submitted');
                e.preventDefault();
                this.bookAppointment(e);
            });
        } else {
            console.warn('⚠️ Appointment form not found in DOM');
        }

        // Appointment cancellation buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-danger') && e.target.closest('.appointment-card')) {
                const card = e.target.closest('.appointment-card');
                const appointmentId = card.dataset.appointmentId;
                if (appointmentId) {
                    this.cancelAppointment(appointmentId);
                }
            }
        });

        // Medical records controls
        const openRecordUploadBtn = document.getElementById('open-upload-modal-btn');
        if (openRecordUploadBtn) {
            openRecordUploadBtn.addEventListener('click', () => this.openRecordUploadModal());
        }

        const recordTypeFilter = document.getElementById('record-type-filter');
        const recordDateFilter = document.getElementById('record-date-filter');
        if (recordTypeFilter) {
            recordTypeFilter.addEventListener('change', () => this.applyRecordFilters());
        }
        if (recordDateFilter) {
            recordDateFilter.addEventListener('change', () => this.applyRecordFilters());
        }

        const recordUploadForm = document.getElementById('record-upload-form');
        if (recordUploadForm) {
            recordUploadForm.addEventListener('submit', (e) => this.handleRecordUpload(e));
        }

        const medicalRecordFileInput = document.getElementById('medical-record-file');
        if (medicalRecordFileInput) {
            medicalRecordFileInput.addEventListener('change', () => {
                const submitBtn = document.getElementById('upload-record-submit-btn');
                if (submitBtn) {
                    submitBtn.disabled = !(medicalRecordFileInput.files && medicalRecordFileInput.files.length > 0);
                }
            });
        }

        const recordUploadArea = document.getElementById('record-upload-area');
        if (recordUploadArea && medicalRecordFileInput) {
            recordUploadArea.addEventListener('click', () => medicalRecordFileInput.click());
        }

        const recordUploadCloseBtn = document.getElementById('record-upload-close-btn');
        if (recordUploadCloseBtn) {
            recordUploadCloseBtn.addEventListener('click', () => this.closeRecordUploadModal());
        }

        const recordUploadCancelBtn = document.getElementById('record-upload-cancel-btn');
        if (recordUploadCancelBtn) {
            recordUploadCancelBtn.addEventListener('click', () => this.closeRecordUploadModal());
        }

        const exportRecordsBtn = document.querySelector('.records-actions .btn-primary');
        if (exportRecordsBtn) {
            exportRecordsBtn.addEventListener('click', () => this.exportAllRecords());
        }

        const recordUploadModal = document.getElementById('record-upload-modal');
        if (recordUploadModal) {
            recordUploadModal.addEventListener('click', (e) => {
                if (e.target === recordUploadModal) {
                    this.closeRecordUploadModal();
                }
            });
        }

        document.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.record-actions .btn-sm[data-action]');
            if (!actionBtn) {
                return;
            }

            const recordId = actionBtn.getAttribute('data-record-id');
            const action = actionBtn.getAttribute('data-action');
            if (action === 'view') {
                this.viewRecord(recordId);
            } else if (action === 'download') {
                this.downloadRecord(recordId);
            }
        });

        document.addEventListener('click', (e) => {
            const button = e.target.closest('[data-report-action]');
            if (!button) {
                return;
            }

            const action = button.getAttribute('data-report-action');
            if (action === 'generate') {
                this.generateHealthSnapshotReport();
            } else if (action === 'export-latest') {
                this.exportLatestHealthReport();
            } else if (action === 'export-all') {
                this.exportAllHealthReports();
            }
        });

        // Appointment tab filtering (Upcoming / Past / Cancelled)
        document.querySelectorAll('.appointments-tabs .tab-btn').forEach(tabBtn => {
            tabBtn.addEventListener('click', () => {
                const tab = tabBtn.getAttribute('data-tab') || 'upcoming';
                this.setAppointmentsTab(tab);
            });
        });

        // Password strength checker
        const signupPasswordInput = document.getElementById('signup-password');
        if (signupPasswordInput) {
            signupPasswordInput.addEventListener('input', (e) => {
                this.checkPasswordStrength(e.target.value);
            });
        }

        // Social login buttons
        document.querySelectorAll('.btn-social').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const provider = btn.classList.contains('google') ? 'google' : 'facebook';
                this.handleSocialLogin(provider);
            });
        });

        // Update UI based on auth state
        this.updateAuthUI();

        console.log('✅ Event listeners setup complete');
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
        this.sidebarOpen = sidebar.classList.contains('open');
    }

    navigateToPage(page) {
        if (!page) {
            return;
        }

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeNavItem = document.querySelector(`[data-page="${page}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (!targetPage) {
            return;
        }
        targetPage.classList.add('active');

        // Update breadcrumb
        document.getElementById('current-page').textContent = this.getPageTitle(page);

        this.currentPage = page;
        this.applyChatFullscreen(this.chatFullscreen);

        // Initialize page-specific functionality
        this.initializePage(page);
    }

    getPageTitle(page) {
        const t = this.translations[this.currentLanguage];
        return t[page] || page;
    }

    initializePage(page) {
        switch (page) {
            case 'chat':
                this.initializeChat();
                break;
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'appointments':
                this.loadAppointments();
                break;
            case 'records':
                this.loadRecords();
                break;
            case 'symptoms':
                this.initializeSymptomTracker();
                this.displayCurrentSymptoms();
                this.displaySymptomHistory();
                this.updateSymptomCharts();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'pharmacy':
                if (pharmacyManager) {
                    pharmacyManager.loadMedicines();
                    pharmacyManager.renderCart();
                }
                break;
            case 'emergency':
                if (emergencyManager) {
                    emergencyManager.initializeEmergencyPage();
                }
                break;
        }
    }

    toggleTheme() {
        console.log(`🔄 Toggling theme from ${this.currentTheme}`);

        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('medibot-theme', this.currentTheme);

        console.log(`🎨 New theme: ${this.currentTheme}`);

        this.setupTheme();

        // Show notification
        this.showNotification(`Switched to ${this.currentTheme} mode`, 'success');

        // Smooth theme transition animation
        if (typeof gsap !== 'undefined') {
            gsap.to(document.body, {
                duration: 0.3,
                ease: "power2.inOut"
            });
        }
    }

    changeLanguage(language) {
        const selectedLanguage = ['hi', 'en'].includes(language) ? language : 'hi';
        this.currentLanguage = selectedLanguage;
        this.voiceLocale = selectedLanguage === 'en' ? 'en-US' : 'hi-IN';
        localStorage.setItem('medibot-language', selectedLanguage);
        this.updateUITexts();
        this.setupSpeechRecognition();
    }

    getText(key) {
        return this.translations[this.currentLanguage][key] || this.translations['en'][key] || key;
    }

    updateUITexts() {
        // Update navigation
        document.querySelectorAll('.nav-link span').forEach((span, index) => {
            const keys = ['dashboard', 'chat', 'appointments', 'records', 'symptoms', 'doctors', 'pharmacy', 'reports', 'emergency'];
            span.textContent = this.getText(keys[index]);
        });

        const languageSelect = document.getElementById('portal-language-select');
        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
        }

        // Update search placeholder
        document.getElementById('global-search').placeholder = this.getText('search');

        // Update current page title
        document.getElementById('current-page').textContent = this.getPageTitle(this.currentPage);

        // Update quick action buttons
        const actionTexts = ['bookAppointment', 'askAI', 'symptomCheck', 'findDoctor'];
        document.querySelectorAll('.action-btn').forEach((btn, index) => {
            const textNode = btn.childNodes[btn.childNodes.length - 1];
            if (textNode.nodeType === Node.TEXT_NODE) {
                textNode.textContent = this.getText(actionTexts[index]);
            }
        });

        const doctorAssistantTitle = document.getElementById('doctor-assistant-title');
        if (doctorAssistantTitle) {
            doctorAssistantTitle.textContent = this.getText('doctorAssistantTitle');
        }

        const doctorAssistantSubtitle = document.getElementById('doctor-assistant-subtitle');
        if (doctorAssistantSubtitle) {
            doctorAssistantSubtitle.textContent = this.getText('doctorAssistantSubtitle');
        }

        const voiceModeTitle = document.getElementById('voice-mode-title');
        if (voiceModeTitle) {
            voiceModeTitle.textContent = this.getText('voiceModeTitle');
        }

        const wakeWordToggleLabel = document.getElementById('wake-word-toggle-label');
        if (wakeWordToggleLabel) {
            wakeWordToggleLabel.textContent = this.getText('wakeWordToggle');
        }

        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.placeholder = this.getText('chatPlaceholder');
        }

        this.updateVoiceAssistantUI();
    }

    createBackgroundEffects() {
        // Create floating particles
        const particlesContainer = document.getElementById('background-particles');
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
        position: absolute;
        width: ${2 + Math.random() * 4}px;
        height: ${2 + Math.random() * 4}px;
        background: var(--accent-primary);
        border-radius: 50%;
        opacity: ${0.1 + Math.random() * 0.3};
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${10 + Math.random() * 20}s infinite linear;
      `;
            particlesContainer.appendChild(particle);
        }

        // Add CSS animation for particles
        const style = document.createElement('style');
        style.textContent = `
      @keyframes float {
        0% { transform: translateY(100vh) rotate(0deg); }
        100% { transform: translateY(-10px) rotate(360deg); }
      }
    `;
        document.head.appendChild(style);
    }
    setupCharts() {
        // Destroy existing charts first to prevent "Canvas already in use" error
        if (this.charts.health) {
            this.charts.health.destroy();
            this.charts.health = null;
        }
        if (this.charts.activity) {
            this.charts.activity.destroy();
            this.charts.activity = null;
        }

        // Dashboard Health Chart
        const healthCtx = document.getElementById('dashboard-health-chart');
        if (healthCtx) {
            this.charts.health = new Chart(healthCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Heart Rate',
                        data: [72, 75, 70, 78, 72, 74],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Blood Pressure',
                        data: [120, 118, 122, 115, 119, 121],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') },
                            grid: { color: 'rgba(0, 212, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') },
                            grid: { color: 'rgba(0, 212, 255, 0.1)' }
                        }
                    }
                }
            });
        }

        // Dashboard Activity Chart
        const activityCtx = document.getElementById('dashboard-activity-chart');
        if (activityCtx) {
            this.charts.activity = new Chart(activityCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Exercise', 'Sleep', 'Work', 'Leisure'],
                    datasets: [{
                        data: [3, 8, 8, 5],
                        backgroundColor: [
                            '#22c55e',
                            '#3b82f6',
                            '#f59e0b',
                            '#8b5cf6'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                            }
                        }
                    }
                }
            });
        }
    }
    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            const languageMap = {
                'en': 'en-US',
                'hi': 'hi-IN',
                'es': 'es-ES',
                'fr': 'fr-FR'
            };

            this.recognition.lang = languageMap[this.currentLanguage] || 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                document.getElementById('voice-input').classList.add('listening');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('chat-input').value = transcript;
                this.sendChatMessage();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                document.getElementById('voice-input').classList.remove('listening');
            };
        }
    }

    handleQuickAction(action) {
        switch (action) {
            case 'book-appointment':
                this.openAppointmentModal();
                break;
            case 'ai-chat':
                this.navigateToPage('chat');
                break;
            case 'symptom-check':
                this.navigateToPage('symptoms');
                break;
            case 'find-doctor':
                this.navigateToPage('doctors');
                break;
        }
    }

    initializeChat() {
        console.log('🔄 Initializing Chat...');

        // Draw AI avatar
        this.drawAIAvatar();

        // Add welcome message if chat is empty
        const messages = document.getElementById('chat-messages');
        if (messages && messages.children.length === 0) {
            this.addChatWelcomeMessage();
        }

        // Setup chat event listeners properly
        this.setupChatEventListeners();
        this.setupChatControlButtons();
        this.setupVoiceAssistantPanel();
        this.applyChatFullscreen(this.chatFullscreen);
    }

    setupVoiceAssistantPanel() {
        const voiceConversationButton = document.getElementById('start-voice-conversation');
        if (voiceConversationButton && !voiceConversationButton.dataset.bound) {
            voiceConversationButton.dataset.bound = 'true';
            voiceConversationButton.addEventListener('click', () => this.toggleVoiceConversationMode());
        }

        const wakeWordToggle = document.getElementById('wake-word-toggle');
        if (wakeWordToggle && !wakeWordToggle.dataset.bound) {
            wakeWordToggle.dataset.bound = 'true';
            wakeWordToggle.checked = !!this.wakeWordEnabled;
            wakeWordToggle.addEventListener('change', () => {
                this.wakeWordEnabled = wakeWordToggle.checked;
                this.awaitingWakeWord = this.wakeWordEnabled;
                localStorage.setItem('medibot-wake-word', this.wakeWordEnabled ? 'on' : 'off');

                if (this.voiceConversationActive) {
                    this.updateVoiceStatus(this.awaitingWakeWord ? this.getText('voiceStatusWake') : this.getText('voiceStatusListening'));
                    if (!this.awaitingWakeWord && !this.isListening) {
                        this.startListening();
                    }
                }
            });
        }

        this.updateVoiceAssistantUI();
    }

    setupMobileVoiceFab() {
        const mobileVoiceFab = document.getElementById('mobile-voice-fab');
        if (mobileVoiceFab && !mobileVoiceFab.dataset.bound) {
            mobileVoiceFab.dataset.bound = 'true';
            mobileVoiceFab.addEventListener('click', () => {
                this.navigateToPage('chat');
                this.toggleVoiceConversationMode();
            });
        }

        this.updateMobileVoiceFab();
    }

    toggleVoiceConversationMode() {
        this.voiceConversationActive = !this.voiceConversationActive;

        if (this.voiceConversationActive) {
            this.autoSpeakResponses = true;
            this.continuousConversation = true;
            this.awaitingWakeWord = true;
            localStorage.setItem('medibot-chat-voice', 'on');
            localStorage.setItem('medibot-chat-continuous', 'on');
            this.updateVoiceStatus(this.getText('voiceStatusWake'));
            this.updateChatControlState();
            this.startListening();
        } else {
            this.stopVoiceConversationMode();
        }
    }

    stopVoiceConversationMode() {
        this.voiceConversationActive = false;
        this.awaitingWakeWord = true;
        this.updateVoiceStatus(this.getText('voiceStatusIdle'));
        this.stopListening();
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        this.updateVoiceAssistantUI();
    }

    updateVoiceStatus(message) {
        this.voiceStatusText = message;
        this.updateVoiceAssistantUI();
    }

    updateVoiceAssistantUI() {
        const voiceStatusText = document.getElementById('voice-status-text');
        const voiceStatusDot = document.getElementById('voice-status-dot');
        const voiceConversationButton = document.getElementById('start-voice-conversation');
        const wakeWordToggle = document.getElementById('wake-word-toggle');

        if (voiceStatusText) {
            voiceStatusText.textContent = this.voiceStatusText;
        }

        if (voiceStatusDot) {
            voiceStatusDot.classList.toggle('active', this.voiceConversationActive && !this.isListening);
            voiceStatusDot.classList.toggle('listening', this.isListening);
        }

        if (voiceConversationButton) {
            voiceConversationButton.classList.toggle('active', this.voiceConversationActive);
            voiceConversationButton.innerHTML = this.voiceConversationActive
                ? `<i class="fas fa-phone-slash"></i> ${this.getText('voiceConversationStop')}`
                : `<i class="fas fa-headset"></i> ${this.getText('voiceConversationStart')}`;
        }

        if (wakeWordToggle) {
            wakeWordToggle.checked = !!this.wakeWordEnabled;
        }

        this.updateMobileVoiceFab();
    }

    updateMobileVoiceFab() {
        const mobileVoiceFab = document.getElementById('mobile-voice-fab');
        if (!mobileVoiceFab) {
            return;
        }

        mobileVoiceFab.classList.toggle('active', this.voiceConversationActive);
        mobileVoiceFab.title = this.voiceConversationActive ? this.getText('voiceConversationStop') : this.getText('voiceConversationStart');
    }

    setupChatControlButtons() {
        const voiceToggle = document.getElementById('voice-toggle');
        const fullscreenToggle = document.getElementById('chat-settings');
        const continuousToggle = document.getElementById('continuous-toggle');

        if (voiceToggle && !voiceToggle.dataset.bound) {
            voiceToggle.dataset.bound = 'true';
            voiceToggle.addEventListener('click', () => this.toggleVoiceResponses());
        }

        if (fullscreenToggle && !fullscreenToggle.dataset.bound) {
            fullscreenToggle.dataset.bound = 'true';
            fullscreenToggle.addEventListener('click', () => this.toggleChatFullscreen());
        }

        if (continuousToggle && !continuousToggle.dataset.bound) {
            continuousToggle.dataset.bound = 'true';
            continuousToggle.addEventListener('click', () => this.toggleContinuousConversation());
        }

        this.updateChatControlState();
    }

    updateChatControlState() {
        const voiceToggle = document.getElementById('voice-toggle');
        const fullscreenToggle = document.getElementById('chat-settings');
        const continuousToggle = document.getElementById('continuous-toggle');

        if (voiceToggle) {
            voiceToggle.classList.toggle('active', this.autoSpeakResponses);
            voiceToggle.innerHTML = this.autoSpeakResponses
                ? '<i class="fas fa-volume-up"></i>'
                : '<i class="fas fa-volume-mute"></i>';
            voiceToggle.title = this.autoSpeakResponses ? 'आवाज़ में जवाब चालू हैं' : 'आवाज़ में जवाब बंद हैं';
        }

        if (fullscreenToggle) {
            const immersiveActive = this.chatFullscreen && this.currentPage === 'chat';
            fullscreenToggle.classList.toggle('active', immersiveActive);
            fullscreenToggle.innerHTML = immersiveActive
                ? '<i class="fas fa-compress"></i>'
                : '<i class="fas fa-expand"></i>';
            fullscreenToggle.title = immersiveActive ? 'फुल स्क्रीन चैट बंद करें' : 'फुल स्क्रीन चैट चालू करें';
        }

        if (continuousToggle) {
            continuousToggle.classList.toggle('active', this.continuousConversation);
            continuousToggle.innerHTML = this.continuousConversation
                ? '<i class="fas fa-link"></i>'
                : '<i class="fas fa-unlink"></i>';
            continuousToggle.title = this.continuousConversation
                ? 'लगातार बातचीत मोड चालू है'
                : 'लगातार बातचीत मोड बंद है';
        }

        this.updateVoiceAssistantUI();
    }

    toggleVoiceResponses() {
        this.autoSpeakResponses = !this.autoSpeakResponses;
        localStorage.setItem('medibot-chat-voice', this.autoSpeakResponses ? 'on' : 'off');
        this.updateChatControlState();
        this.showNotification(
            this.autoSpeakResponses ? 'वॉइस असिस्टेंट चालू हो गया।' : 'वॉइस असिस्टेंट म्यूट हो गया।',
            'info'
        );
    }

    toggleChatFullscreen() {
        this.chatFullscreen = !this.chatFullscreen;
        localStorage.setItem('medibot-chat-fullscreen', this.chatFullscreen ? 'on' : 'off');
        this.applyChatFullscreen(this.chatFullscreen);
    }

    toggleContinuousConversation() {
        this.continuousConversation = !this.continuousConversation;
        localStorage.setItem('medibot-chat-continuous', this.continuousConversation ? 'on' : 'off');
        this.updateChatControlState();
        this.showNotification(
            this.continuousConversation ? 'Continuous conversation enabled.' : 'Continuous conversation disabled.',
            'info'
        );

        if (!this.continuousConversation && this.voiceConversationActive) {
            this.voiceConversationActive = false;
            this.updateVoiceStatus(this.getText('voiceStatusContinuousStopped'));
        }
    }

    applyChatFullscreen(enabled) {
        const shouldEnable = Boolean(enabled && this.currentPage === 'chat');
        document.body.classList.toggle('chat-immersive', shouldEnable);
        this.updateChatControlState();
    }

    setupChatEventListeners() {
        console.log('🔧 Setting up chat event listeners...');

        // Wait a bit for DOM to be ready
        setTimeout(() => {
            const sendButton = document.getElementById('send-message');
            const chatInput = document.getElementById('chat-input');
            const voiceInput = document.getElementById('voice-input');

            console.log('Send Button:', sendButton ? '✅' : '❌');
            console.log('Chat Input:', chatInput ? '✅' : '❌');
            console.log('Voice Input:', voiceInput ? '✅' : '❌');

            if (sendButton) {
                // Remove any existing listeners
                sendButton.replaceWith(sendButton.cloneNode(true));
                const newSendButton = document.getElementById('send-message');

                newSendButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('📤 Send button clicked!');
                    this.sendChatMessage();
                });
                console.log('✅ Send button listener added');
            }

            if (chatInput) {
                // Remove any existing listeners  
                chatInput.replaceWith(chatInput.cloneNode(true));
                const newChatInput = document.getElementById('chat-input');

                newChatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        console.log('⌨️ Enter key pressed!');
                        this.sendChatMessage();
                    }
                });
                console.log('✅ Chat input listener added');
            }

            if (voiceInput) {
                voiceInput.addEventListener('click', () => {
                    console.log('🎤 Voice input clicked');
                    this.toggleVoiceInput();
                });
            }

            const pushToTalkButton = document.getElementById('push-to-talk');
            if (pushToTalkButton && !pushToTalkButton.dataset.bound) {
                pushToTalkButton.dataset.bound = 'true';
                this.bindPushToTalk(pushToTalkButton);
            }
        }, 500);
    }

    bindPushToTalk(button) {
        const start = (event) => {
            if (event) {
                event.preventDefault();
            }
            this.pushToTalkActive = true;
            button.classList.add('listening');
            this.startListening();
        };

        const stop = (event) => {
            if (event) {
                event.preventDefault();
            }
            this.pushToTalkActive = false;
            button.classList.remove('listening');
            this.stopListening();
        };

        button.addEventListener('mousedown', start);
        button.addEventListener('mouseup', stop);
        button.addEventListener('mouseleave', stop);
        button.addEventListener('touchstart', start, { passive: false });
        button.addEventListener('touchend', stop);
        button.addEventListener('touchcancel', stop);
    }

    drawAIAvatar() {
        const canvas = document.getElementById('ai-doctor-avatar');
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Create gradient
        const gradient = ctx.createRadialGradient(30, 30, 10, 30, 30, 25);
        gradient.addColorStop(0, '#00d4ff');
        gradient.addColorStop(1, '#0ea5e9');

        // Draw avatar
        ctx.beginPath();
        ctx.arc(30, 30, 25, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add medical cross
        ctx.fillStyle = 'white';
        ctx.fillRect(27, 20, 6, 20);
        ctx.fillRect(20, 27, 20, 6);
    }

    addChatWelcomeMessage() {
        const messages = document.getElementById('chat-messages');
        const message = document.createElement('div');
        message.className = 'chat-message bot-message';
        message.innerHTML = `
      <div class="message-avatar">
        <canvas width="40" height="40"></canvas>
      </div>
      <div class="message-content">
        <div class="message-bubble">
          <div class="welcome-medical">
            <h4><i class="fas fa-stethoscope"></i> Welcome to MediBot AI</h4>
            <p>नमस्ते! मैं आपका AI Medical Assistant हूँ। मैं आपकी मदद कर सकता हूँ:</p>
            <ul>
              <li>🩺 लक्षणों का विश्लेषण और सलाह</li>
              <li>💊 दवाओं की जानकारी</li>
              <li>👨‍⚕️ डॉक्टर की सिफारिश</li>
              <li>🏥 अस्पताल सुझाव</li>
              <li>📋 स्वास्थ्य टिप्स और बचाव</li>
            </ul>
            <p style="color: var(--accent-primary); font-weight: 600;">
              अपने स्वास्थ्य संबंधी कोई भी समस्या या सवाल पूछें!
            </p>
            <div style="font-size: 0.85em; color: var(--text-muted); margin-top: 10px;">
              <strong>नोट:</strong> यह केवल सामान्य सलाह है। गंभीर समस्याओं के लिए तुरंत डॉक्टर से संपर्क करें।
            </div>
          </div>
        </div>
        <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    `;
        messages.appendChild(message);

        // Draw small avatar in message
        const canvas = message.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(20, 20, 5, 20, 20, 15);
        gradient.addColorStop(0, '#00d4ff');
        gradient.addColorStop(1, '#0ea5e9');
        ctx.beginPath();
        ctx.arc(20, 20, 15, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add medical cross
        ctx.fillStyle = 'white';
        ctx.fillRect(17, 12, 6, 16);
        ctx.fillRect(12, 17, 16, 6);
    }

    sendChatMessage() {
        console.log('💬 sendChatMessage called - START');

        const input = document.getElementById('chat-input');
        if (!input) {
            console.error('❌ Chat input element not found');
            alert('Chat input not found! Refresh the page.');
            return;
        }

        const message = input.value.trim();
        console.log('📝 Message content:', `"${message}"`);

        if (!message) {
            console.warn('⚠️ Empty message, showing alert');
            alert('Please type a message first!');
            return;
        }

        // Clear input immediately 
        input.value = '';
        console.log('✅ Input cleared');

        // Add user message to chat immediately
        console.log('📤 Adding user message to chat...');
        this.addChatMessage(message, 'user');

        // Show typing indicator
        console.log('⏳ Showing typing indicator...');
        this.showChatTyping();

        // Generate AI response after a short delay
        console.log('🤖 Setting up AI response timeout...');
        setTimeout(async () => {
            console.log('🤖 Generating AI response now...');
            this.hideChatTyping();
            const aiResponse = await this.generateAIResponse(message);

            // Support both implementations:
            // 1) generateAIResponse() directly appends bot messages
            // 2) generateAIResponse() returns a response string
            if (typeof aiResponse === 'string' && aiResponse.trim()) {
                this.addChatMessage(aiResponse, 'bot');
                this.speakResponse(aiResponse);
            }
        }, 800);

        console.log('💬 sendChatMessage completed - END');
    } addChatMessage(content, sender) {
        const messages = document.getElementById('chat-messages');
        const message = document.createElement('div');
        message.className = `chat-message ${sender}-message`;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (sender === 'user') {
            message.innerHTML = `
        <div class="message-content">
          <div class="message-bubble user-bubble">
            <p>${content}</p>
          </div>
          <div class="message-time">${time}</div>
        </div>
      `;
        } else {
            message.innerHTML = `
        <div class="message-avatar">
          <canvas width="40" height="40"></canvas>
        </div>
        <div class="message-content">
          <div class="message-bubble bot-bubble">
            ${content}
          </div>
          <div class="message-time">${time}</div>
        </div>
      `;

            // Draw avatar
            setTimeout(() => {
                const canvas = message.querySelector('canvas');
                const ctx = canvas.getContext('2d');
                const gradient = ctx.createRadialGradient(20, 20, 5, 20, 20, 15);
                gradient.addColorStop(0, '#00d4ff');
                gradient.addColorStop(1, '#0ea5e9');
                ctx.beginPath();
                ctx.arc(20, 20, 15, 0, 2 * Math.PI);
                ctx.fillStyle = gradient;
                ctx.fill();
            }, 0);
        }

        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;

        // Animate message
        gsap.from(message, {
            duration: 0.3,
            y: 20,
            opacity: 0,
            ease: "back.out(1.7)"
        });
    }

    showChatTyping() {
        const messages = document.getElementById('chat-messages');
        const typing = document.createElement('div');
        typing.id = 'typing-indicator';
        typing.className = 'chat-message bot-message typing';
        typing.innerHTML = `
      <div class="message-avatar">
        <canvas width="40" height="40"></canvas>
      </div>
      <div class="message-content">
        <div class="typing-bubble">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;
        messages.appendChild(typing);
        messages.scrollTop = messages.scrollHeight;

        // Draw avatar
        const canvas = typing.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(20, 20, 5, 20, 20, 15);
        gradient.addColorStop(0, '#00d4ff');
        gradient.addColorStop(1, '#0ea5e9');
        ctx.beginPath();
        ctx.arc(20, 20, 15, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    hideChatTyping() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }

    generateAIResponse(userMessage) {
        console.log('🤖 Generating AI response for:', userMessage);

        // Simple Hindi/English medical responses
        const responses = [
            `🩺 आपका सवाल: "${userMessage}" के लिए मैं यहाँ हूँ।

<div class="medical-response">
<h4>🔍 लक्षणों का विश्लेषण</h4>
<p>आपके बताए गए लक्षणों के आधार पर:</p>
<ul>
<li>💊 तुरंत आराम करें और पानी पिएं</li>
<li>🌡️ अपना temperature check करें</li>
<li>📞 यदि समस्या बढ़े तो डॉक्टर से संपर्क करें</li>
</ul>

<div class="alert alert-info">
<strong>💡 सुझाव:</strong> गंभीर समस्या होने पर तुरंत नजदीकी अस्पताल जाएं।
</div>

<p><strong>🏥 सुझाए गए डॉक्टर:</strong></p>
<ul>
<li>Dr. Rajesh Kumar (General Physician)</li>
<li>Dr. Priya Sharma (Specialist)</li>
</ul>
</div>`,

            `🏥 Hi! मैं आपकी मदद कर सकता हूँ।

<div class="medical-response">
<h4>🩺 Medical Assistance</h4>
<p>आपके सवाल "${userMessage}" के लिए:</p>

<p><strong>तुरंत करने योग्य कार्य:</strong></p>
<ul>
<li>🔍 अपने लक्षणों को monitor करें</li>
<li>💧 भरपूर पानी पिएं</li>
<li>😴 पूरा आराम लें</li>
</ul>

<div class="alert alert-warning">
<strong>⚠️ चेतावनी:</strong> यदि तकलीफ बढ़े तो तुरंत डॉक्टर से मिलें।
</div>

<p>क्या आपको और किसी चीज़ की जानकारी चाहिए?</p>
</div>`,

            `👨‍⚕️ नमस्ते! आपका AI Doctor यहाँ है।

<div class="medical-response">
<h4>🔬 स्वास्थ्य सलाह</h4>
<p>आपने पूछा: "${userMessage}"</p>

<p><strong>मेरी सिफारिश:</strong></p>
<ul>
<li>📋 अपने लक्षणों का record रखें</li>
<li>🏥 नजदीकी clinic में जाकर check-up कराएं</li>
<li>💊 बिना डॉक्टर की सलाह के दवा न लें</li>
</ul>

<div class="emergency-box">
🚨 <strong>Emergency में:</strong> 102 पर call करें या तुरंत hospital जाएं
</div>

<p>और कुछ पूछना चाहते हैं?</p>
</div>`
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        console.log('✅ AI Response generated');
        this.addChatMessage(randomResponse, 'bot');
    }

    generateMedicalResponse(userMessage) {
        const message = userMessage.toLowerCase();

        // Medical symptoms and conditions training data
        const medicalResponses = {
            // Symptoms
            'fever|temperature|bukhar|बुखार|ज्वर': {
                response: `<div class="medical-response">
          <h4><i class="fas fa-thermometer-half"></i> Fever Management</h4>
          <p><strong>Immediate steps:</strong></p>
          <ul>
            <li>Monitor temperature regularly</li>
            <li>Stay hydrated - drink plenty of fluids</li>
            <li>Rest and avoid strenuous activities</li>
            <li>Take paracetamol/acetaminophen as directed</li>
          </ul>
          <div class="alert alert-warning">
            <strong>⚠️ Seek immediate medical attention if:</strong>
            <li>Temperature > 103°F (39.4°C)</li>
            <li>Fever lasts more than 3 days</li>
            <li>Difficulty breathing or chest pain</li>
          </div>
          <p><strong>Recommended specialists:</strong> General Physician, Internal Medicine</p>
        </div>`,
                hi: `<div class="medical-response">
          <h4><i class="fas fa-thermometer-half"></i> बुखार का प्रबंधन</h4>
          <p><strong>तुरंत करें:</strong></p>
          <ul>
            <li>तापमान नियमित रूप से जांचें</li>
            <li>खूब पानी और तरल पदार्थ पिएं</li>
            <li>आराम करें, भारी काम न करें</li>
            <li>पेरासिटामोल/क्रोसिन निर्धारित मात्रा में लें</li>
          </ul>
          <div class="alert alert-warning">
            <strong>⚠️ तुरंत डॉक्टर के पास जाएं अगर:</strong>
            <li>तापमान 103°F (39.4°C) से अधिक हो</li>
            <li>बुखार 3 दिन से ज़्यादा रहे</li>
            <li>सांस लेने में तकलीफ या सीने में दर्द हो</li>
          </div>
          <p><strong>सुझाए गए विशेषज्ञ:</strong> सामान्य चिकित्सक, इंटरनल मेडिसिन</p>
        </div>`,
                doctors: ['Dr. Rahul Sharma (General Physician)', 'Dr. Priya Gupta (Internal Medicine)'],
                hospitals: ['City Medical Center', 'Apollo Hospital']
            },

            'headache|sir dard|सिरदर्द|सिर दर्द|migraine': {
                response: `<div class="medical-response">
          <h4><i class="fas fa-head-side-virus"></i> Headache Relief</h4>
          <p><strong>Common causes:</strong> Stress, dehydration, lack of sleep, eye strain</p>
          <p><strong>Home remedies:</strong></p>
          <ul>
            <li>Apply cold/warm compress to head or neck</li>
            <li>Stay hydrated - drink water</li>
            <li>Get adequate sleep (7-8 hours)</li>
            <li>Practice relaxation techniques</li>
          </ul>
          <div class="alert alert-info">
            <strong>Medications:</strong> Paracetamol, Ibuprofen (as per dosage)
          </div>
          <p><strong>Recommended specialists:</strong> Neurologist, General Physician</p>
        </div>`,
                hi: `<div class="medical-response">
          <h4><i class="fas fa-head-side-virus"></i> सिरदर्द से राहत</h4>
          <p><strong>सामान्य कारण:</strong> तनाव, कम पानी, नींद की कमी, आंखों की थकान</p>
          <p><strong>घरेलू उपाय:</strong></p>
          <ul>
            <li>सिर या गर्दन पर ठंडा/गर्म कपड़ा लगाएं</li>
            <li>पानी पिएं — शरीर में पानी की कमी न होने दें</li>
            <li>7-8 घंटे की पर्याप्त नींद लें</li>
            <li>ध्यान और गहरी सांस लेने का अभ्यास करें</li>
          </ul>
          <div class="alert alert-info">
            <strong>दवा:</strong> पेरासिटामोल, इबुप्रोफेन (निर्धारित मात्रा में)
          </div>
          <p><strong>सुझाए गए विशेषज्ञ:</strong> न्यूरोलॉजिस्ट, सामान्य चिकित्सक</p>
        </div>`,
                doctors: ['Dr. Amit Joshi (Neurologist)', 'Dr. Sunita Verma (General Physician)'],
                hospitals: ['Fortis Hospital', 'Max Healthcare']
            },

            'cough|khasi|खांसी|cold|सर्दी': {
                response: `<div class="medical-response">
          <h4><i class="fas fa-lungs"></i> Cough & Cold Care</h4>
          <p><strong>Types:</strong></p>
          <ul>
            <li><strong>Dry cough:</strong> Honey, warm water, throat lozenges</li>
            <li><strong>Wet cough:</strong> Steam inhalation, plenty of fluids</li>
          </ul>
          <p><strong>Home care:</strong></p>
          <ul>
            <li>Warm saltwater gargling</li>
            <li>Steam inhalation 2-3 times daily</li>
            <li>Avoid cold foods and drinks</li>
            <li>Use humidifier in room</li>
          </ul>
          <div class="alert alert-warning">
            <strong>See doctor if:</strong> Cough persists > 2 weeks, blood in cough, high fever
          </div>
          <p><strong>Recommended specialists:</strong> Pulmonologist, ENT Specialist</p>
        </div>`,
                hi: `<div class="medical-response">
          <h4><i class="fas fa-lungs"></i> खांसी और सर्दी का उपचार</h4>
          <p><strong>प्रकार के अनुसार:</strong></p>
          <ul>
            <li><strong>सूखी खांसी:</strong> शहद, गर्म पानी, गले की गोलियां</li>
            <li><strong>बलगम वाली खांसी:</strong> भाप लें, खूब तरल पदार्थ पिएं</li>
          </ul>
          <p><strong>घरेलू देखभाल:</strong></p>
          <ul>
            <li>गर्म नमक के पानी से गरारे करें</li>
            <li>दिन में 2-3 बार भाप लें</li>
            <li>ठंडा खाना और पेय से बचें</li>
            <li>कमरे में ह्यूमिडिफायर प्रयोग करें</li>
          </ul>
          <div class="alert alert-warning">
            <strong>डॉक्टर को दिखाएं अगर:</strong> खांसी 2 हफ्ते से ज़्यादा रहे, खून आए, तेज़ बुखार हो
          </div>
          <p><strong>सुझाए गए विशेषज्ञ:</strong> पल्मोनोलॉजिस्ट, ENT विशेषज्ञ</p>
        </div>`,
                doctors: ['Dr. Rajesh Kumar (Pulmonologist)', 'Dr. Anita Mehta (ENT)'],
                hospitals: ['AIIMS', 'Safdarjung Hospital']
            },

            'stomach|pet|acidity|gas|पेट दर्द|उल्टी|चक्कर': {
                response: `<div class="medical-response">
          <h4><i class="fas fa-stomach"></i> Digestive Health</h4>
          <p><strong>For Acidity & Gas:</strong></p>
          <ul>
            <li>Eat smaller, frequent meals</li>
            <li>Avoid spicy, oily, and citrus foods</li>
            <li>Don't lie down immediately after eating</li>
            <li>Drink plenty of water between meals</li>
          </ul>
          <p><strong>Natural remedies:</strong></p>
          <ul>
            <li>Ginger tea for nausea</li>
            <li>Mint leaves for digestion</li>
            <li>Fennel seeds after meals</li>
          </ul>
          <div class="alert alert-info">
            <strong>Medications:</strong> Antacids (ENO, Digene), Omeprazole (if prescribed)
          </div>
          <p><strong>Recommended specialists:</strong> Gastroenterologist, General Physician</p>
        </div>`,
                hi: `<div class="medical-response">
          <h4><i class="fas fa-stomach"></i> पाचन स्वास्थ्य</h4>
          <p><strong>एसिडिटी और गैस के लिए:</strong></p>
          <ul>
            <li>थोड़ी-थोड़ी मात्रा में बार-बार खाएं</li>
            <li>मसालेदार, तेल वाले और खट्टे खाने से बचें</li>
            <li>खाने के तुरंत बाद न लेटें</li>
            <li>खाने के बीच में खूब पानी पिएं</li>
          </ul>
          <p><strong>प्राकृतिक उपाय:</strong></p>
          <ul>
            <li>मतली के लिए अदरक की चाय</li>
            <li>पाचन के लिए पुदीने की पत्तियां</li>
            <li>खाने के बाद सौंफ</li>
          </ul>
          <div class="alert alert-info">
            <strong>दवा:</strong> Antacids (ENO, Digene), Omeprazole (डॉक्टर की सलाह से)
          </div>
          <p><strong>सुझाए गए विशेषज्ञ:</strong> गैस्ट्रोएंटेरोलॉजिस्ट, सामान्य चिकित्सक</p>
        </div>`,
                doctors: ['Dr. Vikram Singh (Gastroenterologist)', 'Dr. Meera Jain (General Medicine)'],
                hospitals: ['Medanta Hospital', 'BLK Hospital']
            },

            'diabetes|sugar|blood sugar': {
                response: `<div class="medical-response">
          <h4><i class="fas fa-tint"></i> Diabetes Management</h4>
          <p><strong>Blood Sugar Monitoring:</strong></p>
          <ul>
            <li>Check blood glucose regularly</li>
            <li>Maintain food diary</li>
            <li>Follow prescribed medication schedule</li>
            <li>Regular exercise (30 min daily)</li>
          </ul>
          <p><strong>Diet recommendations:</strong></p>
          <ul>
            <li>Low glycemic index foods</li>
            <li>Plenty of vegetables and fiber</li>
            <li>Avoid sugary drinks and processed foods</li>
            <li>Portion control is key</li>
          </ul>
          <div class="alert alert-danger">
            <strong>Emergency signs:</strong> Extreme thirst, frequent urination, blurred vision, fatigue
          </div>
          <p><strong>Recommended specialists:</strong> Endocrinologist, Diabetologist</p>
        </div>`,
                doctors: ['Dr. Sanjay Gupta (Endocrinologist)', 'Dr. Ritu Sharma (Diabetologist)'],
                hospitals: ['AIIMS', 'Indraprastha Apollo']
            },

            'blood pressure|bp|hypertension': {
                response: `<div class="medical-response">
          <h4><i class="fas fa-heartbeat"></i> Blood Pressure Management</h4>
          <p><strong>Normal BP:</strong> 120/80 mmHg | <strong>High BP:</strong> >140/90 mmHg</p>
          <p><strong>Lifestyle changes:</strong></p>
          <ul>
            <li>Reduce salt intake (<6g/day)</li>
            <li>Regular exercise (150 min/week)</li>
            <li>Maintain healthy weight</li>
            <li>Limit alcohol and quit smoking</li>
            <li>Manage stress through meditation</li>
          </ul>
          <div class="alert alert-warning">
            <strong>Monitor regularly:</strong> Check BP twice daily, maintain records
          </div>
          <p><strong>Recommended specialists:</strong> Cardiologist, General Physician</p>
        </div>`,
                hi: `<div class="medical-response">
          <h4><i class="fas fa-heartbeat"></i> रक्तचाप प्रबंधन</h4>
          <p><strong>सामान्य BP:</strong> 120/80 mmHg | <strong>हाई BP:</strong> >140/90 mmHg</p>
          <p><strong>जीवनशैली में बदलाव:</strong></p>
          <ul>
            <li>नमक कम खाएं (6 ग्राम/दिन से कम)</li>
            <li>नियमित व्यायाम (सप्ताह में 150 मिनट)</li>
            <li>स्वस्थ वजन बनाए रखें</li>
            <li>शराब सीमित करें और धूम्रपान छोड़ें</li>
            <li>ध्यान से तनाव कम करें</li>
          </ul>
          <div class="alert alert-warning">
            <strong>नियमित जांच करें:</strong> दिन में दो बार BP जांचें, रिकॉर्ड रखें
          </div>
          <p><strong>सुझाए गए विशेषज्ञ:</strong> हृदय रोग विशेषज्ञ, सामान्य चिकित्सक</p>
        </div>`,
                doctors: ['Dr. Ashok Verma (Cardiologist)', 'Dr. Neha Agarwal (General Medicine)'],
                hospitals: ['Escorts Heart Institute', 'Fortis Hospital']
            },

            'depression|anxiety|stress|mental health': {
                response: `<div class="medical-response">
          <h4><i class="fas fa-brain"></i> Mental Health Support</h4>
          <p><strong>Coping strategies:</strong></p>
          <ul>
            <li>Practice deep breathing exercises</li>
            <li>Regular physical activity</li>
            <li>Maintain social connections</li>
            <li>Follow a regular sleep schedule</li>
            <li>Practice mindfulness/meditation</li>
          </ul>
          <div class="alert alert-info">
            <strong>Professional help available:</strong> Don't hesitate to seek therapy or counseling
          </div>
          <div class="emergency-contact">
            <strong>Crisis Helpline:</strong> 📞 1860-266-2345 (NIMHANS)
          </div>
          <p><strong>Recommended specialists:</strong> Psychiatrist, Clinical Psychologist</p>
        </div>`,
                doctors: ['Dr. Arjun Kapoor (Psychiatrist)', 'Dr. Kavita Rao (Psychologist)'],
                hospitals: ['NIMHANS', 'Institute of Mental Health']
            },

            'chest pain|heart pain|cardiac': {
                response: `<div class="medical-response">
          <h4><i class="fas fa-heart"></i> Chest Pain - Immediate Action Required</h4>
          <div class="alert alert-danger">
            <strong>🚨 EMERGENCY:</strong> If severe chest pain, call ambulance immediately: 108
          </div>
          <p><strong>Possible causes:</strong></p>
          <ul>
            <li>Heart attack (severe, crushing pain)</li>
            <li>Angina (chest tightness during activity)</li>
            <li>Muscle strain</li>
            <li>Acid reflux</li>
          </ul>
          <div class="alert alert-warning">
            <strong>Red flags:</strong> Pain spreading to arm/jaw, sweating, shortness of breath, nausea
          </div>
          <p><strong>Recommended specialists:</strong> Cardiologist (URGENT)</p>
        </div>`,
                doctors: ['Dr. Rajesh Khanna (Cardiologist)', 'Emergency Department'],
                hospitals: ['AIIMS Emergency', 'Fortis Escorts Heart Institute']
            },

            'pregnancy|pregnant|garbhavati': {
                response: `<div class="medical-response">
          <h4><i class="fas fa-baby"></i> Pregnancy Care</h4>
          <p><strong>Important check-ups:</strong></p>
          <ul>
            <li>Regular prenatal visits (monthly initially)</li>
            <li>Folic acid supplementation</li>
            <li>Avoid alcohol, smoking, raw foods</li>
            <li>Monitor weight gain</li>
          </ul>
          <p><strong>Diet recommendations:</strong></p>
          <ul>
            <li>Iron-rich foods (spinach, legumes)</li>
            <li>Calcium sources (milk, yogurt)</li>
            <li>Fresh fruits and vegetables</li>
            <li>Plenty of water (8-10 glasses daily)</li>
          </ul>
          <p><strong>Recommended specialists:</strong> Gynecologist, Obstetrician</p>
        </div>`,
                doctors: ['Dr. Sunita Mittal (Gynecologist)', 'Dr. Kavita Arora (Obstetrician)'],
                hospitals: ['Safdarjung Hospital', 'Lady Hardinge Medical College']
            },

            'skin|rash|allergy|khujli': {
                response: `<div class="medical-response">
          <h4><i class="fas fa-allergies"></i> Skin & Allergy Care</h4>
          <p><strong>Common skin issues:</strong></p>
          <ul>
            <li><strong>Allergic rash:</strong> Identify and avoid triggers</li>
            <li><strong>Eczema:</strong> Keep skin moisturized</li>
            <li><strong>Fungal infection:</strong> Keep area dry and clean</li>
          </ul>
          <p><strong>Home care:</strong></p>
          <ul>
            <li>Apply aloe vera gel for soothing</li>
            <li>Use fragrance-free moisturizers</li>
            <li>Avoid hot showers</li>
            <li>Wear cotton clothes</li>
          </ul>
          <div class="alert alert-warning">
            <strong>See doctor if:</strong> Spreading rash, severe itching, signs of infection
          </div>
          <p><strong>Recommended specialists:</strong> Dermatologist</p>
        </div>`,
                doctors: ['Dr. Rohit Batra (Dermatologist)', 'Dr. Chiranjiv Chhabra (Dermatologist)'],
                hospitals: ['AIIMS Skin Department', 'Sir Ganga Ram Hospital']
            },

            'eye|vision|ankhon|blurred vision': {
                response: `<div class="medical-response">
          <h4><i class="fas fa-eye"></i> Eye Care & Vision</h4>
          <p><strong>Common eye problems:</strong></p>
          <ul>
            <li><strong>Dry eyes:</strong> Use lubricating eye drops</li>
            <li><strong>Eye strain:</strong> Follow 20-20-20 rule</li>
            <li><strong>Pink eye:</strong> Avoid touching, use clean towels</li>
          </ul>
          <p><strong>Eye care tips:</strong></p>
          <ul>
            <li>Take regular breaks from screens</li>
            <li>Wear sunglasses outdoors</li>
            <li>Eat vitamin A rich foods (carrots, spinach)</li>
            <li>Get regular eye check-ups</li>
          </ul>
          <div class="alert alert-warning">
            <strong>Emergency:</strong> Sudden vision loss, severe eye pain, flashing lights
          </div>
          <p><strong>Recommended specialists:</strong> Ophthalmologist</p>
        </div>`,
                doctors: ['Dr. Rajesh Fogla (Ophthalmologist)', 'Dr. Mahipal Sachdev (Eye Specialist)'],
                hospitals: ['Centre for Sight', 'Sharp Sight Eye Hospitals']
            },

            'kidney|urine|uti|infection': {
                response: `<div class="medical-response">
          <h4><i class="fas fa-kidneys"></i> Kidney & Urinary Health</h4>
          <p><strong>UTI symptoms:</strong> Burning sensation, frequent urination, cloudy urine</p>
          <p><strong>Prevention & care:</strong></p>
          <ul>
            <li>Drink plenty of water (8-10 glasses)</li>
            <li>Don't hold urine for long periods</li>
            <li>Maintain proper hygiene</li>
            <li>Cranberry juice may help prevent UTIs</li>
          </ul>
          <div class="alert alert-warning">
            <strong>See doctor if:</strong> Blood in urine, severe pain, fever with UTI symptoms
          </div>
          <p><strong>Recommended specialists:</strong> Urologist, Nephrologist</p>
        </div>`,
                doctors: ['Dr. Anant Kumar (Urologist)', 'Dr. Sandeep Guleria (Nephrologist)'],
                hospitals: ['AIIMS Urology', 'Indraprastha Apollo']
            },

            'emergency|urgent|serious|help': {
                response: `<div class="medical-response">
          <h4><i class="fas fa-ambulance"></i> Emergency Medical Help</h4>
          <div class="alert alert-danger">
            <strong>🚨 CALL IMMEDIATELY:</strong>
            <li>Ambulance: 108 / 102</li>
            <li>Police: 100</li>
            <li>Fire: 101</li>
            <li>National Emergency: 112</li>
          </div>
          <p><strong>Emergency signs requiring immediate help:</strong></p>
          <ul>
            <li>Severe chest pain or difficulty breathing</li>
            <li>Loss of consciousness</li>
            <li>Severe bleeding</li>
            <li>Signs of stroke (face drooping, arm weakness, speech difficulty)</li>
            <li>Severe allergic reactions</li>
          </ul>
          <p><strong>Nearest Emergency Hospitals:</strong> AIIMS, Safdarjung, RML Hospital</p>
        </div>`,
                doctors: ['Emergency Department - Call 108', 'Trauma Center AIIMS'],
                hospitals: ['AIIMS Trauma Center', 'Safdarjung Emergency', 'RML Hospital Emergency']
            }
        };

        // Emergency detection
        const emergencyKeywords = ['emergency', 'urgent', 'serious', 'help', 'pain', 'bleeding', 'unconscious', 'accident'];
        const hasEmergency = emergencyKeywords.some(keyword => message.includes(keyword));

        if (hasEmergency && (message.includes('severe') || message.includes('emergency'))) {
            // Show emergency response first
            setTimeout(() => {
                this.showNotification('Emergency detected! Please call 108 for immediate help', 'danger');
            }, 1000);
        }

        // Check for medical keywords
        const isHindi = this.currentLanguage === 'hi';
        for (const [keywords, data] of Object.entries(medicalResponses)) {
            const regex = new RegExp(keywords, 'i');
            if (regex.test(message)) {
                // Use Hindi card if language is hi and Hindi card exists
                let response = (isHindi && data.hi) ? data.hi : data.response;
                const docLabel = isHindi ? 'सुझाए गए डॉक्टर:' : 'Recommended Doctors:';
                const hospLabel = isHindi ? 'नज़दीकी अस्पताल:' : 'Nearby Hospitals:';
                const bookLabel = isHindi ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment';
                response += `<div class="recommendations">
                  <h5><i class="fas fa-user-md"></i> ${docLabel}</h5>
                  <ul>${data.doctors.map(doc => `<li>${doc}</li>`).join('')}</ul>
                  <h5><i class="fas fa-hospital"></i> ${hospLabel}</h5>
                  <ul>${data.hospitals.map(hospital => `<li>${hospital}</li>`).join('')}</ul>
                  <button class="book-appointment-btn" onclick="medibotPortal.openAppointmentModal()">
                    <i class="fas fa-calendar-plus"></i> ${bookLabel}
                  </button>
                </div>`;
                return response;
            }
        }

        // General health queries
        const generalResponses = isHindi ? [
            `<div class="general-help">
                <h4><i class="fas fa-stethoscope"></i> आज मैं आपकी कैसे मदद करूं?</h4>
                <p>मैं इन विषयों में सहायता कर सकता हूँ:</p>
                <ul>
                  <li>🩺 लक्षणों का विश्लेषण और सलाह</li>
                  <li>💊 दवाओं की जानकारी</li>
                  <li>👨‍⚕️ डॉक्टर की सिफारिश</li>
                  <li>🏥 अस्पताल सुझाव</li>
                  <li>📋 स्वास्थ्य टिप्स और बचाव</li>
                </ul>
                <p>कृपया अपने लक्षण या स्वास्थ्य संबंधी सवाल बताएं!</p>
              </div>`,
            'आपके लक्षणों को बेहतर समझने के लिए कृपया और जानकारी दें। क्या आपको बुखार, दर्द या कोई और तकलीफ है?',
            'मैं आपका AI Medical Assistant हूँ। अपनी स्वास्थ्य समस्या बताएं — मैं लक्षणों का विश्लेषण, घरेलू उपाय और डॉक्टर की सिफारिश दूंगा।'
        ] : [
            "I understand you're looking for medical advice. Could you please describe your symptoms in more detail? For example, are you experiencing fever, pain, or any other specific symptoms?",
            "As your AI medical assistant, I'm here to help! Please tell me about your current health concerns. Are you experiencing any pain, discomfort, or unusual symptoms?",
            "I'd be happy to assist you with your health query. Could you provide more specific information about your symptoms? This will help me give you better guidance.",
            `<div class="general-help">
                <h4><i class="fas fa-stethoscope"></i> How can I help you today?</h4>
                <p>I can assist you with:</p>
                <ul>
                  <li>🩺 Symptom analysis and guidance</li>
                  <li>💊 Medication information</li>
                  <li>👨‍⚕️ Doctor recommendations</li>
                  <li>🏥 Hospital suggestions</li>
                  <li>📋 Health tips and prevention</li>
                </ul>
                <p>Please describe your symptoms or ask any health-related question!</p>
              </div>`,
            "I'm your dedicated medical AI assistant. Whether you need help with symptoms, medication information, or finding the right doctor, I'm here to support you. What's your health concern today?"
        ];

        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showNotification('Speech recognition not supported', 'warning');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    openAppointmentModal() {
        console.log('🔔 Opening appointment modal...');
        const modal = document.getElementById('appointment-modal');
        if (!modal) {
            console.error('❌ Appointment modal not found in DOM!');
            this.showNotification('Error: Modal not found', 'danger');
            return;
        }
        console.log('✅ Modal found, adding active class');
        modal.classList.add('active');
        // Force display and z-index in case CSS is overridden
        modal.style.display = 'flex';
        modal.style.zIndex = '10001';
        console.log('✅ Appointment modal opened and forced display');
    }

    ensureAppointmentModalReady() {
        console.log('🔧 Ensuring appointment modal is ready...');
        const modal = document.getElementById('appointment-modal');
        if (!modal) {
            console.error('❌ Appointment modal element not found!');
            return;
        }

        const modalBody = modal.querySelector('.modal-body');
        if (!modalBody) {
            console.error('❌ Modal body not found!');
            return;
        }

        let form = modal.querySelector('#appointment-form');
        if (!form) {
            console.log('📝 Injecting appointment form into modal...');
            modalBody.innerHTML = `
                <form id="appointment-form">
                    <div class="form-group">
                        <label>Specialty</label>
                        <select name="specialty" required>
                            <option value="">Select Specialty</option>
                            <option value="cardiology">Cardiology</option>
                            <option value="dermatology">Dermatology</option>
                            <option value="neurology">Neurology</option>
                            <option value="general">General Physician</option>
                            <option value="orthopedics">Orthopedics</option>
                            <option value="pediatrics">Pediatrics</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Doctor Name</label>
                        <input type="text" name="doctor_name" placeholder="e.g., Dr. Rahul Sharma">
                    </div>
                    <div class="form-group">
                        <label>Preferred Date</label>
                        <input type="date" name="date" required>
                    </div>
                    <div class="form-group">
                        <label>Preferred Time</label>
                        <input type="time" name="time" required>
                    </div>
                    <div class="form-group">
                        <label>Reason for Visit</label>
                        <textarea name="reason" placeholder="Describe your symptoms or reason for the visit..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Your Location</label>
                        <input type="text" name="location" placeholder="e.g., New York, 10001">
                    </div>
                    <button type="button" class="btn-outline" id="detect-location-btn" style="width: 100%; margin-bottom: 10px;">
                        <i class="fas fa-location-crosshairs"></i> Detect My Location
                    </button>
                    <button type="button" class="btn-outline" id="suggest-doctor-btn" style="width: 100%; margin-bottom: 10px;">
                        <i class="fas fa-magic"></i> Suggest Best Doctor (Kaggle)
                    </button>
                    <p id="doctor-suggestion-status" style="display: none; margin: 0 0 10px; color: #9ca3af;"></p>
                    <div id="doctor-suggestions-list" style="display: none; margin: 0 0 12px;"></div>
                    <button type="submit" class="btn-primary" style="width: 100%;">
                        <i class="fas fa-check"></i> Book Appointment
                    </button>
                </form>
            `;
            form = modal.querySelector('#appointment-form');
        }

        if (form) {
            console.log('✅ Appointment form found');

            // Remove any existing listeners to prevent duplicates
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            form = newForm;

            // Add event listener
            form.addEventListener('submit', (e) => {
                console.log('📋 Appointment form submitted!');
                e.preventDefault();
                this.bookAppointment(e);
            });

            const detectLocationBtn = modal.querySelector('#detect-location-btn');
            if (detectLocationBtn) {
                detectLocationBtn.addEventListener('click', () => this.detectLocationForAppointment({ autoSuggest: true }));
            }

            const suggestDoctorBtn = modal.querySelector('#suggest-doctor-btn');
            if (suggestDoctorBtn) {
                suggestDoctorBtn.addEventListener('click', () => this.suggestBestDoctorForAppointment());
            }

            const locationField = form.querySelector('[name="location"]');
            if (locationField && !locationField.value.trim()) {
                this.detectLocationForAppointment({ autoSuggest: false, silent: true });
            }

            console.log('✅ Appointment form is ready with submit handler');
        } else {
            console.error('❌ Failed to create or find appointment form');
        }
    }

    showDoctorSuggestionStatus(message, tone = 'info') {
        const statusEl = document.getElementById('doctor-suggestion-status');
        if (!statusEl) return;

        const colorMap = {
            info: '#9ca3af',
            success: '#22c55e',
            warning: '#f59e0b',
            danger: '#ef4444'
        };

        statusEl.style.display = 'block';
        statusEl.style.color = colorMap[tone] || colorMap.info;
        statusEl.textContent = message;
    }

    renderSuggestedDoctorsList(doctors, form) {
        const listEl = document.getElementById('doctor-suggestions-list');
        if (!listEl) return;

        if (!Array.isArray(doctors) || doctors.length === 0) {
            listEl.style.display = 'none';
            listEl.innerHTML = '';
            return;
        }

        listEl.style.display = 'block';
        listEl.innerHTML = doctors.map((doc, index) => `
            <button type="button" class="btn-outline suggested-doctor-item" data-doctor-index="${index}" style="width: 100%; text-align: left; margin-bottom: 8px; padding: 10px;">
                <strong>${doc.Name || 'Doctor'}</strong><br>
                <small>${doc.specialty || 'Consultation'}</small><br>
                <small>${doc.city || doc.state || ''}${doc.Address ? ` - ${doc.Address}` : ''}</small>
            </button>
        `).join('');

        listEl.querySelectorAll('.suggested-doctor-item').forEach((btn) => {
            btn.addEventListener('click', () => {
                const idx = Number(btn.getAttribute('data-doctor-index'));
                const selected = doctors[idx] || doctors[0];
                const doctorField = form.querySelector('[name="doctor_name"]');
                const specialtyField = form.querySelector('[name="specialty"]');
                const locationField = form.querySelector('[name="location"]');

                if (doctorField) {
                    doctorField.value = selected.Name || '';
                }

                this.applySpecialtySuggestionToDropdown(specialtyField, selected.specialty || '');

                if (locationField && (selected.city || selected.state)) {
                    locationField.value = selected.city || selected.state;
                }

                this.showDoctorSuggestionStatus(`Selected: ${selected.Name || 'Doctor'}`, 'success');
            });
        });
    }

    normalizeDetectedLocationName(locationName) {
        let text = String(locationName || '').trim();
        if (!text) return '';

        const replacements = [
            [/\bBengaluru\b/gi, 'Bangalore'],
            [/\bBangalore Urban\b/gi, 'Bangalore'],
            [/\bBombay\b/gi, 'Mumbai'],
            [/\bMadras\b/gi, 'Chennai'],
            [/\bCalcutta\b/gi, 'Kolkata'],
            [/\bGurugram\b/gi, 'Gurgaon']
        ];

        replacements.forEach(([pattern, replacement]) => {
            text = text.replace(pattern, replacement);
        });

        return text;
    }

    getCurrentCoordinates() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }),
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        reject(new Error('Location permission denied. Please allow location access.'));
                    } else if (error.code === error.TIMEOUT) {
                        reject(new Error('Location request timed out. Try again.'));
                    } else {
                        reject(new Error('Unable to detect current location.'));
                    }
                },
                { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
            );
        });
    }

    async reverseGeocodeLocation(lat, lng) {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=10&addressdetails=1`;
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) {
            throw new Error('Unable to convert coordinates to city name.');
        }

        const data = await response.json();
        const address = data.address || {};
        const city = address.city || address.town || address.county || address.state_district || address.village || '';
        const state = address.state || '';
        const country = address.country || '';

        const best = this.normalizeDetectedLocationName(city || state || country);
        if (!best) {
            throw new Error('Location detected but city could not be resolved.');
        }

        return best;
    }

    async detectLocationForAppointment(options = {}) {
        const { autoSuggest = false, silent = false } = options;
        const form = document.getElementById('appointment-form');
        if (!form) return '';

        const locationField = form.querySelector('[name="location"]');
        if (!locationField) return '';

        const detectBtn = document.getElementById('detect-location-btn');
        const previousText = detectBtn ? detectBtn.innerHTML : '';
        if (detectBtn) {
            detectBtn.disabled = true;
            detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting location...';
        }

        if (!silent) {
            this.showDoctorSuggestionStatus('Detecting your location...', 'info');
        }

        try {
            const coords = await this.getCurrentCoordinates();
            const locationName = await this.reverseGeocodeLocation(coords.lat, coords.lng);
            locationField.value = locationName;

            this.showDoctorSuggestionStatus(`Location detected: ${locationName}`, 'success');

            if (autoSuggest) {
                await this.suggestBestDoctorForAppointment({ skipAutoDetect: true });
            }

            return locationName;
        } catch (error) {
            if (!silent) {
                this.showDoctorSuggestionStatus(error.message || 'Unable to detect location automatically.', 'danger');
            }
            return '';
        } finally {
            if (detectBtn) {
                detectBtn.disabled = false;
                detectBtn.innerHTML = previousText;
            }
        }
    }

    getMappedSpecialtyOption(rawSpecialty) {
        const original = String(rawSpecialty || '').trim();
        const text = original.toLowerCase();
        if (!text) {
            return null;
        }

        const keywordMappings = [
            { value: 'cardiology', label: 'Cardiology', keys: ['cardio', 'heart', 'interventional cardiology'] },
            { value: 'dermatology', label: 'Dermatology', keys: ['derma', 'skin'] },
            { value: 'neurology', label: 'Neurology', keys: ['neuro', 'brain', 'migraine'] },
            { value: 'orthopedics', label: 'Orthopedics', keys: ['ortho', 'bone', 'joint'] },
            { value: 'pediatrics', label: 'Pediatrics', keys: ['pediatric', 'child', 'infant'] },
            { value: 'general', label: 'General Physician', keys: ['general', 'family medicine', 'internal medicine', 'primary care'] }
        ];

        for (const item of keywordMappings) {
            if (item.keys.some(keyword => text.includes(keyword))) {
                return { value: item.value, label: item.label };
            }
        }

        const normalizedValue = text
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 60) || 'general';

        return { value: normalizedValue, label: original };
    }

    applySpecialtySuggestionToDropdown(selectElement, rawSpecialty) {
        if (!selectElement || !rawSpecialty) {
            return;
        }

        const mapped = this.getMappedSpecialtyOption(rawSpecialty);
        if (!mapped) {
            return;
        }

        const options = Array.from(selectElement.options || []);
        const byValue = options.find(opt => opt.value === mapped.value);
        if (byValue) {
            selectElement.value = byValue.value;
            return;
        }

        const byLabel = options.find(opt => opt.textContent.trim().toLowerCase() === mapped.label.toLowerCase());
        if (byLabel) {
            selectElement.value = byLabel.value;
            return;
        }

        const dynamicOption = document.createElement('option');
        dynamicOption.value = mapped.value;
        dynamicOption.textContent = mapped.label;
        dynamicOption.dataset.dynamicKaggle = 'true';

        const placeholder = options.find(opt => !opt.value);
        if (placeholder && placeholder.nextSibling) {
            selectElement.insertBefore(dynamicOption, placeholder.nextSibling);
        } else {
            selectElement.appendChild(dynamicOption);
        }

        selectElement.value = dynamicOption.value;
    }

    async suggestBestDoctorForAppointment(options = {}) {
        const { skipAutoDetect = false } = options;
        const form = document.getElementById('appointment-form');
        if (!form) return;
        this.renderSuggestedDoctorsList([], form);

        const specialty = (form.querySelector('[name="specialty"]')?.value || '').trim();
        const problem = (form.querySelector('[name="reason"]')?.value || '').trim();
        let location = (form.querySelector('[name="location"]')?.value || '').trim();

        if (!problem && !specialty) {
            this.showDoctorSuggestionStatus('Problem likho ya specialty select karo to doctor suggest kar paun.', 'warning');
            return;
        }

        if (!location && !skipAutoDetect) {
            location = await this.detectLocationForAppointment({ autoSuggest: false, silent: true });
        }

        if (!location) {
            this.showDoctorSuggestionStatus('Please enter location first to get nearby doctor suggestion.', 'warning');
            return;
        }

        const suggestBtn = document.getElementById('suggest-doctor-btn');
        const originalText = suggestBtn ? suggestBtn.innerHTML : '';
        if (suggestBtn) {
            suggestBtn.disabled = true;
            suggestBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding best doctor...';
        }

        try {
            const response = await fetch('/api/doctor-suggestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ specialty, problem, location })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Unable to suggest a doctor right now.');
            }

            const suggestedDoctors = Array.isArray(data.doctors) && data.doctors.length
                ? data.doctors.slice(0, 4)
                : (data.doctor ? [data.doctor] : []);
            const suggestedDoctor = suggestedDoctors[0] || {};
            const doctorField = form.querySelector('[name="doctor_name"]');
            const specialtyField = form.querySelector('[name="specialty"]');

            if (doctorField) {
                doctorField.value = suggestedDoctor.Name || doctorField.value || '';
            }

            const suggestedSpecialtyText = suggestedDoctor.specialty || data.specialty || '';
            this.applySpecialtySuggestionToDropdown(specialtyField, suggestedSpecialtyText);

            const selectedLocation = suggestedDoctor.city || suggestedDoctor.state || location;
            const locationField = form.querySelector('[name="location"]');
            if (locationField && selectedLocation) {
                locationField.value = selectedLocation;
            }

            this.renderSuggestedDoctorsList(suggestedDoctors, form);

            let fallbackNote = '';
            if (data.location_mode === 'broad') {
                fallbackNote = ' [closest match]';
            } else if (data.location_mode === 'mixed') {
                fallbackNote = ' [nearby + similar city mix]';
            } else if (data.location_mode === 'nationwide') {
                fallbackNote = ' [similar problem doctors in India]';
            }
            this.showDoctorSuggestionStatus(
                `Suggested${fallbackNote}: ${suggestedDoctors.length} doctor${suggestedDoctors.length > 1 ? 's' : ''} found. Auto-selected ${suggestedDoctor.Name || 'Doctor'}.`,
                data.location_mode === 'exact' ? 'success' : 'warning'
            );
        } catch (error) {
            this.renderSuggestedDoctorsList([], form);
            this.showDoctorSuggestionStatus(error.message || 'No suggestion found for this location/problem.', 'danger');
        } finally {
            if (suggestBtn) {
                suggestBtn.disabled = false;
                suggestBtn.innerHTML = originalText;
            }
        }
    }

    closeModal(modal) {
        if (!modal) {
            return;
        }
        modal.classList.remove('active', 'show');
        // Clear inline overrides added by specific modal open handlers.
        modal.style.display = '';
        modal.style.zIndex = '';
    }

    handleGlobalSearch(query) {
        if (query.length > 2) {
            // Implement search functionality
            console.log('Searching for:', query);
        }
    }

    handleResize() {
        const width = window.innerWidth;
        const sidebar = document.getElementById('sidebar');

        if (width > 1024) {
            sidebar.classList.add('open');
            this.sidebarOpen = true;
        } else {
            sidebar.classList.remove('open');
            this.sidebarOpen = false;
        }
    }

    handleEmergency() {
        this.navigateToPage('emergency');
        this.showNotification('Emergency services page opened', 'danger');
    }

    initializeNotifications() {
        this.notifications = [
            { id: 1, message: 'Appointment reminder: Dr. Smith tomorrow at 10:30 AM', type: 'info' },
            { id: 2, message: 'Lab results are ready', type: 'success' },
            { id: 3, message: 'Medication refill needed', type: 'warning' }
        ];

        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        badge.textContent = this.notifications.length;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation' : type === 'danger' ? 'times' : 'info'}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">&times;</button>
    `;

        // Add styles for notifications
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg-secondary);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      z-index: 3000;
      max-width: 300px;
      animation: slideInRight 0.3s ease;
    `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    updateDashboard() {
        this.simulateHealthData();
        this.renderDashboardOverview();
    }

    simulateHealthData() {
        // Static health data (no simulation, no external devices)
        // Heart rate is set to a normal static value
        const heartRate = 72; // Normal resting heart rate (static)
        const statValue = document.querySelector('.stat-card:first-child .stat-value, [data-metric="heart-rate"]');
        if (statValue) {
            statValue.innerHTML = `${heartRate} <span>BPM</span>`;
        }

        // Note: This is demo data only, not from any real device
        console.log('Health data set to static values (demo only)');
    }

    renderDashboardOverview() {
        this.updateDashboardGreeting();
        this.rotateDashboardTip(false);
        this.renderDashboardAppointments();
    }

    updateDashboardGreeting() {
        const nameElement = document.getElementById('dashboard-user-name');
        const greetingElement = document.getElementById('dashboard-greeting');
        const dateElement = document.getElementById('dashboard-date-label');
        const user = this.currentUser || JSON.parse(localStorage.getItem('medibotUser') || 'null');
        const firstName = user?.firstName || user?.name?.split(' ')?.[0] || 'Guest';
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

        if (nameElement) {
            nameElement.textContent = firstName;
        }
        if (greetingElement) {
            greetingElement.textContent = `${greeting} 👋`;
        }
        if (dateElement) {
            dateElement.textContent = new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        }
    }

    rotateDashboardTip(showToast = true) {
        const tipElement = document.getElementById('dashboard-health-tip');
        if (!tipElement) return;

        const tips = [
            'Stay hydrated and stretch every hour to improve circulation and reduce fatigue.',
            'A 20-minute walk after meals can support heart health and improve digestion.',
            'Consistent sleep routines help stabilize mood, immunity, and overall energy.',
            'If you sit for long periods, stand up every 60 minutes to reduce stiffness and stress.'
        ];

        if (typeof this._dashboardTipIndex !== 'number') {
            this._dashboardTipIndex = 0;
        } else {
            this._dashboardTipIndex = (this._dashboardTipIndex + 1) % tips.length;
        }

        tipElement.textContent = tips[this._dashboardTipIndex];
        if (showToast) {
            this.showNotification('Health tip updated', 'success');
        }
    }

    renderDashboardAppointments() {
        const container = document.getElementById('dashboard-appointments-list');
        const nextAppointment = document.getElementById('dashboard-next-appointment');
        if (!container) return;

        const renderList = (appointments = []) => {
            if (!appointments.length) {
                container.innerHTML = '<div class="dashboard-empty-state">No upcoming appointments yet. Book one to get started.</div>';
                if (nextAppointment) {
                    nextAppointment.textContent = 'No appointment';
                }
                return;
            }

            const upcoming = [...appointments]
                .filter(item => item.date || item.datetime)
                .sort((a, b) => new Date(a.datetime || a.date) - new Date(b.datetime || b.date))
                .slice(0, 3);

            if (nextAppointment) {
                const first = upcoming[0];
                nextAppointment.textContent = `${new Date(first.datetime || first.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
            }

            container.innerHTML = upcoming.map(apt => {
                const date = new Date(apt.datetime || apt.date);
                const doctor = apt.doctor_name || apt.doctor || 'Doctor';
                const subtitle = apt.specialty || apt.reason || 'Consultation';
                return `
                    <div class="dashboard-appointment-card">
                        <div class="dashboard-appointment-date">
                            <span>${date.toLocaleDateString(undefined, { day: '2-digit' })}</span>
                            <small>${date.toLocaleDateString(undefined, { month: 'short' })}</small>
                        </div>
                        <div class="dashboard-appointment-info">
                            <strong>${doctor}</strong>
                            <p>${subtitle}</p>
                            <small><i class="fas fa-clock"></i> ${apt.time || date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                        </div>
                        <span class="dashboard-status-pill">${apt.status || 'Scheduled'}</span>
                    </div>
                `;
            }).join('');
        };

        if (this.isAuthenticated) {
            fetch('/api/appointments')
                .then(response => response.ok ? response.json() : Promise.reject(new Error('Failed to load appointments')))
                .then(data => renderList(Array.isArray(data) ? data : []))
                .catch(() => renderList(JSON.parse(localStorage.getItem('medibot-appointments') || '[]')));
        } else {
            renderList(JSON.parse(localStorage.getItem('medibot-appointments') || '[]'));
        }
    }

    startHealthSimulation() {
        // Initialize health data from localStorage or set defaults
        this.loadHealthData();

        // Simulate basic health data updates (no external device connectivity)
        setTimeout(() => {
            this.showNotification('Health dashboard updated with sample data', 'success');
        }, 5000);
    }

    loadHealthData() {
        // Load saved health data or use defaults
        const savedData = JSON.parse(localStorage.getItem('healthData')) || {
            heartRate: { value: 72, unit: 'BPM', lastUpdated: new Date().toISOString() },
            temperature: { value: 98.6, unit: 'F', lastUpdated: new Date().toISOString() },
            bmi: { value: 23.2, weight: 70, weightUnit: 'kg', height: 175, heightUnit: 'cm', lastUpdated: new Date().toISOString() }
        };

        // Simulate real-time updates (for demo purposes)
        this.simulateRealTimeUpdates(savedData);

        // Update displays
        this.updateHealthDisplay('heart-rate', savedData.heartRate.value, savedData.heartRate.unit);
        this.updateHealthDisplay('temperature', savedData.temperature.value, '°' + savedData.temperature.unit);
        this.updateHealthDisplay('bmi', savedData.bmi.value);
    }

    simulateRealTimeUpdates(healthData) {
        // Simulate slight variations in health data (realistic fluctuations)
        setInterval(() => {
            // Heart rate variation (±3 BPM)
            const hrVariation = (Math.random() - 0.5) * 6; // -3 to +3
            healthData.heartRate.value = Math.max(60, Math.min(100, 72 + hrVariation));
            healthData.heartRate.lastUpdated = new Date().toISOString();

            // Temperature variation (±0.5°F)
            const tempVariation = (Math.random() - 0.5) * 1; // -0.5 to +0.5
            healthData.temperature.value = Math.max(96.0, Math.min(101.0, 98.6 + tempVariation));
            healthData.temperature.lastUpdated = new Date().toISOString();

            // Update displays
            this.updateHealthDisplay('heart-rate', Math.round(healthData.heartRate.value), healthData.heartRate.unit);
            this.updateHealthDisplay('temperature', healthData.temperature.value.toFixed(1), '°' + healthData.temperature.unit);

            // Save updated data
            localStorage.setItem('healthData', JSON.stringify(healthData));
        }, 30000); // Update every 30 seconds
    }

    updateHealthData(newData) {
        // Update health data (can be called from wearable devices, manual input, etc.)
        const currentData = JSON.parse(localStorage.getItem('healthData')) || {
            heartRate: { value: 72, unit: 'BPM' },
            temperature: { value: 98.6, unit: 'F' },
            bmi: { value: 23.2, weight: 70, weightUnit: 'kg', height: 175, heightUnit: 'cm' }
        };

        // Update with new data
        if (newData.heartRate !== undefined) {
            currentData.heartRate.value = newData.heartRate;
            currentData.heartRate.lastUpdated = new Date().toISOString();
        }
        if (newData.temperature !== undefined) {
            currentData.temperature.value = newData.temperature;
            currentData.temperature.lastUpdated = new Date().toISOString();
        }
        if (newData.bmi !== undefined) {
            currentData.bmi.value = newData.bmi;
            currentData.bmi.lastUpdated = new Date().toISOString();
        }
        if (newData.weight !== undefined) {
            currentData.bmi.weight = newData.weight;
        }
        if (newData.height !== undefined) {
            currentData.bmi.height = newData.height;
        }

        // Save updated data
        localStorage.setItem('healthData', JSON.stringify(currentData));

        // Update displays
        this.updateHealthDisplay('heart-rate', currentData.heartRate.value, currentData.heartRate.unit);
        this.updateHealthDisplay('temperature', currentData.temperature.value, '°' + currentData.temperature.unit);
        this.updateHealthDisplay('bmi', currentData.bmi.value);

        console.log('Health data updated:', currentData);
        return currentData;
    }

    openHealthDataModal() {
        const modal = document.getElementById('health-data-modal');
        if (modal) {
            modal.style.display = 'block';

            // Pre-fill current values
            const currentData = JSON.parse(localStorage.getItem('healthData')) || {
                heartRate: { value: 72 },
                temperature: { value: 98.6 },
                bmi: { weight: 70, height: 175 }
            };

            document.getElementById('manual-heart-rate').value = currentData.heartRate.value;
            document.getElementById('manual-temperature').value = currentData.temperature.value;
            document.getElementById('manual-weight').value = currentData.bmi.weight;
            document.getElementById('manual-height').value = currentData.bmi.height;
        }
    }

    closeHealthDataModal() {
        const modal = document.getElementById('health-data-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    saveHealthData() {
        const heartRate = parseFloat(document.getElementById('manual-heart-rate').value);
        const temperature = parseFloat(document.getElementById('manual-temperature').value);
        const weight = parseFloat(document.getElementById('manual-weight').value);
        const height = parseFloat(document.getElementById('manual-height').value);
        const dataSource = document.getElementById('data-source').value;
        const notes = document.getElementById('health-notes').value;

        if (!heartRate || !temperature || !weight || !height) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Calculate BMI
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);

        // Update health data
        const newData = {
            heartRate: heartRate,
            temperature: temperature,
            bmi: bmi.toFixed(1),
            weight: weight,
            height: height,
            dataSource: dataSource,
            notes: notes,
            timestamp: new Date().toISOString()
        };

        this.updateHealthData(newData);

        // Close modal
        this.closeHealthDataModal();

        // Show success message
        this.showNotification('Health data updated successfully!', 'success');

        // Log the update
        console.log('Manual health data update:', newData);
    }

    updateHealthDisplay(metric, value, unit = '') {
        const display = document.getElementById(`${metric}-display`);
        if (display) {
            display.innerHTML = unit ? `${value} <span>${unit}</span>` : `${value}`;
        }
    }

    editHealthMetric(metric) {
        // Hide display, show input
        const display = document.getElementById(`${metric}-display`);
        const input = document.getElementById(`${metric}-input`);

        if (display && input) {
            display.style.display = 'none';
            input.style.display = 'block';

            // Focus on first input
            const firstInput = input.querySelector('input');
            if (firstInput) {
                firstInput.focus();
                firstInput.select();
            }
        }
    }

    cancelHealthEdit(metric) {
        // Hide input, show display
        const display = document.getElementById(`${metric}-display`);
        const input = document.getElementById(`${metric}-input`);

        if (display && input) {
            display.style.display = 'block';
            input.style.display = 'none';
        }
    }

    saveHealthMetric(metric) {
        let savedData = JSON.parse(localStorage.getItem('healthData')) || {};
        let value, unit, displayValue;

        switch (metric) {
            case 'heart-rate':
                value = parseFloat(document.getElementById('heart-rate-value').value);
                if (value < 30 || value > 220) {
                    this.showNotification('Please enter a valid heart rate (30-220 BPM)', 'error');
                    return;
                }
                savedData.heartRate = { value: value, unit: 'BPM' };
                displayValue = `${value} <span>BPM</span>`;
                break;

            case 'temperature':
                value = parseFloat(document.getElementById('temperature-value').value);
                unit = document.getElementById('temperature-unit').value;

                if (unit === 'F' && (value < 95 || value > 110)) {
                    this.showNotification('Please enter a valid temperature (95-110°F)', 'error');
                    return;
                } else if (unit === 'C' && (value < 35 || value > 43)) {
                    this.showNotification('Please enter a valid temperature (35-43°C)', 'error');
                    return;
                }

                savedData.temperature = { value: value, unit: unit };
                displayValue = `${value} <span>°${unit}</span>`;
                break;

            case 'bmi':
                const weight = parseFloat(document.getElementById('weight-value').value);
                const height = parseFloat(document.getElementById('height-value').value);
                const weightUnit = document.getElementById('weight-unit').value;
                const heightUnit = document.getElementById('height-unit').value;

                if (!weight || !height || weight <= 0 || height <= 0) {
                    this.showNotification('Please enter valid weight and height values', 'error');
                    return;
                }

                // Convert to metric for BMI calculation
                let weightKg = weightUnit === 'lbs' ? weight * 0.453592 : weight;
                let heightM = heightUnit === 'ft' ? height * 0.3048 : height / 100;

                const bmi = (weightKg / (heightM * heightM)).toFixed(1);

                savedData.bmi = {
                    value: parseFloat(bmi),
                    weight: weight,
                    weightUnit: weightUnit,
                    height: height,
                    heightUnit: heightUnit
                };
                displayValue = `${bmi}`;

                // Update BMI status
                const bmiStatus = this.getBMIStatus(parseFloat(bmi));
                const statChange = document.querySelector('#bmi-card .stat-change');
                if (statChange) {
                    statChange.textContent = bmiStatus.text;
                    statChange.className = `stat-change ${bmiStatus.class}`;
                }
                break;
        }

        // Save to localStorage
        localStorage.setItem('healthData', JSON.stringify(savedData));

        // Update display
        const display = document.getElementById(`${metric}-display`);
        if (display) {
            display.innerHTML = displayValue;
        }

        // Hide input, show display
        this.cancelHealthEdit(metric);

        // Show success message
        this.showNotification(`${metric.replace('-', ' ')} updated successfully!`, 'success');
    }

    getBMIStatus(bmi) {
        if (bmi < 18.5) {
            return { text: 'Underweight', class: 'negative' };
        } else if (bmi < 25) {
            return { text: 'Healthy', class: 'positive' };
        } else if (bmi < 30) {
            return { text: 'Overweight', class: 'normal' };
        } else {
            return { text: 'Obese', class: 'negative' };
        }
    }

    convertTemperature() {
        const tempInput = document.getElementById('temperature-value');
        const tempUnit = document.getElementById('temperature-unit');

        if (!tempInput || !tempUnit) return;

        const currentValue = parseFloat(tempInput.value);
        const currentUnit = tempUnit.value;

        if (isNaN(currentValue)) return;

        let convertedValue;
        let newMin, newMax;

        if (currentUnit === 'C') {
            // Convert to Celsius
            convertedValue = ((currentValue - 32) * 5 / 9).toFixed(1);
            newMin = 35;
            newMax = 43;
        } else {
            // Convert to Fahrenheit
            convertedValue = (currentValue * 9 / 5 + 32).toFixed(1);
            newMin = 95;
            newMax = 110;
        }

        tempInput.value = convertedValue;
        tempInput.min = newMin;
        tempInput.max = newMax;
    }

    loadAppointments() {
        console.log('Loading appointments...');

        const useBackend = this.isAuthenticated;

        if (useBackend) {
            fetch('/api/appointments', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Appointments loaded:', data);
                    this.renderAppointments(data);
                })
                .catch(error => {
                    console.error('Error loading appointments:', error);
                    this.loadAppointmentsFromLocalStorage();
                });
        } else {
            this.loadAppointmentsFromLocalStorage();
        }
    }

    loadAppointmentsFromLocalStorage() {
        console.log('📂 Loading appointments from localStorage');

        // Get appointments from localStorage
        let appointments = JSON.parse(localStorage.getItem('medibot-appointments') || '[]');

        // If no appointments, show demo data
        if (appointments.length === 0) {
            console.log('Using demo appointments as fallback');
            appointments = [
                {
                    id: 1,
                    doctor_name: 'Dr. Sarah Johnson',
                    specialty: 'General Physician',
                    date: new Date(Date.now() + 86400000).toISOString(),
                    time: '10:00 AM',
                    location: 'Medical Center - Room 203',
                    reason: 'Annual Checkup'
                },
                {
                    id: 2,
                    doctor_name: 'Dr. Michael Chen',
                    specialty: 'Cardiologist',
                    date: new Date(Date.now() + 172800000).toISOString(),
                    time: '2:30 PM',
                    location: 'Heart Care Clinic - Room 105',
                    reason: 'Follow-up Consultation'
                }
            ];
        }

        this.renderAppointments(appointments);
    }

    renderAppointments(appointments) {
        const appointmentsList = document.querySelector('.appointments-list');
        if (!appointmentsList) return;

        const normalizedAppointments = (appointments || []).map((apt, index) => {
            const fallbackDate = apt.datetime || apt.date || new Date().toISOString();
            const appointmentId = apt.id ?? apt.appointment_id ?? Date.now() + index;

            return {
                ...apt,
                id: appointmentId,
                date: apt.date || apt.datetime || fallbackDate,
                time: apt.time || (apt.datetime ? new Date(apt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
            };
        });

        this.currentAppointments = normalizedAppointments;

        const visibleAppointments = this.filterAppointmentsByTab(normalizedAppointments);

        if (visibleAppointments.length === 0) {
            const emptyByTab = this.currentAppointmentsTab === 'past'
                ? 'No past appointments found'
                : this.currentAppointmentsTab === 'cancelled'
                    ? 'No cancelled appointments found'
                    : 'No upcoming appointments found';
            appointmentsList.innerHTML = `
                <div class="no-appointments" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-calendar-times" style="font-size: 3rem; color: #999; margin-bottom: 1rem;"></i>
                    <p>${emptyByTab}</p>
                    <button class="btn-primary" onclick="medibotPortal.openAppointmentModal()" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i> Book Your First Appointment
                    </button>
                </div>
            `;
            return;
        }

        appointmentsList.innerHTML = visibleAppointments.map(apt => {
            const isCancelled = String((apt.status || '')).toLowerCase() === 'cancelled';
            return `
            <div class="appointment-card" data-appointment-id="${apt.id}">
                <div class="appointment-date">
                    <div class="date-day">${new Date(apt.date).getDate()}</div>
                    <div class="date-month">${new Date(apt.date).toLocaleString('default', { month: 'short' })}</div>
                </div>
                <div class="appointment-info">
                    <h4>Doctor: ${apt.doctor_name || apt.doctor || 'Not assigned'}</h4>
                    <p>${apt.specialty || apt.reason || 'Consultation'}</p>
                    <div class="appointment-meta">
                        <span><i class="fas fa-clock"></i> ${apt.time || new Date(apt.date).toLocaleTimeString()}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${apt.location || 'Medical Center'}</span>
                    </div>
                </div>
                <div class="appointment-actions">
                    ${isCancelled
                    ? '<button class="btn-outline" disabled>Cancelled</button>'
                    : `<button class="btn-outline" onclick="medibotPortal.openRescheduleModal(${apt.id})">Reschedule</button>
                    <button class="btn-danger" onclick="medibotPortal.cancelAppointment(${apt.id})">Cancel</button>`}
                </div>
            </div>
        `;
        }).join('');
    }

    setAppointmentsTab(tab) {
        this.currentAppointmentsTab = tab || 'upcoming';

        document.querySelectorAll('.appointments-tabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === this.currentAppointmentsTab);
        });

        if (Array.isArray(this.currentAppointments)) {
            this.renderAppointments(this.currentAppointments);
        } else {
            this.loadAppointments();
        }
    }

    filterAppointmentsByTab(appointments) {
        const now = new Date();
        const list = Array.isArray(appointments) ? [...appointments] : [];

        if (this.currentAppointmentsTab === 'cancelled') {
            const cancelledFromApi = list.filter(item => String(item.status || '').toLowerCase() === 'cancelled');
            const cancelledLocal = JSON.parse(localStorage.getItem('medibot-cancelled-appointments') || '[]');

            const merged = [...cancelledFromApi, ...cancelledLocal];
            const seen = new Set();
            return merged.filter(item => {
                const key = String(item.id || item.datetime || item.date || Math.random());
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        }

        if (this.currentAppointmentsTab === 'past') {
            return list.filter(item => {
                const dt = new Date(item.datetime || item.date);
                return !Number.isNaN(dt.getTime()) && dt < now;
            });
        }

        // Default: upcoming
        return list.filter(item => {
            if (String(item.status || '').toLowerCase() === 'cancelled') {
                return false;
            }
            const dt = new Date(item.datetime || item.date);
            return Number.isNaN(dt.getTime()) || dt >= now;
        });
    }

    cancelAppointment(appointmentId) {
        console.log('🗑️ Cancelling appointment:', appointmentId);

        const currentList = Array.isArray(this.currentAppointments) ? this.currentAppointments : [];
        const appointmentSnapshot = currentList.find(apt => String(apt.id) === String(appointmentId));

        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        const useBackend = this.isAuthenticated;

        if (useBackend) {
            fetch(`/api/appointments/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json().then(data => ({ ok: response.ok, data })))
                .then(({ ok, data }) => {
                    if (!ok) {
                        throw new Error(data.error || 'Failed to cancel appointment');
                    }
                    console.log('Appointment cancelled:', data);
                    this.handleCancellationSuccess(appointmentId, appointmentSnapshot);
                })
                .catch(error => {
                    console.error('Error cancelling appointment:', error);
                    this.cancelAppointmentLocally(appointmentId);
                });
        } else {
            this.cancelAppointmentLocally(appointmentId);
        }
    }

    cancelAppointmentLocally(appointmentId) {
        console.log('💾 Cancelling appointment locally:', appointmentId);

        // Get existing appointments
        let appointments = JSON.parse(localStorage.getItem('medibot-appointments') || '[]');
        const cancelledSnapshot = appointments.find(apt => String(apt.id) === String(appointmentId));

        // Remove the appointment
        appointments = appointments.filter(apt => apt.id != appointmentId);

        // Save back
        localStorage.setItem('medibot-appointments', JSON.stringify(appointments));

        // Handle success
        this.handleCancellationSuccess(appointmentId, cancelledSnapshot);
    }

    handleCancellationSuccess(appointmentId, cancelledAppointment = null) {
        console.log('✅ Appointment cancelled successfully');
        if (cancelledAppointment) {
            const cancelledHistory = JSON.parse(localStorage.getItem('medibot-cancelled-appointments') || '[]');
            cancelledHistory.unshift({
                ...cancelledAppointment,
                status: 'Cancelled',
                cancelledAt: new Date().toISOString()
            });
            localStorage.setItem('medibot-cancelled-appointments', JSON.stringify(cancelledHistory.slice(0, 50)));
        }
        this.showNotification('Appointment cancelled successfully', 'success');
        this.loadAppointments();
    }

    openRescheduleModal(appointmentId) {
        console.log('📅 Rescheduling appointment:', appointmentId);

        const liveAppointments = Array.isArray(this.currentAppointments) ? this.currentAppointments : [];
        const localAppointments = JSON.parse(localStorage.getItem('medibot-appointments') || '[]');
        const appointment =
            liveAppointments.find(apt => String(apt.id) === String(appointmentId)) ||
            localAppointments.find(apt => String(apt.id) === String(appointmentId));

        if (!appointment) {
            this.showNotification('Appointment not found', 'danger');
            return;
        }

        // Open the appointment modal
        this.openAppointmentModal();

        // Pre-fill the form
        setTimeout(() => {
            const form = document.getElementById('appointment-form');
            if (form) {
                const specialtyField = form.querySelector('[name="specialty"]');
                const doctorField = form.querySelector('[name="doctor_name"]');
                const locationField = form.querySelector('[name="location"]');
                const dateField = form.querySelector('[name="date"]');
                const timeField = form.querySelector('[name="time"]');
                const reasonField = form.querySelector('[name="reason"]');

                if (specialtyField) this.applySpecialtySuggestionToDropdown(specialtyField, appointment.specialty || '');
                if (doctorField) doctorField.value = appointment.doctor_name || '';
                if (locationField) locationField.value = appointment.location || '';
                if (dateField) dateField.value = (appointment.date || appointment.datetime || '').split('T')[0] || '';
                if (timeField) {
                    timeField.value = this.toTimeInputValue(appointment.time, appointment.datetime || appointment.date);
                }
                if (reasonField) reasonField.value = appointment.reason || '';

                // Store the ID to update instead of create
                form.dataset.rescheduleId = appointmentId;
            }
        }, 100);
    }

    toTimeInputValue(rawTime, fallbackDate) {
        if (typeof rawTime === 'string' && /^\d{2}:\d{2}$/.test(rawTime.trim())) {
            return rawTime.trim();
        }

        if (typeof rawTime === 'string') {
            const twelveHourMatch = rawTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            if (twelveHourMatch) {
                let hour = parseInt(twelveHourMatch[1], 10);
                const minute = twelveHourMatch[2];
                const meridiem = twelveHourMatch[3].toUpperCase();

                if (meridiem === 'PM' && hour !== 12) hour += 12;
                if (meridiem === 'AM' && hour === 12) hour = 0;

                return `${String(hour).padStart(2, '0')}:${minute}`;
            }
        }

        const parsed = fallbackDate ? new Date(fallbackDate) : null;
        if (parsed && !Number.isNaN(parsed.getTime())) {
            return parsed.toTimeString().slice(0, 5);
        }

        return '';
    }

    bookAppointment(appointmentData) {
        console.log('🎯 bookAppointment called!');
        console.log('📦 Received data:', appointmentData);
        console.log('📅 Book appointment function called with:', appointmentData);

        let rescheduleId = null;

        if (appointmentData && appointmentData.preventDefault) {
            appointmentData.preventDefault();

            const form = document.getElementById('appointment-form');
            if (!form) {
                console.error('❌ Form not found');
                this.showNotification('Form not found', 'danger');
                return;
            }

            // Check if this is a reschedule
            rescheduleId = form.dataset.rescheduleId;

            const specialty = form.querySelector('[name="specialty"]')?.value;
            const doctor_name = (form.querySelector('[name="doctor_name"]')?.value || '').trim();
            const location = (form.querySelector('[name="location"]')?.value || '').trim();
            const date = form.querySelector('[name="date"]')?.value;
            const time = form.querySelector('[name="time"]')?.value;
            const reason = form.querySelector('[name="reason"]')?.value;

            console.log('📋 Form data:', { specialty, doctor_name, location, date, time, reason, rescheduleId });

            if (!specialty || !date || !time) {
                console.warn('⚠️ Missing required fields');
                this.showNotification('Please fill in all required fields', 'warning');
                return;
            }

            appointmentData = { specialty, doctor_name, location, date, time, reason, rescheduleId };

            delete form.dataset.rescheduleId;
        }

        if (appointmentData.rescheduleId) {
            this.updateAppointment(appointmentData.rescheduleId, appointmentData);
            return;
        }

        const normalizedAppointment = {
            id: Date.now(),
            specialty: appointmentData.specialty,
            date: appointmentData.date,
            time: appointmentData.time,
            reason: appointmentData.reason || '',
            doctor_name: appointmentData.doctor_name || `Dr. ${appointmentData.specialty} Specialist`,
            location: appointmentData.location || 'Medical Center',
            status: 'Scheduled'
        };

        if (this.isAuthenticated) {
            fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    specialty: appointmentData.specialty,
                    doctor_name: appointmentData.doctor_name || '',
                    location: appointmentData.location || '',
                    date: appointmentData.date,
                    time: appointmentData.time,
                    reason: appointmentData.reason || ''
                })
            })
                .then(response => response.json().then(data => ({ ok: response.ok, data })))
                .then(({ ok, data }) => {
                    if (!ok) {
                        throw new Error(data.error || 'Unable to book appointment');
                    }
                    this.handleAppointmentSuccess(data.appointment || normalizedAppointment);
                })
                .catch(error => {
                    console.error('Backend appointment booking failed, falling back to local storage:', error);
                    this.saveAppointmentLocally(normalizedAppointment);
                });
            return;
        }

        this.saveAppointmentLocally(normalizedAppointment);
    }

    updateAppointment(appointmentId, appointmentData) {
        console.log('🔄 Updating appointment:', appointmentId, appointmentData);

        if (this.isAuthenticated) {
            fetch(`/api/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    specialty: appointmentData.specialty,
                    doctor_name: appointmentData.doctor_name || '',
                    location: appointmentData.location || '',
                    date: appointmentData.date,
                    time: appointmentData.time,
                    reason: appointmentData.reason || ''
                })
            })
                .then(response => response.json().then(data => ({ ok: response.ok, data })))
                .then(({ ok, data }) => {
                    if (!ok) {
                        throw new Error(data.error || 'Failed to update appointment');
                    }
                    this.showNotification('Appointment updated successfully!', 'success');
                    const modal = document.getElementById('appointment-modal');
                    if (modal) {
                        this.closeModal(modal);
                    }
                    const form = document.getElementById('appointment-form');
                    if (form) {
                        form.reset();
                    }
                    this.loadAppointments();
                })
                .catch(error => {
                    console.error('Backend update failed, updating locally:', error);
                    this.updateAppointmentLocally(appointmentId, appointmentData);
                });
            return;
        }

        this.updateAppointmentLocally(appointmentId, appointmentData);
    }

    updateAppointmentLocally(appointmentId, appointmentData) {
        console.log('💾 Updating appointment locally:', appointmentId, appointmentData);

        let appointments = JSON.parse(localStorage.getItem('medibot-appointments') || '[]');
        const index = appointments.findIndex(apt => apt.id == appointmentId);

        if (index !== -1) {
            appointments[index] = {
                ...appointments[index],
                specialty: appointmentData.specialty,
                date: appointmentData.date,
                time: appointmentData.time,
                reason: appointmentData.reason,
                doctor_name: appointmentData.doctor_name || `Dr. ${appointmentData.specialty} Specialist`
            };

            // Save back
            localStorage.setItem('medibot-appointments', JSON.stringify(appointments));
            this.handleAppointmentSuccess(appointments[index]);
        } else {
            this.showNotification('Appointment not found', 'danger');
        }
    }

    saveAppointmentLocally(appointment) {
        console.log('💾 Saving appointment locally:', appointment);

        // Get existing appointments from localStorage
        let appointments = JSON.parse(localStorage.getItem('medibot-appointments') || '[]');

        // Add new appointment
        appointments.push(appointment);

        // Save back to localStorage
        localStorage.setItem('medibot-appointments', JSON.stringify(appointments));

        // Handle success
        this.handleAppointmentSuccess(appointment);
    }

    handleAppointmentSuccess(appointment) {
        console.log('✅ Appointment saved successfully');

        // Show success notification
        this.showNotification('Appointment booked successfully!', 'success');

        // Close modal
        const modal = document.getElementById('appointment-modal');
        if (modal) {
            this.closeModal(modal);
        }

        // Reset form
        const form = document.getElementById('appointment-form');
        if (form) {
            form.reset();
        }

        // Navigate to appointments page
        this.navigateToPage('appointments');

        // Reload appointments to show the new one
        this.loadAppointments();
    }

    loadRecords() {
        console.log('Loading medical records...');

        const stored = JSON.parse(localStorage.getItem('medibot-records') || '[]');
        this.records = Array.isArray(stored) && stored.length ? stored : this.getDefaultRecords();

        if (!stored.length) {
            localStorage.setItem('medibot-records', JSON.stringify(this.records));
        }

        this.applyRecordFilters();
    }

    async loadReports() {
        const container = document.querySelector('#reports-page .reports-container');
        if (!container) {
            return;
        }

        const stored = JSON.parse(localStorage.getItem('medibot-health-reports') || '[]');
        this.healthReports = Array.isArray(stored) ? stored : [];

        if (this.isAuthenticated) {
            try {
                const response = await fetch('/api/reports', {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json().catch(() => []);

                if (response.ok && Array.isArray(data)) {
                    this.healthReports = data;
                    localStorage.setItem('medibot-health-reports', JSON.stringify(this.healthReports));
                }
            } catch (error) {
                console.warn('Unable to load reports from backend, using local data:', error.message || error);
            }
        }

        if (!this.healthReports.length) {
            const snapshot = this.buildHealthSnapshot();
            if (this.isAuthenticated) {
                await this.saveReportToBackend(snapshot, false);
            }

            this.healthReports = [snapshot];
            localStorage.setItem('medibot-health-reports', JSON.stringify(this.healthReports));
        }

        const latest = this.healthReports[0];
        const riskColor = latest.riskLevel === 'High' ? '#ef4444' : latest.riskLevel === 'Medium' ? '#f59e0b' : '#10b981';

        container.innerHTML = `
            <h2>Health Reports</h2>
            <p>View comprehensive health analytics and reports.</p>

            <div class="reports-toolbar" style="display:flex; gap:0.75rem; flex-wrap:wrap; margin:1rem 0 1.5rem;">
                <button class="btn-primary" data-report-action="generate"><i class="fas fa-sync-alt"></i> Generate New Snapshot</button>
                <button class="btn-outline" data-report-action="export-latest"><i class="fas fa-file-download"></i> Export Latest</button>
                <button class="btn-outline" data-report-action="export-all"><i class="fas fa-file-csv"></i> Export All</button>
            </div>

            <div class="report-summary-grid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:0.75rem; margin-bottom:1rem;">
                <div class="report-metric-card" style="background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:12px; padding:0.9rem;">
                    <small>Risk Level</small>
                    <h3 style="margin:0.35rem 0 0; color:${riskColor};">${latest.riskLevel}</h3>
                </div>
                <div class="report-metric-card" style="background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:12px; padding:0.9rem;">
                    <small>Heart Rate</small>
                    <h3 style="margin:0.35rem 0 0;">${latest.heartRate} BPM</h3>
                </div>
                <div class="report-metric-card" style="background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:12px; padding:0.9rem;">
                    <small>Temperature</small>
                    <h3 style="margin:0.35rem 0 0;">${latest.temperature}</h3>
                </div>
                <div class="report-metric-card" style="background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:12px; padding:0.9rem;">
                    <small>BMI</small>
                    <h3 style="margin:0.35rem 0 0;">${latest.bmi}</h3>
                </div>
            </div>

            <div class="report-latest-card" style="background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:12px; padding:1rem; margin-bottom:1.25rem;">
                <h3 style="margin-top:0;">Latest Report Summary</h3>
                <p style="margin-bottom:0.5rem;"><strong>Date:</strong> ${new Date(latest.createdAt).toLocaleString()}</p>
                <p style="margin-bottom:0.5rem;"><strong>Active Symptoms:</strong> ${latest.activeSymptomsCount}</p>
                <p style="margin-bottom:0.5rem;"><strong>Upcoming Appointments:</strong> ${latest.upcomingAppointments}</p>
                <p style="margin-bottom:0;"><strong>Clinical Note:</strong> ${latest.clinicalNote}</p>
            </div>

            <div class="report-history-card" style="background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:12px; padding:1rem;">
                <h3 style="margin-top:0;">Report History</h3>
                ${this.renderReportHistoryRows(this.healthReports)}
            </div>
        `;
    }

    buildHealthSnapshot() {
        const healthData = JSON.parse(localStorage.getItem('healthData') || '{}');
        const symptoms = JSON.parse(localStorage.getItem('medibot-symptoms') || '[]');
        const appointments = JSON.parse(localStorage.getItem('medibot-appointments') || '[]');

        const heartRate = Number(healthData?.heartRate?.value || 72);
        const temperatureValue = Number(healthData?.temperature?.value || 98.6);
        const tempUnit = healthData?.temperature?.unit || 'F';
        const bmiValue = Number(healthData?.bmi?.value || 23.2);
        const temperature = `${temperatureValue} °${tempUnit}`;

        const now = Date.now();
        const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
        const activeSymptoms = (symptoms || []).filter(item => {
            const ts = new Date(item.date).getTime();
            return !Number.isNaN(ts) && ts >= threeDaysAgo;
        });

        const upcomingAppointments = (appointments || []).filter(item => {
            const ts = new Date(item.datetime || item.date).getTime();
            return !Number.isNaN(ts) && ts >= now;
        }).length;

        let riskScore = 0;
        if (heartRate > 100 || heartRate < 55) riskScore += 2;
        if (temperatureValue >= 100.4) riskScore += 2;
        if (bmiValue >= 30 || bmiValue < 18.5) riskScore += 1;
        riskScore += Math.min(activeSymptoms.length, 4);

        const riskLevel = riskScore >= 6 ? 'High' : riskScore >= 3 ? 'Medium' : 'Low';

        const clinicalNote = riskLevel === 'High'
            ? 'Multiple abnormal indicators detected. Consider urgent clinical review.'
            : riskLevel === 'Medium'
                ? 'Some indicators need monitoring. Schedule follow-up if symptoms persist.'
                : 'Current indicators are generally stable. Continue routine monitoring.';

        return {
            id: String(Date.now()),
            createdAt: new Date().toISOString(),
            heartRate,
            temperature,
            bmi: bmiValue,
            activeSymptomsCount: activeSymptoms.length,
            upcomingAppointments,
            riskLevel,
            clinicalNote
        };
    }

    renderReportHistoryRows(reports) {
        if (!reports || !reports.length) {
            return '<p>No reports generated yet.</p>';
        }

        return `
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr>
                            <th style="text-align:left; padding:0.5rem; border-bottom:1px solid var(--glass-border);">Date</th>
                            <th style="text-align:left; padding:0.5rem; border-bottom:1px solid var(--glass-border);">Risk</th>
                            <th style="text-align:left; padding:0.5rem; border-bottom:1px solid var(--glass-border);">Symptoms</th>
                            <th style="text-align:left; padding:0.5rem; border-bottom:1px solid var(--glass-border);">Appointments</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reports.slice(0, 10).map(item => `
                            <tr>
                                <td style="padding:0.5rem; border-bottom:1px solid var(--glass-border);">${new Date(item.createdAt).toLocaleString()}</td>
                                <td style="padding:0.5rem; border-bottom:1px solid var(--glass-border);">${item.riskLevel}</td>
                                <td style="padding:0.5rem; border-bottom:1px solid var(--glass-border);">${item.activeSymptomsCount}</td>
                                <td style="padding:0.5rem; border-bottom:1px solid var(--glass-border);">${item.upcomingAppointments}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    async generateHealthSnapshotReport() {
        const snapshot = this.buildHealthSnapshot();
        const backendSnapshot = this.isAuthenticated
            ? await this.saveReportToBackend(snapshot, true)
            : null;

        const record = backendSnapshot || snapshot;
        this.healthReports = [record, ...(this.healthReports || [])].slice(0, 50);
        localStorage.setItem('medibot-health-reports', JSON.stringify(this.healthReports));
        this.loadReports();
        this.showNotification('New health snapshot generated', 'success');
    }

    async saveReportToBackend(snapshot, showWarning = true) {
        try {
            const response = await fetch('/api/reports', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(snapshot)
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.report) {
                throw new Error(data.error || 'Unable to save report to server');
            }

            return data.report;
        } catch (error) {
            if (showWarning) {
                this.showNotification('Backend report sync unavailable, saved locally', 'warning');
            }
            return null;
        }
    }

    exportLatestHealthReport() {
        const latest = (this.healthReports || [])[0];
        if (!latest) {
            this.showNotification('No report available to export', 'warning');
            return;
        }

        const text = [
            'MediBot Health Report',
            `Generated At: ${new Date(latest.createdAt).toLocaleString()}`,
            `Risk Level: ${latest.riskLevel}`,
            `Heart Rate: ${latest.heartRate} BPM`,
            `Temperature: ${latest.temperature}`,
            `BMI: ${latest.bmi}`,
            `Active Symptoms: ${latest.activeSymptomsCount}`,
            `Upcoming Appointments: ${latest.upcomingAppointments}`,
            `Clinical Note: ${latest.clinicalNote}`
        ].join('\n');

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `medibot-health-report-${new Date(latest.createdAt).toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    exportAllHealthReports() {
        const reports = this.healthReports || [];
        if (!reports.length) {
            this.showNotification('No reports available to export', 'warning');
            return;
        }

        const header = ['createdAt', 'riskLevel', 'heartRate', 'temperature', 'bmi', 'activeSymptomsCount', 'upcomingAppointments', 'clinicalNote'];
        const rows = reports.map(item => [
            item.createdAt,
            item.riskLevel,
            item.heartRate,
            item.temperature,
            item.bmi,
            item.activeSymptomsCount,
            item.upcomingAppointments,
            item.clinicalNote
        ]);

        const csv = [header, ...rows]
            .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `medibot-health-reports-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    getDefaultRecords() {
        return [
            {
                id: String(Date.now() - 2),
                title: 'Blood Test Results',
                description: 'Complete Blood Count (CBC)',
                doctor: 'Dr. Sarah Wilson',
                date: '2025-08-28',
                type: 'lab',
                status: 'normal',
                fileName: 'blood-test-results.pdf'
            },
            {
                id: String(Date.now() - 1),
                title: 'Prescription',
                description: 'Antibiotics and Pain Relief',
                doctor: 'Dr. Michael Brown',
                date: '2025-08-25',
                type: 'prescription',
                status: 'active',
                fileName: 'prescription-aug-25.pdf'
            }
        ];
    }

    applyRecordFilters() {
        const typeFilter = document.getElementById('record-type-filter')?.value || 'all';
        const dateFilter = document.getElementById('record-date-filter')?.value || '';

        let filtered = [...(this.records || [])];

        if (typeFilter !== 'all') {
            filtered = filtered.filter(record => (record.type || '').toLowerCase() === typeFilter.toLowerCase());
        }

        if (dateFilter) {
            filtered = filtered.filter(record => (record.date || '').slice(0, 10) === dateFilter);
        }

        this.renderRecords(filtered);
    }

    renderRecords(records) {
        const recordsList = document.querySelector('.records-list');
        if (!recordsList) {
            return;
        }

        if (!records || !records.length) {
            recordsList.innerHTML = `
                <div class="no-records" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-file-medical" style="font-size: 3rem; color: #999; margin-bottom: 1rem;"></i>
                    <p>No medical records found for selected filters.</p>
                </div>
            `;
            return;
        }

        const iconMap = {
            lab: 'fa-vial',
            prescription: 'fa-prescription-bottle-alt',
            imaging: 'fa-x-ray',
            vaccination: 'fa-syringe'
        };

        recordsList.innerHTML = records.map(record => {
            const icon = iconMap[(record.type || '').toLowerCase()] || 'fa-file-medical';
            const status = (record.status || 'active').toLowerCase();
            const statusClass = status === 'normal' ? 'normal' : 'active';
            const statusText = status === 'normal' ? 'Normal' : status === 'active' ? 'Active' : 'Review';

            return `
                <div class="record-card" data-record-id="${record.id}">
                    <div class="record-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="record-info">
                        <h4>${record.title || 'Medical Record'}</h4>
                        <p>${record.description || 'Uploaded medical file'}</p>
                        <small>${record.doctor || 'Self Upload'} • ${new Date(record.date || Date.now()).toLocaleDateString()}</small>
                    </div>
                    <div class="record-status">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="record-actions">
                        <button class="btn-sm" data-action="view" data-record-id="${record.id}"><i class="fas fa-eye"></i></button>
                        <button class="btn-sm" data-action="download" data-record-id="${record.id}"><i class="fas fa-download"></i></button>
                    </div>
                </div>
            `;
        }).join('');
    }

    openRecordUploadModal() {
        const modal = document.getElementById('record-upload-modal');
        if (!modal) {
            this.showNotification('Record upload modal not found', 'danger');
            return;
        }
        modal.classList.add('active', 'show');
    }

    closeRecordUploadModal() {
        const modal = document.getElementById('record-upload-modal');
        if (!modal) {
            return;
        }
        modal.classList.remove('active', 'show');

        const form = document.getElementById('record-upload-form');
        if (form) {
            form.reset();
        }

        const submitBtn = document.getElementById('upload-record-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
        }
    }

    async handleRecordUpload(event) {
        event.preventDefault();

        const fileInput = document.getElementById('medical-record-file');
        const file = fileInput?.files?.[0];
        if (!file) {
            this.showNotification('Please select a file to upload', 'warning');
            return;
        }

        const submitBtn = document.getElementById('upload-record-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Uploading...';
        }

        const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
        const type = extension === 'pdf' ? 'lab' : ['png', 'jpg', 'jpeg'].includes(extension) ? 'imaging' : 'prescription';

        let uploadedFileName = file.name;
        let uploadedFileUrl = '';

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Upload failed');
            }

            uploadedFileName = data.filename || file.name;
            uploadedFileUrl = data.fileUrl || '';
        } catch (error) {
            console.warn('Server upload failed, using local metadata only:', error.message || error);
            this.showNotification('File stored locally only (server upload unavailable)', 'warning');
        }

        const newRecord = {
            id: String(Date.now()),
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').slice(0, 60) || 'Uploaded Record',
            description: `${Math.max(1, Math.round(file.size / 1024))} KB`,
            doctor: this.currentUser?.firstName ? `${this.currentUser.firstName} Upload` : 'Self Upload',
            date: new Date().toISOString().slice(0, 10),
            type,
            status: 'active',
            fileName: uploadedFileName,
            fileUrl: uploadedFileUrl
        };

        this.records = [newRecord, ...(this.records || [])];
        localStorage.setItem('medibot-records', JSON.stringify(this.records));

        this.closeRecordUploadModal();
        this.applyRecordFilters();
        this.showNotification('Medical record uploaded successfully', 'success');

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Upload';
        }
    }

    viewRecord(recordId) {
        const record = (this.records || []).find(item => String(item.id) === String(recordId));
        if (!record) {
            this.showNotification('Record not found', 'warning');
            return;
        }

        if (record.fileUrl) {
            window.open(record.fileUrl, '_blank', 'noopener');
            return;
        }

        this.showNotification(`Viewing: ${record.title}`, 'info');
    }

    downloadRecord(recordId) {
        const record = (this.records || []).find(item => String(item.id) === String(recordId));
        if (!record) {
            this.showNotification('Record not found', 'warning');
            return;
        }

        if (record.fileUrl) {
            const anchor = document.createElement('a');
            anchor.href = record.fileUrl;
            anchor.download = record.fileName || `${(record.title || 'medical-record').replace(/\s+/g, '-').toLowerCase()}`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            return;
        }

        const blob = new Blob([
            `Medical Record\nTitle: ${record.title}\nDescription: ${record.description}\nDoctor: ${record.doctor}\nDate: ${record.date}\nType: ${record.type}`
        ], { type: 'text/plain' });

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${(record.title || 'medical-record').replace(/\s+/g, '-').toLowerCase()}.txt`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    exportAllRecords() {
        const records = this.records || [];
        if (!records.length) {
            this.showNotification('No records available to export', 'warning');
            return;
        }

        const header = ['Title', 'Description', 'Doctor', 'Date', 'Type', 'Status'];
        const rows = records.map(item => [
            item.title || '',
            item.description || '',
            item.doctor || '',
            item.date || '',
            item.type || '',
            item.status || ''
        ]);

        const csv = [header, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `medibot-records-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    // Authentication Methods
    openAuthModal(type = 'login') {
        const modal = document.getElementById('auth-modal');
        if (!modal) {
            return;
        }
        modal.classList.add('active', 'show');
        this.switchAuthTab(type);
    }

    closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (!modal) {
            return;
        }
        modal.classList.remove('active', 'show');
    }

    switchAuthTab(type) {
        this.currentAuthTab = type;

        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${type}"]`) || document.getElementById(`${type}-tab`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${type}-form`).classList.add('active');

        // Update modal title
        const title = type === 'login' ? 'Patient Login' : 'Create Patient Account';
        document.getElementById('auth-modal-title').textContent = title;
    }

    handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = document.getElementById('remember-me').checked;

        // Show loading state
        const submitBtn = event.target.querySelector('.auth-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
            .then(response => response.json().then(data => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                if (!ok) {
                    throw new Error(data.error || data.message || 'Login failed');
                }

                const user = data.user || {};
                user.avatar = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || email}`;
                user.lastLogin = new Date().toISOString();

                this.authenticateUser(user, rememberMe);
                this.closeModal(document.getElementById('auth-modal'));
                this.showNotification('Welcome back! Successfully logged in.', 'success');
            })
            .catch(error => {
                this.showNotification(error.message || 'Login failed', 'danger');
            })
            .finally(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
    }

    handleSignup(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const firstName = formData.get('firstname');
        const lastName = formData.get('lastname');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const dob = formData.get('dob');
        const gender = formData.get('gender');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm_password');

        // Validation
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'danger');
            return;
        }

        if (password.length < 8) {
            this.showNotification('Password must be at least 8 characters long', 'danger');
            return;
        }

        // Show loading state
        const submitBtn = event.target.querySelector('.auth-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;

        const age = dob ? Math.max(1, Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))) : 18;

        fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                phone,
                age,
                gender,
                password
            })
        })
            .then(response => response.json().then(data => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                if (!ok) {
                    throw new Error(data.error || data.message || 'Signup failed');
                }

                const user = {
                    id: data.id,
                    firstName,
                    lastName,
                    email,
                    phone,
                    age,
                    dateOfBirth: dob,
                    gender,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                    joinDate: new Date().toISOString(),
                    plan: 'Premium Patient',
                    lastLogin: new Date().toISOString()
                };

                this.authenticateUser(user, false);
                this.closeModal(document.getElementById('auth-modal'));
                this.showNotification('Account created successfully! Welcome to Medibot!', 'success');
            })
            .catch(error => {
                this.showNotification(error.message || 'Signup failed', 'danger');
            })
            .finally(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
    }

    authenticateUser(user, rememberMe = false) {
        this.isAuthenticated = true;
        this.currentUser = user;

        // Store in localStorage
        localStorage.setItem('medibot-authenticated', 'true');
        localStorage.setItem('medibot-user', JSON.stringify(user));
        localStorage.setItem('medibotUser', JSON.stringify(user));
        localStorage.setItem('medibot_user', JSON.stringify({
            ...user,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            isLoggedIn: true,
            userType: user.userType || 'patient'
        }));

        if (rememberMe) {
            localStorage.setItem('medibot-remember', 'true');
        }

        this.updateAuthUI();
        this.updateUserProfile();
    }

    handleLogout() {
        fetch('/logout', { method: 'POST' })
            .catch(() => null)
            .finally(() => {
                this.isAuthenticated = false;
                this.currentUser = null;

                localStorage.removeItem('medibot-authenticated');
                localStorage.removeItem('medibot-user');
                localStorage.removeItem('medibotUser');
                localStorage.removeItem('medibot_user');
                localStorage.removeItem('medibot-remember');

                this.closeAuthModal();

                this.updateAuthUI();
                this.showNotification('Successfully logged out', 'info');
            });
    }

    handleSocialLogin(provider) {
        this.showNotification(`${provider} login will be available soon!`, 'info');

        // In a real app, you would integrate with OAuth providers
        setTimeout(() => {
            const user = {
                id: Date.now(),
                firstName: provider === 'google' ? 'Google' : 'Facebook',
                lastName: 'User',
                email: `user@${provider}.com`,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
                joinDate: new Date().toISOString(),
                plan: 'Premium Patient',
                lastLogin: new Date().toISOString(),
                provider: provider
            };

            this.authenticateUser(user, false);
            this.closeModal(document.getElementById('auth-modal'));
            this.showNotification(`Welcome! Signed in with ${provider}`, 'success');
        }, 1000);
    }

    updateAuthUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');

        // Add null checks
        if (!authButtons || !userMenu) {
            console.warn('⚠️ Auth UI elements not found, skipping auth UI update');
            return;
        }

        if (this.isAuthenticated) {
            authButtons.style.display = 'none';
            userMenu.style.display = 'flex';
        } else {
            authButtons.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }

    updateUserProfile() {
        if (!this.currentUser) return;

        const fullName = `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() || this.currentUser.name || 'Guest User';
        const avatar = this.currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00d4ff&color=fff`;
        const plan = this.currentUser.plan || 'Patient Account';

        // Update header user info
        const headerUsername = document.getElementById('header-username');
        const headerAvatar = document.getElementById('header-user-avatar');
        if (headerUsername) headerUsername.textContent = fullName;
        if (headerAvatar) headerAvatar.src = avatar;

        // Update sidebar user info
        const username = document.getElementById('username');
        const userRole = document.getElementById('user-role');
        const userAvatar = document.getElementById('user-avatar');
        if (username) username.textContent = fullName;
        if (userRole) userRole.textContent = plan;
        if (userAvatar) userAvatar.src = avatar;

        const dashboardName = document.getElementById('dashboard-user-name');
        if (dashboardName) {
            dashboardName.textContent = this.currentUser.firstName || fullName;
        }
    }

    checkPasswordStrength(password) {
        const strengthMeter = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');

        if (!strengthMeter || !strengthText) {
            return;
        }

        let strength = 0;
        let text = 'Weak';
        let color = '#ef4444';

        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;

        if (strength >= 75) {
            text = 'Strong';
            color = '#22c55e';
        } else if (strength >= 50) {
            text = 'Medium';
            color = '#f59e0b';
        }

        strengthMeter.style.width = `${strength}%`;
        strengthMeter.style.background = color;
        strengthText.textContent = `Password strength: ${text}`;
        strengthText.style.color = color;
    }

    // Document Sharing & AI Analysis Methods
    handleDocumentUpload(files) {
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                const document = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file: file,
                    uploadDate: new Date()
                };

                this.uploadedDocuments.push(document);
                this.displayUploadedDocument(document);
                this.addDocumentToChat(document);
            }
        });
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (file.size > maxSize) {
            this.showNotification('File size should be less than 10MB', 'warning');
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            this.showNotification('File type not supported', 'warning');
            return false;
        }

        return true;
    }

    displayUploadedDocument(document) {
        const container = document.getElementById('shared-documents');
        const docChip = document.createElement('div');
        docChip.className = 'document-chip';
        docChip.innerHTML = `
      <i class="fas fa-file-medical"></i>
      <span>${document.name}</span>
      <button class="remove-doc" onclick="medibotPortal.removeDocument(${document.id})">×</button>
    `;
        container.appendChild(docChip);
    }

    removeDocument(docId) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== docId);
        this.refreshDocumentDisplay();
    }

    refreshDocumentDisplay() {
        const container = document.getElementById('shared-documents');
        container.innerHTML = '';
        this.uploadedDocuments.forEach(doc => this.displayUploadedDocument(doc));
    }

    addDocumentToChat(document) {
        const message = `📄 Shared medical document: <strong>${document.name}</strong><br>
      <small>Size: ${this.formatFileSize(document.size)} • Uploaded: ${new Date().toLocaleTimeString()}</small><br>
      <em>AI will analyze this document and provide insights based on your queries.</em>`;

        this.addChatMessage(message, 'user');

        // Simulate AI acknowledgment
        setTimeout(() => {
            const aiResponse = `I've received your medical document "${document.name}". I can now analyze this document to provide personalized recommendations. You can ask me questions about your report, request treatment suggestions, or ask for doctor/hospital recommendations based on your condition.`;
            this.addChatMessage(aiResponse, 'bot');
        }, 1000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    openAnalysisModal() {
        const modal = document.getElementById('ai-analysis-modal');
        modal.classList.add('active');
        this.currentAnalysisStep = 1;
        this.updateAnalysisStep();
    }

    handleAnalysisUpload(files) {
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                const document = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file: file
                };

                this.analysisDocuments.push(document);
                this.displayAnalysisDocument(document);
            }
        });

        if (this.analysisDocuments.length > 0) {
            document.getElementById('next-step').style.display = 'block';
        }
    }

    displayAnalysisDocument(document) {
        const container = document.getElementById('analysis-uploaded-files');
        const fileDiv = document.createElement('div');
        fileDiv.className = 'uploaded-file';

        let fileIcon = 'fas fa-file';
        let iconClass = 'document';

        if (document.type.includes('pdf')) {
            fileIcon = 'fas fa-file-pdf';
            iconClass = 'pdf';
        } else if (document.type.includes('image')) {
            fileIcon = 'fas fa-file-image';
            iconClass = 'image';
        }

        fileDiv.innerHTML = `
      <div class="file-icon ${iconClass}">
        <i class="${fileIcon}"></i>
      </div>
      <div class="file-info">
        <div class="file-name">${document.name}</div>
        <div class="file-size">${this.formatFileSize(document.size)}</div>
      </div>
      <button class="file-remove" onclick="medibotPortal.removeAnalysisDocument(${document.id})">×</button>
    `;

        container.appendChild(fileDiv);
    }

    removeAnalysisDocument(docId) {
        this.analysisDocuments = this.analysisDocuments.filter(doc => doc.id !== docId);
        this.refreshAnalysisDocuments();
    }

    refreshAnalysisDocuments() {
        const container = document.getElementById('analysis-uploaded-files');
        container.innerHTML = '';
        this.analysisDocuments.forEach(doc => this.displayAnalysisDocument(doc));
    }

    // Chat File Upload Methods
    handleChatFileUpload(files) {
        console.log('📁 Handling chat file upload:', files.length, 'files');
        const uploadedFiles = [];

        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                const document = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file: file,
                    uploadDate: new Date()
                };

                this.uploadedDocuments.push(document);
                uploadedFiles.push(document);
                this.displayChatUploadedFile(document);
            }
        });

        if (uploadedFiles.length > 0) {
            this.addFileUploadMessage(uploadedFiles);
            this.showAnalysisButton();
        }
    }

    displayChatUploadedFile(document) {
        const container = document.getElementById('chat-uploaded-files');
        const fileDiv = document.createElement('div');
        fileDiv.className = 'chat-uploaded-file';
        fileDiv.id = `chat-file-${document.id}`;

        let fileIcon = 'fas fa-file';
        let iconClass = 'document';

        if (document.type.includes('pdf')) {
            fileIcon = 'fas fa-file-pdf';
            iconClass = 'pdf';
        } else if (document.type.includes('image')) {
            fileIcon = 'fas fa-file-image';
            iconClass = 'image';
        } else if (document.type.includes('word')) {
            fileIcon = 'fas fa-file-word';
            iconClass = 'word';
        }

        fileDiv.innerHTML = `
            <div class="file-preview">
                <div class="file-icon ${iconClass}">
                    <i class="${fileIcon}"></i>
                </div>
                <div class="file-details">
                    <div class="file-name">${document.name}</div>
                    <div class="file-meta">${this.formatFileSize(document.size)} • ${new Date().toLocaleTimeString()}</div>
                </div>
                <button class="file-remove-btn" onclick="medibotPortal.removeChatFile(${document.id})" title="Remove file">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(fileDiv);
        this.updateUploadAreaVisibility();
    }

    removeChatFile(fileId) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== fileId);
        const fileElement = document.getElementById(`chat-file-${fileId}`);
        if (fileElement) {
            fileElement.remove();
        }
        this.updateUploadAreaVisibility();

        if (this.uploadedDocuments.length === 0) {
            this.hideAnalysisButton();
        }
    }

    updateUploadAreaVisibility() {
        const uploadArea = document.getElementById('chat-file-upload-area');
        const filesContainer = document.getElementById('chat-uploaded-files');

        if (this.uploadedDocuments.length > 0) {
            uploadArea.style.display = 'none';
            filesContainer.style.display = 'block';
        } else {
            uploadArea.style.display = 'flex';
            filesContainer.style.display = 'none';
        }
    }

    addFileUploadMessage(files) {
        const filesText = files.map(f => f.name).join(', ');
        const message = `📁 <strong>Uploaded ${files.length} medical document${files.length > 1 ? 's' : ''}:</strong><br>
            <div class="uploaded-files-summary">
                ${files.map(f => `
                    <div class="file-summary">
                        <i class="${this.getFileIcon(f.type)}"></i>
                        <span>${f.name}</span>
                        <small>(${this.formatFileSize(f.size)})</small>
                    </div>
                `).join('')}
            </div>
            <em>I can now analyze these documents to provide personalized medical advice.</em>`;

        this.addChatMessage(message, 'user');

        // AI acknowledgment
        setTimeout(() => {
            const aiResponse = `✅ I've received your medical document${files.length > 1 ? 's' : ''}. I can now provide personalized recommendations based on your reports. 
            
            <div class="ai-capabilities">
                <h4>I can help you with:</h4>
                <ul>
                    <li>🔍 Analyzing your test results and reports</li>
                    <li>👨‍⚕️ Recommending suitable doctors and specialists</li>
                    <li>🏥 Suggesting appropriate hospitals and clinics</li>
                    <li>💊 Explaining medications and treatments</li>
                    <li>📋 Providing care instructions and next steps</li>
                </ul>
            </div>
            
            Feel free to ask me any questions about your reports!`;
            this.addChatMessage(aiResponse, 'bot');
        }, 1500);
    }

    getFileIcon(fileType) {
        if (fileType.includes('pdf')) return 'fas fa-file-pdf text-red-500';
        if (fileType.includes('image')) return 'fas fa-file-image text-blue-500';
        if (fileType.includes('word')) return 'fas fa-file-word text-blue-600';
        return 'fas fa-file-medical text-green-500';
    }

    showAnalysisButton() {
        const button = document.getElementById('analyze-reports-btn');
        if (button) {
            button.style.display = 'block';
        }
    }

    hideAnalysisButton() {
        const button = document.getElementById('analyze-reports-btn');
        if (button) {
            button.style.display = 'none';
        }
    }

    analyzeUploadedReports() {
        if (this.uploadedDocuments.length === 0) {
            this.showNotification('Please upload medical reports first', 'warning');
            return;
        }

        const analysisMessage = `🔬 <strong>Analyzing ${this.uploadedDocuments.length} medical document${this.uploadedDocuments.length > 1 ? 's' : ''}...</strong>
            <div class="analysis-progress">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="analysis-steps">
                    <div class="step active">📄 Reading documents</div>
                    <div class="step">🔍 Extracting key data</div>
                    <div class="step">🧠 AI analysis</div>
                    <div class="step">💡 Generating insights</div>
                </div>
            </div>`;

        this.addChatMessage(analysisMessage, 'bot');

        // Simulate analysis progress
        this.simulateAnalysisProgress();
    }

    simulateAnalysisProgress() {
        const steps = document.querySelectorAll('.analysis-steps .step');
        let currentStep = 0;

        const progressInterval = setInterval(() => {
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('completed');
                if (currentStep + 1 < steps.length) {
                    steps[currentStep + 1].classList.add('active');
                }
                currentStep++;
            } else {
                clearInterval(progressInterval);
                setTimeout(() => {
                    this.showAnalysisResults();
                }, 1000);
            }
        }, 800);
    }

    showAnalysisResults() {
        const comprehensiveAnalysis = this.generateComprehensiveAnalysis();
        this.addChatMessage(comprehensiveAnalysis, 'bot');
    }

    generateComprehensiveAnalysis() {
        const reportTypes = this.uploadedDocuments.map(doc => {
            if (doc.name.toLowerCase().includes('blood')) return 'Blood Test';
            if (doc.name.toLowerCase().includes('xray') || doc.name.toLowerCase().includes('x-ray')) return 'X-Ray';
            if (doc.name.toLowerCase().includes('mri')) return 'MRI Scan';
            if (doc.name.toLowerCase().includes('ct') || doc.name.toLowerCase().includes('scan')) return 'CT Scan';
            if (doc.name.toLowerCase().includes('echo')) return 'Echocardiogram';
            return 'Medical Report';
        });

        return `
            <div class="comprehensive-analysis">
                <h3><i class="fas fa-microscope"></i> Comprehensive Medical Analysis</h3>
                
                <div class="analysis-summary">
                    <h4>📊 Report Summary</h4>
                    <ul>
                        ${this.uploadedDocuments.map((doc, index) => `
                            <li><strong>${reportTypes[index]}:</strong> ${doc.name}</li>
                        `).join('')}
                    </ul>
                </div>

                <div class="key-findings">
                    <h4>🔍 Key Findings</h4>
                    <div class="finding-item normal">
                        <i class="fas fa-check-circle"></i>
                        <span>Most parameters within normal ranges</span>
                    </div>
                    <div class="finding-item attention">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Some values require monitoring</span>
                    </div>
                </div>

                <div class="recommendations">
                    <h4>💡 AI Recommendations</h4>
                    <div class="recommendation-card">
                        <h5><i class="fas fa-user-md"></i> Specialist Consultation</h5>
                        <p>Recommend consultation with:</p>
                        <ul>
                            <li><strong>Dr. Rajesh Kumar</strong> - Cardiologist at Apollo Hospital</li>
                            <li><strong>Dr. Priya Sharma</strong> - Internal Medicine at Max Hospital</li>
                        </ul>
                    </div>

                    <div class="recommendation-card">
                        <h5><i class="fas fa-pills"></i> Treatment Suggestions</h5>
                        <ul>
                            <li>Continue current medications as prescribed</li>
                            <li>Regular monitoring every 3-4 weeks</li>
                            <li>Lifestyle modifications as discussed</li>
                        </ul>
                    </div>

                    <div class="recommendation-card">
                        <h5><i class="fas fa-heartbeat"></i> Lifestyle Recommendations</h5>
                        <ul>
                            <li>Maintain a balanced diet low in sodium</li>
                            <li>Regular exercise (30 minutes daily)</li>
                            <li>Adequate sleep (7-8 hours)</li>
                            <li>Stress management techniques</li>
                        </ul>
                    </div>
                </div>

                <div class="next-steps">
                    <h4>📋 Next Steps</h4>
                    <div class="timeline">
                        <div class="timeline-item urgent">
                            <div class="timeline-date">Next 1-2 days</div>
                            <div class="timeline-content">Schedule follow-up appointment</div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-date">Within 1 week</div>
                            <div class="timeline-content">Begin recommended lifestyle changes</div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-date">3-4 weeks</div>
                            <div class="timeline-content">Follow-up tests and monitoring</div>
                        </div>
                    </div>
                </div>

                <div class="analysis-footer">
                    <p><i class="fas fa-info-circle"></i> This analysis is AI-generated based on your uploaded documents. Please consult with your healthcare provider for professional medical advice.</p>
                </div>
            </div>
        `;
    }

    nextAnalysisStep() {
        if (this.currentAnalysisStep < 3) {
            this.currentAnalysisStep++;
            this.updateAnalysisStep();
        }
    }

    prevAnalysisStep() {
        if (this.currentAnalysisStep > 1) {
            this.currentAnalysisStep--;
            this.updateAnalysisStep();
        }
    }

    updateAnalysisStep() {
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentAnalysisStep);
        });

        // Update navigation buttons
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const startBtn = document.getElementById('start-analysis');

        prevBtn.style.display = this.currentAnalysisStep > 1 ? 'block' : 'none';

        if (this.currentAnalysisStep === 3) {
            nextBtn.style.display = 'none';
            startBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            startBtn.style.display = 'none';
        }

        // Handle step 2 form data
        if (this.currentAnalysisStep === 2) {
            this.setupStep2Events();
        }
    }

    setupStep2Events() {
        document.getElementById('current-symptoms').addEventListener('input', (e) => {
            this.analysisData.symptoms = e.target.value;
        });

        document.getElementById('medical-history').addEventListener('input', (e) => {
            this.analysisData.history = e.target.value;
        });

        document.getElementById('patient-age').addEventListener('input', (e) => {
            this.analysisData.age = e.target.value;
        });

        document.getElementById('priority-level').addEventListener('change', (e) => {
            this.analysisData.priority = e.target.value;
        });
    }

    startAIAnalysis() {
        // Show analysis progress
        document.getElementById('analysis-progress').style.display = 'block';
        document.getElementById('analysis-results').innerHTML = '';

        // Hide navigation buttons during analysis
        document.getElementById('start-analysis').style.display = 'none';
        document.getElementById('prev-step').style.display = 'none';

        this.simulateAIAnalysis();
    }

    simulateAIAnalysis() {
        const steps = document.querySelectorAll('.progress-step');
        const progressFill = document.querySelector('.progress-fill');
        let currentStep = 0;

        const progressInterval = setInterval(() => {
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('active');
                progressFill.style.width = `${(currentStep + 1) * 25}%`;
                currentStep++;
            } else {
                clearInterval(progressInterval);
                setTimeout(() => {
                    this.showAnalysisResults();
                }, 1000);
            }
        }, 1500);
    }

    showAnalysisResults() {
        document.getElementById('analysis-progress').style.display = 'none';

        const resultsHtml = `
      <div class="analysis-section">
        <h4><i class="fas fa-file-medical-alt"></i> Document Analysis Summary</h4>
        <div class="analysis-content">
          <p>I've analyzed your uploaded medical documents and identified the following key findings:</p>
          <ul>
            <li><strong>Blood Test Results:</strong> Some values are outside normal ranges, requiring attention</li>
            <li><strong>Symptoms Pattern:</strong> ${this.analysisData.symptoms || 'Based on provided symptoms'}</li>
            <li><strong>Priority Level:</strong> ${this.analysisData.priority.toUpperCase()}</li>
            <li><strong>Recommendations:</strong> Immediate consultation recommended</li>
          </ul>
        </div>
      </div>

      <div class="analysis-section">
        <h4><i class="fas fa-pills"></i> Recommended Medications</h4>
        <div class="recommendation-card">
          <div class="recommendation-header">
            <div class="recommendation-icon medicine">
              <i class="fas fa-pills"></i>
            </div>
            <div class="recommendation-title">
              <h5>Prescribed Medications</h5>
              <p>Based on your condition and reports</p>
            </div>
          </div>
          <div class="recommendation-body">
            <strong>Primary Treatment:</strong><br>
            • Antibiotic course (if infection indicated)<br>
            • Pain management medication<br>
            • Vitamin supplements as per deficiency<br><br>
            
            <strong>Dosage & Instructions:</strong><br>
            Please consult with the recommended doctor for proper dosage and administration guidelines.
            
            <div style="background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
              <strong>⚠️ Important:</strong> Do not self-medicate. These are AI-generated suggestions based on document analysis.
            </div>
          </div>
        </div>
      </div>

      <div class="analysis-section">
        <h4><i class="fas fa-user-md"></i> Recommended Doctors</h4>
        <div class="recommendation-card">
          <div class="recommendation-header">
            <div class="recommendation-icon doctor">
              <i class="fas fa-user-md"></i>
            </div>
            <div class="recommendation-title">
              <h5>Dr. Rajesh Kumar (Cardiologist)</h5>
              <p>15+ years experience • 4.8/5 rating</p>
            </div>
          </div>
          <div class="recommendation-body">
            <strong>Specialization:</strong> Cardiology, Internal Medicine<br>
            <strong>Location:</strong> Apollo Hospital, Delhi<br>
            <strong>Contact:</strong> +91-9876543210<br>
            <strong>Available:</strong> Mon-Fri, 10 AM - 6 PM<br><br>
            <strong>Why Recommended:</strong> Specializes in conditions similar to yours with excellent patient reviews.
          </div>
        </div>
        
        <div class="recommendation-card">
          <div class="recommendation-header">
            <div class="recommendation-icon doctor">
              <i class="fas fa-user-md"></i>
            </div>
            <div class="recommendation-title">
              <h5>Dr. Priya Sharma (General Physician)</h5>
              <p>12+ years experience • 4.7/5 rating</p>
            </div>
          </div>
          <div class="recommendation-body">
            <strong>Specialization:</strong> General Medicine, Preventive Care<br>
            <strong>Location:</strong> Max Hospital, Mumbai<br>
            <strong>Contact:</strong> +91-9876543211<br>
            <strong>Available:</strong> Mon-Sat, 9 AM - 7 PM<br><br>
            <strong>Why Recommended:</strong> Excellent for comprehensive health assessment and follow-up care.
          </div>
        </div>
      </div>

      <div class="analysis-section">
        <h4><i class="fas fa-hospital"></i> Recommended Hospitals</h4>
        <div class="recommendation-card">
          <div class="recommendation-header">
            <div class="recommendation-icon hospital">
              <i class="fas fa-hospital"></i>
            </div>
            <div class="recommendation-title">
              <h5>Apollo Hospital</h5>
              <p>Multi-specialty tertiary care hospital</p>
            </div>
          </div>
          <div class="recommendation-body">
            <strong>Departments:</strong> Cardiology, Neurology, Oncology, Emergency<br>
            <strong>Location:</strong> Multiple locations across India<br>
            <strong>Contact:</strong> 1860-500-1066<br>
            <strong>Services:</strong> 24/7 Emergency, Advanced Diagnostics, ICU<br><br>
            <strong>Why Recommended:</strong> State-of-the-art facilities with experienced specialists for your condition.
          </div>
        </div>
        
        <div class="recommendation-card">
          <div class="recommendation-header">
            <div class="recommendation-icon hospital">
              <i class="fas fa-hospital"></i>
            </div>
            <div class="recommendation-title">
              <h5>Max Super Specialty Hospital</h5>
              <p>Leading healthcare provider</p>
            </div>
          </div>
          <div class="recommendation-body">
            <strong>Departments:</strong> Internal Medicine, Cardiology, Gastroenterology<br>
            <strong>Location:</strong> Delhi NCR, Mumbai, Pune<br>
            <strong>Contact:</strong> +91-11-2651-5050<br>
            <strong>Services:</strong> Advanced Imaging, Lab Services, Telemedicine<br><br>
            <strong>Why Recommended:</strong> Excellent patient care with modern technology and experienced doctors.
          </div>
        </div>
      </div>
      
      <div class="analysis-section">
        <h4><i class="fas fa-lightbulb"></i> Additional Recommendations</h4>
        <div class="analysis-content">
          <ul>
            <li><strong>Immediate Action:</strong> Schedule appointment within 3-5 days</li>
            <li><strong>Lifestyle:</strong> Follow prescribed diet and exercise routine</li>
            <li><strong>Monitoring:</strong> Regular follow-up tests as advised</li>
            <li><strong>Emergency:</strong> Visit ER if symptoms worsen</li>
          </ul>
        </div>
      </div>
    `;

        document.getElementById('analysis-results').innerHTML = resultsHtml;

        // Show close button or restart option
        const navigation = document.querySelector('.step-navigation');
        navigation.innerHTML = `
      <button class="btn-outline" onclick="medibotPortal.closeModal(document.getElementById('ai-analysis-modal'))">
        <i class="fas fa-times"></i> Close
      </button>
      <button class="btn-primary" onclick="medibotPortal.saveAnalysisReport()">
        <i class="fas fa-download"></i> Save Report
      </button>
    `;
    }

    saveAnalysisReport() {
        this.showNotification('Analysis report saved to your medical records!', 'success');

        // Add to chat as well
        const summaryMessage = `🧠 AI Analysis Complete! I've analyzed your medical documents and provided comprehensive recommendations including:<br><br>
    ✅ Personalized medication suggestions<br>
    ✅ Best doctors for your condition<br>
    ✅ Top hospitals with relevant specialties<br>
    ✅ Next steps and follow-up care<br><br>
    The detailed report has been saved to your medical records.`;

        this.addChatMessage(summaryMessage, 'bot');
        this.closeModal(document.getElementById('ai-analysis-modal'));
    }

    // Enhanced chat message generation for document-based queries
    async generateAIResponse(userMessage) {
        const hasDocuments = this.uploadedDocuments.length > 0;
        const context = hasDocuments
            ? `User uploaded documents: ${this.uploadedDocuments.map(doc => doc.name || 'Unnamed file').join(', ')}`
            : '';

        try {
            const apiKey = localStorage.getItem('geminiApiKey') || '';
            const response = await fetch('/api/chat', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    context,
                    apiKey,
                    language: this.currentLanguage || 'hi'
                })
            });

            const data = await response.json().catch(() => ({}));
            if (response.ok && typeof data.reply === 'string' && data.reply.trim()) {
                return data.reply.replace(/\n/g, '<br>');
            }

            throw new Error(data.error || `Chat request failed with status ${response.status}`);
        } catch (error) {
            console.warn('Gemini chat unavailable, using local fallback:', error.message || error);
        }

        if (hasDocuments) {
            return this.generateDocumentBasedResponse(userMessage);
        } else {
            return this.generateGeneralResponse(userMessage);
        }
    }

    generateDocumentBasedResponse(userMessage) {
        const responses = [
            `Based on your uploaded medical documents, I can see some important findings. ${this.getSpecificRecommendation(userMessage)}`,
            `I've analyzed your reports and here's what I recommend: ${this.getPersonalizedAdvice(userMessage)}`,
            `Your documents show specific indicators. Let me provide targeted recommendations: ${this.getMedicalGuidance(userMessage)}`
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    getSpecificRecommendation(message) {
        if (message.toLowerCase().includes('doctor') || message.toLowerCase().includes('specialist')) {
            return `I recommend consulting Dr. Rajesh Kumar (Cardiologist) at Apollo Hospital or Dr. Priya Sharma (General Physician) at Max Hospital. Both have excellent experience with conditions similar to yours.`;
        }

        if (message.toLowerCase().includes('medicine') || message.toLowerCase().includes('treatment')) {
            return `Based on your reports, a combination of prescribed antibiotics and vitamin supplements may be beneficial. However, please consult with a doctor for proper dosage and administration.`;
        }

        if (message.toLowerCase().includes('hospital')) {
            return `Apollo Hospital and Max Super Specialty Hospital have the best facilities for your condition. Both offer 24/7 emergency services and have specialists familiar with your type of case.`;
        }

        return `Your reports indicate the need for immediate medical attention. I recommend booking an appointment within 3-5 days and following the personalized treatment plan I can provide.`;
    }

    getPersonalizedAdvice(message) {
        return `Priority consultation with a specialist is recommended. Your reports show specific markers that require professional evaluation. Would you like me to help you book an appointment or provide more details about the recommended doctors?`;
    }

    getMedicalGuidance(message) {
        return `Based on your medical history and current reports, I suggest a comprehensive approach including medication, lifestyle changes, and regular monitoring. Shall I provide detailed recommendations for doctors and hospitals in your area?`;
    }

    generateGeneralResponse(userMessage) {
        const text = (userMessage || '').trim();
        const lower = text.toLowerCase();

        if (!text) {
            return '<p>Please tell me your symptoms (for example: fever for 2 days, dry cough, headache), and I will suggest next steps.</p>';
        }

        const emergencyPattern = /(chest pain|heart attack|can.t breathe|unable to breathe|breathing problem|severe bleeding|unconscious|stroke|seizure|suicid)/i;
        if (emergencyPattern.test(text)) {
            return `
                <div class="medical-response">
                    <h4><i class="fas fa-ambulance"></i> Emergency Alert</h4>
                    <div class="alert alert-danger">
                        <strong>Call emergency services now:</strong> 108 / 112<br>
                        If symptoms are severe, go to the nearest emergency room immediately.
                    </div>
                    <p>Do not rely only on chat for emergency symptoms.</p>
                </div>
            `;
        }

        const greetingPattern = /^(hi|hello|hey|namaste|नमस्ते|hii|good morning|good evening)\b/i;
        if (greetingPattern.test(lower)) {
            const isHindi = this.currentLanguage === 'hi';
            return isHindi ? `
                <div class="medical-response">
                    <h4><i class="fas fa-user-md"></i> नमस्ते! Dr. AI Assistant</h4>
                    <p>मैं आपके लक्षणों की जानकारी, घरेलू उपचार और डॉक्टर से मिलने के सही समय में सहायता कर सकता हूँ।</p>
                    <ul>
                        <li>अपने लक्षण + कितने दिनों से + उम्र (अगर हो) बताएं</li>
                        <li>मैं संभावित कारण और अगले कदम सुझाऊंगा</li>
                        <li>किस विशेषज्ञ डॉक्टर से मिलें यह भी बताऊंगा</li>
                    </ul>
                    <p><strong>उदाहरण:</strong> "2 दिनों से बुखार है, गले में दर्द है"</p>
                </div>
            ` : `
                <div class="medical-response">
                    <h4><i class="fas fa-user-md"></i> Dr. AI Assistant</h4>
                    <p>I can help with symptom guidance, home care steps, and when to see a doctor.</p>
                    <ul>
                        <li>Tell me your symptoms + duration + age (optional)</li>
                        <li>I will suggest likely causes and next steps</li>
                        <li>I can also suggest specialist type and urgency</li>
                    </ul>
                    <p><strong>Example:</strong> "Fever 101F since 2 days with sore throat"</p>
                </div>
            `;
        }

        const medicalKeywordPattern = /(fever|temperature|cough|cold|headache|migraine|pain|stomach|vomit|nausea|dizziness|bp|blood pressure|sugar|diabetes|rash|allergy|infection|anxiety|stress|depression|pregnan|symptom|bukhar|khasi|sir dard|pet dard|ulti|chakkar|sardi|बुखार|ज्वर|खांसी|सर्दी|सिरदर्द|सिर दर्द|पेट दर्द|उल्टी|चक्कर)/i;
        if (medicalKeywordPattern.test(text)) {
            return this.generateMedicalResponse(text);
        }

        if (this.currentLanguage === 'hi') {
            return `
                <div class="medical-response">
                    <h4><i class="fas fa-notes-medical"></i> बेहतर सहायता के लिए लक्षण बताएं</h4>
                    <p>कृपया अपनी स्वास्थ्य समस्या इस तरह बताएं:</p>
                    <ul>
                        <li>मुख्य लक्षण (जैसे बुखार, खांसी, सिरदर्द)</li>
                        <li>कितने समय से है (घंटे/दिन)</li>
                        <li>कितना तकलीफ है (हल्का/मध्यम/गंभीर)</li>
                        <li>बुखार, दर्द, सांस की तकलीफ या कोई दवा ली है?</li>
                    </ul>
                    <p>फिर मैं step-by-step पूरी जानकारी दूंगा।</p>
                </div>
            `;
        }
        return `
            <div class="medical-response">
                <h4><i class="fas fa-notes-medical"></i> I can help better with medical details</h4>
                <p>Please share your health concern in this format:</p>
                <ul>
                    <li>Main symptom</li>
                    <li>Since when (hours/days)</li>
                    <li>Severity (mild/moderate/severe)</li>
                    <li>Any fever, pain, breathing issue, or medicines already taken</li>
                </ul>
                <p>Then I will provide step-by-step guidance.</p>
            </div>
        `;
    }
}
// Add additional styles for chat and notifications
const additionalStyles = `
  .chat-message {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .user-message {
    flex-direction: row-reverse;
  }
  
  .message-avatar canvas {
    border-radius: 50%;
  }
  
  .message-content {
    flex: 1;
  }
  
  .message-bubble {
    padding: 1rem;
    border-radius: 18px;
    max-width: 80%;
    word-wrap: break-word;
  }
  
  .user-bubble {
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: white;
    margin-left: auto;
    border-bottom-right-radius: 6px;
  }
  
  .bot-bubble {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-primary);
    border-bottom-left-radius: 6px;
  }
  
  .message-time {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 0.5rem;
    text-align: right;
  }
  
  .user-message .message-time {
    text-align: left;
  }
  
  .typing-bubble {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 18px;
    border-bottom-left-radius: 6px;
    padding: 1rem;
    width: fit-content;
  }
  
  .typing-dots {
    display: flex;
    gap: 4px;
  }
  
  .typing-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-primary);
    animation: typing 1.4s infinite ease-in-out;
  }
  
  .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
  .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
  
  @keyframes typing {
    0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .listening {
    animation: pulse 2s infinite;
    background: linear-gradient(135deg, var(--accent-danger), #dc2626) !important;
  }
  
  .notification {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.875rem;
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0;
    margin-left: 1rem;
  }
  
  .notification-close:hover {
    color: var(--text-primary);
  }
`;

// Password toggle function (global)
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Authentication Functions
function openAuthModal() {
    document.getElementById('authModal').style.display = 'block';
    setTimeout(() => {
        document.getElementById('authModal').style.opacity = '1';
    }, 10);
}

function closeAuthModal() {
    document.getElementById('authModal').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('authModal').style.display = 'none';
    }, 300);
}

function switchAuthTab(tab) {
    // Remove active class from all tabs and forms
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

    // Add active class to selected tab and form
    document.querySelector(`[onclick="switchAuthTab('${tab}')"]`).classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
}

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // For demo purposes, simulate login
    const userData = {
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email: email,
        joinDate: new Date().toLocaleDateString(),
        isLoggedIn: true
    };

    localStorage.setItem('medibot_user', JSON.stringify(userData));
    updateUserProfile(userData);
    closeAuthModal();

    showNotification('Login successful! Welcome to Medibot Portal', 'success');
}

function handleSignup(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const phone = document.getElementById('phone').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;

    if (!firstName || !lastName || !email || !password || !phone || !age || !gender) {
        alert('Please fill in all required fields');
        return;
    }

    // For demo purposes, simulate signup
    const userData = {
        name: firstName + ' ' + lastName,
        email: email,
        phone: phone,
        age: age,
        gender: gender,
        joinDate: new Date().toLocaleDateString(),
        isLoggedIn: true
    };

    localStorage.setItem('medibot_user', JSON.stringify(userData));
    updateUserProfile(userData);
    closeAuthModal();

    showNotification('Account created successfully! Welcome to Medibot Portal', 'success');
}

function updateUserProfile(userData) {
    const userProfile = document.querySelector('.user-profile');
    const userName = userProfile.querySelector('#username');
    const userRole = userProfile.querySelector('#user-role');
    const loginBtn = userProfile.querySelector('.login-btn');

    // Update user information
    userName.textContent = userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : userData.name || 'User';
    userRole.textContent = userData.userType ? `${userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1)} Account` : 'Patient Account';

    // Hide login button and show logout button
    if (loginBtn) {
        loginBtn.style.display = 'none';
    }

    // Add logout button if it doesn't exist
    let logoutBtn = userProfile.querySelector('.logout-btn');
    if (!logoutBtn) {
        logoutBtn = document.createElement('button');
        logoutBtn.className = 'logout-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
        logoutBtn.title = 'Logout';
        logoutBtn.onclick = () => handleLogout();
        userProfile.appendChild(logoutBtn);
    } else {
        logoutBtn.style.display = 'block';
    }

    // Update user profile click handler
    userProfile.onclick = () => showUserMenu();
}

function showUserMenu() {
    const userData = JSON.parse(localStorage.getItem('medibot_user'));
    if (!userData || !userData.isLoggedIn) {
        openAuthModal();
        return;
    }

    // Show user menu options
    showNotification('Profile menu: View Profile, Health History, Logout options coming soon!', 'info');
}

function handleLogout() {
    if (confirm('Are you sure you want to logout? You will be redirected to the login page.')) {
        logout();
        // Redirect to login page after logout
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Symptom Tracking Functions
class SymptomTracker {
    constructor(portal) {
        this.portal = portal;
        this.symptoms = this.loadSymptoms();
    }

    loadSymptoms() {
        return JSON.parse(localStorage.getItem('medibot-symptoms')) || [];
    }

    saveSymptoms() {
        localStorage.setItem('medibot-symptoms', JSON.stringify(this.symptoms));
    }

    addSymptom(symptomData) {
        const symptom = {
            id: Date.now(),
            ...symptomData,
            dateAdded: new Date().toISOString()
        };
        this.symptoms.push(symptom);
        this.saveSymptoms();
        return symptom;
    }

    updateSymptom(id, updates) {
        const index = this.symptoms.findIndex(s => s.id === id);
        if (index !== -1) {
            this.symptoms[index] = { ...this.symptoms[index], ...updates };
            this.saveSymptoms();
            return this.symptoms[index];
        }
        return null;
    }

    removeSymptom(id) {
        this.symptoms = this.symptoms.filter(s => s.id !== id);
        this.saveSymptoms();
    }

    getSymptomsByDateRange(startDate, endDate) {
        return this.symptoms.filter(symptom => {
            const symptomDate = new Date(symptom.date);
            return symptomDate >= startDate && symptomDate <= endDate;
        });
    }

    getSymptomsByCategory(category) {
        return this.symptoms.filter(symptom => symptom.category === category);
    }

    getCurrentSymptoms() {
        const today = new Date();
        const threeDaysAgo = new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000));
        return this.symptoms.filter(symptom => {
            const symptomDate = new Date(symptom.date);
            return symptomDate >= threeDaysAgo && (symptom.duration === 'ongoing' || symptom.duration === 'days');
        });
    }

    getSymptomStatistics() {
        const stats = {
            total: this.symptoms.length,
            categories: {},
            severityDistribution: {},
            mostCommon: {},
            recentTrends: []
        };

        // Category distribution
        this.symptoms.forEach(symptom => {
            stats.categories[symptom.category] = (stats.categories[symptom.category] || 0) + 1;
            stats.severityDistribution[symptom.severity] = (stats.severityDistribution[symptom.severity] || 0) + 1;
            stats.mostCommon[symptom.name] = (stats.mostCommon[symptom.name] || 0) + 1;
        });

        return stats;
    }
}

// Extend MedibotPortal with symptom tracking methods
MedibotPortal.prototype.initializeSymptomTracker = function () {
    this.symptomTracker = new SymptomTracker(this);
}

MedibotPortal.prototype.loadSymptoms = function () {
    return JSON.parse(localStorage.getItem('medibot-symptoms')) || [];
}

MedibotPortal.prototype.addNewSymptom = function () {
    const modal = document.getElementById('add-symptom-modal');
    modal.style.display = 'block';

    // Set current date/time
    const now = new Date();
    const localDateTime = now.toISOString().slice(0, 16);
    document.getElementById('symptom-date').value = localDateTime;
}

MedibotPortal.prototype.saveSymptom = function () {
    const form = document.getElementById('symptom-form');
    const formData = new FormData(form);

    const symptomData = {
        name: document.getElementById('symptom-name').value,
        severity: parseInt(document.getElementById('symptom-severity').value),
        category: document.getElementById('symptom-category').value,
        date: document.getElementById('symptom-date').value,
        duration: document.getElementById('symptom-duration').value,
        triggers: document.getElementById('symptom-triggers').value,
        description: document.getElementById('symptom-description').value,
        recurring: document.getElementById('symptom-recurring').checked
    };

    // Validate required fields
    if (!symptomData.name || !symptomData.severity || !symptomData.category || !symptomData.date) {
        this.showNotification('Please fill in all required fields', 'warning');
        return;
    }

    // Add symptom using the tracker
    if (!this.symptomTracker) {
        this.initializeSymptomTracker();
    }

    const newSymptom = this.symptomTracker.addSymptom(symptomData);

    // Close modal and refresh display
    this.closeModal(document.getElementById('add-symptom-modal'));
    this.refreshSymptomsDisplay();
    this.showNotification(`Symptom "${symptomData.name}" added successfully`, 'success');

    // Clear form
    form.reset();
}

MedibotPortal.prototype.refreshSymptomsDisplay = function () {
    if (this.currentPage === 'symptoms') {
        this.displayCurrentSymptoms();
        this.displaySymptomHistory();
        this.updateSymptomCharts();
    }
}

MedibotPortal.prototype.displayCurrentSymptoms = function () {
    if (!this.symptomTracker) {
        this.initializeSymptomTracker();
    }

    const currentSymptoms = this.symptomTracker.getCurrentSymptoms();
    const container = document.getElementById('current-symptoms-list');
    if (!container) {
        return;
    }

    if (currentSymptoms.length === 0) {
        container.innerHTML = `
            <div class="no-symptoms">
                <i class="fas fa-check-circle"></i>
                <h4>No Current Symptoms</h4>
                <p>You're feeling great! No active symptoms recorded.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = currentSymptoms.map(symptom => {
        const category = this.symptomCategories[symptom.category];
        const severityText = ['', 'Mild', 'Mild-Moderate', 'Moderate', 'Moderate-Severe', 'Severe'][symptom.severity];

        return `
            <div class="symptom-card current" data-severity="${symptom.severity}">
                <div class="symptom-header">
                    <div class="symptom-icon" style="color: ${category.color}">
                        <i class="${category.icon}"></i>
                    </div>
                    <div class="symptom-info">
                        <h4>${symptom.name}</h4>
                        <span class="symptom-category">${category.name}</span>
                    </div>
                    <div class="symptom-severity severity-${symptom.severity}">
                        ${severityText}
                    </div>
                </div>
                <div class="symptom-details">
                    <p><strong>Started:</strong> ${new Date(symptom.date).toLocaleString()}</p>
                    <p><strong>Duration:</strong> ${symptom.duration}</p>
                    ${symptom.triggers ? `<p><strong>Triggers:</strong> ${symptom.triggers}</p>` : ''}
                    ${symptom.description ? `<p><strong>Details:</strong> ${symptom.description}</p>` : ''}
                </div>
                <div class="symptom-actions">
                    <button class="btn-outline btn-sm" onclick="medibotPortal.updateSymptomSeverity(${symptom.id})">
                        <i class="fas fa-edit"></i> Update
                    </button>
                    <button class="btn-outline btn-sm" onclick="medibotPortal.resolveSymptom(${symptom.id})">
                        <i class="fas fa-check"></i> Resolve
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

MedibotPortal.prototype.displaySymptomHistory = function () {
    if (!this.symptomTracker) {
        this.initializeSymptomTracker();
    }

    const symptoms = this.symptomTracker.symptoms.slice().reverse(); // Most recent first
    const container = document.getElementById('symptom-timeline');
    if (!container) {
        return;
    }

    if (symptoms.length === 0) {
        container.innerHTML = `
            <div class="no-history">
                <i class="fas fa-history"></i>
                <h4>No Symptom History</h4>
                <p>Start tracking your symptoms to see trends and patterns.</p>
            </div>
        `;
        return;
    }

    // Group symptoms by date
    const groupedSymptoms = symptoms.reduce((groups, symptom) => {
        const date = new Date(symptom.date).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(symptom);
        return groups;
    }, {});

    container.innerHTML = Object.entries(groupedSymptoms).map(([date, daySymptoms]) => `
        <div class="timeline-day">
            <div class="timeline-date">
                <h4>${date}</h4>
                <span class="symptom-count">${daySymptoms.length} symptom${daySymptoms.length > 1 ? 's' : ''}</span>
            </div>
            <div class="timeline-symptoms">
                ${daySymptoms.map(symptom => {
        const category = this.symptomCategories[symptom.category];
        return `
                        <div class="timeline-symptom">
                            <div class="symptom-marker" style="background-color: ${category.color}">
                                <i class="${category.icon}"></i>
                            </div>
                            <div class="symptom-content">
                                <h5>${symptom.name}</h5>
                                <p>Severity: ${['', 'Mild', 'Mild-Moderate', 'Moderate', 'Moderate-Severe', 'Severe'][symptom.severity]}</p>
                                ${symptom.description ? `<p class="symptom-desc">${symptom.description}</p>` : ''}
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `).join('');
}

MedibotPortal.prototype.quickSymptomCheck = function () {
    const searchTerm = document.getElementById('symptom-search').value.trim().toLowerCase();
    if (!searchTerm) {
        this.showNotification('Please enter a symptom to check', 'warning');
        return;
    }

    const resultsContainer = document.getElementById('quick-symptom-results');
    resultsContainer.innerHTML = '<div class="loading">Analyzing symptoms...</div>';

    // Use the existing medical response system
    setTimeout(() => {
        const response = this.generateMedicalResponse(searchTerm);
        resultsContainer.innerHTML = `
            <div class="symptom-analysis-result">
                <h4><i class="fas fa-stethoscope"></i> Symptom Analysis: "${searchTerm}"</h4>
                ${response}
                <div class="analysis-actions">
                    <button class="btn-primary" onclick="medibotPortal.addSymptomFromAnalysis('${searchTerm}')">
                        <i class="fas fa-plus"></i> Track This Symptom
                    </button>
                    <button class="btn-outline" onclick="medibotPortal.openAppointmentModal()">
                        <i class="fas fa-calendar"></i> Book Appointment
                    </button>
                </div>
            </div>
        `;
    }, 1500);
}

MedibotPortal.prototype.addSymptomFromAnalysis = function (symptomName) {
    this.addNewSymptom();
    // Pre-fill the symptom name
    document.getElementById('symptom-name').value = symptomName;
}

MedibotPortal.prototype.updateSymptomSeverity = function (symptomId) {
    const symptom = this.symptomTracker.symptoms.find(s => s.id === symptomId);
    if (!symptom) return;

    const newSeverity = prompt(`Update severity for "${symptom.name}" (1-5):`, symptom.severity);
    if (newSeverity && newSeverity >= 1 && newSeverity <= 5) {
        this.symptomTracker.updateSymptom(symptomId, {
            severity: parseInt(newSeverity),
            lastUpdated: new Date().toISOString()
        });
        this.refreshSymptomsDisplay();
        this.showNotification('Symptom severity updated', 'success');
    }
}

MedibotPortal.prototype.resolveSymptom = function (symptomId) {
    const symptom = this.symptomTracker.symptoms.find(s => s.id === symptomId);
    if (!symptom) return;

    if (confirm(`Mark "${symptom.name}" as resolved?`)) {
        this.symptomTracker.updateSymptom(symptomId, {
            resolved: true,
            resolvedDate: new Date().toISOString()
        });
        this.refreshSymptomsDisplay();
        this.showNotification('Symptom marked as resolved', 'success');
    }
}

MedibotPortal.prototype.exportSymptomData = function () {
    if (!this.symptomTracker) {
        this.initializeSymptomTracker();
    }

    const symptoms = this.symptomTracker.symptoms;
    const csvContent = [
        ['Date', 'Symptom', 'Category', 'Severity', 'Duration', 'Triggers', 'Description', 'Resolved'].join(','),
        ...symptoms.map(s => [
            new Date(s.date).toLocaleDateString(),
            s.name,
            s.category,
            s.severity,
            s.duration,
            s.triggers || '',
            s.description || '',
            s.resolved ? 'Yes' : 'No'
        ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medibot-symptoms-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.showNotification('Symptom data exported successfully', 'success');
}

MedibotPortal.prototype.updateSymptomCharts = function () {
    if (!this.symptomTracker) {
        this.initializeSymptomTracker();
    }

    const stats = this.symptomTracker.getSymptomStatistics();

    // Symptom frequency chart
    const freqCanvas = document.getElementById('symptom-frequency-chart');
    if (freqCanvas && window.Chart) {
        if (this.charts.symptomFrequency) {
            this.charts.symptomFrequency.destroy();
        }

        this.charts.symptomFrequency = new Chart(freqCanvas, {
            type: 'doughnut',
            data: {
                labels: Object.keys(stats.mostCommon),
                datasets: [{
                    data: Object.values(stats.mostCommon),
                    backgroundColor: [
                        '#ff4757', '#3742fa', '#2ed573', '#ffa502',
                        '#ff6b6b', '#747d8c', '#5f27cd', '#00d2d3'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Severity chart
    const severityCanvas = document.getElementById('symptom-severity-chart');
    if (severityCanvas && window.Chart) {
        if (this.charts.symptomSeverity) {
            this.charts.symptomSeverity.destroy();
        }

        this.charts.symptomSeverity = new Chart(severityCanvas, {
            type: 'bar',
            data: {
                labels: ['Mild', 'Mild-Moderate', 'Moderate', 'Moderate-Severe', 'Severe'],
                datasets: [{
                    label: 'Frequency',
                    data: [
                        stats.severityDistribution[1] || 0,
                        stats.severityDistribution[2] || 0,
                        stats.severityDistribution[3] || 0,
                        stats.severityDistribution[4] || 0,
                        stats.severityDistribution[5] || 0
                    ],
                    backgroundColor: ['#2ed573', '#ffa502', '#ff6b6b', '#ff4757', '#c44569']
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

MedibotPortal.prototype.pickHindiFemaleVoice = function (voices = []) {
    if (!Array.isArray(voices) || voices.length === 0) {
        return null;
    }

    const isHindi = (voice) => (voice.lang || '').toLowerCase().startsWith('hi');
    const isFemaleNamed = (voice) => /female|woman|zira|priya|swara|heera|kalpana/i.test(voice.name || '');

    return voices.find((voice) => isHindi(voice) && isFemaleNamed(voice))
        || voices.find((voice) => isHindi(voice))
        || voices.find((voice) => (voice.lang || '').toLowerCase().startsWith('en') && isFemaleNamed(voice))
        || voices[0]
        || null;
};

MedibotPortal.prototype.matchesWakeWord = function (text) {
    const normalized = String(text || '').toLowerCase().trim();
    return (this.wakeWordPhrases || []).some((phrase) => normalized.includes(phrase));
};

MedibotPortal.prototype.getFormattedText = function (key, values = {}) {
    let template = this.getText(key);
    Object.entries(values).forEach(([name, value]) => {
        template = template.split(`{${name}}`).join(String(value));
    });
    return template;
};

MedibotPortal.prototype.setupVoiceSynthesis = function () {
    this.voiceSettings = {
        rate: 0.96,
        pitch: 1,
        volume: 0.95,
        voice: null
    };

    if (!('speechSynthesis' in window)) {
        return;
    }

    const applyVoice = () => {
        this.voices = window.speechSynthesis.getVoices();
        this.voiceSettings.voice = this.pickHindiFemaleVoice(this.voices);
    };

    window.speechSynthesis.onvoiceschanged = applyVoice;
    applyVoice();
};

MedibotPortal.prototype.setupSpeechRecognition = function () {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        this.recognition = null;
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = this.voiceLocale || 'hi-IN';

    this.recognition.onstart = () => {
        this.lastSpeechError = '';
        this._speechResultReceived = false;
        this.isListening = true;
        this.updateVoiceButton(true);
        this.updateVoiceStatus(this.awaitingWakeWord ? this.getText('voiceStatusWake') : this.getText('voiceStatusListening'));
        this.showVoiceFeedback(this.getText('voiceStatusListening'));
    };

    this.recognition.onresult = (event) => {
        this._speechResultReceived = true;
        const transcript = (((event.results || [])[0] || [])[0] || {}).transcript || '';
        const chatInput = document.getElementById('chat-input');

        if (this.voiceConversationActive && this.wakeWordEnabled && this.awaitingWakeWord) {
            if (!this.matchesWakeWord(transcript)) {
                this.updateVoiceStatus(this.getText('voiceStatusWake'));
                if (this.continuousConversation) {
                    setTimeout(() => this.startListening(), 250);
                }
                return;
            }

            this.awaitingWakeWord = false;
            this.updateVoiceStatus(this.getText('voiceStatusWakeDetected'));
            this.speakResponse(this.getText('voiceStatusWakeDetected'));
            return;
        }

        if (chatInput) {
            chatInput.value = transcript;
        }

        this.updateVoiceStatus(this.getFormattedText('voiceStatusHeard', { text: transcript }));

        if (typeof this.sendChatMessage === 'function') {
            this.sendChatMessage();
        } else if (typeof this.sendMessage === 'function') {
            this.sendMessage(transcript);
        }
    };

    this.recognition.onend = () => {
        this.isListening = false;
        this.updateVoiceButton(false);
        this.hideVoiceFeedback();
        this.pushToTalkActive = false;

        const pushToTalkButton = document.getElementById('push-to-talk');
        if (pushToTalkButton) {
            pushToTalkButton.classList.remove('listening');
        }

        if (this.lastSpeechError === 'not-allowed') {
            this.updateVoiceStatus(this.getText('voiceStatusPermission'));
            return;
        }

        if (!this._speechResultReceived) {
            this.updateVoiceStatus(this.getText('voiceStatusNoSpeech'));
            if (this.voiceConversationActive && this.continuousConversation) {
                setTimeout(() => this.startListening(), 300);
            }
            return;
        }

        if (this.voiceConversationActive) {
            this.updateVoiceStatus(this.getText('voiceStatusProcessing'));
        } else {
            this.updateVoiceStatus(this.getText('voiceStatusIdle'));
        }
    };

    this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.lastSpeechError = event.error || 'unknown';
        this.isListening = false;
        this.updateVoiceButton(false);
        this.hideVoiceFeedback();
        if (event.error === 'not-allowed') {
            this.voiceConversationActive = false;
            this.pushToTalkActive = false;
            this.awaitingWakeWord = !!this.wakeWordEnabled;
            if (typeof this.updateVoiceAssistantUI === 'function') {
                this.updateVoiceAssistantUI();
            }
            if (typeof this.updateMobileVoiceFab === 'function') {
                this.updateMobileVoiceFab();
            }
        }
        this.updateVoiceStatus(event.error === 'not-allowed'
            ? this.getText('voiceStatusPermission')
            : this.getText('voiceStatusError'));
    };
};

MedibotPortal.prototype.initializeSpeechRecognition = function () {
    this.setupSpeechRecognition();
};

MedibotPortal.prototype.ensureMicrophoneAccess = async function () {
    if (!(navigator && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function')) {
        return true;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        return true;
    } catch (error) {
        console.error('Microphone access denied/unavailable:', error);
        this.lastSpeechError = 'not-allowed';
        return false;
    }
};

MedibotPortal.prototype.toggleVoiceConversationMode = async function () {
    if (this.voiceConversationActive) {
        this.stopVoiceConversationMode();
        return;
    }

    const micAccessGranted = await this.ensureMicrophoneAccess();
    if (!micAccessGranted) {
        this.voiceConversationActive = false;
        this.awaitingWakeWord = !!this.wakeWordEnabled;
        this.updateVoiceStatus(this.getText('voiceStatusPermission'));
        if (typeof this.updateVoiceAssistantUI === 'function') {
            this.updateVoiceAssistantUI();
        }
        if (typeof this.updateMobileVoiceFab === 'function') {
            this.updateMobileVoiceFab();
        }
        return;
    }

    this.voiceConversationActive = true;
    this.autoSpeakResponses = true;
    this.continuousConversation = true;
    this.awaitingWakeWord = !!this.wakeWordEnabled;
    localStorage.setItem('medibot-chat-voice', 'on');
    localStorage.setItem('medibot-chat-continuous', 'on');
    this.updateVoiceStatus(this.awaitingWakeWord ? this.getText('voiceStatusWake') : this.getText('voiceStatusListening'));
    this.updateChatControlState();
    this.updateVoiceAssistantUI();
    this.startListening();
};

MedibotPortal.prototype.toggleVoiceInput = function () {
    if (!this.recognition) {
        this.setupSpeechRecognition();
    }

    if (!this.recognition) {
        this.showNotification(this.getText('voiceStatusUnsupported') || 'Speech recognition not supported', 'warning');
        return;
    }

    if (this.isListening || this._speechStartInProgress) {
        this.stopListening();
        return;
    }

    this.startListening();
};

MedibotPortal.prototype.startListening = function () {
    if (!this.recognition) {
        this.setupSpeechRecognition();
    }

    if (!this.recognition || this.isListening || this._speechStartInProgress) {
        return;
    }

    this.recognition.lang = this.voiceLocale || (this.currentLanguage === 'hi' ? 'hi-IN' : 'en-US');

    const now = Date.now();
    if (this._lastSpeechStartAt && now - this._lastSpeechStartAt < 500) {
        return;
    }

    this._speechStartInProgress = true;
    this._lastSpeechStartAt = now;

    try {
        this.recognition.start();
    } catch (error) {
        if (error && error.name === 'InvalidStateError') {
            this.isListening = true;
            this.updateVoiceButton(true);
            this.updateVoiceStatus(this.awaitingWakeWord ? this.getText('voiceStatusWake') : this.getText('voiceStatusListening'));
        } else {
            console.error('Failed to start speech recognition:', error);
            this.updateVoiceStatus(this.getText('voiceStatusError'));
        }
    } finally {
        setTimeout(() => {
            this._speechStartInProgress = false;
        }, 220);
    }
};

MedibotPortal.prototype.stopListening = function () {
    if (!this.recognition || this._speechStopInProgress) {
        return;
    }

    this._speechStopInProgress = true;
    try {
        this.recognition.stop();
    } catch (error) {
        console.error('Failed to stop speech recognition:', error);
    } finally {
        setTimeout(() => {
            this._speechStopInProgress = false;
        }, 180);
    }
};

MedibotPortal.prototype.updateVoiceButton = function (isListening) {
    const voiceButton = document.getElementById('voice-input');
    if (!voiceButton) {
        return;
    }

    voiceButton.className = isListening ? 'voice-btn listening' : 'voice-btn';
    voiceButton.innerHTML = `<i class="fas fa-${isListening ? 'stop' : 'microphone'}"></i>`;
    voiceButton.title = isListening
        ? (this.currentLanguage === 'hi' ? 'वॉइस इनपुट बंद करें' : 'Stop voice input')
        : (this.currentLanguage === 'hi' ? 'आवाज़ में पूछें' : 'Ask in voice');
};

MedibotPortal.prototype.showVoiceFeedback = function (message) {
    const existing = document.getElementById('voice-feedback');
    if (existing) {
        existing.textContent = message;
        return;
    }

    const feedback = document.createElement('div');
    feedback.id = 'voice-feedback';
    feedback.className = 'voice-feedback';
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        padding: var(--spacing-lg);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        z-index: 10000;
        animation: fadeInUp 0.3s ease-out;
    `;

    document.body.appendChild(feedback);
};

MedibotPortal.prototype.hideVoiceFeedback = function () {
    const feedback = document.getElementById('voice-feedback');
    if (feedback) {
        feedback.remove();
    }
};

MedibotPortal.prototype.stripHtmlForSpeech = function (text) {
    return String(text || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/\s+/g, ' ')
        .trim();
};

MedibotPortal.prototype.speakResponse = function (text) {
    if (!this.autoSpeakResponses || !('speechSynthesis' in window)) {
        return;
    }

    if (!this.voiceSettings || !this.voiceSettings.voice) {
        this.setupVoiceSynthesis();
    }

    const cleanedText = this.stripHtmlForSpeech(text);
    if (!cleanedText) {
        return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = (this.voiceSettings && this.voiceSettings.rate) || 0.96;
    utterance.pitch = (this.voiceSettings && this.voiceSettings.pitch) || 1;
    utterance.volume = (this.voiceSettings && this.voiceSettings.volume) || 0.95;
    utterance.lang = this.voiceLocale || 'hi-IN';

    if (this.voiceSettings && this.voiceSettings.voice) {
        utterance.voice = this.voiceSettings.voice;
    }

    utterance.onstart = () => {
        this.updateVoiceStatus(this.getText('voiceStatusReplying'));
    };

    utterance.onend = () => {
        if (this.continuousConversation && this.currentPage === 'chat' && !this.pushToTalkActive) {
            this.updateVoiceStatus(this.awaitingWakeWord ? this.getText('voiceStatusWake') : this.getText('voiceStatusReadyNext'));
            setTimeout(() => this.startListening(), 300);
        } else {
            this.updateVoiceStatus(this.getText('voiceStatusIdle'));
        }
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
};

// Initialize symptom tracker when page loads
document.addEventListener('DOMContentLoaded', function () {
    if (window.medibotPortal) {
        window.medibotPortal.initializeSymptomTracker();
    }
});

// Check for existing user session on page load
function checkUserSession() {
    const userData = JSON.parse(localStorage.getItem('medibot_user'));
    if (userData && userData.isLoggedIn) {
        updateUserProfile(userData);
    }
}

// Doctors functionality
class DoctorsManager {
    constructor() {
        this.doctors = this.getMockDoctors();
        this.filteredDoctors = [...this.doctors];
        this.currentFilters = {
            search: '',
            specialty: '',
            location: '',
            availability: ''
        };
        this.initializeDoctorsPage();
    }

    getMockDoctors() {
        return [
            {
                id: 1,
                name: 'Dr. Rahul Sharma',
                specialty: 'General Physician',
                specialtyKey: 'general',
                location: 'Downtown Medical Center',
                locationKey: 'downtown',
                rating: 4.8,
                reviews: 124,
                experience: '12 years',
                education: 'MBBS, MD (Internal Medicine)',
                availability: 'Available Today',
                availabilityKey: 'today',
                consultationFee: '₹1500',
                languages: ['English', 'Hindi'],
                image: null,
                phone: '+1-555-0123',
                email: 'rahul.sharma@medibot.com',
                about: 'Experienced general physician with expertise in preventive care and chronic disease management.'
            },
            {
                id: 2,
                name: 'Dr. Priya Gupta',
                specialty: 'Cardiologist',
                specialtyKey: 'cardiology',
                location: 'Heart Care Clinic',
                locationKey: 'central',
                rating: 4.9,
                reviews: 89,
                experience: '15 years',
                education: 'MBBS, MD (Cardiology), DM (Cardiology)',
                availability: 'Available Tomorrow',
                availabilityKey: 'tomorrow',
                consultationFee: '₹2200',
                languages: ['English', 'Hindi'],
                image: null,
                phone: '+1-555-0124',
                email: 'priya.gupta@medibot.com',
                about: 'Specialist in cardiovascular diseases with advanced training in interventional cardiology.'
            },
            {
                id: 3,
                name: 'Dr. Amit Joshi',
                specialty: 'Neurologist',
                specialtyKey: 'neurology',
                location: 'Brain & Spine Center',
                locationKey: 'uptown',
                rating: 4.7,
                reviews: 156,
                experience: '10 years',
                education: 'MBBS, MD (Neurology), DM (Neurology)',
                availability: 'Available This Week',
                availabilityKey: 'week',
                consultationFee: '₹2400',
                languages: ['English', 'Hindi', 'Gujarati'],
                image: null,
                phone: '+1-555-0125',
                email: 'amit.joshi@medibot.com',
                about: 'Neurology specialist focusing on epilepsy, stroke, and neurodegenerative disorders.'
            },
            {
                id: 4,
                name: 'Dr. Sunita Verma',
                specialty: 'Dermatologist',
                specialtyKey: 'dermatology',
                location: 'Skin Care Clinic',
                locationKey: 'suburb',
                rating: 4.6,
                reviews: 98,
                experience: '8 years',
                education: 'MBBS, MD (Dermatology)',
                availability: 'Available Today',
                availabilityKey: 'today',
                consultationFee: '₹1800',
                languages: ['English', 'Hindi'],
                image: null,
                phone: '+1-555-0126',
                email: 'sunita.verma@medibot.com',
                about: 'Dermatology expert specializing in cosmetic dermatology and skin cancer screening.'
            },
            {
                id: 5,
                name: 'Dr. Rajesh Kumar',
                specialty: 'Orthopedic Surgeon',
                specialtyKey: 'orthopedics',
                location: 'Bone & Joint Hospital',
                locationKey: 'downtown',
                rating: 4.8,
                reviews: 203,
                experience: '14 years',
                education: 'MBBS, MS (Orthopedics), MCh (Orthopedics)',
                availability: 'Available Tomorrow',
                availabilityKey: 'tomorrow',
                consultationFee: '₹2700',
                languages: ['English', 'Hindi', 'Punjabi'],
                image: null,
                phone: '+1-555-0127',
                email: 'rajesh.kumar@medibot.com',
                about: 'Orthopedic surgeon with expertise in joint replacement and sports medicine.'
            },
            {
                id: 6,
                name: 'Dr. Meera Patel',
                specialty: 'Pediatrician',
                specialtyKey: 'pediatrics',
                location: 'Children\'s Medical Center',
                locationKey: 'central',
                rating: 4.9,
                reviews: 167,
                experience: '11 years',
                education: 'MBBS, MD (Pediatrics)',
                availability: 'Available Today',
                availabilityKey: 'today',
                consultationFee: '₹1650',
                languages: ['English', 'Hindi', 'Gujarati'],
                image: null,
                phone: '+1-555-0128',
                email: 'meera.patel@medibot.com',
                about: 'Dedicated pediatrician providing comprehensive care for infants, children, and adolescents.'
            }
        ];
    }

    initializeDoctorsPage() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupDoctorsPage());
        } else {
            this.setupDoctorsPage();
        }
    }

    setupDoctorsPage() {
        const doctorSearch = document.getElementById('doctor-search');
        const specialtyFilter = document.getElementById('specialty-filter');
        const locationFilter = document.getElementById('location-filter');
        const availabilityFilter = document.getElementById('availability-filter');

        if (doctorSearch) {
            doctorSearch.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.filterDoctors();
            });
        }

        if (specialtyFilter) {
            specialtyFilter.addEventListener('change', (e) => {
                this.currentFilters.specialty = e.target.value;
                this.filterDoctors();
            });
        }

        if (locationFilter) {
            locationFilter.addEventListener('change', (e) => {
                this.currentFilters.location = e.target.value;
                this.filterDoctors();
            });
        }

        if (availabilityFilter) {
            availabilityFilter.addEventListener('change', (e) => {
                this.currentFilters.availability = e.target.value;
                this.filterDoctors();
            });
        }

        // Load doctors when page becomes visible
        this.observeDoctorsPage();
    }

    observeDoctorsPage() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const doctorsPage = document.getElementById('doctors-page');
                    if (doctorsPage && doctorsPage.classList.contains('active')) {
                        this.loadDoctors();
                    }
                }
            });
        });

        const doctorsPage = document.getElementById('doctors-page');
        if (doctorsPage) {
            observer.observe(doctorsPage, { attributes: true });
        }
    }

    filterDoctors() {
        this.filteredDoctors = this.doctors.filter(doctor => {
            const matchesSearch = !this.currentFilters.search ||
                doctor.name.toLowerCase().includes(this.currentFilters.search) ||
                doctor.specialty.toLowerCase().includes(this.currentFilters.search) ||
                doctor.location.toLowerCase().includes(this.currentFilters.search);

            const matchesSpecialty = !this.currentFilters.specialty ||
                doctor.specialtyKey === this.currentFilters.specialty;

            const matchesLocation = !this.currentFilters.location ||
                doctor.locationKey === this.currentFilters.location;

            const matchesAvailability = !this.currentFilters.availability ||
                doctor.availabilityKey === this.currentFilters.availability;

            return matchesSearch && matchesSpecialty && matchesLocation && matchesAvailability;
        });

        this.renderDoctors();
    }

    loadDoctors() {
        this.renderDoctors();
    }

    renderDoctors() {
        const doctorsList = document.getElementById('doctors-list');
        const noResults = document.getElementById('no-results');

        if (!doctorsList) return;

        if (this.filteredDoctors.length === 0) {
            doctorsList.innerHTML = '';
            if (noResults) noResults.classList.remove('hidden');
            return;
        }

        if (noResults) noResults.classList.add('hidden');

        doctorsList.innerHTML = this.filteredDoctors.map(doctor => this.createDoctorCard(doctor)).join('');
    }

    createDoctorCard(doctor) {
        const stars = this.generateStars(doctor.rating);
        const languages = doctor.languages.join(', ');

        return `
            <div class="doctor-card" data-doctor-id="${doctor.id}">
                <div class="doctor-header">
                    <div class="doctor-avatar">
                        ${doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div class="doctor-info">
                        <h3>${doctor.name}</h3>
                        <div class="doctor-specialty">${doctor.specialty}</div>
                        <div class="doctor-rating">
                            <div class="stars">${stars}</div>
                            <span class="rating-text">${doctor.rating} (${doctor.reviews} reviews)</span>
                        </div>
                    </div>
                </div>

                <div class="doctor-details">
                    <div class="doctor-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${doctor.location}</span>
                    </div>
                    <div class="doctor-detail">
                        <i class="fas fa-clock"></i>
                        <span>${doctor.availability}</span>
                    </div>
                    <div class="doctor-detail">
                        <i class="fas fa-graduation-cap"></i>
                        <span>${doctor.experience} experience</span>
                    </div>
                    <div class="doctor-detail">
                        <i class="fas fa-dollar-sign"></i>
                        <span>Consultation: ${doctor.consultationFee}</span>
                    </div>
                    <div class="doctor-detail">
                        <i class="fas fa-language"></i>
                        <span>${languages}</span>
                    </div>
                </div>

                <div class="doctor-actions">
                    <button class="btn-book-appointment" onclick="doctorsManager.bookAppointment(${doctor.id})">
                        <i class="fas fa-calendar-check"></i>
                        Book Appointment
                    </button>
                    <button class="btn-view-profile" onclick="doctorsManager.viewDoctorProfile(${doctor.id})">
                        <i class="fas fa-user-md"></i>
                        View Profile
                    </button>
                </div>
            </div>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }

        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        return stars;
    }

    bookAppointment(doctorId) {
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (!doctor) return;

        // Show success message
        this.showNotification(`Appointment request sent to ${doctor.name}!`, 'success');

        // Here you would typically integrate with a booking system
        // For now, we'll just show a confirmation
        setTimeout(() => {
            alert(`Appointment booked with ${doctor.name}!\n\nSpecialty: ${doctor.specialty}\nLocation: ${doctor.location}\nTime: Next available slot\n\nYou will receive a confirmation email shortly.`);
        }, 1000);
    }

    viewDoctorProfile(doctorId) {
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (!doctor) return;

        // Create profile modal
        const profileModal = document.createElement('div');
        profileModal.className = 'modal';
        profileModal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Doctor Profile</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div class="doctor-avatar" style="width: 100px; height: 100px; font-size: 2.5rem; margin: 0 auto 1rem;">
                            ${doctor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h2 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">${doctor.name}</h2>
                        <p style="color: var(--accent-primary); font-size: 1.1rem; margin: 0 0 1rem 0;">${doctor.specialty}</p>
                        <div class="doctor-rating" style="justify-content: center;">
                            <div class="stars">${this.generateStars(doctor.rating)}</div>
                            <span class="rating-text">${doctor.rating} (${doctor.reviews} reviews)</span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                        <div class="doctor-detail">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${doctor.location}</span>
                        </div>
                        <div class="doctor-detail">
                            <i class="fas fa-clock"></i>
                            <span>${doctor.availability}</span>
                        </div>
                        <div class="doctor-detail">
                            <i class="fas fa-graduation-cap"></i>
                            <span>${doctor.experience} experience</span>
                        </div>
                        <div class="doctor-detail">
                            <i class="fas fa-dollar-sign"></i>
                            <span>Consultation: ${doctor.consultationFee}</span>
                        </div>
                        <div class="doctor-detail">
                            <i class="fas fa-language"></i>
                            <span>${doctor.languages.join(', ')}</span>
                        </div>
                        <div class="doctor-detail">
                            <i class="fas fa-envelope"></i>
                            <span>${doctor.email}</span>
                        </div>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">About</h4>
                        <p style="color: var(--text-secondary); line-height: 1.6;">${doctor.about}</p>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Education</h4>
                        <p style="color: var(--text-secondary);">${doctor.education}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-outline" onclick="this.closest('.modal').remove()">Close</button>
                    <button class="btn-book-appointment" onclick="doctorsManager.bookAppointment(${doctor.id}); this.closest('.modal').remove();">
                        <i class="fas fa-calendar-check"></i>
                        Book Appointment
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(profileModal);
        profileModal.style.display = 'flex';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide and remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Pharmacy functionality
class PharmacyManager {
    constructor() {
        this.medicines = this.getMockMedicines();
        this.filteredMedicines = [...this.medicines];
        this.cart = this.loadCart();
        this.currentFilters = {
            search: '',
            category: 'all'
        };
        this.initializePharmacyPage();
    }

    getMockMedicines() {
        return [
            {
                id: 1,
                name: 'Paracetamol 500mg',
                brand: 'Generic',
                category: 'otc',
                description: 'Pain relief and fever reducer. Effective for headaches, body aches, and reducing fever.',
                price: 500,
                originalPrice: 650,
                stock: 50,
                dosage: '500mg tablets',
                quantity: 20,
                prescription: false,
                image: '💊',
                manufacturer: 'Generic Pharma',
                uses: ['Pain relief', 'Fever reduction', 'Headache', 'Body aches']
            },
            {
                id: 2,
                name: 'Amoxicillin 500mg',
                brand: 'Amoxil',
                category: 'prescription',
                description: 'Antibiotic for bacterial infections. Requires prescription.',
                price: 1080,
                originalPrice: 1325,
                stock: 25,
                dosage: '500mg capsules',
                quantity: 10,
                prescription: true,
                image: '🧴',
                manufacturer: 'Pfizer',
                uses: ['Bacterial infections', 'Ear infections', 'Urinary tract infections']
            },
            {
                id: 3,
                name: 'Vitamin D3 1000 IU',
                brand: 'NatureMade',
                category: 'supplements',
                description: 'Essential vitamin for bone health and immune system support.',
                price: 750,
                originalPrice: 900,
                stock: 100,
                dosage: '1000 IU softgels',
                quantity: 60,
                prescription: false,
                image: '🧴',
                manufacturer: 'NatureMade',
                uses: ['Bone health', 'Immune support', 'Calcium absorption']
            },
            {
                id: 4,
                name: 'Ibuprofen 400mg',
                brand: 'Advil',
                category: 'otc',
                description: 'NSAID for pain relief and reducing inflammation.',
                price: 580,
                originalPrice: 750,
                stock: 75,
                dosage: '400mg tablets',
                quantity: 30,
                prescription: false,
                image: '💊',
                manufacturer: 'Pfizer',
                uses: ['Pain relief', 'Inflammation', 'Fever', 'Arthritis']
            },
            {
                id: 5,
                name: 'Omeprazole 20mg',
                brand: 'Prilosec',
                category: 'prescription',
                description: 'Proton pump inhibitor for acid reflux and ulcers.',
                price: 830,
                originalPrice: 1080,
                stock: 40,
                dosage: '20mg capsules',
                quantity: 28,
                prescription: true,
                image: '💊',
                manufacturer: 'AstraZeneca',
                uses: ['Acid reflux', 'Ulcers', 'GERD', 'Heartburn']
            },
            {
                id: 6,
                name: 'Cetirizine 10mg',
                brand: 'Zyrtec',
                category: 'otc',
                description: 'Antihistamine for allergy relief.',
                price: 650,
                originalPrice: 830,
                stock: 60,
                dosage: '10mg tablets',
                quantity: 30,
                prescription: false,
                image: '💊',
                manufacturer: 'Johnson & Johnson',
                uses: ['Allergies', 'Hay fever', 'Hives', 'Itchy skin']
            },
            {
                id: 7,
                name: 'Multivitamin Gummies',
                brand: 'Centrum',
                category: 'supplements',
                description: 'Daily multivitamin in delicious gummy form.',
                price: 1245,
                originalPrice: 1575,
                stock: 30,
                dosage: 'Gummy vitamins',
                quantity: 60,
                prescription: false,
                image: '🍬',
                manufacturer: 'Centrum',
                uses: ['Daily nutrition', 'Vitamin supplement', 'Immune support']
            },
            {
                id: 8,
                name: 'Face Moisturizer SPF 30',
                brand: 'Cetaphil',
                category: 'personal-care',
                description: 'Daily moisturizer with SPF protection.',
                price: 1410,
                originalPrice: 1660,
                stock: 20,
                dosage: '50ml cream',
                quantity: 1,
                prescription: false,
                image: '🧴',
                manufacturer: 'Cetaphil',
                uses: ['Skin moisturizing', 'Sun protection', 'Daily care']
            },
            {
                id: 9,
                name: 'Azithromycin 250mg',
                brand: 'Zithromax',
                category: 'prescription',
                description: 'Antibiotic for various bacterial infections.',
                price: 1325,
                originalPrice: 1660,
                stock: 15,
                dosage: '250mg tablets',
                quantity: 6,
                prescription: true,
                image: '💊',
                manufacturer: 'Pfizer',
                uses: ['Bacterial infections', 'Respiratory infections', 'Skin infections']
            },
            {
                id: 10,
                name: 'Protein Powder Whey',
                brand: 'Optimum Nutrition',
                category: 'supplements',
                description: 'High-quality whey protein for muscle building.',
                price: 2490,
                originalPrice: 2905,
                stock: 12,
                dosage: '2lbs powder',
                quantity: 1,
                prescription: false,
                image: '🏋️',
                manufacturer: 'Optimum Nutrition',
                uses: ['Muscle building', 'Protein supplement', 'Fitness nutrition']
            }
        ];
    }

    initializePharmacyPage() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupPharmacyPage());
        } else {
            this.setupPharmacyPage();
        }
    }

    setupPharmacyPage() {
        const medicineSearch = document.getElementById('medicine-search');
        const categoryBtns = document.querySelectorAll('.category-btn');
        const cartBtn = document.getElementById('cart-btn');
        const cartClose = document.getElementById('cart-close');
        const checkoutBtn = document.getElementById('checkout-btn');
        const uploadArea = document.getElementById('upload-area');
        const prescriptionFile = document.getElementById('prescription-file');
        const uploadPrescriptionBtn = document.getElementById('upload-prescription-btn');

        if (medicineSearch) {
            medicineSearch.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.filterMedicines();
            });
        }

        if (categoryBtns) {
            categoryBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    categoryBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.currentFilters.category = e.target.dataset.category;
                    this.filterMedicines();
                });
            });
        }

        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.toggleCart());
        }

        if (cartClose) {
            cartClose.addEventListener('click', () => this.closeCart());
        }

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.showOrderModal());
        }

        if (uploadArea) {
            uploadArea.addEventListener('click', () => prescriptionFile.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--accent-primary)';
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = 'var(--border-color)';
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border-color)';
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileUpload(files[0]);
                }
            });
        }

        if (prescriptionFile) {
            prescriptionFile.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });
        }

        if (uploadPrescriptionBtn) {
            uploadPrescriptionBtn.addEventListener('click', () => this.uploadPrescription());
        }

        // Observe pharmacy page visibility
        this.observePharmacyPage();

        // Update cart count on initialization
        this.updateCartCount();
        this.renderCart();

        const pharmacyPage = document.getElementById('pharmacy-page');
        if (pharmacyPage && pharmacyPage.classList.contains('active')) {
            this.loadMedicines();
        }
    }

    observePharmacyPage() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const pharmacyPage = document.getElementById('pharmacy-page');
                    if (pharmacyPage && pharmacyPage.classList.contains('active')) {
                        this.loadMedicines();
                    }
                }
            });
        });

        const pharmacyPage = document.getElementById('pharmacy-page');
        if (pharmacyPage) {
            observer.observe(pharmacyPage, { attributes: true });
        }
    }

    filterMedicines() {
        this.filteredMedicines = this.medicines.filter(medicine => {
            const matchesSearch = !this.currentFilters.search ||
                medicine.name.toLowerCase().includes(this.currentFilters.search) ||
                medicine.brand.toLowerCase().includes(this.currentFilters.search) ||
                medicine.description.toLowerCase().includes(this.currentFilters.search) ||
                medicine.uses.some(use => use.toLowerCase().includes(this.currentFilters.search));

            const matchesCategory = this.currentFilters.category === 'all' ||
                medicine.category === this.currentFilters.category;

            return matchesSearch && matchesCategory;
        });

        this.renderMedicines();
    }

    loadMedicines() {
        this.renderMedicines();
    }

    renderMedicines() {
        const medicineGrid = document.getElementById('medicine-grid');
        const noResults = document.getElementById('pharmacy-no-results');

        if (!medicineGrid) return;

        if (this.filteredMedicines.length === 0) {
            medicineGrid.innerHTML = '';
            if (noResults) noResults.classList.remove('hidden');
            return;
        }

        if (noResults) noResults.classList.add('hidden');

        medicineGrid.innerHTML = this.filteredMedicines.map(medicine => this.createMedicineCard(medicine)).join('');
    }

    createMedicineCard(medicine) {
        const stockStatus = medicine.stock > 20 ? 'in-stock' : medicine.stock > 0 ? 'low-stock' : 'out-of-stock';
        const stockText = medicine.stock > 20 ? 'In Stock' : medicine.stock > 0 ? 'Low Stock' : 'Out of Stock';
        const discount = medicine.originalPrice > medicine.price ?
            `<span class="original-price">₹${medicine.originalPrice.toFixed(0)}</span>` : '';

        return `
            <div class="medicine-card" data-medicine-id="${medicine.id}">
                <div class="medicine-image">
                    ${medicine.image}
                </div>
                <div class="medicine-info">
                    <h3>${medicine.name}</h3>
                    <div class="medicine-brand">${medicine.brand}</div>
                    <div class="medicine-description">${medicine.description}</div>
                    <div class="medicine-details">
                        <div class="medicine-price">
                            ${discount}
                            ₹${medicine.price.toFixed(0)}
                        </div>
                        <div class="medicine-stock ${stockStatus}">${stockText}</div>
                    </div>
                    <div class="medicine-actions">
                        <button class="btn-add-cart" onclick="pharmacyManager.addToCart(${medicine.id})" ${medicine.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i>
                            Add to Cart
                        </button>
                        <button class="btn-view-details" onclick="pharmacyManager.viewMedicineDetails(${medicine.id})">
                            <i class="fas fa-info-circle"></i>
                            Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    addToCart(medicineId) {
        const medicine = this.medicines.find(m => m.id === medicineId);
        if (!medicine || medicine.stock === 0) return;

        const existingItem = this.cart.find(item => item.id === medicineId);
        if (existingItem) {
            if (existingItem.quantity < medicine.stock) {
                existingItem.quantity++;
            } else {
                this.showNotification('Maximum stock limit reached!', 'info');
                return;
            }
        } else {
            this.cart.push({
                ...medicine,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.renderCart();
        this.showNotification(`${medicine.name} added to cart!`, 'success');
    }

    removeFromCart(medicineId) {
        this.cart = this.cart.filter(item => item.id !== medicineId);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
        this.showNotification('Item removed from cart!', 'info');
    }

    updateCartItemQuantity(medicineId, newQuantity) {
        const item = this.cart.find(item => item.id === medicineId);
        const medicine = this.medicines.find(m => m.id === medicineId);

        if (!item || !medicine) return;

        if (newQuantity <= 0) {
            this.removeFromCart(medicineId);
            return;
        }

        if (newQuantity > medicine.stock) {
            this.showNotification('Cannot exceed available stock!', 'info');
            return;
        }

        item.quantity = newQuantity;
        this.saveCart();
        this.renderCart();
    }

    loadCart() {
        const savedCart = localStorage.getItem('medibot-cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('medibot-cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.toggle('open');
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('open');
        }
    }

    renderCart() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (!cartItems || !cartTotal || !checkoutBtn) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <small>Add medicines to get started</small>
                </div>
            `;
            cartTotal.textContent = '₹0';
            checkoutBtn.disabled = true;
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">${item.image}</div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.brand} • ${item.dosage}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="pharmacyManager.updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="pharmacyManager.updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <div class="cart-item-price">₹${(item.price * item.quantity).toFixed(0)}</div>
                <button class="cart-item-remove" onclick="pharmacyManager.removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `₹${total.toFixed(0)}`;
        checkoutBtn.disabled = false;
    }

    showOrderModal() {
        const orderModal = document.getElementById('order-modal');
        const orderSummary = document.getElementById('order-summary');
        const confirmOrderBtn = document.getElementById('confirm-order-btn');

        if (!orderModal || !orderSummary) return;

        // Generate order summary
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = this.getDeliveryFee();
        const total = subtotal + deliveryFee;

        orderSummary.innerHTML = `
            <div class="order-items">
                <h4>Order Summary</h4>
                ${this.cart.map(item => `
                    <div class="order-item">
                        <div class="order-item-info">
                            <span>${item.name} (${item.quantity}x)</span>
                            <span>₹${item.price.toFixed(0)} each</span>
                        </div>
                        <div class="order-item-total">₹${(item.price * item.quantity).toFixed(0)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="order-totals">
                <div class="order-row">
                    <span>Subtotal:</span>
                    <span>₹${subtotal.toFixed(0)}</span>
                </div>
                <div class="order-row">
                    <span>Delivery:</span>
                    <span>₹${deliveryFee.toFixed(0)}</span>
                </div>
                <div class="order-row total">
                    <span>Total:</span>
                    <span>₹${total.toFixed(0)}</span>
                </div>
            </div>
        `;

        // Show modal
        orderModal.style.display = 'flex';

        // Handle order confirmation
        const handleConfirm = () => {
            this.confirmOrder();
            orderModal.style.display = 'none';
            confirmOrderBtn.removeEventListener('click', handleConfirm);
        };

        confirmOrderBtn.addEventListener('click', handleConfirm);
    }

    getDeliveryFee() {
        const deliveryOptions = document.querySelectorAll('input[name="delivery"]:checked');
        if (deliveryOptions.length === 0) return 0;

        const selectedDelivery = deliveryOptions[0].value;
        switch (selectedDelivery) {
            case 'express': return 79;
            case 'same-day': return 149;
            default: return 0;
        }
    }

    confirmOrder() {
        // Here you would typically send the order to a backend
        this.showNotification('Order placed successfully! You will receive a confirmation email.', 'success');

        // Clear cart
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
        this.closeCart();

        // Reset delivery selection
        const standardDelivery = document.querySelector('input[name="delivery"][value="standard"]');
        if (standardDelivery) {
            standardDelivery.checked = true;
        }
    }

    viewMedicineDetails(medicineId) {
        const medicine = this.medicines.find(m => m.id === medicineId);
        if (!medicine) return;

        // Create details modal
        const detailsModal = document.createElement('div');
        detailsModal.className = 'modal';
        detailsModal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Medicine Details</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div class="medicine-image" style="width: 100px; height: 100px; font-size: 3rem; margin: 0 auto 1rem;">
                            ${medicine.image}
                        </div>
                        <h2 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">${medicine.name}</h2>
                        <p style="color: var(--accent-primary); font-size: 1.1rem; margin: 0 0 1rem 0;">${medicine.brand}</p>
                        <div class="medicine-price" style="font-size: 1.5rem;">
                            ₹${medicine.price.toFixed(0)}
                            ${medicine.originalPrice > medicine.price ? `<span class="original-price">₹${medicine.originalPrice.toFixed(0)}</span>` : ''}
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                        <div class="medicine-detail">
                            <i class="fas fa-pills"></i>
                            <span><strong>Dosage:</strong> ${medicine.dosage}</span>
                        </div>
                        <div class="medicine-detail">
                            <i class="fas fa-boxes"></i>
                            <span><strong>Quantity:</strong> ${medicine.quantity} ${medicine.quantity === 1 ? 'unit' : 'units'}</span>
                        </div>
                        <div class="medicine-detail">
                            <i class="fas fa-industry"></i>
                            <span><strong>Manufacturer:</strong> ${medicine.manufacturer}</span>
                        </div>
                        <div class="medicine-detail">
                            <i class="fas fa-warehouse"></i>
                            <span><strong>Stock:</strong> ${medicine.stock} available</span>
                        </div>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Description</h4>
                        <p style="color: var(--text-secondary); line-height: 1.6;">${medicine.description}</p>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Uses</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${medicine.uses.map(use => `<span style="background: var(--bg-secondary); padding: 0.25rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.9rem; color: var(--text-secondary);">${use}</span>`).join('')}
                        </div>
                    </div>

                    ${medicine.prescription ? `
                        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 2rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; color: #92400e;">
                                <i class="fas fa-exclamation-triangle"></i>
                                <strong>Prescription Required</strong>
                            </div>
                            <p style="color: #92400e; margin: 0.5rem 0 0 0;">This medicine requires a valid prescription. Please upload your prescription before adding to cart.</p>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn-outline" onclick="this.closest('.modal').remove()">Close</button>
                    <button class="btn-add-cart" onclick="pharmacyManager.addToCart(${medicine.id}); this.closest('.modal').remove();" ${medicine.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i>
                        Add to Cart - ₹${medicine.price.toFixed(0)}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(detailsModal);
        detailsModal.style.display = 'flex';
    }

    handleFileUpload(file) {
        // Validate file
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            this.showNotification('Please upload a valid image (JPG, PNG) or PDF file.', 'info');
            return;
        }

        if (file.size > maxSize) {
            this.showNotification('File size must be less than 5MB.', 'info');
            return;
        }

        // Show file name and enable upload button
        const uploadArea = document.getElementById('upload-area');
        const uploadBtn = document.getElementById('upload-prescription-btn');

        uploadArea.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <h4>${file.name}</h4>
            <p>File selected successfully</p>
        `;

        if (uploadBtn) {
            uploadBtn.disabled = false;
        }

        this.selectedFile = file;
    }

    uploadPrescription() {
        if (!this.selectedFile) return;

        // Here you would typically upload the file to a server
        this.showNotification('Prescription uploaded successfully! Our pharmacist will review it shortly.', 'success');

        // Close modal
        const modal = document.getElementById('prescription-modal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Reset form
        this.resetPrescriptionForm();
    }

    resetPrescriptionForm() {
        const uploadArea = document.getElementById('upload-area');
        const prescriptionFile = document.getElementById('prescription-file');
        const uploadBtn = document.getElementById('upload-prescription-btn');

        if (uploadArea) {
            uploadArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <h4>Drag & drop your prescription here</h4>
                <p>or <span class="upload-link">browse files</span></p>
            `;
        }

        if (prescriptionFile) {
            prescriptionFile.value = '';
        }

        if (uploadBtn) {
            uploadBtn.disabled = true;
        }

        this.selectedFile = null;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize pharmacy manager when DOM is loaded
let pharmacyManager;
document.addEventListener('DOMContentLoaded', () => {
    pharmacyManager = new PharmacyManager();
});

// Emergency Services Manager
class EmergencyManager {
    constructor() {
        this.userLocation = null;
        this.hospitals = [];
        this.initializeEmergencyPage();
    }

    initializeEmergencyPage() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEmergencyPage());
        } else {
            this.setupEmergencyPage();
        }
    }

    setupEmergencyPage() {
        const callEmergencyBtn = document.getElementById('call-emergency-btn');
        const requestAmbulanceBtn = document.getElementById('request-ambulance-btn');
        const findHospitalBtn = document.getElementById('find-hospital-btn');
        const refreshHospitalsBtn = document.getElementById('refresh-hospitals-btn');

        if (callEmergencyBtn) callEmergencyBtn.addEventListener('click', () => this.callEmergency());
        if (requestAmbulanceBtn) requestAmbulanceBtn.addEventListener('click', () => this.requestAmbulance());
        if (findHospitalBtn) findHospitalBtn.addEventListener('click', () => this.findNearestHospitals());
        if (refreshHospitalsBtn) refreshHospitalsBtn.addEventListener('click', () => this.findNearestHospitals());

        this.observeEmergencyPage();
    }

    observeEmergencyPage() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const emergencyPage = document.getElementById('emergency-page');
                    if (emergencyPage && emergencyPage.classList.contains('active')) {
                        this.onEmergencyPageLoad();
                    }
                }
            });
        });

        const emergencyPage = document.getElementById('emergency-page');
        if (emergencyPage) observer.observe(emergencyPage, { attributes: true });
    }

    onEmergencyPageLoad() {
        this.findNearestHospitals();
    }

    // ─── Get User Location ───────────────────────────────────────────────────────

    getUserLocation() {
        return new Promise((resolve, reject) => {
            const locationStatus = document.getElementById('location-status');
            if (locationStatus) {
                locationStatus.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Detecting your location...</span>`;
            }

            if (!navigator.geolocation) {
                this.updateLocationStatus('Geolocation is not supported by this browser.', 'error');
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.updateLocationStatus(
                        `Location detected: ${this.userLocation.lat.toFixed(4)}, ${this.userLocation.lng.toFixed(4)}`,
                        'success'
                    );
                    resolve(this.userLocation);
                },
                (error) => {
                    let message = 'Unable to detect location. ';
                    if (error.code === error.PERMISSION_DENIED) message += 'Please allow location access in your browser.';
                    else if (error.code === error.POSITION_UNAVAILABLE) message += 'Location information is unavailable.';
                    else if (error.code === error.TIMEOUT) message += 'Location request timed out.';
                    this.updateLocationStatus(message, 'error');
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
            );
        });
    }

    updateLocationStatus(message, type = 'info') {
        const locationStatus = document.getElementById('location-status');
        if (!locationStatus) return;
        const iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        locationStatus.innerHTML = `<i class="fas ${iconClass}"></i> <span>${message}</span>`;
    }

    // ─── Find Hospitals via Overpass API (OpenStreetMap) ─────────────────────────

    async findNearestHospitals() {
        const hospitalResults = document.getElementById('hospital-results');
        const hospitalList = document.getElementById('hospital-list');
        const noHospitals = document.getElementById('no-hospitals');

        if (hospitalResults) hospitalResults.style.display = 'block';
        if (noHospitals) noHospitals.style.display = 'none';
        if (hospitalList) {
            hospitalList.innerHTML = `
                <div style="text-align:center; padding:2rem; color:var(--text-secondary);">
                    <i class="fas fa-spinner fa-spin" style="font-size:2rem; margin-bottom:1rem;"></i>
                    <p>Finding hospitals near you...</p>
                </div>
            `;
        }

        try {
            // 1. Get location
            const location = await this.getUserLocation();

            // 2. Query Overpass API for nearby hospitals/clinics
            const radius = 5000; // 5km
            const query = `
                [out:json][timeout:25];
                (
                  node["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
                  way["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
                  node["amenity"="clinic"](around:${radius},${location.lat},${location.lng});
                  way["amenity"="clinic"](around:${radius},${location.lat},${location.lng});
                  node["healthcare"="hospital"](around:${radius},${location.lat},${location.lng});
                  way["healthcare"="hospital"](around:${radius},${location.lat},${location.lng});
                );
                out center;
            `;

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: `data=${encodeURIComponent(query)}`
            });

            if (!response.ok) throw new Error('Overpass API request failed');

            const data = await response.json();
            const elements = data.elements || [];

            if (elements.length === 0) {
                if (noHospitals) noHospitals.style.display = 'block';
                if (hospitalList) hospitalList.innerHTML = '';
                return;
            }

            // 3. Parse and sort by distance
            this.hospitals = elements
                .map(el => {
                    const lat = el.lat ?? el.center?.lat;
                    const lng = el.lon ?? el.center?.lon;
                    if (!lat || !lng) return null;

                    const distance = this.calculateDistance(location.lat, location.lng, lat, lng);
                    const tags = el.tags || {};

                    return {
                        id: el.id,
                        name: tags.name || tags['name:en'] || 'Unnamed Hospital',
                        type: tags.amenity === 'clinic' ? 'Clinic' : 'Hospital',
                        address: [
                            tags['addr:housenumber'],
                            tags['addr:street'],
                            tags['addr:city']
                        ].filter(Boolean).join(', ') || 'Address not available',
                        phone: tags.phone || tags['contact:phone'] || 'Not available',
                        website: tags.website || tags['contact:website'] || '',
                        emergency: tags.emergency === 'yes',
                        distance: Math.round(distance * 10) / 10,
                        coordinates: { lat, lng }
                    };
                })
                .filter(Boolean)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 10); // Show top 10 nearest

            this.renderHospitals();

        } catch (error) {
            console.error('Failed to find hospitals:', error);
            if (hospitalList) {
                hospitalList.innerHTML = `
                    <div style="text-align:center; padding:2rem; color:var(--text-secondary);">
                        <i class="fas fa-exclamation-triangle" style="font-size:2rem; margin-bottom:1rem; color:#f59e0b;"></i>
                        <p>${error.message || 'Failed to find hospitals. Please check your location permissions and try again.'}</p>
                        <button class="btn-primary" style="margin-top:1rem;" onclick="emergencyManager.findNearestHospitals()">
                            <i class="fas fa-redo"></i> Retry
                        </button>
                    </div>
                `;
            }
        }
    }

    renderHospitals() {
        const hospitalList = document.getElementById('hospital-list');
        const noHospitals = document.getElementById('no-hospitals');

        if (!hospitalList) return;

        if (!this.hospitals.length) {
            if (noHospitals) noHospitals.style.display = 'block';
            hospitalList.innerHTML = '';
            return;
        }

        hospitalList.innerHTML = this.hospitals.map(hospital => this.createHospitalCard(hospital)).join('');
    }

    createHospitalCard(hospital) {
        const distanceText = hospital.distance < 1
            ? `${Math.round(hospital.distance * 1000)} m`
            : `${hospital.distance} km`;

        const emergencyBadge = hospital.emergency
            ? `<span style="background:#ef4444; color:white; font-size:11px; padding:2px 8px; border-radius:10px; margin-left:8px;">24/7 Emergency</span>`
            : '';

        const phoneLink = hospital.phone !== 'Not available'
            ? `<a href="tel:${hospital.phone}" style="color:var(--accent-primary);">${hospital.phone}</a>`
            : 'Not available';

        return `
            <div class="hospital-card" style="
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1.2rem;
                margin-bottom: 1rem;
            ">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                    <div>
                        <h4 style="margin:0; color:var(--text-primary); font-size:1rem;">
                            ${hospital.name}${emergencyBadge}
                        </h4>
                        <span style="font-size:0.8rem; color:var(--accent-primary);">${hospital.type}</span>
                    </div>
                    <div style="text-align:right; flex-shrink:0; margin-left:1rem;">
                        <div style="font-size:1.2rem; font-weight:700; color:var(--accent-primary);">${distanceText}</div>
                        <div style="font-size:0.75rem; color:var(--text-muted);">away</div>
                    </div>
                </div>

                <div style="display:flex; flex-direction:column; gap:0.4rem; margin-bottom:1rem; font-size:0.875rem; color:var(--text-secondary);">
                    <div><i class="fas fa-map-marker-alt" style="width:16px; color:var(--accent-primary);"></i> ${hospital.address}</div>
                    <div><i class="fas fa-phone" style="width:16px; color:var(--accent-primary);"></i> ${phoneLink}</div>
                </div>

                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                    ${hospital.phone !== 'Not available' ? `
                        <button onclick="emergencyManager.callHospital('${hospital.phone}')" style="
                            flex:1; min-width:100px;
                            background:linear-gradient(135deg,#22c55e,#16a34a);
                            color:white; border:none; padding:0.5rem 1rem;
                            border-radius:8px; cursor:pointer; font-size:0.85rem;
                        ">
                            <i class="fas fa-phone"></i> Call
                        </button>
                    ` : ''}
                    <button onclick="emergencyManager.getDirections(${hospital.coordinates.lat}, ${hospital.coordinates.lng})" style="
                        flex:1; min-width:100px;
                        background:linear-gradient(135deg,#3b82f6,#2563eb);
                        color:white; border:none; padding:0.5rem 1rem;
                        border-radius:8px; cursor:pointer; font-size:0.85rem;
                    ">
                        <i class="fas fa-directions"></i> Directions
                    </button>
                    ${hospital.website ? `
                        <button onclick="window.open('${hospital.website}','_blank')" style="
                            flex:1; min-width:100px;
                            background:var(--glass-bg); border:1px solid var(--glass-border);
                            color:var(--text-primary); padding:0.5rem 1rem;
                            border-radius:8px; cursor:pointer; font-size:0.85rem;
                        ">
                            <i class="fas fa-globe"></i> Website
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    calculateDistance(lat1, lng1, lat2, lng2) {
        // Haversine formula — returns km
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    callEmergency() {
        window.open('tel:108', '_self');
    }

    requestAmbulance() {
        window.open('tel:102', '_self');
    }

    callHospital(phone) {
        window.open(`tel:${phone}`, '_self');
    }

    getDirections(lat, lng) {
        if (this.userLocation) {
            window.open(
                `https://www.google.com/maps/dir/${this.userLocation.lat},${this.userLocation.lng}/${lat},${lng}`,
                '_blank'
            );
        } else {
            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position:fixed; top:20px; right:20px;
            background:${type === 'success' ? '#10b981' : type === 'danger' ? '#ef4444' : '#3b82f6'};
            color:white; padding:12px 20px; border-radius:8px;
            font-weight:500; z-index:10000; box-shadow:0 4px 12px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }
}

let emergencyManager;
document.addEventListener('DOMContentLoaded', () => {
    emergencyManager = new EmergencyManager();
});



// Global test function for debugging
window.testModal = function () {
    console.log('🧪 Testing modal...');
    const modal = document.getElementById('appointment-modal');
    if (modal) {
        console.log('✅ Modal found');
        console.log('Current classes:', modal.className);
        modal.classList.add('active');
        console.log('✅ Active class added');
        console.log('New classes:', modal.className);
    } else {
        console.error('❌ Modal not found!');
    }
};

window.closeTestModal = function () {
    const modal = document.getElementById('appointment-modal');
    if (modal) {
        modal.classList.remove('active');
        console.log('✅ Modal closed');
    }
};
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Medibot Portal loaded");

    const bookBtn = document.getElementById("book-new-appointment");
    const modal = document.getElementById("appointment-modal");

    if (!bookBtn) {
        console.error("❌ Button #book-new-appointment not found!");
        return;
    }

    if (!modal) {
        console.error("❌ appointment-modal not found!");
        return;
    }

    bookBtn.addEventListener("click", () => {
        modal.style.display = "block";
        console.log("📅 Appointment modal opened");
    });
});
function openAppointmentModal() {
    console.log("🔔 Opening appointment modal...");
    const modal = document.getElementById("appointment-modal");
    if (modal) {
        modal.style.display = "flex";
        console.log("✅ Appointment modal opened!");
    } else {
        console.error("❌ Appointment modal not found in DOM!");
    }
}

