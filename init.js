var varTable = {}; //variable table
// var name : [type, address, dimension, size]
var quadruples = []; // all quadruples [op, opIzq, opDer, result]
var dirProcs = {}; //process address directory
// funcName : [type, quadInicio, params, numVars]
var quadCont = 0;
var constants = {}; // constants with there memory address
var numVars = 0; //numero de variables en procdimiento
var stringVars = 0;
var boolVars = 0;
var numberMem; // start memory address for numbers
var stringMem; // start memory address for strings
var boolMem; // start memory address for bools
var tmpNumMem; // start memory address for tmp numbers
var tmpBoolMem; // start memory address for tmp bools
var constMem; // start memory address for constants
var paramNumber = 0; //numero de parametros encontrados
var params = []; // arreglo con tipo de parametros
var currentFuncName = "";
var pOper = []; //pila de operaciones
var listElements = 0;
var pSaltos = []; // pila de saltos
var pilaO = []; //pila de operandos

// objeto diccionario con los tipos de errores que se imprimen
var errors = {
  'PARAMETER_TYPE_MISMATCH': 'Function {0} expects type {1} and received type {2} in position {3}',
  'PARAMETER_LENGTH_MISMATCH': 'Function {0} expects {1} parameters and is invoked with {2}',
  'UNDECLARED_VARIABLE': 'Undeclared variable {0} found',
  'UNDECLARED_FUNCTION': 'Undeclared function {0} found',
  'DUPLICATE_VARIABLE_NAME': 'Duplicate variable name {0} found',
  'DUPLICATE_FUNCTION_NAME': 'Duplicate function name {0} found',
  'INVALID_INDEX': 'Invalid index {0} for list {1}',
  'INCORRECT_TYPE': 'Incorrect type of value {0} for variable {1}',
  'INCORRECT_TYPE_OP': 'Incorrect type of value {0} for operation {1}',
  'INDEX_OUT_BOUNDS': 'Index {0} out of bounds for list {1}',
  'INVALID_OP': 'Invalid Operation. Variable {0} is not a list',
  'BOOL_CONDITION': 'Semantic error. {0} conditional does not have a boolean value',
  'INCOMPATIBLE': 'Incompatible types for operation {0}',
  'INCOMPATIBLE_TYPE_OP': 'Incompatible types {0} and {1} for operation {2}',
  'SYNTAX_ERROR': 'Syntax error: expecting a {0} block',
};

//funcion para empezar a compilar
//Dicha funcion inicializa el canvas, las variables de memoria
//y las escructuras para la compilacion y la verificacion de la sintaxis
function startRun()
{
  initCompSyntaxTools();
  initMemVars();
  cleanShell();
  initializeAgain();
  initCanvas();
  cleanCanvas();
}

//Funcion que inicializa los cuadruplos, crea el directorio de procedimientos
// y crea el primero cuadruplo del GOTO, que despues sera rellenado con el numero
// del cuadruplo del main
function initCompSyntaxTools()
{
  quadruples = [];
  quadruples[0] = [Operation.GOTO, null, null, null]; //first quadruple should be goint to main
  dirProcs = {};
  constMem = 45000;
  constants = {};
}

// Inicializa las variables de memoria
function initMemVars()
{
  params = [];
  varTable = {}; //delete and renew var table
  listElements = 0;
  currentFuncName = "";
  paramNumber = 0;
  numberMem = 1000;
  stringMem = 5000;
  boolMem = 8000;
  tmpNumMem = 10000;
  tmpBoolMem = 20000;
}

// Funcion que limpia la shell (consola) para inicializarla sin mensajes
function cleanShell()
{
  var shell = document.getElementById('output');
  shell.innerHTML = '';
}

//Funcion para imprimir a consola
//Funcion que recibe como parametros el texto a imprimir y una flag de error
// si error es true se le agregar al class name de error para ser impreso el mensaje
// como un error
function printToShell(text, error)
{
    var shell = document.getElementById("output");
    var element = document.createElement('li');
    //element.setAttribute("style", "list-style-type: circle");
    //element.textContent = text;
    element.appendChild(document.createTextNode(text));

    if (error)
    {
      element.className += " error";
    }
    else {
      element.textContent = element.textContent.replace(/"/gi, '');
    }

    if (element.textContent.indexOf("End of program") > -1) {
      element.setAttribute("style", "color:green");
      element.setAttribute("style", "color:green");
    }

    shell.appendChild(element);
}

// Function to print with format messages in the shell
if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

//Funcion que de acuerdo a un input de parametro,
//verifica si dicho input es una variable, una constante number, string o booleana
// la funcion regresa una tupla del siguiente tipo: [tipo de dato, direccion virtual]
function checkParamType(varName)
{
  //return [type, address]
  var type;
  var address;
  if(varName in varTable)
  {
    type = varTable[varName][TableVarAccess.TYPE];
    address = varTable[varName][TableVarAccess.ADDRESS];
  }else{
    // param is a constant... we need to check the type
    if(varName.match(regexNumber))
    {
      type = Type.NUMBER;
      var value = Number(varName);
      address = addConstant(value, type);
    }else if(varName.match(regexString))
    {
      type = Type.STRING;
      address = addConstant(varName, type);
    }else if(varName.match(regexBoolean))
    {
      type = Type.BOOL;
      var value = input == 'true';
      address = addConstant(value, type);
    }else{
      var message = String.format(errors['UNDECLARED_VARIABLE'], varName);
      printToShell(message, true);
    }
  }
  return [type, address];
}

//Funcion para checar el tipo de dato de la lista (variables no atómicas)
// la funcion regresa el tipo de la lista
function checkListType(drop_type)
{
  var type;
  switch(drop_type)
  {
    case 'number':
      type = Type.NUMBER;
      break;
    case 'string':
      type = Type.STRING;
      break;
    case 'boolean':
      type = Type.BOOL;
      break;
  }
  return type;
}

//Funcion que de acuerdo a un tipo de dato, le suma
// al contador de direcciones virtuales de memoria de ese tipo
// una cantidad.
// Dicha funcion es utilizada para sumar la traslacion de los arreglos
// para ver cual seria la direccion del siguiente dato del mismo tipo.
function sumAddress(type, sum)
{
  var startAddress;
  switch(type)
  {
    case Type.NUMBER:
      startAddress = numberMem;
      numberMem += sum;
      break;
    case Type.STRING:
      startAddress = stringMem;
      stringMem += sum;
      break;
    case Type.BOOL:
      startAddress = boolMem;
      boolMem += sum;
      break;
    case Type.CONST:
      startAddress = constMem;
      constMem += sum;
      break;
  }
  return startAddress;
}
