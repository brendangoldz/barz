import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from '../../assets/auth.service';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase/app';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private currentUser: firebase.User = null;
  private sub: any;
  private new: boolean = false;

  loginForm = new FormGroup({
   email: new FormControl(''),
   password: new FormControl(''),
 });
 signupForm = new FormGroup({
   email: new FormControl(''),
   password: new FormControl(''),
   confirmPassword: new FormControl(''),
 });
 forgottenEmail: string;
  constructor(private route: Router, private af: AngularFireAuth, private auth: AuthService) {
    var that = this;

    this.sub = this.af.authState.subscribe(user => {
          if (user) {
            console.log("User in authState:", user);
          } else {
            return;
          }
      });
  }
  ngOnInit() {

  }
  ngOnDestroy(){
    this.sub.unsubscribe();
  }
  successCallback(event){
    console.log(event);
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
  loginWithGoogle = function(){
    this.auth.GoogleAuth();
  }
  login = function(){
    console.log(this.loginForm);
    this.auth.SignIn(this.loginForm.value.email, this.loginForm.value.password);
  }
  signup = function(){
    console.log(this.signupForm);
    if(this.signupForm.password === this.signupForm.confirmPassword)this.auth.SignUp(this.signupForm.value.email, this.signupForm.value.password)
  }
  forgotPassword = function(){
    this.auth.ForgotPassword(this.forgottenEmail);
  }
  newAccount = function(){
    if(!this.new){
      this.new = true;
    }
    else{
      this.new = false;
    }
  }
}
