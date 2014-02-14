     _____                         
    /\___ \          __            
    \/__/\ \    ___ /\_\    ___    
       _\ \ \  / __`\/\ \ /' _ `\  
      /\ \_\ \/\ \L\ \ \ \/\ \/\ \ 
      \ \____/\ \____/\ \_\ \_\ \_\
       \/___/  \/___/  \/_/\/_/\/_/
                                   
==================

### Setup ###
* install NodeJS and MongoDB.
* install dependencies: run ```npm install```

### Seed data ###
Empty all collections
```
  grunt db-reset
```
Seed sample data
```
  grunt db-seed
```
### Start server ###
* Start mongoDB server: run ```mongod```
* Start Join server: run ```npm start```
* Start server with Nodemon (for development): run ```nodemon app.js```

### Automated testing ###
* Download the Selenium server from https://code.google.com/p/selenium/downloads/list
* Download Chrome driver binary from http://chromedriver.storage.googleapis.com/index.html
* For testing on Chrome: you need to config the path in the Nightwatch module folder -> bin -> settings.json
* Run Selenium server: run ```java -jar selenium-server-standalone-2.39.0.jar```
* Run test runner ```node nightwatch.js```
