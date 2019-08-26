const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp();
const firebaseConfig = {
    apiKey: "AIzaSyDKA_9aMPjHaLKjnrwgyXltaYaXZxoStV8",
    authDomain: "socialape-192e3.firebaseapp.com",
    databaseURL: "https://socialape-192e3.firebaseio.com",
    projectId: "socialape-192e3",
    storageBucket: "socialape-192e3.appspot.com",
    messagingSenderId: "1075884984514",
    appId: "1:1075884984514:web:98da7f3135cf92fa"
};

const app = require('express')();

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

app.get('/screams', (req, res) => {
    admin.firestore().collection('screams').orderBy('createdAt', 'desc').get().then((data) => {
        let screams = [];

        data.forEach((doc) => {
            screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt
            });
        });
        return res.json(screams);
    }).catch((err) => console.error(err));
});
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//     response.send("Hello World from Firebase!");
// });

// exports.getScreams = functions.https.onRequest((req, res) => {

// });

app.post('/scream', (req, res) => {

    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    admin.firestore().collection('screams').add(newScream).then((doc) => {
        res.json({ message: `document ${doc.id} created successfully` })
    })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });
});

//signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    // TODO: validate data

    firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then(data => {
            return res.status(201).json({ message: `user ${data.user.uid} signed up successfully` })
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code })
        });
})

exports.api = functions.region("europe-west1").https.onRequest(app);