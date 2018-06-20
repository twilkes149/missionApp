import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker
} from '@ionic-native/google-maps';

//providers
import { ApiProvider } from '../../providers/api/api'; 

@Component({
  selector: 'page-googleMap',
  templateUrl: 'googleMap.html',
  providers: [ApiProvider]
})
export class GoogleMapPage {  
  map: GoogleMap;
  private familyKeys;

  constructor(public navCtrl: NavController, 
    private api: ApiProvider,
    public alert: AlertController) {
    this.familyKeys = null;
  }

  //when the page is about to load
  async ionViewWillEnter() {
    //get list of persons for each family this user belongs to
    this.familyKeys = await this.api.getFamilyKeys()
    .catch((error) => {
      const message = this.alert.create({
        title: 'Error',
        subTitle: error.message,
        buttons: ['OK']
      });
      message.present();
    });    
  }

  ionViewDidLoad() {    
    this.loadMap();
    if (!this.familyKeys || !this.familyKeys[0]) {
      const message = this.alert.create({
        title: 'Error',
        subTitle: 'You have not join any families yet. Please go to the settings page, to join or create a family',
        buttons: ['OK']
      });
      message.present();
    }
    else {
      this.addMarkers();
    }
  }

  loadMap() {

    let mapOptions: GoogleMapOptions = {
      camera: {
         target: {
           lat: 43.0741904,
           lng: -89.3809802
         },
         zoom: 10,
         tilt: 0
       }
    };

    this.map = GoogleMaps.create('mapCanvas', mapOptions);
  }

  addMarkers() {
    let marker: Marker = this.map.addMarkerSync({
      title: 'Ionic',
      icon: 'blue',
      animation: 'DROP',
      position: {
        lat: 43.0741904,
        lng: -89.3809802
      }
    });
    marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
      alert('clicked');
    });
  }
}