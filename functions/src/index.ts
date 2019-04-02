import * as functions from 'firebase-functions';
// import { environment } from '../environments/environment';
// import * as firebase from 'firebase';
import * as admin from 'firebase-admin';
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const serviceAccount = require("../environments/secret.json")
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://datbar-465c3.firebaseio.com"
});


export const dump_votes = functions.https.onRequest((message) => {
    console.log("This job is run every day!", message);
    const db = admin.firestore();
    const bars = db.collection('bars').get().then((snapshot)=>{
      snapshot.forEach((doc)=>{
        console.log(doc.id, " => ", doc.data());
        doc.data().votes = 0;
      })
    })
    console.log("Bars Cleared", bars);
    const users = db.collection('users').get().then((snapshot)=>{
      snapshot.forEach((doc)=>{
        console.log(doc.id, " => ", doc.data());
        doc.data().voted = "";
      })
    })
    console.log("Users Cleared", users);
  });
