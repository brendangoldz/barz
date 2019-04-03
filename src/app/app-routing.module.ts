import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './main/main.component';
import {FriendsComponent} from './friends/friends.component';
import {ProfileComponent} from './profile/profile.component';
import {SettingsComponent} from './settings/settings.component';
import {LoginComponent} from './login/login.component';
import {VerifyEmailAddressComponent} from './verify-email-address/verify-email-address.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: "full"
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'main',
    component: MainComponent
  },
  {
    path: 'friends',
    component: FriendsComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: 'verify',
    component: VerifyEmailAddressComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
  exports: [RouterModule]
})
export class AppRoutingModule { }
