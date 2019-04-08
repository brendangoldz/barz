import { Component, OnInit, Directive, ViewContainerRef, OnDestroy,
  ViewChild,ComponentFactoryResolver,ComponentRef,
  ComponentFactory, Input } from '@angular/core';
import {Router} from '@angular/router';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirebaseuiAngularLibraryService} from 'firebaseui-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as firebase from 'firebase';
declare var $: any;

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
  reqs: any = [];
  friends: any = [];
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
            if(!user.emailVerified){
              this.router.navigate(['','verify']);
            }
            var docRef = db.collection("users").doc(user.uid);
            docRef.get().then(function(doc) {
                if (doc.exists) {
                    if(doc.data().uid == user.uid) that.user= doc.data();
                      console.log("Document data:", doc.data());
                      //console.log("Document data dob:",that.userData)
                      if(doc.data().requests){
                        doc.data().requests.forEach((x)=>{
                          that.reqs.push(x);
                          that.requests++;
                        })
                        if(that.requests>0) that.reqs = that.getData(that.reqs);
                        console.log("Requests Array", that.reqs)
                      }
                      if(doc.data().friends){
                        doc.data().friends.forEach((x)=>{
                          console.log(x);
                          that.friends.push(x);
                        })
                        if(that.friends.length>0) that.friends = that.getData(that.friends);
                        console.log("Friends Array", that.friends)
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
    this.query(this.searchFriendsForm.value.searchField);
  }

  getData = function(arr){
    console.log(this.reqs);
    let db = firebase.firestore();
    var temp = [];
    arr.forEach((x)=>{
      db.collection("users").doc(x).get().then((val)=>{
        temp.push(val.data());
      })
    });
    return temp;
  }
  logout = function(){
    window.localStorage.clear();
    this.af.auth.signOut().then(() => {
      console.log("Logging out");
     this.router.navigate(['/','login']);
  });
  }
  query = function(searchText){
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
    if(this.user.uid != this.searchResults.uid){
      requestee.set({
        requests: [this.user.uid]
      }, {merge:true}).then(()=>console.log("Assigned Pending Request in Requestee"));
    }
    else{
      $('.request_btn').attr('disabled', 'disabled');
      console.log("Cant Request Self");
    }
  }
  confirmRequest = function(i){
    var that = this;
    var db = firebase.firestore();
    var uid = this.user.uid;
    var user = db.collection("users").doc(uid);
    var friend_id;
    let reqs = [];
    let friends = [];
    user.get().then((val)=>{
      reqs = val.data().requests
      console.log(reqs)
      friends = val.data().friends;


      friend_id = reqs[i];
      friends.push(reqs[i]);
      console.log("Friends array of current user", friends)
      reqs.splice(i, 1);
      that.reqs = reqs;
      console.log("Request array after splice", that.reqs)
      user.set({
        requests: reqs,
        friends: friends
      }, {merge:true}).then(()=>{
        console.log("Successfully added friend")
      });

      console.log("Getting friend of id ", friend_id)
      var friend = db.collection("users").doc(friend_id);
      friend.get().then((val2)=>{
        let friends2 = val2.data().friends || [];
        friends2.push(uid);
        console.log("Friends array ", friends2)
        friend.set({
          friends: friends2
        }, {merge:true}).then(()=>{
          friends = [];
          reqs = [];
          this.refresh();
          console.log("Successfully added friend")
        });
      });
   });


  }
  declineRequest = function(i){
    var db = firebase.firestore();
    var user = db.collection("users").doc(this.user.uid);
    let reqs = [];
    user.get().then((val)=>{
      console.log("index ", i)
      reqs = val.data().requests
      console.log("Before decline request", reqs);
      reqs = reqs.splice(i, i);
      console.log("After decline request", reqs)
      this.reqs = reqs;
      user.set({
        requests: reqs
      }, {merge: true}).then(()=>{
        this.refresh();
        console.log("Decline friend Request")
      })
    });
  }
  refresh = function(){
    var that = this;
    this.reqs = [];
    this.requests = 0;
    var db = firebase.firestore();
    var docRef = db.collection("users").doc(this.user.uid);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            if(doc.data().uid == that.user.uid) that.user= doc.data();
              console.log("Document data:", doc.data());
              //console.log("Document data dob:",that.userData)
              if(doc.data().requests){
                doc.data().requests.forEach((x)=>{
                  that.reqs.push(x);
                  that.requests++;
                })
                if(that.requests>0) that.reqs = that.getData(that.reqs);
                console.log("Requests Array", that.reqs)
              }
              if(doc.data().friends){
                doc.data().friends.forEach((x)=>{
                  console.log(x);
                  that.friends.push(x);
                })
                if(that.friends.length>0) that.friends = that.getData(that.friends);
                console.log("Friends Array", that.friends)
              }
          } else {
              // doc.data() will be undefined in this case
              console.log("No such document!");
          }
    }).catch((e)=>console.log(e))
  }
}
