function test(id)
  local __laux_promise_0 = XeninUI.Promises.new()

  local user
  User.find(id):next(function(__laux_result_1)
    user = __laux_result_1

    local onlineUsers
    User.findOnlineUsers():next(function(__laux_result_3)
      onlineUsers = __laux_result_3

      return __laux_promise_0:resolve(user, onlineUsers)
    end, function(__laux_error_4) 
      return __laux_promise_0:reject(__laux_error_4)
    end)
  end, function(__laux_error_2) 
    return __laux_promise_0:reject(__laux_error_2)
  end)

  return __laux_promise_0
end
