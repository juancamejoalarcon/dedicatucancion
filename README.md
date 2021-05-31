<a href="https://www.dedicatucancion.com/">
    <img src="https://www.dedicatucancion.com/wp-content/uploads/2021/03/logo-b-1.svg" alt="dedicatucacion logo" title="dedicatucancion" align="right" height="35" />
</a>

# dedicatucancion

This is the Front-end project that powers [www.dedicatucancion.com](https://www.dedicatucancion.com]), a page to create spotify plaques ([DEMO](https://www.dedicatucancion.com/#personalizar])). Made with VUE.js, typescript, postcss with BEM.

## Installation
### Project setup
```
npm install
```
### Compiles and hot-reloads for development
```
npm run serve
```
### Compiles and minifies for production
```
npm run build
```

## Instructions

This tag must be used in the project 
```
<div id="dedicatucancion"></div>
```
## Deploy
The deploy is done directly from a bash file called .deploy.sh.
On every commit a Github action is launched that will build and deploy to the FTP server.
If deploy is done locally, a `.env.local` file is required.
