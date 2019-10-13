import re
import json
import os
import numpy as np

def listFromArr(arr):
    try:
        step1 = arr[1] - arr[0]
    except:
        step1 = ''
    ans = ''
    skip = False
    start = None
    for i in range(0, len(arr)):
        step = step1
        try:
            step1 = arr[i+2] - arr[i+1]
        except:
            step1 = ''
        if (skip):
            skip = False
            continue
        if (step != step1 or step1 == '' ):
            if(start != None):
                ans += ' ' + str(start) + ':' + str(arr[i+1]) + (':' + str(step) if step > 1 else '')
                start = None
                skip = True
            else:
                ans += ' ' + str(arr[i])
        elif (start == None):
            start = arr[i]
    return ans.strip()

def midListFromArr(arr):
    ans = ''
    count = 1
    for i in range(0, len(arr)):
        try:
            step = arr[i+1] - arr[i]
        except:
            step = ''
        if ( step == 0 ):
            count += 1
        elif( count > 1):   
            ans += ' ' + str(arr[i]) + 'x' + str(count)
            count = 1
        else:
            ans += ' ' + str(arr[i])
    return ans.strip()

def strInt(s):
    try:
        return int(s)
    except:
        return 0

class bdfCoords():
    def __init__(self):
        self.origin = []
        self.rMat = []
        
    def initCORD2R(self, inBdf, card):
        a = [
            [card[1], card[2], card[3]],
            [card[4], card[5], card[6]],
            [card[7], card[8], card[9]]
            ]
        self.origin = [a[0][0], a[0][1], a[0][2]]
        w = [
                a[1][0] - a[0][0],
                a[1][1] - a[0][1],
                a[1][2] - a[0][2],
                ]
        w = w / np.linalg.norm(w)
        u = [
                a[2][0] - a[0][0],
                a[2][1] - a[0][1],
                a[2][2] - a[0][2],
                ]
        u = u / np.linalg.norm(u)
        v = np.cross(w, u)
        u = np.cross(v, w)
        self.rMat = [u, v, w]
        return self
    
    def initCORD2C(self, inBdf, card):
        a = [
            [card[1], card[2], card[3]],
            [card[4], card[5], card[6]],
            [card[7], card[8], card[9]]
            ]
        self.origin = [a[0][0], a[0][1], a[0][2]]
        w = [
                a[1][0] - a[0][0],
                a[1][1] - a[0][1],
                a[1][2] - a[0][2],
                ]
        w = w / np.linalg.norm(w)
        u = [
                a[2][0] - a[0][0],
                a[2][1] - a[0][1],
                a[2][2] - a[0][2],
                ]
        u = u / np.linalg.norm(u)
        v = np.cross(w, u)
        u = np.cross(v, w)
        self.rMat = [u, v, w]
        return self
    
    def vecRMat(self, inV):
        return [
                self.rMat[0][0]*inV[0] + self.rMat[1][0]*inV[1] + self.rMat[2][0]*inV[2] + self.origin[0],
                self.rMat[0][1]*inV[0] + self.rMat[1][1]*inV[1] + self.rMat[2][1]*inV[2] + self.origin[1],
                self.rMat[0][2]*inV[0] + self.rMat[1][2]*inV[1] + self.rMat[2][2]*inV[2] + self.origin[2]
                ]

