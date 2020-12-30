do
  local SecondSkill
  do
    local _class_0
    local _base_0 = {
      __name = "SecondSkill",
      __type = function(self)
        return self.__name
      end
    }
    _base_0.__index = _base_0
    _class_0 = setmetatable({
      __init = function(self) end,
      __base = _base_0
    }, {
      __index = _base_0,
      __call = function(cls, ...)
        local _self_0 = setmetatable({}, _base_0)
        cls.__init(_self_0, ...)
        return _self_0
      end
    })
    SecondSkill = _class_0
  end
end

do
  local TestSkill
  do
    local _class_0
    local _base_0 = {
      __name = "TestSkill",
      sayHi = function(self) end,
      __type = function(self)
        return self.__name
      end
    }
    _base_0.__index = _base_0
    _class_0 = setmetatable({
      __init = function(self) end,
      __base = _base_0
    }, {
      __index = _base_0,
      __call = function(cls, ...)
        local _self_0 = setmetatable({}, _base_0)
        cls.__init(_self_0, ...)
        return _self_0
      end
    })
    TestSkill = _class_0
  end
end
