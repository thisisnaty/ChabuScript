// cuadruplo que actualmente se esta corriendo
var runningQuadruple = 0;

//enum con los offsets de cada tipo de direccion
var MemOffset = {
  NUMBER: 1000,
  STRING: 5000,
  BOOL: 8000,
  TMPNUM: 10000,
  TMPBOOL: 20000,
  CONST: 45000
};

//array que guarda animaciones
var animArr = [];
//guarda las memorias dormidas
var memories = [];
//stack de los parametros a asignar en una funcion
var paramStack = [];
//memoria activa durante execution
var activeMemory = {
  numbers: [],
  bools: [],
  strings: [],
  tempNums: [],
  tempBools: [],
};
//memoria futura en llamada a funcion
var futureMemory;
//stack de los valores de retorno
var returnValueStack = [];
// pila para meter stack de intstruccion de retorno
var returnInstStack = [];

var line = {};
var rectangle = {};
var circle = {};
var polygon = {};
var stackPoints = [];

//funcion para crear una nueva memoria en ERA
function createNewMemory()
{
  var mem = {
    numbers: [],
    bools: [],
    strings: [],
    tempNums: [],
    tempBools: [],
  };
  return mem;
}

//funcion para escribir un elemento a partir de un index
function writeToMemIndex(element, index)
{
  var offsetType = getOffset(index);
  var offset = offsetType[0];
  var type = offsetType[1];
  switch(offset)
  {
    case MemOffset.TMPNUM:
      activeMemory.tempNums[index-offset] = element;
      break;
    case MemOffset.NUMBER:
      activeMemory.numbers[index-offset] = element;
      break;
    case MemOffset.TMPBOOL:
      activeMemory.tempBools[index-offset] = element;
      break;
    case MemOffset.BOOL:
      activeMemory.bools[index-offset] = element;
      break;
    case MemOffset.STRING:
      activeMemory.strings[index-offset] = element;
      break;
  }
}

//funcion para leer y regresar el elemento de un indice
function readMemIndex(index)
{
  //verificar si indice no es un pointer
  // y guarda dentro una direccion de memoria
  if(index.constructor === Array)
  {
    var pointer = index[0];
    var valueAddress = readMemIndex(pointer);
    var value = readMemIndex(valueAddress);
    return value;
  }else{
    //leer y regresar dato del espacio
    var offsetType = getOffset(index);
    var offset = offsetType[0];
    var type = offsetType[1];
    var value;
    switch(offset)
    {
      case MemOffset.TMPNUM:
        value = activeMemory.tempNums[index-offset];
        break;
      case MemOffset.NUMBER:
        value = activeMemory.numbers[index-offset];
        break;
      case MemOffset.TMPBOOL:
        value = activeMemory.tempBools[index-offset];
        break;
      case MemOffset.BOOL:
        value = activeMemory.bools[index-offset];
        break;
      case MemOffset.STRING:
        value = activeMemory.strings[index-offset];
        break;
      case MemOffset.CONST:
        value = constants[index];
        break;
    }
    return value;
  }

}

//funcion que de acuerdo a una direccion regresa una tupla con su
// [offset, tipo de dato]
function getOffset(index)
{
  // number
  if(index >=  MemOffset.NUMBER && index < MemOffset.STRING)
  {
    return [MemOffset.NUMBER, Type.NUMBER];

  }else if (index >=  MemOffset.STRING && index < MemOffset.BOOL)
  {
    //bool
    return [MemOffset.STRING, Type.STRING];
  }else if(index >=  MemOffset.BOOL && index < MemOffset.TMPNUM){
    // string
    return [MemOffset.BOOL, Type.BOOL];
  }else if(index >=  MemOffset.TMPNUM && index < MemOffset.TMPBOOL)
  {
    //number temp
    return [MemOffset.TMPNUM, Type.NUMBER];

  }else if(index >=  MemOffset.TMPBOOL && index < MemOffset.CONST)
  {
    //bool temp
    return [MemOffset.TMPBOOL, Type.BOOL];

  }else if(index >= MemOffset.CONST)
  { //if index is of constant
    return [MemOffset.CONST, Type.CONST];
  }else{
    console.log("address index " + index + "does not exist.");
  }
}

