class LoaderException(Exception):
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
