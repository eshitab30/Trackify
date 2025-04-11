import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getDatabase, ref, push, set, onChildAdded, get, remove
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfigRealtime = {
    apiKey: "AIzaSyAflF-q5vpHh0pE4nilRsKpv4YuvAP-QmE",
    authDomain: "trackify-aec8b.firebaseapp.com",
    databaseURL: "https://trackify-aec8b-default-rtdb.firebaseio.com/", 
    projectId: "trackify-aec8b",
    storageBucket: "trackify-aec8b.firebasestorage.app",
    messagingSenderId: "677318614947",
    appId: "1:677318614947:web:3f91e3bb7b56a62d294416"
};

const appRealtime = initializeApp(firebaseConfigRealtime, 'realtimeApp');
const realtimeDatabase = getDatabase(appRealtime);

let uploadBtn = document.querySelector('.upload-btn');
let uploadInput = document.getElementById('songTitle');
let playSongsContainer = document.querySelector('.play-songs-container');

function createSongElement(song, songId) {
    let trackDiv = document.createElement('div');
    trackDiv.classList.add('uploaded-track');
    trackDiv.dataset.songId = songId;

    let titleHeading = document.createElement('h3');
    titleHeading.textContent = song.title;

    let artistParagraph = document.createElement('p');
    artistParagraph.textContent = song.artist;

    let audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.src = song.url;

    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', () => {
        deleteSong(songId);
    });

    let addToPlaylistButton = document.createElement('button');
    addToPlaylistButton.textContent = 'Add to Playlist';
    addToPlaylistButton.classList.add('add-to-playlist-button-uploaded');
    addToPlaylistButton.dataset.songTitle = song.title;
    addToPlaylistButton.dataset.songArtist = song.artist;
    addToPlaylistButton.dataset.songUrl = song.url;
    addToPlaylistButton.addEventListener('click', function () {
        const title = this.dataset.songTitle;
        const artist = this.dataset.songArtist;
        const url = this.dataset.songUrl;
        showAddToPlaylistModal({ name: title, artist: artist, url: url });
    });

    trackDiv.appendChild(titleHeading);
    trackDiv.appendChild(artistParagraph);
    trackDiv.appendChild(audioElement);
    trackDiv.appendChild(deleteButton);
    trackDiv.appendChild(addToPlaylistButton);

    return trackDiv;
}

function deleteSong(songId) {
    remove(ref(realtimeDatabase, `songs/${songId}`))
        .then(() => {
            console.log(`Song with ID ${songId} deleted successfully.`);
            const songElementToRemove = document.querySelector(`.uploaded-track[data-song-id="${songId}"]`);
            if (songElementToRemove) {
                playSongsContainer.removeChild(songElementToRemove);
            }
        })
        .catch((error) => {
            console.error(`Error deleting song with ID ${songId}:`, error);
        });
}

function showAddToPlaylistModal(uploadedTrack) {
    const playlistSelect = document.createElement('select');
    if (typeof playlists !== 'undefined' && Array.isArray(playlists)) {
        playlists.forEach(playlist => {
            const option = document.createElement('option');
            option.value = playlist.id;
            option.textContent = playlist.name;
            playlistSelect.appendChild(option);
        });

        const addToPlaylistPrompt = document.createElement('div');
        addToPlaylistPrompt.style.position = 'fixed';
        addToPlaylistPrompt.style.bottom = '50px';
        addToPlaylistPrompt.style.left = '50%';
        addToPlaylistPrompt.style.transform = 'translateX(-50%)';
        addToPlaylistPrompt.style.backgroundColor = '#222';
        addToPlaylistPrompt.style.color = 'white';
        addToPlaylistPrompt.style.padding = '1rem';
        addToPlaylistPrompt.style.borderRadius = '5px';
        addToPlaylistPrompt.style.zIndex = '1001';
        addToPlaylistPrompt.style.display = 'flex';
        addToPlaylistPrompt.style.alignItems = 'center';
        addToPlaylistPrompt.style.gap = '0.5rem';

        const label = document.createElement('span');
        label.textContent = `Add "${uploadedTrack.name}" to Playlist:`;

        const addButton = document.createElement('button');
        addButton.textContent = 'Add';
        addButton.style.padding = '0.5rem 0.75rem';
        addButton.style.borderRadius = '5px';
        addButton.style.border = 'none';
        addButton.style.backgroundColor = '#007bff';
        addButton.style.color = 'white';
        addButton.style.cursor = 'pointer';
        addButton.addEventListener('click', () => {
            const selectedPlaylistId = playlistSelect.value;
            if (typeof addTrackToPlaylist === 'function') {
                addTrackToPlaylist(selectedPlaylistId, {
                    name: uploadedTrack.name,
                    artist: uploadedTrack.artist,
                    url: uploadedTrack.url,
                });
                document.body.removeChild(addToPlaylistPrompt);
            } else {
                console.error("addTrackToPlaylist function is not defined in the global scope.");
                alert("Error adding to playlist.");
            }
        });

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.padding = '0.5rem 0.75rem';
        cancelButton.style.borderRadius = '5px';
        cancelButton.style.border = '1px solid #555';
        cancelButton.style.backgroundColor = 'transparent';
        cancelButton.style.color = 'white';
        cancelButton.style.cursor = 'pointer';
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(addToPlaylistPrompt);
        });

        addToPlaylistPrompt.appendChild(label);
        addToPlaylistPrompt.appendChild(playlistSelect);
        addToPlaylistPrompt.appendChild(addButton);
        addToPlaylistPrompt.appendChild(cancelButton);
        document.body.appendChild(addToPlaylistPrompt);
    } else {
        console.error("Playlists data is not available.");
        alert("Playlists not loaded yet.");
    }
}

get(ref(realtimeDatabase, 'songs/')).then((snapshot) => {
    if (snapshot.exists()) {
        playSongsContainer.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const song = childSnapshot.val();
            const songId = childSnapshot.key;
            const songElement = createSongElement(song, songId);
            playSongsContainer.appendChild(songElement);
        });
    } else {
        console.log("No songs uploaded yet.");
        let noSongsMessage = document.createElement('p');
        noSongsMessage.textContent = "No songs uploaded yet.";
        playSongsContainer.appendChild(noSongsMessage);
    }
}).catch((error) => {
    console.error("Error fetching songs:", error);
});

onChildAdded(ref(realtimeDatabase, 'songs/'), (snapshot) => {
    const newSong = snapshot.val();
    const newSongId = snapshot.key;
    const newSongElement = createSongElement(newSong, newSongId);
    playSongsContainer.appendChild(newSongElement);
});

uploadBtn.addEventListener('click', () => {
    let fileInput = document.getElementById('songFile');
    let file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload!");
        return;
    }

    let titleInput = document.getElementById('songTitle');
    let title = titleInput.value.trim();
    let artist = "Unknown Artist";

    let reader = new FileReader();

    reader.onload = function (e) {
        let audioUrl = e.target.result;
        let songRef = push(ref(realtimeDatabase, 'songs/'));
        set(songRef, {
            title: title,
            artist: artist,
            url: audioUrl
        }).then(() => {
            console.log("Song uploaded successfully!");
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