//funcion que recibe como parametro un cuadruplo, y lo ejecuta
//se utiliza un switch para saber de acuerdo al codigo de operacion en
// quadruple[0] que instrucciones ejecutar
function executeQuadruple(quadruple)
{
  switch(quadruple[0])
  {
    case Operation.MULT:
      var result = readMemIndex(quadruple[1]) * readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.DIV:
      var result = readMemIndex(quadruple[1]) / readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.SUM:
      var result = readMemIndex(quadruple[1]) + readMemIndex(quadruple[2]);
      if (result.type == Type.STRING) {
        result = result.slice(0, -1);
      }
      writeToMemIndex(result, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.MINUS:
      var result = readMemIndex(quadruple[1]) - readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.AND: // (AND, VAR1 VAR2 RESULT)
      var result = readMemIndex(quadruple[1]) && readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.OR: // (OR, VAl, VAl, RES)
      var result = readMemIndex(quadruple[1]) || readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.NOT: // (NOT, VAR, , RESULT)
      var result = !(readMemIndex(quadruple[1]));
      writeToMemIndex(result, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.LESS: // (LESS, VAl, VAl, RES)
      var result = readMemIndex(quadruple[1]) < readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.GRT: // (GRt, VAl, VAl, RES)
      var result = readMemIndex(quadruple[1]) > readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.EQL: // (EQL, VAl, VAl, RES)
      var result = (readMemIndex(quadruple[1]) == readMemIndex(quadruple[2]));
      writeToMemIndex(result, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.DIFF: // (DIF, VAl, VAl, RES)
      var result = readMemIndex(quadruple[1]) != readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.ASSIGN: // (= , RESULT ,  , VAR)
      var result = readMemIndex(quadruple[1]);
      writeToMemIndex(result, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.RND: // ( RND MIN MAX RESULT)
      var result = generateRandom(readMemIndex(quadruple[1]),readMemIndex(quadruple[2]));
      writeToMemIndex(result, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.PRINT: // (PRINT, VALUE, , )
      var result = readMemIndex(quadruple[1]);
      printToShell(result, false /* it is not an error*/);
      runningQuadruple++;
      break;
    case Operation.COLOR: //(COLOR, R, G, B)
      var red = readMemIndex(quadruple[1]);
      var green = readMemIndex(quadruple[2]);
      var blue = readMemIndex(quadruple[3]);
      generateColor(red, green, blue);
      runningQuadruple++;
      break;
    case Operation.BCK: //(BCK, COLOR, , )
      setBackground();
      runningQuadruple++;
      break;
    case Operation.DRAW: //(DRAW, SHAPE, WIDTH, null)
      var pWidth = readMemIndex(quadruple[2]);
      switch(quadruple[1])
      {
        case Operation.LINE:
          drawLine(pWidth);
          break;
        case Operation.CIRCLE:
          drawCircle(pWidth);
          break;
        case Operation.RECTANGLE:
          drawRectangle(pWidth);
          break;
        case Operation.POLYGON:
          drawPolygon(pWidth);
          break;
      }
      runningQuadruple++;
      break;
    case Operation.POINT:
      var x = readMemIndex(quadruple[1]);
      var y = readMemIndex(quadruple[2]);
      stackPoints.push([x, y]);
      runningQuadruple++;
      break;
    case Operation.POLYGON: // (POLYGON, NUMSIDES, SIDELENGTH, NULL)
      var sides = readMemIndex(quadruple[1]);
      var length = readMemIndex(quadruple[2]);
      polygon['sides'] = sides;
      polygon['length'] = length;
      runningQuadruple++;
      break;
    case Operation.CIRCLE:
      var radio = readMemIndex(quadruple[1]);
      circle['radius'] = radio;
      runningQuadruple++;
      break;
    case Operation.RECTANGLE:
      var rWidth = readMemIndex(quadruple[1]);
      var rHeight = readMemIndex(quadruple[2]);
      rectangle['width'] = rWidth;
      rectangle['height'] = rHeight;
      runningQuadruple++;
      break;
    //FUNCTIONS
    case Operation.RET: //delete current memory
      var newMemory = memories.pop(); //revivir memoria dormida
      activeMemory = newMemory;
      runningQuadruple = returnInstStack.pop(); //dir de regreso
      break;
    case Operation.RTRN: // [RTRN, var, , ]
      returnValueStack.push(readMemIndex(quadruple[1]));
      runningQuadruple++;
      break;
    case Operation.END:
      printToShell("End of program.", false);
      runningQuadruple = -1;
      break;
    case Operation.GOTOF: //GOTOF, address, null, quad
      var value = readMemIndex(quadruple[1]);
      if(!value)
      {
        runningQuadruple = quadruple[3];
      }else{
        runningQuadruple++;
      }
      break;
    case Operation.GOTOT: //[GOTOV, BOOL, null, Quad]
      var value = readMemIndex(quadruple[1]);
      if(value)
      {
        runningQuadruple = quadruple[3];
      }else{
        runningQuadruple++;
      }
      break;
    case Operation.GOTO: // [GOTO, null, null quad]
      runningQuadruple = quadruple[3];
      break;
    case Operation.ERA:
      futureMemory = createNewMemory();
      paramStack = []; //renew param stack
      runningQuadruple++;
      break;
    case Operation.GOSUB: //(gosub, dirInicio, null, null)
      var dirRetorno = runningQuadruple + 1;
      returnInstStack.push(dirRetorno); // direccion a la que regresar despues de terminar funcion
      memories.push(activeMemory); //dormir memoria actual
      activeMemory = futureMemory; //ahora memoria actual es la recientemente creada
      runningQuadruple = quadruple[1]; //saltar al dirInicio de subrutina
      break;
    case Operation.ASSIGN_FUNC: // (ASSIGN_FUNC, funcName, null, address)
      var value = returnValueStack.pop();
      writeToMemIndex(value, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.PARAM: //(Param, address, null, paramNumber)
      var valueAdd = quadruple[1];
      paramStack.unshift(readMemIndex(valueAdd)); //treat array as queue, to retrieve data in order
      runningQuadruple++;
      break;
    case Operation.PAR_ASSIGN: //(PAR_ASSIGN, address, null, null)
      var value = paramStack.pop();
      writeToMemIndex(value, quadruple[1]);
      runningQuadruple++;
      break;
    //lists OPS
    case Operation.VER: // (VER, index, inf, sup)
      var index = readMemIndex(quadruple[1]);
      if(index < quadruple[2] || index> quadruple[3])
      {
        var message = String.format(errors['INDEX_OUT_BOUNDS'], quadruple[1]);
        printToShell(message, true);  //indes of list is not in list range
        //STOP EXECUTION
        runningQuadruple = -1;
      }else{
        runningQuadruple++;
      }
      break;
    case Operation.PUT: //(PUT, valueAddress, null, result)
      var valueAddress = quadruple[1];
      var indexAddress = readMemIndex(quadruple[3][0]);
      writeToMemIndex(readMemIndex(valueAddress), indexAddress);
      runningQuadruple++;
      break;
    case Operation.REMOVE: // (REMOVE, (index), nul, null)
      var indexAddress = readMemIndex(quadruple[1][0]);
      writeToMemIndex(null, indexAddress);
      runningQuadruple++;
      break;
    case Operation.INITPUT: // (INITPUT, address, null, indexAddress)
      writeToMemIndex(readMemIndex(quadruple[1]), quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.SUM_INDEX: //(SUM_INDEX, address, dirBase, restulAddress)
      var index = readMemIndex(quadruple[1]);
      var indexAddress = quadruple[2] + index;
      writeToMemIndex(indexAddress, quadruple[3]);
      runningQuadruple++;
      break;
    case Operation.CLEAR:
      cleanCanvas();
      runningQuadruple++;
      break;
    case Operation.ANIMATE: //(anim, type, size..address, null)
      var size = readMemIndex(quadruple[2]);
      generateAnim(quadruple[1], size);
      runningQuadruple++;
      break;
  }
}
//funcion para recorrer en los cuadruplos
function runQuadruples()
{
  runningQuadruple = 0;
  quadruples[0][3] = dirProcs['start'][DirProcAccess.QUADINI];

  //cuando se llega a -1 significa que hubo un error execution
  // o ya acabo el programa
  while(runningQuadruple != -1)
  {
    var quad = quadruples[runningQuadruple];
    executeQuadruple(quad);
  }
}
