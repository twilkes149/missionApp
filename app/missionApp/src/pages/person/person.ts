import { Component } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';

//pages
import { EventPage } from '../event/event';
import { EditPersonPage } from '../editPerson/editPerson';

@Component({
  selector: 'page-person',
  templateUrl: 'person.html',
})
export class PersonPage {
  public person:any;
  public name:string;
  public gender:string;

  constructor(public navCtrl: NavController,     
    public params: NavParams,
    public alert: AlertController) {    

    //get info for person
    this.person = params.get('person');

    console.log('got person', this.person);
    this.name = this.person.firstName + ' ' + this.person.lastName;
    this.gender = (this.person.gender == 'm') ? 'man' : 'woman';
  }

  goToEditPersonPage() {
    this.navCtrl.push(EditPersonPage, {person: this.person});
  }

  goBack() {
    this.navCtrl.pop();
  }

  gotToEvent(event) {
    this.navCtrl.push(EventPage, {event: event});//go to the event page
  }

  createEvent() {
    console.log('create event');
    this.navCtrl.push(EventPage, {person: this.person});
  }
}