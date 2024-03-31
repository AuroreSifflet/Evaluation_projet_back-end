// import 'dotenv/config';
window.document.addEventListener('DOMContentLoaded', () => {
    console.log('Script subscribe');
    // const port = String(process.env.PORT);
    // const host = String(process.env.HOST);
    const myForm = document.getElementById('subscribe');
    const notificationMessage = document.getElementById('notificationMessage');
    if (myForm) {
      myForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
          const formData = new FormData(myForm);
          const searchParams = new URLSearchParams(formData);
          
          const response = await fetch(`https://evaluation-projet-back-end.onrender.com/inscription`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: searchParams
          });
          
          console.log('response.body', response.body);
          const { message, timeout, success, url } = await response.json();
    
          notificationMessage.innerText = message;
          
          if (success) {
            myForm.reset();
            setTimeout(() => {
              window.location = url;
            }, timeout);  
          }
        } catch (error) {
          console.error((new Date()).toLocaleString('fr-FR'), ' Erreur sur le formulaire d\'inscription : ', error);
          notificationMessage.innerText = 'Une erreur est survenue lors de la soumission du formulaire.';
        }
      })
    }
  });
