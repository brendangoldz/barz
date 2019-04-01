import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirebaseuiAngularLibraryService} from 'firebaseui-angular';



@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']

})


export class SettingsComponent implements OnInit
{
  range: number=10;

  constructor(private fb:FirebaseuiAngularLibraryService,
    private af: AngularFireAuth, private router: Router) {

  }



  ngOnInit()
  {
    var that = this;
    this.af.auth.onAuthStateChanged(user=>{
      if(user){
        console.log(user);
      }
      else{
        this.logout();
      }
    })
  }
  logout = function()
  {
    window.localStorage.clear();
    this.af.auth.signOut().then(() =>
    {
      console.log("Logging out");
      this.router.navigate(['/','login']);
    });
  }
}
