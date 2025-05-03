import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const registerForm = document.getElementById('register-form');
const messageBox = document.getElementById('message');

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = registerForm.email.value;
    const password = registerForm.password.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            messageBox.textContent = `Account created successfully for ${user.email}`;
            console.log('User registered:', user);
        })
        .catch((error) => {
            const errorMessage = error.message;
            messageBox.textContent = `Error: ${errorMessage}`;
            console.error('Registration error:', error);
        });
});