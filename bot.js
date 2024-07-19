const { exec } = require('child_process');

     module.exports = (app) => {
       app.on('pull_request', async (context) => {
         const { action, pull_request } = context.payload;
         const branchName = pull_request.head.ref;
         const repoName = context.payload.repository.name;
         const repoOwner = context.payload.repository.owner.login;
         const sha = pull_request.head.sha;

         if (action === 'opened' || action === 'synchronize') {
           const comment = context.issue({ body: `Deployment in progress for PR #${pull_request.number}` });
           await context.octokit.issues.createComment(comment);

           // Build and run Docker container
           exec(`./deploy.sh ${branchName} ${pull_request.number}`, async (error, stdout, stderr) => {
             if (error) {
               console.error(`Error building/running Docker container: ${stderr}`);
               const comment = context.issue({ body: `Error building/running Docker container for PR #${pull_request.number}: ${stderr}` });
               await context.octokit.issues.createComment(comment);
               return;
             }

             const publicIP = process.env.EC2_PUBLIC_IP;
             const url = `http://${publicIP}:8080`;

             const comment = context.issue({ body: `Deployment successful! Access the deployed environment [here](${url}).` });
             await context.octokit.issues.createComment(comment);
           });
         }

         if (action === 'closed') {
           exec(`./cleanup.sh ${pull_request.number}`, async (error, stdout, stderr) => {
             if (error) {
               console.error(`Error stopping/removing Docker container: ${stderr}`);
               const comment = context.issue({ body: `Error cleaning up Docker container for PR #${pull_request.number}: ${stderr}` });
               await context.octokit.issues.createComment(comment);
               return;
             }

             const comment = context.issue({ body: `PR #${pull_request.number} closed. Cleaned up resources.` });
             await context.octokit.issues.createComment(comment);
           });
         }
       });
     };
