# Use the latest official Python image.
FROM python:latest


# create the working directory
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt /app/

# Install requirements
RUN pip install -r requirements.txt

# Copy all files to the current working directory
COPY . .





# expose port
EXPOSE 5000

# Run the application
CMD ["python3", "main.py"]
