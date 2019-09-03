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

const db = admin.firestore();

app.get('/screams', (req, res) => {
    db.collection('screams').orderBy('createdAt', 'desc').get().then((data) => {
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

const FBAuth = (req, res, next) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken = req.headers.authorization.split('Bearer ')[1];
    }
    else{
        console.error('No token Found!!');
        return res.status(403).json({error: 'Unauthorized'})
    }

    admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
        req.user = decodedToken;
        console.log(decodedToken);
        return db.collection('users')
        .where('userId','==',req.user.uid)
        .limit(1)
        .get();
    }).then( data =>{
        req.user.handle = data.docs[0].data.handle;
        return next();
    }).catch(err => {
        console.error("Error while verifying token", err);
        return res.status(403).json(err);
    })
}

app.post('/scream', FBAuth, (req, res) => {

    if(req.body.body.trim() === ''){
        return res.status(400).json({body: 'Must not be empty'});
    }

    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle, //req.body.userHandle
        createdAt: new Date().toISOString()
    };

    db.collection('screams').add(newScream).then((doc) => {
        res.json({ message: `document ${doc.id} created successfully` })
    })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });
});

const isEmpty = (string) => {
    if(string.trim() === ''){
        return true;
    }
    else return false;
}

const isEmail = (email) => {
    const regEx = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if(email.match(regEx)){
        return true;
    }else{
        return false;
    }
}

//signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };
    let errors = {};
    if(isEmpty(newUser.email)){
        errors.email = "Must not be Empty"
    }
    else if(!isEmail(newUser.email)){
        errors.email = "Must be a valid email address";
    }

    if(isEmpty(newUser.password)) errors.password = "Must not be empty";

    if(isEmpty(newUser.confirmPassword)) errors.confirmPassword = "Must not be empty";

    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match';

    if(isEmpty(newUser.handle)) errors.handle = "Must not be empty";

    if(Object.keys(errors).length > 0){
        return res.status(400).json(errors);
    } 
    // TODO: validate data
    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ handle: "This handle is already taken" })
            }
            else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        }).then(data => {
            userId = data.user.uid;
            return data.user.getIdToken()
        }).then(token => {
            token = token;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };

            db.doc(`/users/${newUser.handle}`).set(userCredentials)
            .then((data) =>{
                return res.status(201).json({token});
            })
            //return res.status(201).json({ token })
        }).catch(err => {
            console.error(err);
            if(err.code === "auth/email-already-in-use"){
                res.status(400).json({email: "Email already in use"});
            }
            else{
                return res.status(500).json({ error: err.code });
            }            
        });

});

// firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
//     .then(data => {
//         return res.status(201).json({ message: `user ${data.user.uid} signed up successfully` })
//     })
//     .catch(err => {
//         console.error(err);
//         return res.status(500).json({ error: err.code });
//     });
// })

app.post('/login',(req,res) =>{
    const user = {
        email: req.body.email,
        password: req.body.password
    }
    let errors = {}

    if(isEmpty(user.email)) errors.email = 'Must not be empty';
    if(isEmpty(user.password)) errors.password = 'Must not be empty';

    if(Object.keys(errors).length > 0) return res.status(200).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email,user.password).then(data => {
        return data.user.getIdToken();
    })
    .then(token => {
        return res.json({token})
    })
    .catch(err =>{
        console.log(err);
        if(err.code === 'auth/wrong-password'){
            return res.status(403).json({ general: 'Wrong credentials, please try again'});
        }
        return res.status(500).json({error: err.code});
    });



})

exports.api = functions.region("europe-west1").https.onRequest(app);