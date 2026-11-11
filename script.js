document.addEventListener('DOMContentLoaded', () => {
  let isSecondFunc = false;
  let isHyp = false;
  let angleUnit = 'DEG';
  let memoryValue = 0;
  let history = [];

  let expr = '0';
  let cursorPos = 1;

  const displayBefore = document.getElementById('displayBefore');
  const displayAfter = document.getElementById('displayAfter');
  const expressionDisplay = document.getElementById('expressionDisplay');
  const angleUnitBtn = document.getElementById('angleUnitBtn');
  const hypBtn = document.getElementById('hypBtn');
  const secondFuncBtn = document.getElementById('secondFuncBtn');
  const historyPanel = document.getElementById('historyPanel');
  const historyList = document.getElementById('historyList');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');

  // Theme Switching Logic
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    
    if (isDark) {
      themeIcon.className = 'fa-solid fa-sun text-amber-500';
    } else {
      themeIcon.className = 'fa-solid fa-moon text-indigo-600';
    }
  });

  function renderDisplay() {
    if (expr === '') {
      expr = '0';
      cursorPos = 1;
    }
    cursorPos = Math.max(0, Math.min(cursorPos, expr.length));

    displayBefore.textContent = expr.slice(0, cursorPos);
    displayAfter.textContent = expr.slice(cursorPos);
  }

  function insertText(str) {
    if (expr === '0') {
      expr = '';
      cursorPos = 0;
    }
    expr = expr.slice(0, cursorPos) + str + expr.slice(cursorPos);
    cursorPos += str.length;
    renderDisplay();
  }

  function deleteBack() {
    if (cursorPos > 0 && expr.length > 0) {
      expr = expr.slice(0, cursorPos - 1) + expr.slice(cursorPos);
      cursorPos--;
    }
    renderDisplay();
  }

  function moveCursor(direction) {
    if (direction === 'left') {
      cursorPos = Math.max(0, cursorPos - 1);
    } else if (direction === 'right') {
      cursorPos = Math.min(expr.length, cursorPos + 1);
    }
    renderDisplay();
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

    const openBrackets = (parsed.match(/\(/g) || []).length;
    const closeBrackets = (parsed.match(/\)/g) || []).length;
    if (openBrackets > closeBrackets) {
      parsed += ')'.repeat(openBrackets - closeBrackets);
    }

    parsed = parsed.replace(/(\d)(\()|(\))(\d)|(\d)([a-zA-Z])/g, '$1$3$5*$2$4$6');
    parsed = parsed.replace(/(\d+)!/g, (_, num) => factorial(parseInt(num)));
    parsed = parsed.replace(/([0-9.Math.PIE]+)\^([0-9.Math.PIE]+)/g, 'Math.pow($1,$2)');

    const scope = {
      sin: (x) => Math.sin(angleUnit === 'DEG' ? x * (Math.PI / 180) : x),
      cos: (x) => Math.cos(angleUnit === 'DEG' ? x * (Math.PI / 180) : x),
      tan: (x) => Math.tan(angleUnit === 'DEG' ? x * (Math.PI / 180) : x),
      asin: (x) => angleUnit === 'DEG' ? Math.asin(x) * (180 / Math.PI) : Math.asin(x),
      acos: (x) => angleUnit === 'DEG' ? Math.acos(x) * (180 / Math.PI) : Math.acos(x),
      atan: (x) => angleUnit === 'DEG' ? Math.atan(x) * (180 / Math.PI) : Math.atan(x),
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
      cursorPos = expr.length;
      renderDisplay();
    } catch (e) {
      expr = 'Error';
      cursorPos = 5;
      renderDisplay();
      setTimeout(() => {
        expr = '0';
        cursorPos = 1;
        renderDisplay();
      }, 1500);
    }
  }

  function renderHistory() {
    historyList.innerHTML = history.map(item => `
      <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 cursor-pointer text-right transition history-item" data-res="${item.res}">
        <div class="text-xs text-slate-500 dark:text-slate-400 font-mono-custom">${item.expr}</div>
        <div class="text-lg text-slate-800 dark:text-white font-mono-custom font-semibold">${item.res}</div>
      </div>
    `).join('');

    document.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        insertText(el.dataset.res);
        historyPanel.classList.add('translate-y-full');
      });
    });
  }

  document.getElementById('navLeftBtn').addEventListener('click', () => moveCursor('left'));
  document.getElementById('navRightBtn').addEventListener('click', () => moveCursor('right'));

  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const b = e.currentTarget;
      const val = b.dataset.val;
      const op = b.dataset.op;
      const action = b.dataset.action;

      if (val) insertText(val);
      if (op) insertText(op);

      if (action) {
        switch (action) {
          case 'clear':
            expr = '0';
            cursorPos = 1;
            expressionDisplay.textContent = '';
            renderDisplay();
            break;
          case 'backspace':
            deleteBack();
            break;
          case 'equals':
            calculate();
            break;
          case 'dot':
            insertText('.');
            break;
          case 'sign':
            if (expr.startsWith('-')) {
              expr = expr.slice(1);
              cursorPos = Math.max(0, cursorPos - 1);
            } else {
              expr = '-' + expr;
              cursorPos++;
            }
            renderDisplay();
            break;
          case '2nd':
            isSecondFunc = !isSecondFunc;
            secondFuncBtn.classList.toggle('bg-amber-500', isSecondFunc);
            secondFuncBtn.classList.toggle('text-white', isSecondFunc);
            updateLabels();
            break;
          case 'func-trig':
            let t = b.dataset.trig;
            if (isHyp) t += 'h';
            if (isSecondFunc) t = 'a' + t;
            insertText(t + '(');
            break;
          case 'func-power2':
            insertText(isSecondFunc ? '^3' : '^2');
            break;
          case 'func-powery':
            insertText('^');
            break;
          case 'func-log':
            insertText(isSecondFunc ? 'pow(2,' : 'log(');
            break;
          case 'func-ln':
            insertText(isSecondFunc ? 'exp(' : 'ln(');
            break;
          case 'func-root':
            insertText(isSecondFunc ? 'cbrt(' : 'sqrt(');
            break;
          case 'func-tenpow':
            insertText(isSecondFunc ? 'pow(2,' : 'pow(10,');
            break;
          case 'func-fact':
            insertText('!');
            break;
          case 'func-recip':
            insertText('1/(');
            break;
          case 'func-abs':
            insertText('abs(');
            break;
          case 'const-pi':
            insertText('π');
            break;
          case 'const-e':
            insertText('e');
            break;
          case 'const-phi':
            insertText('ϕ');
            break;
          case 'rand':
            insertText(Math.random().toFixed(4));
            break;
          case 'mc': memoryValue = 0; break;
          case 'mr': insertText(memoryValue.toString()); break;
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
    hypBtn.classList.toggle('bg-purple-600', isHyp);
    hypBtn.classList.toggle('text-white', isHyp);
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
    if (e.key === 'ArrowLeft') moveCursor('left');
    if (e.key === 'ArrowRight') moveCursor('right');
    if (e.key >= '0' && e.key <= '9') insertText(e.key);
    if (e.key === '.') insertText('.');
    if (e.key === '+') insertText('+');
    if (e.key === '-') insertText('-');
    if (e.key === '*') insertText('×');
    if (e.key === '/') insertText('÷');
    if (e.key === '%') insertText('%');
    if (e.key === '^') insertText('^');
    if (e.key === '(' || e.key === ')') insertText(e.key);
    if (e.key === 'Enter' || e.key === '=') calculate();
    if (e.key === 'Backspace') deleteBack();
    if (e.key === 'Escape') {
      expr = '0';
      cursorPos = 1;
      expressionDisplay.textContent = '';
      renderDisplay();
    }
  });

  renderDisplay();
});
