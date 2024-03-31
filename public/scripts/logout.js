window.document.addEventListener('DOMContentLoaded', () => {
    console.log('Script logout');
    // Fonction pour supprimer le cookie 'connect.sid' du navigateur
    function deleteCookie(cookieName) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie
    }
    const deconnectBtn = document.getElementById('logoutBtn');
    deconnectBtn.addEventListener('click', function(event) {
        event.preventDefault(); 
        // Supprimer le cookie 'connect.sid'
        deleteCookie('connect.sid', '/');
         window.location.href = '/';
    });

})