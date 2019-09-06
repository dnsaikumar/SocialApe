const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth')
const { getAllScreams, postOneScream, getScream, commentOnScream } = require('./handlers/screams');
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users');

//Scream Routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);
// TODO delete Scream
// TODO Like a Scream
// TODO UnLike a Scream
app.post('/scream/:screamId/comment', FBAuth, commentOnScream)

//User Routes
//signup route
app.post('/signup', signup);
//Login Route
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//     response.send("Hello World from Firebase!");
// });

// exports.getScreams = functions.https.onRequest((req, res) => {

// });
// firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
//     .then(data => {
//         return res.status(201).json({ message: `user ${data.user.uid} signed up successfully` })
//     })
//     .catch(err => {
//         console.error(err);
//         return res.status(500).json({ error: err.code });
//     });
// })



exports.api = functions.region("europe-west1").https.onRequest(app);