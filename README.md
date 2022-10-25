# DW_P7-Groupomania-front
Repository for the project 7 front-end of the OpenClassrooms Web Developer Path
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.3.

## Summary
There are 2 possible launching mode for the frontend :
* HTTPS : more secure ; default mode
* HTTP : unsecure ; the frontend should be launched using a specific command

The frontend connects to a backend that can be in 2 possible modes :
* HTTPS : more secure ; default mode
* HTTP : unsecure ; the environment.ts file (in src/environments) should be updated

## Prerequisite for a HTTP backend connection (not HTTPS backend)
Update the environment.ts file (in src/environments) : replace `https` with `http`

## Prerequisites for HTTPS server

### Generate a self-signed certificate and its private key
* Create a 'sec_files' folder, in the parent's folder of the parent's folder from here (../../sec_files from here)
* In this folder, create a 'cert_conf.cnf' file, with the fillowing content :
```
[req]
default_bits = 2048
encrypt_key = no
prompt = no
default_md = sha256
x509_extensions = v3_req
distinguished_name = dn

[dn]
C = FR
ST = France
L = Paris
O = Company
OU = Division
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = 127.0.0.1
IP.1 = 127.0.0.1
```
* In this folder, execute the following command :
`openssl req -x509 -newkey rsa:4096 -keyout front_certificate.key -nodes -out front_certificate.crt -sha256 -days 365 -config cert_conf.cnf`

### Install the certificate on the host machine
* On Windows :
    * Double-click on the certificate file (front_certificate.crt)
    * Click on "Install Certificate..."
    * Select "Current user" and click on "Next"
    * Select "Place all certificates in the following store" and click on "Browse"
    * Select "Trusted Root Certification Authorities" and click on "OK"
    * Click on "Next"
    * Click on "Finish"
    * On the next pop-up, click on "OK"

### If you want to use Firefox : enable the enterprise roots for security
* In a new Firefox tab, type or paste `about:config` in the address bar and press Enter/Return. Click the button accepting the risk.
* In the search box in the page, type or paste `security.enterprise_roots.enabled` and pause while the list is filtered
* If the preference has a value of `false`, double-click it to set the value of `true`

## Install

Run `npm install`

## HTTPS Development server

Run `npm start` for a HTTPS dev server. Navigate to `https://localhost:4200/`. The application will automatically reload if you change any of the source files.

## HTTP Development server

Run `npm run start:unsecure` for a HTTP dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
