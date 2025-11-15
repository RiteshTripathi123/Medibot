class MedibotPortal {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentTheme = this.getInitialTheme();
        this.currentLanguage = localStorage.getItem('medibot-language') || 'en';
        this.sidebarOpen = window.innerWidth > 1024;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.charts = {};
        this.notifications = [];
        // Prevent duplicate chat sends from overlapping handlers
        this._lastSend = { text: '', time: 0 };

        // Authentication state
        this.isAuthenticated = localStorage.getItem('medibot-authenticated') === 'true';
        this.currentUser = JSON.parse(localStorage.getItem('medibot-user')) || null;
        this.currentAuthTab = 'login';

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
                findDoctor: "Find Doctor"
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
                findDoctor: "डॉक्टर खोजें"
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
            this.setupTheme();
            this.setupEventListeners();
            this.createBackgroundEffects();
            this.setupCharts();
            this.setupSpeechRecognition();
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
        // Check for user data from login.html
        const loginUserData = localStorage.getItem('medibotUser');
        const portalUserData = localStorage.getItem('medibot_user');

        if (loginUserData) {
            try {
                const userData = JSON.parse(loginUserData);
                console.log('✅ User authenticated from login page:', userData.email);

                // Update the portal user data
                const portalUser = {
                    name: `${userData.firstName} ${userData.lastName || ''}`.trim(),
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    userType: userData.userType || 'patient',
                    isLoggedIn: true,
                    loginTime: userData.loginTime || new Date().toISOString()
                };

                localStorage.setItem('medibot_user', JSON.stringify(portalUser));
                updateUserProfile(userData);

                // Show welcome notification
                setTimeout(() => {
                    showNotification(`Welcome back, ${userData.firstName}!`, 'success');
                }, 1000);

            } catch (error) {
                console.error('Error parsing login user data:', error);
            }
        } else if (portalUserData) {
            try {
                const userData = JSON.parse(portalUserData);
                if (userData.isLoggedIn) {
                    console.log('✅ User already authenticated in portal');
                    updateUserProfile(userData);
                }
            } catch (error) {
                console.error('Error parsing portal user data:', error);
            }
        } else {
            console.log('👤 No user authentication found - showing guest mode');
        }
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
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show target page
        document.getElementById(`${page}-page`).classList.add('active');

        // Update breadcrumb
        document.getElementById('current-page').textContent = this.getPageTitle(page);

        this.currentPage = page;

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
        this.currentLanguage = language;
        localStorage.setItem('medibot-language', language);
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
        }, 500);
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
        setTimeout(() => {
            console.log('🤖 Generating AI response now...');
            this.hideChatTyping();
            this.generateAIResponse(message);
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
            'fever|temperature|bukhar': {
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
                doctors: ['Dr. Rahul Sharma (General Physician)', 'Dr. Priya Gupta (Internal Medicine)'],
                hospitals: ['City Medical Center', 'Apollo Hospital']
            },

            'headache|sir dard|migraine': {
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
                doctors: ['Dr. Amit Joshi (Neurologist)', 'Dr. Sunita Verma (General Physician)'],
                hospitals: ['Fortis Hospital', 'Max Healthcare']
            },

            'cough|khasi|cold': {
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
                doctors: ['Dr. Rajesh Kumar (Pulmonologist)', 'Dr. Anita Mehta (ENT)'],
                hospitals: ['AIIMS', 'Safdarjung Hospital']
            },

            'stomach|pet|acidity|gas': {
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
        for (const [keywords, data] of Object.entries(medicalResponses)) {
            const regex = new RegExp(keywords, 'i');
            if (regex.test(message)) {
                // Add doctor and hospital suggestions
                let response = data.response;
                response += `<div class="recommendations">
                  <h5><i class="fas fa-user-md"></i> Recommended Doctors:</h5>
                  <ul>${data.doctors.map(doc => `<li>${doc}</li>`).join('')}</ul>
                  <h5><i class="fas fa-hospital"></i> Nearby Hospitals:</h5>
                  <ul>${data.hospitals.map(hospital => `<li>${hospital}</li>`).join('')}</ul>
                  <button class="book-appointment-btn" onclick="medibotPortal.openAppointmentModal()">
                    <i class="fas fa-calendar-plus"></i> Book Appointment
                  </button>
                </div>`;
                return response;
            }
        }

        // General health queries
        const generalResponses = [
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
            
            console.log('✅ Appointment form is ready with submit handler');
        } else {
            console.error('❌ Failed to create or find appointment form');
        }
    }

    closeModal(modal) {
        modal.classList.remove('active');
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
        // Update stats with real-time data
        this.simulateHealthData();
    }

    simulateHealthData() {
        // Static health data (no simulation, no external devices)
        // Heart rate is set to a normal static value
        const heartRate = 72; // Normal resting heart rate (static)
        const statValue = document.querySelector('.stat-card:first-child .stat-value');
        if (statValue) {
            statValue.innerHTML = `${heartRate} <span>BPM</span>`;
        }

        // Note: This is demo data only, not from any real device
        console.log('Health data set to static values (demo only)');
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
        
        const userId = this.currentUser?.id || 'demo';
        const useBackend = false; // Set to true when backend is running

        if (useBackend) {
            // Fetch from backend
            fetch('http://127.0.0.1:5000/appointments/' + userId, {
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
            // Load from localStorage
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

        if (appointments.length === 0) {
            appointmentsList.innerHTML = `
                <div class="no-appointments" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-calendar-times" style="font-size: 3rem; color: #999; margin-bottom: 1rem;"></i>
                    <p>No appointments found</p>
                    <button class="btn-primary" onclick="medibotPortal.openAppointmentModal()" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i> Book Your First Appointment
                    </button>
                </div>
            `;
            return;
        }

        appointmentsList.innerHTML = appointments.map(apt => `
            <div class="appointment-card">
                <div class="appointment-date">
                    <div class="date-day">${new Date(apt.date).getDate()}</div>
                    <div class="date-month">${new Date(apt.date).toLocaleString('default', { month: 'short' })}</div>
                </div>
                <div class="appointment-info">
                    <h4>${apt.doctor_name || 'Dr. ' + (apt.doctor || 'Unknown')}</h4>
                    <p>${apt.specialty || apt.reason || 'Consultation'}</p>
                    <div class="appointment-meta">
                        <span><i class="fas fa-clock"></i> ${apt.time || new Date(apt.date).toLocaleTimeString()}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${apt.location || 'Medical Center'}</span>
                    </div>
                </div>
                <div class="appointment-actions">
                    <button class="btn-outline" onclick="medibotPortal.openRescheduleModal(${apt.id})">Reschedule</button>
                    <button class="btn-danger" onclick="medibotPortal.cancelAppointment(${apt.id})">Cancel</button>
                </div>
            </div>
        `).join('');
    }

    cancelAppointment(appointmentId) {
        console.log('🗑️ Cancelling appointment:', appointmentId);
        
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        const useBackend = false; // Set to true when backend is running

        if (useBackend) {
            fetch(`http://127.0.0.1:5000/appointments/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Appointment cancelled:', data);
                this.handleCancellationSuccess(appointmentId);
            })
            .catch(error => {
                console.error('Error cancelling appointment:', error);
                // Fallback to local cancellation
                this.cancelAppointmentLocally(appointmentId);
            });
        } else {
            // Cancel locally
            this.cancelAppointmentLocally(appointmentId);
        }
    }

    cancelAppointmentLocally(appointmentId) {
        console.log('💾 Cancelling appointment locally:', appointmentId);
        
        // Get existing appointments
        let appointments = JSON.parse(localStorage.getItem('medibot-appointments') || '[]');
        
        // Remove the appointment
        appointments = appointments.filter(apt => apt.id != appointmentId);
        
        // Save back
        localStorage.setItem('medibot-appointments', JSON.stringify(appointments));
        
        // Handle success
        this.handleCancellationSuccess(appointmentId);
    }

    handleCancellationSuccess(appointmentId) {
        console.log('✅ Appointment cancelled successfully');
        this.showNotification('Appointment cancelled successfully', 'success');
        this.loadAppointments();
    }

    openRescheduleModal(appointmentId) {
        console.log('📅 Rescheduling appointment:', appointmentId);
        
        // Get the appointment
        let appointments = JSON.parse(localStorage.getItem('medibot-appointments') || '[]');
        const appointment = appointments.find(apt => apt.id == appointmentId);
        
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
                const dateField = form.querySelector('[name="date"]');
                const timeField = form.querySelector('[name="time"]');
                const reasonField = form.querySelector('[name="reason"]');
                
                if (specialtyField) specialtyField.value = appointment.specialty || '';
                if (dateField) dateField.value = appointment.date?.split('T')[0] || '';
                if (timeField) timeField.value = appointment.time || '';
                if (reasonField) reasonField.value = appointment.reason || '';
                
                // Store the ID to update instead of create
                form.dataset.rescheduleId = appointmentId;
            }
        }, 100);
    }

    bookAppointment(appointmentData) {
        console.log('🎯 bookAppointment called!');
        console.log('📦 Received data:', appointmentData);
        alert('Form submitted! Check console.');
        console.log('📅 Book appointment function called with:', appointmentData);
        
        // Check if this is a reschedule
        let rescheduleId = null;
        
        // If appointmentData is an event (from form submit), prevent default and get form data
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
            const date = form.querySelector('[name="date"]')?.value;
            const time = form.querySelector('[name="time"]')?.value;
            const reason = form.querySelector('[name="reason"]')?.value;

            console.log('📋 Form data:', { specialty, date, time, reason, rescheduleId });

            if (!specialty || !date || !time) {
                console.warn('⚠️ Missing required fields');
                this.showNotification('Please fill in all required fields', 'warning');
                return;
            }

            appointmentData = { specialty, date, time, reason, rescheduleId };
            
            // Clear the reschedule ID
            delete form.dataset.rescheduleId;
        }

        // If rescheduling, update the existing appointment
        if (appointmentData.rescheduleId) {
            this.updateAppointment(appointmentData.rescheduleId, appointmentData);
            return;
        }

        // ... rest of booking logic
    }

    updateAppointment(appointmentId, appointmentData) {
        console.log('🔄 Updating appointment:', appointmentId, appointmentData);
        
        // Get existing appointments
        let appointments = JSON.parse(localStorage.getItem('medibot-appointments') || '[]');
        
        // Find and update the appointment
        const index = appointments.findIndex(apt => apt.id == appointmentId);
        
        if (index !== -1) {
            appointments[index] = {
                ...appointments[index],
                specialty: appointmentData.specialty,
                date: appointmentData.date,
                time: appointmentData.time,
                reason: appointmentData.reason,
                doctor_name: `Dr. ${appointmentData.specialty} Specialist`
            };
            
            // Save back
            localStorage.setItem('medibot-appointments', JSON.stringify(appointments));
            
            // Handle success
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
        // Load medical records
        console.log('Loading medical records...');
    }

    // Authentication Methods
    openAuthModal(type = 'login') {
        const modal = document.getElementById('auth-modal');
        modal.classList.add('active');
        this.switchAuthTab(type);
    }

    switchAuthTab(type) {
        this.currentAuthTab = type;

        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${type}"]`).classList.add('active');

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
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = document.getElementById('remember-me').checked;

        // Show loading state
        const submitBtn = event.target.querySelector('.auth-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // For demo purposes, accept any email/password combination
            if (email && password) {
                const user = {
                    id: Date.now(),
                    firstName: 'Patient',
                    lastName: 'User',
                    email: email,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                    joinDate: new Date().toISOString(),
                    plan: 'Premium Patient',
                    lastLogin: new Date().toISOString()
                };

                this.authenticateUser(user, rememberMe);
                this.closeModal(document.getElementById('auth-modal'));
                this.showNotification('Welcome back! Successfully logged in.', 'success');
            } else {
                this.showNotification('Please enter valid credentials', 'danger');
            }

            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    handleSignup(event) {
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

        // Simulate API call
        setTimeout(() => {
            const user = {
                id: Date.now(),
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                dateOfBirth: dob,
                gender: gender,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                joinDate: new Date().toISOString(),
                plan: 'Premium Patient',
                lastLogin: new Date().toISOString()
            };

            this.authenticateUser(user, false);
            this.closeModal(document.getElementById('auth-modal'));
            this.showNotification('Account created successfully! Welcome to Medibot!', 'success');

            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    authenticateUser(user, rememberMe = false) {
        this.isAuthenticated = true;
        this.currentUser = user;

        // Store in localStorage
        localStorage.setItem('medibot-authenticated', 'true');
        localStorage.setItem('medibot-user', JSON.stringify(user));

        if (rememberMe) {
            localStorage.setItem('medibot-remember', 'true');
        }

        this.updateAuthUI();
        this.updateUserProfile();
    }

    handleLogout() {
        this.isAuthenticated = false;
        this.currentUser = null;

        // Clear localStorage
        localStorage.removeItem('medibot-authenticated');
        localStorage.removeItem('medibot-user');
        localStorage.removeItem('medibot-remember');

        this.updateAuthUI();
        this.showNotification('Successfully logged out', 'info');
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

        // Update header user info
        document.getElementById('header-username').textContent =
            `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        document.getElementById('header-user-avatar').src = this.currentUser.avatar;

        // Update sidebar user info
        document.getElementById('username').textContent =
            `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        document.getElementById('user-role').textContent = this.currentUser.plan;
        document.getElementById('user-avatar').src = this.currentUser.avatar;
    }

    checkPasswordStrength(password) {
        const strengthMeter = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');

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
    generateAIResponse(userMessage) {
        const hasDocuments = this.uploadedDocuments.length > 0;

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
        // Existing general response logic
        const responses = [
            "<p>I understand your concern. Can you provide more details about your symptoms? Uploading any medical reports would help me give more accurate recommendations.</p>",
            "<p>For better analysis and personalized recommendations, I suggest uploading your recent medical reports. I can then suggest the best doctors and treatments for your specific condition.</p>",
            "<p>I can provide much more accurate advice if you share your medical documents with me. This will help me recommend the right specialists and treatment options.</p>"
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }
}// Add additional styles for chat and notifications
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
                consultationFee: '$50',
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
                consultationFee: '$75',
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
                consultationFee: '$80',
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
                consultationFee: '$60',
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
                consultationFee: '$90',
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
                consultationFee: '$55',
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
                price: 5.99,
                originalPrice: 7.99,
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
                price: 12.99,
                originalPrice: 15.99,
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
                price: 8.99,
                originalPrice: 10.99,
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
                price: 6.99,
                originalPrice: 8.99,
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
                price: 9.99,
                originalPrice: 12.99,
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
                price: 7.99,
                originalPrice: 9.99,
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
                price: 14.99,
                originalPrice: 18.99,
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
                price: 16.99,
                originalPrice: 19.99,
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
                price: 15.99,
                originalPrice: 19.99,
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
                price: 29.99,
                originalPrice: 34.99,
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
            `<span class="original-price">$${medicine.originalPrice.toFixed(2)}</span>` : '';

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
                            $${medicine.price.toFixed(2)}
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
            cartTotal.textContent = '$0.00';
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
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="cart-item-remove" onclick="pharmacyManager.removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
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
                            <span>$${item.price.toFixed(2)} each</span>
                        </div>
                        <div class="order-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="order-totals">
                <div class="order-row">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="order-row">
                    <span>Delivery:</span>
                    <span>$${deliveryFee.toFixed(2)}</span>
                </div>
                <div class="order-row total">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
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
            case 'express': return 9.99;
            case 'same-day': return 14.99;
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
                            $${medicine.price.toFixed(2)}
                            ${medicine.originalPrice > medicine.price ? `<span class="original-price">$${medicine.originalPrice.toFixed(2)}</span>` : ''}
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
                        Add to Cart - $${medicine.price.toFixed(2)}
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
        this.hospitals = this.getMockHospitals();
        this.initializeEmergencyPage();
    }

    getMockHospitals() {
        return [
            {
                id: 1,
                name: 'City General Hospital',
                type: 'General Hospital',
                address: '123 Main Street, Downtown',
                phone: '+1-555-0101',
                distance: 0.8,
                rating: 4.5,
                emergencyServices: true,
                specialties: ['Emergency Medicine', 'Surgery', 'Internal Medicine'],
                facilities: ['24/7 Emergency', 'ICU', 'Operating Rooms', 'Pharmacy'],
                coordinates: { lat: 40.7128, lng: -74.0060 }
            },
            {
                id: 2,
                name: 'Metropolitan Medical Center',
                type: 'Medical Center',
                address: '456 Health Avenue, Midtown',
                phone: '+1-555-0102',
                distance: 1.2,
                rating: 4.7,
                emergencyServices: true,
                specialties: ['Cardiology', 'Neurology', 'Orthopedics'],
                facilities: ['Emergency Room', 'Cardiac Care', 'Neurology Unit', 'Pharmacy'],
                coordinates: { lat: 40.7589, lng: -73.9851 }
            },
            {
                id: 3,
                name: 'Regional Trauma Center',
                type: 'Trauma Center',
                address: '789 Care Boulevard, Uptown',
                phone: '+1-555-0103',
                distance: 1.8,
                rating: 4.3,
                emergencyServices: true,
                specialties: ['Trauma Surgery', 'Emergency Medicine', 'Critical Care'],
                facilities: ['Level 1 Trauma', 'Emergency Department', 'Intensive Care', 'Helipad'],
                coordinates: { lat: 40.7831, lng: -73.9712 }
            },
            {
                id: 4,
                name: 'Community Health Clinic',
                type: 'Clinic',
                address: '321 Wellness Drive, Suburb',
                phone: '+1-555-0104',
                distance: 2.5,
                rating: 4.1,
                emergencyServices: false,
                specialties: ['Family Medicine', 'Pediatrics', 'Internal Medicine'],
                facilities: ['Primary Care', 'Laboratory', 'Pharmacy', 'X-Ray'],
                coordinates: { lat: 40.7282, lng: -73.7949 }
            },
            {
                id: 5,
                name: 'Specialty Heart Institute',
                type: 'Specialty Hospital',
                address: '654 Cardiac Lane, Medical District',
                phone: '+1-555-0105',
                distance: 3.1,
                rating: 4.8,
                emergencyServices: true,
                specialties: ['Cardiology', 'Cardiac Surgery', 'Interventional Cardiology'],
                facilities: ['Cath Lab', 'Cardiac ICU', 'Emergency Services', 'Pharmacy'],
                coordinates: { lat: 40.7505, lng: -73.9934 }
            },
            {
                id: 6,
                name: 'Children\'s Medical Center',
                type: 'Children\'s Hospital',
                address: '987 Pediatric Plaza, Family District',
                phone: '+1-555-0106',
                distance: 3.8,
                rating: 4.6,
                emergencyServices: true,
                specialties: ['Pediatrics', 'Neonatology', 'Pediatric Surgery'],
                facilities: ['Pediatric ER', 'NICU', 'PICU', 'Children\'s Pharmacy'],
                coordinates: { lat: 40.7614, lng: -73.9776 }
            }
        ];
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

        if (callEmergencyBtn) {
            callEmergencyBtn.addEventListener('click', () => this.callEmergency());
        }

        if (requestAmbulanceBtn) {
            requestAmbulanceBtn.addEventListener('click', () => this.requestAmbulance());
        }

        if (findHospitalBtn) {
            findHospitalBtn.addEventListener('click', () => this.findNearestHospitals());
        }

        if (refreshHospitalsBtn) {
            refreshHospitalsBtn.addEventListener('click', () => this.findNearestHospitals());
        }

        // Observe emergency page visibility
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
        if (emergencyPage) {
            observer.observe(emergencyPage, { attributes: true });
        }
    }

    onEmergencyPageLoad() {
        // Auto-detect location when emergency page loads
        this.getUserLocation();
    }

    getUserLocation() {
        const locationStatus = document.getElementById('location-status');
        if (!locationStatus) return;

        locationStatus.innerHTML = `
            <i class="fas fa-spinner loading-spinner"></i>
            <span>Detecting your location...</span>
        `;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.updateLocationStatus('Location detected successfully!', 'success');
                    this.calculateHospitalDistances();
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    this.handleLocationError(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        } else {
            this.updateLocationStatus('Geolocation is not supported by this browser.', 'error');
        }
    }

    handleLocationError(error) {
        let message = 'Unable to detect your location. ';

        switch (error.code) {
            case error.PERMISSION_DENIED:
                message += 'Please enable location permissions and try again.';
                break;
            case error.POSITION_UNAVAILABLE:
                message += 'Location information is unavailable.';
                break;
            case error.TIMEOUT:
                message += 'Location request timed out.';
                break;
            default:
                message += 'An unknown error occurred.';
                break;
        }

        this.updateLocationStatus(message, 'error');
        // Use default location for demo purposes
        this.userLocation = { lat: 40.7128, lng: -74.0060 };
        this.calculateHospitalDistances();
    }

    updateLocationStatus(message, type = 'info') {
        const locationStatus = document.getElementById('location-status');
        if (!locationStatus) return;

        const iconClass = type === 'success' ? 'fa-check-circle' :
            type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle';

        locationStatus.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <span>${message}</span>
        `;
    }

    calculateHospitalDistances() {
        if (!this.userLocation) return;

        // Calculate distances using Haversine formula (simplified)
        this.hospitals.forEach(hospital => {
            const distance = this.calculateDistance(
                this.userLocation.lat, this.userLocation.lng,
                hospital.coordinates.lat, hospital.coordinates.lng
            );
            hospital.distance = Math.round(distance * 10) / 10; // Round to 1 decimal
        });

        // Sort by distance
        this.hospitals.sort((a, b) => a.distance - b.distance);
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        // Simplified distance calculation (in miles)
        const R = 3959; // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    findNearestHospitals() {
        const hospitalResults = document.getElementById('hospital-results');
        const hospitalList = document.getElementById('hospital-list');
        const noHospitals = document.getElementById('no-hospitals');

        if (!hospitalResults || !hospitalList) return;

        // Show loading state
        hospitalList.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner loading-spinner"></i>
                <p>Finding nearest hospitals...</p>
            </div>
        `;

        hospitalResults.style.display = 'block';
        if (noHospitals) noHospitals.style.display = 'none';

        // Simulate API call delay
        setTimeout(() => {
            if (this.hospitals.length > 0) {
                hospitalList.innerHTML = this.hospitals.map(hospital => this.createHospitalCard(hospital)).join('');
                if (noHospitals) noHospitals.style.display = 'none';
            } else {
                if (noHospitals) noHospitals.style.display = 'block';
                hospitalList.innerHTML = '';
            }
        }, 1500);
    }

    createHospitalCard(hospital) {
        const stars = this.generateStars(hospital.rating);
        const specialties = hospital.specialties.slice(0, 2).join(', ') + (hospital.specialties.length > 2 ? '...' : '');
        const facilities = hospital.facilities.slice(0, 2).join(', ') + (hospital.facilities.length > 2 ? '...' : '');

        return `
            <div class="hospital-card" data-hospital-id="${hospital.id}">
                <div class="hospital-header">
                    <div class="hospital-info">
                        <h4>${hospital.name}</h4>
                        <span class="hospital-type">${hospital.type}</span>
                    </div>
                    <div class="hospital-distance">
                        <div class="distance">${hospital.distance} mi</div>
                        <div class="distance-unit">away</div>
                    </div>
                </div>

                <div class="hospital-details">
                    <div class="hospital-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${hospital.address}</span>
                    </div>
                    <div class="hospital-detail">
                        <i class="fas fa-phone"></i>
                        <span>${hospital.phone}</span>
                    </div>
                    <div class="hospital-detail">
                        <i class="fas fa-stethoscope"></i>
                        <span>${specialties}</span>
                    </div>
                    <div class="hospital-detail">
                        <i class="fas fa-hospital"></i>
                        <span>${facilities}</span>
                    </div>
                </div>

                <div class="hospital-rating">
                    <div class="stars">${stars}</div>
                    <span class="rating-text">${hospital.rating} (${Math.floor(Math.random() * 100) + 50} reviews)</span>
                </div>

                <div class="hospital-actions">
                    <button class="btn-call" onclick="emergencyManager.callHospital('${hospital.phone}')">
                        <i class="fas fa-phone"></i>
                        Call
                    </button>
                    <button class="btn-directions" onclick="emergencyManager.getDirections(${hospital.coordinates.lat}, ${hospital.coordinates.lng})">
                        <i class="fas fa-directions"></i>
                        Directions
                    </button>
                    <button class="btn-details" onclick="emergencyManager.showHospitalDetails(${hospital.id})">
                        <i class="fas fa-info-circle"></i>
                        Details
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

    callEmergency() {
        const emergencyNumber = '911';
        this.showEmergencyModal('Emergency Call', `Calling emergency services at ${emergencyNumber}...`, () => {
            window.open(`tel:${emergencyNumber}`, '_self');
        });
    }

    requestAmbulance() {
        this.showEmergencyModal('Ambulance Request', 'Requesting ambulance to your location...', () => {
            this.showNotification('Ambulance requested! Help is on the way.', 'success');
            // Here you would integrate with ambulance service API
        });
    }

    callHospital(phoneNumber) {
        window.open(`tel:${phoneNumber}`, '_self');
    }

    getDirections(lat, lng) {
        if (this.userLocation) {
            const url = `https://www.google.com/maps/dir/${this.userLocation.lat},${this.userLocation.lng}/${lat},${lng}`;
            window.open(url, '_blank');
        } else {
            this.showNotification('Unable to get directions without location access.', 'info');
        }
    }

    showHospitalDetails(hospitalId) {
        const hospital = this.hospitals.find(h => h.id === hospitalId);
        if (!hospital) return;

        const detailsModal = document.createElement('div');
        detailsModal.className = 'modal';
        detailsModal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Hospital Details</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; margin: 0 auto 1rem;">
                            <i class="fas fa-hospital"></i>
                        </div>
                        <h2 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">${hospital.name}</h2>
                        <p style="color: var(--accent-primary); font-size: 1.1rem; margin: 0 0 1rem 0;">${hospital.type}</p>
                        <div class="hospital-rating" style="justify-content: center;">
                            <div class="stars">${this.generateStars(hospital.rating)}</div>
                            <span class="rating-text">${hospital.rating} rating</span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                        <div class="hospital-detail">
                            <i class="fas fa-map-marker-alt"></i>
                            <span><strong>Address:</strong> ${hospital.address}</span>
                        </div>
                        <div class="hospital-detail">
                            <i class="fas fa-phone"></i>
                            <span><strong>Phone:</strong> ${hospital.phone}</span>
                        </div>
                        <div class="hospital-detail">
                            <i class="fas fa-route"></i>
                            <span><strong>Distance:</strong> ${hospital.distance} miles</span>
                        </div>
                        <div class="hospital-detail">
                            <i class="fas fa-clock"></i>
                            <span><strong>Emergency:</strong> ${hospital.emergencyServices ? '24/7 Available' : 'Limited Hours'}</span>
                        </div>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Specialties</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${hospital.specialties.map(specialty => `<span style="background: var(--bg-secondary); padding: 0.25rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.9rem; color: var(--text-secondary);">${specialty}</span>`).join('')}
                        </div>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Facilities</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${hospital.facilities.map(facility => `<span style="background: var(--bg-secondary); padding: 0.25rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.9rem; color: var(--text-secondary);">${facility}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-outline" onclick="this.closest('.modal').remove()">Close</button>
                    <button class="btn-directions" onclick="emergencyManager.getDirections(${hospital.coordinates.lat}, ${hospital.coordinates.lng}); this.closest('.modal').remove();">
                        <i class="fas fa-directions"></i>
                        Get Directions
                    </button>
                    <button class="btn-call" onclick="emergencyManager.callHospital('${hospital.phone}'); this.closest('.modal').remove();">
                        <i class="fas fa-phone"></i>
                        Call Hospital
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(detailsModal);
        detailsModal.style.display = 'flex';
    }

    showEmergencyModal(title, message, actionCallback) {
        const emergencyModal = document.createElement('div');
        emergencyModal.className = 'modal emergency-modal';
        emergencyModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> ${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="font-size: 1.1rem; text-align: center; margin: 2rem 0;">${message}</p>
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: var(--radius-md); margin: 1rem 0;">
                        <p style="margin: 0; font-size: 0.9rem; color: rgba(255, 255, 255, 0.8);">
                            <strong>⚠️ Emergency Notice:</strong> This is a simulated emergency service. In a real emergency, please call your local emergency number immediately.
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-outline" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn-primary" onclick="this.closest('.modal').remove(); if(typeof arguments[0] === 'function') arguments[0]();">
                        <i class="fas fa-check"></i>
                        Confirm
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(emergencyModal);
        emergencyModal.style.display = 'flex';
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

    // Enhanced Professional Features
    initializeProfessionalFeatures() {
        this.setupSmoothScrolling();
        this.setupIntersectionObserver();
        this.setupKeyboardShortcuts();
        this.setupAutoSave();
        this.setupPerformanceMonitoring();
        this.setupAccessibilityFeatures();
        this.setupParticleSystem();
        this.setupAdvancedAnimations();
        this.initializeAdvancedAIAssistant();
    }

    initializeAdvancedAIAssistant() {
        this.setupAdvancedChatFeatures();
        this.setupSmartSuggestions();
        this.setupVoiceSynthesis();
        this.setupMedicalContext();
        this.setupTypingIndicators();
        this.setupMessageFormatting();
        this.setupQuickReplies();
        this.setupConversationHistory();
        this.setupHealthDataIntegration();
    }

    setupAdvancedChatFeatures() {
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-message');
        const voiceButton = document.getElementById('voice-input');
        const attachButton = document.getElementById('attach-reports');

        if (chatInput && sendButton) {
            // Enhanced input handling
            chatInput.addEventListener('input', (e) => {
                this.handleSmartInput(e.target.value);
            });

            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage(chatInput.value.trim());
                    chatInput.value = '';
                }
            });

            sendButton.addEventListener('click', () => {
                const message = chatInput.value.trim();
                if (message) {
                    this.sendMessage(message);
                    chatInput.value = '';
                }
            });
        }

        if (voiceButton) {
            voiceButton.addEventListener('click', () => {
                this.toggleVoiceInput();
            });
        }

        if (attachButton) {
            attachButton.addEventListener('click', () => {
                this.toggleFileUpload();
            });
        }
    }

    setupSmartSuggestions() {
        this.smartSuggestions = [
            "I have a headache",
            "I'm feeling dizzy",
            "I have chest pain",
            "I need to find a doctor",
            "What are my symptoms indicating?",
            "I need emergency help",
            "Schedule an appointment",
            "Check my medical records",
            "Find nearby pharmacies",
            "Health tips for today"
        ];

        this.currentSuggestions = [];
        this.setupSuggestionUI();
    }

    setupSuggestionUI() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;

        // Create suggestions container
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'smart-suggestions';
        suggestionsContainer.className = 'smart-suggestions';
        suggestionsContainer.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 0;
            right: 0;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            max-height: 200px;
            overflow-y: auto;
            display: none;
            z-index: 1000;
            box-shadow: var(--shadow-xl);
        `;

        const inputContainer = chatInput.parentElement;
        inputContainer.style.position = 'relative';
        inputContainer.appendChild(suggestionsContainer);

        chatInput.addEventListener('focus', () => {
            this.showSmartSuggestions();
        });

        chatInput.addEventListener('input', () => {
            this.updateSmartSuggestions(chatInput.value);
        });

        chatInput.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionsContainer.style.display = 'none';
            }, 200);
        });
    }

    showSmartSuggestions() {
        const suggestionsContainer = document.getElementById('smart-suggestions');
        if (!suggestionsContainer) return;

        suggestionsContainer.innerHTML = '';
        this.currentSuggestions = this.smartSuggestions.slice(0, 5);

        this.currentSuggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion-item';
            suggestionElement.textContent = suggestion;
            suggestionElement.style.cssText = `
                padding: var(--spacing-md);
                cursor: pointer;
                border-bottom: 1px solid var(--glass-border);
                transition: var(--transition);
                hover: background: rgba(14, 165, 233, 0.1);
            `;

            suggestionElement.addEventListener('click', () => {
                document.getElementById('chat-input').value = suggestion;
                suggestionsContainer.style.display = 'none';
                this.sendMessage(suggestion);
                document.getElementById('chat-input').value = '';
            });

            suggestionElement.addEventListener('mouseenter', () => {
                suggestionElement.style.background = 'rgba(14, 165, 233, 0.1)';
            });

            suggestionElement.addEventListener('mouseleave', () => {
                suggestionElement.style.background = 'transparent';
            });

            suggestionsContainer.appendChild(suggestionElement);
        });

        suggestionsContainer.style.display = 'block';
    }

    updateSmartSuggestions(query) {
        if (!query.trim()) {
            this.showSmartSuggestions();
            return;
        }

        const filtered = this.smartSuggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(query.toLowerCase())
        );

        const suggestionsContainer = document.getElementById('smart-suggestions');
        if (!suggestionsContainer) return;

        suggestionsContainer.innerHTML = '';

        filtered.slice(0, 5).forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion-item';
            suggestionElement.innerHTML = this.highlightMatch(suggestion, query);
            suggestionElement.style.cssText = `
                padding: var(--spacing-md);
                cursor: pointer;
                border-bottom: 1px solid var(--glass-border);
                transition: var(--transition);
            `;

            suggestionElement.addEventListener('click', () => {
                document.getElementById('chat-input').value = suggestion;
                suggestionsContainer.style.display = 'none';
                this.sendMessage(suggestion);
                document.getElementById('chat-input').value = '';
            });

            suggestionsContainer.appendChild(suggestionElement);
        });
    }

    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    setupVoiceSynthesis() {
        this.voiceSettings = {
            rate: 1,
            pitch: 1,
            volume: 0.8,
            voice: null
        };

        if ('speechSynthesis' in window) {
            speechSynthesis.onvoiceschanged = () => {
                this.voices = speechSynthesis.getVoices();
                this.voiceSettings.voice = this.voices.find(voice =>
                    voice.lang.startsWith('en') && voice.name.includes('Female')
                ) || this.voices[0];
            };
        }
    }

    setupMedicalContext() {
        this.medicalContext = {
            userProfile: {
                age: null,
                gender: null,
                medicalHistory: [],
                allergies: [],
                medications: [],
                chronicConditions: []
            },
            currentSymptoms: [],
            recentInteractions: [],
            emergencyKeywords: [
                'chest pain', 'difficulty breathing', 'severe headache',
                'unconscious', 'heart attack', 'stroke', 'bleeding',
                'emergency', 'urgent', 'critical'
            ]
        };
    }

    setupTypingIndicators() {
        this.typingTimeouts = new Map();
    }

    setupMessageFormatting() {
        this.messageFormatter = {
            formatLinks: (text) => {
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
            },

            formatMedicalTerms: (text) => {
                const medicalTerms = {
                    'headache': '🤕 Headache',
                    'fever': '🌡️ Fever',
                    'cough': '🤧 Cough',
                    'pain': '😣 Pain',
                    'nausea': '🤢 Nausea',
                    'dizziness': '😵 Dizziness'
                };

                Object.keys(medicalTerms).forEach(term => {
                    const regex = new RegExp(`\\b${term}\\b`, 'gi');
                    text = text.replace(regex, medicalTerms[term]);
                });

                return text;
            },

            formatCode: (text) => {
                return text.replace(/`([^`]+)`/g, '<code>$1</code>');
            }
        };
    }

    setupQuickReplies() {
        this.quickReplies = {
            greeting: [
                "Hello! How can I help you today?",
                "Hi there! What symptoms are you experiencing?",
                "Welcome! How are you feeling?"
            ],
            followUp: [
                "Can you describe the pain on a scale of 1-10?",
                "How long have you been experiencing these symptoms?",
                "Have you noticed any other symptoms?",
                "Are you taking any medications?"
            ],
            emergency: [
                "This sounds serious. Please call emergency services immediately!",
                "Don't wait - seek immediate medical attention!",
                "This requires urgent medical care. Call 911 now!"
            ]
        };
    }

    setupConversationHistory() {
        this.conversationHistory = JSON.parse(localStorage.getItem('medibot-chat-history') || '[]');
        this.maxHistoryLength = 50;
    }

    setupHealthDataIntegration() {
        this.healthData = {
            vitals: {},
            symptoms: [],
            medications: [],
            appointments: [],
            reports: []
        };
    }

    handleSmartInput(value) {
        // Smart input processing
        if (value.length > 0) {
            this.checkForEmergencyKeywords(value);
            this.updateSuggestionsBasedOnInput(value);
        }
    }

    checkForEmergencyKeywords(message) {
        const lowerMessage = message.toLowerCase();
        const hasEmergencyKeyword = this.medicalContext.emergencyKeywords.some(keyword =>
            lowerMessage.includes(keyword)
        );

        if (hasEmergencyKeyword) {
            this.showEmergencyAlert();
        }
    }

    showEmergencyAlert() {
        const alert = document.createElement('div');
        alert.className = 'emergency-alert';
        alert.innerHTML = `
            <div class="emergency-alert-content">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <h4>Emergency Detected</h4>
                    <p>Your message contains emergency keywords. If this is a real emergency, please call emergency services immediately.</p>
                </div>
                <button class="emergency-call-btn" onclick="window.open('tel:911')">
                    <i class="fas fa-phone"></i>
                    Call 911
                </button>
            </div>
        `;

        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff4757, #ff3838);
            color: white;
            padding: var(--spacing-lg);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-2xl);
            z-index: 10000;
            max-width: 400px;
            animation: slideInFromRight 0.5s ease-out;
        `;

        document.body.appendChild(alert);

        setTimeout(() => {
            alert.style.animation = 'slideOutToRight 0.5s ease-in forwards';
            setTimeout(() => alert.remove(), 500);
        }, 10000);
    }

    updateSuggestionsBasedOnInput(input) {
        // Dynamic suggestions based on user input
        const suggestions = [];

        if (input.toLowerCase().includes('pain')) {
            suggestions.push("Can you describe the pain?", "Where is the pain located?", "How severe is the pain?");
        }

        if (input.toLowerCase().includes('fever')) {
            suggestions.push("What's your temperature?", "How long have you had the fever?", "Any other symptoms with the fever?");
        }

        if (input.toLowerCase().includes('doctor')) {
            suggestions.push("What type of doctor do you need?", "When would you like to see a doctor?", "Do you have a preferred location?");
        }

        this.currentSuggestions = suggestions;
    }

    async sendMessage(message) {
        if (!message.trim()) return;

        // Prevent accidental duplicate submissions within 750ms
        const now = Date.now();
        if (this._lastSend && this._lastSend.text === message && (now - this._lastSend.time) < 750) {
            return;
        }
        this._lastSend = { text: message, time: now };

        // Add user message
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        // Process message and get response
        const response = await this.processMessage(message);

        // Hide typing indicator
        this.hideTypingIndicator();

        // Add AI response
        setTimeout(() => {
            this.addMessage(response, 'ai');
        }, 500);

        // Save to history
        this.saveToHistory(message, response);
    }

    async processMessage(message) {
        const lowerMessage = message.toLowerCase();

        // Emergency detection
        if (this.medicalContext.emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return this.getEmergencyResponse(message);
        }

        // Symptom analysis
        if (this.containsSymptoms(message)) {
            return this.getSymptomAnalysis(message);
        }

        // Health data queries
        if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
            return this.getAppointmentResponse(message);
        }

        if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
            return this.getMedicationResponse(message);
        }

        if (lowerMessage.includes('record') || lowerMessage.includes('history')) {
            return this.getRecordsResponse(message);
        }

        // General health queries
        if (lowerMessage.includes('diet') || lowerMessage.includes('exercise') || lowerMessage.includes('healthy')) {
            return this.getHealthTipsResponse(message);
        }

        // Default response
        return this.getGeneralResponse(message);
    }

    containsSymptoms(message) {
        const symptomKeywords = [
            'pain', 'headache', 'fever', 'cough', 'nausea', 'dizzy', 'tired',
            'sore', 'ache', 'hurt', 'sick', 'ill', 'symptom', 'feeling'
        ];

        return symptomKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }

    getSymptomAnalysis(message) {
        const responses = {
            headache: "Headaches can have many causes. Common triggers include stress, dehydration, lack of sleep, or eye strain. If your headache is severe, persistent, or accompanied by other symptoms like vision changes or nausea, please consult a healthcare provider.",
            fever: "A fever is your body's natural response to infection. Monitor your temperature and stay hydrated. If your fever exceeds 103°F (39.4°C), lasts more than 3 days, or is accompanied by severe symptoms, seek medical attention.",
            cough: "Coughs can be caused by infections, allergies, or irritants. Stay hydrated, use a humidifier, and consider over-the-counter remedies. If your cough persists for more than a week or is accompanied by chest pain, seek medical advice.",
            nausea: "Nausea can be caused by various factors including infections, medications, or digestive issues. Stay hydrated with small sips of clear fluids. If nausea persists or is accompanied by vomiting blood, severe pain, or dehydration, consult a doctor.",
            dizziness: "Dizziness can have many causes including dehydration, low blood pressure, or inner ear issues. Sit or lie down immediately. If dizziness is accompanied by chest pain, shortness of breath, or severe headache, seek emergency care."
        };

        const lowerMessage = message.toLowerCase();
        for (const [symptom, response] of Object.entries(responses)) {
            if (lowerMessage.includes(symptom)) {
                return response;
            }
        }

        return "I understand you're experiencing some symptoms. Can you provide more details about what you're feeling? This will help me give you more specific guidance.";
    }

    getEmergencyResponse(message) {
        return "🚨 EMERGENCY ALERT: Your message indicates a potential medical emergency. Please call emergency services (911) immediately or go to the nearest emergency room. Don't wait - get help right now! While waiting for help, stay calm and provide as much information as possible about your symptoms.";
    }

    getAppointmentResponse(message) {
        return "I'd be happy to help you schedule an appointment! Based on your symptoms and location, I can recommend appropriate healthcare providers. Would you like me to:\n\n• Find doctors in your area\n• Schedule an appointment\n• Provide telemedicine options\n• Help with urgent care facilities\n\nWhat type of medical care are you looking for?";
    }

    getMedicationResponse(message) {
        return "For medication-related questions, I can help you:\n\n• Find information about your current medications\n• Check for potential drug interactions\n• Locate nearby pharmacies\n• Get reminders for medication schedules\n• Find over-the-counter options for common symptoms\n\nWhat specific medication information do you need?";
    }

    getRecordsResponse(message) {
        return "I can help you access and manage your medical records:\n\n• View your medical history\n• Access lab results\n• Review past appointments\n• Download health reports\n• Share records with healthcare providers\n\nWhat specific records would you like to review?";
    }

    getHealthTipsResponse(message) {
        const tips = [
            "💧 Stay hydrated - aim for 8 glasses of water daily",
            "🏃‍♂️ Regular exercise (30 minutes most days) improves overall health",
            "🥗 Eat a balanced diet rich in fruits, vegetables, and whole grains",
            "😴 Get 7-9 hours of quality sleep each night",
            "🧘‍♀️ Practice stress management techniques like meditation",
            "🚭 Avoid smoking and limit alcohol consumption",
            "📱 Take regular breaks from screens to protect your eyes",
            "🦠 Wash hands frequently and maintain good hygiene"
        ];

        const randomTips = tips.sort(() => 0.5 - Math.random()).slice(0, 3);
        return "Here are some health tips:\n\n" + randomTips.join('\n\n') + "\n\nRemember, these are general suggestions. For personalized advice, consult with a healthcare professional.";
    }

    getGeneralResponse(message) {
        const responses = [
            "I'm here to help with your health questions. Can you tell me more about what you're experiencing?",
            "I can assist you with symptom analysis, finding healthcare providers, medication information, and general health advice. What would you like to know?",
            "Feel free to ask me about any health-related concerns. I'm here to provide guidance and connect you with appropriate resources.",
            "How can I help you with your health today? I can provide information on symptoms, treatments, and help you find the right healthcare services."
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    addMessage(content, type) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}-message animate-fade-up`;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageElement.innerHTML = `
            <div class="message-avatar">
                ${type === 'ai' ?
                '<canvas class="ai-avatar-small" width="32" height="32"></canvas>' :
                '<div class="user-avatar-small"><i class="fas fa-user"></i></div>'
            }
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    ${this.formatMessageContent(content)}
                </div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add quick replies for AI messages
        if (type === 'ai') {
            setTimeout(() => {
                this.addQuickReplies(messageElement);
            }, 1000);
        }
    }

    formatMessageContent(content) {
        let formatted = content;

        // Format links
        formatted = this.messageFormatter.formatLinks(formatted);

        // Format medical terms
        formatted = this.messageFormatter.formatMedicalTerms(formatted);

        // Format code
        formatted = this.messageFormatter.formatCode(formatted);

        // Convert line breaks to HTML
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    addQuickReplies(messageElement) {
        const quickReplies = this.generateQuickReplies();
        if (quickReplies.length === 0) return;

        const repliesContainer = document.createElement('div');
        repliesContainer.className = 'quick-replies';

        quickReplies.forEach(reply => {
            const replyButton = document.createElement('button');
            replyButton.className = 'quick-reply-btn';
            replyButton.textContent = reply;
            replyButton.addEventListener('click', () => {
                this.sendMessage(reply);
            });
            repliesContainer.appendChild(replyButton);
        });

        messageElement.querySelector('.message-content').appendChild(repliesContainer);
    }

    generateQuickReplies() {
        const replies = [
            "Tell me more about my symptoms",
            "Find me a doctor",
            "Schedule an appointment",
            "Health tips",
            "Emergency contacts"
        ];

        return replies.sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const typingElement = document.createElement('div');
        typingElement.className = 'message ai-message typing-indicator';
        typingElement.id = 'typing-indicator';

        typingElement.innerHTML = `
            <div class="message-avatar">
                <canvas class="ai-avatar-small" width="32" height="32"></canvas>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    saveToHistory(userMessage, aiResponse) {
        const conversation = {
            timestamp: new Date().toISOString(),
            user: userMessage,
            ai: aiResponse
        };

        this.conversationHistory.push(conversation);

        // Keep only the last 50 conversations
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }

        localStorage.setItem('medibot-chat-history', JSON.stringify(this.conversationHistory));
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.initializeSpeechRecognition();
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();

            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = this.currentLanguage;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceButton(true);
                this.showVoiceFeedback('Listening...');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('chat-input').value = transcript;
                this.sendMessage(transcript);
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceButton(false);
                this.hideVoiceFeedback();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.updateVoiceButton(false);
                this.hideVoiceFeedback();
            };
        }
    }

    startListening() {
        if (this.recognition) {
            this.recognition.start();
        }
    }

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    updateVoiceButton(isListening) {
        const voiceButton = document.getElementById('voice-input');
        if (voiceButton) {
            voiceButton.className = isListening ? 'voice-btn listening' : 'voice-btn';
            voiceButton.innerHTML = `<i class="fas fa-${isListening ? 'stop' : 'microphone'}"></i>`;
        }
    }

    showVoiceFeedback(message) {
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
    }

    hideVoiceFeedback() {
        const feedback = document.getElementById('voice-feedback');
        if (feedback) {
            feedback.style.animation = 'fadeOut 0.3s ease-in forwards';
            setTimeout(() => feedback.remove(), 300);
        }
    }

    toggleFileUpload() {
        const fileUploadArea = document.getElementById('file-upload-area');
        if (fileUploadArea) {
            fileUploadArea.style.display = fileUploadArea.style.display === 'none' ? 'block' : 'none';
        }
    }

    speakResponse(text) {
        if ('speechSynthesis' in window && this.voiceSettings.voice) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = this.voiceSettings.rate;
            utterance.pitch = this.voiceSettings.pitch;
            utterance.volume = this.voiceSettings.volume;
            utterance.voice = this.voiceSettings.voice;

            speechSynthesis.speak(utterance);
        }
    }

    setupSmoothScrolling() {
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

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-up');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.stat-card, .doctor-card, .hospital-card').forEach(card => {
            observer.observe(card);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('#search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // Escape: Close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            }

            // Ctrl/Cmd + /: Show shortcuts help
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }
        });
    }

    setupAutoSave() {
        let autoSaveTimer;
        const autoSave = () => {
            const userData = {
                lastActivity: new Date().toISOString(),
                preferences: this.userPreferences,
                timestamp: Date.now()
            };
            localStorage.setItem('medibot_autosave', JSON.stringify(userData));
        };

        document.addEventListener('input', () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(autoSave, 1000);
        });

        // Auto-save on page unload
        window.addEventListener('beforeunload', autoSave);
    }

    setupPerformanceMonitoring() {
        if ('performance' in window && 'PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 100) {
                        console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
                    }
                });
            });
            observer.observe({ entryTypes: ['measure'] });
        }
    }

    setupAccessibilityFeatures() {
        // High contrast mode detection
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
        prefersHighContrast.addEventListener('change', (e) => {
            document.body.classList.toggle('high-contrast', e.matches);
        });

        // Reduced motion detection
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        prefersReducedMotion.addEventListener('change', (e) => {
            document.body.classList.toggle('reduced-motion', e.matches);
        });

        // Focus management
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupParticleSystem() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';

        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticle = (x, y) => {
            return {
                x: x || Math.random() * canvas.width,
                y: y || Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: `hsl(${Math.random() * 60 + 180}, 70%, 60%)`
            };
        };

        const updateParticles = () => {
            particles.forEach((particle, index) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.opacity -= 0.002;

                if (particle.opacity <= 0 ||
                    particle.x < 0 || particle.x > canvas.width ||
                    particle.y < 0 || particle.y > canvas.height) {
                    particles.splice(index, 1);
                }
            });

            // Add new particles occasionally
            if (Math.random() < 0.02 && particles.length < 50) {
                particles.push(createParticle());
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                ctx.save();
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        };

        const animate = () => {
            updateParticles();
            drawParticles();
            animationId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();

        // Mouse interaction
        document.addEventListener('mousemove', (e) => {
            if (Math.random() < 0.1) {
                particles.push(createParticle(e.clientX, e.clientY));
            }
        });
    }

    setupAdvancedAnimations() {
        // GSAP animations for enhanced user experience
        if (typeof gsap !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            // Animate cards on scroll
            gsap.utils.toArray('.stat-card, .doctor-card, .hospital-card').forEach(card => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    },
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.out'
                });
            });

            // Animate sidebar on load
            gsap.from('#sidebar', {
                x: -300,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });

            // Animate main content
            gsap.from('.main-content', {
                x: 50,
                opacity: 0,
                duration: 1,
                delay: 0.3,
                ease: 'power3.out'
            });
        }
    }

    showKeyboardShortcuts() {
        const shortcutsModal = document.createElement('div');
        shortcutsModal.className = 'modal';
        shortcutsModal.innerHTML = `
            <div class="modal-content professional-card">
                <div class="modal-header">
                    <h3 class="professional-heading">Keyboard Shortcuts</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="shortcuts-grid">
                        <div class="shortcut-item">
                            <kbd>Ctrl+K</kbd>
                            <span>Focus search bar</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Esc</kbd>
                            <span>Close modals</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl+/</kbd>
                            <span>Show this help</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Tab</kbd>
                            <span>Navigate with keyboard</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(shortcutsModal);
        shortcutsModal.style.display = 'flex';
    }
}

// Initialize emergency manager when DOM is loaded
let emergencyManager;
document.addEventListener('DOMContentLoaded', () => {
    emergencyManager = new EmergencyManager();
});



// Global test function for debugging
window.testModal = function() {
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

window.closeTestModal = function() {
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
