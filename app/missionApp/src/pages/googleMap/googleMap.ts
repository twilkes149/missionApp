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
import { CreatePersonPage } from '../createPerson/createPerson';
import { SettingsPage } from '../settings/settings';
import { Storage } from '@ionic/storage';

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
  private markers;  

  constructor(public navCtrl: NavController, 
    private api: ApiProvider,
    public alert: AlertController,
    private storage: Storage) {

    this.familyKeys = null;
    this.persons = [];
    this.currentPerson = null;
    this.addMarkers = this.addMarkers.bind(this);    
    this.markers = [];
  }

  //remove all the map markers when we leave
  ionViewWillLeave() {
    this.markers.forEach((marker) => {
      marker.remove();
    });
    this.markers = [];
  }

  //load the map once this screen has loaded
  ionViewDidLoad() {
    this.loadMap();
  }

  //runs everytime this becomes the active screen
  async ionViewDidEnter() {
    //await this.storage.set('familyKey', null);
    let currentFamilyKey = await this.storage.get('familyKey');//grab stored family key, to load persons

    if (!currentFamilyKey) {//if we haven't stored a family key
      this.familyKeys = null;  
      
      this.familyKeys = await this.api.getFamilyKeys()//get list of families this person belongs to
      .catch((error) => {
        const message = this.alert.create({
          title: 'Error',
          subTitle: error.message,
          buttons: ['OK']
        });
        message.present();
      });

      //if user is a member of at least one family
      if (this.familyKeys && this.familyKeys[0]) {//if there is at least one family key      
        currentFamilyKey = this.familyKeys[0];
      }
      else {
        currentFamilyKey = null;
      }     
    }
    if (currentFamilyKey) {//if we have a family key, (stored or newly retrieved)
      currentFamilyKey = currentFamilyKey.familyKey ? currentFamilyKey.familyKey : currentFamilyKey;
      this.storage.set('familyKey', currentFamilyKey);//save the family key
      console.log("getting persons for: ", currentFamilyKey);
      
      let personList = await this.api.getPersons(currentFamilyKey)//get list of persons for a family
      .catch((error) => {
        const message = this.alert.create({
          title: 'Error',
          subTitle: error.message,
          buttons: ['OK']
        });
        message.present();
      });
    
      console.log("persons:" , personList);
      if (personList && personList[0]) {//if there is at least one person
        this.addMarkers(personList);//adds all the markers for each person's start event
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

  //add markers on a map for all persons
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

      this.markers.push(pin);//push the pin to an array
    });
  }

  goToSettingsPage() {
    this.navCtrl.push(SettingsPage);
  }

  goToCreatePersonPage() {
    this.navCtrl.push(CreatePersonPage);
  }
}