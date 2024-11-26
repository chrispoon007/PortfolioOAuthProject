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

TO DO:

    - Improve CSS/Portfolio Page(s)

    - Setup Digital Ocean Droplet
    - NGINX/Load Balancer Stuff
    - Documentation
    - Presentation




