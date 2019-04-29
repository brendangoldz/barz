import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../assets/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ViewChild, ElementRef } from '@angular/core';
import * as firebase from 'firebase';
declare var $: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private currentUser: firebase.User = null;
  private sub: any;
  new: boolean = false;


  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });


  signupForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
    gender: new FormControl(''),
    dob: new FormControl(''),
    tos: new FormControl('')
  });

  forgottenEmail: string;

  constructor(private zone: NgZone, private route: Router, private af: AngularFireAuth, private auth: AuthService, private router: Router) {
    var that = this;
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
        else {
          this.zone.run(()=>{
            this.router.navigate(['main']);
          })
        }
        console.log("User in authState:", user);
      } else {
        return;
      }
    });
  }
  ngOnInit() {
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  successCallback(event) {
    console.log(event);
  }
  errorCallback(event) {
    console.log(event)
  }
  /**
   * Checking to see if user is already subscribed into system
   * @return if(user==null), then false. If(currentUser==user), then true.
   */
  checkUser = function() {
    if (this.currentUser === null) {
      return false;
    }
    return true;
  }
  /**
   * Logging in using Gmail Account
   */
  loginWithGoogle = function() {
    this.auth.GoogleAuth();
  }
  /**
   * Entering user data to login into system
   */
  login = function() {
    console.log(this.loginForm);
    this.auth.SignIn(this.loginForm.value.email, this.loginForm.value.password);
  }
  /**
   * Subscribing to App by filling out criteria list
   */
  signup = function() {
    if (this.signupForm.value.password === this.signupForm.value.confirmPassword && this.signupForm.value.tos != false) {
      // console.log(this.signupForm.value.firstName, this.signupForm.value.lastName);
      let age = this.getAge(this.signupForm.value.dob);
      if(age<21 || age != typeof Number){
        alert("This appliation requires users to be of age 21");
      }
      else{
        this.auth.SignUp(age, this.signupForm.value.firstName, this.signupForm.value.lastName, this.signupForm.value.email, this.signupForm.value.password);
      }
    }
    else {
      window.alert('Passwords do not match or you have not accepted the ToS');
    }

  }
  /**
   * Sending a message to user if password was forgotten
   */
  forgotPassword = function() {
    this.auth.ForgotPassword(this.forgottenEmail);
  }

  /**
   * Trying to get the age from user in order to complete App requirements
   * @return age
   */
  getAge = function(dob)
   {
     var today = new Date();
     var birthDate = new Date(dob);
     var age = today.getFullYear() - birthDate.getFullYear();
     var m = birthDate.getMonth();
     if(m<0 || (m==0 && today.getDate() < birthDate.getDate()))
     {
       age = age - 1
     }
     return age;
   }


}
