var TICK = 75;

String.implement({
  times: function(n) {
    var s = this;
    for (i = n; i > 1; i--) { s += this; }
    return s;
  }
});

var Map = new Class({
  Implements: Options,
  options: {
    life: 1000
  },
  initialize: function(element, options) {
    var self = this;
    this.setOptions(options);
    this.element = element;
    this.element.instance = self;
    this.field = element.getElements('.field')[0]
      .addEvents({
        mousemove: function(event) {
          if (this.paused) {
            var xy = self.field.getPosition();
            var x = event.page.x - xy.x, y = event.page.y - xy.y;
            self.towers.each(function(tower) { tower.aimAt(x, y) });
          }
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
    this.creeps = [];
    this.waves = [];
    this.life = this.options.life;
    
    this.createToolbar();
  },
  start: function() {
    var self = this;
    if (!this.waves.length && !this.creeps.length) {
      new Wave(this).start();
    }
    this.paused = false;
    if (!self.ticker) {
      (function(){
        self.update();
        self.ticker = setTimeout(arguments.callee, TICK);
      })();
    }
    this.buttons.start.hide();
    this.buttons.pause.show();
  },
  pause: function() {
    this.paused = true;
    clearTimeout(this.ticker);
    this.ticker = false;
    this.buttons.start.show();
    this.buttons.pause.hide();
  },
  update: function() {
    this.waves.each(function(wave) { wave.update(); });
    this.towers.each(function(tower) { tower.update(); });
    this.creeps.each(function(creep) { creep.update(); });
    
    if (!this.creeps.length) {
      this.pause();
    }
  },
  waveFinished: function(wave) {
    this.waves.erase(wave);
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
    
    this.buttons = new Element('div', {
      'class': 'buttons'
    }).inject(this.toolbar);
    
    this.buttons.start = new Element('a', {
      'class': 'start button',
      html: '▶',
      href: '#'
    }).inject(this.buttons)
    this.buttons.start.addEvent('click', function() { self.start(); return false; });
    this.buttons.pause = new Element('a', {
      'class': 'pause button',
      html: '||',
      href: '#'
    }).inject(this.buttons).hide().addEvent('click', function() { self.pause(); return false; });
    
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
  },
  randomEntry: function() {
    var self = this;
    return [NORTH, EAST, SOUTH, WEST].map(function(direction) {
      return self.field.getElements('.entry-' + direction).map(function(cell) {
        return { cell: cell, point: direction };
      });
    }).flatten().getRandom();
  },
  route: function(cell, from) {
    return cell ? this.routes(cell).filter(function(r) { return (r & from) > 0; }).getRandom() : null;
  },
  routes: function(cell) {
    return cell.get('class').split(' ')
      .map(function(c) { return (d = /^route-(\d+)/.exec(c)) ? parseInt(d[1]) : null })
      .clean();
  },
  cell: function(x, y) {
    return (x < 0 || y < 0 || x >= this.columns || y >= this.rows) ? null :
      this.field.getElement('.row:nth-child(' + (y + 1) + ')').getElement('.cell:nth-child(' + (x + 1) + ')');
  },
  nextCell: function(cell, exit) {
    switch (exit) {
      case NORTH:
        return { cell: this.cell(cell.x, cell.y - 1), from: SOUTH };
      case EAST:
        return { cell: this.cell(cell.x + 1, cell.y), from: WEST };
      case SOUTH:
        return { cell: this.cell(cell.x, cell.y + 1), from: NORTH };
      case WEST:
        return { cell: this.cell(cell.x - 1, cell.y), from: EAST };
    }
  },
  depleteLife: function(amount) {
    this.life = Math.max(0, this.life - amount);

    this.field.shake('left', 2, 3);

    p = (this.life * 1.0) / this.options.life;
    r = Math.round(141 * p + 237 * (1 - p));
    g = Math.round(198 * p + 28 * (1 - p));
    b = Math.round(63 * p + 36 * (1 - p));
    this.lifeBar.setStyles({
      width: Math.round(p * 136) + 'px',
      'background-color': 'rgb(' + r + ',' + g + ',' + b + ')'
    });
  }
});

var Tower = new Class({
  Implements: Options,
  Name: 'Tower',
  options: {
    range: 48,
    damage: 10,
    shotPower: 100,
    chargeRate: 10
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
      self.chargeMeter = new Element('div', { 'class': 'charge' }).inject(self.element);
      self.base = self.element.getElement('.base');
      self.turret = self.element.getElement('.turret');
      self.map.towers.push(self);
      self.x = (cell.x * 2 + 1) * self.map.cellSize / 2;
      self.y = (cell.y * 2 + 1) * self.map.cellSize / 2;
      self.level = 1;
      self.effect = new Element('div', { 'class':'effect' }).inject(self.turret);
      
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
      
      self.charge = 0;
      self.charging = false;
      
      self.pips = new Element('div', { 'class':'pips' }).inject(self.element);
      self.updateView();
    }
  },
  powerUp: function() { return Math.pow(1.1, this.level - 1); },
  range: function() { return this.options.range * this.powerUp(); },
  damage: function() { return Math.round(this.options.damage * this.powerUp()); },
  shotPower: function() { return this.options.shotPower * this.powerUp(); },
  chargeRate: function() { return this.options.chargeRate * this.powerUp(); },
  update: function() {
    if (this.charge <= 0 || this.charge < this.options.shotPower) {
      this.charging = true;
      // this.target = false;
    }
    
    if (this.target) { this.aimAt(this.target.x, this.target.y); }
    
    if (this.charging) {
      this.charge = Math.min(100, this.charge + this.chargeRate());
      if (this.charge >= 100) {
        this.charging = false;
      }
    } else if (this.charge >= this.options.shotPower) {
      this.fireAt(this.getTarget());
    }
    this.updateView();
  },
  updateView: function() {
    this.pips.set('html', '★'.times(this.level));
    this.chargeMeter.setStyles({ width:this.charge * (this.map.cellSize - 8) / 100 });
  },
  getTarget: function() {
    if (this.target && (!this.map.creeps.contains(this.target) || this.rangeTo(this.target) > this.range())) {
      this.target = false;
      this.charging = true;
    }

    if (!this.target && !this.charging) {
      this.target = this.chooseTarget(this.creepsInRange());
    }
    return this.target;
  },
  rangeTo: function(creep) {
    dx = creep.x - this.x, dy = creep.y - this.y;
    return Math.sqrt(dx*dx+dy*dy);
  },
  creepsInRange: function() {
    creeps = [];
    var tower = this, range = this.range();
    this.map.creeps.each(function(creep) {
      if ((d = tower.rangeTo(creep)) < range) {
        creeps.push({ creep:creep, distance:d, health:creep.health });
      }
    });
    return creeps;
  },
  chooseTarget: function(creeps) {
    return creeps.length ? creeps[0].creep : false;
  },
  aimAt: function(x, y) {
    var dy = this.y - y,
        dx = this.x - x,
        theta = Math.atan2(dy, dx) - Math.PI/2,
        theta2 = theta + Math.PI * 2;
        
    if (Math.abs(theta2 - this.angle) < Math.abs(theta - this.angle)) {
      theta = theta2;
    }
    
    this.turret.setStyles({
      '-webkit-transform': 'rotate(' + theta + 'rad)',
      '-moz-transform': 'rotate(' + theta + 'rad)'
    });
    this.angle = theta;
  },
  fireAt: function(creep) {
    if (creep) {
      this.aimAt(creep.x, creep.y);
      this.hit(creep);
      this.charge -= this.shotPower();
      this.updateView();
    }
  },
  hit: function(creep) {
    if (!creep.hit(this.damage())) {
      this.target = false;
      this.charging = true;
    }
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
    fireAt: function(creep) {
      this.parent(creep);
      if (creep) {
        this.effect.set('morph', { duration: 100 })
          .morph({ opacity:[1.0, 0.0] });
      }
    }
  }),
  LaserTower: new Class({
    Extends: Tower,
    Name: 'LaserTower',
    options: {
      range: 48,
      damage: 1,
      shotPower: 2,
      chargeRate: 5
    },
    aimAt: function(x, y) {}
  }),
  IceTower: new Class({
    Extends: Tower,
    options: {
      range: 40,
      damage: 2,
      shotPower: 100,
      chargeRate: 5
    },
    Name: 'IceTower',
    hit: function(creep) {
      this.parent(creep);
      effects = creep.effects.filter(function(e) { return instanceOf(e, Effects.IceEffect) && e.tower == this; });
      if (effects.length > 0) {
        effects[0].createdAt = (new Date()).getTime();
      } else {
        new Effects.IceEffect(creep, this, { affect: (this.level / 10.0) + 0.5, duration: 3000 * this.powerUp() });
      }
      this.target = false;
    },
    chooseTarget: function(creeps) {
      var fastest = false, topSpeed = 0;
      creeps.each(function(creep) {
        speed = creep.creep.applyEffects('speed');
        if (speed > topSpeed) {
          fastest = creep.creep;
          topSpeed = speed;
        }
      });
      return fastest;
    }
  }),
  GrenadeTower: new Class({
    Extends: Tower,
    Name: 'GrenadeTower',
    options: {
      range: 100,
      damage: 10,
      shotPower: 100,
      chargeRate: 5,
      splash: 40
    },
    fireAt: function(creep) {
      if (creep) {
        this.aimAt(creep.x, creep.y);
        this.effect.set('morph', { duration: 100 })
          .morph({ opacity:[1.0, 0.0] });
      }
      this.explode.delay(1000, this, [ creep.x, creep.y ]);
      this.charge -= this.shotPower();
      this.updateView();
    },
    splash: function() {
      return this.options.splash * this.powerUp();
    },
    explode: function(x, y) {
      var range = this.splash(), self = this;
      this.map.creeps.each(function(creep) {
        var dx = creep.x - x, dy = creep.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < range) {
          creep.hit(self.damage());
        }
      });
    }
  })
};

var Effect = new Class({
  Implements: Options,
  options: {
    duration: 1000.0,
    affect: 0.5
  },
  initialize: function(creep, tower, options) {
    this.creep = creep;
    this.setOptions(options || {});
    this.createdAt = (new Date()).getTime();
    creep.effects.push(this);
    this.overlay = new Element('div', {
      'class': 'overlay ' + this.Name
    }).inject(creep.element);
  },
  apply: function(property) {},
  stop: function() {
    this.creep.effects.erase(this);
    this.overlay.destroy();
  }
});

var Effects = {
  IceEffect: new Class({
    Extends: Effect,
    Name: 'IceEffect',
    apply: function(property) {
      this.parent(property);
      if (property == 'speed') {
        if ((t = (new Date()).getTime() - this.createdAt) < this.options.duration) {
          var v = t * t / (this.options.duration * this.options.duration);
          v = (v * this.options.affect) + 1 - this.options.affect;
          this.overlay.setStyles({ opacity: (1.0 - v) * 0.9 });
          return v;
        } else {
          this.stop();
          return 1.0;
        }
      } else {
        return 1.0;
      }
    }
  })
};

var Creep = new Class({
  Implements: Options,
  Name: 'Creep',
  options: {
    speed: 0.05,
    health: 100
  },
  initialize: function(map, options) {
    var self = this;
    this.setOptions(options);
    this.health = this.options.health;
    this.effects = [];
    this.enter(map);
  },
  enter: function(map) {
    var self = this;
    
    this.element = new Element('div', {
      'class': 'creep ' + this.Name,
    }).inject(map.field);
    this.element.instance = this;
    this.healthBar = new Element('small', { 'class':'heath', html:this.health }).inject(this.element)
    this.body = new Element('div', { 'class':'body' }).inject(this.element);
    
    this.map = map;
    var entry = this.map.randomEntry();
    this.cell = entry.cell;
    this.route = map.route(entry.cell, entry.point);
    this.distance = 0.0;
    this.from = entry.point;
    this.map.creeps.push(this);
    this.updatePosition();
  },
  update: function() {
    this.travel(this.speed());
  },
  updatePosition: function() {
    var s = this.map.cellSize,
        r = this.map.cellSize / 2,
        cx = this.cell.x * s,
        cy = this.cell.y * s;
    switch(this.route) {
    case 5:
      this.x = cx + r;
      this.y = cy + s * (this.from == NORTH ? this.distance : (1 - this.distance));
      this.angle = (this.from == NORTH) ? Math.PI / 2 : Math.PI * 3 / 2;
      break;
    case 10:
      this.x = cx + s * (this.from == WEST ? this.distance : (1 - this.distance));
      this.y = cy + r;
      this.angle = (this.from == WEST) ? 0 : Math.PI;
      break;
    case 3:
      theta = ((this.from == NORTH ? this.distance : (1.0 - this.distance)) + 2.0) * Math.PI / 2;
      this.x = cx + s + r * Math.cos(theta);
      this.y = cy - r * Math.sin(theta);
      this.angle = (this.from == NORTH ? Math.PI * 3 / 2 : Math.PI / 2) - theta;
      break;
    case 6:
      theta = ((this.from == EAST ? this.distance : (1.0 - this.distance)) + 1.0) * Math.PI / 2;
      this.x = cx + s + r * Math.cos(theta);
      this.y = cy + s - r * Math.sin(theta);
      this.angle = (this.from == EAST ? Math.PI * 3 / 2 : Math.PI / 2) - theta;
      break;
    case 12:
      theta = ((this.from == SOUTH ? this.distance : (1.0 - this.distance))) * Math.PI / 2;
      this.x = cx + r * Math.cos(theta);
      this.y = cy + s - r * Math.sin(theta);
      this.angle = (this.from == SOUTH ? Math.PI * 3 / 2 : Math.PI / 2) - theta;
      break;
    case 9:
      theta = ((this.from == WEST ? this.distance : (1.0 - this.distance)) + 3.0) * Math.PI / 2;
      this.x = cx + r * Math.cos(theta);
      this.y = cy - r * Math.sin(theta);
      this.angle = (this.from == WEST ? Math.PI * 3 / 2 : Math.PI / 2) - theta;
      break;
    }
    this.element.setStyles({
      left: this.x + 'px',
      top: this.y + 'px',
      '-webkit-transform': 'rotate(' + this.angle + 'rad)',
      '-moz-transform': 'rotate(' + this.angle + 'rad)'
    });
    this.healthBar.setStyles({
      '-webkit-transform': 'rotate(' + -this.angle + 'rad)',
      '-moz-transform': 'rotate(' + -this.angle + 'rad)'
    })
  },
  travel: function(speed) {
    if ((this.distance += speed) > 1.0) {
      if (this.cell.match('.exit-' + NORTH + ',.exit-' + EAST + ',.exit-' + WEST + ',.exit-' + SOUTH)) {
        this.escape();
      } else {
        var nextMove = this.map.nextCell(this.cell, this.route - this.from);
        if (r = this.map.route(nextMove.cell, nextMove.from)) {
          this.cell = nextMove.cell;
          this.from = nextMove.from;
          this.route = r;
        } else {
          this.from = this.route - this.from;
        }
        this.distance -= 1.0;
      }
    }
    
    this.updatePosition();
  },
  applyEffects: function(property, initial) {
    initial = initial || 1.0
    this.effects.each(function(effect) {
      initial = initial * effect.apply(property);
    });
    return initial;
  },
  speed: function() {
    return this.applyEffects('speed', this.options.speed);
  },
  hit: function(damage) {
    this.health = Math.max(this.health - damage, 0)
    this.healthBar.set('html', this.health);
    if (this.health <= 0) {
      this.die();
      return false;
    } else {
      return true;
    }
  },
  die: function() {
    this.map.creeps.erase(this);
    this.element.morph({ opacity:[1.0, 0.0] });
    this._destroy.pass(this.element).delay(1000);
  },
  _destroy: function(element) {
    element.destroy();
  },
  escape: function() {
    this.map.depleteLife(this.health);
    this.die();
  }
});

var Wave = new Class({
  Implements: Options,
  options: {
    count: 10,
    interval: 2000 / TICK,
    creeps: [ Creep ]
  },
  initialize: function(map, options) {
    this.setOptions(options || {});
    this.map = map;
    this.count = 0;
    this.interval = 0;
  },
  start: function() {
    this.map.waves.push(this);
  },
  update: function() {
    if (this.interval <= 0) {
      this.interval = this.options.interval;
      if (!this.spawn()) {
        this.map.waveFinished(this);
      }
    }
    this.interval = this.interval - 1;
  },
  spawn: function() {
    new (this.options.creeps[this.count % this.options.creeps.length])(this.map);
    this.count++;
    return this.count < this.options.count;
  }
});

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
    this.editorTools.getElement('.tool').fireEvent('click');
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

                this.editor.cell(cx, cy).addClass('route-' + (p1 + p2));
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
