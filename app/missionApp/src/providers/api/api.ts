import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http';
import {Storage} from '@ionic/storage';

/*
  Generated class for the ApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiProvider {
  //private baseUrl = 'https://twilkes-base-server.herokuapp.com/';
  private baseUrl = 'http://192.168.1.6:8080/';
  private geocodeURL = 'https://maps.googleapis.com/maps/api/geocode/json';
  private apiKey = 'AIzaSyD4Fy4u7GOluh_P7fts8v6Cd9_ptlCQ8Os';  
  private authToken;  
  private familyKeys;
  private persons;

  constructor(public http: HTTP, private storage: Storage) {
    console.log('Hello ApiProvider Provider');
    this.authToken = null;
    this.familyKeys = null;
    this.persons = null;
  }

  getLocation(query) {
    this.http.setDataSerializer('json');
    return new Promise((resolve, reject) => {
      let body = {
        address: query,
        key: this.apiKey,
      }
      this.http.get(this.geocodeURL, body, {})
      .then((response) => {
        let result:any = JSON.parse(response.data);
        resolve(result);
      })
      .catch((error) => {
        console.log('google api error', error);
        reject({error: 'Error searching'});
      });      
    });
  }

  async getAuthToken() {
    if (!this.authToken) {
      return await this.storage.get('authToken');
    }
    else {
      return this.authToken;
    }
  }

  //function to get all of the persons of a specific family
  async getPersons(familyKey) {
    this.http.setDataSerializer('json');    
    if (this.persons) {
      return Promise.resolve(this.persons);
    }
    else {
      let authToken = await this.getAuthToken();
      return new Promise((resolve, reject) => {
        
        let body = {
          authToken: '' + authToken,
          familyKey: '' + familyKey,
        };
        this.http.get(this.baseUrl + 'person', body, {})
        .then((response) => {
          this.persons = JSON.parse(response.data).person;
          resolve(this.persons);
        })
        .catch((error) => {
          console.log(error);
          if (error.error)      
            reject(JSON.parse(error.error));
          else//not sure what happened
            reject({message: "Unknown error occured"});
        });
      });
    }
  }

  //gets a list of all the families this user belongs to
  //object returned has structure: {name: '', familyKey: }
  async getFamilyKeys() {
    this.http.setDataSerializer('json'); 
    let authToken = await this.getAuthToken();   
    if (this.familyKeys) {
      return Promise.resolve(this.familyKeys);
    }
    else {
      return new Promise((resolve, reject) => {
        let body = {
          authToken: ''+authToken,
        };
        this.http.get(this.baseUrl + 'family', body, {})
        .then((response) => {
          this.familyKeys = JSON.parse(response.data);
          resolve(this.familyKeys);
        })
        .catch((error) => {
          console.log(error);
          if (error.error)      
            reject(JSON.parse(error.error));
          else//not sure what happened
            reject({message: "Unknown error occured"});
        });
      });
    }
  }

  //calls api for login and returns promise
  login(email, password) {
    this.http.setDataSerializer('json');
    if (this.authToken) {
      return Promise.resolve(this.authToken);
    }
    else {
      let body = {
        email: email,
        password: password,
      };

      return new Promise((resolve, reject) => {
        this.http.post(this.baseUrl + 'login', body, {})
        .then((response) => {          
          this.authToken = JSON.parse(response.data).token;//save the auth token   
          this.storage.set('authToken', `${this.authToken}`);
          resolve(this.authToken);
        })
        .catch((error) => {//let user know something happened, probalby not caused by my api
          if (error.error)      
            reject(JSON.parse(error.error));
          else//not sure what happened
            reject({message: "Unknown error occured"});
        });
      });
    }
  }

  //calls api for register and returns a promise
  register(password, email, firstName, lastName) {
    this.http.setDataSerializer('json');
    if (this.authToken) {
      return Promise.resolve(this.authToken);
    }
    else {
      return new Promise((resolve, reject) => {
        let body = {          
          email: email,
          password: password,
          firstname: firstName,
          lastname: lastName,
        };

        this.http.post(this.baseUrl + 'register', body, {})
        .then((response) => {
          this.authToken = JSON.parse(response.data).token;//save the auth token  
          this.storage.set('authToken', `${this.authToken}`);       
          resolve(this.authToken);
        })
        .catch((error) => {
          if (error.error)
            reject(JSON.parse(error.error));
          else //not sure what happened, probably an error not cause by my api
            reject({messagae: "Unknown error occured"});
        });
      });
    }
  }

  forgotPassword(email) {
    this.http.setDataSerializer('json');
    return new Promise((resolve, reject) => {
      let body = {
        email: email,
      };

      this.http.post(this.baseUrl + 'forgotPassword', body, {})
      .then((response) => {
        resolve(JSON.parse(response.data));
      })
      .catch ((error) => {
        if (error.error)
          reject(JSON.parse(error.error));
        else //not sure what happened, probably an error not cause by my api
          reject({message: "Unknown error occured"});
      });
    });
  }

  //the token comes from the email, password is the new password
  resetPassword(token, password) {
    this.http.setDataSerializer('json');
    return new Promise((resolve, reject) => {
      let body = {
        password: password,
        token: token,
      };
      this.http.post(this.baseUrl + 'resetPassword', body, {})
      .then((response) => {
        this.logout();
        resolve(JSON.parse(response.data));        
      })
      .catch((error) => {
        if (error.error)
          reject(JSON.parse(error.error));
        else //not sure what happened, probably an error not cause by my api
          reject({message: "Unknown error occured"});
      });
    });
  }

  //destroys current user data
  logout() {
    this.authToken = null;
    this.storage.set('authToken', null);
    this.storage.set('email', null);
    this.storage.set('password', null);
  }
}
