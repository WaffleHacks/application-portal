def run():
    """
    Start the development server
    """
    import uvicorn

    print("Running API development server...")
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000)
