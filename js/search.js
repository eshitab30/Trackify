document.addEventListener('DOMContentLoaded', () => {
  const navSearch = document.getElementById('navSearch');
  const homeSection = document.getElementById('homeSection');
  const searchSection = document.getElementById('searchSection');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const searchResultsDiv = document.getElementById('searchResults');
  const playlistsList = document.getElementById('playlistsList');
  const itunesApiUrl = 'https://itunes.apple.com/search?term=';
  const searchLimit = '&limit=10';
  let currentSearchResults = [];
  let playlists = [{ id: 'default', name: 'My Playlist', tracks: [] }];

  function updatePlaylistsDisplay() {
      if (playlistsList) {
          playlistsList.innerHTML = '';
          playlists.forEach(playlist => {
              const listItem = document.createElement('li');
              listItem.textContent = playlist.name;
              const viewButton = document.createElement('button');
              viewButton.textContent = 'View';
              viewButton.classList.add('view-playlist');
              viewButton.dataset.playlistId = playlist.id;
              listItem.appendChild(viewButton);
              playlistsList.appendChild(listItem);
          });
          attachPlaylistViewListeners();
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

  updatePlaylistsDisplay();

  if (navSearch) {
      navSearch.addEventListener('click', (e) => {
          e.preventDefault();
          homeSection.classList.add('hidden');
          searchSection.classList.remove('hidden');
          document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
          navSearch.classList.add('active');
          document.getElementById('navHome').classList.remove('active');
          document.getElementById('navCreatePlaylistLink')?.classList.remove('active');
          document.getElementById('navPlaylistsLink')?.classList.remove('active');
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
                          Add
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
                  playlists[0].tracks.push({
                      id: trackToAdd.trackId,
                      name: trackToAdd.trackName,
                      artist: trackToAdd.artistName,
                      artwork: trackToAdd.artworkUrl100
                  });
                  alert(`"${trackToAdd.trackName}" by ${trackToAdd.artistName} added to "My Playlist"`);
                  updatePlaylistsDisplay();
              } else {
                  alert('Error: Could not find track to add to playlist.');
              }
          });
      });
  }
});