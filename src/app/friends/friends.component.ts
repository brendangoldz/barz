import { Component, OnInit, Directive, ViewContainerRef, OnDestroy,
  ViewChild,ComponentFactoryResolver,ComponentRef,
  ComponentFactory, Input } from '@angular/core';
import {Router} from '@angular/router';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirebaseuiAngularLibraryService} from 'firebaseui-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as firebase from 'firebase';





@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']

})



export class FriendsComponent implements OnInit {



  searchResults: any;
  searchFriendsForm = new FormGroup({
    searchField: new FormControl(''),
  });
  sub: any;
  user: any;
  requests: any = 0;
  @ViewChild('messagecontainer', { read: ViewContainerRef }) entry: ViewContainerRef;



  constructor(private fb:FirebaseuiAngularLibraryService, private af: AngularFireAuth, private router: Router) {

  }


  ngOnInit() {
    var that = this;
    var db = firebase.firestore();
    this.sub = this.af.authState.subscribe(user => {
          if (user) {
            var docRef = db.collection("users").doc(user.uid);
            docRef.get().then(function(doc) {
                if (doc.exists) {
                    if(doc.data().uid == user.uid) that.user= doc.data();
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
  }
  searchFriends = function(){
    console.log(this.searchFriendsForm.value.searchField);
    this.getProfileData(this.searchFriendsForm.value.searchField);
  }




  logout = function(){
    window.localStorage.clear();
    this.af.auth.signOut().then(() => {
      console.log("Logging out");
     this.router.navigate(['/','login']);
  });
  }

  getProfileData = function(searchText){
    var that = this;
    var db = firebase.firestore();
    var us = firebase.auth().currentUser['uid'];

    /*
    db.orderByChild('displayName').startAt(searchText).endAt(searchText+"\uf8ff").once("value")
    */
    db.collection("users").where("email", "==", searchText).orderBy("displayName")
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                if(doc.exists){
                  console.log(doc.data())
                  that.searchResults = doc.data();
                  console.log(that.searchResults);
                }

            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
  }
  requestFriend = function(){
    var db = firebase.firestore();
    var requestor = db.collection("users").doc(this.user.uid);
    var requestee = db.collection("users").doc(this.searchResults.uid);

    requestee.set({
      requests: [this.user.uid]
    }, {merge:true}).then(()=>console.log("Assigned Pending Request in Requestee"));

  }

}
