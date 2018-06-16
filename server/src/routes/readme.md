# Intro
This is the documentation for the api

# Unauthorized Routes

On all routes, if there was an error the response will be:
{
  success: false,
  message: 'The cause of the error'
}

A client does not need to "login/register" to use any of the following routes

## /login
Request:
Method: POST
Parameters: 
```
{
  email: 'your-email@domain.com',
  password: 'mypassword'
}
```

Response:
```
{
  success: true,
  message: 'Successfully logged in',
  token (optional, only present on success): 'the auth token'
}
```

## /register
Method: POST
Parameters:
```
{  
  "password":"password",
  "firstname":"Name",
  "lastname":"Last Name",
  "email": "test@test.com",  
}
```
Respone: 
```
{
  success: true,
  message: 'Successfully registered',
  token (optional, only present on success): 'the auth token'
}
```

## /confirmEmail
Method: GET
Parameters:
token='the token from email'

Response:
If success response is in HTML

if error:
```
{
  success: false,
  message: 'The error mesage'
}
```


## /forgotPassword
Method: POST
Parameters:
```
{
  email: 'your-email@domain.com'
}
```

Response:
```
{
    "success": true,
    "message": "Email successfuly sent"
}
```

## /resetPassword
Method: POST
Parameters:
```
{
  "token": "token from email",
  "password": "new password"
}
```

Response:
```
{
    "success": true,
    "message": "Successfully updated password"
}
```

# Authorized routes
A client will need to obtain an authToken prior to using the following routes. This is done through logging in

## /createFamily
Method: POST
Request:
```
{
  familyName: 'name of the family',
  token: 'the auth token'
}
```
Response:
```
{
  success: true,
  message: 'Created family'
}
```

## /joinFamily
Method: POST
Request:
```
{
  familyKey: 'key of the family to join',
  token: 'the auth token'
}
```
Response:
```
{
  success: true,
  message: 'joined family'
}
```

## /family
Method: GET
Param: authToken
Response (a list of all of the users families):
```
[
  {
    familyName: 'name of family',
    familyKey: 'the id of the family'
  },
]
```

## /person
Method: GET
Param: authToken, familyKey or personId
Response (list of all persons)
```
[
  {
    id: 'the id of this person'
    firstName: 'name',
    lastName: 'name',
    gender: 'm/f',
    description: 'the description',
    parentId: ['id of parent', 'id of parent'],
    familyKey: 'the key',
    events: [<list of events>]
  },
]
```

## /person
Method: POST
Request:
```
{
  authToken: 'user's authToken',  
  firstName: 'name',
  lastName: 'name',
  gender: 'm/f',
  description (optional): 'the description',
  parentId (optional): ['id of parent', 'id of parent'],
  familyKey: 'the key of family this perosn belongs to',

  //not required
  startEvent: { //every person will have a psuedo event (title: '_START') that describes their mission home (this is where the pin on the map will be located)
    lat: 'lat of mission home',
    lng: 'lng of mission home',
    address: 'string of address',    
  }
}
```

Response:
```
{
  success: true,
  message: 'Create person'
}
```

## /person
Method: PUT
Request:
```
{
  authToken: 'user's authToken',  
  id: 'the id of the person to edit'

  firstName (optional): 'name',
  lastName (optional): 'name',
  gender (optional): 'm/f',
  description (optional): 'the description',
  parentId (optional): ['id of parent', 'id of parent'],
  familyKey (optional): 'the new family key of the person'
}
```

Response:
```
{
  success: true,
  message: 'Updated person'
}
```

## /person
Method: DELETE
Request
```
{
  authToken: 'user's authToken',
  id: 'the id of the person to delete'
}
```

Response:
```
{
  success: true,
  message: 'Deleted person'
}
```

## /event
Method: GET
Params: authToken, familyKey or personId
Response:
```
{
  id: 'id of the event',
  title: 'event title',
  description: 'event description',
  lat: 'event lat',
  lng: 'event lng',
  personId: 'person id this event belongs to',
  familyKey: 'family key this event belongs to'
}
```

## /event
Method: POST
Request:
```
{
  authKey: 'the user's authKey',
  id: 'id of the event',
  title: 'event title',
  description: 'event description',
  lat: 'event lat',
  lng: 'event lng',
  personId: 'person id this event belongs to',
  familyKey: 'family key this event belongs to'
}
```

Response:
```
{
  success: true,
  message: 'created event'
}
```

## /event
Method: PUT
Request:
```
{
  authKey: 'the user's authKey',
  id: 'id of the event',
  title (optional): 'event title',
  description (optional): 'event description',
  lat (optional): 'event lat',
  lng (optional): 'event lng',
  personId (optional): 'person id this event belongs to',
  familyKey (optional): 'family key this event belongs to'
}
```

Response:
```
{
  success: true,
  message: 'updated event'
}
```

## /event
Method: DELETE
Request
```
{
  authToken: 'user's authToken',
  id: 'the id of the event to delete'
}
```

Response:
```
{
  success: true,
  message: 'Deleted event'
}
```