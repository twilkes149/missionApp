# Intro
This is the documentation for the api

# Routes

On all routes, if there was an error the response will be:
{
  success: false,
  message: 'The cause of the error'
}

## /login
Request:
Method: POST
Parameters: 
```
{
  username: 'username',
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
  "username":"username",
  "password":"password",
  "firstname":"Name",
  "lastname":"Last Name",
  "email": "test@test.com"
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