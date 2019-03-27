import { Component,  ChangeDetectionStrategy,
         ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase/app';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as firebase from 'firebase';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ProfileComponent implements OnInit {
userData: any;
userId: string;
pictureUrl: string;
fileList: any;
int: any;
element: HTMLImageElement; /* Defining element */
updateForm = new FormGroup({
  firstName: new FormControl(),
  lastName: new FormControl(),
  bio: new FormControl(),
  dob: new FormControl(),
  gender: new FormControl(),
  occupation: new FormControl(),
  favDrink: new FormControl(),
  relationshipStatus: new FormControl(),
  profile_pic: new FormControl()
});


  constructor( private af: AngularFireAuth, private router: Router, private cd: ChangeDetectorRef) {

  }

  ngOnInit() {
  var that = this;
  this.af.auth.onAuthStateChanged(user=>{
    if(user){
      console.log(user);
      that.userId = user.uid;
      that.getProfileData();
    }
    else{
      this.logout();
    }
  })
  const inputElement = (<HTMLInputElement>document.getElementById('profile_pic'));
  inputElement.addEventListener("change", function(files){
      that.fileList = this.files; /* now you can work with the file list */
      // that.uploadPicture(fileList[0])
    }, false);
    this.int = setInterval(()=>{
      this.cd.detectChanges();
    }, 1000)
  }
  ngOnDestroy(){
    clearInterval(this.int);
  }

  logout = function(){
    this.af.auth.signOut().then(() => {
      console.log("Logging out");
     this.router.navigate(['/','login']);
  });
  }
  updateData = function(){
    var us = firebase.auth().currentUser['uid'];

    if(this.fileList != undefined){
      var pic_name = "profile."+(this.fileList[0].type).toString().split('/')[1]
    var that = this;
    console.log(pic_name)
    var storageRef = firebase.storage().ref(this.userId + '/profilePicture/' +  pic_name);
    storageRef.put(this.fileList[0]).then((snap)=>{
       snap.ref.getDownloadURL().then((url)=>{
        console.log("File available at", url);
        that.pictureUrl = url;
        var db = firebase.firestore();
        db.collection("users").doc(us).set({
          uid: us,
          firstName: this.updateForm.value.firstName,
          lastName: this.updateForm.value.lastName,
          gender: this.updateForm.value.gender,
          dob: this.updateForm.value.dob,
          occupation:this.updateForm.value.occupation,
          relationshipStatus: this.updateForm.value.relationshipStatus,
          favDrink: this.updateForm.value.favDrink,
          photoURL: that.pictureUrl,
          bio: this.updateForm.value.bio
        }, {merge:true}).then(function(docRef) {
            console.log("Document written with ID: ", docRef);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
      });
    });
    }
    else{
      var db = firebase.firestore();
      db.collection("users").doc(this.userId).set({
        uid: us,
        firstName: this.updateForm.value.firstName,
        lastName: this.updateForm.value.lastName,
        gender: this.updateForm.value.gender,
        dob: this.updateForm.value.dob,
        occupation:this.updateForm.value.occupation,
        relationshipStatus: this.updateForm.value.relationshipStatus,
        favDrink: this.updateForm.value.favDrink,
        bio: this.updateForm.value.bio
      }, {merge:true}).then(function(docRef) {
          console.log("Document written with ID: ", docRef);
      })
      .catch(function(error) {
          console.error("Error adding document: ", error);
      });
    }
    this.getProfileData();
  }


  getProfileData = function(){
    var that = this;
    var db = firebase.firestore();
    var us = firebase.auth().currentUser['uid'];

    // this.userId = us;
    console.log(us);
    var docRef = db.collection("users").doc(this.userId);
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
        this.updateForm.patchValue({bio: this.userData['bio']})
        this.updateForm.patchValue({dob: this.userData['dob']})
        this.updateForm.patchValue({occupation: this.userData['occupation']})
        this.updateForm.patchValue({favDrink: this.userData['favDrink']})
        this.updateForm.patchValue({relationshipStatus: this.userData['relationshipStatus']})
        this.updateForm.patchValue({gender: this.userData['gender']})
      }
  }
}
