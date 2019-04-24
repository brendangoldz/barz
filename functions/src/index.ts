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
    const bars = db.collection('bars');
    const users = db.collection('users')
    // tslint:disable-next-line:no-unsafe-any
    bars.get().then((snapshot)=>{
      snapshot.forEach((doc)=>{
        const demographics = doc.data().demographics;
        demographics.male = 0;
        demographics.female = 0;
        demographics.single = 0;
        demographics.taken = 0;
        // console.log(doc.id, " => ", doc.data());
        // tslint:disable-next-line:no-unsafe-any
        bars.doc(doc.data().bid).set({
          demographics: demographics,
          votes: 0,
          avg_age: 0
        }, {merge: true}).then(()=>console.log("Dumped ", doc.id)).catch((err)=>console.log(err))
      })
    }).catch((err)=>console.log(err));
    // tslint:disable-next-line:no-unsafe-any
    users.get().then((snapshot)=>{
      snapshot.forEach((doc)=>{
        // console.log(doc.id, " => ", doc.data());
        // tslint:disable-next-line:no-unsafe-any
        users.doc(doc.id).set({
          voted: ""
        }, {merge: true}).then(()=>console.log("Dumped ", doc.id)).catch((err)=>console.log(err))
      })
    }).catch((err)=>console.log(err));
    return true;
  });
