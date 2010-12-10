String.implement({
  times: function(n) {
    var s = this;
    for (i = n - 1; i > 0; i--) { s += this; }
    return s;
  }
});

var Map = new Class({
  initialize: function(element) {
    var self = this;
    this.element = element;
    this.element.instance = self;
    this.field = element.getElements('.field')[0]
      .addEvents({
        mousemove: function(event) {
          var xy = self.field.getPosition();
          var x = event.page.x - xy.x, y = event.page.y - xy.y;
          self.towers.each(function(tower) { tower.aimAt(x, y) });
          return true;
        },
        mousedown: function() { this.instance.blur(); }
      });
    this.field.instance = self;
    this.canvas = new Element('canvas')
      .inject(this.field)
      .addEvent('draw', function() {
        self.draw();
      });
    this.towerCanvas = new Element('canvas').inject(this.field);
    this.cellSize = this.field.getElements('.cell')[0].getSize().x;
    this.resizeTo(this.field.getChildren('.row').length, this.field.getChildren('.row')[0].getChildren('.cell').length);
    this.element.setStyles({ width: (this.columns * this.cellSize) + 'px' });
    
    this.towers = [];
    this.life = 1000;
    
    this.createToolbar();
  },
  resizeTo: function(rows, columns) {
    var self = this;
    this.rows = rows;
    this.columns = columns;
    
    for (i = self.field.getElements('.row').length; i < self.rows; i++) {
      new Element('div', { 'class':'row' }).inject(self.field);
    }
    var re = self.field.getElements('.row');
    re.each(function(row, j) {
      var l = row.getElements('.cell').length;
      for (i = l; i < self.columns; i++) {
        new Element('div', { 'class':'cell' }).inject(row);
      }
      var ce = row.getElements('.cell');
      for (i = 0; i < ce.length; i++) {
        ce[i].x = i;
        ce[i].y = j;
        i < self.columns ? ce[i].show() : ce[i].hide();
      }
    });
    for (j = 0; j < re.length; j++) {
      j < self.rows ? re[j].show() : re[j].hide();
    }
    var w = this.columns * this.cellSize, h = this.rows * this.cellSize;
    this.element.getElements('canvas').each(function(canvas) { canvas.set('width', w).set('height', h); });
    this.canvas.fireEvent('draw');
  },
  draw: function() {
    var self = this;
    var w = this.columns * this.cellSize, h = this.rows * this.cellSize;
    this.canvas.set('width', w).set('height', h);
    var context = this.canvas.getContext('2d');
    context.lineWidth = 14;
    context.strokeStyle = "#999";
    this.traceRoute(context);
    context.lineWidth = 12;
    context.strokeStyle = "#ccc";
    this.traceRoute(context);
  },
  traceRoute: function(context) {
    var self = this;
    var re = this.field.getChildren('.row');
    for (j = 0; j < self.rows; j++) {
      var ce = re[j].getChildren('.cell');
      for (i = 0; i < self.columns; i++) {
        var cell = ce[i];
        var x = i * self.cellSize, y = j * self.cellSize;
        (cell.get('class').split(' ')).each(function(c) {
          if (t = /route-(\d+)/.exec(c)) {
            switch (parseInt(t[1])) {
              case 5:
                context.moveTo(x + self.cellSize / 2, y);
                context.lineTo(x + self.cellSize / 2, y + self.cellSize);
                context.stroke();
                break;
              case 10:
                context.moveTo(x, y + self.cellSize / 2);
                context.lineTo(x + self.cellSize, y + self.cellSize / 2);
                context.stroke();
                break;
              case 3:
                context.moveTo(x + self.cellSize / 2, y);
                context.arc(x + self.cellSize, y, self.cellSize / 2, Math.PI, Math.PI / 2, true);
                context.stroke();
                break;
              case 6:
                context.moveTo(x + self.cellSize, y + self.cellSize / 2);
                context.arc(x + self.cellSize, y + self.cellSize, self.cellSize / 2, Math.PI * 1.5, Math.PI, true);
                context.stroke();
                break;
              case 9:
                context.moveTo(x, y + self.cellSize / 2);
                context.arc(x, y, self.cellSize / 2, Math.PI / 2, 0, true);
                context.stroke();
                break;
              case 12:
                context.moveTo(x + self.cellSize / 2, y + self.cellSize);
                context.arc(x, y + self.cellSize, self.cellSize / 2, 0, Math.PI * 1.5, true);
                context.stroke();
                break;
            }
          }
        });
      }
    }
  },
  createToolbar: function() {
    var self = this;
    
    this.toolbarContainer = new Element('div', {
      'class': 'toolbar-container'
    }).inject(this.element);
    this.toolbar = new Element('div', {
      'class': 'toolbar'
    }).inject(this.toolbarContainer);
    
    this.lifeBar = new Element('div', {
      'class': 'life'
    }).inject(this.toolbar);
    
    this.towerPalette = new Element('div', {
      'class': 'towers'
    }).inject(this.toolbar);
    
    for (towerType in Towers) {
      tool = new Element('div', { 'class': 'tool' }).inject(this.towerPalette);
      tower = new Element('div', {
        'class': 'tower ' + towerType,
        html: Tower.html,
        title: towerType.replace(/([A-Z])/g, ' $1').replace(/^ /, '')
      }).inject(tool);
      
      tower.dragginess = new Drag.Move(tower, {
        precalculate: true, // TODO: fix for editable maps
        includeMargins: false,
        droppables: this.element.getElements('.cell'),
        onStart: function() {
          self.blur();
        },
        onEnter: function(tower, cell) {
          klass = tower.get('class').split(' ').filter(function(c) { return Towers[c]; })[0];
          var t = new (Towers[klass])();
          self.towerCanvas.drawRangeCircle(cell, t.options.range);
          cell.addClass(self.canPlace(tower, cell) ? 'good' : 'bad');
        },
        onLeave: function(tower, cell) {
          self.towerCanvas.clear();
          cell.removeClass('good').removeClass('bad');
        },
        onDrop: function(tower, cell) {
          self.towerCanvas.clear();
          if (cell) {
            cell.removeClass('good').removeClass('bad');
            if (self.canPlace(tower, cell)) {
              klass = tower.get('class').split(' ').filter(function(c) { return Towers[c]; })[0];
              new (Towers[klass])(self, cell).element;
            }
          }
          tower.setStyles({ left:0, top:0, opacity:0 }).morph({ opacity:[0.0, 1.0] });
        }
    	});
    }
    
    this.towerCanvas.drawRangeCircle = function(cell, range) {
      var context = this.getContext('2d');
      context.fillStyle = 'rgba(0, 0, 0, 0.1)';
      context.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      context.beginPath();
      context.lineWidth = 1;
      context.arc((cell.x * 2 + 1) * self.cellSize / 2, (cell.y * 2 + 1) * self.cellSize / 2, range, 0, Math.PI * 2);
      context.closePath();
      context.fill();
      context.stroke();
    }
    
    this.towerCanvas.clear = function() {
      var w = self.columns * self.cellSize, h = self.rows * self.cellSize;
      this.set('width', w).set('height', h);
    }
  },
  serialize: function() {
    var self = this;
    var codes = { route:0, entry:ENTRY, exit:EXIT };
    return self.field.getElements('.row').slice(0, self.rows).map(function(row, j) {
      var cells = [];
      row.getElements('.cell').slice(0, self.columns).each(function(cell, i) {
        var values = [];
        $A(cell.classList).each(function(c) {
          if (m = /(route|entry|exit)-([0-9]+)/.exec(c)) {
            values.push((codes[m[1]] + parseInt(m[2])).toString(16));
          }
        });
        if (values.length > 0) {
          cells.push(i + ':' + values.join('+'));
        }
      });
      return cells.join(',');
    }).join('|');
    return result;
  },
  canPlace: function(object, cell) {
    return cell.getChildren().length == 0 && cell.get('class').trim() == 'cell';
  },
  blur: function() {
    this.field.getElements('.tower:focus').each(function(t) { t.blur() });
  }
});

