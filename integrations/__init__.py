def run():
    """
    Start the development server
    """
    import uvicorn

    print("Running workshops API development server...")
    uvicorn.run("integrations.main:app", port=8003)
