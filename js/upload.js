import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getDatabase,ref,push,set,onChildAdded
  } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Firebase configuration (ensure this matches your Firebase project)
const firebaseConfig = {
  apiKey: "AIzaSyAflF-q5vpHh0pE4nilRsKpv4YuvAP-QmE",
  authDomain: "trackify-aec8b.firebaseapp.com",
  projectId: "trackify-aec8b",
  storageBucket: "trackify-aec8b.firebasestorage.app",
  messagingSenderId: "677318614947",
  appId: "1:677318614947:web:3f91e3bb7b56a62d294416"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database }

let uploadBtn = document.querySelector('.upload-btn'); // Select by class 'upload-btn'
let uploadInput = document.getElementById('songTitle'); // Select by ID 'songTitle'

let uploadedTrack = document.getElementById('uploadedTrack');
let uploadedTitle = document.getElementById('uploadedTitle');
let uploadedArtist = document.getElementById('uploadedArtist');
let uploadedAudio = document.getElementById('uploadedAudio');

// Upload logic
uploadBtn.addEventListener('click', () => {
    // The file is now associated with a *different* input field.
    // You'll need to get the file from the *file* input, which still has the ID 'songFile'.
    let fileInput = document.getElementById('songFile');
    let file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload!");
        return;
    }

    // The title should now come from the *text* input field with the ID 'songTitle'.
    let titleInput = document.getElementById('songTitle');
    let title = titleInput.value.trim(); // Get the value from the input field

    let artist = "Unknown Artist"; // You can add an input field later to customize this

    let reader = new FileReader();

    reader.onload = function (e) {
        let audioUrl = e.target.result;

        // Save to Firebase
        let songRef = push(ref(database, 'songs/')); // Use the 'database' object
        set(songRef, {
            title: title,
            artist: artist,
            url: audioUrl
        }).then(() => {
            console.log("Song uploaded successfully!");
            // Optionally clear the title input after successful upload
            titleInput.value = '';
        }).catch((error) => {
            console.error("Error uploading song:", error);
        });
    };

    reader.onerror = function (error) {
        console.error("Error reading file:", error);
    };

    reader.readAsDataURL(file);
});

// Load and display latest uploaded song
onChildAdded(ref(database, 'songs/'), (snapshot) => { // Use the 'database' object
    let song = snapshot.val();

    // Update UI
    uploadedTitle.textContent = song.title;
    uploadedArtist.textContent = song.artist;
    uploadedAudio.src = song.url;
    uploadedTrack.style.display = "block";
});