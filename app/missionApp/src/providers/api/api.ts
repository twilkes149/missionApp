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
  private baseUrl = 'http://192.168.1.140:8080/';
  static authToken;  
  static familyKeys;

  constructor(public http: HTTP) {
    console.log('Hello ApiProvider Provider');
    ApiProvider.authToken = null;
    ApiProvider.familyKeys = null;
  }

  //gets a list of all the families this user belongs to
  //object returned has structure: {name: '', familyKey: }
  getFamilyKeys() {
    this.http.setDataSerializer('json');    
    if (ApiProvider.familyKeys) {
      return Promise.resolve(ApiProvider.familyKeys);
    }
    else {
      return new Promise((resolve, reject) => {
        let body = {
          authToken: ''+ApiProvider.authToken,
        };
        this.http.get(this.baseUrl + 'family', body, {})
        .then((response) => {
          ApiProvider.familyKeys = JSON.parse(response.data);
          resolve(ApiProvider.familyKeys);
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
    if (ApiProvider.authToken) {
      return Promise.resolve(ApiProvider.authToken);
    }
    else {
      let body = {
        email: email,
        password: password,
      };

      return new Promise((resolve, reject) => {
        this.http.post(this.baseUrl + 'login', body, {})
        .then((response) => {          
          ApiProvider.authToken = JSON.parse(response.data).token;//save the auth token          
          resolve(ApiProvider.authToken);
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
    if (ApiProvider.authToken) {
      return Promise.resolve(ApiProvider.authToken);
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
          ApiProvider.authToken = JSON.parse(response.data).token;//save the auth token         
          resolve(ApiProvider.authToken);
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
    ApiProvider.authToken = null;
  }
}
