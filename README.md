# LAUX compiler
This is a fork of LAU made by Metamist. A few changes in syntax & stuff have been made, but the code is practically all his.

# What is LAUX?
LAUX is a superset of Lua, adding syntax sugar on top of Lua. It does however still work with vanilla Lua.

# What does it add?

## Functions
LAUX adds fat arrows & thin arrows.

Example of fat arrow
```lua
local Foo = {}
Foo.Bar = (self) => print(self) end -- Foo.Bar = function(self) print(self) end
```
Example of thin arrow doing the same
```lua
local Foo = {}
Foo.Bar = () -> print(self) end -- Foo.Bar = function(self) print(self) end
```
Thin arrow is essentially just a fat arrow, but it automatically adds self, just like : adds self automatically in contrast to . in default Lua.

## Mutations
LAUX adds mutations. Those are just simple shortcuts

```lua
x += 5 -- x = x + 5
x *= 2 -- x = x * 2
x /= 2 -- x = x / 2
x++ -- x = x + 1
x -= 1 -- x = x - 1. Notice x-- doesn't exist
x ||= 2 -- x = x or 2
x ..= "me" -- x = x .. "me"
x %= 2 -- x = x % 2
```

## Shortcut Expressions
LAUX adds shortcuts for quickly doing a generic action.

```lua
stopif i > 5 -- if (i > 5) then return end
breakif i > 2 -- if (i > 2) then break end
continueif i > 8 -- if (i > 8) then continue end
```

## Classes
LAUX adds JavaScript like classes. I assume you already know what a class is.

Syntax
```lua
[public] Class name [extends Parent] end
```
Example
```lua
class Foo
  -- We can have static attributes
  static ENUMS = {}
  -- We can also non static attributes
  name = "Bar"

  constructor(foobar)
    self.foobar = foobar
  end

  setFoobar(val) self.foobar = val end
  getFoobar() return self.foobar end
end

-- Don't need new keyword.
local foo1 = Foo()
```
Now if we wish, we can extend upon it
```lua
class Bar extends Foo
  constructor(foobar)
    -- Because we're extending we need to use super()
    -- You need to pass the arguments your parent (extends) need
    super(foobar)

    -- Lets now get our name we got from Foo
    print(self.name)
  end

  -- Only on Bar, not Foo
  uniqueMethod() end
end
```
Classes by default are private, so we can make it public by using the public keyword
```lua
public class XeninUI.Items.Health extends XeninShop.Item

end
```

## Safe member navigator
LAUX adds a safe member navigatior. This allows you to use index something in a table without having to check if an element exists.

LAUX code
```lua
if (groups?[groupKind]?.members?.name) then

end
```
Lua code
```lua
if (((groups and groups[groupKind]) and groups[groupKind].members) and groups[groupKind].members.name) then 

end
```

## Spread operator
This is the same operator found in JavaScript. It functions like table.concat/unpack.

```lua
local a = { 2, 3 }
local b = { 1, ...a, 4 }
PrintTable(b) -- { 1, 2, 3, 4 }
```

## Deconstructing
Same as in JavaScript.

```lua
local tbl = { a = 5, b = 3 }
local { a, b } = tbl -- local a, b = tbl.a, tbl.b
print(a) -- 5
print(b) -- 3
```

## For of statement
You can do a generic for loop, which is the equivalent of doing 
```lua
for i, v in pairs(tbl) do

end
```
By doing this in LAUX
```lua
for i, v of tbl do

end
```

There is no ipairs equivalent of this.

