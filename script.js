let isSecondFunc = false;
let isHyp = false;
let angleUnit = 'DEG';
let currentExpression = '';
let memoryValue = 0;
let history = [];

const mainDisplay = document.getElementById('mainDisplay');
const expressionDisplay = document.getElementById('expressionDisplay');
const angleUnitBtn = document.getElementById('angleUnitBtn');
const hypBtn = document.getElementById('hypBtn');
const secondFuncBtn = document.getElementById('secondFuncBtn');

function updateDisplay() {
  mainDisplay.textContent = currentExpression || '0';
}

function appendValue(val) {
  currentExpression += val;
  updateDisplay();
}

function appendOperator(op) {
  if (currentExpression === '' && op === '-') {
    currentExpression += '-';
  } else if (currentExpression.length > 0) {
    const lastChar = currentExpression.slice(-1);
    if ('+-×÷%^'.includes(lastChar)) {
      currentExpression = currentExpression.slice(0, -1) + op;
    } else {
      currentExpression += op;
    }
  }
  updateDisplay();
}

function appendDecimal() {
  const parts = currentExpression.split(/[+\-×÷%^()]/);
  const lastPart = parts[parts.length - 1];
  if (!lastPart.includes('.')) {
    currentExpression += '.';
    updateDisplay();
  }
}

function appendConstant(symbol) {
  if (symbol === 'π') currentExpression += 'π';
  else if (symbol === 'e') currentExpression += 'e';
  else if (symbol === 'ϕ') currentExpression += '1.618033988749895';
  updateDisplay();
}

function appendRandom() {
  currentExpression += Math.random().toFixed(4);
  updateDisplay();
}

function clearAll() {
  currentExpression = '';
  expressionDisplay.textContent = '';
  updateDisplay();
}

function backspace() {
  if (currentExpression.endsWith('π')) {
    currentExpression = currentExpression.slice(0, -7);
  } else if (currentExpression.endsWith('e')) {
    currentExpression = currentExpression.slice(0, -6);
  } else {
    currentExpression = currentExpression.slice(0, -1);
  }
  updateDisplay();
}

function toggleAngleUnit() {
  angleUnit = angleUnit === 'DEG' ? 'RAD' : 'DEG';
  angleUnitBtn.textContent = angleUnit;
}

function toggleHyp() {
  isHyp = !isHyp;
  hypBtn.classList.toggle('bg-gray-800', !isHyp);
  hypBtn.classList.toggle('bg-purple-900/60', isHyp);
  hypBtn.classList.toggle('text-purple-300', isHyp);
  updateFuncLabels();
}

function toggleSecondFunction() {
  isSecondFunc = !isSecondFunc;
  secondFuncBtn.classList.toggle('bg-amber-500', isSecondFunc);
  secondFuncBtn.classList.toggle('text-black', isSecondFunc);
  updateFuncLabels();
}

function updateFuncLabels() {
  document.getElementById('btnSin').textContent = isHyp ? (isSecondFunc ? 'asinh' : 'sinh') : (isSecondFunc ? 'asin' : 'sin');
  document.getElementById('btnCos').textContent = isHyp ? (isSecondFunc ? 'acosh' : 'cosh') : (isSecondFunc ? 'acos' : 'cos');
  document.getElementById('btnTan').textContent = isHyp ? (isSecondFunc ? 'atanh' : 'tanh') : (isSecondFunc ? 'atan' : 'tan');
  document.getElementById('btnPower2').textContent = isSecondFunc ? 'x³' : 'x²';
  document.getElementById('btnPowerY').textContent = isSecondFunc ? 'ʸ√x' : 'x^y';
  document.getElementById('btnLog').textContent = isSecondFunc ? '2ⁿ' : 'log';
  document.getElementById('btnLn').textContent = isSecondFunc ? 'eⁿ' : 'ln';
  document.getElementById('btnRoot').textContent = isSecondFunc ? '∛x' : '√x';
  document.getElementById('btnTenPower').textContent = isSecondFunc ? '2ⁿ' : '10ⁿ';
}

function handleTrig(type) {
  let funcName = type;
  if (isHyp) funcName += 'h';
  if (isSecondFunc) funcName = 'a' + funcName;
  currentExpression += funcName + '(';
  updateDisplay();
}

function handlePower2() {
  currentExpression += isSecondFunc ? '^3' : '^2';
  updateDisplay();
}

function handleLog() {
  currentExpression += isSecondFunc ? 'log2(' : 'log10(';
  updateDisplay();
}

function handleLn() {
  currentExpression += isSecondFunc ? 'exp(' : 'ln(';
  updateDisplay();
}

