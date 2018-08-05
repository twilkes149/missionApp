# Intro
This app will display family trees for missionaries.

# Pages
## Login
This is a normal login page

## Register
This is a normal register page

## Forgot/reset password
Ths is a normal forgot/reset password page

## Create/Join/Share Family
This is the main landing page if the user is not part of any families. 
Here they will be able to create a new family, join an existing family (if they supply an ID), or Share a family

## Map
This page will show a google map. There will be markers on the map in the mission where they served. Lines can be draw to connect "ancestors" together. 
Clicking on a marker will display a small bit of information about the person on the bottom. If they click on that area, they will be taken to the view person page.

### Viewing Family Tree Lines
In the settings menu will be an option to toggle between view family tree lines. If this is enabled, lines will be drawn on the map from the markers of parents to children. Common descendants will be color coded based on a root person. The root person can change, but by default the root person will be a person who has no parents and has children. There can be multiple root persons, in which case each will be trated as a seperate group. Each child (and their descendants) of a root person will be grouped by color. The root person can be selected in the person page, by clicking "view map as" button.

#### Process:
1. Get root persons
Select from tables where 

## View Person
Here the user will be able to see all of the information about a person: name, gender, description, and list of events. Clicking on edit will take them to the edit person page. Clicking on add event will take them to the create/edit event page. If they click on an already created event they will be taken to the create/edit event page.

## Edit person
Here the person can change any of the fields related to a person.

## Create/Edit event
This page will have inputs for the fields of an event (they will be prefilled out if editing an existing event)

## Settings
Includes settings for:
- map type
- map marker color
- map connecting lines (enable/disable)
- map connecting line color
- link to share/create/join family page
- which family to view