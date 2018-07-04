import { Component } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';

//pages
import { EventPage } from '../event/event';
import { EditPersonPage } from '../editPerson/editPerson';

//providers
import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'page-person',
  templateUrl: 'person.html',
  providers: [ApiProvider]
})
export class PersonPage {
  public person:any;
  public personId;
  public name:string;
  public gender:string;
  private update:boolean;

  constructor(public navCtrl: NavController,     
    public params: NavParams,
    public alert: AlertController,
    private api: ApiProvider) { 

    //get info for person    
    this.person = this.params.get('person');
    this.personId = this.person.id;
    
    this.name = this.person.firstName + ' ' + this.person.lastName;
    this.gender = (this.person.gender == 'm') ? 'man' : 'woman';     
    this.update = false; //we set this to true when we leave the page, so tell us to call api to update the view  
  }  

  async ionViewWillEnter() {//when we come back from a previous page, load person from api
    if (!this.update) {//only call api when we need to update
      return;
    }
    else {
      this.update = false;
    }
    this.api.getPerson(this.personId)
    .then((response:any) => {      
      this.person = response.person;
    })
    .catch((error) => {      
      const message = this.alert.create({
        title: 'Error',
        subTitle: error.message,
        buttons: ['OK']
      });
      message.present();
    });    
    this.gender = (this.person.gender == 'm') ? 'man' : 'woman';
  }

  confirmDelete() {
    const message = this.alert.create({
      title: 'Are you sure?',
      message: 'This will remove the person permanently',
      buttons: [
      {
        text: 'Cancel',
        handler: () => {
          //console.log('test');
        }      
      },
      {
        text: 'Delete',
        handler: () => {
          this.deletePerson();
        }
      }]
    });

    message.present();
  }

  deletePerson() {
    this.api.deletePerson(this.person.id)
    .then(() => {
      this.navCtrl.pop();
    })
    .catch((error) => {      
      const message = this.alert.create({
        title: 'Error',
        subTitle: error.message,
        buttons: ['OK']
      });
      message.present();
    });
  }

  ionViewWillLeave() {
    //page is leaving, so set the update flag
    this.update = true;
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
    this.navCtrl.push(EventPage, {person: this.person});
  }
}