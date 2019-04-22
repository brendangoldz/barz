import { Component,  ChangeDetectionStrategy,
         ChangeDetectorRef, OnInit, OnDestroy, NgZone } from '@angular/core';
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
fileList: any=[];
int: any;
requests: any = 0;
sub: any;
element: HTMLImageElement; /* Defining element */
updateForm = new FormGroup({
  firstName: new FormControl(),
  lastName: new FormControl(),
  bio: new FormControl(),
  dob: new FormControl(),
  //age: number,
  gender: new FormControl(),
  occupation: new FormControl(),
  favDrink: new FormControl(),
  relationshipStatus: new FormControl(),
  profile_pic: new FormControl()
});


  constructor(private zone: NgZone, private af: AngularFireAuth, private router: Router, private cd: ChangeDetectorRef) {

  }

  ngOnInit() {
  var that = this;
  var db = firebase.firestore();
  /**
   * [subscribe description]
   * @param  user=>{if(user [description]
   * @return                [description]
   */

  this.sub = this.af.authState.subscribe(user => {
        if (user) {
          if(!user.emailVerified){
            this.zone.run(()=>{
              this.router.navigate(['verify']);
            })
          }
          var docRef = db.collection("users").doc(user.uid);
          docRef.get().then(function(doc) {
              if (doc.exists) {
                  if(doc.data().uid == user.uid) that.userData= doc.data();
                    console.log("Document data:", doc.data());
                    //console.log("Document data dob:",that.userData)
                    if(doc.data().requests){
                      doc.data().requests.forEach((x)=>{
                        that.requests++;
                      })
                      console.log(that.requests);
                    }
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
          }).catch((e)=>console.log(e))
        } else {
          this.logout();
        }
   });

  }
  ngOnDestroy(){
    this.sub.unsubscribe();
    clearInterval(this.int);
  }
  /**
   * [function description]
   * @return [description]
   */
  logout = function(){
    window.localStorage.clear();
    this.af.auth.signOut().then(() => {
      console.log("Logging out");
      this.zone.run(()=>{
        this.router.navigate(['/', 'login']);
      });
  });
  }
  /**
   * [function description]
   * @return [description]
   */
  updateData = function(){
    var us = this.userData.uid || firebase.auth().currentUser['uid'];
    // console.log("Updating Profile w/ File list ", this.fileList)
    if(this.fileList[0] != undefined){
    var pic_name = "profile."+(this.fileList[0].type).toString().split('/')[1]
    var that = this;
    console.log(pic_name)
    console.log("Uploading Picture ", pic_name, " for user ", us);
    var storageRef = firebase.storage().ref(us + '/profilePicture/' +  pic_name);
    storageRef.put(this.fileList[0]).then((snap)=>{
       snap.ref.getDownloadURL().then((url)=>{
        console.log("File available at", url);
        that.pictureUrl = url;
        var db = firebase.firestore();
        console.log("Updating user", us);
        db.collection("users").doc(us).set({
          uid: us,
          firstName: this.updateForm.value.firstName || "",
          lastName: this.updateForm.value.lastName || "",
          gender: this.updateForm.value.gender || "",
          dob: this.updateForm.value.dob || "",
          occupation:this.updateForm.value.occupation || "",
          relationshipStatus: this.updateForm.value.relationshipStatus || "",
          favDrink: this.updateForm.value.favDrink || "",
          bio: this.updateForm.value.bio || "",
          photoURL: that.pictureUrl
        }, {merge:true}).then((docRef)=>{
          that.getProfileData();
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
      db.collection("users").doc(us).set({
        uid: us,
        firstName: this.updateForm.value.firstName || "",
        lastName: this.updateForm.value.lastName || "",
        gender: this.updateForm.value.gender || "",
        dob: this.updateForm.value.dob || "",
        occupation:this.updateForm.value.occupation || "",
        relationshipStatus: this.updateForm.value.relationshipStatus || "",
        favDrink: this.updateForm.value.favDrink || "",
        bio: this.updateForm.value.bio || ""
      }, {merge:true}).then(function(docRef) {
        that.getProfileData();
          console.log("Document written with ID: ", docRef);
      })
      .catch(function(error) {
          console.error("Error adding document: ", error);
      });
    }

  }

  /**
   * [function description]
   * @return [description]
   */
  getProfileData = function(){
    var that = this;
    var db = firebase.firestore();
    var us = this.userData.uid || firebase.auth().currentUser['uid'];

    // this.userId = us;
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
  /**
   * [function description]
   * @return [description]
   */
  populateForm = function(){
    var that = this;
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
    const inputElement = (<HTMLInputElement>document.getElementById('profile_pic'));
    inputElement.addEventListener("change", function(){
        that.fileList = this.files; /* now you can work with the file list */
        console.log("Files in change ", this.files)
        // that.uploadPicture(fileList[0])
      }, false);

  }
}
