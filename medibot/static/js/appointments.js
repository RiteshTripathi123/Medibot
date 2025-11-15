document.addEventListener('DOMContentLoaded', function() {

    // =======================================================================
    // 1. APPOINTMENT MODAL FUNCTIONALITY
    // =======================================================================

    const appointmentModal = document.getElementById("appointment-modal");
    const bookNewAppointmentButton = document.getElementById("book-new-appointment");

    function openAppointmentModal() {
        if (appointmentModal) {
            appointmentModal.style.display = "block";
        }
    }

    function closeAppointmentModal() {
        if (appointmentModal) {
            appointmentModal.style.display = "none";
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

    // Handle form submission (placeholder)
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Appointment Submitted! (Backend logic required)');
            closeAppointmentModal();
        });
    }

}); // ← ✅ this closing parenthesis + brace was missing
