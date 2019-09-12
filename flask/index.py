#from gevent.pywsgi import WSGIServer
from flask import Flask, render_template, jsonify, request, Markup
from flask_compress import Compress
from flask_assets import Environment, Bundle
import glob
import tables
import h5py
import numpy as np

H5FILE = 'XXXX.h5'
DBFILE = 'XXX.json'

#Create single js file
js = Bundle(
            # Global Functions
            './libs/loader.js',
            './libs/globalFunctions.js',

			# Ribbon
			'./libs/gui/ribbon.js',

			# Tree
			'./libs/gui/tree.js',

			# SideBar
			'./libs/gui/sidebar.js',

			# Fringe
			'./libs/gui/fringe.js',

			# Modals
			'./libs/gui/modals.js',

			# WebGL
			'./libs/WebGL/glMath.js',
			'./libs/WebGL/glMesh.js',
			'./libs/WebGL/glCamera.js',
			'./libs/WebGL/glVectors.js',
			'./libs/WebGL/glShaders.js',
			'./libs/WebGL/glText.js',
			'./libs/WebGL/glRender.js',
			'./libs/WebGL/glMouseKey.js',
			'./libs/WebGL/glHover.js',
			'./libs/WebGL/glSelection.js',
			'./libs/WebGL/glMeasurements.js',

			# FEM
			'./libs/FEM/fmList.js',
			'./libs/FEM/fmFEM.js',
			'./libs/FEM/fmGroups.js',
			'./libs/FEM/fmVectors.js',

			# Import
			'./libs/data/loadModel.js',
			'./libs/data/importGroups.js', 
            filters='jsmin', output='min/h5view.min.js')

#Create single css file
css = Bundle(
            './css/styles.css',
            './css/ribbon.css',
            './css/tree.css',
            './css/sidebar.css',
            './css/modals.css',
            './css/fringe.css',
             filters='cssmin', output='min/h5view.min.css')

#f = tables.open_file(H5FILE, 'r')
#f.close
ELMTYPES = ['cbar', 'cbeam', 'crod', 'ctria3', 'cquad4', 'cshear']

app = Flask(__name__)
app.config['COMPRESS_MIMETYPES'] =  ['text/html', 'text/css', 'text/xml',
                                    'image/svg+xml',
                                    'application/json',
                                    'application/javascript']

app.config['ASSETS_DEBUG'] = True

compress = Compress()
assets = Environment()

@app.route('/')
def mainPage():
    # clear bundles
    assets._named_bundles = {}
    
    assets.register('js_all', js)
    assets.register('css_all', css)
    
    return render_template('index.html')

@app.route('/openDB', methods=['POST'])
def openDB():
    global DBFILE
    response = eval(open(DBFILE, 'rb').read())
    #f = h5py.File(H5FILE, 'r')
    
    #if f['results']['ogpfb1']['cquad4'].shape[2] == 6:
    #    response['dbMoments'] = True
    #else:
    #    response['dbMoments'] = False

    return jsonify(response)

@app.route('/crossSection', methods=['POST'])
def crossSection():
    global ELMTYPES, H5FILE
    data = request.json
    
    f = h5py.File(H5FILE, 'r')
    
    lcID = np.where(f['results']['subcases'][()] == int(data['LC']))[0][0]
    #lcID = np.where(f['results']['subcases'][()] == 2100000 + int(data['LC']))[0][0]
    
    if data['addMoments'] == True:
        mom = 6
    else:
        mom = 3
    
    gpfb = {}
    for node in listToArray(data['nodes']): 
        gpfb[node] = [0] * mom

    for elm in listToArray(data['elms']):
        for eType in ELMTYPES:
            i = np.where(f['model']['geom2']['eid'][eType][()] == elm)[0]
            if len(i) > 0:
                i = i[0]
                for key in gpfb.items():
                    j = np.where(np.sort(f['model']['geom2']['gid'][eType][i, :]) == key)[0]
                    if len(j) > 0:
                        j = j[0]
                        gpfb[key] += f['results']['ogpfb1'][eType][i, j, lcID, :mom]
                        
    response = {}
    response['GPFB'] = [float(v) for key, value in gpfb.items() for v in value]
    
    f.close()
    
    return jsonify(response)

@app.route('/displacement', methods=['POST'])
def displacement():
    global H5FILE
    data = request.json
    f = h5py.File(H5FILE, 'r')
    
    lcID = np.where(f['results']['subcases'][()] == int(data['LC']))[0][0]
    #lcID = np.where(f['results']['subcases'][()] == 2100000 + int(data['LC']))[0][0]
    
    response = {}
    response['displ'] = f['results']['ougv1']['data'][:,lcID,0:3].tolist()
    
    f.close()
    
    return jsonify(response)

@app.route('/forces', methods=['POST'])
def forces():
    global ELMTYPES, H5FILE
    data = request.json
    f = h5py.File(H5FILE, 'r')
    
    lcID = np.where(f['results']['subcases'][()] == int(data['LC']))[0][0]
    #lcID = np.where(f['results']['subcases'][()] == 2100000 + int(data['LC']))[0][0]
    
    response = {}
    response['force'] = []
    
    for elm in listToArray(data['elms']):
        for eType in ELMTYPES:
            i = np.where(f['model']['geom2']['eid'][eType][()] == elm)[0]
            if len(i) > 0:
                i = i[0]
                response['force'].extend( f['results']['oef1'][eType[1:]][i,lcID,:].tolist() )
    
    f.close()
    
    return jsonify(response)

def listToArray(list):
    ans = []
    splitData = list.strip().split(' ')
		
    for data in splitData:
        b = [int(x) for x in data.split(':')]
        start = b[0]
        end = b[1] if len(b)>1 else b[0]
        step = b[2] if len(b)==3 else 1
        
        for j in range( start, end+1, step ):
            ans.append(j)
            
    return ans

if __name__ == "__main__":
    #http_server = WSGIServer(('', 5000), app)
    #http_server.serve_forever()
    compress.init_app(app)
    assets.init_app(app)
    app.run(host="0.0.0.0", port=5000, debug = False, use_reloader=False)#, ssl_context=('cert.pem', 'key.pem'))