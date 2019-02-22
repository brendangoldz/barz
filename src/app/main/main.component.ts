import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirebaseuiAngularLibraryService} from 'firebaseui-angular';
declare var $: any;
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  restaurants: Array<Object> = new Array<Object>();
  voted: boolean;
  prevVoteInd: any;
  prevEl: any;
  private color = "primary";
  private mode = "determinate";
  constructor(private fb:FirebaseuiAngularLibraryService, private af: AngularFireAuth, private router: Router) {

  }

  ngOnInit() {

    this.restaurants=[{
        name: "PORTA",
        votes: 70
      },{
        name: "JMACS",
        votes: 40
      },{
        name: "BOND STREET",
        votes: 100
      },{
        name: "ALE HOUSE",
        votes: 50
      },{
        name: "STINGERS",
        votes: 90
      }];
  }
  vote = function(i){
    console.log('Tapped: ', $(event.target));
    if(this.prevEl) this.prevEl.css("background-position", "right bottom");
    $(event.target).css("background-position", "left bottom");
    this.prevEl = $(event.target);
    if(this.voted){
      this.restaurants[this.prevVoteInd].votes--;
      this.restaurants[i].votes++;
      this.prevVoteInd = i;
    }
    else{
      this.voted = true;
      this.restaurants[i].votes++;
      this.prevVoteInd = i;
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
  }
}
