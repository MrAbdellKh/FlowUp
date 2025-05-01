export function showNotification(message, type) {
    // Créer un élément div pour afficher la notification
    const notification = document.createElement('div');
    notification.classList.add('alert', 'alert-dismissible', 'fade', 'show', 'position-fixed', 'top-0', 'end-0', 'm-3');
    
    // Choisir le type de notification
    if (type === 'success') {
        notification.classList.add('alert-success');
    } else if (type === 'error') {
        notification.classList.add('alert-danger');
    }

    notification.innerHTML = `
        <strong>${type === 'success' ? 'Succès' : 'Erreur'}!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Ajouter la notification au body
    document.body.appendChild(notification);
    
    // Fermer la notification après 5 secondes
    setTimeout(() => {
        notification.remove();
    }, 5000);
}
