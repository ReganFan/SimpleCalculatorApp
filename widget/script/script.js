/* script.js, javascript for index.html, created by Yongye Fan, 15/10/2018 */
window.onload = function() {
  // global variables
  // inputExpression, the last expression that you has input
  inputExpression = "";
  // outputExpression, expression being input, also the same as the result showed
  outputExpression = "0";
  // previousOutput, the result of the last expression
  previousOutput = "0";
  // calculateFinish, if one calculation has finished
  calculateFinish = false;
  // urls of two audio sources
  pressDownMp3URL = "https://reganfan.github.io/LearningWeb2.0/docs/Homework-4-Calculator/audio/pressDown.mp3";
  pressUpMp3URL = "https://reganfan.github.io/LearningWeb2.0/docs/Homework-4-Calculator/audio/pressUp.mp3";
  // AudioContext object
  audio = new AudioContext();

  var expression = document.getElementById("expression");
  var result = document.getElementById("result");
  expression.textContent = inputExpression;
  result.textContent = outputExpression;

  var buttons = document.getElementsByTagName("button");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].onclick = function() {
      writeExpression(this.textContent);
      expressionLengthCheck();
    };

    buttons[i].onmousedown = function() {
      this.style.boxShadow = "0 0 0 #7F8C8D";
      this.style.position = "relative";
      this.style.left = "0";
      this.style.top = "5px";

      loadSound(pressDownMp3URL);
    };

    buttons[i].onmouseup = function() {
      this.style.boxShadow = "0 8px 0 #7F8C8D";
      this.style.position = "static";

      loadSound(pressUpMp3URL);
    };
  }
};

/* writeExpression
 * input: the text content of the button
 * function: respond and change the screen content according to the button you pressed
 * next step: modular
 */
function writeExpression(str) {
  // when one calculation has finished
  // some special reactions will happen like replacing the last result with new inputed expression correctly
  if (calculateFinish && str != "=") {
    var notReplaceList = "!^.+-×÷";
    if (notReplaceList.indexOf(str) != -1 && previousOutput != "错误") {
      calculateFinish = false;
    } else {
      outputExpression = "0";
      calculateFinish = false;
    }
  }

  // in intial "0" state
  // there is only "0" being showed on the screen
  if (outputExpression == "0") {
    if (str == "!" || str == "^" || str == "." || str == "÷" || str == "×" || str == "-" || str == "+") {
      outputExpression += str;
    } else if (str == "=" || str == "C" || str == "←") {
      outputExpression = "0";
      if (str == "C") inputExpression = "";
    } else if (str == "sin" || str == "cos" || str == "tan" || str == "ln" || str == "log") {
      outputExpression = str + "(";
    } else {
      outputExpression = str;
    }
  } else {
    // not in intial "0" state
    if (str == "C") {
      inputExpression = "";
      outputExpression = "0";
    } else if (str == "←") {
      outputExpression = outputExpression.substring(0, outputExpression.length - 1);

      if (outputExpression == "") outputExpression = "0";
    } else if (str == ".") {
      var i = 0;
      var numbers = "0123456789";
      if ((i = outputExpression.indexOf(".")) != -1) {
        for (var j = i + 1; j < outputExpression.length; j++) {
          if (numbers.indexOf(outputExpression[j]) == -1) {
            outputExpression += str;
            break;
          }
        }
      } else {
        outputExpression += str;
      }
    } else if (str == "×" || str == "÷" || str == "+" || str == "-") {
      // operators can not be duplicate unless the right operand is negative
      var lastInput = outputExpression.charAt(outputExpression.length - 1);
      var secondLastInput = outputExpression.charAt(outputExpression.length - 2);

      if (str == "-") {
        if (lastInput == "+" || lastInput == "-") {
          outputExpression = outputExpression.substring(0, outputExpression.length - 1) + str;
        } else {
          outputExpression += str;
        }
      } else {
        if (lastInput == "-" && (secondLastInput == "×" || secondLastInput == "÷")) {
          outputExpression = outputExpression.substring(0, outputExpression.length - 2) + str;
        } else if (lastInput == "+" || lastInput == "-" || lastInput == "×" || lastInput == "÷") {
          outputExpression = outputExpression.substring(0, outputExpression.length - 1) + str;
        } else {
          outputExpression += str;
        }
      }
    } else if (str == "sin" || str == "cos" || str == "tan" || str == "ln" || str == "log") {
      outputExpression = outputExpression + str + "(";
    } else if (str == "=") {
      // if you press "=" constantly, the outputExpression will not change
      if (previousOutput != outputExpression) {
        if (outputExpression.indexOf("NaN") != -1 || outputExpression.indexOf("∞") != -1) {
          // prevent illegal inputs like NaN.32
          inputExpression = outputExpression + "=";

          outputExpression = exceptionSolutions(outputExpression);
          calculateFinish = true;
        } else {
          inputExpression = outputExpression + "=";

          calculateExpression(outputExpression);
          calculateFinish = true;
        }
      }
    } else {
      outputExpression += str;
    }
  }
}

