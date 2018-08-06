import { Component } from '@angular/core';
import { NavController, AlertController, ToastController } from 'ionic-angular';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  ILatLng,
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
  private lines;
  private drawLines:boolean;

  private personMap;
  private rootPersons;

  constructor(public navCtrl: NavController, 
    private api: ApiProvider,
    public alert: AlertController,
    public toast: ToastController,
    private storage: Storage) {

    this.familyKeys = null;
    this.persons = [];
    this.currentPerson = null;
    this.addMarkers = this.addMarkers.bind(this);    
    this.markers = [];
    this.lines = [];

    this.personMap = {};
    this.rootPersons = new Set();
  }

  //remove all the map markers and polylines when we leave
  ionViewWillLeave() {
    this.markers.forEach((marker) => {
      marker.remove();
    });
    this.lines.forEach((line) => {
      line.remove();
    })
    this.markers = [];    
    this.lines = [];
    this.rootPersons.clear();
  }

  //load the map once this screen has loaded
  ionViewDidLoad() {
    this.loadMap();
  }

  //runs everytime this becomes the active screen
  async ionViewDidEnter() {
    //await this.storage.set('familyKey', null);
    let currentFamilyKey = await this.storage.get('familyKey');//grab stored family key, to load persons
    let rootPerson = await this.storage.get('rootPerson');
    this.drawLines = await this.storage.get('connectingLines');

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
      //console.log("getting persons for: ", currentFamilyKey);
      
      let personList = await this.api.getPersons(currentFamilyKey)//get list of persons for a family      
      .catch((error) => {
        const message = this.alert.create({
          title: 'Error',
          subTitle: error.message,
          buttons: ['OK']
        });
        message.present();
      });
      this.persons = personList; 
      this.makePersonMap(personList);
      //rootPerson = personList[4];     
          
      if (!rootPerson && personList && personList[0]) {//if there is at least one person, and we are viewing a vanilla map
        this.addMarkers(personList);//adds all the markers for each person's start event
        console.log('adding traditional markers');
      }
      else {
        let groups = rootPerson.children.length;//number of descendant groups
        this.drawFamilyTreeMarkers(groups, rootPerson);
        console.log('adding family tree markers');
      }
      console.log('markers', this.markers);
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

  // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
  // Adam Cole, 2011-Sept-14
  // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
  rainbow(numOfSteps, step) {    
    let r, g, b;
    let h = step / numOfSteps;
    let i = ~~(h * 6);
    let f = h * 6 - i;
    let q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    let c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
  }

  makePersonMap(personList) {    

    //making a map of persons
    personList.forEach((person, index) => {      
      
      //getting root persons
      //a root person is someone who has no parents, but at least one child
      if ((!person.parents || !person.parents.length) && (person.children && person.children.length)) {
        this.rootPersons.add(person);
      }
      /*else {
        this.personMap[person.id] = person;
      }*/
      this.personMap[person.id] = person;
    });
    console.log('personMap: ', this.personMap, ' root persons: ', this.rootPersons);
  }

  loadMap() {
    let mapOptions: GoogleMapOptions = {
      camera: {       
         zoom: 5,
         tilt: 0
       }
    };    
    this.map = GoogleMaps.create('mapCanvas', mapOptions);
    this.map.on(GoogleMapsEvent.MAP_LONG_CLICK).subscribe((params: any[]) => {//user long clicks the map
      this.storage.remove('rootPerson');//clear the root person
      this.ionViewWillLeave();
      this.ionViewDidEnter();
      //let user know they reset the view
      let toast = this.toast.create({
        message: 'Map View reset',
        duration: 2000,
        cssClass: 'borderRadius',
        position: 'middle'
      });

      toast.present();
    });
  }

  drawFamilyTreeMarkers(groups, rootPerson) {        
    this.addMarker(this.rainbow(groups+1, 0), rootPerson, null);//drawing marker for root person
    rootPerson.children.forEach((child, index) => {//draw marker for children      
      this.addMarker(this.rainbow(groups+1, index+1), child, rootPerson);
    });
  }

  //adds a marker on the map @ person's _START event location
  addMarker(color, person, parent) {   

    let pin: Marker = this.map.addMarkerSync({
      title: person.firstName + ' ' + person.lastName,
      icon: color,//coloring the marker
      animation: 'DROP',
      position: {
        lat: this.personMap[person.id].events[0].lat,
        lng: this.personMap[person.id].events[0].lng
      }
    });
        
    if (parent && this.drawLines) {//draw line from this marker, to parent's marker
      let parentLoc: ILatLng = {lat: this.personMap[parent.id].events[0].lat, lng: this.personMap[parent.id].events[0].lng};
      let personLoc: ILatLng = {lat: this.personMap[person.id].events[0].lat, lng: this.personMap[person.id].events[0].lng};

      let options = {
        points: [parentLoc, personLoc],
        color: color,
        clickable: false,
        width: 2
      };      
      let polyLine = this.map.addPolylineSync(options);
      this.lines.push(polyLine);
    }

    pin.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
      pin.showInfoWindow();
      this.currentPerson = this.personMap[person.id];
    });

    pin.on(GoogleMapsEvent.INFO_CLICK).subscribe(() => {//when the info window is clicked
      //console.log(this.currentPerson);
      this.navCtrl.push(PersonPage, {person: this.currentPerson});//go to the person page
    });

    this.markers.push(pin);//push the pin to an array

    if (parent) {//if this person has a parent, add markers for the children
      //draw markers for each of this person's children
      this.personMap[person.id].children.forEach(child => {
        this.addMarker(color, child, person);
      });
    }
  }

  //add markers on a map for all persons
  addMarkers(persons) {
    persons.forEach((person) => {
      if (!person.events || !person.events[0])//don't add marker if there is no event
        return;

      let pin: Marker = this.map.addMarkerSync({
        title: person.firstName + ' ' + person.lastName,
        icon: 'red',
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
        //console.log(this.currentPerson);
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