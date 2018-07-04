import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController } from 'ionic-angular';

//providers
import { ApiProvider } from '../../providers/api/api';
import { Storage } from '@ionic/storage';

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
    familyKey: null,
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
    public alert: AlertController,
    private storage: Storage,
    public load: LoadingController) {
    
    this.loading = false;
  }

  ionViewDidLoad() {
    this.loadMap();
  }

  goBack() {
    this.navCtrl.pop();
  }

  //calls api to create a person and appropiate _START event
  async createPerson() {
    //make sure all fields needed are entered
    if (!this.person.firstName || !this.person.lastName || !this.person.gender || !this.person.description || !this.lat || !this.lng || !this.address) {
      const message = this.alert.create({
        title: 'Error',
        subTitle: 'Not all required fields were filled out',
        buttons: ['OK']
      });
      message.present();
      return;
    }    
    else {
      //show loading indicator
      const loader = this.load.create({
        content: "Loading...",
        dismissOnPageChange: true,
      });
      loader.present();

      let familyKey = await this.storage.get('familyKey');

      if (!familyKey) {
        const message = this.alert.create({
          title: 'Error',
          subTitle: 'You need to create/join a family group before you can create a person',
          buttons: ['OK']
        });
        message.present();
        return;
      }
      this.person.familyKey = familyKey;   

      //insert person
      this.api.createPerson(this.person)
      .then((result:any) => {
        //insert start event for person
        let event = {
          title: '_START',
          description: 'start',
          lat: this.lat,
          lng: this.lng,
          address: this.address,
          personId: result.id,
          familyKey: familyKey
        };

        this.api.createEvent(event)
        .then((result) => {
          this.navCtrl.pop();
        })
        .catch ((error) => {
          loader.dismiss();
          const message = this.alert.create({
            title: 'Error',
            subTitle: error.message,//change to error createing person
            buttons: ['OK']
          });
        });
      })
      .catch((error) => {
        loader.dismiss();
        const message = this.alert.create({
          title: 'Error',
          subTitle: error.message,
          buttons: ['OK']
        });
      });      
    }    
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
      //console.log(result);

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