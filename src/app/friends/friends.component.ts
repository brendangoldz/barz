import { Component, OnInit, Directive, ViewContainerRef,
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


  @ViewChild('messagecontainer', { read: ViewContainerRef }) entry: ViewContainerRef;



  constructor(private fb:FirebaseuiAngularLibraryService, private af: AngularFireAuth, private router: Router) {

  }


  ngOnInit() {
  }
  searchFriends = function(){
    console.log(this.searchFriendsForm.value.searchField);

    this.getProfileData(this.searchFriendsForm.value.searchField);


  }




  logout = function(){
    this.af.auth.signOut().then(() => {
      console.log("Logging out");
     this.router.navigate(['/','login']);
  });
  }

  getProfileData = function(searchText){
    var that = this;
    var db = firebase.firestore();
    var us = firebase.auth().currentUser['uid'];


    db.collection("users").where("displayName", "array-contains", searchText).orderBy("displayName")
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                if(doc.exists){
                  console.log(doc.data())
                  that.searchResults.push(doc.data())
                  console.log(that.searchResults);
                }

            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });


  }


}
