# Intro
This project is two parts. The first is an API, and second an app. The api uses, as its base, the code from [baseServer](https://github.com/twilkes149/baseServer).

# Getting started
After cloning the repo
run npm install

Create a file called .env in the root project directory called .env and define values for:
- Server port
- database host
- database username
- database password
- database database
- authToken generator secret

An exmple definition is as follows:
```
SERVER_PORT = '8080'

DB_USERNAME = 'username'
DB_PASSWORD = 'password'
DB_HOST = 'localhost'
DB_DATABASE = 'databaseName'

TOKEN_SECRET = 'mysecret'
MAIL_TOKEN = 'send grid mail token'
MAIL_FROM_ADDRESS = 'no-reply@your-domain.com' 
```
# Tables
## Users
Fields:
- password
- firstName
- lastName
- email
- emailConfirmed (true if client has confirmed email)

## Confirm Token
- value (used to verify if user is the same one that we sent an email to)
- email

## Forgot password
- value (used to verify user, sent in an email)
- email
- created at (used to verify that token has been recently created)

## Families
- key
- name

## FamilyUser
- email
- familyKey

## Person
- ID
- firstName
- lastName
- gender
- parentId
- description
- familyKey

## Event
- ID
- title
- description
- lat
- lng
- personId
- familyKey

