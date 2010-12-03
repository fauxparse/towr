var NORTH = 1, EAST = 2, SOUTH = 4, WEST = 8;

var Map = new Class({
  initialize: function(element) {
    var self = this;
    this.element = element;
    this.element.instance = self;
    this.field = element.getElements('.field')[0];
    this.canvas = new Element('canvas')
      .inject(this.field)
      .addEvent('draw', function() {
        self.draw();
      });
    this.cellSize = this.field.getElements('.cell')[0].getSize().x;
    this.resizeTo(this.field.getChildren('.row').length, this.field.getChildren('.row')[0].getChildren('.cell').length);
    this.element.setStyles({ width: (this.columns * this.cellSize) + 'px' });
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
    this.canvas.fireEvent('draw');
  },
  draw: function() {
    var self = this;
    var w = this.columns * this.cellSize, h = this.rows * this.cellSize;
    this.canvas.set('width', w).set('height', h);
    var context = this.canvas.getContext('2d');
    var re = this.field.getChildren('.row');
    context.lineWidth = 16;
    context.strokeStyle = "#ccc";
    
    for (j = 0; j < self.rows; j++) {
      var ce = re[j].getChildren('.cell');
      for (i = 0; i < self.columns; i++) {
        var cell = ce[i];
        var x = i * self.cellSize, y = j * self.cellSize;
        $A(cell.classList).each(function(c) {
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
    this.toolbarContainer = new Element('div', {
      'class': 'toolbar-container'
    }).inject(this.element);
    this.toolbar = new Element('div', {
      'class': 'toolbar'
    }).inject(this.toolbarContainer);
  }
});

var Editor = new Class({
  Extends: Map,
  initialize: function(element) {
    var self = this;
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
    
    this.createToolbar();
    
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

    this.editing = false;
    this.startEditing();
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
    this.editing = true;
    this.element.addClass('editing');
    this.editorTools.getElements('.tool')[0].fireEvent('click');
  },
  stopEditing: function() {
    this.editing = false;
    this.element.removeClass('editing');
    if (this.selectedTool) { this.selectedTool.stopEditing(); }
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
          q = this._cellQuadrant(event.client.x - cp.x, event.client.y - cp.y);
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
            q = this._cellQuadrant(event.client.x - cp.x, event.client.y - cp.y);

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
      var isWest = (cell.x == 0),
          isEast = (cell.x == this.editor.columns - 1),
          isNorth = (cell.y == 0),
          isSouth = (cell.y == this.editor.rows - 1);

      if ((isWest || isEast || isNorth || isSouth) && !cell.hasClass('exit')) {
        cell.addClass('entry');
        if (isWest) cell.addClass('entry-' + WEST);
        if (isEast) cell.addClass('entry-' + EAST);
        if (isNorth) cell.addClass('entry-' + NORTH);
        if (isSouth) cell.addClass('entry-' + SOUTH);
        this.stopEditing();
      }
    }
  }),
  ExitPoint: new Class({
    Extends: Tool,
    Name: 'ExitPoint',
    Caption: 'OUT',
    mouseUp: function(event, cell) {
      var isWest = (cell.x == 0),
          isEast = (cell.x == this.editor.columns - 1),
          isNorth = (cell.y == 0),
          isSouth = (cell.y == this.editor.rows - 1);

      if ((isWest || isEast || isNorth || isSouth) && !cell.hasClass('entry')) {
        cell.addClass('exit');
        if (isWest) cell.addClass('exit-' + WEST);
        if (isEast) cell.addClass('exit-' + EAST);
        if (isNorth) cell.addClass('exit-' + NORTH);
        if (isSouth) cell.addClass('exit-' + SOUTH);
        this.stopEditing();
      }
    }
  })
}
