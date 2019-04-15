import { Component, OnInit, OnDestroy } from '@angular/core';
import {AuthService} from '../../assets/auth.service';
import {AngularFireAuth} from '@angular/fire/auth';
import * as firebase from 'firebase';
import {Router} from '@angular/router';
@Component({
  selector: 'app-verify-email-address',
  templateUrl: './verify-email-address.component.html',
  styleUrls: ['./verify-email-address.component.css']
})
export class VerifyEmailAddressComponent implements OnInit {
  sub: any;
  user: any;
  constructor(private auth: AuthService, private af: AngularFireAuth, private router: Router) { }

  ngOnInit() {
    const that = this;
    let db = firebase.firestore();
    this.sub = this.af.authState.subscribe(user => {
          if (user) {
            if(user.emailVerified){
              this.router.navigate(['main']);
            }
          } else {
            this.logout();
          }
     });
  }
  ngOnDestroy(){
    this.sub.unsubscribe();
  }
  logout = function(){
    window.localStorage.clear();
    this.af.auth.signOut().then(() => {
      console.log("Logging out");
     this.router.navigate(['/','login']);
   });
  }
  resendEmail = function(){
    if(this.user) this.auth.SendVerificaitonMail();
    else console.log("User Not Defined")
  }
}
