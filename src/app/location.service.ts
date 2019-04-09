import {
 Injectable
} from '@angular/core';
import {
 Observable
} from 'rxjs';
@Injectable({
 providedIn: 'root'
})
export class LocationService {

 constructor() {}

<<<<<<< HEAD
 getLocation(): Observable < any > {
  var options = {
   enableHighAccuracy: true,
   maximumAge: 215000,
   timeout: 10000
=======
  getLocation(): Observable<any> {
    var options ={
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
    function location(observer){
      if(window.navigator && window.navigator.geolocation) {
          window.navigator.geolocation.getCurrentPosition(
              (position) => {
                  console.log("Has Position", position)
                  observer.next(position);
                  observer.complete();
              },
              (error) => location(observer), options
          );
      } else {
          observer.error('Unsupported Browser');
      }
    }
      return Observable.create(observer => {
          location(observer);
      });
>>>>>>> d3e8b5f76dfc346436f727115e59fc284d0bd1e1
  }

  function location(observer) {
   if (window.navigator && window.navigator.geolocation) {
    window.navigator.geolocation.getCurrentPosition(
     (position) => {
      observer.next(position);
      observer.complete();
     },
     (error) => location(observer), options
    );
   } else {
    observer.error('Unsupported Browser');
   }
  }
  return Observable.create(observer => {
   location(observer);
  });
 }
}