class bdfData:
    def __init__(self, path):
        self.path = path
        self.grid = {}
        
        self.cRod = {}
        self.cBar = {}
        self.cBeam = {}
        self.cTria3 = {}
        self.cQuad4 = {}        
        self.cShear = {}

        self.pRod = {}
        self.pBar = {}
        self.pBeam = {}
        self.pShell = {}
        self.pShear = {}
        
        self.cCoordR = {}
        self.cCoordC = {}
        
        self.mat1 = {}
        self.mat2 = {}
        self.mat8 = {}
        
        self.FDict = re.compile('(?P<num>.*(\d|\.))(?P<pow>(\+|-).*)')
        
    def parseStr(self, str):
        str = str.strip()
        try: 
            f = float(str)
            if f.is_integer():
                return int(f)
            else:
                return f
        except:
            match = self.FDict.search(str)
            if match:
                try:
                    return float(match.group('num') + 'e' + match.group('pow'))
                except:
                    return str
            return str
    
    def readBdfLine(self, fp):
        line = fp.readline().rstrip('\n').rstrip()
        if line == '': return ''
        if 'INCLUDE' in line.upper() : return line.split()
        s = 16 if "*" in line else 8
        
        #add spaces
        l = len(line) - 8 #first word always 8
        line += ' ' * (s - l % s)
        
        #first word always 8
        line_list = [self.parseStr(line[:8]).strip().rstrip('*').upper()]
        n = 8
        
        while n < len(line):                
            line_list.append(self.parseStr(line[n:n+s]))
            n += s
        
        return line_list

    def readBdf(self, filePath):
        with open(filePath) as fp:
            nextline = self.readBdfLine(fp)
            
            while True:
                card = []
                
                while True:
                    card.extend(nextline if len(card) == 0 else nextline[1:])
                    nextline = self.readBdfLine(fp)
                    if len(nextline) == 0: break
                    if nextline[0] != "": break
                                
                if len(card) == 0: break
                
                if not '$' in card[0]:
                    if card[0] == 'GRID' and card[1] not in self.grid:
                        self.grid[card[1]] = card[2:]
                        
                    elif card[0] == 'CROD' and card[1] not in self.cRod:
                        self.cRod[card[1]] = card[2:]                        
                    elif card[0] == 'CBAR' and card[1] not in self.cBar:
                        self.cBar[card[1]] = card[2:]
                    elif card[0] == 'CBEAM' and card[1] not in self.cBeam:
                        self.cBeam[card[1]] = card[2:]    
                    elif card[0] == 'CQUAD4' and card[1] not in self.cQuad4:
                        self.cQuad4[card[1]] = card[2:]                        
                    elif card[0] == 'CTRIA3' and card[1] not in self.cTria3:
                        self.cTria3[card[1]] = card[2:]
                    elif card[0] == 'CSHEAR' and card[1] not in self.cShear:
                        self.cShear[card[1]] = card[2:]
                    
                    elif card[0] == 'PROD' and card[1] not in self.pRod:
                        self.pRod[card[1]] = card[2:]
                    elif card[0] == 'PBAR' and card[1] not in self.pBar:
                        self.pBar[card[1]] = card[2:]
                    elif card[0] == 'PBEAM' and card[1] not in self.pBeam:
                        self.pBeam[card[1]] = card[2:]
                    elif card[0] == 'PSHELL' and card[1] not in self.pShell:
                        self.pShell[card[1]] = card[2:]
                    elif card[0] == 'PSHEAR' and card[1] not in self.pShear:
                        self.pShear[card[1]] = card[2:]
                        
                    elif card[0] == 'MAT1' and card[1] not in self.mat1:
                        self.mat1[card[1]] = card[2:]
                    elif card[0] == 'MAT2' and card[1] not in self.mat2:
                        self.mat2[card[1]] = card[2:]
                    elif card[0] == 'MAT8' and card[1] not in self.mat8:
                        self.mat8[card[1]] = card[2:]
                        
                    elif card[0] == 'CORD2R' and card[1] not in self.cCoordR:
                        self.cCoordR[card[1]] = bdfCoords().initCORD2R(self, card[2:])
                    elif card[0] == 'CORD2C' and card[1] not in self.cCoordC:
                        self.cCoordC[card[1]] = bdfCoords().initCORD2C(self, card[2:])
                        
                    elif card[0] == 'INCLUDE':
                        fileName = card[1].strip().strip('"').strip("'")
                        self.readBdf(os.path.join(self.path, fileName))
                            
