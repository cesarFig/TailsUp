// Function to show a custom alert
function showCustomAlert(message, borderColor = '#FEA02F') {
    const alertContainer = document.getElementById('customAlertContainer');
    if (!alertContainer) {
        console.error('Custom alert container not found.');
        alert(message); // Fallback to default alert if container is missing
        return;
    }

    const alertElement = document.createElement('div');
    alertElement.classList.add('custom-alert');
    alertElement.style.setProperty('--alert-border-color', borderColor);

    alertElement.innerHTML = `
        <img src="images/isotipo.png" alt="Notification Icon" class="custom-alert-icon">
        <span class="custom-alert-message">${message}</span>
        <button class="custom-alert-close">&times;</button>
    `;

    alertContainer.appendChild(alertElement);

    // Trigger animation
    setTimeout(() => {
        alertElement.classList.add('show');
    }, 10); // Small delay to ensure reflow for animation

    // Close button functionality
    alertElement.querySelector('.custom-alert-close').addEventListener('click', () => {
        alertElement.classList.remove('show');
        alertElement.addEventListener('transitionend', () => {
            alertContainer.removeChild(alertElement);
        }, { once: true });
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertElement.classList.remove('show');
        alertElement.addEventListener('transitionend', () => {
            if (alertContainer.contains(alertElement)) { // Check if still in DOM before removing
                alertContainer.removeChild(alertElement);
            }
        }, { once: true });
    }, 5000);
}