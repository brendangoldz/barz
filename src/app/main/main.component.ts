import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import {Router} from '@angular/router';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirebaseuiAngularLibraryService} from 'firebaseui-angular';
import {AuthService} from '../../assets/auth.service';


import * as firebase from 'firebase';
declare var $: any;
declare var google: any;
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
  currentLat: any;
  currentLong: any;
  marker: any;
  location: any;
  loaded: boolean;
  map: any;
  radius = 5; //MILES
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
    this.map = new google.maps.Map(document.getElementById('map'), {
         center: this.marker,
         zoom: 5,
       });

   if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition((position) => {
       this.showPosition(position);
     });
   } else {
     alert("Geolocation is not supported by this browser.");
   }
    var that = this;
    var db = firebase.firestore();
    firebase.auth().onAuthStateChanged(user=>{
      if(user){
        var docRef = db.collection("users").doc(user.uid);
        docRef.get().then(function(doc) {
            if (doc.exists) {
                if(doc.data().uid == user.uid) that.user= doc.data();
                  console.log("Document data:", doc.data());
                  console.log(user);

                  //console.log("Document data dob:",that.userData);
              } else {
                  // doc.data() will be undefined in this case
                  console.log("No such document!");
              }
        }).catch((e)=>console.log(e))
        // that.getUserData(user);
      }
      else{
        this.logout();
      }
    })
    var that = this;
    // var arr = [];
    var doc = db.collection("bars").orderBy("votes", "desc").onSnapshot((snap)=>{
      this.loaded = false;
      setTimeout(()=>{
        that.restaurants = [];
        snap.forEach((doc)=>{
          // console.log(doc.id, " => ", doc.data());
          that.restaurants.push(doc.data());
        })
        function filter(val){
          var circleRadius = 2 * 1609.344;
          // if(!that.location || that.location == undefined){
          //   that.findMe();
          //   console.log(that.location)
          // }
           var circle = new google.maps.Circle({
                 clickable: false,
                 radius: circleRadius,
                 center: that.location
             });
             //CIRCLE CREATED FOR RADIUS OF SEARCH
             // console.log("myLocation", that.location);
          var pos = new google.maps.LatLng(parseFloat(val.coords.latitude), parseFloat(val.coords.longitude));
          var pt2 = new google.maps.Marker({ position: pos,  map: that.map});

          var bounds = circle.getBounds();
          //CHECK IF REST COORDS INSIDE BOUNDS OF CIRCLE

            if (bounds.contains(pt2.getPosition())){
              return true;
            }
            return false;
          

        }
        var temp = that.restaurants.filter(filter);
        that.restaurants = temp;
        if(that.restaurants.length>2 && that.user){
          that.loaded = true;
         that.checkVoted();
        }
      }, 250)
      // else that.findMe() && that.getUserData()

    });

    this.int = setInterval(()=>{
      this.cd.detectChanges();
    }, 1000)
  }
  ngOnDestroy(){
    clearInterval(this.int);
  }

showPosition = function(position) {
    this.currentLat = position.coords.latitude;
    this.currentLong = position.coords.longitude;

    this.location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    if (!this.marker) {
      this.marker = new google.maps.Marker({
        map: this.map,
        position: this.location
      });
    }
    else {
      this.marker.setPosition(this.location);
    }
  }

  vote = function(i){
    console.log('Tapped: ', $(event.target));
    if(this.prevEl) this.prevEl.css("background-position", "right bottom");
    $(event.target).css("background-position", "left bottom");
    this.prevEl = $(event.target);
    var bid = this.restaurants[i].bid;
    if(this.voted){
      this.restaurants[this.prevVoteInd].votes--;
      this.restaurants[i].votes++;

      var db = firebase.firestore();
      var doc = db.collection("bars").get().then((snap)=>{
        // console.log(snap.docs[i].data());
        var votes = snap.docs[this.prevVoteInd].data().votes;
        var us = firebase.auth().currentUser['uid'];
        db.collection("users").doc(us).set({
          voted: bid
        }, {merge:true}).then(function(docRef) {
            console.log("Document written with ID: ", docRef);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
        db.collection("bars").doc(bid).set({
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

      var that = this;
      var db = firebase.firestore();
          var us = firebase.auth().currentUser['uid'];
      var doc = db.collection("bars").get().then((snap)=>{
        db.collection("users").doc(us).set({
          voted: bid
        }, {merge:true}).then(function(docRef) {
            console.log("Document written with ID: ", docRef);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
        var votes = snap.docs[i].data().votes;
        votes =+ 1;
        db.collection("bars").doc(bid).set({
          votes: votes
        }, {merge:true})

      });
        this.prevVoteInd = i;
    }

  }
  clearVotes = function(){
    if(this.voted) this.voted = false;
    var db = firebase.firestore();
        var us = firebase.auth().currentUser['uid'];
    db.collection("users").doc(us).set({
      voted: ""
    }, {merge:true}).then(function(docRef) {
        console.log("Document written with ID: ", docRef);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
    var doc = db.collection("bars").get().then((snap)=>{
      var votes = snap.docs[this.prevVoteInd].data().votes;
      console.log("Current Amount of Votes:", votes);
      votes--;
      if(votes>=0){
        this.restaurants[this.prevVoteInd].votes--;
        db.collection("bars").doc(snap.docs[this.prevVoteInd].id).set({
          votes: votes
        }, {merge:true})
      }
      else if(votes<0){
        this.restaurants[this.prevVoteInd].votes = 0;
        votes = 0;
        db.collection("bars").doc(snap.docs[this.prevVoteInd].id).set({
          votes: votes
        }, {merge:true})
      }
      if(this.prevEl) this.prevEl.css("background-position", "right bottom");
      // $(event.target).css("background-position", "left bottom");
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
  checkVoted = function(){
    var user = this.user;
    console.log(user);
    var that = this;
    var db = firebase.firestore();
    var docRef = db.collection("users").doc(user.uid);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            if(doc.data().uid == user.uid) that.user= doc.data();
              console.log("Document data:", doc.data());
              if(user.voted!=""){
                for(var i=0;i<that.restaurants.length;i++){
                  console.log("BAR ID ", that.restaurants[i].bid, " @ index ", i ," User Voted: ", that.user.voted);
                  if(that.restaurants[i].bid == that.user.voted){
                    console.log("found previous voted @ index", i," restaurant", that.restaurants[i].bid );
                    // that.doClick(document.getElementById("bar"+i));
                      that.doClick(document.getElementById("bar"+i).firstChild);
                    break;
                  }
                }
              }
              else{
                console.log("User Did Not Vote ", that.user.voted)
                return;
              }

              console.log(user);
              //console.log("Document data dob:",that.userData);
          } else {
              // doc.data() will be undefined in this case
              console.log("No such document!");
          }
    }).catch((e)=>console.log(e))
  }


   doClick(n)
   {
    let e = new MouseEvent('click',{
      bubbles: true,
      cancelable:false,
      view: window
    })
    n.dispatchEvent(e);
  }

}
