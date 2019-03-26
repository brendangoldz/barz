import { Injectable, NgZone } from '@angular/core';
import { User } from "./user";

import { auth } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import {Observable} from 'rxjs';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  userData: any; // Save logged in user data
  collection: AngularFirestoreCollection<any[]>;

  constructor(
    public afs: AngularFirestore,   // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    /* Saving user data in localstorage when
    logged in and setting up null when logged out */
    this.afAuth.auth.onAuthStateChanged((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    })

  }

  // Sign in with email/password
  SignIn(email, password) {

    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['main']);
        });
        //this.SetUserData(result.user); //result.user
      }).catch((error) => {
        window.alert(error.message)
      })
  }

  // Sign up with email/password
  SignUp(email, password, firstName, lastName, dob, gender) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((result) => {
        /* Call the SendVerificaitonMail() function when new user sign
        up and returns promise */
        console.log(result)
        this.SendVerificationMail();
        this.SetUserData(email, firstName, lastName, dob, gender); //result.user
      }).catch((error) => {
        window.alert(error.message)
      })
  }

  // Send email verfificaiton when new user sign up
  SendVerificationMail() {
    return this.afAuth.auth.currentUser.sendEmailVerification()
    .then(() => {
      // this.router.navigate(['verify-email-address']);
      console.log("Verify Email");
    })
  }

  // Reset Forggot password
  ForgotPassword(passwordResetEmail) {
    return this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail)
    .then(() => {
      window.alert('Password reset email sent, check your inbox.');
    }).catch((error) => {
      window.alert(error)
    })
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null && user.emailVerified !== false) ? true : false;
  }

  // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());

  }

  // Auth logic to run auth providers
  AuthLogin(provider) {

    return this.afAuth.auth.signInWithPopup(provider)
    .then((result) => {

       this.ngZone.run(() => {
          this.router.navigate(['main']);
        })
      //this.SetUserData(result.user);
    }).catch((error) => {
      window.alert(error)
    })
  }

  /* Setting up user data when sign in with username/password,
  sign up with username/password and sign in with social auth
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(email, firstName, lastName, dob, gender) { //user

  var us = firebase.auth().currentUser['uid'];
  var db = firebase.firestore();
  db.collection("users").doc(us).set({

    uid: us,
    firstName: firstName,
    lastName: lastName,
    gender: gender,
    dob: dob,
    email: email,
    occupation:'',
    relationshipStatus: '',
    favDrink: '',
    picture: ''


})
.then(function(docRef) {
    console.log("Document written with ID: ", docRef);
})
.catch(function(error) {
    console.error("Error adding document: ", error);
});
/*
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData: User = {

      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      email: user.email,
      emailVerified: user.emailVerified  */
/*
      fName: user.fName,
      lName:user.lName,
      dob:user.dob,
      sex:user.sex,
      maritalStatus:user.maritalStatus,
      favDrink: user.favDrink,
      occupation: user.occupation,
    }

    return userRef.set(userData, {
      merge: true
    })
      */
  }
  // Sign out
  SignOut() {
    return this.afAuth.auth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['login']);
    })
  }

}
