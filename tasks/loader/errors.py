class LoaderException(Exception):
    pass


class InvalidEvent(LoaderException):
    """
    An error occurred while parsing the event
    """

    pass


class UnknownService(InvalidEvent):
    """
    The specified service does not exist
    """

    pass


class UnknownAction(InvalidEvent):
    """
    The specified action does not exist on the service
    """

    pass


class InvalidCallback(LoaderException):
    """
    An error occurred while validating the callback
    """

    pass


class InvalidArgument(InvalidCallback):
    """
    The callback arguments are different than expected
    """

    pass


class InvalidReturnType(InvalidCallback):
    """
    The callback return type is different than expected
    """

    pass
