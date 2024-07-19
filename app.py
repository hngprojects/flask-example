import os
import time
import jwt
import requests
import docker
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from website import create_app

# Load environment variables
load_dotenv()

app = create_app()

try:
    client = docker.from_env()
    client.ping()
    print("Docker connection established successfully.")
except docker.errors.DockerException as e:
    print(f"Error connecting to Docker: {e}")
    client = None  # Ensure the client is None if connection fails

GITHUB_APP_ID = os.getenv('GITHUB_APP_ID')
GITHUB_PRIVATE_KEY = os.getenv('GITHUB_PRIVATE_KEY').replace('\\n', '\n')
GITHUB_WEBHOOK_SECRET = os.getenv('GITHUB_WEBHOOK_SECRET')

def generate_jwt(app_id, private_key):
    payload = {
        'iat': int(time.time()),
        'exp': int(time.time()) + (10 * 60),
        'iss': app_id
    }
    return jwt.encode(payload, private_key, algorithm='RS256')

def get_installation_token(installation_id):
    jwt_token = generate_jwt(GITHUB_APP_ID, GITHUB_PRIVATE_KEY)
    headers = {
        'Authorization': f'Bearer {jwt_token}',
        'Accept': 'application/vnd.github+json'
    }
    url = f'https://api.github.com/app/installations/{installation_id}/access_tokens'
    response = requests.post(url, headers=headers)
    response_data = response.json()
    return response_data['token']

def verify_signature(payload_body, signature):
    import hmac
    import hashlib
    h = hmac.new(GITHUB_WEBHOOK_SECRET.encode(), payload_body, hashlib.sha256)
    return hmac.compare_digest('sha256=' + h.hexdigest(), signature)

def comment_on_pr(repo_name, pr_number, token, message):
    comment_url = f'https://api.github.com/repos/{repo_name}/issues/{pr_number}/comments'
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github+json'
    }
    comment_data = {
        'body': message
    }
    requests.post(comment_url, headers=headers, json=comment_data)

@app.route('/github', methods=['POST'])
def github_webhook():
    event_type = request.headers.get('X-GitHub-Event')
    payload = request.json
    signature = request.headers.get('X-Hub-Signature-256')

    if not verify_signature(request.data, signature):
        return jsonify({'status': 'error', 'message': 'Signature verification failed'}), 403

    if event_type == 'pull_request':
        action = payload.get('action')
        pr_number = payload['number']
        repo_name = payload['repository']['full_name']
        installation_id = payload['installation']['id']

        token = get_installation_token(installation_id)

        branch_name = payload['pull_request']['head']['ref']
        repo_clone_url = payload['pull_request']['head']['repo']['clone_url']
        container_name = f'pr-{pr_number}-{branch_name}'.replace('/', '-')

        if action in ['opened', 'synchronize']:
            if client:
                # Remove existing container if it exists
                try:
                    existing_container = client.containers.get(container_name)
                    existing_container.remove(force=True)
                except docker.errors.NotFound:
                    pass

                # Run a new container
                container = client.containers.run(
                    "your-docker-image",  # Replace with your actual Docker image
                    name=container_name,
                    detach=True,
                    environment={
                        "REPO_URL": repo_clone_url,
                        "BRANCH_NAME": branch_name
                    }
                )

                deployment_url = f"http://your-deployment-url/{container_name}"
                message = f"Deployment started for PR #{pr_number}. You can view it [here]({deployment_url})."
                comment_on_pr(repo_name, pr_number, token, message)
        
        if action == 'closed' and client:
            try:
                container = client.containers.get(container_name)
                container.remove(force=True)
                message = f"Deployment for PR #{pr_number} has been stopped and the container has been removed."
                comment_on_pr(repo_name, pr_number, token, message)
            except docker.errors.NotFound:
                message = f"No active deployment found for PR #{pr_number}."
                comment_on_pr(repo_name, pr_number, token, message)

    return jsonify({'status': 'success'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

