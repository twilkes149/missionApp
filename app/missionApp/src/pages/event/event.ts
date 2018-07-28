import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController } from 'ionic-angular';

//providers
import { ApiProvider } from '../../providers/api/api'; 
import { DatePicker } from '@ionic-native/date-picker';

@Component({
  selector: 'page-event',
  templateUrl: 'event.html',
  providers: [ApiProvider]
})
export class EventPage {  
  public name:string;  
  private event:any;
  private person:any
  
  public date:any;//used for the date objects
  public displayDate:string;
  public description:string;
  public title:string;
  public showSubmit:boolean;

  constructor (public navCtrl: NavController,
    private api: ApiProvider,
    public params: NavParams,
    public alert: AlertController,
    public datePicker: DatePicker,
    public loading: LoadingController) {

    this.event = this.params.get('event');//get event that is passed in
    if (this.event) {
      this.name = this.event.title;
      this.description = this.event.description;
      this.event.date = this.event.date ? this.event.date : 'Pick date';
      this.displayDate = this.cleanDate(this.event.date);
    }
    else {
      this.name = "Create Event";
      this.description = '';
      this.person = this.params.get('person');
      this.date = new Date();
      this.displayDate = "Pick date";
    }
  }

  //puts date in correct format
  cleanDate(date:string) {
    return date.replace(/T.*$/g,'');
  }

  pickDate() {
    this.datePicker.show({
      date: new Date(this.event ? this.event.date : 0),
      titleText: 'Pick a date',
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK,
      minDate: new Date('1830-2-2'),
    }).then(
      date => {
        this.date = date;

        //display date on button
        this.displayDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
        console.log(this.displayDate);
      },
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  goBack() {
    this.navCtrl.pop();
  }

  //calls api to delete an event by its id
  deleteEvent() {
    if (!this.event || !this.event.id) {//dont delete an event if we don't have id
      return;
    }

    //show loading indicator
    const loader = this.loading.create({
      content: "Loading...",
      dismissOnPageChange: true,
    });
    loader.present();

    this.api.deleteEvent(this.event.id)
    .then((response) => {
      this.navCtrl.pop();//return to prev page
    })
    .catch((error) => {
      const message = this.alert.create({
        title: 'Error',
        subTitle: error.message,
        buttons: ['OK']
      });
      message.present();
    })
    .then(() => {
      loader.dismiss();
    });
  }

  updateEvent() {    
    this.event.description = this.description;//update description
    this.event.date = this.date;

    //show loading indicator
    const loader = this.loading.create({
      content: "Loading in...",
      dismissOnPageChange: true,
    });
    loader.present();

    this.api.updateEvent(this.event)
    .then((result) => {
      const message = this.alert.create({
        title: 'Success',
        subTitle: 'Updated event',
        buttons: ['OK']
      });
      message.present();
    })
    .catch ((error) => {
      const message = this.alert.create({
        title: 'Error',
        subTitle: error.message,
        buttons: ['OK']
      });
      message.present();
    })
    .then (() => {
      loader.dismiss();
    });   
  }

  //calls api to create an event
  async createEvent() {    
    if (this.title && this.description) { 
      //show loading indicator
      const loader = this.loading.create({
        content: "Loading in...",
        dismissOnPageChange: true,
      });
      loader.present();

      let event = {//create event object
        title: this.title,
        description: this.description,
        personId: this.person.id,
        familyKey: this.person.familyKey,
        date: this.date,
      };

      this.api.createEvent(event)
      .then((response) => {
        this.navCtrl.pop();//return to previous page
      })
      .catch((error) => {
        const message = this.alert.create({
          title: 'Error',
          subTitle: error.message,
          buttons: ['OK']
        });
        message.present();
      })
      .then(() => {
        loader.dismiss();//disiss the loading indicator
      });
    }
  }

  checkInput() {
    //console.log("checking", this.description, this.event.description);    
    if (this.description != this.event.description) {
      this.showSubmit = true;      
    }
    else {
      this.showSubmit = false;
    }
  }
}