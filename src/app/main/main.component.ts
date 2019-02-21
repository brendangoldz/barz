import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirebaseuiAngularLibraryService} from 'firebaseui-angular';
declare var restaurants: ["PORTA", "JMACS", "BOND STREET", "ALE HOUSE", "STINGERS"]
declare var $: any;
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  restaurants: Array<Object> = new Array<Object>();
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
    /*.mat-progress-bar-fill::after{
      background: #F25757;
    }
    .mat-progress-bar-buffer{
      background: #7F2D2D;
    }
    */
    let el = document.getElementsByClassName("mat-progress-bar-fill");
    $(el[i]).addClass("voted-fill");
    let el2 = document.getElementsByClassName("mat-progress-bar-buffer");
    $(el2[i]).css("background", "#11671b")
    // $(".mat-progress-bar-fill::after").css("background", "#49f95e")
    // $(".mat-progress-bar-buffer").css("background", "#11671b")
    this.restaurants[i].votes++;
  }
  logout = function(){
    this.af.auth.signOut().then(() => {
      console.log("Logging out");
     this.router.navigate(['/','login']);
  });
  }
}
