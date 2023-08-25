import React, { useState } from "react";
import { evaluate } from "mathjs";

const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const operators = ["/", "*", "-", "+", "="];

const maxCharsAtFullSize = 6;
const scaleFactor = "scale(0.36)";

const maxPrecision = 16;

function CalculatorDisplay({ value }) {
  const pointAt = `${value}`.indexOf(".");
  const decimalValue = value.substring(pointAt, evaluate(value.length));
  const precisionWithFraction =
    pointAt === -1 ? 0 : evaluate(decimalValue.length - 1);
  let formattedValue = null;
  let scientificNotation = null;
  let scaleDown = null;

  formattedValue = parseFloat(value).toLocaleString(undefined, {
    minimumFractionDigits: precisionWithFraction,
  });
  if (formattedValue === "NaN") {
    formattedValue = "Error";
  } else {
    if (formattedValue.length > maxPrecision - 1) {
      scientificNotation = parseFloat(value).toExponential(maxPrecision - 4);

      if (
        scientificNotation.substring(
          scientificNotation.length - 3,
          scientificNotation.length
        ) === "e+0"
      ) {
        scientificNotation = parseFloat(value).toExponential(maxPrecision - 1);
        scientificNotation = scientificNotation.substring(
          0,
          scientificNotation.length - 3
        );
      }
      formattedValue = scientificNotation;
      if (formattedValue === "NaN") {
        formattedValue = "Overflow\xA0Error";
      }
    }
  }
  scaleDown =
    `${formattedValue}`.length > maxCharsAtFullSize ? scaleFactor : "scale(1)";
  return (
    <div className="calculator-display">
      <div className="auto-scaling-text" style={{ transform: scaleDown }}>
        {formattedValue}
      </div>
    </div>
  );
}

