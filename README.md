// create class with default constructor

var Parent  = Class(function(){});

// Register class member

Parent.member(function() {

  /*
  
    usable keywords
    
    public
    
    protected
    
    private
    
    static
    
    final
    
   */
   
  this.public.hoge = 1;
  this.protected.static.sHoge = 10;
  this.private.pHoge = 200;
  this.protected.getPHoge = function() {
    return this.pHoge;
  }
});

// create class with constructor
var MyClass = Class(function() {
  console.log(this.hoge); // 1, because Parent.prototype.hoge is public
  //console.log(this.pHoge); // Error! because Parent.prototype.pHoge is private
});

// class exntends
MyClass.extends(Parent);
MyClass.member(function() {
	this.protected.static.mHoge = 60;
});

// can also use the method chain
var SubClass = Class(function() {
  console.log(SubClass.sHoge); // 10, because Parent.sHoge is protected. Subclass is an extension of the Parent
  console.log(this.getPHoge()); // 300 (not 200), because Parent.prototype.getPHoge is overrided by SubClass.prototype.getPHoge
}).extends(MyClass).member(function() {
  // @override
  this.private.pHoge = 300;
  this.public.getPHoge = function() {
    return this.pHoge;
  }
});

var m = new MyClass();
var s = new SubClass();
console.log(m.getPHoge()); // Error! because Parent.prototype.getPHoge is protected
console.log(s.getPHoge()); // 300, because SubClass.prototype.getPHoge is public
console.log(SubClass.sHoge); // Error! because Parent.pHoge is protected
