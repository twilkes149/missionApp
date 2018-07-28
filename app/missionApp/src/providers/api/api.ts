import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http';
import { Storage } from '@ionic/storage';

/*
  Generated class for the ApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiProvider {  
  //private baseUrl = 'http://192.168.1.9:8080/';
  //private baseUrl = 'https://192.168.1.6:8080/';
  private baseUrl = 'http://68.102.87.94:8080/';
  private geocodeURL = 'https://maps.googleapis.com/maps/api/geocode/json';
  private apiKey = 'AIzaSyD4Fy4u7GOluh_P7fts8v6Cd9_ptlCQ8Os';  
  private authToken;  
  private familyKeys;
  private persons;

  constructor(public http: HTTP, private storage: Storage) {    
    //this.http.acceptAllCerts(true);
    this.authToken = null;
    this.familyKeys = null;
    this.persons = null;
  }

  //api for joining a family
  async joinFamily(token) {
    this.http.setDataSerializer('json');
    let authToken = await this.getAuthToken();

    let body = {
      authToken: authToken,
      token: token,
    };

    return new Promise((resolve, reject) => {
      this.http.post(this.baseUrl + 'joinFamily', body, {})
      .then((response) => {
        resolve(JSON.parse(response.data));
      })
      .catch((error) => {
        //console.log('error joining family', error);
        reject(JSON.parse(error.error));
      });
    });
  }

  //api for sharing a family
  async shareFamily(familyKey) {
    this.http.setDataSerializer('json');
    let authToken = await this.getAuthToken();
    
    let body = {
      authToken: authToken,
      familyKey: familyKey,
    };

    return new Promise((resolve, reject) => {
      this.http.post(this.baseUrl + 'shareFamily', body, {})
      .then((response) => {
        resolve(JSON.parse(response.data));
      })
      .catch ((error) => {
        //console.log('error sharing family', error);
        reject(JSON.parse(error.error));
      });
    })
  }

  //api for creating a family
  async createFamily(familyName) {
    this.http.setDataSerializer('json');
    let authToken = await this.getAuthToken();

    let body = {
      authToken: authToken,
      familyName: familyName,
    };

    return new Promise((resolve, reject) => {
      this.http.post(this.baseUrl + 'createFamily', body, {})
      .then((response) => {
        resolve(JSON.parse(response.data));
      })
      .catch((error) => {
        //console.log('error creating family', error);
        reject(JSON.parse(error.error));
      });
    });
  }

  //api for updating a person
  async updatePerson(person) {
    this.http.setDataSerializer('json');
    let authToken = await this.getAuthToken();

    let body = {
      authToken: authToken,
      person: person,
    };

    return new Promise((resolve, reject) => {
      this.http.put(this.baseUrl + 'person', body, {})
      .then((response) => {
        resolve(JSON.parse(response.data));
      })
      .catch((error) => {
        //console.log('error updating person', error);
        reject(JSON.parse(error.error));
      });
    });
  }

  //api for deleting a person by id
  async deletePerson(personId) {
    this.http.setDataSerializer('json');
    let authToken = await this.getAuthToken();

    let body = {
      authToken: '' + authToken,
      id: '' + personId,
    };

    return new Promise((resolve, reject) => {
      this.http.delete(this.baseUrl + 'person', body, {})
      .then((response) => {
        resolve(JSON.parse(response.data));
      })
      .catch((error) => {
        //console.log('delete person error', error);
        reject(JSON.parse(error.error));
      });
    });
  }

  //api for creating a person
  async createPerson(person) {
    this.http.setDataSerializer('json');
    let authToken = await this.getAuthToken();
    let body = {
      authToken: authToken,
      person: person,
    };

    return new Promise((resolve, reject) => {
      this.http.post(this.baseUrl + 'person', body, {})
      .then((response) => {
        resolve(JSON.parse(response.data));
      })  
      .catch((error) => {
        //console.log('create person error', error);
        reject(JSON.parse(error.error));
      });
    });
  }

  //api for updating an event
  async updateEvent(event) {
    this.http.setDataSerializer('json');
    let authToken = await this.getAuthToken();
    let body = {
      authToken: authToken,
      event: event,
    }

    return new Promise((resolve, reject) => {
      this.http.put(this.baseUrl + 'event', body, {})
      .then((response) => {
        resolve(JSON.parse(response.data));
      })
      .catch((error) => {
        //console.log('error updating event', error);
        reject(JSON.parse(error.error));
      });
    });    
  }

  //an api for deleting an event by id
  async deleteEvent(eventId) {
    this.http.setDataSerializer('json');
    let authToken = await this.getAuthToken();
    let body = {//delete needs strings as well
      id: '' + eventId,
      authToken: '' + authToken
    };

    return new Promise((resolve, reject) => {
      this.http.delete(this.baseUrl + 'event', body, {})
      .then((response) => {
        resolve(JSON.parse(response.data));
      })
      .catch((error) => {
        //console.log('api delete event error', error);
        reject(JSON.parse(error.error));
      });
    });
  }

  //an api for creating an event
  //event must have: title, description, personId, familyKey
  async createEvent(event) {
    this.http.setDataSerializer('json');
    let authToken = await this.getAuthToken();
    let body = {
      event: event,
      authToken: '' + authToken,
    }
    return new Promise((resolve, reject) => {
      this.http.post(this.baseUrl + 'event', body, {})
      .then((response) => {
        resolve(JSON.parse(response.data));
      })
      .catch((error) => {
        //console.log(error);
        reject(JSON.parse(error.error));
      });
    });
  }

  //an api for getting the lat, lng from a query string
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
        //console.log('google api error', error);
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

  //gets infor for one person
  async getPerson(personId) {
    this.http.setDataSerializer('json');       
    let authToken = await this.getAuthToken();

    return new Promise((resolve, reject) => {
      let body = {//gets need to be strings
        id: '' + personId,
        authToken: '' + authToken,
      }
      this.http.get(this.baseUrl + 'person', body, {})
      .then((response) => {        
        resolve(JSON.parse(response.data));
      })
      .catch((error) => {        
        reject(JSON.parse(error.error));
      })
    });
  }

  //function to get all of the persons of a specific family
  async getPersons(familyKey) {
    this.http.setDataSerializer('json');    
    // if (this.persons) {
    //   return Promise.resolve(this.persons);
    // }
    // else {
      let authToken = await this.getAuthToken();
      return new Promise((resolve, reject) => {
        
        let body = {//gets need to be strings
          authToken: '' + authToken,
          familyKey: '' + familyKey,
        };
        this.http.get(this.baseUrl + 'person', body, {})
        .then((response) => {
          this.persons = JSON.parse(response.data).person;
          resolve(this.persons);
        })
        .catch((error) => {
          //console.log(error);
          if (error.error)      
            reject(JSON.parse(error.error));
          else//not sure what happened
            reject({message: "Unknown error occured"});
        });
      });
    //}
  }

  //gets a list of all the families this user belongs to
  //object returned has structure: {name: '', familyKey: }
  async getFamilyKeys() {
    this.http.setDataSerializer('json'); 
    let authToken = await this.getAuthToken();   
    // if (this.familyKeys) {
    //   return Promise.resolve(this.familyKeys);
    // }
    // else {
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
          //console.log(error);
          if (error.error)      
            reject(JSON.parse(error.error));
          else//not sure what happened
            reject({message: "Unknown error occured"});
        });
      });
   // }
  }

  //calls api for login and returns promise
  login(email, password) {
    this.http.setDataSerializer('json');
    // if (this.authToken) {
    //   return Promise.resolve(this.authToken);
    // }
    // else {
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
          console.log('login error', error);
          if (error.error && error.status >= 100)      
            reject(JSON.parse(error.error));
          else//not sure what happened
            reject({message: "Unknown error occured"});
        });
      });
    //}
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
  async logout() {
    this.authToken = null;
    this.familyKeys = null;
    this.persons = null;
    await this.storage.remove('authToken');
    await this.storage.remove('email');
    await this.storage.remove('password');
    await this.storage.remove('familyKey');
  }
}
