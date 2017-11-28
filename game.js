'use strict';

const EMPTY = 0;
const FRIENDLY = 1;
const DAMAGED = 2;
const DEAD = 3;
const MISS = 4;

const DIR_V = 'v';
const DIR_H = 'h';

const SHIP_CONFIG = [
  {size: 4},
  {size: 3},
  {size: 3}
  /*,
  {size: 2},
  {size: 2},
  {size: 2},
  {size: 1},
  {size: 1},
  {size: 1},
  {size: 1}*/
];


let selectedShipIndex = null;
let placedShips = [];


function selectClickHandler(tr) {
  return function(evt) {
    console.log(tr.attributes.getNamedItem('data-ship-size').value);
    document.querySelectorAll("tr.selected-line").forEach(function(el, id){
      el.classList.remove('selected-line');
    });


    if (placedShips.indexOf(tr.attributes.getNamedItem('data-ship-number').value) === -1) {
      tr.classList.add('selected-line');
      selectedShipIndex = tr.attributes.getNamedItem('data-ship-number').value;
    }
  };
}



function drawSelectShipBlock() {
  const selectBlock = document.getElementById('select-ship');
  const tb = document.createElement("table");
  for (let i = 0; i < SHIP_CONFIG.length; i++) {
    const tr = document.createElement("tr");
    const sizeAttr = document.createAttribute('data-ship-size');
    sizeAttr.value = SHIP_CONFIG[i].size;
    tr.attributes.setNamedItem(
      sizeAttr
    );
    const attrIndex = document.createAttribute('data-ship-number');
    attrIndex.value = i;
    tr.attributes.setNamedItem(
      attrIndex
    );

    tr.addEventListener('click', selectClickHandler(tr));

    for (let x = 0; x < SHIP_CONFIG[i].size; x++) {
      const td = document.createElement('td');
      td.classList.add('friendly');
      tr.appendChild(td);
    }
    tb.appendChild(tr);
  }
  selectBlock.appendChild(tb);
}

function numToAlph(n) {
  const alph = 'ABCDEFGHIJKLMOP';
  if (n < alph.length) {
    return alph[n];
  } else {
    return 'X';
  }
}


function Ship(size, dir) {
  this.size = size;
  this.dir = dir;
}


function Field(width, height) {
  this.width = width;
  this.height = height;

  this.field = [];
  this.shipList = [];

  for (let i = 0; i < width; i++) {
    this.field[i] = [];
    for (let j = 0; j < height; j++) {
      this.field[i][j] = 0;
    }
  }
}


Field.prototype.placeShip = function(ship, w, h) {
  if (ship.dir === DIR_H && ship.size + w > this.width) {
    return false;
  }

  if (ship.dir === DIR_V && ship.size + h > this.height) {
    return false;
  }

  for (let i = 0; i < ship.size; i++) {
    let dw = w;
    let dh = h;
    if (ship.dir === DIR_V) {
      dh += i;
    } else {
      dw += i;
    }

    if (this.field[dw][dh] !== EMPTY) {
      return false;
    }
  }


  this.shipList.push(ship);

  for (let i = 0; i < ship.size; i++) {
    let dw = w;
    let dh = h;
    if (ship.dir === DIR_V) {
      dh += i;
    } else {
      dw += i;
    }
    this.field[dw][dh] = FRIENDLY;

    if (dw - 1 >= 0 && this.field[dw - 1][dh] === EMPTY) {
      this.field[dw - 1][dh] = MISS;
    }
    if (dw - 1 >= 0 && dh - 1 >= 0&& this.field[dw - 1][dh - 1] === EMPTY) {
      this.field[dw - 1][dh - 1] = MISS;
    }
    if (dw + 1 < this.width && dh - 1 >= 0&& this.field[dw + 1][dh - 1] === EMPTY) {
      this.field[dw + 1][dh - 1] = MISS;
    }

    if (dw + 1 < this.width && this.field[dw + 1][dh] === EMPTY) {
      this.field[dw + 1][dh] = MISS;
    }
    if (dh - 1 >= 0 && this.field[dw][dh - 1] === EMPTY) {
      this.field[dw][dh - 1] = MISS;
    }
    if (dh + 1 < this.height && this.field[dw][dh + 1] === EMPTY) {
      this.field[dw][dh + 1] = MISS;
    }
    if (dh + 1 < this.height && dw - 1 >= 0 && this.field[dw - 1][dh + 1] === EMPTY) {
      this.field[dw - 1][dh + 1] = MISS;
    }
    if (dh + 1 < this.height && dw + 1 < this.width && this.field[dw + 1][dh + 1] === EMPTY) {
      this.field[dw + 1][dh + 1] = MISS;
    }


  }


  return true;
};


