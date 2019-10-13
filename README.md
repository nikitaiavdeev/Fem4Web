# ![image_import](flask/static/img/Logo.svg 'Intro') H5View
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fnikitaiavdeev%2FH5View.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fnikitaiavdeev%2FH5View?ref=badge_shield)
![image_version](https://img.shields.io/badge/build-beta%20%5Bv.%200.0.1%5D-blue.svg 'Version') 

H5View is an open source MSC Patran/Nastran .bdf online files viewer. It runs off of Javascript and WebGL. Model .bdf file could be viewed offline without server, but to view .h5 resoults backend Python server is neccessery. 
Patran group .ses file could be imported as well.

H5View allows you to import .bdf files and do basic measurments and operations with it. 

For now it's only supports elements such as:
  CElas, CBush, CRod, CBar, CBeam, CTria3, CQuad4, CShear.
  
  ![image_import](wiki/image1.png 'Example')

You could try it here
https://h5view.000webhostapp.com/
