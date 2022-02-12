def run():
    """
    Start the development server
    """
    import uvicorn

    print("Running communication API development server...")
    uvicorn.run("communication.main:app")