Field.prototype.placeShipsRandom = function(config) {
  let copyConfig = config.slice();
  copyConfig.forEach((shipConfig) => {
    let i = 100;
  let place = false;
  do {
    const ship = new Ship(
      shipConfig.size,
      (Math.random() > 0.5 ? DIR_H : DIR_V )
    );

    const rw = Math.floor(Math.random() * this.width);
    const rh = Math.floor(Math.random() * this.height);

    place = this.placeShip(ship, rw, rh);
    i--;
  } while (!place && i > 0);

  if (i <=0 ) {
    alert("Fail to place");
  }

});


};




function clickFieldHandler(field) {
  return function(evt) {
    if (evt.target.tagName === 'TD') {
      const w = parseInt(evt.target.attributes.getNamedItem('data-w').value, 10);
      const h = parseInt(evt.target.attributes.getNamedItem('data-h').value, 10);

      if (field.game.playerField === null) {

        if (selectedShipIndex !== null) {
          const ship = new Ship(SHIP_CONFIG[selectedShipIndex].size, DIR_H);
          if (field.placeShip(ship, w, h)) {
            placedShips.push(selectedShipIndex);
            const selectedShipTR = document.querySelector(["tr[data-ship-number=\"", selectedShipIndex, "\"]"].join(''));
            selectedShipTR.remove();
            selectedShipIndex = null;
          }

          if (placedShips.length === SHIP_CONFIG.length) {
            field.game.startGame(field);
          }

          field.reDraw();
        }
      } else {
        field.game.fire(w, h);
        evt.cancelBubble();
      }
    }
  }
}


function startGame(field)
{
  for (let i = 0; i < field.width; i++) {
    for (let j = 0; j < field.height; j++) {
      if (field.field[i][j] == MISS) {
        field.field[i][j] = EMPTY;
      }
    }
  }
}

Field.prototype.reDraw = function(showAllShips) {
  this.draw(this.lastDrawNode, showAllShips);
};


Field.prototype.draw = function(element, showAllShips = true) {
  this.lastDrawNode = element;
  const table = document.createElement("table");

  const headTr = document.createElement("tr");
  table.appendChild(headTr);
  for (let i = 0; i <= this.width; i++) {
    const td = document.createElement("td");
    headTr.appendChild(td);
    if (i > 0) {
      td.appendChild(
        document.createTextNode(i)
      );
    }
  }

  for (let h = 0; h < this.height; h++) {
    const tr = document.createElement("tr");
    table.appendChild(tr);
    table.addEventListener('click', clickFieldHandler(this));
    for (let w = 0; w <= this.width;w++) {
      const td = document.createElement("td");
      tr.appendChild(td);
      if (w == 0) {
        td.appendChild(
          document.createTextNode(numToAlph(h))
        );
      } else {
        td.appendChild(
          document.createTextNode(this.field[w - 1][h])
        );
        const attrW = document.createAttribute('data-w');
        attrW.value = w - 1;
        td.attributes.setNamedItem(attrW);
        const attrH = document.createAttribute('data-h');
        attrH.value = h;
        td.attributes.setNamedItem(attrH);
        switch (this.field[w - 1][h]) {
          case EMPTY:
            break;
          case FRIENDLY:
            if (showAllShips) {
              td.classList.add('friendly');
            }
            break;
          case DAMAGED:
            td.classList.add('damaged');
            break;
          case DEAD:
            td.classList.add('dead');
            break;
          case MISS:
            td.classList.add('miss');
            break;
        }
      }
    }
  }




  element.innerHTML = '';
  element.appendChild(table);
};


function Game(field1, field2) {
  field1.game = this;
  field2.game = this;

  this.fields = [field1, field2];

  this.currentPlayerTurn = true;


  this.playerField = null;
  this.computerField = null;
}

Game.prototype.fire = function(x, y) {
  const targetField = this.currentPlayerTurn ? this.computerField : this.playerField;
  switch (targetField.field[x][y]) {
    case EMPTY:
      targetField.field[x][y] = MISS;
      this.currentPlayerTurn = !this.currentPlayerTurn;
      break;
    case FRIENDLY:
      targetField.field[x][y] = DAMAGED;
      break;
    case MISS:
    case DAMAGED:
    case DEAD:
      break;
  }

  this.reDrawFields();
};

Game.prototype.startGame = function(playerField) {
  this.playerField = playerField;
  for (let i = 0; i < this.playerField.width; i++) {
    for (let j = 0; j < this.playerField.height; j++) {
      if (this.playerField.field[i][j] === MISS) {
        this.playerField.field[i][j] = EMPTY;
      }
    }
  }

  let fields = this.fields.slice();

  fields.splice(fields.indexOf(this.playerField), 1);
  this.computerField = fields[0];
  this.computerField.placeShipsRandom(SHIP_CONFIG);

  for (let i = 0; i < this.computerField.width; i++) {
    for (let j = 0; j < this.computerField.height; j++) {
      if (this.computerField.field[i][j] === MISS) {
        this.computerField.field[i][j] = EMPTY;
      }
    }
  }

  this.reDrawFields();


};

Game.prototype.reDrawFields = function() {
  this.playerField.reDraw(true);
  this.computerField.reDraw(false);
};

