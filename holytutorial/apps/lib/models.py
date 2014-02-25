class WallType():
    _FRIEND_CHAT = 1
    _FRIEND_WALL = 2
    _EVENT_WALL = 3
    _VENUE_WALL = 4


class MessageType():
    _FRIEND_REQUEST = 1
    _EVENT_INVITATION = 2
    _EVENT_INFO = 3
    _EVENT_NOTICE = 4
    _EVENT_WARNING = 5
    _FRIEND_CHAT = 6


class RetCode():
    _NOT_LOGIN = -1
    _SUCCESS = 1
    _FAIL = 2
    _SYSTEM_ERROR = 3
    _HAS_MESSAGE = 4
    _INVALID_REQUEST = 5
    _FORM_ERROR = 6
    _OBJECT_ERROR = 7


class ReturnObject():
    def __init__(self, ret_code, message, result):
        self.ret_code = ret_code
        self.message = message
        self.result = result

    def to_json(self):
        if self.result is not None:
            from django.db.models.query import QuerySet
            if isinstance(self.result, (list, tuple, QuerySet)):
                result = []
                for item in self.result:
                    result.append(item.to_json())
            else:
                result = self.result.to_json()
        else:
            result = None

        dict = {'ret_code': self.ret_code, 'message': self.message, 'result': result}
        return dict