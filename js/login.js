import { auth } from './firebase-config.js'; // ONLY import auth
import { signInWithEmailAndPassword } from 'firebase/auth';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('Login successful!', user);
            messageDiv.textContent = 'Login successful! Redirecting...';
            messageDiv.className = 'success-message'; // You might want to add a success message class

            // Redirect the user to your desired page after successful login
            window.location.href = '/index.html'; // Replace '/dashboard.html' with your actual dashboard URL

        } catch (error) {
            console.error('Login failed:', error.message);
            messageDiv.textContent = `Login failed: ${error.message}`;
            messageDiv.className = 'error-message'; // Apply the error message style
        }
    });
});