/* calculateExpression
 * input: the expression string
 * function: firstly make the expression string legal according to js math library
 *           secondly calculate the expression and solve some exceptional problems
 */
function calculateExpression(exp) {
  // replacement
  exp = exp.replace(/÷/g, "/");
  exp = exp.replace(/×/g, "*");
  exp = exp.replace(/sin/g, "*Math.sin");
  exp = exp.replace(/cos/g, "*Math.cos");
  exp = exp.replace(/tan/g, "*Math.tan");
  exp = exp.replace(/log/g, "*Math.log10");
  exp = exp.replace(/ln/g, "*Math.log");

  exp = expressionPointCheck(exp);
  exp = expressionCheck(exp);
  exp = bracketMatch(exp);

  exp = calculateSquare(exp);

  if (isValid(exp)) {
    exp = exp.replace(/e/g, "Math.E");
    exp = exp.replace(/π/g, "Math.PI");

    exp = calculateFactorial(exp);
    exp = calculatePower(exp);

    // bracket matching again
    exp = bracketMatch(exp);

    // not recommand, if there is still sth wrong, throw exceptions
    // this is the same as isValid
    try {
      exp = "" + eval(exp);
    } catch(errors) {
      outputExpression = "错误";
    }

    if (outputExpression != "错误") outputExpression = exceptionSolutions(exp);

    previousOutput = outputExpression;
  } else {
    outputExpression = "错误";
    previousOutput = outputExpression;
  }
}

/* bracketMatch
 * input: the expression string
 * function: matching all brackets in the expression
 * return: the new expression string
 * next step: optimize algorithm
 */
function bracketMatch(exp) {
  var newExp = exp;
  var notMatch = 0;

  // left bracket match
  for (var i = 0; i < exp.length; i++) {
    if (exp[i] === "(") {
      notMatch += 1;
    } else if (exp[i] === ")") {
      notMatch -= 1;
    }
  }

  for (var j = notMatch; j > 0; j--) {
    newExp += ")";
  }

  // right bracket match
  notMatch = 0;
  for (i = 0; i < newExp.length; i++) {
    if (newExp[i] === ")") {
      notMatch += 1;
    } else if (newExp[i] === "(") {
      notMatch -= 1;
    }
  }

  for (j = notMatch; j > 0; j--) {
    newExp = "(" + newExp;
  }

  // more check
  // if ) and ( have the same amount but some )s are not in the right of the corresponding (s
  var indexSum = 0;
  var bracketPairs = 0;
  for (i = 0; i < newExp.length; i++) {
    if (newExp[i] == ")") {
      indexSum += i;
      bracketPairs++;
    } else if (newExp[i] == "(") {
      indexSum -= i;
    }
  }
  // add enough brackets to make it legal
  if (indexSum <= 0) {
    for (j = 0; j < bracketPairs; j++) {
      newExp = "(" + newExp;
      newExp += ")";
    }
  }

  return newExp;
}

// V <-> (0.
// # <-> delete
/* expressionPointCheck
 * input: the expression string
 * function: the first step to legalize the expression string
 *           add ( and 0 before . or delete surplus .
 * return: the new expression string
 */
