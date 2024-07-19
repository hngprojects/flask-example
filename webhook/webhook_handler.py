from flask import Flask, request, jsonify
import subprocess
from github import Github, GithubIntegration
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Environment Variables
app_id = os.getenv('GITHUB_APP_IDENTIFIER')
private_key_path = os.getenv('GITHUB_PRIVATE_KEY_PATH')
webhook_secret = os.getenv('GITHUB_WEBHOOK_SECRET')

# Read private key
with open(private_key_path, 'r') as key_file:
    private_key = key_file.read()

# GitHub Integration
integration = GithubIntegration(app_id, private_key)

def get_installation_token(repository):
    installation = integration.get_installation(repository.owner.login, repository.name)
    access_token = integration.get_access_token(installation.id).token
    return access_token

def post_comment(repository_full_name, pr_number, message):
    access_token = get_installation_token(repository_full_name)
    g = Github(access_token)
    repo = g.get_repo(repository_full_name)
    pr = repo.get_pull(pr_number)
    pr.create_issue_comment(message)

@app.route('/webhook-handler', methods=['POST'])
def webhook_handler():
    data = request.json
    if data['action'] in ['opened', 'synchronize']:
        branch_name = data['pull_request']['head']['ref']
        repo_url = data['repository']['clone_url']
        repository_full_name = data['repository']['full_name']
        pr_number = data['pull_request']['number']
        
        # Run deployment script
        subprocess.run(["./deploy.sh", branch_name, repo_url])
        
        # Post comment on PR
        post_comment(repository_full_name, pr_number, f"Deployment started. Check it [here](http://3.17.148.98:5000).")
    
    elif data['action'] == 'closed':
        branch_name = data['pull_request']['head']['ref']
        repository_full_name = data['repository']['full_name']
        pr_number = data['pull_request']['number']
        
        # Run cleanup script
        subprocess.run(["./cleanup.sh", branch_name])
        
        # Post comment on PR
        post_comment(repository_full_name, pr_number, "Deployment stopped and resources cleaned up.")
    
    return '', 200

@app.route('/')
def home():
    return "Hello, Flask is running!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

