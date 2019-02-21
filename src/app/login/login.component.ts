import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {FirebaseuiAngularLibraryService} from 'firebaseui-angular';
import {AngularFireAuth} from '@angular/fire/auth';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private currentUser: firebase.User = null;
  constructor(private fb: FirebaseuiAngularLibraryService, private route: Router, private af: AngularFireAuth) {
    var that = this;

    this.fb.firebaseUiInstance.disableAutoSignIn();
    this.af.auth.onAuthStateChanged(function(user) {
      if (that.checkUser()) {
        that.route.navigate(['/','main']);
      }
    });
  }

  ngOnInit() {

  }
  successCallback(event){
    console.log(event);
    if(this.checkUser()){
      this.route.navigate(['/','main']);
    }
  }
  errorCallback(event){
    console.log(event)
  }
  checkUser = function(){
    if(this.currentUser === null){
      return false;
    }
    return true;
  }
}
