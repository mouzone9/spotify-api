var express = require('express');
var router = express.Router();
require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');

var GetRandomStringClass = require("../services/getRandomString");
var querystring = require("node:querystring");
const GetRandomString = require("../services/getRandomString");

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
            if (data.body && data.body.is_playing) {
                res.send(`Currently playing: ${data.body.item.name} by ${data.body.item.artists[0].name}`);
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
                res.send(`Active device: ${activeDevices[0].name}`);
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

router.get('/seek/:position', async (req, res) => {
    try {
        const position = parseInt(req.params.position);
        await spotifyApi.seek(position);
        res.send('Moved to position: ' + position);
    } catch (error) {
        res.status(500).send('Error seeking position');
    }
});

module.exports = router;
