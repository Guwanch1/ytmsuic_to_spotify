const fs = require('fs');
const fetch = require('node-fetch');

// Authorization token - Replace this with your valid token
const token = 'YOUR_TOKEN';

async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    method,
    body: JSON.stringify(body)
  });
  return await res.json();
}

async function searchTrack(title, artist) {
  const query = encodeURIComponent(`${title} ${artist}`);
  const searchResults = await fetchWebApi(`v1/search?q=${query}&type=track&limit=1`, 'GET');
  if (searchResults.tracks.items.length > 0) {
    return searchResults.tracks.items[0].uri; // Return the first matching track's URI
  }
  return null; // Return null if no matching track is found
}

async function createPlaylistFromYTTracks(filePath) {
  // Step 1: Read yt_tracks.json
  const ytTracks = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(ytTracks);

  // Step 2: Search Spotify for each track and get URIs
  const trackUris = [];
  for (const track of ytTracks) {
    const uri = await searchTrack(track.title, track.artist);
    if (uri) {
      trackUris.push(uri);
    } else {
      console.log(`Track not found: ${track.title} by ${track.artist}`);
    }
  }

  if (trackUris.length === 0) {
    console.log('No tracks found on Spotify. Playlist not created.');
    return;
  }

  // Step 3: Get the user ID
  const { id: user_id } = await fetchWebApi('v1/me', 'GET');

  // Step 4: Create a new playlist
  const playlist = await fetchWebApi(`v1/users/${user_id}/playlists`, 'POST', {
    name: 'My YouTube Tracks Playlist',
    description: 'Playlist created from yt_tracks.json',
    public: false
  });

  // Step 5: Add tracks to the playlist
  await fetchWebApi(`v1/playlists/${playlist.id}/tracks?uris=${trackUris.join(',')}`, 'POST');

  console.log(`Playlist created: ${playlist.name} (ID: ${playlist.id})`);
}

// Run the function with the path to your yt_tracks.json file
createPlaylistFromYTTracks('./yt_tracks.json');
