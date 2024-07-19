FROM python:3.8-slim-buster

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt requirements.txt

# Install dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Copy the .env file
COPY .env .env

# Copy the private key
COPY r-deployment-bot.2024-07-19.private.key /app/private.key

# Expose the port (optional if your Flask app is running on port 5000)
EXPOSE 5000

# Run the webhook handler
CMD ["python", "webhook/webhook_handler.py"]

