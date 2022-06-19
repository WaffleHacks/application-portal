def run():
    """
    Start the development server
    """
    import uvicorn

    print("Running operations API development server...")
    uvicorn.run("operations.main:app", host="0.0.0.0", port=8007)