function handleRoot() {
  currentExpression += isSecondFunc ? 'cbrt(' : 'sqrt(';
  updateDisplay();
}

function handleTenPower() {
  currentExpression += isSecondFunc ? '2^' : '10^';
  updateDisplay();
}

function handleFactorial() {
  currentExpression += '!';
  updateDisplay();
}

function handleReciprocal() {
  currentExpression += '1/(';
  updateDisplay();
}

function handleAbs() {
  currentExpression += 'abs(';
  updateDisplay();
}

function toggleSign() {
  if (currentExpression.startsWith('-')) {
    currentExpression = currentExpression.slice(1);
  } else {
    currentExpression = '-' + currentExpression;
  }
  updateDisplay();
}

/* Memory functions */
function memoryClear() { memoryValue = 0; }
function memoryRecall() { currentExpression += memoryValue.toString(); updateDisplay(); }
function memoryAdd() { try { memoryValue += parseFloat(eval(prepareExpression(currentExpression))) || 0; } catch(e){} }
function memorySubtract() { try { memoryValue -= parseFloat(eval(prepareExpression(currentExpression))) || 0; } catch(e){} }
function memoryStore() { try { memoryValue = parseFloat(eval(prepareExpression(currentExpression))) || 0; } catch(e){} }

/* Parse math operations */
function prepareExpression(expr) {
  let parsed = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\^/g, '**')
    .replace(/abs\(/g, 'Math.abs(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/cbrt\(/g, 'Math.cbrt(')
    .replace(/log10\(/g, 'Math.log10(')
    .replace(/log2\(/g, 'Math.log2(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/exp\(/g, 'Math.exp(');

  parsed = parsed.replace(/(\w+)\(([^)]+)\)/g, (match, func, arg) => {
    if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(func)) {
      let num = parseFloat(arg);
      if (isNaN(num)) return match;
      if (angleUnit === 'DEG') {
        if (['sin', 'cos', 'tan'].includes(func)) {
          num = num * (Math.PI / 180);
          return `Math.${func}(${num})`;
        } else {
          return `(Math.${func}(${arg}) * (180 / π))`;
        }
      } else {
        return `Math.${func}(${arg})`;
      }
    }
    if (['sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh'].includes(func)) {
      return `Math.${func}(${arg})`;
    }
    return match;
  });

  parsed = parsed.replace(/(\d+)!/g, (match, num) => {
    let n = parseInt(num);
    let fact = 1;
    for (let i = 2; i <= n; i++) fact *= i;
    return fact.toString();
  });

  return parsed;
}

function calculateResult() {
  if (!currentExpression) return;
  try {
    const rawExpr = currentExpression;
    const processedExpr = prepareExpression(currentExpression);
    const result = eval(processedExpr);
    
    let formattedResult = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(8)).toString();
    
    expressionDisplay.textContent = rawExpr + ' =';
    history.unshift({ expr: rawExpr, res: formattedResult });
    updateHistoryUI();
    
    currentExpression = formattedResult;
    updateDisplay();
  } catch (err) {
    mainDisplay.textContent = 'Error';
    setTimeout(() => updateDisplay(), 1500);
  }
}

function toggleHistory() {
  const panel = document.getElementById('historyPanel');
  panel.classList.toggle('translate-y-full');
}

function updateHistoryUI() {
  const list = document.getElementById('historyList');
  list.innerHTML = history.map(item => `
    <div class="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 cursor-pointer text-right transition" onclick="useHistory('${item.res}')">
      <div class="text-xs text-gray-400 font-mono-custom">${item.expr}</div>
      <div class="text-base text-white font-mono-custom font-semibold">${item.res}</div>
    </div>
  `).join('');
}

function useHistory(val) {
  currentExpression += val;
  updateDisplay();
  toggleHistory();
}

function clearHistory() {
  history = [];
  updateHistoryUI();
}

/* Keyboard Input Handling */
window.addEventListener('keydown', (e) => {
  if ((e.key >= '0' && e.key <= '9')) appendValue(e.key);
  if (e.key === '.') appendDecimal();
  if (e.key === '+') appendOperator('+');
  if (e.key === '-') appendOperator('-');
  if (e.key === '*') appendOperator('×');
  if (e.key === '/') appendOperator('÷');
  if (e.key === '%') appendOperator('%');
  if (e.key === '^') appendOperator('^');
  if (e.key === '(' || e.key === ')') appendValue(e.key);
  if (e.key === 'Enter' || e.key === '=') calculateResult();
  if (e.key === 'Backspace') backspace();
  if (e.key === 'Escape') clearAll();
});
