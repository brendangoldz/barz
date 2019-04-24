import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { AngularFireAuth } from '@angular/fire/auth';
import { FirebaseuiAngularLibraryService } from 'firebaseui-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as firebase from 'firebase';
//import FirebaseListObservable from '@angular/fire';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
declare var $: any;


interface Post {
  title: string;
  content: string;
}
@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  postsCol: AngularFirestoreCollection<Post>;
  posts: any = [];

  content: string;

  friendId: string;
  friendUid: string;
  combinedId: string;

  counter: number = 0;

  messageValue: string;
  orderOfOperation: number = 1;
  messageForm = new FormGroup({
    message: new FormControl('')
  });
  searchResults: any;
  searchFriendsForm = new FormGroup({
    searchField: new FormControl(''),
  });
  reqs: any = [];
  friends: any = [];
  sub: any;
  user: any;
  requests: any = 0;
  currentRequest: any;
  currentFriend: any;
  isNotFriends: boolean = true;
  isNotRequested: boolean = true;
  isNotSent: boolean = true;
  constructor(public afs: AngularFirestore, private fb: FirebaseuiAngularLibraryService,
    private af: AngularFireAuth, private router: Router, private zone: NgZone) {
  }
  ngOnInit() {


    var that = this;
    var db = firebase.firestore();

    //Keeps track of total number of messages in the collection
    /*
        if (this.combinedId == null)
        this.postsCol = this.afs.collection('posts');
        else
        this.postsCol = this.afs.collection('posts', ref => ref.where('combinedId', '==', this.combinedId));

          this.posts = this.postsCol.valueChanges();
    */
    /**
     * Subscription to this method. Saying listen to what's happening here.
                            The two options being is the user logged in or not.
     * @param  user=>{if(user [Current user logging into the session]
     */
    this.sub = this.af.authState.subscribe(user => {
      if (user) {
        if (!user.emailVerified) {
          this.zone.run(() => {
            this.router.navigate(['verify']);
          })
        }
        var docRef = db.collection("users").doc(user.uid);
        docRef.get().then(function(doc) {
          if (doc.exists) {
            if (doc.data().uid == user.uid) that.user = doc.data();
            console.log("Document data:", doc.data());
            //console.log("Document data dob:",that.userData)
            if (doc.data().requests) {
              doc.data().requests.forEach((x) => {
                that.reqs.push(x);
                that.requests++;
              })
              if (that.requests > 0) that.reqs = that.getData(that.reqs);
              console.log("Requests Array", that.reqs)
            }
            if (doc.data().friends) {
              doc.data().friends.forEach((x) => {
                console.log(x);
                that.friends.push(x);
              })
              if (that.friends.length > 0) that.friends = that.getData(that.friends);
              console.log("Friends Array", that.friends)
            }
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }).catch((e) => console.log(e))
      } else {
        this.logout();
      }
    });

  }
  /**
   * [Destroys subscription. If subscription isn't destroyed, memory will
                                                      leak out of the webpage.]
   * @return [description]
   */
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /**
   * [Passing the text field into the query function]
   */
  searchFriends = function() {
    console.log(this.searchFriendsForm.value.searchField);
    this.query(this.searchFriendsForm.value.searchField);
  }
  /**
   * [Getting information on the user from the database. Friends array and
                requests array. In the subscription of authState, getData gets
                  data off the user and returns the data wherever it is called.
   * @param  arr [Friends or requests array]
   * @return     [Return the array that was called for]
   */

  getData = function(arr) {
    console.log(this.reqs);
    let db = firebase.firestore();
    var temp = [];
    arr.forEach((x) => {
      db.collection("users").doc(x).get().then((val) => {
        temp.push(val.data());
      })
    });
    return temp;
  }
  logout = function() {
    this.af.auth.signOut().then(() => {
      console.log("Logging out");
      this.zone.run(()=>{
        this.router.navigate(['login']);
      })
    });
  }

  /**
   * [Passing what was called from the searchFriends function]
   * @param  searchText [Using firebase's query to search for a user by email]
   */
  query = function(searchText) {
    var that = this;
    var db = firebase.firestore();
    var us = firebase.auth().currentUser['uid'];
    searchText = searchText.toString().toLowerCase();
    console.log("Search Query", searchText);
    db.collection("users").where("email", "==", searchText).get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          // doc.data() is never undefined for query doc snapshots

          if (doc.exists) {
            console.log(doc.data())
            that.searchResults = doc.data();
            if(that.friends){
              that.friends.forEach((x) => {
                console.log("Friends Query Loop ", x, " search results id ",
                                                        that.searchResults.uid);
                if (that.searchResults.uid == x.uid) {
                  console.log("Results contains a users friend");
                  that.isNotFriends = false;
                }
              })
            }
            if(that.reqs){
              for(let i =0; i<that.reqs.length;i++){
                console.log("Request Query loop", that.reqs[i])
                if (that.searchResults.uid == that.reqs[i].uid) {
                  console.log("Results contains a requestor");
        // let request = <HTMLButtonElement>document.querySelector("#request");
                  that.isNotRequested = false;

                  // if(request)request.innerHTML = "Confirm Request";
                  // else console.log(request)
                }
              }
            }
            for(let i =0; i<doc.data().requests.length;i++){
              console.log("Looping through Query Requests", doc.data().requests[i],
                " Current ID ", us)
              if(doc.data().requests[i] === us){
                console.log("Results already has a request from you!");
                that.isNotSent = false;
                let request = document.getElementById("request");
                console.log("Request Button ", request)
                // $('#request').attr('disabled', 'disabled');
                // $('#request').html('Request Sent');
              }
            }


          }
        });
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });
  }


  /**
   * [requestFriend calls another user after searching the database via email
                        and sends an invitation to the user to become friends.]
   */
  requestFriend = function() {
    $(event.target).attr("disabled", "disabled");
    $(event.target).html('Request Sent');
    var db = firebase.firestore();
    var requestor = db.collection("users").doc(this.user.uid);
    var requestee = db.collection("users").doc(this.searchResults.uid);
    //
    if (this.user.uid != this.searchResults.uid && this.isNotRequested && this.isNotSent) {
      requestee.set({
        requests: [this.user.uid]
      }, { merge: true }).then(() =>{
        console.log("Assigned Pending Request in Requestee");
        this.refresh();
      });
    }
    else if(!this.isNotSent){
      console.log("User Already Has A Request From You");
    }
    else {
      $('.request_btn').attr('disabled', 'disabled');
      console.log("Cant Request Self");
    }
  }


  /**
   * [Confirms the friend request at the index position in the
                                                  list of pending invitations.]
   * @param  i [Index of the request]
   */
  confirmRequest = function(i) {
    $(event.target).attr("disabled", "disabled");
    $(event.target).html("Confirmed");
    const that = this;
    const db = firebase.firestore();
    const uid = this.user.uid;
    const user = db.collection("users").doc(uid);
    let friend_id;
    let reqs = [];
    let friends = [];
    user.get().then((val) => {
      reqs = val.data().requests
      console.log(reqs)
      friends = val.data().friends;
      if(!that.isNotRequested){
        friend_id = that.searchResults.uid;
        friends.push(that.searchResults.uid)
      }
      else{
        friend_id = reqs[i];
        friends.push(reqs[i]);
      }

      console.log("Friends array of current user", friends)
      reqs.splice(i, 1);
      that.reqs = reqs;
      console.log("Request array after splice", that.reqs)
      user.set({
        requests: reqs,
        friends: friends
      }, { merge: true }).then(() => {
        console.log("Successfully added friend")
      });

      console.log("Getting friend of id ", friend_id)
      var friend = db.collection("users").doc(friend_id);
      friend.get().then((val2) => {
        let friends2 = val2.data().friends || [];
        friends2.push(uid);
        console.log("Friends array ", friends2)
        friend.set({
          friends: friends2
        }, { merge: true }).then(() => {
          friends = [];
          reqs = [];
          this.refresh();
          console.log("Successfully added friend")
        });
      });
    });


  }

  /**
   * [Declines the friend request at the index position in the
                                                    list of friend invitations.]
   * @param  i [Index of the request]
   */
  declineRequest = function(i) {
    var db = firebase.firestore();
    var user = db.collection("users").doc(this.user.uid);
    let reqs = [];
    user.get().then((val) => {
      console.log("index ", i)
      reqs = val.data().requests
      console.log("Before decline request", reqs);
      reqs = reqs.splice(i, i);
      console.log("After decline request", reqs)
      this.reqs = reqs;
      user.set({
        requests: reqs
      }, { merge: true }).then(() => {
        this.refresh();
        console.log("Decline friend Request")
      })
    });
  }

  /**
   * [Once user accepts friend request, friends list refreshes
                                                and displays the new freindship]
   */
  refresh = function() {
    var that = this;
    this.reqs = [];
    this.requests = 0;
    this.friends = [];
    var db = firebase.firestore();
    var docRef = db.collection("users").doc(this.user.uid);
    docRef.get().then(function(doc) {
      if (doc.exists) {
        if (doc.data().uid == that.user.uid) that.user = doc.data();
        console.log("Document data:", doc.data());
        //console.log("Document data dob:",that.userData)
        if (doc.data().requests) {
          doc.data().requests.forEach((x) => {
            that.reqs.push(x);
            that.requests++;
          })
          if (that.requests > 0) that.reqs = that.getData(that.reqs);
          console.log("Requests Array", that.reqs)
        }
        if (doc.data().friends) {
          doc.data().friends.forEach((x) => {
            console.log(x);
            that.friends.push(x);
          })
          if (that.friends.length > 0) that.friends = that.getData(that.friends);
          console.log("Friends Array", that.friends)
        }
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch((e) => console.log(e))
  }

  /**
   * [Deletes friend from users friends list. User 1 and user 2 will no longer
                                        have each other on their friends list. ]
   * @param  i [description]
   * @return     [Return is returning nothing, but is there to cancel
                                                            delelting a friend]
   */
  deleteFriend = function(i){
    var db = firebase.firestore();
    var docRef = db.collection("users").doc(this.user.uid);
    let friends = [];
    if(confirm('Are you sure you want to delete this friend?')){

      docRef.get().then((doc)=>{
        friends = doc.data().friends;
        console.log("Friends Before Delete", friends, " deleting friend ", friends[i]);
        let del_friend = db.collection("users").doc(friends[i])
        del_friend.get().then((doc)=>{
          let f = doc.data().friends;
          console.log("Deleted Friend Friends List Before Delete ", f);
          for(var i = 0; i< f.length; i++){
            if(f[i]==this.user.uid){
              console.log("Removing you from deleted friends, friends list")
              f.splice(i,1);
              console.log("Deleted Friend Friends List After Delete ", f);
            }
          }
          del_friend.set({
            friends: f
          }, {merge: true}).then(()=>{
            console.log("Successfully remove you from deleted friend, friends list")
          })
        });
        friends.splice(i, 1);
        console.log("Friends After Delete", friends);
        docRef.set({
          friends: friends
        }, {merge: true}).then(()=>{
          console.log("Succesfully Deleted User");
          this.refresh();
        })

        console.log(doc.data().friends)
      });
    }
    else{
      return;
    }

  }

  /**
   * [Returns the user's profile once their profile pic is clicked on]
   * @param  i [Index of the current friend at the position in the array]
   */
  getCurrentFriend = function(i) {
    var that = this;
    var db = firebase.firestore();
    var user = db.collection("users").doc(this.user.uid);
    user.get().then((val) => {
      let temp = val.data().friends;
      temp = temp[i];
      db.collection("users").doc(temp).get().then((val) => {
        that.currentFriend = val.data();
        console.log("Current Friend ", that.currentFriend)
      })
    });

  }
  /**
   * [Returns the user's profile once their profile pic is clicked on]
   * @param  i [Index of the current request]
   */
  getCurrentRequest = function(i) {
    var that = this;
    var db = firebase.firestore();
    var user = db.collection("users").doc(this.user.uid);
    user.get().then((val) => {
      let temp = val.data().requests;
      temp = temp[i];
      db.collection("users").doc(temp).get().then((val) => {
        that.currentRequest = val.data();
        console.log("Current Request ", that.currentRequest)
      })
    });
  }

  setMessageWindow = function(x){
    this.friendId = this.friends[x].uid;
    this.posts = [];
    var user =  firebase.auth().currentUser['uid'] ;
    this.combinedId = user + this.friendId;
    const db = firebase.firestore();
    const posts = db.collection('posts');
    posts.doc(this.combinedId).get().then((val)=>{
      let content = [];
      if(val.exists){
        console.log("Content", val.data().content)
        for(var i = 0;i<val.data().content.length; i++){
          let temp = val.data().content[i];
          temp = {
            date: new Date(Date.parse(temp.date)),
            message: temp.message,
            sender: this.user.firstName + " " + this.user.lastName
          }
          this.posts.push(temp);
        }
        console.log("Posts before sort", this.posts)
        this.posts.sort((a, b)=>{
          var dateA = new Date(a.date), dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        })
        // this.posts.map((a)=>a.date = new Date(Date.parse(a.date)).toTimeString())

        console.log("Posts after sort", this.posts)
        // this.posts.push(val.data().content);
      }
    })
    this.combinedId = this.friendId + user;
    posts.doc(this.combinedId).get().then((val)=>{
      let content = [];
      if(val.exists){
        console.log("Content", val.data().content)
        for(var i = 0;i<val.data().content.length; i++){
          let temp = val.data().content[i];
          temp = {
            date: new Date(Date.parse(temp.date)),
            message: temp.message,
            sender: this.friends[x].firstName + " " + this.friends[x].lastName
          }
          console.log("Posts In Receiving Messages", this.posts)
          this.posts.push(temp);
        }
        console.log("Posts before sort", this.posts)
        this.posts.sort((a, b)=>{
          console.log("Date A: ", a.date, " vs. Date B: ", b.date)
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        })
        // this.posts.map((a)=>a.date = new Date(Date.parse(a.date)).toTimeString())
        console.log("Posts after sort", this.posts)
      }
    })

  }


  message = function(){
    //alert("Coming Soon!");
    var user =  firebase.auth().currentUser['uid'] ;
    this.combinedId = user + this.friendId
    console.log(this.combinedId);
    const db = firebase.firestore();
    const posts = db.collection('posts');
    let date = new Date().toString();
    posts.doc(this.combinedId).get().then((val)=>{
      let content = [];
      if(val.exists){
        content = (val.data().content);
        console.log("Content", content)
        content.push({
          message: this.content,
          date: date
        })
        posts.doc(this.combinedId).set({
          combinedId: this.combinedId,
          content: content,
        }, {merge: true}).then(()=>{console.log('Message Sent')})
      }
      else{
        // posts.get().then((val)=>{
          // if(val.data().content) content = (val.data().content);
          content.push({
            message: this.content,
            date: date
          })
          posts.doc(this.combinedId).set({
            combinedId: this.combinedId,
            content: content
          }, {merge: true}).then(()=>{console.log('Message Sent')})
        // })
      }
    })


    // this.afs.collection('posts').doc(this.combinedId).set({'combinedId':user+this.friendId,'content': this.content});
    //
    // this.afs.collection('posts').doc(this.combinedId).set({'combinedId':this.friendId+user,'content': this.content});

  }

}
