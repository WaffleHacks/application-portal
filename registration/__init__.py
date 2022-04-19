def run():
    """
    Start the development server
    """
    import uvicorn

    print("Running registration API development server...")
    uvicorn.run("registration.main:app", host="0.0.0.0", port=8004)
