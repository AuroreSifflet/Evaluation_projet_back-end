// import 'dotenv/config';
window.document.addEventListener('DOMContentLoaded', () => {
  console.log('Script login');
  // const port = String(process.env.PORT);
  // const host = String(process.env.HOST);
  const myForm = document.getElementById('login');

  const nicknameInput = document.getElementById('pseudo'); // Accédez au premier élément de la liste
  const notificationMessage = document.getElementById('notificationMessage');
  
  if (myForm) {
    myForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const nickname = nicknameInput.value;
      try {
        const formData = new FormData(myForm);
        const searchParams = new URLSearchParams(formData); 
        const response = await fetch(`https://evaluation-projet-back-end.onrender.com/connexion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            nickname: nickname,
          },
          body: searchParams
        });
        
        const { message, timeout, success, url } = await response.json();
  
        notificationMessage.innerText = message;
        
        if (success) {
          myForm.reset();
          setTimeout(() => {
            localStorage.setItem('nickname', nickname);
            window.location.href = url;
          }, timeout);  
        }
      } catch (error) {
        console.error((new Date()).toLocaleString('fr-FR'), ' Erreur sur le formulaire de connexion : ', error);
        notificationMessage.innerText = 'Une erreur est survenue lors de la soumission du formulaire.';
      }
    })
  }
});
