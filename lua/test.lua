local Users
do
  local _class_0
  local _base_0 = {
    __name = "Users",
    __type = function(self)
      return self.__name
    end
  }
  _base_0.__index = _base_0
  _class_0 = setmetatable({
    __init = function(self) end,
    __base = _base_0,
    find = function(id)
      local __laux_promise_5 = XeninUI.Promises.new()
      return __laux_promise_5:resolve({
      money = 500 })
    end
  }, {
    __index = _base_0,
    __call = function(cls, ...)
      local _self_0 = setmetatable({}, _base_0)
      cls.__init(_self_0, ...)
      return _self_0
    end
  })
  Users = _class_0
end

function hasMoney(sid64, amt)
  local __laux_promise_0 = XeninUI.Promises.new()
  local __lauxi1
  Users.find(sid64):next(function(__laux_result_2)
    __lauxi1 = __laux_result_2
    assert(__lauxi1 ~= nil, "cannot destructure nil value")
    local money = __lauxi1.money
    return __laux_promise_0:resolve((money || 0) > amt)
  end, function(__laux_error_3)
    return __laux_promise_0:reject(__laux_error_3)
  end)
  return __laux_promise_0
end
