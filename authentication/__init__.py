def run():
    """
    Start the development server
    """
    import uvicorn

    print("Running communication API development server...")
    uvicorn.run("authentication.main:app", port=8001)
