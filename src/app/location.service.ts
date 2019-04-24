import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
 providedIn: 'root'
})
export class LocationService {

 constructor() {}
  getLocation(): Observable<any> {
    var options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 2500
    }
    function location(observer) {
      if (window.navigator && window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(
          (position: Position) => {
            console.log("Has Position", position)
            observer.next(position);
            observer.complete();
          },
          (error) =>{
            let i = 0;
            console.log("Trying to get location Again", error.message)
            location(observer)
            i++;
            if(i>=3){
              alert("Reloading Page to get location")
              window.location.reload();
            }

          }, options
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
