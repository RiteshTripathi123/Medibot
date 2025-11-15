console.log("✅ JS loaded and running");

const uploadModal = document.getElementById('record-upload-modal');
// Targets the specific 'Upload Record' button in the 'records-page' section
const uploadButton = document.querySelector('#records-page .records-actions .btn-outline');
const closeModalButton = document.getElementById('record-upload-close-btn');
const cancelButton = document.getElementById('record-upload-cancel-btn');
const uploadArea = document.getElementById('record-upload-area');
const fileInput = document.getElementById('medical-record-file');
const submitButton = document.getElementById('upload-record-submit-btn');
const uploadAreaH4 = uploadArea ? uploadArea.querySelector('h4') : null;

if (uploadModal && uploadButton) {
    
    // --- Core Functions ---
    function openRecordUploadModal() {
        uploadModal.style.display = 'block';
    }

    function closeRecordUploadModal() {
        uploadModal.style.display = 'none';
        
        // Reset the form and button state on close
        const form = document.getElementById('record-upload-form');
        if (form) {
            form.reset();
        }
        if (submitButton) submitButton.disabled = true;
        if (uploadAreaH4) uploadAreaH4.textContent = `Drag & drop your medical record here`;
    }

    function handleRecordUpload(e) {
        e.preventDefault();
        if (!fileInput || fileInput.files.length === 0) {
            alert('Please select a file to upload.');
            return;
        }

        // Placeholder for backend file upload
        alert(`Uploading ${fileInput.files[0].name}... (Success Placeholder)`);
        closeRecordUploadModal();
    }

    // --- Event Listeners for Record Upload ---
    uploadButton.addEventListener('click', openRecordUploadModal);

    if (closeModalButton) closeModalButton.addEventListener('click', closeRecordUploadModal);
    if (cancelButton) cancelButton.addEventListener('click', closeRecordUploadModal);

    // Handle click on the dropzone to trigger the hidden file input
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    // Enable submit button and update text when file is selected
    if (fileInput && submitButton) {
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                submitButton.disabled = false;
                const fileName = this.files[0].name;
                if (uploadAreaH4) { uploadAreaH4.textContent = `File selected: ${fileName}`; }
            } else {
                submitButton.disabled = true;
                if (uploadAreaH4) { uploadAreaH4.textContent = `Drag & drop your medical record here`; }
            }
        });
    }

    // Handle the form submission
    if (submitButton) {
        submitButton.addEventListener('click', handleRecordUpload);
    }

    // Close when clicking outside modal
    window.addEventListener("click", function(event) {
        if (event.target === uploadModal) {
            closeRecordUploadModal();
        }
    });
}
console.log("uploadButton:", uploadButton);
