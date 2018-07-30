import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

//providers
import { ApiProvider } from '../../providers/api/api';

//modal
import { Modal } from '../../components/modal/modal';

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
  selector: 'page-editPerson',
  templateUrl: 'editPerson.html',
  providers: [ApiProvider]
})
export class EditPersonPage {
  private person:any;
  public searchAddress:string;
  public loading:boolean;

  private address:string;
  private lat:number;
  private lng:number;
  map:GoogleMap;

  constructor (public navCtrl: NavController,
    private api: ApiProvider,
    public params: NavParams,
    public modal: ModalController,
    public storage: Storage,
    public alert: AlertController) {

    this.person = this.params.get('person');
    this.address = this.person.events[0].address;
    this.loading = false;
  }

  ionViewDidLoad() {
    //this.loadMap();
  }

  goBack() {
    this.navCtrl.pop();
  }

  async selectParents() {
    let familyKey = await this.storage.get('familyKey');
    let persons = await this.api.getPersons(familyKey);

    let modal = this.modal.create(Modal, {modalTitle: 'Select Parents', inputFields: persons});
    modal.present();
  }

  updatePerson() {
    if (!this.person) {
      return;
    }

    this.person.events[0].address = this.address;
    this.api.updatePerson(this.person)
    .then((response) => {
      this.api.updateEvent(this.person.events[0])//update address
      .then((result) => {
        const message = this.alert.create({
          title: 'Success',
          subTitle: 'Person was updated',
          buttons: ['OK']
        });
        message.present();
      })
      .catch((error) => {
        const message = this.alert.create({
          title: 'Error',
          subTitle: error.message,
          buttons: ['OK']
        });
        message.present();
      });        
    })
    .catch((error) => {
      const message = this.alert.create({
        title: 'Error',
        subTitle: error.error,
        buttons: ['OK']
      });
      message.present();
    });
  }

  loadMap() {
    let mapOptions: GoogleMapOptions = {
      camera: {       
         zoom: 0,
         tilt: 0
       }
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);    
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