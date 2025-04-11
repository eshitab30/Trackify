document.addEventListener('DOMContentLoaded', () => {
    const navHome = document.getElementById('navHome');
    const navSearch = document.getElementById('navSearch');
    const navCreatePlaylistLink = document.getElementById('navCreatePlaylistLink');
    const navPlaylistsLink = document.getElementById('navPlaylistsLink');
    const homeSection = document.getElementById('homeSection');
    const searchSection = document.getElementById('searchSection');
    const createPlaylistSection = document.getElementById('createPlaylistSection');
    const yourPlaylistsSection = document.getElementById('yourPlaylistsSection');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsDiv = document.getElementById('searchResults');
    const playlistsList = document.getElementById('playlistsList');
    const playlistNameInput = document.getElementById('playlistName');
    const createPlaylistButton = document.querySelector('.create-playlist-form .create-btn');
    const itunesApiUrl = 'https://itunes.apple.com/search?term=';
    const searchLimit = '&limit=10';
    let currentSearchResults = [];
    let playlists = [{ id: 'default', name: 'My Playlist', tracks: [] }];
    let nextPlaylistId = 2;
    const notificationDiv = document.createElement('div');
    notificationDiv.classList.add('notification');
    document.body.appendChild(notificationDiv);

    function showNotification(message) {
        notificationDiv.textContent = message;
        notificationDiv.classList.add('show');
        setTimeout(() => {
            notificationDiv.classList.remove('show');
        }, 3000);
    }

    function updatePlaylistsDisplay() {
        if (playlistsList) {
            playlistsList.innerHTML = '';
            if (playlists.length > 0) {
                playlists.forEach(playlist => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <span class="playlist-name">${playlist.name}</span>
                        <div class="controls">
                            <button class="view-playlist" data-playlist-id="${playlist.id}">View</button>
                            <button class="play-playlist" data-playlist-id="${playlist.id}">Play</button>
                        </div>
                    `;
                    playlistsList.appendChild(listItem);
                });
                attachPlaylistViewListeners();
                attachPlaylistPlayListeners();
                const emptyMessage = yourPlaylistsSection.querySelector('.empty-message');
                if (emptyMessage) {
                    emptyMessage.style.display = 'none';
                }
            } else {
                playlistsList.innerHTML = '';
                let emptyMessage = yourPlaylistsSection.querySelector('.empty-message');
                if (!emptyMessage) {
                    emptyMessage = document.createElement('p');
                    emptyMessage.classList.add('empty-message');
                    emptyMessage.textContent = 'No playlists yet.';
                    yourPlaylistsSection.appendChild(emptyMessage);
                } else {
                    emptyMessage.style.display = 'block';
                }
            }
        }
    }

    function attachPlaylistViewListeners() {
        document.querySelectorAll('.view-playlist').forEach(button => {
            button.addEventListener('click', function() {
                const playlistId = this.dataset.playlistId;
                const playlist = playlists.find(p => p.id === playlistId);
                if (playlist) {
                    displayPlaylistTracks(playlist);
                }
            });
        });
    }

    function attachPlaylistPlayListeners() {
        document.querySelectorAll('.play-playlist').forEach(button => {
            button.addEventListener('click', function() {
                const playlistId = this.dataset.playlistId;
                const playlist = playlists.find(p => p.id === playlistId);
                if (playlist && playlist.tracks.length > 0) {
                    alert(`Playing playlist: ${playlist.name} (Functionality not fully implemented)`);
                    // In a real application, you would implement the playlist playback here
                } else if (playlist) {
                    alert(`Playlist "${playlist.name}" is empty.`);
                }
            });
        });
    }

    function displayPlaylistTracks(playlist) {
        searchResultsDiv.innerHTML = '';
        searchResultsDiv.classList.remove('empty');
        if (playlist.tracks.length > 0) {
            playlist.tracks.forEach(track => {
                const songItem = document.createElement('div');
                songItem.classList.add('song-item');
                const albumArt = track.artwork ? `<img src="${track.artwork}" alt="Album Art" class="album-art">` : '';
                songItem.innerHTML = `
                    ${albumArt}
                    <div class="song-info">
                        <div class="song-title">${track.name}</div>
                        <div class="artist-album">${track.artist}</div>
                    </div>
                `;
                searchResultsDiv.appendChild(songItem);
            });
        } else {
            searchResultsDiv.textContent = `No songs in "${playlist.name}" yet.`;
            searchResultsDiv.classList.add('empty');
        }
        searchSection.classList.remove('hidden');
    }

    updatePlaylistsDisplay(); // Initial call to display playlists

    const hideAllSections = () => {
        homeSection.classList.add('hidden');
        searchSection.classList.add('hidden');
        createPlaylistSection.classList.add('hidden');
        yourPlaylistsSection.classList.add('hidden');
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    };

    if (navHome) {
        navHome.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllSections();
            homeSection.classList.remove('hidden');
            navHome.classList.add('active');
        });
    }

    if (navSearch) {
        navSearch.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllSections();
            searchSection.classList.remove('hidden');
            navSearch.classList.add('active');
        });
    }

    if (navCreatePlaylistLink) {
        navCreatePlaylistLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllSections();
            createPlaylistSection.classList.remove('hidden');
            navCreatePlaylistLink.classList.add('active');
        });
    }

    if (navPlaylistsLink) {
        navPlaylistsLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllSections();
            yourPlaylistsSection.classList.remove('hidden');
            navPlaylistsLink.classList.add('active');
            updatePlaylistsDisplay();
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', async () => {
            const query = searchInput.value.trim();
            if (!query) {
                searchResultsDiv.textContent = 'Please enter a search query.';
                searchResultsDiv.classList.add('empty');
                return;
            }
            const apiUrl = `${itunesApiUrl}${encodeURIComponent(query)}${searchLimit}`;
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                currentSearchResults = data.results;
                displayResults(currentSearchResults);
            } catch (error) {
                console.error('Error fetching search results:', error);
                searchResultsDiv.textContent = `Failed to fetch search results. (${error.message})`;
                searchResultsDiv.classList.add('empty');
            }
        });
    }

    function displayResults(results) {
        searchResultsDiv.innerHTML = '';
        searchResultsDiv.classList.remove('empty');
        if (results && results.length > 0) {
            results.forEach(track => {
                const songItem = document.createElement('div');
                songItem.classList.add('song-item');
                const albumArt = track.artworkUrl100 ? `<img src="${track.artworkUrl100}" alt="Album Art" class="album-art">` : '';
                songItem.innerHTML = `
                    ${albumArt}
                    <div class="song-info">
                        <div class="song-title">${track.trackName}</div>
                        <div class="artist-album">${track.artistName} - ${track.collectionName}</div>
                    </div>
                    <div class="controls">
                        <button class="play-button" data-track-id="${track.trackId}">
                            <i data-lucide="play"></i>
                        </button>
                        <button class="add-to-playlist-button" data-track-id="${track.trackId}" data-track-name="${track.trackName}" data-artist-name="${track.artistName}" data-artwork="${track.artworkUrl100}">
                            Add to Playlist
                        </button>
                    </div>
                `;
                searchResultsDiv.appendChild(songItem);
            });
            lucide.createIcons();
            attachControlEventListeners(searchResultsDiv);
        } else {
            searchResultsDiv.textContent = 'No results found.';
            searchResultsDiv.classList.add('empty');
        }
    }

    function attachControlEventListeners(container) {
        container.querySelectorAll('.play-button').forEach(button => {
            button.addEventListener('click', function() {
                const trackId = this.dataset.trackId;
                const track = currentSearchResults.find(t => t.trackId === parseInt(trackId));
                if (track && track.trackViewUrl) {
                    window.open(track.trackViewUrl, '_blank');
                } else {
                    alert('Could not find the iTunes link for this track.');
                }
            });
        });
        container.querySelectorAll('.add-to-playlist-button').forEach(button => {
            button.addEventListener('click', function() {
                const trackId = this.dataset.trackId;
                const trackToAdd = currentSearchResults.find(track => track.trackId === parseInt(trackId));
                if (trackToAdd) {
                    const playlistSelect = document.createElement('select');
                    playlistSelect.style.padding = '0.5rem';
                    playlistSelect.style.borderRadius = '5px';
                    playlistSelect.style.border = '1px solid #555';
                    playlistSelect.style.backgroundColor = '#1a1a1a';
                    playlistSelect.style.color = 'white';
                    playlistSelect.style.marginRight = '0.5rem';

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
                    label.textContent = 'Add to Playlist:';

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
                        const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
                        if (selectedPlaylist) {
                            selectedPlaylist.tracks.push({
                                id: trackToAdd.trackId,
                                name: trackToAdd.trackName,
                                artist: trackToAdd.artistName,
                                artwork: trackToAdd.artworkUrl100
                            });
                            showNotification(`"${trackToAdd.trackName}" added to "${selectedPlaylist.name}"`);
                            updatePlaylistsDisplay();
                        } else {
                            alert('Error: Playlist not found.');
                        }
                        document.body.removeChild(addToPlaylistPrompt);
                    });

                    addToPlaylistPrompt.appendChild(label);
                    addToPlaylistPrompt.appendChild(playlistSelect);
                    addToPlaylistPrompt.appendChild(addButton);
                    document.body.appendChild(addToPlaylistPrompt);
                } else {
                    alert('Error: Could not find track to add to playlist.');
                }
            });
        });
    }

    if (createPlaylistButton) {
        createPlaylistButton.addEventListener('click', (e) => {
            e.preventDefault();
            const newPlaylistName = playlistNameInput.value.trim();
            if (newPlaylistName) {
                playlists.push({ id: nextPlaylistId.toString(), name: newPlaylistName, tracks: [] });
                nextPlaylistId++;
                playlistNameInput.value = '';
                updatePlaylistsDisplay();
                showNotification(`Playlist "${newPlaylistName}" created`);
            } else {
                alert('Please enter a playlist name.');
            }
        });
    }
});