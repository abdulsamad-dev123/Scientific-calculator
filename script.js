document.addEventListener('DOMContentLoaded', () => {
  let isSecondFunc = false;
  let isHyp = false;
  let angleUnit = 'DEG';
  let expr = '';
  let memoryValue = 0;
  let history = [];

  const mainDisplay = document.getElementById('mainDisplay');
  const expressionDisplay = document.getElementById('expressionDisplay');
  const angleUnitBtn = document.getElementById('angleUnitBtn');
  const hypBtn = document.getElementById('hypBtn');
  const secondFuncBtn = document.getElementById('secondFuncBtn');
  const historyPanel = document.getElementById('historyPanel');
  const historyList = document.getElementById('historyList');

  function updateDisplay() {
    mainDisplay.textContent = expr || '0';
  }

  function appendVal(v) {
    expr += v;
    updateDisplay();
  }

  function appendOp(op) {
    if (expr === '' && op === '-') {
      expr += '-';
    } else if (expr.length > 0) {
      const last = expr.slice(-1);
      if ('+-×÷%^'.includes(last)) {
        expr = expr.slice(0, -1) + op;
      } else {
        expr += op;
      }
    }
    updateDisplay();
  }

  function updateLabels() {
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

  function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  function evaluateExpression(rawExpr) {
    let parsed = rawExpr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'Math.PI')
      .replace(/e/g, 'Math.E')
      .replace(/ϕ/g, '1.618033988749895');

    // Auto-balance/close unclosed parentheses (fixes log(9 or sin(30 errors)
    const openBrackets = (parsed.match(/\(/g) || []).length;
    const closeBrackets = (parsed.match(/\)/g) || []).length;
    if (openBrackets > closeBrackets) {
      parsed += ')'.repeat(openBrackets - closeBrackets);
    }

    // Implicit multiplication patterns
    parsed = parsed.replace(/(\d)(\()|(\))(\d)|(\d)([a-zA-Z])/g, '$1$3$5*$2$4$6');

    // Factorials
    parsed = parsed.replace(/(\d+)!/g, (_, num) => factorial(parseInt(num)));

    // Exponents
    parsed = parsed.replace(/([0-9.Math.PIE]+)\^([0-9.Math.PIE]+)/g, 'Math.pow($1,$2)');

    const scope = {
      sin: (x) => Math.sin(angleUnit === 'DEG' ? x * (Math.PI / 180) : x),
      cos: (x) => Math.cos(angleUnit === 'DEG' ? x * (Math.PI / 180) : x),
      tan: (x) => Math.tan(angleUnit === 'DEG' ? x * (Math.PI / 180) : x),
      asin: (x) => {
        let res = Math.asin(x);
        return angleUnit === 'DEG' ? res * (180 / Math.PI) : res;
      },
      acos: (x) => {
        let res = Math.acos(x);
        return angleUnit === 'DEG' ? res * (180 / Math.PI) : res;
      },
      atan: (x) => {
        let res = Math.atan(x);
        return angleUnit === 'DEG' ? res * (180 / Math.PI) : res;
      },
      sinh: Math.sinh,
      cosh: Math.cosh,
      tanh: Math.tanh,
      asinh: Math.asinh,
      acosh: Math.acosh,
      atanh: Math.atanh,
      sqrt: Math.sqrt,
      cbrt: Math.cbrt,
      log: Math.log10,
      ln: Math.log,
      exp: Math.exp,
      abs: Math.abs,
      pow: Math.pow
    };

    const keys = Object.keys(scope);
    const values = Object.values(scope);
    
    const func = new Function(...keys, `return ${parsed};`);
    return func(...values);
  }

  function calculate() {
    if (!expr) return;
    try {
      const raw = expr;
      const result = evaluateExpression(raw);

      if (isNaN(result) || !isFinite(result)) {
        throw new Error("Invalid Output");
      }

      let formatted = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(8)).toString();

      expressionDisplay.textContent = raw + ' =';
      history.unshift({ expr: raw, res: formatted });
      renderHistory();

      expr = formatted;
      updateDisplay();
    } catch (e) {
      mainDisplay.textContent = 'Error';
      setTimeout(updateDisplay, 1500);
    }
  }

  function renderHistory() {
    historyList.innerHTML = history.map(item => `
      <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer text-right transition history-item" data-res="${item.res}">
        <div class="text-xs text-slate-400 font-mono-custom">${item.expr}</div>
        <div class="text-base text-white font-mono-custom font-semibold">${item.res}</div>
      </div>
    `).join('');

    document.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        expr += el.dataset.res;
        updateDisplay();
        historyPanel.classList.add('translate-y-full');
      });
    });
  }

  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const b = e.currentTarget;
      const val = b.dataset.val;
      const op = b.dataset.op;
      const action = b.dataset.action;

      if (val) appendVal(val);
      if (op) appendOp(op);

      if (action) {
        switch (action) {
          case 'clear':
            expr = '';
            expressionDisplay.textContent = '';
            updateDisplay();
            break;
          case 'backspace':
            expr = expr.slice(0, -1);
            updateDisplay();
            break;
          case 'equals':
            calculate();
            break;
          case 'dot':
            const parts = expr.split(/[+\-×÷%^()]/);
            if (!parts[parts.length - 1].includes('.')) appendVal('.');
            break;
          case 'sign':
            if (expr.startsWith('-')) expr = expr.slice(1);
            else expr = '-' + expr;
            updateDisplay();
            break;
          case '2nd':
            isSecondFunc = !isSecondFunc;
            secondFuncBtn.classList.toggle('bg-amber-500', isSecondFunc);
            secondFuncBtn.classList.toggle('text-slate-950', isSecondFunc);
            updateLabels();
            break;
          case 'func-trig':
            let t = b.dataset.trig;
            if (isHyp) t += 'h';
            if (isSecondFunc) t = 'a' + t;
            expr += t + '(';
            updateDisplay();
            break;
          case 'func-power2':
            expr += isSecondFunc ? '^3' : '^2';
            updateDisplay();
            break;
          case 'func-powery':
            expr += '^';
            updateDisplay();
            break;
          case 'func-log':
            expr += isSecondFunc ? 'pow(2,' : 'log(';
            updateDisplay();
            break;
          case 'func-ln':
            expr += isSecondFunc ? 'exp(' : 'ln(';
            updateDisplay();
            break;
          case 'func-root':
            expr += isSecondFunc ? 'cbrt(' : 'sqrt(';
            updateDisplay();
            break;
          case 'func-tenpow':
            expr += isSecondFunc ? 'pow(2,' : 'pow(10,';
            updateDisplay();
            break;
          case 'func-fact':
            expr += '!';
            updateDisplay();
            break;
          case 'func-recip':
            expr += '1/(';
            updateDisplay();
            break;
          case 'func-abs':
            expr += 'abs(';
            updateDisplay();
            break;
          case 'const-pi':
            expr += 'π';
            updateDisplay();
            break;
          case 'const-e':
            expr += 'e';
            updateDisplay();
            break;
          case 'const-phi':
            expr += 'ϕ';
            updateDisplay();
            break;
          case 'rand':
            expr += Math.random().toFixed(4);
            updateDisplay();
            break;
          case 'mc': memoryValue = 0; break;
          case 'mr': expr += memoryValue; updateDisplay(); break;
          case 'm-add': try { memoryValue += evaluateExpression(expr); } catch(err){} break;
          case 'm-sub': try { memoryValue -= evaluateExpression(expr); } catch(err){} break;
          case 'ms': try { memoryValue = evaluateExpression(expr); } catch(err){} break;
        }
      }
    });
  });

  angleUnitBtn.addEventListener('click', () => {
    angleUnit = angleUnit === 'DEG' ? 'RAD' : 'DEG';
    angleUnitBtn.textContent = angleUnit;
  });

  hypBtn.addEventListener('click', () => {
    isHyp = !isHyp;
    hypBtn.classList.toggle('bg-slate-800', !isHyp);
    hypBtn.classList.toggle('bg-purple-900/60', isHyp);
    hypBtn.classList.toggle('text-purple-300', isHyp);
    updateLabels();
  });

  document.getElementById('historyToggleBtn').addEventListener('click', () => {
    historyPanel.classList.toggle('translate-y-full');
  });

  document.getElementById('closeHistoryBtn').addEventListener('click', () => {
    historyPanel.classList.add('translate-y-full');
  });

  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    history = [];
    renderHistory();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') appendVal(e.key);
    if (e.key === '.') appendVal('.');
    if (e.key === '+') appendOp('+');
    if (e.key === '-') appendOp('-');
    if (e.key === '*') appendOp('×');
    if (e.key === '/') appendOp('÷');
    if (e.key === '%') appendOp('%');
    if (e.key === '^') appendOp('^');
    if (e.key === '(' || e.key === ')') appendVal(e.key);
    if (e.key === 'Enter' || e.key === '=') calculate();
    if (e.key === 'Backspace') {
      expr = expr.slice(0, -1);
      updateDisplay();
    }
    if (e.key === 'Escape') {
      expr = '';
      expressionDisplay.textContent = '';
      updateDisplay();
    }
  });
});
