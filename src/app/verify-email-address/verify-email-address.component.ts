import { Component, OnInit } from '@angular/core';
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
            var docRef = db.collection("users").doc(user.uid);
            docRef.get().then(function(doc) {
                if (doc.exists) {
                    if(doc.data().uid == user.uid) that.user= doc.data();
                      console.log("Document data:", doc.data());
                      //console.log("Document data dob:",that.userData);
                  } else {
                      // doc.data() will be undefined in this case
                      console.log("No such document!");
                  }
            }).catch((e)=>console.log(e))
          } else {
            this.logout();
          }
     });
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
