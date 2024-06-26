var express = require('express');
var router = express.Router();
require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Route handler for the login endpoint.
router.get('/login', (req, res) => {
    // Define the scopes for authorization; these are the permissions we ask from the user.
    const scopes = ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-modify-playback-state'];
    // Redirect the client to Spotify's authorization page with the defined scopes.
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// Route handler for the callback endpoint after the user has logged in.
router.get('/callback', (req, res) => {
    // Extract the error, code, and state from the query parameters.
    const error = req.query.error;
    const code = req.query.code;

    // If there is an error, log it and send a response to the user.
    if (error) {
        console.error('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
        return;
    }

    // Exchange the code for an access token and a refresh token.
    spotifyApi.authorizationCodeGrant(code).then(data => {
        const accessToken = data.body['access_token'];
        const refreshToken = data.body['refresh_token'];
        const expiresIn = data.body['expires_in'];

        // Set the access token and refresh token on the Spotify API object.
        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        // Logging tokens can be a security risk; this should be avoided in production.
        console.log('The access token is ' + accessToken);
        console.log('The refresh token is ' + refreshToken);

        // Send a success message to the user.
        res.send('Login successful! You can now use the /search and /play endpoints.');

        // Refresh the access token periodically before it expires.
        setInterval(async () => {
            const data = await spotifyApi.refreshAccessToken();
            const accessTokenRefreshed = data.body['access_token'];
            spotifyApi.setAccessToken(accessTokenRefreshed);
        }, expiresIn / 2 * 1000); // Refresh halfway before expiration.

    }).catch(error => {
        console.error('Error getting Tokens:', error);
        res.send('Error getting tokens');
    });
});

// Route handler for the currently playing track endpoint.
router.get('/currently-playing', (req, res) => {
    spotifyApi.getMyCurrentPlaybackState()
        .then(data => {
            console.log(data.body);
            if (data.body && data.body.is_playing) {
                 res.json({
                     name: data.body.item.name,
                     artist: data.body.item.artists[0].name,
                     albumImageUrl: data.body.item.album.images[0].url
                 });
            } else {
                res.send('No song is currently playing.');
            }
        })
        .catch(error => {
            console.error('Error getting current playback state:', error);
            res.send('Error getting current playback state');
        });
});

// Route handler for the get active device endpoint.
router.get('/get-active-device', (req, res) => {
    spotifyApi.getMyDevices()
        .then(data => {
            const activeDevices = data.body.devices.filter(device => device.is_active);
            if (activeDevices.length > 0) {
                res.send(`Active device: ${activeDevices[0].name} and ${activeDevices[0].id}`);
            } else {
                res.send('No active device found');
            }
        })
        .catch(error => {
            console.error('Error getting devices:', error);
            res.send('Error getting devices');
        });
});

router.get('/pause', (req, res) => {
    spotifyApi.pause()
        .then(() => {
            res.send('Playback paused');
        })
        .catch(error => {
            console.error('Error pausing playback:', error);
            res.send('Error pausing playback');
        });
});

// Route handler for the play endpoint.
router.get('/play', (req, res) => {
    spotifyApi.play()
        .then(() => {
            res.send('Playback started');
        })
        .catch(error => {
            console.error('Error starting playback:', error);
            res.send('Error starting playback');
        });
});

router.get('/next', async (req, res) => {
    try {
        await spotifyApi.skipToNext();
        res.send('Skipped to next track');
    } catch (error) {
        res.status(500).send('Error skipping track');
    }
});

router.get('/previous', async (req, res) => {
    try {
        await spotifyApi.skipToPrevious();
        res.send('Skipped to previous track');
    } catch (error) {
        res.status(500).send('Error returning to previous track');
    }
});

router.put('/send-position', (req, res) => {
    const position = req.body.position; // Get the position from the request body
    spotifyApi.seek(position)
        .then(() => {
            res.send('Playback position updated successfully');
        })
        .catch(error => {
            console.error('Error setting playback position:', error);
            res.send('Error setting playback position');
        });
});

router.get('/track-position', (req, res) => {
    spotifyApi.getMyCurrentPlaybackState()
        .then(data => {
            if (data.body && data.body.is_playing) {
                res.json({
                    time: data.body.progress_ms.toString(),
                    duration: data.body.item.duration_ms.toString()
                });
            } else {
                res.send('No song is currently playing.');
            }
        })
        .catch(error => {
            console.error('Error getting current playback state:', error);
            res.send('Error getting current playback state');
        });
});

router.get('/get-volume', (req, res) => {
    spotifyApi.getMyCurrentPlaybackState()
        .then(data => {
            if (data.body && data.body.device) {
                res.json({ volume: data.body.device.volume_percent });  // Envoyer en format JSON
            } else {
                res.status(404).json({ error: 'No song is currently playing.' });
            }
        })
        .catch(error => {
            console.error('Error getting current playback state:', error);
            res.status(500).json({ error: 'Error getting current playback state' });
        });
});

router.put('/set-volume', (req, res) => {
    const volume = req.body.volume; // Get the volume from the request body
    spotifyApi.setVolume(volume)
        .then(() => {
            res.send('Volume updated successfully');
        })
        .catch(error => {
            console.error('Error setting volume:', error);
            res.send('Error setting volume');
        });
});

module.exports = router;