var Tower = new Class({
  Implements: Options,
  Name: 'Tower',
  options: {
    range: 48,
    damage: 10,
    shotPower: 100,
    chargeRate: 20
  },
  initialize: function(map, cell, options) {
    var self = this;
    self.setOptions(options);
    if (map && cell) {
      self.map = map;
      self.cell = cell;
      self.element = new Element('div', {
        html: Tower.html,
        class: 'tower ' + self.Name,
        tabindex: -1
      }).inject(cell);
      self.element.instance = self;
      self.base = self.element.getElements('.base')[0];
      self.turret = self.element.getElements('.turret')[0];
      self.map.towers.push(self);
      self.x = (cell.x * 2 + 1) * self.map.cellSize / 2;
      self.y = (cell.y * 2 + 1) * self.map.cellSize / 2;
      self.level = 1;
      new Element('div', { 'class':'effect' }).inject(this.turret);
      
      self.controls = new Element('div', {
        'class': 'controls',
        html: '<a href="#" class="upgrade">★</a><a href="#" class="sell">$</a>'
      }).inject(self.element);
      self.controls.getChildren('a.upgrade').addEvents({
        mousedown: function() { self.upgrade(); return false; },
        click: function() { return false; }
      });
      self.controls.getChildren('a.sell').addEvents({
        mousedown: function() { self.sell(); return false; },
        click: function() { return false; }
      });
      
      self.element.addEvents({
        mousedown: function(event) { this.focus(); event.stop(); },
        focus: self.focus,
        blur: self.blur
      });
      
      self.pips = new Element('div', { 'class':'pips' }).inject(self.element);
      self.updateView();
    }
  },
  powerUp: function() { return Math.pow(1.1, this.level - 1); },
  range: function() { return this.options.range * this.powerUp(); },
  updateView: function() {
    this.pips.set('html', '★'.times(this.level));
  },
  aimAt: function(x, y) {
    var dy = this.y - y,
        dx = this.x - x,
        theta = Math.atan2(dy, dx) - Math.PI/2;
    
    this.turret.setStyles({
      '-webkit-transform': 'rotate(' + theta + 'rad)',
      '-moz-transform': 'rotate(' + theta + 'rad)'
    });
  },
  focus: function(event) {
    var self = this.instance;
    self.map.towerCanvas.drawRangeCircle(self.cell, self.range());
  },
  blur: function(event) {
    this.instance.map.towerCanvas.clear();
  },
  upgrade: function() {
    if (this.level < 5) {
      this.level++;
      this.updateView();
      if (this.level >= 5) { this.controls.getChildren('.upgrade').tween('opacity', 1.0, 0.5); }
      this.map.towerCanvas.clear();
      this.map.towerCanvas.drawRangeCircle(this.cell, this.range());
      this.element.focus();
    }
  },
  sell: function() {
    // TODO: refund money
    this.element.fireEvent('blur').destroy();
    this.map.towers.erase(this);
  }
});

