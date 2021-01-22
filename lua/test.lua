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
      local __laux_promise_4 = XeninUI.Promises.new()
      return __laux_promise_4:resolve({
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
  local user

  Users.find(sid64):next(function(__laux_result_1)
    user = __laux_result_1
    return __laux_promise_0:resolve(((user and user.money) ~= nil and (user and user.money) or 0) > amt)
  end, function(__laux_error_2)
    return __laux_promise_0:reject(__laux_error_2)
  end)
  return __laux_promise_0
end
