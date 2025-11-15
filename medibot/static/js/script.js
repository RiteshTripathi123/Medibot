class MedibotUI {
    constructor() {
        this.currentTheme = this.getInitialTheme();
        this.currentLanguage = localStorage.getItem('medibot-language') || 'en';
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.messages = [];
        this.charts = {};
        this.translations = this.loadTranslations();

        this.init();
    }

    loadTranslations() {
        return {
            en: {
                title: "Medibot",
                placeholder: "Type your symptoms or questions...",
                welcome: {
                    title: "Welcome to Medibot",
                    content: "Hello! I'm your AI Medical Assistant. I can help you with symptom analysis, general health advice, and medical information.",
                    interaction: {
                        title: "How to Interact",
                        content: "• Type your symptoms or health questions<br>• Use the microphone button for voice input<br>• Check your health dashboard below<br>• I can provide guidance on common health issues"
                    }
                },
                avatarStatus: "AI Doctor Ready",
                dashboard: "Health Dashboard",
                bmiTitle: "BMI: 23.2 (Normal)",
                heartRateTitle: "Heart Rate Monitoring",
                symptomHistoryTitle: "Symptom History",
                disclaimer: "This is not a substitute for professional medical advice. Please consult a healthcare provider for serious concerns.",
                symptoms: {
                    headache: {
                        analysis: "Symptom Analysis: Headache",
                        content: "Based on your symptoms, you may be experiencing a tension headache. Common causes include stress, dehydration, or eye strain.",
                        advice: "Recommended Actions",
                        treatment: "• Stay hydrated - drink plenty of water<br>• Rest in a dark, quiet room<br>• Apply a cold or warm compress<br>• Practice relaxation techniques"
                    },
                    fever: {
                        analysis: "Symptom Analysis: Fever",
                        content: "Fever is your body's natural response to fighting infection. Monitor your temperature regularly.",
                        treatment: "Treatment Options",
                        advice: "• Take acetaminophen or ibuprofen as directed<br>• Rest and stay hydrated<br>• Use cooling measures if temperature is high<br>• Seek medical attention if fever exceeds 103°F"
                    },
                    cough: {
                        analysis: "Respiratory Symptoms",
                        content: "Cough and sore throat are common symptoms that can indicate various conditions from allergies to infections.",
                        remedies: "Natural Remedies",
                        advice: "• Drink warm liquids (tea, broth, warm water with honey)<br>• Gargle with salt water<br>• Use a humidifier<br>• Rest your voice and get plenty of sleep"
                    }
                }
            },
            hi: {
                title: "मेडिबॉट",
                placeholder: "अपने लक्षण या सवाल लिखें...",
                welcome: {
                    title: "मेडिबॉट में आपका स्वागत है",
                    content: "नमस्ते! मैं आपका AI मेडिकल असिस्टेंट हूँ। मैं लक्षण विश्लेषण, सामान्य स्वास्थ्य सलाह और चिकित्सा जानकारी में आपकी मदद कर सकता हूँ।",
                    interaction: {
                        title: "कैसे बातचीत करें",
                        content: "• अपने लक्षण या स्वास्थ्य प्रश्न टाइप करें<br>• वॉयस इनपुट के लिए माइक्रोफोन बटन का उपयोग करें<br>• नीचे अपना स्वास्थ्य डैशबोर्ड देखें<br>• मैं सामान्य स्वास्थ्य मुद्दों पर मार्गदर्शन प्रदान कर सकता हूँ"
                    }
                },
                avatarStatus: "AI डॉक्टर तैयार है",
                dashboard: "स्वास्थ्य डैशबोर्ड",
                bmiTitle: "BMI: 23.2 (सामान्य)",
                heartRateTitle: "हृदय गति निगरानी",
                symptomHistoryTitle: "लक्षण इतिहास",
                disclaimer: "यह पेशेवर चिकित्सा सलाह का विकल्प नहीं है। गंभीर चिंताओं के लिए कृपया स्वास्थ्य सेवा प्रदाता से सलाह लें।",
                symptoms: {
                    headache: {
                        analysis: "लक्षण विश्लेषण: सिरदर्द",
                        content: "आपके लक्षणों के आधार पर, आप तनाव सिरदर्द का अनुभव कर सकते हैं। सामान्य कारणों में तनाव, निर्जलीकरण, या आंखों पर दबाव शामिल है।",
                        advice: "सुझाए गए उपाय",
                        treatment: "• हाइड्रेटेड रहें - खूब पानी पिएं<br>• अंधेरे, शांत कमरे में आराम करें<br>• ठंडा या गर्म सेक लगाएं<br>• विश्राम तकनीकों का अभ्यास करें"
                    },
                    fever: {
                        analysis: "लक्षण विश्लेषण: बुखार",
                        content: "बुखार संक्रमण से लड़ने की आपके शरीर की प्राकृतिक प्रतिक्रिया है। नियमित रूप से अपना तापमान मॉनिटर करें।",
                        treatment: "उपचार विकल्प",
                        advice: "• निर्देशानुसार पैरासिटामोल या इबुप्रोफेन लें<br>• आराम करें और हाइड्रेटेड रहें<br>• तापमान अधिक होने पर ठंडक के उपाय करें<br>• बुखार 103°F से अधिक होने पर चिकित्सा सहायता लें"
                    },
                    cough: {
                        analysis: "श्वसन संबंधी लक्षण",
                        content: "खांसी और गले में खराश सामान्य लक्षण हैं जो एलर्जी से संक्रमण तक विभिन्न स्थितियों का संकेत दे सकते हैं।",
                        remedies: "प्राकृतिक उपचार",
                        advice: "• गर्म तरल पदार्थ पिएं (चाय, शोरबा, शहद के साथ गर्म पानी)<br>• नमक के पानी से गरारे करें<br>• ह्यूमिडिफायर का उपयोग करें<br>• आवाज को आराम दें और पर्याप्त नींद लें"
                    }
                }
            },
            es: {
                title: "Medibot",
                placeholder: "Escriba sus síntomas o preguntas...",
                welcome: {
                    title: "Bienvenido a Medibot",
                    content: "¡Hola! Soy tu Asistente Médico IA. Puedo ayudarte con análisis de síntomas, consejos generales de salud e información médica.",
                    interaction: {
                        title: "Cómo Interactuar",
                        content: "• Escriba sus síntomas o preguntas de salud<br>• Use el botón del micrófono para entrada de voz<br>• Revise su panel de salud abajo<br>• Puedo proporcionar orientación sobre problemas comunes de salud"
                    }
                },
                avatarStatus: "Doctor IA Listo",
                dashboard: "Panel de Salud",
                bmiTitle: "IMC: 23.2 (Normal)",
                heartRateTitle: "Monitoreo de Ritmo Cardíaco",
                symptomHistoryTitle: "Historial de Síntomas",
                disclaimer: "Esto no es un sustituto del consejo médico profesional. Consulte a un proveedor de atención médica para preocupaciones serias.",
                symptoms: {
                    headache: {
                        analysis: "Análisis de Síntomas: Dolor de Cabeza",
                        content: "Basado en sus síntomas, puede estar experimentando un dolor de cabeza tensional. Las causas comunes incluyen estrés, deshidratación o fatiga visual.",
                        advice: "Acciones Recomendadas",
                        treatment: "• Manténgase hidratado - beba mucha agua<br>• Descanse en una habitación oscura y silenciosa<br>• Aplique una compresa fría o caliente<br>• Practique técnicas de relajación"
                    },
                    fever: {
                        analysis: "Análisis de Síntomas: Fiebre",
                        content: "La fiebre es la respuesta natural de su cuerpo para combatir infecciones. Monitoree su temperatura regularmente.",
                        treatment: "Opciones de Tratamiento",
                        advice: "• Tome acetaminofén o ibuprofeno según las indicaciones<br>• Descanse y manténgase hidratado<br>• Use medidas de enfriamiento si la temperatura es alta<br>• Busque atención médica si la fiebre supera los 103°F"
                    },
                    cough: {
                        analysis: "Síntomas Respiratorios",
                        content: "La tos y el dolor de garganta son síntomas comunes que pueden indicar varias condiciones desde alergias hasta infecciones.",
                        remedies: "Remedios Naturales",
                        advice: "• Beba líquidos calientes (té, caldo, agua caliente con miel)<br>• Haga gárgaras con agua salada<br>• Use un humidificador<br>• Descanse su voz y duerma lo suficiente"
                    }
                }
            },
            fr: {
                title: "Medibot",
                placeholder: "Tapez vos symptômes ou questions...",
                welcome: {
                    title: "Bienvenue chez Medibot",
                    content: "Bonjour! Je suis votre Assistant Médical IA. Je peux vous aider avec l'analyse des symptômes, les conseils généraux de santé et les informations médicales.",
                    interaction: {
                        title: "Comment Interagir",
                        content: "• Tapez vos symptômes ou questions de santé<br>• Utilisez le bouton microphone pour la saisie vocale<br>• Vérifiez votre tableau de bord santé ci-dessous<br>• Je peux fournir des conseils sur les problèmes de santé courants"
                    }
                },
                avatarStatus: "Docteur IA Prêt",
                dashboard: "Tableau de Bord Santé",
                bmiTitle: "IMC: 23.2 (Normal)",
                heartRateTitle: "Surveillance du Rythme Cardiaque",
                symptomHistoryTitle: "Historique des Symptômes",
                disclaimer: "Ceci n'est pas un substitut aux conseils médicaux professionnels. Veuillez consulter un professionnel de santé pour les préoccupations sérieuses.",
                symptoms: {
                    headache: {
                        analysis: "Analyse des Symptômes: Mal de Tête",
                        content: "Basé sur vos symptômes, vous pourriez ressentir un mal de tête de tension. Les causes communes incluent le stress, la déshydratation ou la fatigue oculaire.",
                        advice: "Actions Recommandées",
                        treatment: "• Restez hydraté - buvez beaucoup d'eau<br>• Reposez-vous dans une pièce sombre et silencieuse<br>• Appliquez une compresse froide ou chaude<br>• Pratiquez des techniques de relaxation"
                    },
                    fever: {
                        analysis: "Analyse des Symptômes: Fièvre",
                        content: "La fièvre est la réponse naturelle de votre corps pour combattre l'infection. Surveillez votre température régulièrement.",
                        treatment: "Options de Traitement",
                        advice: "• Prenez de l'acétaminophène ou de l'ibuprofène selon les instructions<br>• Reposez-vous et restez hydraté<br>• Utilisez des mesures de refroidissement si la température est élevée<br>• Consultez un médecin si la fièvre dépasse 103°F"
                    },
                    cough: {
                        analysis: "Symptômes Respiratoires",
                        content: "La toux et le mal de gorge sont des symptômes courants qui peuvent indiquer diverses conditions des allergies aux infections.",
                        remedies: "Remèdes Naturels",
                        advice: "• Buvez des liquides chauds (thé, bouillon, eau chaude avec miel)<br>• Gargarisez-vous avec de l'eau salée<br>• Utilisez un humidificateur<br>• Reposez votre voix et dormez suffisamment"
                    }
                }
            },
            de: {
                title: "Medibot",
                placeholder: "Geben Sie Ihre Symptome oder Fragen ein...",
                welcome: {
                    title: "Willkommen bei Medibot",
                    content: "Hallo! Ich bin Ihr KI-Medizinischer Assistent. Ich kann Ihnen bei der Symptomanalyse, allgemeinen Gesundheitsberatung und medizinischen Informationen helfen.",
                    interaction: {
                        title: "Wie Interagieren",
                        content: "• Geben Sie Ihre Symptome oder Gesundheitsfragen ein<br>• Verwenden Sie die Mikrofon-Taste für Spracheingabe<br>• Überprüfen Sie Ihr Gesundheits-Dashboard unten<br>• Ich kann Anleitung bei häufigen Gesundheitsproblemen geben"
                    }
                },
                avatarStatus: "KI-Arzt Bereit",
                dashboard: "Gesundheits-Dashboard",
                bmiTitle: "BMI: 23.2 (Normal)",
                heartRateTitle: "Herzfrequenz-Überwachung",
                symptomHistoryTitle: "Symptom-Historie",
                disclaimer: "Dies ist kein Ersatz für professionelle medizinische Beratung. Bitte konsultieren Sie einen Arzt bei ernsthaften Beschwerden.",
                symptoms: {
                    headache: {
                        analysis: "Symptom-Analyse: Kopfschmerzen",
                        content: "Basierend auf Ihren Symptomen könnten Sie Spannungskopfschmerzen haben. Häufige Ursachen sind Stress, Dehydrierung oder Augenbelastung.",
                        advice: "Empfohlene Maßnahmen",
                        treatment: "• Bleiben Sie hydratisiert - trinken Sie viel Wasser<br>• Ruhen Sie sich in einem dunklen, ruhigen Raum aus<br>• Wenden Sie eine kalte oder warme Kompresse an<br>• Üben Sie Entspannungstechniken"
                    },
                    fever: {
                        analysis: "Symptom-Analyse: Fieber",
                        content: "Fieber ist die natürliche Reaktion Ihres Körpers zur Bekämpfung von Infektionen. Überwachen Sie Ihre Temperatur regelmäßig.",
                        treatment: "Behandlungsoptionen",
                        advice: "• Nehmen Sie Paracetamol oder Ibuprofen wie angewiesen<br>• Ruhen Sie sich aus und bleiben Sie hydratisiert<br>• Verwenden Sie Kühlmaßnahmen bei hoher Temperatur<br>• Suchen Sie medizinische Hilfe, wenn das Fieber 39°C übersteigt"
                    },
                    cough: {
                        analysis: "Atemwegs-Symptome",
                        content: "Husten und Halsschmerzen sind häufige Symptome, die verschiedene Zustände von Allergien bis Infektionen anzeigen können.",
                        remedies: "Natürliche Heilmittel",
                        advice: "• Trinken Sie warme Flüssigkeiten (Tee, Brühe, warmes Wasser mit Honig)<br>• Gurgeln Sie mit Salzwasser<br>• Verwenden Sie einen Luftbefeuchter<br>• Schonen Sie Ihre Stimme und schlafen Sie ausreichend"
                    }
                }
            },
            zh: {
                title: "医疗机器人",
                placeholder: "输入您的症状或问题...",
                welcome: {
                    title: "欢迎使用医疗机器人",
                    content: "您好！我是您的AI医疗助手。我可以帮助您进行症状分析、一般健康建议和医疗信息咨询。",
                    interaction: {
                        title: "如何互动",
                        content: "• 输入您的症状或健康问题<br>• 使用麦克风按钮进行语音输入<br>• 查看下方的健康仪表板<br>• 我可以为常见健康问题提供指导"
                    }
                },
                avatarStatus: "AI医生已就绪",
                dashboard: "健康仪表板",
                bmiTitle: "体重指数: 23.2 (正常)",
                heartRateTitle: "心率监测",
                symptomHistoryTitle: "症状历史",
                disclaimer: "这不能替代专业医疗建议。如有严重疑虑，请咨询医疗保健提供者。",
                symptoms: {
                    headache: {
                        analysis: "症状分析：头痛",
                        content: "根据您的症状，您可能正在经历紧张性头痛。常见原因包括压力、脱水或眼部疲劳。",
                        advice: "建议措施",
                        treatment: "• 保持水分充足 - 多喝水<br>• 在黑暗、安静的房间休息<br>• 使用冷敷或热敷<br>• 练习放松技巧"
                    },
                    fever: {
                        analysis: "症状分析：发烧",
                        content: "发烧是您身体对抗感染的自然反应。请定期监测体温。",
                        treatment: "治疗选择",
                        advice: "• 按指示服用对乙酰氨基酚或布洛芬<br>• 休息并保持水分充足<br>• 如体温较高，使用降温措施<br>• 如发烧超过39°C，请就医"
                    },
                    cough: {
                        analysis: "呼吸系统症状",
                        content: "咳嗽和喉咙痛是常见症状，可能表明从过敏到感染的各种疾病。",
                        remedies: "自然疗法",
                        advice: "• 喝温热液体（茶、肉汤、蜂蜜温水）<br>• 用盐水漱口<br>• 使用加湿器<br>• 让声音休息并充足睡眠"
                    }
                }
            },
            ar: {
                title: "ميديبوت",
                placeholder: "اكتب أعراضك أو أسئلتك...",
                welcome: {
                    title: "مرحباً بك في ميديبوت",
                    content: "مرحباً! أنا مساعدك الطبي بالذكاء الاصطناعي. يمكنني مساعدتك في تحليل الأعراض، النصائح الصحية العامة والمعلومات الطبية.",
                    interaction: {
                        title: "كيفية التفاعل",
                        content: "• اكتب أعراضك أو أسئلتك الصحية<br>• استخدم زر الميكروفون للإدخال الصوتي<br>• تحقق من لوحة القيادة الصحية أدناه<br>• يمكنني تقديم الإرشادات حول المشاكل الصحية الشائعة"
                    }
                },
                avatarStatus: "الطبيب الذكي جاهز",
                dashboard: "لوحة القيادة الصحية",
                bmiTitle: "مؤشر كتلة الجسم: 23.2 (طبيعي)",
                heartRateTitle: "مراقبة معدل ضربات القلب",
                symptomHistoryTitle: "تاريخ الأعراض",
                disclaimer: "هذا ليس بديلاً عن الاستشارة الطبية المتخصصة. يرجى استشارة مقدم الرعاية الصحية للمخاوف الجدية.",
                symptoms: {
                    headache: {
                        analysis: "تحليل الأعراض: صداع",
                        content: "بناءً على أعراضك، قد تكون تعاني من صداع التوتر. الأسباب الشائعة تشمل التوتر، الجفاف، أو إجهاد العين.",
                        advice: "الإجراءات الموصى بها",
                        treatment: "• حافظ على ترطيب الجسم - اشرب الكثير من الماء<br>• استرح في غرفة مظلمة وهادئة<br>• استخدم كمادة باردة أو دافئة<br>• مارس تقنيات الاسترخاء"
                    },
                    fever: {
                        analysis: "تحليل الأعراض: حمى",
                        content: "الحمى هي استجابة الجسم الطبيعية لمحاربة العدوى. راقب درجة حرارتك بانتظام.",
                        treatment: "خيارات العلاج",
                        advice: "• تناول الباراسيتامول أو الإيبوبروفين حسب التوجيهات<br>• استرح وحافظ على الترطيب<br>• استخدم إجراءات التبريد إذا كانت الحرارة عالية<br>• اطلب العناية الطبية إذا تجاوزت الحمى 39°م"
                    },
                    cough: {
                        analysis: "أعراض الجهاز التنفسي",
                        content: "السعال والتهاب الحلق أعراض شائعة يمكن أن تشير إلى حالات مختلفة من الحساسية إلى العدوى.",
                        remedies: "العلاجات الطبيعية",
                        advice: "• اشرب السوائل الدافئة (الشاي، المرق، الماء الدافئ بالعسل)<br>• تغرغر بالماء المالح<br>• استخدم جهاز ترطيب الهواء<br>• أرح صوتك واحصل على نوم كافٍ"
                    }
                }
            },
            ja: {
                title: "メディボット",
                placeholder: "症状や質問を入力してください...",
                welcome: {
                    title: "メディボットへようこそ",
                    content: "こんにちは！私はあなたのAI医療アシスタントです。症状分析、一般的な健康アドバイス、医療情報でお手伝いできます。",
                    interaction: {
                        title: "やり取りの方法",
                        content: "• 症状や健康に関する質問を入力してください<br>• 音声入力にはマイクボタンを使用してください<br>• 下の健康ダッシュボードをチェックしてください<br>• 一般的な健康問題についてガイダンスを提供できます"
                    }
                },
                avatarStatus: "AI医師準備完了",
                dashboard: "健康ダッシュボード",
                bmiTitle: "BMI: 23.2 (正常)",
                heartRateTitle: "心拍数モニタリング",
                symptomHistoryTitle: "症状履歴",
                disclaimer: "これは専門的な医療アドバイスの代替品ではありません。深刻な懸念については医療従事者にご相談ください。",
                symptoms: {
                    headache: {
                        analysis: "症状分析：頭痛",
                        content: "症状に基づいて、緊張型頭痛を経験している可能性があります。一般的な原因にはストレス、脱水、眼精疲労などがあります。",
                        advice: "推奨される対処法",
                        treatment: "• 水分を十分に摂取してください<br>• 暗くて静かな部屋で休んでください<br>• 冷たいまたは温かい湿布を適用してください<br>• リラクゼーション技法を実践してください"
                    },
                    fever: {
                        analysis: "症状分析：発熱",
                        content: "発熱は感染と戦う体の自然な反応です。定期的に体温を監視してください。",
                        treatment: "治療オプション",
                        advice: "• 指示に従ってアセトアミノフェンまたはイブプロフェンを服用してください<br>• 休息し、水分を摂取してください<br>• 体温が高い場合は冷却措置を使用してください<br>• 発熱が39°Cを超える場合は医療機関を受診してください"
                    },
                    cough: {
                        analysis: "呼吸器症状",
                        content: "咳と喉の痛みは、アレルギーから感染症まで様々な状態を示す一般的な症状です。",
                        remedies: "自然療法",
                        advice: "• 温かい液体を飲んでください（茶、スープ、蜂蜜入り温水）<br>• 塩水でうがいをしてください<br>• 加湿器を使用してください<br>• 声を休め、十分な睡眠を取ってください"
                    }
                }
            }
        };
    }

    getInitialTheme() {
        const hour = new Date().getHours();
        return (hour >= 6 && hour < 18) ? 'light' : 'dark';
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.createParticles();
        this.setup3DAvatar();
        this.setupSpeechRecognition();
        this.setupCharts();
        this.updateUITexts(); // Add this line
        this.addWelcomeMessage();
        this.startAvatarAnimation();
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('mode-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Language selection
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // Set initial language
        document.getElementById('language-select').value = this.currentLanguage;

        // Send message
        document.getElementById('send-btn').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key to send
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Voice button
        document.getElementById('voice-btn').addEventListener('click', () => {
            this.toggleVoiceRecognition();
        });

        // Auto theme change based on time
        setInterval(() => {
            const newTheme = this.getInitialTheme();
            if (newTheme !== this.currentTheme) {
                this.currentTheme = newTheme;
                this.setupTheme();
            }
        }, 60000); // Check every minute
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setupTheme();

        // Animate theme transition
        gsap.to(document.body, {
            duration: 0.5,
            ease: "power2.inOut"
        });
    }

    changeLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('medibot-language', language);
        this.updateUITexts();
        this.updateChartsLanguage();

        // Clear and re-add welcome message
        document.getElementById('messages').innerHTML = '';
        this.addWelcomeMessage();

        // Update speech recognition language
        this.setupSpeechRecognition();
    }

    getText(key) {
        const keys = key.split('.');
        let text = this.translations[this.currentLanguage];

        for (const k of keys) {
            text = text[k];
            if (!text) break;
        }

        return text || this.translations['en'][key] || key;
    }

    updateUITexts() {
        // Update input placeholder
        const input = document.getElementById('user-input');
        input.placeholder = this.getText('placeholder');

        // Update avatar interaction text
        document.getElementById('avatar-interaction').innerHTML =
            `<span class="loading-wave"></span> ${this.getText('avatarStatus')}`;

        // Update dashboard title
        const dashboardTitle = document.querySelector('#dashboard-section h2');
        if (dashboardTitle) {
            dashboardTitle.textContent = this.getText('dashboard');
        }
    }

    updateChartsLanguage() {
        // Update chart titles
        if (this.charts.bmi) {
            this.charts.bmi.options.plugins.title.text = this.getText('bmiTitle');
            this.charts.bmi.update();
        }

        if (this.charts.heartRate) {
            this.charts.heartRate.options.plugins.title.text = this.getText('heartRateTitle');
            this.charts.heartRate.update();
        }

        if (this.charts.symptoms) {
            this.charts.symptoms.options.plugins.title.text = this.getText('symptomHistoryTitle');
            this.charts.symptoms.update();
        }
    }

    createParticles() {
        const particlesContainer = document.getElementById('background-particles');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (3 + Math.random() * 6) + 's';
            particlesContainer.appendChild(particle);
        }

        // Animate particles with GSAP
        gsap.set('.particle', { scale: 0 });
        gsap.to('.particle', {
            scale: 1,
            duration: 2,
            stagger: 0.1,
            ease: "back.out(1.7)"
        });
    }

    setup3DAvatar() {
        const canvas = document.getElementById('avatar-3d');
        const ctx = canvas.getContext('2d');

        // Simple 3D-like avatar using canvas
        this.drawAvatar(ctx, canvas.width / 2, canvas.height / 2);

        // Add interaction text
        document.getElementById('avatar-interaction').innerHTML =
            `<span class="loading-wave"></span> AI Doctor Ready`;
    }

    drawAvatar(ctx, x, y) {
        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Create gradient for 3D effect
        const gradient = ctx.createRadialGradient(x, y, 50, x, y, 80);
        gradient.addColorStop(0, '#00d4ff');
        gradient.addColorStop(0.5, '#0099cc');
        gradient.addColorStop(1, '#006699');

        // Draw main avatar circle
        ctx.beginPath();
        ctx.arc(x, y, 80, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add glowing effect
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#00d4ff';

        // Draw face features
        this.drawAvatarFeatures(ctx, x, y);

        // Reset shadow
        ctx.shadowBlur = 0;
    }

    drawAvatarFeatures(ctx, x, y) {
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 20, y - 20, 8, 0, 2 * Math.PI);
        ctx.arc(x + 20, y - 20, 8, 0, 2 * Math.PI);
        ctx.fill();

        // Eye pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x - 20, y - 20, 4, 0, 2 * Math.PI);
        ctx.arc(x + 20, y - 20, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Mouth (smile)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y + 10, 20, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

        // Medical cross on forehead
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(x - 2, y - 50, 4, 20);
        ctx.fillRect(x - 10, y - 42, 20, 4);
    }

    startAvatarAnimation() {
        const canvas = document.getElementById('avatar-3d');
        const ctx = canvas.getContext('2d');
        let animationFrame = 0;

        const animate = () => {
            animationFrame += 0.1;

            // Create breathing effect
            const scale = 1 + Math.sin(animationFrame) * 0.05;
            canvas.style.transform = `scale(${scale})`;

            requestAnimationFrame(animate);
        };

        animate();
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            // Set language based on current selection
            const languageMap = {
                'en': 'en-US',
                'hi': 'hi-IN',
                'es': 'es-ES',
                'fr': 'fr-FR',
                'de': 'de-DE',
                'zh': 'zh-CN',
                'ar': 'ar-SA',
                'ja': 'ja-JP'
            };

            this.recognition.lang = languageMap[this.currentLanguage] || 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                document.getElementById('voice-btn').classList.add('voice-recording');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('user-input').value = transcript;
                this.sendMessage();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                document.getElementById('voice-btn').classList.remove('voice-recording');
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                document.getElementById('voice-btn').classList.remove('voice-recording');
            };
        }
    }

    toggleVoiceRecognition() {
        if (!this.recognition) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    sendMessage() {
        const input = document.getElementById('user-input');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate bot response after delay
        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateBotResponse(message);
        }, 1500 + Math.random() * 1000);
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        if (sender === 'user') {
            messageDiv.innerHTML = `
        <div class="message-bubble">${content}</div>
      `;
        } else {
            messageDiv.innerHTML = content;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Animate message appearance
        gsap.from(messageDiv, {
            duration: 0.5,
            y: 30,
            opacity: 0,
            ease: "back.out(1.7)"
        });
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('messages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    generateBotResponse(userMessage) {
        const responses = this.getMedicalResponse(userMessage);

        responses.forEach((response, index) => {
            setTimeout(() => {
                this.addMessage(response, 'bot');

                // Speak the response if synthesis is available
                if (this.synthesis && response) {
                    const textContent = response.replace(/<[^>]*>/g, ''); // Remove HTML tags
                    if (textContent.length < 200) { // Only speak shorter responses
                        const utterance = new SpeechSynthesisUtterance(textContent);
                        utterance.rate = 0.9;
                        utterance.pitch = 1.1;
                        this.synthesis.speak(utterance);
                    }
                }
            }, index * 1000);
        });
    }

    getMedicalResponse(message) {
        const lowerMessage = message.toLowerCase();
        const t = this.translations[this.currentLanguage];

        // Symptom keywords and responses
        if (lowerMessage.includes('headache') || lowerMessage.includes('head pain') ||
            lowerMessage.includes('सिरदर्द') || lowerMessage.includes('dolor de cabeza') ||
            lowerMessage.includes('mal de tête') || lowerMessage.includes('kopfschmerzen') ||
            lowerMessage.includes('头痛') || lowerMessage.includes('صداع') ||
            lowerMessage.includes('頭痛')) {
            return [
                `<div class="medical-card">
          <div class="card-header">
            <div class="card-icon symptom-icon">🤕</div>
            <span>${t.symptoms.headache.analysis}</span>
          </div>
          <p>${t.symptoms.headache.content}</p>
        </div>`,
                `<div class="medical-card">
          <div class="card-header">
            <div class="card-icon advice-icon">💡</div>
            <span>${t.symptoms.headache.advice}</span>
          </div>
          <p>${t.symptoms.headache.treatment}</p>
        </div>`
            ];
        }

        if (lowerMessage.includes('fever') || lowerMessage.includes('temperature') ||
            lowerMessage.includes('बुखार') || lowerMessage.includes('fiebre') ||
            lowerMessage.includes('fièvre') || lowerMessage.includes('fieber') ||
            lowerMessage.includes('发烧') || lowerMessage.includes('حمى') ||
            lowerMessage.includes('発熱')) {
            return [
                `<div class="medical-card">
          <div class="card-header">
            <div class="card-icon symptom-icon">🌡️</div>
            <span>${t.symptoms.fever.analysis}</span>
          </div>
          <p>${t.symptoms.fever.content}</p>
        </div>`,
                `<div class="medical-card">
          <div class="card-header">
            <div class="card-icon medicine-icon">💊</div>
            <span>${t.symptoms.fever.treatment}</span>
          </div>
          <p>${t.symptoms.fever.advice}</p>
        </div>`
            ];
        }

        if (lowerMessage.includes('cough') || lowerMessage.includes('sore throat') ||
            lowerMessage.includes('खांसी') || lowerMessage.includes('tos') ||
            lowerMessage.includes('toux') || lowerMessage.includes('husten') ||
            lowerMessage.includes('咳嗽') || lowerMessage.includes('سعال') ||
            lowerMessage.includes('咳')) {
            return [
                `<div class="medical-card">
          <div class="card-header">
            <div class="card-icon symptom-icon">😷</div>
            <span>${t.symptoms.cough.analysis}</span>
          </div>
          <p>${t.symptoms.cough.content}</p>
        </div>`,
                `<div class="medical-card">
          <div class="card-header">
            <div class="card-icon advice-icon">🍯</div>
            <span>${t.symptoms.cough.remedies}</span>
          </div>
          <p>${t.symptoms.cough.advice}</p>
        </div>`
            ];
        }

        // General health queries
        if (lowerMessage.includes('bmi') || lowerMessage.includes('weight')) {
            return [
                `<div class="medical-card">
          <div class="card-header">
            <div class="card-icon advice-icon">📊</div>
            <span>BMI ${this.getText('bmiTitle').split(':')[0]}</span>
          </div>
          <p>${this.currentLanguage === 'en' ? 'Check your BMI in the dashboard below. A healthy BMI range is typically 18.5-24.9. Remember that BMI is just one indicator of health.' :
                    this.currentLanguage === 'hi' ? 'नीचे डैशबोर्ड में अपना BMI देखें। एक स्वस्थ BMI रेंज आमतौर पर 18.5-24.9 होती है। याद रखें कि BMI स्वास्थ्य का केवल एक संकेतक है।' :
                        'Vérifiez votre IMC dans le tableau de bord ci-dessous. Une plage d\'IMC saine est généralement de 18,5-24,9.'}</p>
        </div>`
            ];
        }

        // Default response
        return [
            `<div class="medical-card">
        <div class="card-header">
          <div class="card-icon advice-icon">🤖</div>
          <span>${this.currentLanguage === 'en' ? 'AI Medical Assistant' :
                this.currentLanguage === 'hi' ? 'AI मेडिकल असिस्टेंट' :
                    this.currentLanguage === 'es' ? 'Asistente Médico IA' :
                        this.currentLanguage === 'fr' ? 'Assistant Médical IA' :
                            this.currentLanguage === 'de' ? 'KI-Medizinischer Assistent' :
                                this.currentLanguage === 'zh' ? 'AI医疗助手' :
                                    this.currentLanguage === 'ar' ? 'المساعد الطبي بالذكاء الاصطناعي' :
                                        this.currentLanguage === 'ja' ? 'AI医療アシスタント' : 'AI Medical Assistant'}</span>
        </div>
        <p>${this.currentLanguage === 'en' ? 'Thank you for your question. I\'m here to provide general medical information and guidance. Please describe your symptoms in more detail, and I\'ll do my best to help.' :
                this.currentLanguage === 'hi' ? 'आपके प्रश्न के लिए धन्यवाद। मैं सामान्य चिकित्सा जानकारी और मार्गदर्शन प्रदान करने के लिए यहाँ हूँ। कृपया अपने लक्षणों का अधिक विस्तार से वर्णन करें।' :
                    'Gracias por su pregunta. Estoy aquí para proporcionar información médica general y orientación. Describa sus síntomas con más detalle.'}</p>
      </div>`,
            `<div class="medical-card">
        <div class="card-header">
          <div class="card-icon advice-icon">⚠️</div>
          <span>${this.currentLanguage === 'en' ? 'Important Notice' :
                this.currentLanguage === 'hi' ? 'महत्वपूर्ण सूचना' :
                    this.currentLanguage === 'es' ? 'Aviso Importante' :
                        this.currentLanguage === 'fr' ? 'Avis Important' :
                            this.currentLanguage === 'de' ? 'Wichtiger Hinweis' :
                                this.currentLanguage === 'zh' ? '重要通知' :
                                    this.currentLanguage === 'ar' ? 'إشعار مهم' :
                                        this.currentLanguage === 'ja' ? '重要なお知らせ' : 'Important Notice'}</span>
        </div>
        <p><strong>${this.currentLanguage === 'en' ? 'Disclaimer:' :
                this.currentLanguage === 'hi' ? 'अस्वीकरण:' :
                    this.currentLanguage === 'es' ? 'Descargo:' :
                        this.currentLanguage === 'fr' ? 'Avertissement:' :
                            this.currentLanguage === 'de' ? 'Haftungsausschluss:' :
                                this.currentLanguage === 'zh' ? '免责声明:' :
                                    this.currentLanguage === 'ar' ? 'إخلاء مسؤولية:' :
                                        this.currentLanguage === 'ja' ? '免責事項:' : 'Disclaimer:'}</strong> ${t.disclaimer}</p>
      </div>`
        ];
    }

    addWelcomeMessage() {
        const t = this.translations[this.currentLanguage];

        setTimeout(() => {
            this.addMessage(`
        <div class="medical-card">
          <div class="card-header">
            <div class="card-icon advice-icon">👋</div>
            <span>${t.welcome.title}</span>
          </div>
          <p>${t.welcome.content}</p>
        </div>
        <div class="medical-card">
          <div class="card-header">
            <div class="card-icon symptom-icon">💬</div>
            <span>${t.welcome.interaction.title}</span>
          </div>
          <p>${t.welcome.interaction.content}</p>
        </div>
      `, 'bot');
        }, 1000);
    }

    setupCharts() {
        // BMI Chart
        const bmiCtx = document.getElementById('bmi-chart').getContext('2d');
        this.charts.bmi = new Chart(bmiCtx, {
            type: 'doughnut',
            data: {
                labels: ['Normal', 'Current'],
                datasets: [{
                    data: [18.5, 23.2],
                    backgroundColor: ['#00d4ff', '#ff6b6b'],
                    borderWidth: 0
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
                    },
                    title: {
                        display: true,
                        text: 'BMI: 23.2 (Normal)',
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            }
        });

        // Heart Rate Chart
        const heartCtx = document.getElementById('heartrate-chart').getContext('2d');
        const heartRateData = Array.from({ length: 24 }, () => 60 + Math.random() * 40);

        this.charts.heartRate = new Chart(heartCtx, {
            type: 'line',
            data: {
                labels: Array.from({ length: 24 }, (_, i) => i + ':00'),
                datasets: [{
                    label: 'Heart Rate (BPM)',
                    data: heartRateData,
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    tension: 0.4,
                    fill: true
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
                    },
                    title: {
                        display: true,
                        text: 'Heart Rate Monitoring',
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: 'rgba(0, 212, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: 'rgba(0, 212, 255, 0.1)'
                        }
                    }
                }
            }
        });

        // Symptom History Chart
        const symptomCtx = document.getElementById('symptom-history-chart').getContext('2d');
        this.charts.symptoms = new Chart(symptomCtx, {
            type: 'bar',
            data: {
                labels: ['Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea'],
                datasets: [{
                    label: 'Frequency (Last 30 days)',
                    data: [5, 2, 8, 3, 1],
                    backgroundColor: [
                        '#ff6b6b',
                        '#ffa502',
                        '#3742fa',
                        '#2ed573',
                        '#ff4757'
                    ]
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
                    },
                    title: {
                        display: true,
                        text: 'Symptom History',
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: 'rgba(0, 212, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: 'rgba(0, 212, 255, 0.1)'
                        }
                    }
                }
            }
        });

        // Animate chart appearance
        Object.values(this.charts).forEach((chart, index) => {
            gsap.from(chart.canvas.parentElement, {
                duration: 1,
                y: 50,
                opacity: 0,
                delay: index * 0.3,
                ease: "power3.out"
            });
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MedibotUI();
});

// Additional utility functions
function createRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    element.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple effect to buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('pulse-btn')) {
        createRippleEffect(e.target, e);
    }
});

// Enhance input with floating labels
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('user-input');

    input.addEventListener('focus', () => {
        gsap.to(input, {
            duration: 0.3,
            scale: 1.02,
            ease: "power2.out"
        });
    });

    input.addEventListener('blur', () => {
        gsap.to(input, {
            duration: 0.3,
            scale: 1,
            ease: "power2.out"
        });
    });
});