Tower.html = '<div class="base"></div><div class="turret"></div>';

var Towers = {
  RifleTower: new Class({
    Extends: Tower,
    Name: 'RifleTower',
  }),
  LaserTower: new Class({
    Extends: Tower,
    Name: 'LaserTower',
    aimAt: function(x, y) {}
  }),
  IceTower: new Class({
    Extends: Tower,
    Name: 'IceTower',
  }),
  GrenadeTower: new Class({
    Extends: Tower,
    Name: 'GrenadeTower',
  })
};

var Editor = new Class({
  Extends: Map,
  initialize: function(element) {
    var self = this;
    self.form = element.getParent('form');
    this.parent(element);
    
    this.resizeHandle = new Element('div', { 'class':'resize' })
      .inject(this.element);
    this.element.makeResizable({
      grid: 32,
      handle: this.resizeHandle,
      limit: { x:[this.cellSize * 5, this.cellSize * 32], y:[this.cellSize * 5, this.cellSize * 32] },
      onDrag: function(element, event) {
        var size = element.getComputedSize();
        self.resizeTo(Math.floor(size.height / self.cellSize), Math.floor(size.width / self.cellSize));
      }
    });
    this.element.retrieve('resizer').detach();
    
    this.drawing = false;
    this.field.addEvent('mousedown:relay(.cell)', function(event, cell) {
      event.preventDefault();
      if (self.selectedTool) self.selectedTool.mouseDown(event, cell);
    }).addEvent('mousemove:relay(.cell)', function(event, cell) {
      if (self.selectedTool) self.selectedTool.mouseMove(event, cell);
    }).addEvent('mouseup:relay(.cell)', function(event, cell) {
      if (self.selectedTool) self.selectedTool.mouseUp(event, cell);
    }).addEvent('click:relay(.cell)', function(event, cell) {
      if (self.selectedTool) self.selectedTool.click(event, cell);
    }).addEvent('mouseLeave', function(event) {
      if (self.selectedTool) self.selectedTool.mouseLeave();
    });

    new Element('a', { href:'#', 'class':'editor-switch on', html:'Edit' }).inject(this.element)
    .addEvent('click', function() { self.startEditing(); return false; });
    new Element('a', { href:'#', 'class':'editor-switch off', html:'Done' }).inject(this.element)
    .addEvent('click', function() { self.stopEditing(); return false; });

    self.editing = false;
  },
  resizeTo: function(rows, columns) {
    this.parent(rows, columns);
    this.form.getElement('#map_rows').set('value', this.rows);
    this.form.getElement('#map_columns').set('value', this.columns);
  },
  createToolbar: function() {
    this.parent();
    this.editorTools = new Element('div', {
      'class': 'editor-tools toolbar'
    }).inject(this.toolbarContainer);
    for (i in Editor.Tools) {
      new (Editor.Tools[i])(this);
    }
  },
  startEditing: function() {
    this.element.retrieve('resizer').attach();
    this.editing = true;
    this.element.addClass('editing');
    this.editorTools.getElements('.tool')[0].fireEvent('click');
  },
  stopEditing: function() {
    this.element.retrieve('resizer').detach();
    this.editing = false;
    this.element.removeClass('editing');
    if (this.selectedTool) { this.selectedTool.stopEditing(); }
    this.form.getElement('#map_contents').set('value', this.serialize());
    if (this.form.get('data-remote') == 'true') {
      this.form.fireEvent('submit');
    } else {
      this.form.submit()
    }
  }
});

