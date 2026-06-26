const display = document.getElementById('display');
const expressionEl = document.getElementById('expression');
const buttons = document.querySelectorAll('.btn');

let currentValue = '0';
let previousValue = '';
let operator = null;
let shouldResetDisplay = false;

const operatorSymbols = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷'
};

function updateDisplay() {
  display.textContent = formatDisplay(currentValue);
}

function formatDisplay(value) {
  if (value === 'Error') return value;
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(6);
  }
  const str = num.toString();
  if (str.length > 12) {
    return num.toPrecision(10);
  }
  return str;
}

function updateExpression() {
  if (previousValue && operator) {
    expressionEl.textContent = `${formatDisplay(previousValue)} ${operatorSymbols[operator]}`;
  } else {
    expressionEl.textContent = '';
  }
}

function pressButton(btn) {
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 100);
}

function inputNumber(num) {
  if (shouldResetDisplay) {
    currentValue = num;
    shouldResetDisplay = false;
  } else {
    currentValue = currentValue === '0' ? num : currentValue + num;
  }
  updateDisplay();
}

function inputDecimal() {
  if (shouldResetDisplay) {
    currentValue = '0.';
    shouldResetDisplay = false;
  } else if (!currentValue.includes('.')) {
    currentValue += '.';
  }
  updateDisplay();
}

function clear() {
  currentValue = '0';
  previousValue = '';
  operator = null;
  shouldResetDisplay = false;
  updateDisplay();
  updateExpression();
}

function toggleSign() {
  if (currentValue !== '0') {
    currentValue = currentValue.startsWith('-')
      ? currentValue.slice(1)
      : '-' + currentValue;
    updateDisplay();
  }
}

function percent() {
  const num = parseFloat(currentValue) / 100;
  currentValue = num.toString();
  updateDisplay();
}

function setOperator(op) {
  if (operator && !shouldResetDisplay) {
    calculate();
  }
  previousValue = currentValue;
  operator = op;
  shouldResetDisplay = true;
  updateExpression();
}

function calculate() {
  if (!operator || !previousValue) return;

  const prev = parseFloat(previousValue);
  const curr = parseFloat(currentValue);
  let result;

  switch (operator) {
    case '+': result = prev + curr; break;
    case '-': result = prev - curr; break;
    case '*': result = prev * curr; break;
    case '/':
      if (curr === 0) {
        currentValue = 'Error';
        previousValue = '';
        operator = null;
        updateDisplay();
        updateExpression();
        return;
      }
      result = prev / curr;
      break;
  }

  currentValue = result.toString();
  operator = null;
  previousValue = '';
  shouldResetDisplay = true;
  updateDisplay();
  updateExpression();
}

function handleAction(action, value) {
  switch (action) {
    case 'number': inputNumber(value); break;
    case 'decimal': inputDecimal(); break;
    case 'clear': clear(); break;
    case 'toggle-sign': toggleSign(); break;
    case 'percent': percent(); break;
    case 'operator': setOperator(value); break;
    case 'equals': calculate(); break;
  }
}

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    pressButton(btn);
    handleAction(btn.dataset.action, btn.dataset.value);
  });
});

document.addEventListener('keydown', (e) => {
  const keyMap = {
    '0': ['number', '0'], '1': ['number', '1'], '2': ['number', '2'],
    '3': ['number', '3'], '4': ['number', '4'], '5': ['number', '5'],
    '6': ['number', '6'], '7': ['number', '7'], '8': ['number', '8'],
    '9': ['number', '9'], '.': ['decimal'], ',': ['decimal'],
    '+': ['operator', '+'], '-': ['operator', '-'],
    '*': ['operator', '*'], '/': ['operator', '/'],
    'Enter': ['equals'], '=': ['equals'],
    'Escape': ['clear'], 'Backspace': ['clear']
  };

  const mapping = keyMap[e.key];
  if (!mapping) return;

  e.preventDefault();
  const [action, value] = mapping;
  const selector = value
    ? `[data-action="${action}"][data-value="${value}"]`
    : `[data-action="${action}"]`;
  const btn = document.querySelector(selector);
  if (btn) pressButton(btn);
  handleAction(action, value);
});
