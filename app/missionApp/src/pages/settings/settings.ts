import { Component } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';

//providers
import { ApiProvider } from '../../providers/api/api';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
  providers: [ApiProvider]
})
export class SettingsPage {
  public families;
  public currentFamily;

  constructor(public navCtrl: NavController,     
    public params: NavParams,
    public alert: AlertController,
    private api: ApiProvider,
    private storage: Storage) {
  }

  async ionViewWillEnter() {
    this.families = await this.api.getFamilyKeys()    
    .catch((error) => {
      this.families = null;
    });

    //take out all of the ' marks in the name
    if (this.families) {
      this.families.map((family) => {
        family.name = family.name.replace(/^'|'$/g, '');
        return family;
      });
    }
  }

  goBack() {
    this.navCtrl.pop();
  }

  ionViewWillLeave() {    
    if (this.currentFamily) {
      console.log('saving currentFamily:', this.currentFamily);
      this.storage.set('familyKey', this.currentFamily);
    }
  }
}