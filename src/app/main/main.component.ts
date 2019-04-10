import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { AngularFireAuth } from '@angular/fire/auth';
import { FirebaseuiAngularLibraryService } from 'firebaseui-angular';
import { AuthService } from '../../assets/auth.service';
import { LocationService } from '../location.service';


import * as firebase from 'firebase';
declare var $: any;
declare var google: any;
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MainComponent implements OnInit {
  restaurants: Array<any> = new Array<any>();
  restaurant: any;
  currentLat: any;
  currentLong: any;
  totalVotes: any = 0;
  marker: any;
  location: any;
  loaded: boolean;
  map: any;
  lo_offset: any;
  radius = 5; //MILES
  voted: boolean;
  user: any;
  int: any;
  prevVoteInd: any;
  prevEl: any;
  sub: any;
  sub2: any;
  requests: any = 0;
  private color = "primary";
  private mode = "determinate";
  constructor(private af: AngularFireAuth, private lo: LocationService, private router: Router, private auth_service: AuthService, private cd: ChangeDetectorRef) {

  }


  ngOnInit() {
    window.addEventListener('click', function(evt) {
      if (evt.detail === 3) {
        console.log("triple click")
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.reload();
        return false;
      }
    });
    var that = this;
    var db = firebase.firestore();

    this.map = new google.maps.Map(document.getElementById('map'), {
      center: this.marker,
      zoom: 5,
    });

    /**
     * [subscribe description]
     * @param  user=>{if(user [description]
     * @return                [description]
     */
    this.sub = this.af.authState.subscribe(user => {
      if (user) {
        if (!user.emailVerified) {
          this.router.navigate(['', 'verify']);
        }
        var docRef = db.collection("users").doc(user.uid);
        docRef.get().then(function(doc) {
          if (doc.exists) {
            if (doc.data().uid == user.uid) that.user = doc.data();
            console.log("Document data:", doc.data());
            console.log(user);
            if (that.loaded && that.restaurants.length > 0) that.checkVoted();
            if (doc.data().requests) {
              doc.data().requests.forEach((x) => {
                that.requests++;
              })
              console.log(that.requests);
            }
            //console.log("Document data dob:",that.userData);
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }).catch((e) => console.log(e))
      } else {
        this.logout();
      }
    });
    /**
     * [collection description]
     * @param  "bars" [description]
     * @return        [description]
     */
    var doc = db.collection("bars").onSnapshot((snap) => {
      this.loaded = false
      if (that.sub2) that.sub2.unsubscribe();

      console.log("On Snapshot", snap)
      that.restaurants = [];
      that.totalVotes = 0;
      snap.forEach((doc) => {
        console.log(doc.id, " votes ", doc.data().votes);
        that.restaurants.push(doc.data());
        that.totalVotes += doc.data().votes;
      })
      try {
        that.sub2 = that.lo.getLocation().subscribe(res => {
          this.currentLat = res.coords.latitude;
          this.currentLong = res.coords.longitude;
          that.location = new google.maps.LatLng(this.currentLat, this.currentLong);
          setTimeout(() => {
            var temp = [];
            var circleRadius = this.user.radius * 1609.344 || 10 * 1609.344;
            var temp = that.restaurants.filter((val) => {
              var circle = new google.maps.Circle({
                clickable: false,
                radius: circleRadius,
                center: new google.maps.LatLng(res.coords.latitude, res.coords.longitude)
              });
              console.log("get radius ", circleRadius);

              //CIRCLE CREATED FOR RADIUS OF SEARCH
              // console.log("myLocation", that.location);
              var pos = new google.maps.LatLng(parseFloat(val.coords.latitude), parseFloat(val.coords.longitude));
              var pt2 = new google.maps.Marker({ position: pos, map: that.map });

              var bounds = circle.getBounds();
              //CHECK IF REST COORDS INSIDE BOUNDS OF CIRCLE
              return bounds.contains(pos);
            });

            console.log("Temp before Normalized ", temp);
            temp.forEach((val) => {
              val.normalized = (val.votes / that.totalVotes) * 100;
            })
            that.restaurants = temp;
            that.loaded = true;
            if (that.user && that.loaded) that.checkVoted();
          }, 1500);
        })
      } catch (e) {
        console.log("error ", e)
      }
    });
  }
  /**
   * [ngOnDestroy description]
   * @return [description]
   */
  ngOnDestroy() {
    clearInterval(this.int);
    this.sub.unsubscribe();
    this.sub2.unsubscribe();
  }

  /**
   * [function description]
   * @param  position [description]
   * @return          [description]
   */
  showPosition = function(position?) {
    console.log("Position after navigator found ", position)

    this.location = new google.maps.LatLng(this.currentLat, this.currentLong);

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
  /**
   * [function description]
   * @param  i [Index of restaurant voted on]
   * @return   [description]
   */
  vote = function(i) {
    $(event.target).attr("disabled", "disabled");
    var bid = this.restaurants[i].bid;
    var db = firebase.firestore();
    var us = firebase.auth().currentUser['uid'] || this.user.uid;
    var new_bar = bid
    var prev_bar;
    if (this.user.voted != "") prev_bar = this.user.voted;

    if (this.prevEl) this.prevEl.css("background-position", "right bottom");


    //SET BID ONTO USER ATTR 'voted' ALWAYS
    db.collection("users").doc(us).set({
      voted: bid
    }, { merge: true }).then(function(docRef) {
      console.log("Document written with ID: ", docRef);
    })
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });

    if (this.voted && bid != prev_bar) {
      //CURRENT BAR VOTED
      var doc = db.collection("bars").doc(bid)
      doc.get().then((snap) => {
        var votes = snap.data().votes + 1;
        doc.set({
          votes: votes
        }, { merge: true }).then(() => {
          console.log("Added Vote to ", bid, " \n Vote Count: ", votes)
        })
      });
      //REDUCE PREV BAR VOTE
      var prev = db.collection("bars").doc(prev_bar);
      prev.get().then((snap) => {
        var votes = snap.data().votes - 1;
        if (votes < 0) {
          prev.set({
            votes: 0
          }, { merge: true }).then(() => {
            console.log("Removed Vote from ", prev_bar, " /n Vote Count: ", votes)
          })
        }
        else {
          prev.set({
            votes: votes
          }, { merge: true }).then(() => {
            console.log("Removed Vote from ", prev_bar, " /n Vote Count: ", votes)
          })
        }

      });

    }
    else if (bid == prev_bar) {
      return;
    }
    else {
      this.voted = true;
      //CURRENT BAR VOTED
      var doc = db.collection("bars").doc(bid)
      doc.get().then((snap) => {
        var votes = snap.data().votes + 1;
        doc.set({
          votes: votes
        }, { merge: true }).then(() => {
          console.log("Added Vote to ", bid, " /n Vote Count: ", votes)
        })
      });
    }
    this.prevVoteInd = i;
    this.prevEl = $(event.target);

  }
  /**
   * [function description]
   * @return [description]
   */
  clearVotes = function() {
    if (this.voted) this.voted = false;
    var db = firebase.firestore();
    var us = firebase.auth().currentUser['uid'] || this.user.uid;

    var doc = db.collection("bars").doc(this.user.voted);
    doc.get().then((snap) => {
      var votes = snap.data().votes;
      votes--;
      if (votes < 0) {
        votes = 0;
        doc.set({
          votes: votes
        }, { merge: true })
      }
      else {
        doc.set({
          votes: votes
        }, { merge: true })
      }
      if (this.prevEl) this.prevEl.css("background-position", "right bottom");
      // $(event.target).css("background-position", "left bottom");
      this.prevVoteInd = 0;
    });
    db.collection("users").doc(us).set({
      voted: ""
    }, { merge: true }).then(function(docRef) {
      console.log("Document written with ID: ", docRef);
    })
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
  }
  /**
   * [function description]
   * @return [description]
   */
  logout = function() {
    window.localStorage.clear();
    this.af.auth.signOut().then(() => {
      console.log("Logging out");
      this.router.navigate(['/', 'login']);
    });
  }

  /**
   * [function description]
   * @param  i [description]
   * @return   [description]
   */
  info = function(i) {
    console.log("Getting Info For: ", this.restaurants[i]);
    this.restaurant = this.restaurants[i];
  }
  /**
   * [function description]
   * @return [description]
   */
  checkVoted = function() {
    var user = this.user || firebase.auth().currentUser;
    console.log(user);
    var that = this;
    var db = firebase.firestore();
    var docRef = db.collection("users").doc(user.uid);
    docRef.get().then(function(doc) {
      if (doc.exists) {
        if (doc.data().uid == user.uid) that.user = doc.data();
        console.log("Document data:", doc.data());
        for (var i = 0; i < that.restaurants.length; i++) {
          console.log("BAR ID ", that.restaurants[i].bid, " @ index ", i, " User Voted: ", that.user.voted);
          if (that.restaurants[i].bid == that.user.voted) {
            console.log("found previous voted @ index", i, " restaurant", that.restaurants[i].bid);
            // that.doClick(document.getElementById("bar"+i));
            that.voted = true;
            var el = document.getElementById("bar" + i);
            $(el.firstChild).css("background-position", "left bottom");
            $(el.firstChild).attr('disabled', 'disabled');
            break;
          }
        }
        console.log(user);
        //console.log("Document data dob:",that.userData);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch((e) => console.log(e))
  }
}
