import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirebaseuiAngularLibraryService} from 'firebaseui-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as firebase from 'firebase';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
userData: Object;
userId: string;


updateForm = new FormGroup({
  firstName: new FormControl(),
  lastName: new FormControl(),
  dob: new FormControl(),
  gender: new FormControl(),
  gender1: new FormControl(),
  gender2: new FormControl(),
  occupation: new FormControl(),
  favDrink: new FormControl(),
  relationshipStatus: new FormControl()

});


  constructor( private af: AngularFireAuth, private router: Router) {
    this.getProfileData();
  }

  ngOnInit() {


    // this.updateForm['firstName'].setValue(this.userData['firstName']);

  }


  logout = function(){
    this.af.auth.signOut().then(() => {
      console.log("Logging out");
     this.router.navigate(['/','login']);
  });
  }

  updateData = function(){
    var us = firebase.auth().currentUser['uid'];
    var db = firebase.firestore();
    db.collection("users").doc(us).set({

      uid: us,
      firstName: this.updateForm.value.firstName,
      lastName: this.updateForm.value.lastName,
      gender: this.gender,
      dob: this.updateForm.value.dob,
      occupation:this.updateForm.value.occupation,
      relationshipStatus: this.updateForm.value.relationshipStatus,
      favDrink: this.updateForm.value.favDrink


    }, {merge:true}).then(function(docRef) {
        console.log("Document written with ID: ", docRef);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });


  }


  getProfileData = function(){


  var that = this;


  var db = firebase.firestore();

  var us = firebase.auth().currentUser['uid'];
  console.log(us);


  var docRef = db.collection("users").doc(us);

  docRef.get().then(function(doc) {
      if (doc.exists) {

          if(doc.data().uid == us) that.userData= doc.data();
            console.log("Document data:", doc.data());


            //console.log("Document data dob:",that.userData);
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
  }).catch((e)=>console.log(e))

  }
  populateForm = function(){
    if(this.userData){
      this.updateForm.patchValue({firstName: this.userData['firstName']})
      this.updateForm.patchValue({lastName: this.userData['lastName']})
      this.updateForm.patchValue({dob: this.userData['dob']})
      this.updateForm.patchValue({occupation: this.userData['occupation']})
      this.updateForm.patchValue({favDrink: this.userData['favDrink']})
      this.updateForm.patchValue({relationshipStatus: this.userData['relationshipStatus']})
        this.updateForm.patchValue({gender: this.userData['gender']})
  }
}





}
