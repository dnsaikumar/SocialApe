const { admin, db } = require('../util/admin');
const config = require('../util/config');
const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators')

exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    const { valid, errors } = validateSignupData(newUser);

    if (!valid) return res.status(400).json(errors);
    const image = 'image.png'

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
                imgUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${image}?alt=media`,
                userId
            };

            db.doc(`/users/${newUser.handle}`).set(userCredentials)
                .then((data) => {
                    return res.status(201).json({ token });
                })
            //return res.status(201).json({ token })
        }).catch(err => {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
                res.status(400).json({ email: "Email already in use" });
            }
            else {
                return res.status(500).json({ error: err.code });
            }
        });
}

exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    const { valid, errors } = validateLoginData(user);

    if (!valid) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password).then(data => {
        return data.user.getIdToken();
    })
        .then(token => {
            return res.json({ token })
        })
        .catch(err => {
            console.log(err);
            if (err.code === 'auth/wrong-password') {
                return res.status(403).json({ general: 'Wrong credentials, please try again' });
            }
            return res.status(500).json({ error: err.code });
        });

}
//add user details
exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.handle}`).update(userDetails)
    .then(() =>{
        return res.json({message: "Details added successfully"})
        
    }).catch(err =>{
        return res.status(400).json({error: err.code})
    });

};
//Get own user details
exports.getAuthenticatedUser = (req,res) =>{
    let userData = {};
    db.doc(`/users/${req.user.handle}`).get()
        .then(doc =>{
            if(doc.exists){
                userData.credentials = doc.data();
                return db.collection('likes').where('userHandle', '==', req.user.handle).get()                
            }
        }).then(data => {
            userData.likes = [];
            data.forEach(doc =>{
                userData.likes.push(doc.data());
            });
            return res.json(userData);
        }).catch(err =>{
            console.error(err);
            return res.status(500).json({error: err.code})
        })
}

//Upload a profile image for user
exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: req.headers });
    let imageFileName;
    let imageToBeUploaded = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== "image/jpeg" && mimetype !== "imahe/png") {
            return res.status(400).json({ error: "Wrong File Type submitted" });
        }
        console.log(fieldname);
        console.log(filename);
        console.log(mimetype);
        //image.png
        const imageExtension = filename.split('.')[filename.split('.').length - 1];

        imageFileName = `${Math.round(Math.random() * 100000000000)}.${imageExtension}`;

        const filePath = path.join(os.tmpdir(), imageFileName);

        imageToBeUploaded = { filePath, mimetype }

        file.pipe(fs.createWriteStream(filePath));
    });
    busboy.on('finish', () => {
        admin.storage().bucket().upload(imageToBeUploaded.filePath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        }).then(() => {
            const imgUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
            return db.doc(`/users/${req.user.handle}`).update({ imgUrl });
        }).then(() => {
            return res.json({ message: "Image uploaded successfully" })
        }).catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
    });
    busboy.end(req.rawBody);
}