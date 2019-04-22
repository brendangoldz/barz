import { Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import { Router } from '@angular/router';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { AngularFireAuth } from '@angular/fire/auth';
import { FirebaseuiAngularLibraryService } from 'firebaseui-angular';
import * as firebase from "firebase";


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']

})


export class SettingsComponent implements OnInit {
  range: number = 10;
  requests: any = 0;
  sub: any;
  user: any;
  constructor(private zone: NgZone, private fb: FirebaseuiAngularLibraryService,
    private af: AngularFireAuth, private router: Router) {

  }

  ngOnInit() {
    var that = this;
    var db = firebase.firestore();
    /**
     * [subscribe description]
     * @param  user=>{if(user [description]
     * @return                [description]
     */
    this.sub = this.af.authState.subscribe(user => {
      if (user) {
        if (!user.emailVerified) {
          this.zone.run(()=>{
            this.router.navigate(['verify']);
          })
        }
        var docRef = db.collection("users").doc(user.uid);
        docRef.get().then(function(doc) {
          if (doc.exists) {
            if (doc.data().uid == user.uid) that.user = doc.data();
            console.log("Document data:", doc.data());
            console.log(user);
            that.range = that.user.radius;
            if (doc.data().requests) {
              doc.data().requests.forEach((x) => {
                that.requests++;
              })
              console.log(that.requests);
            }
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }).catch((e) => { console.log("Error", e) })
      }
      else {
        this.logout();
      }
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  /**
   * Logout of App
   */
  logout = function() {
    window.localStorage.clear();
    this.af.auth.signOut().then(() => {
      console.log("Logging out");
      this.zone.run(()=>{
        this.router.navigate(['login']);
      })
    });
  }
  /**
   * Changing Radius from current user location
   * @param  val [description]
   */
  changeRadius = function(val) {
    let db = firebase.firestore();
    let user = this.user || firebase.auth().currentUser;
    let that = this;
    let us = db.collection("users").doc(user.uid);
    us.set({
      radius: that.range
    }, { merge: true }).then((res) => { console.log("Adjusted Range ", that.range) })
  }
}
