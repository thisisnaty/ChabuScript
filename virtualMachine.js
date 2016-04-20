var MemOffset = {
  NUMBER: 1000,
  STRING: 5000,
  BOOL: 8000,
  TMPNUM: 10000,
  TMPBOOL: 20000,
  CONST: 45000
};

var memories = [];

var activeMemory = {
  numbers: [],
  bools: [],
  strings: [],
  tempNums: [],
  tempBools: [],
};

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
    case Type.STRING:
      activeMemory.strings[index-offset] = element;
      break;
  }
}

function readMemIndex(index)
{
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
    case Type.STRING:
      value = activeMemory.strings[index-offset];
      break;
  }
  return value;
}

function getOffset(index)
{
  // number
  if(index >=  MemOffset.NUMBER && index < MemOffset.BOOL)
  {
    return [MemOffset.NUMBER, Type.NUMBER];

  }else if (index >=  MemOffset.BOOL && index < MemOffset.STRING)
  {
    //bool
    return [MemOffset.BOOL, Type.BOOL];
  }else if(index >=  MemOffset.STRING && index < MemOffset.TMPNUM){
    // string
    return [MemOffset.STRING, Type.STRING];
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

function executeQuadruple(quadruple)
{
  switch(quadruple[0])
  {
    case Operation.MULT:
      var result = readMemIndex(quadruple[1]) * readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      break;
    case Operation.DIV:
      var result = readMemIndex(quadruple[1]) / readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      break;
    case Operation.SUM:
      var result = readMemIndex(quadruple[1]) + readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      break;
    case Operation.MINUS:
      var result = readMemIndex(quadruple[1]) - readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      break;
    case Operation.AND: // (AND, VAR1 VAR2 RESULT)
      var result = readMemIndex(quadruple[1]) && readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      break;
    case Operation.OR: // (OR, VAl, VAl, RES)
      var result = readMemIndex(quadruple[1]) || readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      break;
    case Operation.NOT: // (NOT, VAR, , RESULT)
      var result = !(readMemIndex(quadruple[1]));
      writeToMemIndex(result, quadruple[3]);
      break;
    case Operation.LESS: // (LESS, VAl, VAl, RES)
    var result = readMemIndex(quadruple[1]) < readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      break;
    case Operation.GRT: // (GRt, VAl, VAl, RES)
      var result = readMemIndex(quadruple[1]) > readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      break;
    case Operation.EQL: // (EQL, VAl, VAl, RES)
      var result = (readMemIndex(quadruple[1]) == readMemIndex(quadruple[2]));
      writeToMemIndex(result, quadruple[3]);
      break;
    case Operation.DIFF: // (DIF, VAl, VAl, RES)
      var result = readMemIndex(quadruple[1]) != readMemIndex(quadruple[2]);
      writeToMemIndex(result, quadruple[3]);
      break;
    case Operation.ASSIGN: // (= , RESULT ,  , VAR)
      var result = readMemIndex(quadruple[1]);
      writeToMemIndex(result, quadruple[3]);
      break;
    case Operation.RND: // ( RND MIN MAX RESULT)
      var result = generateRandom(readMemIndex(quadruple[1]),readMemIndex(quadruple[2]));
      writeToMemIndex(result, quadruple[3]);
      break;
    case Operation.PRINT: // (PRINT, VALUE, , )
      var result = readMemIndex(quadruple[1]);
      printToShell(result, false /* it is not an error*/);
      break;
    case Operation.COLOR: //(COLOR, R, G, B)
      var red = readMemIndex(quadruple[1]);
      var green = readMemIndex(quadruple[2]);
      var blue = readMemIndex(quadruple[3]);

      break;
    case Operation.BCK: //(BCK, COLOR, , )
      var color = readMemIndex(quadruple[1]);
      setBackground();
      break;
    case Operation.RTRN: // [RTRN, var, , ]
      break;
  }
}

function runQuadruples(quadruples)
{
  for(var i = 0; i < quadruples.length; i++)
  {
    var quad = quadruples[i];
    executeQuadruple(quad);
  }
}