var Tool = new Class({
  initialize: function(editor) {
    var self = this;
    this.editor = editor;
    this.button = new Element('div', {
      'class':'tool ' + this.Name,
      html:this.Caption,
      title:this.Name
    }).inject(this.editor.editorTools)
    .addEvent('click', function() {
      if (!(this.hasClass('active'))) {
        if (self.editor.selectedTool) {
          self.editor.selectedTool.stopEditing();
        }
        self.startEditing();
      }
    });
  },
  startEditing: function() {
    this.button.addClass('selected');
    this.editor.selectedTool = this;
    return this;
  },
  stopEditing: function() {
    this.button.removeClass('selected');
    this.editor.selectedTool = false;
    return this;
  },
  startDrawing: function() {
    this.drawing = $A(arguments);
  },
  stopDrawing: function() {
    this.drawing = false;
  },
  mouseDown: function(event, cell) {
    if (!this.drawing) { this.startDrawing(); }
  },
  mouseUp: function(event, cell) {
    if (this.drawing) { this.stopDrawing(); }
  },
  mouseMove: function(event, cell) {},
  click: function(event, cell) {},
  mouseLeave: function(event) {
    if (this.drawing) { this.stopDrawing(); }
  },
  _cellQuadrant: function(x, y) {
    var r = this.editor.cellSize / 3;
    var dx = x - this.editor.cellSize / 2, dl = x, dr = this.editor.cellSize - x;
    var dy = y - this.editor.cellSize / 2, dt = y, db = this.editor.cellSize - y;
    if (Math.sqrt(dx * dx + dt * dt) < r) { return NORTH; }
    if (Math.sqrt(dx * dx + db * db) < r) { return SOUTH; }
    if (Math.sqrt(dy * dy + dl * dl) < r) { return WEST; }
    if (Math.sqrt(dy * dy + dr * dr) < r) { return EAST; }
    return false;
  }
});

