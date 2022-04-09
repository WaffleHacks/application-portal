def run():
    """
    Start the development server
    """
    import uvicorn

    print("Running communication API development server...")
    uvicorn.run("authentication.main:app", host="0.0.0.0", port=8001)