function expressionPointCheck(exp) {
  var newExp = exp;
  var tempExp = "";
  var numbers = "0123456789";

  for (var i = 0; i < exp.length; i++) {
    if (exp[i] == "." && exp[i - 1] != "h") {
      if (numbers.indexOf(exp[i - 1]) == -1) {
        tempExp = newExp.substring(0, i);
        newExp = tempExp + "V" + newExp.substring(i + 1);
      } else if (numbers.indexOf(exp[i + 1]) == -1) {
        tempExp = newExp.substring(i + 1);
        newExp = newExp.substring(0, i) + "#" + tempExp;
      }
    }
  }

  newExp = newExp.replace(/V/g, "(0.");
  newExp = newExp.replace(/#/g, "");

  return newExp;
}

// & <-> *(
// % <-> )*
// # <-> delete
// L <-> *π
// R <-> π*
/* expressionCheck
 * input: the expression string
 * function: the second step to legalize the expression string
 *           add * in necessary and delete surplus *
 * return: the new expression string
 */
function expressionCheck(exp) {
  var newExp = exp;
  var tempExp = "";
  var tempIndex = 0;
  var numbers = "0123456789πe";

  for (var i = 0; i < exp.length; i++) {
    if (exp[i] == "(") {
      if (numbers.indexOf(exp[i - 1]) != -1 || exp[i - 1] == "!" || exp[i - 1] == ")") {
        if (exp.substring(i - 5, i) == "log10") continue;

        tempExp = newExp.substring(i + 1);
        newExp = newExp.substring(0, i) + "&" + tempExp;
      }
    } else if (exp[i] == ")") {
      if (numbers.indexOf(exp[i + 1]) != -1) {
        tempExp = newExp.substring(0, i);
        newExp = tempExp + "%" + newExp.substring(i + 1);
      }
    } else if (exp[i] == "*") {
      if (i == 0) newExp = "#" + newExp.substring(1);

      if (exp[i - 1] == "(") {
        tempExp = newExp.substring(i + 1);
        newExp = newExp.substring(0, i) + "#" + tempExp;
      }
    } else if (exp[i] == "π") {
      if (numbers.indexOf(exp[i - 1]) != -1) {
        tempExp = newExp.substring(i + 1);
        newExp = newExp.substring(0, i) + "L" + tempExp;
      }

      if (numbers.indexOf(exp[i + 1]) != -1) {
        tempExp = newExp.substring(0, i);
        newExp = tempExp + "R" + newExp.substring(i + 1);
      }
    }
  }

  newExp = newExp.replace(/&/g, "*(");
  newExp = newExp.replace(/%/g, ")*");
  newExp = newExp.replace(/#/g, "");
  newExp = newExp.replace(/L/g, "*π");
  newExp = newExp.replace(/R/g, "π*");

  return newExp;
}

// n!
function factorial(n) {
  if (n === 0) {
    return 1;
  }

  return n * factorial(n - 1);
}

/* calculateSquare
 * input: the expression string
 * function: calculate all √n or √(n) in the expression
 * return: the new expression string
 */
function calculateSquare(exp) {
  var newExp = exp;
  var tempExp = "";
  var tempIndex = 0;
  var numbers = "0123456789eπ.";

  while ((i = newExp.indexOf("√")) != -1) {
    tempIndex = i + 1;
    // delete all the ( between √ and numbers
    while (newExp[tempIndex] == "(") {
      tempExp = newExp.substring(0, tempIndex);
      newExp = tempExp + newExp.substring(tempIndex + 1);
      tempIndex++;
    }

    while (numbers.indexOf(newExp[tempIndex]) != -1) {
      tempIndex++;
    }

    // replace √n with its result
    tempExp = newExp.substring(0, i);
    if (numbers.indexOf(tempExp[tempExp.length - 1]) != -1 && tempExp[tempExp.length - 1] != ".") {
      // add * between numbers and √
      newExp = tempExp + "*" + Math.sqrt(newExp.substring(i + 1, tempIndex)) + newExp.substring(tempIndex);
    } else {
      newExp = tempExp + Math.sqrt(newExp.substring(i + 1, tempIndex)) + newExp.substring(tempIndex);
    }
  }

  return newExp;
}

/* calculateFactorial
 * input: the expression string
 * function: calculate all the n! in the expression
 *           especially there are brackets around the numbers like ((n))!
 * return: a new expression string whose n!s have been calculated
 */
function calculateFactorial(exp) {
  var newExp = exp;
  var tempExp = "";
  var tempIndex = 0;
  // π and e are not included
  var numbers = "0123456789";

  while ((i = newExp.indexOf("!")) != -1) {
    tempIndex = i - 1;
    // delete all the ) between n and !
    while (newExp[tempIndex] == ")") {
      tempExp = newExp.substring(tempIndex + 1);
      newExp = newExp.substring(0, tempIndex) + tempExp;
      i--;
      tempIndex--;
    }

    while (numbers.indexOf(newExp[tempIndex]) != -1) {
      tempIndex--;
    }

    // replace n! with its result
    tempExp = newExp.substring(i + 1);
    if (numbers.indexOf(tempExp[0]) != -1) {
      // add * between ! and numbers
      newExp = newExp.substring(0, tempIndex + 1) + factorial(parseInt(newExp.substring(tempIndex + 1, i))) + "*" + tempExp;
    } else {
      newExp = newExp.substring(0, tempIndex + 1) + factorial(parseInt(newExp.substring(tempIndex + 1, i))) + tempExp;
    }
  }

  return newExp;
}

/* calculatePower
 * input: the expression string
 * function: calculate all the a^b in the expresion
 * return: the new expression whose a^b replaced by its result
 */
function calculatePower(exp) {
  var newExp = exp;
  var tempExp = "";
  var tempIndex = 0;
  var numbers = "0123456789.";
  var base = 0;
  var exponent = 0;
  var fontIndex = 0;
  var rearIndex = 0;

  while ((i = newExp.indexOf("^")) != -1) {
    // find base
    tempIndex = i - 1;
    // delete all )s between numbers and ^
    while (newExp[tempIndex] == ")") {
      tempExp = newExp.substring(tempIndex + 1);
      newExp = newExp.substring(0, tempIndex) + tempExp;
      i--;
      tempIndex--;
    }

    // base must be e or π if e^b or π^b
    if (newExp[tempIndex] == "I") {
      base = Math.PI;
      fontIndex = i - 8;
    } else if (newExp[tempIndex] == "E") {
      base = Math.E;
      fontIndex = i - 7;
    } else {
      while (numbers.indexOf(newExp[tempIndex]) != -1) {
        tempIndex--;
      }

      base = parseFloat(newExp.substring(tempIndex + 1, i));
      fontIndex = tempIndex;
    }

    // find exponent
    tempIndex = i + 1;
    // delete all (s between ^ and numbers
    while (newExp[tempIndex] == "(") {
      tempExp = newExp.substring(0, tempIndex);
      newExp = tempExp + newExp.substring(tempIndex + 1);
      tempIndex++;
    }

    // exponent must be e or π if a^e or a^π
    if (newExp[tempIndex] == "M" && newExp[tempIndex + 5] == "P") {
      exponent = Math.PI;
      rearIndex = i + 8;
    } else if (newExp[tempIndex] == "M" && newExp[tempIndex + 5] == "E") {
      exponent = Math.E;
      rearIndex = i + 7;
    } else {
      while (numbers.indexOf(newExp[tempIndex]) != -1) {
        tempIndex++;
      }

      exponent = parseFloat(newExp.substring(i + 1, tempIndex));
      rearIndex = tempIndex;
    }

    // replace
    newExp = newExp.substring(0, fontIndex + 1) + Math.pow(base, exponent) + newExp.substring(rearIndex);
  }

  return newExp;
}

/* isValid
 * input: the expression string
 * function: check the syntax before calculating the expression
 * return: true if there is no errors, otherwise, false
 * next step: not completed, sth must be ignored
 */
function isValid(exp) {
  var newExp = exp;
  var i = 0;
  var numbers = "0123456789e";
  var operators = "^+-*/";

  if (newExp.indexOf("^^") != -1) return false;

  // all operands should exist
  if (operators.indexOf(newExp[newExp.length - 1]) != -1) return false;

  // e is a irrational constant number, other numbers can not be adjacent to it
  while ((i = newExp.indexOf("e")) != -1) {
    if (numbers.indexOf(newExp[i - 1]) != -1 || numbers.indexOf(newExp[i + 1]) != -1) return false;

    newExp = newExp.substring(i + 1);
  }
  newExp = exp;

  // only integers have factorial
  while ((i = newExp.indexOf("!")) != -1) {
    var tempIndex = i - 1;
    while (numbers.indexOf(newExp[tempIndex]) != -1) {
      tempIndex--;
    }

    if (newExp[tempIndex] == ".") return false;

    // there should be numbers to the left of !
    tempIndex = i - 1;
    while (newExp[tempIndex] == ")") {
      tempIndex--;
    }

    if (numbers.indexOf(newExp[tempIndex]) == -1) return false;

    // n!!!!!... is allowed
    tempIndex = i;
    while (newExp[tempIndex + 1] == "!") {
      tempIndex++;
    }
    newExp = newExp.substring(tempIndex + 1);
  }
  newExp = exp;

  if (newExp.indexOf("()") != -1) return false;

  if (newExp[0] == ")" || newExp[newExp.length - 1] == "(") return false;

  for (i = 0; i < newExp.length; i++) {
    if (newExp[i] == "(" && (numbers + "(π").indexOf(newExp[i + 1]) == -1) return false;

    if (newExp[i] == ")" && (numbers + ")π").indexOf(newExp[i - 1]) == -1) return false;
  }

  return true;
}

/* exceptionSolutions
 * input: the expression string
 * function: solve some exceptional problems like NaN or Infinity
 * return: the new expression string
 * next step: not completed, sth must be ignored
 */
function exceptionSolutions(exp) {
  var newExp = exp;
  var value = 0;
  var i = 0;
  if (newExp.indexOf("Infinity") != -1) {
    newExp = newExp.replace(/Infinity/g, "∞");
  }

  if ((i = newExp.indexOf("NaN")) != -1 && "!^.+-×÷".indexOf(newExp[i + 3]) != -1) newExp = "NaN";

  if ((i = newExp.indexOf("∞")) != -1 && "!^.+-×÷".indexOf(newExp[i + 1]) != -1) newExp = newExp.substring(0, i + 1);

  // the result may be too large
  if (newExp.indexOf("e+") != -1 || newExp.length > 19) {
    value = parseFloat(newExp);
    newExp = "" + value.toPrecision(6);
  }

  // try to solve the precision problem about float numbers, for example, 0.6 * 3 should be 1.8 instead of 1.79999999
  if (newExp.indexOf(".") != -1 && (newExp.indexOf("9999999999") != -1 || newExp.indexOf("0000000000") != -1)) {
    value = parseFloat(newExp);
    newExp = "" + value.toFixed(10);
    while (newExp[newExp.length - 1] == "0") {
      newExp = newExp.substring(0, newExp.length - 1);
    }
  }

  return newExp;
}

/* expressionLengthCheck
 * function: check the length of both inputExpression and outputExpression strings,
 *           then change the styles they show
 * next step: use another algorithm, getElementById("id").offsetWidth may be useful
 */
function expressionLengthCheck() {
  var expressionShowed = "";
  var resultShowed = "";

  if (outputExpression.length > 19) {
    resultShowed = outputExpression.substring(outputExpression.length - 19, outputExpression.length);
  } else {
    resultShowed = outputExpression;
  }

  if (inputExpression.length > 22) {
    expressionShowed = "..." + inputExpression.substring(inputExpression.length - 22, inputExpression.length);
  } else {
    expressionShowed = inputExpression;
  }

  document.getElementById("expression").textContent = expressionShowed;
  document.getElementById("result").textContent = resultShowed;
}

/* loadSound
 * function: load sound from url
 * source: https://jingyan.baidu.com/article/9c69d48fe16ac313c9024efe.html
 * thank caoshixuan100 for sharing
 */
function loadSound(url) {
  var req = new XMLHttpRequest();

  req.open('GET', url, true);
  req.responseType = 'arraybuffer';

  req.onload = function() {
    audio.decodeAudioData(req.response, function(buffer) {
      var source = audio.createBufferSource();
      source.buffer = buffer;
      source.connect(audio.destination);
      source.start(0);
    }, function(error) { console.info("Error!"); });
  };

  req.send();
}