Editor.Tools = {
  Draw: new Class({
    Extends: Tool,
    Name: 'Draw',
    Caption: '✎',
    mouseDown: function(event, cell) {
      var cp = cell.getPosition(),
          q = this._cellQuadrant(event.page.x - cp.x, event.page.y - cp.y);
      if (q) {
        var x = cell.x * 2 + ((q == NORTH || q == SOUTH) ? 1 : 0) + (q == EAST ? 2 : 0),
            y = cell.y * 2 + ((q == WEST || q == EAST) ? 1 : 0) + (q == SOUTH ? 2 : 0);
        this.startDrawing([x, y]);
      } else {
        this.startDrawing();
      }
    },
    mouseMove: function(event, cell) {
      if (this.drawing) {
        var cp = cell.getPosition(),
            q = this._cellQuadrant(event.page.x - cp.x, event.page.y - cp.y);

        if (q) {
          var x = cell.x * 2 + ((q == NORTH || q == SOUTH) ? 1 : 0) + (q == EAST ? 2 : 0),
              y = cell.y * 2 + ((q == WEST || q == EAST) ? 1 : 0) + (q == SOUTH ? 2 : 0),
              p = [ x, y ],
              l = this.drawing.getLast();
          if (!l || p[0] != l[0] || p[1] != l[1]) {
            this.drawing.push(p);
            
            if (this.drawing.length > 1) {
              var first = this.drawing.shift();
              var second = this.drawing[0];
              var x1 = first[0], y1 = first[1], x2 = second[0], y2 = second[1];
              var dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
              if ((dx <= 2 && dy <= 2) && !(((x1 == x2) && (y1 % 2)) || ((y1 == y2) && (x1 % 2)))) {
                var cx = Math.floor((x1 + x2) / 4), cy = Math.floor((y1 + y2) / 4);
                var cx1 = x1 - (cx * 2), cy1 = y1 - (cy * 2),
                    cx2 = x2 - (cx * 2), cy2 = y2 - (cy * 2);
                var p1 = cx1 == 1 ? (cy1 ? SOUTH : NORTH) : (cx1 ? EAST : WEST);
                var p2 = cx2 == 1 ? (cy2 ? SOUTH : NORTH) : (cx2 ? EAST : WEST);

                this.editor.field.getElements('.row:nth-child(' + (cy + 1) + ')')[0].getElements('.cell:nth-child(' + (cx + 1) + ')')
                  .addClass('route-' + (p1 + p2));
                this.editor.draw();
              } else {
                this.drawing.shift();
                this.drawing.unshift(first);
              }
            }
          }
        }
      }
    }
  }),
  Erase: new Class({
    Extends: Tool,
    Name: 'Erase',
    Caption: '✄',
    mouseMove: function(event, cell) {
      if (this.drawing) {
        cell.set({ 'class':'cell', html:'' });
        this.editor.draw();
      }
    },
    mouseDown: function(event, cell) {
      this.parent(event, cell);
      this.mouseMove(event, cell);
    }
  }),
  EntryPoint: new Class({
    Extends: Tool,
    Name: 'EntryPoint',
    Caption: 'IN',
    mouseUp: function(event, cell) {
      var cp = cell.getPosition(),
          q = this._cellQuadrant(event.page.x - cp.x, event.page.y - cp.y),
          isWest = (cell.x == 0),
          isEast = (cell.x == this.editor.columns - 1),
          isNorth = (cell.y == 0),
          isSouth = (cell.y == this.editor.rows - 1);

      if ((q == NORTH) && isNorth) {
        cell.removeClass('exit-' + NORTH).addClass('entry-' + NORTH);
      } else if ((q == EAST) && isEast) {
        cell.removeClass('exit-' + EAST).addClass('entry-' + EAST);
      } else if ((q == SOUTH) && isSouth) {
        cell.removeClass('exit-' + SOUTH).addClass('entry-' + SOUTH);
      } else if ((q == WEST) && isWest) {
        cell.removeClass('exit-' + WEST).addClass('entry-' + WEST);
      }
    }
  }),
  ExitPoint: new Class({
    Extends: Tool,
    Name: 'ExitPoint',
    Caption: 'OUT',
    mouseUp: function(event, cell) {
      var cp = cell.getPosition(),
          q = this._cellQuadrant(event.page.x - cp.x, event.page.y - cp.y),
          isWest = (cell.x == 0),
          isEast = (cell.x == this.editor.columns - 1),
          isNorth = (cell.y == 0),
          isSouth = (cell.y == this.editor.rows - 1);

      if ((q == NORTH) && isNorth) {
        cell.removeClass('entry-' + NORTH).addClass('exit-' + NORTH);
      } else if ((q == EAST) && isEast) {
        cell.removeClass('entry-' + EAST).addClass('exit-' + EAST);
      } else if ((q == SOUTH) && isSouth) {
        cell.removeClass('entry-' + SOUTH).addClass('exit-' + SOUTH);
      } else if ((q == WEST) && isWest) {
        cell.removeClass('entry-' + WEST).addClass('exit-' + WEST);
      }
    }
  })
}
