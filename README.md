# ![image_import](flask/static/img/Logo.svg 'Intro') Fem4Web
![image_version](https://img.shields.io/badge/build-beta%20%5Bv.%200.0.1%5D-blue.svg 'Version') 

Fem4Web is an open source Nastran FEM .bdf/.dat files online viewer. It allows to do basic measurements, display model information such as node/element IDs and properties. It runs off JavaScript and WebGL. Model files could be viewed offline without server, but to view .h5 result files Python backend server is necessary.
Patran .ses group file could be imported as well.


For now it only supports elements such as:
  CElas, CBush, CRod, CBar, CBeam, CTria3, CQuad4, CShear.
  
  ![image_import](wiki/image1.png 'Example')

DEMO:
https://h5view.000webhostapp.com/
