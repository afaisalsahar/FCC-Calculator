var model = {
    init: function() {this.createEmptyArray();},
    createEmptyArray: function() {this.data = [];},
    pushArrayItems: function(data) {this.data.push(data);}
};

var controller = {
    init: function() {
        this.onlyMathOperations = false;
        var self = this;
        model.init();

        document.querySelector("#buttons").addEventListener("click", function(e) {
            var button = e.target, dataT, dataV;

            if(button.nodeName.toLowerCase() == "a") {
                dataT = button.getAttribute('data-type');
                dataV = (dataT == "n" || dataT == "o") ? button.getAttribute("data-value") : false;

                switch (dataT) {
                    case 'c': self.clearScreen(); break;
                    case 'n': self.number(dataV); break;
                    case 'o': self.mathOperation(dataV); break;
                    case 'd': self.decimal(); break;
                    case 'r': self.showResult(); break;
                    default:
                        console.log("Couldn't perform the action!");
                        break;
                }
            }

            e.cancelBubble = true;
            e.preventDefault = true;
        });

        view.init();
    },

    getData: function() {return model.data;},

    checkScreenLimit: function() {
        var equation = document.querySelector("#equation"), result = document.querySelector("#result");
        if(equation.innerHTML.length >= 26 || result.innerHTML.length >= 13) {
            model.createEmptyArray();
            view.renderOnScreen(false, false, true);
            this.onlyMathOperations = false;
            return true;
        }
        return false;
    },

    checkMathOperations: function(userdata) {
        // 42 = 0, 43 = +, 45 = -, 47 = /
        var lastArrayItem = this.getData();
        var data = userdata ? String(userdata) : String(lastArrayItem[lastArrayItem.length-1]);
        var operation = data.charCodeAt(0);
        if(operation == 42 || operation == 43 || operation == 45 || operation == 47) {
            return true;
        }
        return false;
    },

    number: function(num) {
        if(this.onlyMathOperations || this.checkScreenLimit()) return;

        var data = this.getData(), dataL = data.length;
        if (num == "0" && dataL == 0) return;

        if (dataL == 0 || this.checkMathOperations()) {
            model.pushArrayItems(num);
        } else {
            data[dataL-1] += num;
        }

        view.renderOnScreen(false, false, false);
    },

    mathOperation: function(operation) {
        if(this.checkScreenLimit()) return;

        var data = this.getData(), dataL = data.length;
        if (dataL == 0 || data[dataL-1].endsWith(".")) return;

        if (!this.checkMathOperations()) model.pushArrayItems(operation);
        if (this.onlyMathOperations) this.onlyMathOperations = false;
        view.renderOnScreen(false, false, false);
    },

    decimal: function() {
        if(this.onlyMathOperations || this.checkScreenLimit()) return;

        var data = this.getData(), dataL = data.length;

        if (dataL == 0) model.pushArrayItems("0.");
        if (dataL >= 1 && !~data[dataL-1].indexOf(".") && !this.checkMathOperations()) data[dataL-1] += ".";

        view.renderOnScreen(false, false, false);
    },

    showResult: function() {
        if(this.onlyMathOperations) return;

        if(!this.checkMathOperations()) {
             var result = view.renderOnScreen(true, false, false);
             if(!this.checkScreenLimit()) {
                 model.createEmptyArray();
                 model.pushArrayItems(result);
                 this.onlyMathOperations = true;
             }
        }
    },

    clearScreen: function() {
        model.createEmptyArray();
        view.renderOnScreen(false, true, false);
        this.onlyMathOperations = false;
    },
};

var view = {
    init: function() {
        this.equation = document.querySelector('#equation');
        this.result = document.querySelector("#result");
        this.renderOnScreen();
    },

    roundNumbers: function(val) {
        val = String(val).split('');
        if (!~val.indexOf('.')) return val.join('');

        var valIO = val.indexOf("."), valPD = val.slice(valIO +1, val.length);
        val = val.slice(0, valIO +1);

        var countPDZ = 0; while (valPD[countPDZ] < 1) {countPDZ++}
        valPD = valPD.join('').slice(0, countPDZ + 2);

        if (valPD[valPD.length-1] === '0') valPD = valPD.slice(0, -1);

        return val.join('') + valPD;
    },

    renderOnScreen: function(showResult, clearScreen, screenLimit) {
        if(clearScreen) this.equation.innerHTML = "0"; this.result.innerHTML = "0";
        if(screenLimit) {this.equation.innerHTML = "Digit limit";}

        var data = controller.getData(), dataL = data.length, equation, result;
        if(dataL >= 1) {
            equation = data.join("").replace(/\*/g, "x").replace(/\//g, "÷"),
            result = data[dataL-1].replace(/\*/g, "x").replace(/\//g, "÷");
            this.equation.innerHTML = equation; this.result.innerHTML = equation;
        }

        if(!showResult) {
            if(dataL >= 2) {
                this.equation.innerHTML = equation;
                this.result.innerHTML = result;
            }
        }
        if(showResult) {
            result = this.roundNumbers(eval(data.join("")));
            this.equation.innerHTML = equation;
            this.result.innerHTML = result;
        }
        return result;
    }
};

controller.init();
