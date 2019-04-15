import { Component, OnInit, OnDestroy } from '@angular/core';
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
    tos: new FormControl('')
  });

  forgottenEmail: string;

  constructor(private route: Router, private af: AngularFireAuth, private auth: AuthService, private router: Router) {
    var that = this;
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
        else {
          this.router.navigate(['/', 'main'])
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
   * [function description]
   * @return [description]
   */
  checkUser = function() {
    if (this.currentUser === null) {
      return false;
    }
    return true;
  }
  /**
   * [function description]
   * @return [description]
   */
  loginWithGoogle = function() {
    this.auth.GoogleAuth();
  }
  /**
   * [function description]
   * @return [description]
   */
  login = function() {
    console.log(this.loginForm);
    this.auth.SignIn(this.loginForm.value.email, this.loginForm.value.password);
  }
  /**
   * [function description]
   * @return [description]
   */
  signup = function() {
    if (this.signupForm.value.password === this.signupForm.value.confirmPassword && this.signupForm.value.tos != false) {
      // console.log(this.signupForm.value.firstName, this.signupForm.value.lastName);

      this.auth.SignUp(this.signupForm.value.firstName, this.signupForm.value.lastName, this.signupForm.value.email, this.signupForm.value.password);
    }
    else {
      window.alert('Passwords do not match or you have not accepted the ToS');
    }

  }
  /**
   * [function description]
   * @return [description]
   */
  forgotPassword = function() {
    this.auth.ForgotPassword(this.forgottenEmail);
  }
}
