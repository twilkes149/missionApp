import { Component } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';

//providers
import { ApiProvider } from '../../providers/api/api';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  Environment
} from '@ionic-native/google-maps';

@Component({
  selector: 'page-createPerson',
  templateUrl: 'createPerson.html',
  providers: [ApiProvider]
})
export class CreatePersonPage {
  public person = {
    firstName: '',
    lastName: '',
    gender: 'm',
    description: '',
  };

  public searchAddress:string;
  public loading:boolean;

  private address:string;
  private lat:number;
  private lng:number;
  map:GoogleMap;

  constructor (public navCtrl: NavController,
    private api: ApiProvider,
    public params: NavParams,
    public alert: AlertController) {
    
    this.loading = false;
  }

  ionViewDidLoad() {
    this.loadMap();
  }

  goBack() {
    this.navCtrl.pop();
  }

  loadMap() {

    let mapOptions: GoogleMapOptions = {
      camera: {       
         zoom: 0,
         tilt: 0
       }
    };

    this.map = GoogleMaps.create('create_map_canvas', mapOptions);    
    Environment.setBackgroundColor('#004D73');
  }

  //this function calls the google api to search for lat, lng coordinates
  async searchCity() {
    this.loading = true;
    this.api.getLocation(this.searchAddress)
    .then((result:any) => {
      console.log(result);

      if (!result || !result.results || !result.results[0]) {
        return;
      }
      this.map.animateCamera({
        target: result.results[0].geometry.location,
        zoom: 8,
        tilt: 0,        
        duration: 1000
      });
      
      let pin: Marker = this.map.addMarkerSync({        
        icon: 'blue',
        animation: 'DROP',
        position: result.results[0].geometry.location, 
      });

      //save info
      this.address = result.results[0].formatted_address;
      this.lat = result.results[0].geometry.location.lat;
      this.lng = result.results[0].geometry.location.lng;
    })
    .catch((error) => {
      const message = this.alert.create({
        title: 'Error',
        subTitle: 'There was an error searching',
        buttons: ['OK']
      });
      message.present();
    })
    .then(() => {
      this.loading = false;
    });    
  }
}