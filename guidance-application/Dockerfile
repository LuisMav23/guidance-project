FROM python:3.11

# Set working directory inside the container
WORKDIR /app

# Copy dependency descriptor and install dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project directory into the container after dependencies are installed
COPY . /app

# Define /app as a volume so that any saved files are persisted on the host
VOLUME ["/app"]

# Expose port 5000 (default port for Flask)
EXPOSE 5000

# Set environment variable to designate the Flask application entrypoint (adjust "app.py" as needed)
ENV FLASK_APP=app.py

# Run the Flask app, binding to all interfaces
CMD ["flask", "run", "--host=0.0.0.0"]