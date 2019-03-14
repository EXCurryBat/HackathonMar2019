[TOC]

## Project Overview
Atlas started as a hackathon project in the iXp x IC hackathon in March 2018.

The original team members were Shea Faigan, Jingwei Zhang, Tanya Tan, Griffin Jarvis, and Barbara Jun.

#### Team 8
**Project Lead:** Shea Faigan

**Development Lead:** Shea Faigan

**Navigation Feature Lead:** Jingwei Zhang

**Booking Feature Lead:** Tanya Tan

**Project Management, Communication, and Resources:** Griffin Jarvis, Barbara Jun

#### New Team 8 (current team)
Xavier Sit

Jenny Song

Shannon Mitchell

Steve Cho

Jean-Paul Morneau



Atlas has two high-level goals:
- Increase internal productivity
- Facilitate a more open and comfortable office environment

#### Tech Stack
- React.JS (bootstrapped with create-react-app)
- Redux
- Semantic UI

#### Core Features
- Parameterized room searching
 - Users can search for rooms by name, floor, seats, and A/V equipment.
- Additional room details
 - Users can see details about a room, such as how many seats it has and what A/V equipment it has.
- Room and desk locating
 - Selecting a room or desk will drop a pin on the map where the room or desk is located.
- Cross-floor pathfinding
 - Users can navigate the office with a dynamic pathfinding tool
- Shareable sessions
 - Users can share the URL with colleagues and they will be able to see what the user sees.
- Map filters
 - Users can highlight the different parts of the map: bathrooms, kitchens, stairs, elevators, and for the first floor, amenities

## Maintenance
Regardless of if development (new features, bug fixes, etc.) on the application is being done, there are several components that must be kept up to date.

### Virtual Machine
- Keep the OS up to date
- Keep all software updated (e.g. node, npm, nginx, etc.)
- Clean up snapshots and logs periodically
- Periodically restart the VM

### Repository
- Keep the node packages updated
- Periodically check that there are no security vulnerabilities in the packages being used
- Update maps, rooms, desks, etc. when asked by facilities

