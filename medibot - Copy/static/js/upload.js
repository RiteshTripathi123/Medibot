console.log("✅ upload.js loaded");

document.addEventListener('DOMContentLoaded', function () {

    // ─────────────────────────────────────────
    // SHARED CONFIG
    // ─────────────────────────────────────────
    const ALLOWED_TYPES      = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const MAX_FILE_SIZE_MB   = 10;

    function isValidFile(file) {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        return {
            validType: ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(ext),
            validSize: file.size <= MAX_FILE_SIZE_MB * 1024 * 1024
        };
    }

    function formatFileSize(bytes) {
        if (bytes < 1024)        return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // ─────────────────────────────────────────
    // 1. MEDICAL RECORDS PAGE — Upload Modal
    // ─────────────────────────────────────────
    const uploadModal      = document.getElementById('record-upload-modal');
    const uploadButton     = document.getElementById('open-upload-modal-btn');
    const closeModalButton = document.getElementById('record-upload-close-btn');
    const cancelButton     = document.getElementById('record-upload-cancel-btn');
    const uploadArea       = document.getElementById('record-upload-area');
    const fileInput        = document.getElementById('medical-record-file');
    const submitButton     = document.getElementById('upload-record-submit-btn');
    const uploadAreaH4     = uploadArea ? uploadArea.querySelector('h4') : null;

    if (!uploadModal)  { console.error("❌ #record-upload-modal not found");  }
    if (!uploadButton) { console.error("❌ #open-upload-modal-btn not found"); }

    function setUploadAreaMessage(message, type = 'default') {
        if (!uploadAreaH4) return;
        uploadAreaH4.textContent = message;
        uploadAreaH4.style.color =
            type === 'error'   ? '#e53e3e' :
            type === 'success' ? '#38a169' : '';
    }

    function setRecordFileSelected(file) {
        const { validType, validSize } = isValidFile(file);
        if (!validType) {
            setUploadAreaMessage('❌ Invalid type. Please upload a PDF or image.', 'error');
            submitButton.disabled = true;
            return;
        }
        if (!validSize) {
            setUploadAreaMessage(`❌ File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`, 'error');
            submitButton.disabled = true;
            return;
        }
        setUploadAreaMessage(`✅ Selected: ${file.name} (${formatFileSize(file.size)})`, 'success');
        submitButton.disabled = false;
    }

    function clearRecordSelection() {
        setUploadAreaMessage('Drag & drop your medical record here', 'default');
        if (submitButton) submitButton.disabled = true;
    }

    function openRecordModal() {
        if (uploadModal) uploadModal.style.display = 'block';
    }

    function closeRecordModal() {
        if (uploadModal) uploadModal.style.display = 'none';
        const form = document.getElementById('record-upload-form');
        if (form) form.reset();
        clearRecordSelection();
    }

    async function handleRecordUpload(e) {
        e.preventDefault();
        if (!fileInput || fileInput.files.length === 0) {
            alert('Please select a file first.');
            return;
        }
        const file = fileInput.files[0];
        const { validType, validSize } = isValidFile(file);
        if (!validType) { alert('Invalid file type. Upload a PDF or image.'); return; }
        if (!validSize) { alert(`File too large. Max ${MAX_FILE_SIZE_MB}MB allowed.`); return; }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload-record', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Upload failed');
            alert(`✅ "${file.name}" uploaded successfully!`);
            closeRecordModal();
        } catch (err) {
            alert('❌ Upload failed. Please try again.');
            console.error(err);
        }
    }

    if (uploadButton) uploadButton.addEventListener('click', openRecordModal);
    if (closeModalButton) closeModalButton.addEventListener('click', closeRecordModal);
    if (cancelButton)     cancelButton.addEventListener('click', closeRecordModal);

    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
    }

    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#4A90E2';
            uploadArea.style.background  = '#eef4ff';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '';
            uploadArea.style.background  = '';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            uploadArea.style.background  = '';
            const file = e.dataTransfer.files[0];
            if (!file) return;
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;
            setRecordFileSelected(file);
        });
    }

    if (fileInput) {
        fileInput.setAttribute('accept', ALLOWED_EXTENSIONS.join(','));
        fileInput.addEventListener('change', function () {
            this.files.length > 0 ? setRecordFileSelected(this.files[0]) : clearRecordSelection();
        });
    }

    if (submitButton) {
        submitButton.addEventListener('click', handleRecordUpload);
    }

    window.addEventListener('click', (e) => {
        if (e.target === uploadModal) closeRecordModal();
    });


    // ─────────────────────────────────────────
    // 2. CHAT PAGE — Attach Health Reports
    // ─────────────────────────────────────────
    const attachBtn       = document.getElementById('attach-reports');
    const fileUploadArea  = document.getElementById('file-upload-area');
    const uploadDropzone  = document.getElementById('upload-dropzone');
    const chatFileInput   = document.getElementById('file-input');
    const uploadedFilesEl = document.getElementById('uploaded-files');

    // Tracks files attached in the current chat session
    const attachedFiles = [];

    if (attachBtn && fileUploadArea) {

        // Toggle the dropzone panel open/closed
        attachBtn.addEventListener('click', () => {
            const isVisible = fileUploadArea.style.display === 'block';
            fileUploadArea.style.display = isVisible ? 'none' : 'block';
            attachBtn.classList.toggle('active', !isVisible);
        });
    }

    // Click dropzone → open file picker
    if (uploadDropzone && chatFileInput) {
        uploadDropzone.querySelector('.upload-link')?.addEventListener('click', (e) => {
            e.stopPropagation();
            chatFileInput.click();
        });
        uploadDropzone.addEventListener('click', () => chatFileInput.click());
    }

    // Drag & drop onto chat dropzone
    if (uploadDropzone) {
        uploadDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadDropzone.style.borderColor = '#4A90E2';
            uploadDropzone.style.background  = '#eef4ff22';
        });
        uploadDropzone.addEventListener('dragleave', () => {
            uploadDropzone.style.borderColor = '';
            uploadDropzone.style.background  = '';
        });
        uploadDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadDropzone.style.borderColor = '';
            uploadDropzone.style.background  = '';
            handleChatFiles(Array.from(e.dataTransfer.files));
        });
    }

    // File picker selection
    if (chatFileInput) {
        chatFileInput.setAttribute('accept', ALLOWED_EXTENSIONS.join(','));
        chatFileInput.addEventListener('change', function () {
            handleChatFiles(Array.from(this.files));
            this.value = ''; // reset so same file can be re-added after removal
        });
    }

    function handleChatFiles(files) {
        let hasError = false;

        files.forEach(file => {
            const { validType, validSize } = isValidFile(file);

            if (!validType) {
                showChatFileError(`❌ "${file.name}" — unsupported format. Use PDF or image.`);
                hasError = true;
                return;
            }
            if (!validSize) {
                showChatFileError(`❌ "${file.name}" — exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
                hasError = true;
                return;
            }
            // Avoid duplicates
            if (attachedFiles.find(f => f.name === file.name && f.size === file.size)) {
                return;
            }

            attachedFiles.push(file);
            renderAttachedFile(file);
        });

        if (!hasError && attachedFiles.length > 0) {
            console.log(`📎 ${attachedFiles.length} file(s) ready to send with next message`);
        }
    }

    function renderAttachedFile(file) {
        if (!uploadedFilesEl) return;

        const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
        const icon  = isPDF ? 'fa-file-pdf' : 'fa-file-image';
        const color = isPDF ? '#e53e3e' : '#4A90E2';

        const item = document.createElement('div');
        item.className = 'uploaded-file-item';
        item.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            margin-top: 6px;
        `;
        item.innerHTML = `
            <i class="fas ${icon}" style="color:${color}; font-size:18px;"></i>
            <div style="flex:1; overflow:hidden;">
                <div style="font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${file.name}
                </div>
                <div style="font-size:11px; opacity:0.6;">${formatFileSize(file.size)}</div>
            </div>
            <button class="remove-file-btn" title="Remove file" style="
                background: none;
                border: none;
                cursor: pointer;
                color: #e53e3e;
                font-size: 16px;
                padding: 0 4px;
            ">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Remove file on click
        item.querySelector('.remove-file-btn').addEventListener('click', () => {
            const idx = attachedFiles.findIndex(f => f.name === file.name && f.size === file.size);
            if (idx !== -1) attachedFiles.splice(idx, 1);
            item.remove();

            // Hide panel if no files left
            if (attachedFiles.length === 0 && fileUploadArea) {
                fileUploadArea.style.display = 'none';
                if (attachBtn) attachBtn.classList.remove('active');
            }
        });

        uploadedFilesEl.appendChild(item);
    }

    function showChatFileError(message) {
        if (!uploadedFilesEl) return;
        const err = document.createElement('div');
        err.style.cssText = 'color:#e53e3e; font-size:12px; margin-top:4px; padding: 4px 8px;';
        err.textContent = message;
        uploadedFilesEl.appendChild(err);
        setTimeout(() => err.remove(), 4000);
    }

    // Expose attached files so portal.js can include them when sending a message
    window.getChatAttachedFiles = () => [...attachedFiles];
    window.clearChatAttachedFiles = () => {
        attachedFiles.length = 0;
        if (uploadedFilesEl) uploadedFilesEl.innerHTML = '';
        if (fileUploadArea)  fileUploadArea.style.display = 'none';
        if (attachBtn)       attachBtn.classList.remove('active');
    };

});