def run():
    """
    Start the development server
    """
    import uvicorn

    print("Running workshops API development server...")
    uvicorn.run("workshops.main:app")
