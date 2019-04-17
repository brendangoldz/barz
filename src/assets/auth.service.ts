import { Injectable, NgZone } from '@angular/core';
import { User } from "./user";

import { auth } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
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
    public zone: NgZone // zone service to remove outside scope warning
  ) {
    /* Saving user data in localstorage when
    logged in and setting up null when logged out */
    // this.afAuth.auth.onAuthStateChanged((user) => {
    //   if (user) {
    //     this.userData = user;
    //     // localStorage.setItem('user', JSON.stringify(this.userData));
    //     // JSON.parse(localStorage.getItem('user'));
    //   } else {
    //     localStorage.setItem('user', null);
    //     // JSON.parse(localStorage.getItem('user'));
    //   }
    // })

  }

  // Sign in with email/password
  SignIn(email, password) {

    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.zone.run(() => {
          this.router.navigate(['main']);
        });
        //this.SetUserData(result.user); //result.user
      }).catch((error) => {
        window.alert(error.message)
      })
  }

  // Sign up with email/password
  SignUp(firstName, lastName, email, password) {
    // console.log("Auth Signup, ", firstName, " ", lastName);
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((result) => {
        /* Call the SendVerificaitonMail() function when new user sign
        up and returns promise */
        console.log(result);
        this.SetUserData(firstName, lastName, email); //result.user

        this.SendVerificationMail();

      }).catch((error) => {
        window.alert(error.message)
      })
  }

  // Send email verfificaiton when new user sign up
  SendVerificationMail() {
    return this.afAuth.auth.currentUser.sendEmailVerification()
      .then(() => {
        this.zone.run(()=>{
          this.router.navigate(['/', 'verify']);
        })
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
  // get isLoggedIn(): boolean {
  //   const user = JSON.parse(localStorage.getItem('user'));
  //   return (user !== null && user.emailVerified !== false) ? true : false;
  // }

  // Sign in with Google
  // GoogleAuth() {
  //   return this.AuthLogin(new auth.GoogleAuthProvider());
  //
  // }

  // Auth logic to run auth providers
  AuthLogin(provider) {

    return this.afAuth.auth.signInWithPopup(provider)
      .then((result) => {

        this.zone.run(() => {
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
  SetUserData(firstName, lastName, email) { //user

    var us = firebase.auth().currentUser['uid'];
    var db = firebase.firestore();
    db.collection("users").doc(us).set({
      uid: us,
      email: email,
      firstName: firstName || "",
      lastName: lastName || "",
      gender: "",
      dob: "",
      occupation: "",
      relationshipStatus: "",
      favDrink: "",
      bio: ""
    })
      .then(function(docRef) {
        console.log("Document written with ID: ", docRef);
      })
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
  }
  // Sign out
  SignOut() {
    return this.afAuth.auth.signOut().then(() => {
      localStorage.removeItem('user');
      this.zone.run(()=>{
        this.router.navigate(['/', 'login']);
      });
    })
  }

}
