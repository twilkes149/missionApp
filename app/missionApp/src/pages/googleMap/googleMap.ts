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

//pages
import { PersonPage } from '../person/person';

@Component({
  selector: 'page-googleMap',
  templateUrl: 'googleMap.html',
  providers: [ApiProvider]
})
export class GoogleMapPage {  
  map: GoogleMap;
  private familyKeys;
  private persons;
  public currentPerson;
  public name:string;

  constructor(public navCtrl: NavController, 
    private api: ApiProvider,
    public alert: AlertController) {
    this.familyKeys = null;
    this.persons = [];
    this.currentPerson = null;
    this.addMarkers = this.addMarkers.bind(this);
    this.name = 'hello';
  }

  async ionViewDidLoad() {    
    this.loadMap();

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

    if (this.familyKeys && this.familyKeys[0]) {//if there is at least one family key
      console.log('familyKeys', this.familyKeys);
      for (let i in this.familyKeys) {//loop for each family
        let personList = await this.api.getPersons(this.familyKeys[i].familyKey)//get list of persons for a family
        .catch((error) => {
          const message = this.alert.create({
            title: 'Error',
            subTitle: error.message,
            buttons: ['OK']
          });
          message.present();
        });

        this.persons.push({ //push familyKey, name, and list of persons
          family: this.familyKeys[i],
          persons: personList
        });
      }
      
      if (this.persons && this.persons[0]) {
        this.addMarkers(this.persons[0].persons);//adds all the markers for each person's start event
      }
    }
    else {
      const message = this.alert.create({
        title: 'Error',
        subTitle: 'You have not joined any families yet. Please go to the settings page, to join or create a family',
        buttons: ['OK']
      });
      message.present();
    }
  }

  loadMap() {

    let mapOptions: GoogleMapOptions = {
      camera: {       
         zoom: 5,
         tilt: 0
       }
    };

    this.map = GoogleMaps.create('mapCanvas', mapOptions);
  }

  addMarkers(persons) {
    persons.forEach((person) => {
      if (!person.events || !person.events[0])//don't add marker if there is no event
        return;

      let pin: Marker = this.map.addMarkerSync({
        title: person.firstName + ' ' + person.lastName,
        icon: 'blue',
        animation: 'DROP',
        position: {
          lat: person.events[0].lat,
          lng: person.events[0].lng
        }
      });
    
      pin.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        pin.showInfoWindow();
        this.currentPerson = person;
      });

      pin.on(GoogleMapsEvent.INFO_CLICK).subscribe(() => {//when the info window is clicked
        console.log(this.currentPerson);
        this.navCtrl.push(PersonPage, {person: this.currentPerson});//go to the person page
      });   
    });
  }

  goToSettingsPage() {
    console.log('going to settings');
  }
}