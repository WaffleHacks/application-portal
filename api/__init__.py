def run():
    """
    Start the development server
    """
    import uvicorn

    print("Running API development server...")
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        ssl_keyfile="ssl/dev.local.key",
        ssl_certfile="ssl/dev.local.crt",
    )
