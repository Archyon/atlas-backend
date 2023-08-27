# Use a specific version of Python as the base image
FROM python:3.9-slim-buster

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements.txt file to the container
COPY requirements.txt /app

# install gcc
RUN apt-get update && apt-get install -y gcc

# Install the Python dependencies
RUN pip3 install -r requirements.txt --no-cache-dir

# Copy the remaining backend files to the container
COPY . /app

# Expose the port on which the Django app will run
EXPOSE 8000

# Command to start the Django development server
ENTRYPOINT ["python3"]
CMD ["manage.py", "runserver", "0.0.0.0:8000"]