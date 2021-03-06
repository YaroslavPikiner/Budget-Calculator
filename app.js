const buggetController = (function () {
  const Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.presentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalInc) {
    if (totalInc > 0) {
      this.presentage = Math.round((this.value / totalInc) * 100);
    } else {
      this.presentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.presentage;
  };

  const Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const calculateTotal = function (type) {
    let sum = 0;
    data.allItems[type].forEach((cur) => {
      sum += +cur.value;
    });
    data.totals[type] = sum;
  };

  let data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    presentage: -1,
  };

  return {
    addItem: (type, des, val) => {
      let newItem, ID;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: (type, id) => {
      const ids = data.allItems[type].map(function (current) {
        return current.id;
      });
      let index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: () => {
      // calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

      // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 * 100
    },

    calculatePercentage: () => {
      data.allItems.exp.forEach((curr) => {
        curr.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: () => {
      const allPerc = data.allItems.exp.map((curr) => {
        return curr.getPercentage();
      });
      return allPerc;
    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: () => {
      console.log(data);
    },
  };
})();

const uiController = (() => {
  const domStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgedLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    titleMonth: ".budget__title--month",
  };

  return {
    getInput: () => {
      return {
        type: document.querySelector(domStrings.inputType).value,
        description: document.querySelector(domStrings.inputDescription).value,
        value: document.querySelector(domStrings.inputValue).value,
      };
    },

    addListItem: (obj, type) => {
      var html, newHtml, element;
      // Create HTML string with placeholder text

      if (type === "inc") {
        element = domStrings.incomeContainer;

        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = domStrings.expensesContainer;

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%per%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);
      newHtml = newHtml.replace("%per%", obj.presentage);

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: (selectorID) => {
      const el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: () => {
      let fields, fieldsArr;

      fields = document.querySelectorAll(
        domStrings.inputDescription + ", " + domStrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach((curr, idx, arr) => {
        curr.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: (obj) => {
      document.querySelector(
        domStrings.budgedLabel
      ).textContent = obj.budget.toFixed(2);
      document.querySelector(domStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(domStrings.expenseLabel).textContent =
        obj.totalExp;

      document.querySelector(domStrings.percentageLabel).textContent =
        obj.percentage + "%";
    },

    displayMonth: () => {
      const now = new Date();
      const year = now.getFullYear();
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "November",
        "December",
      ];
      const month = now.getMonth();

      document.querySelector(
        domStrings.titleMonth
      ).textContent = `${months[month]} ${year}`;
    },

    getDomStrings: () => {
      return domStrings;
    },
  };
})();

const controller = ((bugCtrl, UiCtrl) => {
  let setupEventListener = () => {
    const DOM = UiCtrl.getDomStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", addCtrl);
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
    document.addEventListener("keypress", (event) => {
      if (event.keyCode === 13 || event.which === 13) {
        addCtrl();
        uiController.clearFields();
      }
    });
  };

  const updateBudget = () => {
    bugCtrl.calculateBudget();

    let budget = bugCtrl.getBudget();

    UiCtrl.displayBudget(budget);
  };

  const updatePercentages = () => {
    bugCtrl.calculatePercentage();
    let prec = bugCtrl.getPercentages();
    console.log(prec);
  };

  const addCtrl =  () => {
    var input, newItem;

    // 1. Get the field input data
    input = UiCtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = bugCtrl.addItem(input.type, input.description, input.value);

      UiCtrl.addListItem(newItem, input.type);
      UiCtrl.clearFields();
      updateBudget();
      updatePercentages();
    }
  };

  const ctrlDeleteItem = (event) => {
    let itemId, splitID, type, ID;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemId) {
      splitID = itemId.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);
      bugCtrl.deleteItem(type, ID);
      UiCtrl.deleteListItem(itemId);
      updateBudget();
    }
  };

  return {
    init: () => {
      console.log("Aplication has been startet");
      UiCtrl.displayMonth();
      UiCtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListener();
    },
  };
})(buggetController, uiController);

controller.init();
