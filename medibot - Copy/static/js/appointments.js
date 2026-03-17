document.addEventListener('DOMContentLoaded', function() {

    // =======================================================================
    // 1. APPOINTMENT MODAL FUNCTIONALITY
    // =======================================================================

    const appointmentModal = document.getElementById("appointment-modal");
    const bookNewAppointmentButton = document.getElementById("book-new-appointment");

    function openAppointmentModal() {
        if (window.medibotPortal && typeof window.medibotPortal.openAppointmentModal === 'function') {
            window.medibotPortal.openAppointmentModal();
            return;
        }
        if (appointmentModal) {
            appointmentModal.classList.add('active');
            appointmentModal.style.display = "flex";
        }
    }

    function closeAppointmentModal() {
        if (window.medibotPortal && typeof window.medibotPortal.closeModal === 'function' && appointmentModal) {
            window.medibotPortal.closeModal(appointmentModal);
            return;
        }
        if (appointmentModal) {
            appointmentModal.style.display = "none";
            appointmentModal.classList.remove('active');
        }
    }

    // Attach click listener to the main booking button
    if (bookNewAppointmentButton) {
        bookNewAppointmentButton.addEventListener("click", openAppointmentModal);
    }

    // Allow the close button (span class="close-btn") in the modal to call this function
    window.closeAppointmentModal = closeAppointmentModal;

    // Close when clicking outside modal
    window.addEventListener("click", function(event) {
        if (event.target === appointmentModal) {
            closeAppointmentModal();
        }
    });

    // Do not attach placeholder submit logic; main logic is in portal.js
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.dataset.enhanced = 'true';
    }

}); // ← ✅ this closing parenthesis + brace was missing
