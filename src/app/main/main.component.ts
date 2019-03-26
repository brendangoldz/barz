import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import {Router} from '@angular/router';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirebaseuiAngularLibraryService} from 'firebaseui-angular';
import {AuthService} from '../../assets/auth.service';


import * as firebase from 'firebase';
declare var $: any;
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MainComponent implements OnInit
{
  restaurants: Array<any> = new Array<any>();
  restaurant: any;
  voted: boolean;
  user: any;
  int: any;
  prevVoteInd: any;
  prevEl: any;
  varaible: Object;
  private color = "primary";
  private mode = "determinate";
  constructor(private af: AngularFireAuth, private router: Router, private auth_service: AuthService, private cd: ChangeDetectorRef)
  {}


  ngOnInit() {
    this.getBarData();
    var that = this;
    firebase.auth().onAuthStateChanged(user=>{
      if(user){
        var db = firebase.firestore();
        var docRef = db.collection("users").doc(user.uid);
        docRef.get().then(function(doc) {
            if (doc.exists) {
                if(doc.data().uid == user.uid) that.user= doc.data();
                  console.log("Document data:", doc.data());
                  for(var i=0;i<that.restaurants.length;i++){
                    if(that.restaurants[i].bid == that.user.voted){
                      console.log("found previous voted @ index", i," restaurant", that.restaurants[i].bid );

                      that.doClick(document.getElementById("bar"+i).firstChild);
                      return;
                    }
                  }
                  console.log(user);
                  //console.log("Document data dob:",that.userData);
              } else {
                  // doc.data() will be undefined in this case
                  console.log("No such document!");
              }
        }).catch((e)=>console.log(e))

      }
      else{
        this.logout();
      }
    })
    this.int = setInterval(()=>{

      this.cd.detectChanges();
    }, 1000)
  }
  getBarData = function(){
    var that = this;
    var arr = [];
    var db = firebase.firestore();
    var doc = db.collection("bars").get().then((snap)=>{
      console.log(snap);
      console.log("Snapshot", snap)
      snap.forEach((doc)=>{
        console.log(doc.id, " => ", doc.data());
        that.restaurants.push(doc.data());
      })

    });
  }
  ngOnDestroy(){
    clearInterval(this.int);
  }
  getUserData = function(){
    var us = firebase.auth().currentUser['uid'];
    var db = firebase.firestore();
    var docRef = db.collection("users").doc(this.userId);
    var that = this;
    docRef.get().then(function(doc) {
        if (doc.exists) {
            if(doc.data().uid == us) that.user= doc.data();
              console.log("Document data:", doc.data());
              //console.log("Document data dob:",that.userData);
          } else {
              // doc.data() will be undefined in this case
              console.log("No such document!");
          }
    }).catch((e)=>console.log(e))
  }
  vote = function(i){
    console.log('Tapped: ', $(event.target));
    if(this.prevEl) this.prevEl.css("background-position", "right bottom");
    $(event.target).css("background-position", "left bottom");
    this.prevEl = $(event.target);
    if(this.voted){
      this.restaurants[this.prevVoteInd].votes--;
      this.restaurants[i].votes++;

      var db = firebase.firestore();
      var doc = db.collection("bars").get().then((snap)=>{
        var votes = snap.docs[this.prevVoteInd].data().votes;
        var us = firebase.auth().currentUser['uid'];
        db.collection("users").doc(us).set({
          voted: snap.docs[this.prevVoteInd].id
        }, {merge:true}).then(function(docRef) {
            console.log("Document written with ID: ", docRef);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
        db.collection("bars").doc(snap.docs[i].id).set({
          votes: votes++
        }, {merge:true})
        if(votes>0){
          votes = votes - 1;
          db.collection("bars").doc(snap.docs[this.prevVoteInd].id).set({
            votes: votes
          }, {merge:true})
        }
        else if(votes<=0){
          votes = 0;
          db.collection("bars").doc(snap.docs[this.prevVoteInd].id).set({
            votes: votes
          }, {merge:true})
        }


      });
      this.prevVoteInd = i;

    }
    else{
      this.voted = true;
      this.restaurants[i].votes++;
      this.prevVoteInd = i;
      var that = this;
      var db = firebase.firestore();
          var us = firebase.auth().currentUser['uid'];
      var doc = db.collection("bars").get().then((snap)=>{
        db.collection("users").doc(us).set({
          voted: snap.docs[this.prevVoteInd].id
        }, {merge:true}).then(function(docRef) {
            console.log("Document written with ID: ", docRef);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
        var votes = snap.docs[i].data().votes;
        votes =+ 1;
        db.collection("bars").doc(snap.docs[i].id).set({
          votes: votes
        }, {merge:true})

      });
    }

  }
  clearVotes = function(){
    if(this.voted) this.voted = false;
    var db = firebase.firestore();
    var doc = db.collection("bars").get().then((snap)=>{
      var votes = snap.docs[this.prevVoteInd].data().votes;
      console.log("Current Amount of Votes:", votes);
      if(votes>0){
        this.restaurants[this.prevVoteInd].votes--;
        votes = votes - 1;
        db.collection("bars").doc(snap.docs[this.prevVoteInd].id).set({
          votes: votes
        }, {merge:true})
      }
      else if(votes<=0){
        this.restaurants[this.prevVoteInd].votes = 0;
        votes = 0;
        db.collection("bars").doc(snap.docs[this.prevVoteInd].id).set({
          votes: votes
        }, {merge:true})
      }
      if(this.prevEl) this.prevEl.css("background-position", "right bottom");
      // $(event.target).css("background-position", "left bottom");
      if($(event.target)) this.prevEl = $(event.target);
      this.prevVoteInd = 0;
    });
  }
  logout = function(){
    this.af.auth.signOut().then(() => {
      console.log("Logging out");
     this.router.navigate(['/','login']);
  });
  }
  info = function(i){
    console.log("Getting Info For: ", this.restaurants[i]);
    this.restaurant = this.restaurants[i];
  }
   doClick(n)
   {
    let e = new MouseEvent('click',{
      bubbles: true,
      cancelable:true,
      view: window
    })
    n.dispatchEvent(e);
  }
}
