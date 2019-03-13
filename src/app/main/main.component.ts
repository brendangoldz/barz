import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  restaurants: Array<any> = new Array<any>();
  restaurant: any;
  voted: boolean;
  prevVoteInd: any;
  prevEl: any;
  varaible: Object;
  private color = "primary";
  private mode = "determinate";
  constructor(private fb:FirebaseuiAngularLibraryService, private af: AngularFireAuth, private router: Router, private auth_service: AuthService) {
    this.getBarData();

  }

  ngOnInit() {
console.log(this.restaurants);
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
        if(votes>0){
          votes = votes - 1;
          db.collection("bars").doc(snap.docs[this.prevVoteInd].id).set({
            votes: votes
          }, {merge:true})
        }
        else{
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
      var doc = db.collection("bars").get().then((snap)=>{
        console.log(snap);
        console.log("Snapshot", snap)
        console.log(snap.docs[i].id);
        var votes = snap.docs[i].data().votes;
        votes =+ 1;
        db.collection("bars").doc(snap.docs[i].id).set({
          votes: votes
        }, {merge:true})

      });
    }

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
}