function Calculator() {
  const [state, setState] = useState({
    displayValue: "0",
    operator: null,
    waitingForOperand: false,
    firstOperand: "0",
    clearAll: true,
  });

  const processDigit = (newKeyValue) => {
    const { displayValue, waitingForOperand } = state;

    if (waitingForOperand) {
      setState({
        ...state,
        displayValue: `${newKeyValue}`,
        waitingForOperand: false,
        clearAll: false,
      });
    } else {
      let newDisplayValue =
        displayValue === "0"
          ? `${newKeyValue}`
          : `${displayValue}${newKeyValue}`;
      setState({
        ...state,
        displayValue: `${newDisplayValue}`,
        waitingForOperand: false,
        clearAll: false,
      });
    }
  };

  const processOperator = (newKeyValue) => {
    const { displayValue, operator, waitingForOperand, firstOperand } = state;
    let newDisplayValue = null;
    let newOperator = null;
    let stringToEvaluate = null;

    if (firstOperand === "0" || operator == null || waitingForOperand) {
      setState({
        ...state,
        waitingForOperand: true,
        firstOperand: displayValue,
        operator: newKeyValue,
        clearAll: false,
      });
      return;
    } else {
      stringToEvaluate = `${firstOperand}${operator}${displayValue}`;
      try {
        newDisplayValue = `${evaluate(stringToEvaluate)}`;
      } catch (e) {
        newDisplayValue = "Error";
      }
      if (newDisplayValue === "Infinity") {
        newDisplayValue = "Error";
      }
      newOperator = newKeyValue === "=" ? null : newKeyValue;
      setState({
        ...state,
        displayValue: `${newDisplayValue}`,
        waitingForOperand: true,
        firstOperand: `${newDisplayValue}`,
        operator: newOperator,
        clearAll: false,
      });
    }
  };

  const processPoint = (newKeyValue) => {
    const { displayValue, waitingForOperand } = state;
    const needPoint = `${displayValue}`.indexOf(".") === -1 ? true : false;
    let newDisplayValue = null;

    if (waitingForOperand) {
      setState({
        ...state,
        displayValue: "0.",
        waitingForOperand: false,
        clearAll: false,
      });
    } else {
      if (needPoint) {
        newDisplayValue = `${displayValue}${newKeyValue}`;
        setState({
          ...state,
          displayValue: `${newDisplayValue}`,
          waitingForOperand: false,
          clearAll: false,
        });
      }
    }
  };

  const processPercentage = () => {
    const { displayValue } = state;
    const newDisplayValue =
      parseFloat(displayValue).toPrecision(maxPrecision) / 100;
    setState({
      ...state,
      displayValue: `${newDisplayValue}`,
      waitingForOperand: false,
      clearAll: false,
    });
  };

  const processPlusMinusToggle = () => {
    const { displayValue } = state;
    const newDisplayValue =
      parseFloat(displayValue).toPrecision(maxPrecision) * -1;
    setState({
      ...state,
      displayValue: `${newDisplayValue}`,
      waitingForOperand: false,
      clearAll: false,
    });
  };

  const processClear = () => {
    const { clearAll } = state;
    if (clearAll) {
      setState({
        displayValue: "0",
        firstOperand: "0",
        operator: null,
        waitingForOperand: false,
        clearAll: true,
      });
    } else {
      setState({ ...state, displayValue: "0", clearAll: true });
    }
  };

  const processFunctionKey = (newKeyValue) => {
    switch (newKeyValue) {
      case "C":
        processClear(newKeyValue);
        break;
      case "±":
        processPlusMinusToggle(newKeyValue);
        break;
      case ".":
        processPoint(newKeyValue);
        break;
      case "%":
        processPercentage(newKeyValue);
        break;
      default:
        console.log("Unexpected input: ", newKeyValue);
    }
  };

  const handleClick = (e) => {
    processNewKey(`${e.target.value}`);
  };

  const processNewKey = (newKeyValue) => {
    const isDigit = digits.includes(newKeyValue);
    const isOperator = operators.includes(newKeyValue);

    if (isDigit) {
      processDigit(newKeyValue);
    } else {
      if (isOperator) {
        processOperator(newKeyValue);
      } else {
        processFunctionKey(newKeyValue);
      }
    }
  };

  return (
    <div className="calculator">
      <CalculatorDisplay value={state.displayValue} />

      <div className="calculator-keypad">
      <div className="input-keys">
            <div className="function-keys">
              <button
                id="key-clear"
                value="C"
                className="calculator-key key-clear"
                onClick={handleClick}
              >
                {state.clearAll ? "AC" : "C"}
              </button>
              <button
                id="key-sign"
                value="±"
                className="calculator-key key-sign"
                onClick={handleClick}
              >
                &plusmn;
              </button>
              <button
                id="key-percent"
                value="%"
                className="calculator-key key-percent"
                onClick={handleClick}
              >
                %
              </button>
            </div>

            <div className="digit-keys">
              <button
                id="key-0"
                value="0"
                className="calculator-key key-0"
                onClick={handleClick}
              >
                0
              </button>
              <button
                id="key-dot"
                value="."
                className="calculator-key key-dot"
                onClick={handleClick}
              >
                &middot;
              </button>
              <button
                id="key-1"
                value="1"
                className="calculator-key key-1"
                onClick={handleClick}
              >
                1
              </button>
              <button
                id="key-2"
                value="2"
                className="calculator-key key-2"
                onClick={handleClick}
              >
                2
              </button>
              <button
                id="key-3"
                value="3"
                className="calculator-key key-3"
                onClick={handleClick}
              >
                3
              </button>
              <button
                id="key-4"
                value="4"
                className="calculator-key key-4"
                onClick={handleClick}
              >
                4
              </button>
              <button
                id="key-5"
                value="5"
                className="calculator-key key-5"
                onClick={handleClick}
              >
                5
              </button>
              <button
                id="key-6"
                value="6"
                className="calculator-key key-6"
                onClick={handleClick}
              >
                6
              </button>
              <button
                id="key-7"
                value="7"
                className="calculator-key key-7"
                onClick={handleClick}
              >
                7
              </button>
              <button
                id="key-8"
                value="8"
                className="calculator-key key-8"
                onClick={handleClick}
              >
                8
              </button>
              <button
                id="key-9"
                value="9"
                className="calculator-key key-9"
                onClick={handleClick}
              >
                9
              </button>
            </div>
          </div>

          <div className="operator-keys">
            <button
              id="key-divide"
              value="/"
              className="calculator-key key-divide"
              onClick={handleClick}
            >
              &divide;
            </button>
            <button
              id="key-multiply"
              value="*"
              className="calculator-key key-multiply"
              onClick={handleClick}
            >
              &times;
            </button>
            <button
              id="key-subtract"
              value="-"
              className="calculator-key key-subtract"
              onClick={handleClick}
            >
              &ndash;
            </button>
            <button
              id="key-add"
              value="+"
              className="calculator-key key-add"
              onClick={handleClick}
            >
              +
            </button>
            <button
              id="key-equals"
              value="="
              className="calculator-key key-equals"
              onClick={handleClick}
            >
              =
            </button>
          </div>
      </div>
    </div>
  );
}

export default Calculator;
