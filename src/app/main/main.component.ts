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
  {

  }


  ngOnInit() {
    window.addEventListener('click', function (evt) {
      if (evt.detail === 3) {
        console.log("triple click")
        event.preventDefault();
        event.stopImmediatePropagation();
          return false;
      }
    });
    var that = this;
    this.map = new google.maps.Map(document.getElementById('map'), {
         center: this.marker,
         zoom: 5,
       });
   if (navigator.geolocation) {
     var options = {
       enableHighAccuracy: true,
       timeout: 750,
       maximumAge: 216000
     };
     navigator.geolocation.getCurrentPosition((pos)=>{
       var crd = pos.coords;
       that.showPosition(pos);
       console.log('Your current position is:');
       console.log(`Latitude : ${crd.latitude}`);
       console.log(`Longitude: ${crd.longitude}`);
       console.log(`More or less ${crd.accuracy} meters.`);
     }, (err)=>{
       console.warn(`ERROR(${err.code}): ${err.message}`);
       function manual(position){
         that.location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

         if (!that.marker) {
           that.marker = new google.maps.Marker({
             map: that.map,
             position: that.location
           });
         }
         else {
           that.marker.setPosition(that.location);
         }
       }
       const watcher = navigator.geolocation.watchPosition(manual);
       that.location =
       setTimeout(()=>{
         navigator.geolocation.clearWatch(watcher);
       }, 20000)
     }, options);


   } else {
     alert("Geolocation is not supported by this browser.");
   }

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

    var doc = db.collection("bars").onSnapshot((snap)=>{
      // this.loaded = false;
      setTimeout(()=>{
        that.restaurants = [];
        snap.forEach((doc)=>{
          // console.log(doc.id, " => ", doc.data());
          that.restaurants.push(doc.data());
        })
        function filter(val){
          var circleRadius = 2 * 1609.344;
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
            else{
              return false;
            }
        }
        var temp = that.restaurants.filter(filter);
        that.restaurants = temp;
        if(that.restaurants.length>0 && that.user){
          that.loaded = true;
         that.checkVoted();
        }
      }, 500)

    });

    this.int = setInterval(()=>{
      this.cd.detectChanges();
    }, 1000)
  }
  ngOnDestroy(){
    clearInterval(this.int);
  }

showPosition = function(position) {
  console.log("Position after navigator found ", position)
    var currentLat = position.coords.latitude;
    var currentLong = position.coords.longitude;

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


    var bid = this.restaurants[i].bid;
    var db = firebase.firestore();
    var us = firebase.auth().currentUser['uid'] || this.user.uid;
    var new_bar = bid
    var prev_bar;
    if(this.user.voted != "") prev_bar = this.user.voted;

    if(this.prevEl) this.prevEl.css("background-position", "right bottom");
    $(event.target).css("background-position", "left bottom");

    //SET BID ONTO USER ATTR 'voted' ALWAYS
    db.collection("users").doc(us).set({
      voted: bid
    }, {merge:true}).then(function(docRef) {
        console.log("Document written with ID: ", docRef);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });

    if(this.voted && bid != prev_bar){
      //CURRENT BAR VOTED
      var doc = db.collection("bars").doc(bid)
      doc.get().then((snap)=>{
        var votes = snap.data().votes + 1;
        doc.set({
          votes: votes
        }, {merge:true}).then(()=>{
          console.log("Added Vote to ", bid, " /n Vote Count: ", votes)
        })
      });
        //REDUCE PREV BAR VOTE
        var prev = db.collection("bars").doc(prev_bar);
        prev.get().then((snap)=>{
          var votes = snap.data().votes - 1;
          if(votes<0){
            prev.set({
              votes: 0
            }, {merge:true}).then(()=>{
              console.log("Removed Vote from ", prev_bar, " /n Vote Count: ", votes)
            })
          }
          else{
            prev.set({
              votes: votes
            }, {merge:true}).then(()=>{
              console.log("Removed Vote from ", prev_bar, " /n Vote Count: ", votes)
            })
          }

        });

    }
    else if(bid == prev_bar){
      return;
    }
    else{
      this.voted = true;
      //CURRENT BAR VOTED
      var doc = db.collection("bars").doc(bid)
      doc.get().then((snap)=>{
        var votes = snap.data().votes + 1;
        doc.set({
          votes: votes
        }, {merge:true}).then(()=>{
          console.log("Added Vote to ", bid, " /n Vote Count: ", votes)
        })
      });
    }
    this.prevVoteInd = i;
    this.prevEl = $(event.target);

  }
  clearVotes = function(){
    if(this.voted) this.voted = false;
    var db = firebase.firestore();
    var us = firebase.auth().currentUser['uid'] || this.user.uid;

    var doc = db.collection("bars").doc(this.user.voted);
    doc.get().then((snap)=>{
      var votes = snap.data().votes;
      votes--;
      if(votes<0){
        votes = 0;
        doc.set({
          votes: votes
        }, {merge:true})
      }
      else{
        doc.set({
          votes: votes
        }, {merge:true})
      }
      if(this.prevEl) this.prevEl.css("background-position", "right bottom");
      // $(event.target).css("background-position", "left bottom");
      this.prevVoteInd = 0;
    });
    db.collection("users").doc(us).set({
        voted: ""
      }, {merge:true}).then(function(docRef) {
          console.log("Document written with ID: ", docRef);
      })
      .catch(function(error) {
          console.error("Error adding document: ", error);
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
              if(user.voted != ""){
                for(var i=0;i<that.restaurants.length;i++){
                  console.log("BAR ID ", that.restaurants[i].bid, " @ index ", i ," User Voted: ", that.user.voted);
                  if(that.restaurants[i].bid == that.user.voted){
                    console.log("found previous voted @ index", i," restaurant", that.restaurants[i].bid );
                    // that.doClick(document.getElementById("bar"+i));
                    that.voted = true;
                      var el = document.getElementById("bar"+i).firstChild;
                      $(el).css("background-position", "left bottom");

                        $(el).attr('disabled', 'disabled');
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