def dumpGrids(inpBdfData):
    coord = []
    for x in inpBdfData.values():
        nodeCoord = [x[1], x[2], x[3]]
        if x[0] != '':
            bdfCoord = newBdf.cCoordR[x[0]]
            nodeCoord = bdfCoord.vecRMat(nodeCoord)
            
        coord.extend(nodeCoord)
    
    data['GRID'] = []
    data['GRID'].append({
            'count': len(inpBdfData),
            'ids': listFromArr([x for x in inpBdfData.keys()]),
            'coords': coord,
            'acid': midListFromArr([(strInt(x[4]) if len(x) > 4 else 0) for x in inpBdfData.values()])
            })

def dumpElm(inpBdfData, nCount, elmType):
    connect = [x[i+1] for x in inpBdfData.values() for i in range(0, nCount)]
    eid = listFromArr([x for x in inpBdfData.keys()])
    pid = listFromArr([x[0] for x in inpBdfData.values()])
    data[elmType] = []
    data[elmType].append({
            'count': len(inpBdfData),
            'ids': eid,
            'pid': 'same' if eid == pid else pid,
            'connectivity': connect
            })
    
def dumpCoord(inpBdfData, coordType):
    data[coordType] = []
    data[coordType].append({
        'count': len(inpBdfData),        
        'ids': listFromArr([x for x in inpBdfData.keys()]),
        'origin': [xyz for x in inpBdfData.values() for xyz in x.origin],
        'mat': [j for x in inpBdfData.values() for i in x.rMat for j in i]
        })
    
def sortDict(inpDict):
    return {key:inpDict[key] for key in sorted(inpDict)}

filePath = 'XXX.bdf'
fileFolder = os.path.dirname(filePath)

#init
newBdf = bdfData(fileFolder)
#read
newBdf.readBdf(filePath)

data = {}

dumpGrids(sortDict(newBdf.grid))

dumpCoord(sortDict(newBdf.cCoordR), 'CORDR')
dumpCoord(sortDict(newBdf.cCoordC), 'CORDC')
 
dumpElm(sortDict(newBdf.cQuad4), 4, "CQUAD4")
dumpElm(sortDict(newBdf.cShear), 4, "CSHEAR")
dumpElm(sortDict(newBdf.cTria3), 3, "CTRIA3")
dumpElm(sortDict(newBdf.cRod), 2, "CROD")
dumpElm(sortDict(newBdf.cBar), 2, "CBAR")
dumpElm(sortDict(newBdf.cBeam), 2, "CBEAM")

data['PSHELL'] = []
data['PSHELL'].append({
        'count': len(newBdf.pShell),        
        'ids': listFromArr([x for x in newBdf.pShell.keys()]),
        'mid': midListFromArr([strInt(x[0]) for x in newBdf.pShell.values()]),
        't': [x[1] for x in newBdf.pShell.values()]
        })
    
data['PSHEAR'] = []
data['PSHEAR'].append({
        'count': len(newBdf.pShear),        
        'ids': listFromArr([x for x in newBdf.pShear.keys()]),
        'mid': midListFromArr([x[0] for x in newBdf.pShear.values()]),
        't': [x[1] for x in newBdf.pShear.values()]
        })
    
data['PROD'] = []
data['PROD'].append({
        'count': len(newBdf.pRod),        
        'ids': listFromArr([x for x in newBdf.pRod.keys()]),
        'mid': midListFromArr([x[0] for x in newBdf.pRod.values()]),
        'area': [x[1] for x in newBdf.pRod.values()]
        })

data['MAT1'] = []
data['MAT1'].append({
        'count': len(newBdf.mat1),        
        'ids': listFromArr([x for x in newBdf.mat1.keys()]),
        'e': [x[0] for x in newBdf.mat1.values()],
        'nu': [x[2] for x in newBdf.mat1.values()]
        })

with open('data.json', 'w') as outfile:  
    json.dump(data, outfile)
