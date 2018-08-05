import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

//pages
import { EventPage } from '../event/event';
import { EditPersonPage } from '../editPerson/editPerson';
import { GoogleMapPage } from '../googleMap/googleMap';

//modal
import { Modal } from '../../components/modal/modal';

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
    public storage: Storage,
    public modal: ModalController,
    private api: ApiProvider) { 

    //get info for person    
    this.person = this.params.get('person');
    this.cleanDates();
    this.personId = this.person.id;
    
    this.name = this.person.firstName + ' ' + this.person.lastName;
    this.gender = (this.person.gender == 'm') ? 'man' : 'woman';     
    this.update = false; //we set this to true when we leave the page, so tell us to call api to update the view  
  } 

  viewMap() {
    this.storage.set('rootPerson', this.person);//save this person as the root
    this.navCtrl.popTo(GoogleMapPage);//go back to google map
  }

  sortPersonParents(person) {
    return person.parents.sort((a, b) => {
      return a.firstName.localeCompare(b.firstName);
    });
  } 

  async ionViewWillEnter() {//when we come back from a previous page, load person from api
    if (this.person && this.person.parents) {
      this.person.parents = this.sortPersonParents(this.person);
    }
    if (!this.update) {//only call api when we need to update
      return;
    }
    else {
      this.update = false;
    }
    this.api.getPerson(this.personId)
    .then((response:any) => {      
      this.person = response.person;
      this.person.parents = this.sortPersonParents(this.person);
      this.cleanDates();
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

  async goToPerson(id) {
    let response:any = await this.api.getPerson(id);
    console.log('getting person', response);
    this.navCtrl.push(PersonPage, {person: response.person});//go to person view for parent
  }

  //this is the callback function for selecting parents modal
  async saveParents(parents) {
    console.log(parents);
    let body = {
        id: this.personId,
        parents: Array.from(parents)      
    };

    await this.api.updatePerson(body)
    .catch((error) => {      
      const message = this.alert.create({
        title: 'Error',
        subTitle: error.message,
        buttons: ['OK']
      });
      message.present();
    });
    this.update = true;
    this.ionViewWillEnter();
  }

  async selectParents() {
    let familyKey = await this.storage.get('familyKey');
    let persons = await this.api.getPersons(familyKey);

    let modal = this.modal.create(Modal, {modalTitle: 'Select Parents', 
      inputFields: persons, saveCallback: this.saveParents.bind(this), 
      currentParents: this.person.parents});
    modal.present();
  }

  //a function to remove all of the unneeded things on dates
  cleanDates() {
    for (let event of this.person.events) {
      if (event.date) {
        event.date = event.date.replace(/T.*$/g, '');        
      }
    }
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