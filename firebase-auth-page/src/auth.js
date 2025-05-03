// This file contains the JavaScript logic for handling user authentication.

import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const signInForm = document.getElementById('auth-form');
const signOutButton = document.getElementById('sign-out');
const messageBox = document.getElementById('message');

signInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = signInForm.email.value;
    const password = signInForm.password.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            messageBox.textContent = `Welcome, ${user.email}!`;
            console.log('User signed in:', user);
            signOutButton.style.display = 'block';
        })
        .catch((error) => {
            const errorMessage = error.message;
            messageBox.textContent = `Error: ${errorMessage}`;
            console.error('Sign-in error:', error);
        });
});

signOutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        messageBox.textContent = 'You have signed out.';
        console.log('User signed out');
        signOutButton.style.display = 'none';
    }).catch((error) => {
        const errorMessage = error.message;
        messageBox.textContent = `Error: ${errorMessage}`;
        console.error('Sign-out error:', error);
    });
});