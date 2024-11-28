# PortfolioOAuthProject
Web Server Project 2

HOW TO RUN ON LOCALHOST:
    
        - Clone the repository
        - Run `npm install` in the root directory
        - Run `node app.js` in the root directory (Do not use nodemon as it will log you out when the JSON files are updated)
        - Open a browser and go to `127.0.0.1:3000`

DONE:

    - Implemented Google OAuth
    - Navbar
    - Footer (Shows which backend server + IP the user is seeing)

    -Basic Pages
        - My Portfolio
            - Add/Edit Personal Info
            - User Info stored in users.json
            - Upload/Edit Profile Picture (With proper replacement of old picture to save space)
        - My Projects
            - Add/Edit Projects
            - Projects stored in projects.json
        - My GitHub Contributions
            - Store Users' GitHub Usernames
            - GitHub Calander Widget Script Added and Works
            - Checks if the Github Username is valid
            - Loading Message and Error Message if Username is invalid
        - Login Page with Google OAuth Only

    - JSON files for storing user data (users.json for porfolio page, projects.json for projects page, github.json for github username)

DONE (Deploy + Load Balancing)

    - Setup Digital Ocean Droplet (1 Load Balancer, 2 App Instances)
    
    - NGINX/Load Balancer Stuff
        - Installed HAProxy on the Load Balancer (Using Round Robin Algorithm)
        - Installed NGINX on backend instances
        - Installed Redis on backend instances to store user data properly (login will not work properly with 2 instances without Redis)
        - Configured NGINX to load balance between two instances of the app
        - Implemented SSL using Certbot and Let's Encrypt (For HTTPS)
        - Created a script to automatically renew the SSL certificate
        - Installed "Unison" to sync json files (so no matter what backend server they choose, their user data will be the same). Setup systemd timer to sync every minute

TO DO:

    - Improve CSS/Portfolio Page(s)
    
    - Documentation
    - Presentation