### Extending the VM Booking
Renew the VM booking every 3 months (don't let it expire!)

[VM Booking Manager](http://mylab.wdf.sap.corp:1080/Home/Dashboard.aspx "VM Booking Manager")

### Renewing the PKI Certificate
The PKI certificate needs to be recreated every **2 years** so the application can be served over HTTPS. 

Date of expiry: **August 19, 2020**

If the certificate is not recreated after 2 years, web browsers will show a warning every time users use the application, which is NOT GOOD! In the future, browsers might not even support HTTPS, making this even more important.

#### How to create a PKI certificate

1. Open [SAP Web Enrollment](https://sapcerts.wdf.global.corp.sap/WebEnrollment.aspx "SAP Web Enrollment") and generate the certificate
 - Select the CA: SAPNetCA_G2: WebEnrollment
 - PKCS#10: Paste the contents of the code block below here
 - Certificate encoding: X.509
 - Submit Application
      - If it doesn't work, try copying the contents of the `CSR.csr` file in the root directory of the project, on the VM and use that, or generate a new CSR (see below). Also, make sure the "BEGIN CERTIFICATE REQUEST" and "END CERTIFICATE REQUEST" lines are included, and there are 5 standard dashes (-) on each side
 - Copy the certificate (including the start and end lines) to your clipboard

2.  `ssh [lowercase i-number]@atlas.van.sap.corp`

3. `cd /project-atlas`

4. `rm atlas.crt`

5. `nano atlas.crt` or `vim atlas.crt`

6. Paste the certificate (including the start and end lines) in the file and save.

7. Update the date of expiry shown above (the current date + 2 years - 1 day)

##### Atlas CSR
```
-----BEGIN CERTIFICATE REQUEST-----
MIICrzCCAZcCAQAwajELMAkGA1UEBhMCQ0ExGTAXBgNVBAgMEEJyaXRpc2ggQ29s
dW1iaWExEjAQBgNVBAcMCVZhbmNvdXZlcjEPMA0GA1UECgwGU0FQIFNFMRswGQYD
VQQDDBJhdGxhcy52YW4uc2FwLmNvcnAwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
ggEKAoIBAQDiUIHHgeDQ0mQiVlY+IbfC/zU06Nq6QSwlrNedwvSEuGTXXzyuBe5V
Wo0YYqQCRke+6sFmLfx3KmM4ihK5F4Okb881x+flxUC+LmiLEfBuDqml/7cmMYLT
llCcu6bEIqDEs0wuZm9w0zgavYA9g0EYtL8Eb7jnFf6PAXL9cHesK1foy9Sd0s+M
noiBsGEC/XjMcYrroiHZJqnDOtKtmri5TThpEh+FH4kB4XvQDBK5/jnAaZ6lPfyE
+ymxjruMN+TnkbGOSn25LcPaUskklrQEyxKVwuru09kQA+dHmjVCsXL81ZSGI2Qp
5sYHzN+nvbh0yvsXzJqmUP6Y/d6LgrPfAgMBAAGgADANBgkqhkiG9w0BAQsFAAOC
AQEAvD/rGrHMEDGbyHJce//XK5A9OAogYCs/g5hXcrwW2YTXIv3x/yA0olnNZQho
SMuEh0veJofE/l8e34UqwWmKqaoUYlVY4qzBTrlz8Wlk47+Kzu8sJwJz3557ZK7E
h7y5oN8IIO0mXZpqpQsL8BTMUKbjh91nwwSouHdsEpiZ0doEiMKAVHMrO8L1Pj9a
PMDt1wdULUiYiyLfvD8BoNaVSwTRRIFQJS7GHelL88z+RXjmvcWsa+SgzT6VvsYB
xfYmJ7zIiMJyWH1EOA9eDzOj4b/pZwtAqqykVlLMAmLEA3SqdlT/vNTIenW2yiAX
1VcEdmBafiTXC2AFDGuxa6aF/g==
-----END CERTIFICATE REQUEST-----
```

#### Generating a new CSR
You should not have to do this, but if you do, here is how. Please note that if you do this you will have to recreate the PKI certificate as well.

Also, please update the CSR that is in this document for future reference.

1. Connect to the VM via SSH

 `ssh [lowercase i-number]@atlas.van.sap.corp`

2. Generate the CSR and private key

 `openssl req -out CSR.csr -new -newkey rsa:2048 -nodes -keyout privatekey.key`
 - Country Name: CA
 - State or Province: British Columbia
 - Locality: Vancouver
 - Organization: SAP SE
 - Organizational Unit: (keep blank)
 - Common Name: atlas.van.sap.corp

After this, use the contents of the generated `CSR.csr` file as what to input in the web enrollment form.

## Development
My English teacher told me it was bad to have stacked headers, so here is some filler text.

### Setup
1. Clone this repository
2. `cd project-atlas`
3. `npm install`

### Running the Application
**`npm start`** will run the application in development mode. Open http://localhost:3000 to view it in the browser.

### Building for Production
**`npm run build`** will build the application and output to the `build` folder

### Updating and Restarting the Application
1. `ssh [lowercase i-number]@atlas.van.sap.corp`
2. `cd /project-atlas`
3. `git pull`
4. `npm run build`
5. `service nginx restart`

### nginx info
The `nginx` service looks at `/etc/nginx/nginx.conf` for default information.

In `nginx.conf`, there is a line that defines where to look for active sites. As per standards, it's looking in `/etc/nginx/sites-enabled`.

`sites-enabled` contains symlinks to `/etc/nginx/sites-available`. This folder contains configuration for all sites that the nginx server can see.

`/etc/nginx/sites-available/atlas.van.sap.corp` is the file that controls how/what is served by nginx.

Current configuration of `atlas.van.sap.corp`:
```
server {
    listen      80 default_server;
    server_name _;
    return      444;
}

server {
    listen 443 ssl;
    server_name atlas.van.sap.corp;
    root /project-atlas/build/;
    index index.html;

    ssl_certificate /project-atlas/atlas.crt;
    ssl_certificate_key /project-atlas/privatekey.key;

    location / {
    }
}
```
First block is to shut down any insecure traffic on HTTP. The second one serves your secure connection.

## Contacts
At the time of writing this, I am entering my last week of my internship, so assuming I am still off studying, here are some helpful contacts:

For questions regarding rooms, desks, or other information about the office, contact Liz:

**Facilities:** Elizabeth Cartagena - elizabeth.cartagena@sap.com

For questions regarding the VM, serving Atlas, or the PKI certificates, contact James:

**Engineering Services:** James Kao - james.kao@sap.com

For other questions, contact Barbara:

**Other:** Barbara Jun - barbara.jun@sap.com

